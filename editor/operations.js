import {assetNode,migrateDocument,serializeDocument,validateDocument} from '../core.js';
import {connectNodes,removeNodes} from './connections.js';
import {finalizeEdit} from './edits.js';
import {validateRevision} from './revisions.js';

const editable=new Set(['label','x','y','w','h','rotation','color','fontSize','wrap','group','parameters','recolored','edgeStyle','entityId','relationshipId','panelId']);
const semanticTypes=new Set(['set_source','set_compartment','set_entity','connect_entities','set_constraint','remove_semantic_record']);
const collections={set_source:'sources',set_compartment:'compartments',set_entity:'entities',connect_entities:'relationships',set_constraint:'constraints'};
const id=value=>typeof value==='string'&&value.length>0&&value.length<=200;
function record(value) {
  if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Expected an operation object.');
}
function keys(value,allowed) {
  record(value);
  if(Object.keys(value).some(key=>!allowed.includes(key)))throw Error('Unsupported operation field.');
}
function requireId(value) {if(!id(value))throw Error('Invalid operation object ID.');}

export class DocumentConflictError extends Error {
  constructor(){super('This figure changed after the draft was prepared. Prepare a new draft against the current figure.');this.name='DocumentConflictError';}
}

// The caller supplies policy separately from the patch. A generated patch cannot
// grant itself access to objects outside the user's selection or remove locks.
export function applyDocumentPatch(document,patch,{scopeNodeIds,lockedNodeIds=[],scopeEntityIds,lockedEntityIds=[]}={}) {
  serializeDocument(document,true);
  validateRevision(document);
  keys(patch,['documentId','baseRevision','operations']);
  if(!document.documentId||!document.revision||patch.documentId!==document.documentId||patch.baseRevision!==document.revision)throw new DocumentConflictError();
  if(!Array.isArray(patch.operations)||patch.operations.length>500)throw Error('A patch must contain at most 500 operations.');
  const existing=new Set(document.nodes.map(n=>n.id));
  for(const ids of [scopeNodeIds,lockedNodeIds])if(ids!==undefined&&(!Array.isArray(ids)||ids.some(value=>!existing.has(value))||new Set(ids).size!==ids.length))throw Error('Invalid patch selection or locks.');
  const scope=scopeNodeIds===undefined?null:new Set(scopeNodeIds),locked=new Set(lockedNodeIds);
  const existingEntities=new Set((document.semantic?.entities||[]).map(item=>item.id));
  for(const ids of [scopeEntityIds,lockedEntityIds])if(ids!==undefined&&(!Array.isArray(ids)||ids.some(value=>!existingEntities.has(value))||new Set(ids).size!==ids.length))throw Error('Invalid entity selection or locks.');
  const entityScope=scopeEntityIds===undefined?null:new Set(scopeEntityIds),entityLocks=new Set(lockedEntityIds);
  const next=patch.operations.some(operation=>semanticTypes.has(operation?.type)||operation?.type==='update_node'&&['entityId','relationshipId','panelId'].some(key=>Object.hasOwn(operation.changes||{},key)))?migrateDocument(document):structuredClone(document),usedIds=new Set(existing);
  const requireNode=value=>{requireId(value);const node=next.nodes.find(n=>n.id===value);if(!node)throw Error('Operation references an unavailable object.');return node;};
  const writable=value=>{
    requireNode(value);
    if(locked.has(value))throw Error('The patch would change a locked object.');
    if(scope&&!scope.has(value))throw Error('The patch would change an object outside the selection.');
  };
  const insert=node=>{
    requireId(node.id);
    if(usedIds.has(node.id))throw Error('Duplicate operation object ID.');
    if(node.fromNodeId!==undefined||node.toNodeId!==undefined){writable(node.fromNodeId);writable(node.toNodeId);}
    usedIds.add(node.id);next.nodes.push(node);scope?.add(node.id);
  };
  const writableEntity=value=>{
    requireId(value);
    if(!next.semantic.entities.some(item=>item.id===value))throw Error('Unknown semantic entity.');
    if(entityLocks.has(value))throw Error('The patch would change a locked entity.');
    if(entityScope&&!entityScope.has(value))throw Error('The patch would change an entity outside the selection.');
  };
  const sourceUsers=value=>{
    for(const item of next.semantic.entities)if(item.sourceIds?.includes(value))writableEntity(item.id);
    for(const item of next.semantic.relationships)if(item.sourceIds?.includes(value)){writableEntity(item.fromEntityId);writableEntity(item.toEntityId);}
  };
  const compartmentUsers=value=>{
    const parents=new Map(next.semantic.compartments.map(item=>[item.id,item.parentId]));
    for(const item of next.semantic.entities){
      const seen=new Set();let parent=item.compartmentId;
      while(parent&&!seen.has(parent)){if(parent===value){writableEntity(item.id);break;}seen.add(parent);parent=parents.get(parent);}
    }
  };
  const upsert=(collection,item)=>{
    record(item);requireId(item.id);
    const records=next.semantic[collection],index=records.findIndex(record=>record.id===item.id);
    if(index>=0){
      if(collection==='entities')writableEntity(item.id);
      if(collection==='relationships'){const old=records[index];writableEntity(old.fromEntityId);writableEntity(old.toEntityId);}
      if(collection==='constraints')records[index].nodeIds.forEach(writable);
      if(collection==='sources')sourceUsers(item.id);
      if(collection==='compartments')compartmentUsers(item.id);
      records[index]=structuredClone(item);
    }else{records.push(structuredClone(item));if(collection==='entities')entityScope?.add(item.id);}
    if(collection==='relationships'){writableEntity(item.fromEntityId);writableEntity(item.toEntityId);}
    if(collection==='constraints')item.nodeIds?.forEach(writable);
  };
  for(const operation of patch.operations){
    record(operation);
    switch(operation.type){
      case 'insert_asset': {
        keys(operation,['type','id','assetId','x','y','w']);
        requireId(operation.id);
        insert({...assetNode(operation.assetId,operation.x,operation.y,operation.w),id:operation.id});
        break;
      }
      case 'insert_node':
        keys(operation,['type','node']);record(operation.node);insert(structuredClone(operation.node));break;
      case 'update_node': {
        keys(operation,['type','id','changes']);writable(operation.id);record(operation.changes);
        if(Object.keys(operation.changes).some(key=>!editable.has(key)))throw Error('This object field cannot be patched.');
        const target=requireNode(operation.id);
        for(const [key,value] of Object.entries(operation.changes)){
          if(['entityId','relationshipId','panelId'].includes(key)&&value===null)delete target[key];
          else target[key]=structuredClone(value);
        }
        break;
      }
      case 'remove_nodes': {
        keys(operation,['type','ids']);
        if(!Array.isArray(operation.ids)||!operation.ids.length)throw Error('Choose objects to remove.');
        operation.ids.forEach(writable);
        const ids=new Set(operation.ids);
        const removed=new Set([...ids,...next.nodes.filter(n=>ids.has(n.fromNodeId)||ids.has(n.toNodeId)).map(n=>n.id)]);
        for(const id of removed)writable(id);
        if(next.semantic)next.semantic.constraints.filter(item=>item.nodeIds.some(id=>removed.has(id))).forEach(item=>item.nodeIds.forEach(writable));
        removeNodes(next,ids);
        if(next.semantic)next.semantic.constraints=next.semantic.constraints.filter(item=>!item.nodeIds.some(id=>removed.has(id)));
        break;
      }
      case 'connect_nodes': {
        keys(operation,['type','id','fromNodeId','toNodeId','style']);
        writable(operation.fromNodeId);writable(operation.toNodeId);
        insert({...connectNodes(requireNode(operation.fromNodeId),requireNode(operation.toNodeId),operation.style),id:operation.id});break;
      }
      case 'set_source':
      case 'set_compartment':
      case 'set_entity':
      case 'set_constraint':
      case 'connect_entities':
        keys(operation,['type','record']);upsert(collections[operation.type],operation.record);break;
      case 'remove_semantic_record': {
        keys(operation,['type','collection','id']);requireId(operation.id);
        if(!['sources','compartments','entities','relationships','constraints'].includes(operation.collection))throw Error('Unknown semantic collection.');
        const records=next.semantic[operation.collection],index=records.findIndex(item=>item.id===operation.id);
        if(index<0)throw Error('Unknown semantic record.');
        if(operation.collection==='entities')writableEntity(operation.id);
        if(operation.collection==='relationships'){writableEntity(records[index].fromEntityId);writableEntity(records[index].toEntityId);}
        if(operation.collection==='constraints')records[index].nodeIds.forEach(writable);
        if(operation.collection==='sources')sourceUsers(operation.id);
        if(operation.collection==='compartments')compartmentUsers(operation.id);
        records.splice(index,1);break;
      }
      default: throw Error('Unsupported document operation.');
    }
  }
  finalizeEdit(document,next);
  // Synchronizing a moved endpoint can also change an existing connector. Check
  // derived changes too, so locks and boundaries hold for the complete result.
  const after=new Map(next.nodes.map(n=>[n.id,JSON.stringify(n)]));
  for(const node of document.nodes)if(after.get(node.id)!==JSON.stringify(node)&&(locked.has(node.id)||(scope&&!scope.has(node.id))))throw Error('The patch would change a locked object or an object outside the selection.');
  validateDocument(next);
  return next;
}

export function createDocumentPatch(document,operations) {
  validateRevision(document);
  if(!document.documentId||!document.revision)throw Error('Identify the document before preparing a patch.');
  return {documentId:document.documentId,baseRevision:document.revision,operations:structuredClone(operations)};
}

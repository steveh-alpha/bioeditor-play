// Schema 0.2 adds biological meaning beside the existing visual scene. The
// schema uses a small JSON Schema vocabulary that this browser module validates
// directly; graph references and constraint records are checked below.
const id={type:'string',minLength:1,maxLength:200,pattern:'^[A-Za-z0-9_-]+$'};
const nodeId={type:'string',minLength:1,maxLength:200};
const name={type:'string',minLength:1,maxLength:300};
const ids={type:'array',items:id,maxItems:200,uniqueItems:true};
const record=(required,properties)=>({type:'object',required,properties,additionalProperties:false});
const source=record(['id','citation'],{id,citation:{type:'string',minLength:1,maxLength:3000},url:{type:'string',maxLength:2000,pattern:'^https?://'}});
const compartment=record(['id','name'],{id,name,parentId:id,sourceIds:ids});
const entity=record(['id','name','kind'],{id,name,kind:name,compartmentId:id,sourceIds:ids});
const relationship=record(['id','fromEntityId','toEntityId','kind'],{id,fromEntityId:id,toEntityId:id,kind:{enum:['activation','inhibition','binding','transport','association','other']},sourceIds:ids});
const constraint=record(['id','type','nodeIds'],{id,type:{enum:['inside','align_x','align_y','fixed']},nodeIds:{type:'array',items:nodeId,minItems:1,maxItems:2,uniqueItems:true},tolerance:{type:'number',minimum:0,maximum:100},x:{type:'number',minimum:-100000,maximum:100000},y:{type:'number',minimum:-100000,maximum:100000}});
export const SEMANTIC_DOCUMENT_SCHEMA={
  $schema:'https://json-schema.org/draft/2020-12/schema',
  title:'BioEditor semantic document 0.2',
  type:'object',
  required:['schemaVersion','nodes','semantic'],
  properties:{
    schemaVersion:{const:'0.2'},
    nodes:{type:'array',maxItems:1500,items:{type:'object',required:['id'],properties:{id:nodeId,entityId:id,relationshipId:id,panelId:nodeId},additionalProperties:true}},
    semantic:record(['entities','relationships','compartments','sources','constraints'],{
      entities:{type:'array',maxItems:500,items:entity},
      relationships:{type:'array',maxItems:1000,items:relationship},
      compartments:{type:'array',maxItems:200,items:compartment},
      sources:{type:'array',maxItems:500,items:source},
      constraints:{type:'array',maxItems:500,items:constraint}
    })
  },
  additionalProperties:true
};

function validateShape(schema,value,path='document') {
  if(schema.const!==undefined&&value!==schema.const)throw Error(`Invalid ${path}.`);
  if(schema.enum&&!schema.enum.includes(value))throw Error(`Invalid ${path}.`);
  if(schema.type==='object'){
    if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error(`Invalid ${path}.`);
    for(const key of schema.required||[])if(!Object.hasOwn(value,key))throw Error(`Missing ${path}.${key}.`);
    for(const [key,item] of Object.entries(value)){
      const field=schema.properties?.[key];
      if(!field){if(schema.additionalProperties===false)throw Error(`Unsupported ${path}.${key}.`);continue;}
      validateShape(field,item,`${path}.${key}`);
    }
  }else if(schema.type==='array'){
    if(!Array.isArray(value)||value.length<(schema.minItems||0)||value.length>(schema.maxItems??Infinity))throw Error(`Invalid ${path}.`);
    if(schema.uniqueItems&&new Set(value.map(item=>JSON.stringify(item))).size!==value.length)throw Error(`Duplicate ${path}.`);
    value.forEach((item,index)=>validateShape(schema.items,item,`${path}[${index}]`));
  }else if(schema.type==='string'){
    if(typeof value!=='string'||value.length<(schema.minLength||0)||value.length>(schema.maxLength??Infinity)||(schema.pattern&&!new RegExp(schema.pattern).test(value)))throw Error(`Invalid ${path}.`);
  }else if(schema.type==='number'){
    if(!Number.isFinite(value)||value<(schema.minimum??-Infinity)||value>(schema.maximum??Infinity))throw Error(`Invalid ${path}.`);
  }
}

const emptySemantic=()=>({entities:[],relationships:[],compartments:[],sources:[],constraints:[]});
export function migrateDocument(document) {
  if(document?.schemaVersion==='0.2'){validateSemanticDocument(document);return structuredClone(document);}
  if(document?.schemaVersion!=='0.1')throw Error('No migration exists for this figure version.');
  const next={...structuredClone(document),schemaVersion:'0.2',semantic:emptySemantic()};
  validateSemanticDocument(next);
  return next;
}

const unique=(records,label)=>{
  const values=records.map(record=>record.id);
  if(new Set(values).size!==values.length)throw Error(`Duplicate semantic ${label} ID.`);
  return new Set(values);
};
const referenced=(values,known,label)=>{
  for(const value of values||[])if(!known.has(value))throw Error(`Unknown semantic ${label} reference.`);
};
export function validateSemanticDocument(document) {
  if(document?.schemaVersion==='0.1'){
    if(document.semantic!==undefined||document.nodes?.some(node=>node.entityId!==undefined||node.relationshipId!==undefined||node.panelId!==undefined))throw Error('Semantic links require document schema 0.2.');
    return document;
  }
  validateShape(SEMANTIC_DOCUMENT_SCHEMA,document);
  const {entities,relationships,compartments,sources,constraints}=document.semantic;
  const entityIds=unique(entities,'entity'),relationshipIds=unique(relationships,'relationship'),compartmentIds=unique(compartments,'compartment'),sourceIds=unique(sources,'source'),constraintIds=unique(constraints,'constraint');
  void constraintIds;
  for(const item of entities){if(item.compartmentId&&!compartmentIds.has(item.compartmentId))throw Error('Unknown entity compartment.');referenced(item.sourceIds,sourceIds,'source');}
  for(const item of relationships){
    if(!entityIds.has(item.fromEntityId)||!entityIds.has(item.toEntityId))throw Error('Unknown relationship endpoint.');
    referenced(item.sourceIds,sourceIds,'source');
  }
  const parents=new Map(compartments.map(item=>[item.id,item.parentId]));
  for(const item of compartments){
    referenced(item.sourceIds,sourceIds,'source');
    const seen=new Set([item.id]);let parent=item.parentId;
    while(parent){if(!compartmentIds.has(parent)||seen.has(parent))throw Error('Invalid compartment hierarchy.');seen.add(parent);parent=parents.get(parent);}
  }
  const nodes=new Map(document.nodes.map(node=>[node.id,node]));
  const relationshipById=new Map(relationships.map(item=>[item.id,item]));
  for(const node of document.nodes){
    if(node.entityId&&!entityIds.has(node.entityId))throw Error('Unknown visual entity.');
    if(node.relationshipId&&(!relationshipIds.has(node.relationshipId)||node.type!=='arrow'))throw Error('Invalid visual relationship.');
    if(node.panelId&&(!nodes.has(node.panelId)||nodes.get(node.panelId).type!=='panel'||node.panelId===node.id))throw Error('Invalid visual panel.');
    if(node.relationshipId&&node.fromNodeId&&node.toNodeId){
      const meaning=relationshipById.get(node.relationshipId),from=nodes.get(node.fromNodeId),to=nodes.get(node.toNodeId);
      if(from.entityId&&from.entityId!==meaning.fromEntityId||to.entityId&&to.entityId!==meaning.toEntityId)throw Error('Visual relationship endpoints disagree with the biological graph.');
    }
  }
  for(const item of constraints){
    referenced(item.nodeIds,new Set(nodes.keys()),'object');
    if(item.type==='fixed'){
      if(item.nodeIds.length!==1||item.x===undefined||item.y===undefined)throw Error('Invalid fixed-position constraint.');
    }else{
      if(item.nodeIds.length!==2||item.x!==undefined||item.y!==undefined)throw Error('Invalid two-object constraint.');
      if(item.type==='inside'&&nodes.get(item.nodeIds[1]).type!=='panel')throw Error('Containment requires a panel.');
    }
  }
  return document;
}

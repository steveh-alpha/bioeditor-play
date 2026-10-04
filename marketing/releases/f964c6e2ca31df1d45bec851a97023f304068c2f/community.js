import {validateDocument,serializeDocument,manifest,TEMPLATES} from './core.js';
import {selectionFragment} from './editor/clipboard.js';
import {objectBounds,templateReferences} from './studio.js';

const text=(value,max,label)=>{if(typeof value!=='string'||!value.trim()||value.length>max)throw Error(`Enter ${label} (up to ${max} characters).`);return value.trim();};
const fields=['type','label','x','y','w','h','color','rotation'];
const typeFields={asset:['assetId','artworkVersion','parameters'],part:['assetId','artworkVersion','parameters','partIndex','partBox','partAspect','recolored'],text:['fontSize','wrap'],arrow:['edgeStyle'],panel:[]};
export function communityReferences(...documents){return [...new Map(documents.flatMap(doc=>doc.communitySources||[]).map(ref=>[`${ref.id}@${ref.version}`,Object.fromEntries(['id','name','creator','source','version','modifications','license','licenseUrl'].map(key=>[key,ref[key]]))])).values()];}

// Public packages contain a reviewed visual snapshot, never prompt/history/key or
// arbitrary document metadata. Selection uses the same snapshot as its preview.
export function prepareContribution(document,metadata,selectedIds) {
  validateDocument(document);
  const source=selectedIds?selectionFragment(document,new Set(selectedIds)):document;
  if(!source.nodes.length||source.nodes.length>300)throw Error('Publish between 1 and 300 objects.');
  const ids=new Map(source.nodes.map((node,index)=>[node.id,`object-${index+1}`])),groups=new Map();
  const nodes=source.nodes.map(node=>{
    const clean=Object.fromEntries([...fields,...typeFields[node.type]].filter(key=>Object.hasOwn(node,key)).map(key=>[key,structuredClone(node[key])]));
    clean.id=ids.get(node.id);
    if(node.group){if(!groups.has(node.group))groups.set(node.group,`group-${groups.size+1}`);clean.group=groups.get(node.group);}
    if(node.fromNodeId){clean.fromNodeId=ids.get(node.fromNodeId);clean.toNodeId=ids.get(node.toNodeId);}
    return clean;
  });
  const bounds=nodes.map(objectBounds),minX=Math.min(...bounds.map(b=>b.x)),minY=Math.min(...bounds.map(b=>b.y));
  const width=Math.ceil(Math.max(...bounds.map(b=>b.x+b.w))-minX+80),height=Math.ceil(Math.max(...bounds.map(b=>b.y+b.h))-minY+80);
  nodes.forEach(node=>{node.x+=40-minX;node.y+=40-minY;});
  const title=text(metadata.title,150,'a title'),description=text(metadata.description,2000,'a description'),creator=text(metadata.creator,120,'a public creator name');
  if(!['element','composition','diagram'].includes(metadata.kind)||metadata.license!=='CC-BY-4.0')throw Error('Choose a supported contribution type and reuse license.');
  const sourceTemplates=templateReferences(document).filter(ref=>TEMPLATES.some(t=>t.id===ref.id&&t.id!=='blank'&&(ref.version===undefined||t.version===ref.version))).map(ref=>({id:ref.id,...(ref.version!==undefined?{version:ref.version}:{})}));
  const aiAssisted=!!document.aiProvenance?.length||document.aiAssisted===true;
  const doc={schemaVersion:'0.1',title,width:Math.max(100,width),height:Math.max(100,height),background:document.background||'#ffffff',nodes,sourceTemplates,claims:[],aiProvenance:[],aiAssisted,communitySources:communityReferences(document)};
  serializeDocument(doc,true);
  if(JSON.stringify(doc).length>500000)throw Error('This contribution is too large. Publish a smaller selection.');
  return {title,description,creator,kind:metadata.kind,license:metadata.license,document:doc,assetManifest:manifest(doc),aiAssisted};
}

export function remixContribution(publication) {
  if(!publication||!publication.id||publication.status!=='published')throw Error('This contribution is not published.');
  const clean=prepareContribution(publication.document,publication);
  clean.document.aiAssisted=clean.aiAssisted||publication.aiAssisted===true;
  clean.document.communitySources=communityReferences(clean.document,{communitySources:[{id:publication.id,name:publication.title,creator:publication.creator,license:publication.license,version:'1',source:`BioEditor community contribution ${publication.id}`,licenseUrl:'https://creativecommons.org/licenses/by/4.0/',modifications:'Reused and possibly modified.'}]});
  serializeDocument(clean.document,true);return clean.document;
}

import {VIRUSES_TEMPLATES,makeVirusTemplate} from './templates/viruses.js';
import {virusParts} from './assets/viruses.js';
import {THERAPEUTICS_TEMPLATES,makeTherapeuticTemplate} from './templates/therapeutics.js';
import {therapeuticParts} from './assets/therapeutics.js';
import {ANTIBODY_TEMPLATES,makeAntibodyTemplate} from './templates/antibodies.js';
import {DIAGRAM_TEMPLATES,composeDiagram} from './templates/diagrams.js';
import {synchronizeConnections,validateConnections} from './editor/connections.js';
import {structureParameters} from './assets/structures.js';
import {templateReferences,dimensions,validateStudioFields,applyStyle} from './studio.js';
import {ASSETS,COLORS,glyph,assetRecord,ILLUSTRATION_VERSION,isLatestArtwork,isTechnicalArtwork} from './assets/library.js';
import {escapeXML,wrapLabel} from './svg.js';
export {ASSETS,COLORS,glyph,assetRecord,ILLUSTRATION_VERSION,isLatestArtwork,escapeXML};
export const uid=()=>globalThis.crypto.randomUUID();
export const normalizeAngle=angle=>((angle%360)+360)%360;
export function selectionCenter(nodes){
 const corners=nodes.flatMap(n=>{const a=(n.rotation||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),cx=n.x+n.w/2,cy=n.y+n.h/2;return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>({x:cx+x*n.w/2*c-y*n.h/2*s,y:cy+x*n.w/2*s+y*n.h/2*c}));});
 return {x:(Math.min(...corners.map(p=>p.x))+Math.max(...corners.map(p=>p.x)))/2,y:(Math.min(...corners.map(p=>p.y))+Math.max(...corners.map(p=>p.y)))/2};
}
export function rotateNodes(nodes,delta,pivot=selectionCenter(nodes)){
 const a=delta*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 for(const n of nodes){const dx=n.x+n.w/2-pivot.x,dy=n.y+n.h/2-pivot.y;n.x=pivot.x+dx*c-dy*s-n.w/2;n.y=pivot.y+dx*s+dy*c-n.h/2;n.rotation=normalizeAngle((n.rotation||0)+delta);}
}
// Extract editable leaves only from our trusted component definitions. Documents
// store a part index, never arbitrary SVG or executable markup.
export function componentParts(kind,color,parameters,aspect=1,version,recolored=false){
 const virusModules=virusParts(kind,color,version);
 if(virusModules)return virusModules;
 const modules=therapeuticParts(kind,color,version,recolored);
 if(modules)return modules;
 const stack=[],parts=[];
 for(const token of glyph(kind,color,parameters,aspect,version).match(/<[^>]+>/g)||[]){
  if(token.startsWith('</g'))stack.pop();
  else if(/^<g[ >]/.test(token))stack.push(token);
  else if(/^<(path|circle|ellipse|rect|line|polyline|polygon)\b/.test(token))parts.push({shape:token.match(/^<(\w+)/)[1],svg:stack.join('')+token+'</g>'.repeat(stack.length)});
 }
 return parts;
}
export function assetNode(id,x,y,w=150){const a=ASSETS.find(a=>a.id===id);if(!a)throw Error('Unknown component');return {id:uid(),type:'asset',assetId:id,artworkVersion:a.version,x,y,w:a.parametric&&w===150?420:w,h:a.parametric?(w===150?140:w/3):w,color:a.color,label:a.name,...(a.parametric?{parameters:structureParameters(a.kind)}:{})};}
export const textNode=(label,x,y,size=23)=>({id:uid(),type:'text',label,x,y,w:300,h:size*1.6,color:'#294845',fontSize:size});
export const arrowNode=(x,y,w=100)=>({id:uid(),type:'arrow',label:'Process arrow',x,y,w,h:20,color:'#90a7a3'});
export const panelNode=(x,y,w=330,h=450,color='#f1f7f4')=>({id:uid(),type:'panel',label:'Panel',x,y,w,h,color});
export const TEMPLATES=[
 {id:'engineering',name:'Engineering T cells',description:'Isolation → editing → expansion',assets:['cd8','cas9','dish'],labels:['Isolate T cells','Engineer with CRISPR','Expand & characterize'],subtitle:'A cell-engineering workflow'},
 {id:'cart',name:'CAR-T workflow',description:'Collection → engineering → tumor recognition',assets:['tube','receptor','tumor'],labels:['Collect immune cells','Introduce CAR construct','Evaluate tumor recognition'],subtitle:'From cell collection to functional assessment'},
 {id:'knockout',name:'CRISPR knockout',description:'Target → delivery → validation',assets:['gene','electro','assay'],labels:['Select target locus','Deliver editing complex','Measure editing outcome'],subtitle:'Design, perturb, and validate'},
 {id:'immune',name:'Immune interaction',description:'Antigen → activation → response',assets:['antigen','cd8','cytokine'],labels:['Present antigen','Assess T-cell activation','Measure response'],subtitle:'An editable mechanism scaffold'},
 {id:'study',name:'Study overview',description:'Sample → intervention → readout',assets:['tube','flask','assay'],labels:['Collect samples','Apply intervention','Analyze results'],subtitle:'A three-panel graphical abstract'},
 {id:'blank',name:'Blank canvas',description:'Start a figure from scratch',assets:[],labels:[],subtitle:''}
].map(t=>({...t,category:t.id==='blank'?'Blank':'Immunology',version:'0.1.0'})).concat(DIAGRAM_TEMPLATES,ANTIBODY_TEMPLATES,THERAPEUTICS_TEMPLATES,VIRUSES_TEMPLATES);
export function makeTemplate(id){if(VIRUSES_TEMPLATES.some(t=>t.id===id))return makeVirusTemplate(id);if(THERAPEUTICS_TEMPLATES.some(t=>t.id===id))return makeTherapeuticTemplate(id);if(ANTIBODY_TEMPLATES.some(t=>t.id===id))return makeAntibodyTemplate(id);const t=TEMPLATES.find(t=>t.id===id);if(!t)throw Error('Unknown template');if(t.layout)return composeDiagram({title:t.name,layout:t.layout,steps:t.assets.map((assetId,i)=>({assetId,label:t.labels[i]})),templateId:id,templateVersion:t.version});const nodes=[];if(id!=='blank'){nodes.push(textNode(t.name,68,65,34),textNode(t.subtitle,70,118,18));for(let i=0;i<3;i++){const x=65+i*365;nodes.push(panelNode(x,190,340,465,['#f0f7f3','#f1f5fa','#f9f3ee'][i]));nodes.push(textNode(`0${i+1}`,x+25,212,14));nodes.push(assetNode(t.assets[i],x+76,270,190));nodes.push(textNode(t.labels[i],x+27,492,22));nodes.push(textNode(['Define cell type and source','Specify target and conditions','Add your measured outcome'][i],x+27,535,14));if(i<2)nodes.push(arrowNode(x+310,360,70));}nodes.push(textNode('SCHEMATIC WORKFLOW • REPLACE EXAMPLE LABELS WITH YOUR STUDY DETAILS',68,708,12));}return applyStyle({schemaVersion:'0.1',title:t.name,width:1200,height:760,nodes,claims:[],aiProvenance:[],templateId:id},'fieldnotes');}
export const MAX_DOCUMENT_BYTES=10_000_000;
export function validateDocument(d) {
 if(!d||typeof d!=='object'||Array.isArray(d)||d.schemaVersion!=='0.1'||typeof d.title!=='string'||d.title.length>3000||!Array.isArray(d.nodes)||d.nodes.length>1500) throw Error('This is not a supported BioEditor document (maximum 1,500 objects).');
 validateStudioFields(d);
 const ids=new Set(),partCounts=new Map();
 for(const n of d.nodes) {
  if(!n||!['asset','part','text','arrow','panel'].includes(n.type)||typeof n.id!=='string'||!n.id||n.id.length>200||ids.has(n.id)||typeof n.label!=='string'||n.label.length>3000) throw Error('Invalid figure object.');
  ids.add(n.id);
  if(n.group!==undefined&&(typeof n.group!=='string'||!n.group||n.group.length>200)) throw Error('Invalid object group.');
  if(n.rotation!==undefined&&(!Number.isFinite(n.rotation)||Math.abs(n.rotation)>360000)) throw Error('Invalid rotation.');
  for(const p of ['x','y','w','h']) if(!Number.isFinite(n[p])||Math.abs(n[p])>100000) throw Error('Invalid object dimensions.');
  if(n.w<1||n.h<1||typeof n.color!=='string'||!/^#[0-9a-f]{6}$/i.test(n.color)) throw Error('Invalid size or color.');
  if(n.type==='asset'||n.type==='part') {
   if(!ASSETS.some(a=>a.id===n.assetId)) throw Error('Document contains an unavailable component.');
   const a=assetRecord(n.assetId,n.artworkVersion);
   structureParameters(a.kind,n.parameters);
   if(n.partAspect!==undefined&&(!Number.isFinite(n.partAspect)||n.partAspect<=0||n.partAspect>100000)) throw Error('Invalid component aspect ratio.');
   if(n.type==='part') {
    const key=JSON.stringify([a.kind,n.parameters,n.partAspect,n.artworkVersion]);
    if(!partCounts.has(key)) partCounts.set(key,componentParts(a.kind,n.color,n.parameters,n.partAspect??1,n.artworkVersion).length);
    if(!Number.isInteger(n.partIndex)||n.partIndex<0||n.partIndex>=partCounts.get(key)||!Array.isArray(n.partBox)||n.partBox.length!==4||!n.partBox.every(v=>Number.isFinite(v)&&Math.abs(v)<1000)||n.partBox[2]<=0||n.partBox[3]<=0) throw Error('Invalid component part.');
   }
  }
  if(n.recolored!==undefined&&typeof n.recolored!=='boolean') throw Error('Invalid recoloring flag.');
  if(n.wrap!==undefined&&typeof n.wrap!=='boolean') throw Error('Invalid text wrapping.');
  if(n.type==='text'&&(!Number.isFinite(n.fontSize)||n.fontSize<6||n.fontSize>300)) throw Error('Text size must be between 6 and 300 px. Use a larger artboard or keep artwork sizes.');
 }
 validateConnections(d);
 return d;
}
export function parseDocument(raw) {
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_DOCUMENT_BYTES) throw Error('Choose a figure smaller than 10 MB.');
 let parsed;
 try {parsed=JSON.parse(raw);} catch {throw Error('This file is not valid JSON. Choose a saved BioEditor figure.');}
 return validateDocument(parsed);
}
export function serializeDocument(d,portable=false) {
 validateDocument(d);
 const raw=JSON.stringify(portable?{...d,assetManifest:manifest(d)}:d,null,portable?2:undefined);
 if(new TextEncoder().encode(raw).length>MAX_DOCUMENT_BYTES) throw Error('This figure exceeds the 10 MB file limit. Shorten notes or remove objects before saving.');
 return raw;
}
// Keep edited leaves on their saved revision; replacing their shape would change
// part indices and invalidate measured bounding boxes. Whole objects can upgrade.
export function refineIllustrations(d) {
 const next=structuredClone(d);
 for(const n of next.nodes)if(n.type==='asset')n.artworkVersion=ASSETS.find(a=>a.id===n.assetId).version;
 return next;
}
export function manifest(d){
 const templates=[...new Map(templateReferences(d).flatMap(ref=>{const template=TEMPLATES.find(t=>t.id===ref.id&&t.id!=='blank'&&(ref.version===undefined||t.version===ref.version));return template?[[template.id+'@'+template.version,template]]:[];})).values()];
 return {schemaVersion:'0.1',figureTitle:d.title,generatedAt:new Date().toISOString(),licenseNotice:'Listed library artwork: CC BY 4.0. This does not automatically license the entire figure.',
 provenanceNotice:'Library origin records are project authorship declarations, not independent rights clearance.',artboard:dimensions(d),background:d.background||'#ffffff',styleId:d.styleId||null,
 assets:[...new Map(d.nodes.filter(n=>n.type==='asset'||n.type==='part').map(n=>{const a=assetRecord(n.assetId,n.artworkVersion);return [a.id+'@'+a.version,a];})).values()].map(a=>({...a,licenseUrl:'https://creativecommons.org/licenses/by/4.0/',modifications:'Composed, positioned, scaled, and possibly recolored in this figure.'})),
 templates:templates.map(template=>({id:template.id,name:template.name,version:template.version,creator:'BioEditor project',source:`BioEditor original template library v${template.version}`,license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',reviewStatus:'scientific-review-pending',modifications:'Template composition used as a starting point or copied in part, and possibly modified.'})),
 claims:d.claims||[],aiProvenance:d.aiProvenance||[]};
}
export function nodeMarkup(n){let body='';if(n.type==='asset'){const a=assetRecord(n.assetId,n.artworkVersion);body=`<g transform="scale(${n.w/100} ${n.h/100})">${glyph(a.kind,n.color,n.parameters,n.w/n.h,n.artworkVersion)}</g>`;}if(n.type==='part'){const a=assetRecord(n.assetId,n.artworkVersion),[x,y,w,h]=n.partBox;let shape=componentParts(a.kind,n.color,n.parameters,n.partAspect??1,n.artworkVersion,n.recolored)[n.partIndex].svg;if(n.recolored&&!isTechnicalArtwork(a.version))shape=shape.replace(/#[0-9a-f]{6}/gi,n.color);body=`<g transform="scale(${n.w/w} ${n.h/h})"><g transform="translate(${-x} ${-y})">${shape}</g></g>`;}if(n.type==='panel')body=`<rect width="${n.w}" height="${n.h}" rx="12" fill="${n.color}"/>`;if(n.type==='arrow')body=`<path d="M0 ${n.h/2}H${Math.max(0,n.w-10)}" stroke="${n.color}" stroke-width="2.5" fill="none"/><path d="M${n.w-11} ${n.h/2-5}L${n.w} ${n.h/2} ${n.w-11} ${n.h/2+5}" fill="${n.color}"/>`;if(n.type==='arrow'&&n.edgeStyle==='line')body=`<path d="M0 ${n.h/2}H${n.w}" stroke="${n.color}" stroke-width="2.5" fill="none"/>`;if(n.type==='arrow'&&n.edgeStyle==='inhibition')body=`<path d="M0 ${n.h/2}H${n.w-2}M${n.w-2} ${n.h/2-8}V${n.h/2+8}" stroke="${n.color}" stroke-width="2.5" fill="none"/>`;if(n.type==='text')body=`<text y="${n.fontSize}" font-family="Arial, sans-serif" font-size="${n.fontSize}" fill="${n.color}" font-weight="${n.fontSize>=22?'600':'400'}">${n.wrap?wrapLabel(n.label,n.w,n.fontSize).map((line,i)=>`<tspan x="0" dy="${i?n.fontSize*1.3:0}">${escapeXML(line)}</tspan>`).join(''):escapeXML(n.label)}</text>`;return `<g transform="translate(${n.x} ${n.y}) rotate(${n.rotation||0} ${n.w/2} ${n.h/2})" data-id="${escapeXML(n.id)}" class="object"><title>${escapeXML(n.label)}</title>${body}</g>`;}
export function exportSVG(d){
 validateDocument(d);d=structuredClone(d);synchronizeConnections(d);
 const {width,height}=dimensions(d);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${escapeXML(d.title)}</title><metadata>${escapeXML(JSON.stringify(manifest(d)))}</metadata><rect width="${width}" height="${height}" fill="${d.background||'#ffffff'}"/>${d.nodes.map(nodeMarkup).join('')}</svg>`;
}

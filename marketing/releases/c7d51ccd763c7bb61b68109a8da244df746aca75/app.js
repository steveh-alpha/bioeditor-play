import {selectionBox,enclosedSelection} from './editor/selection.js';
import {createStorage} from './editor/storage.js';
import {workspaceKey} from './editor/workspaces.js';
import {installWorkspaces} from './ui/workspaces.js';
import {finalizeEdit,centerNode} from './editor/edits.js';
import {installTrialGuide} from './ui/trial.js?v=feedback-20260914';
import {installDiagramTools} from './ui/diagram-tools.js';
import {STRUCTURE_DEFINITIONS} from './assets/structures.js';
import {searchCatalog,catalogCategories} from './assets/catalog.js';
import {synchronizeConnections,removeNodes} from './editor/connections.js';
import {duplicateSelection,installClipboard} from './editor/clipboard.js';
import {templateReferences,dimensions,rasterDimensions,preflight,attributionText,STYLES} from './studio.js';
import {installStudio} from './ui/studio.js';
import {ASSETS,COLORS,TEMPLATES,glyph,assetRecord,ILLUSTRATION_VERSION,componentParts,normalizeAngle,selectionCenter,rotateNodes,uid,assetNode,textNode,arrowNode,panelNode,makeTemplate,parseDocument,serializeDocument,manifest,nodeMarkup,exportSVG,escapeXML as esc} from './core.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let doc=makeTemplate('engineering'),selected=new Set(),history=[],future=[],tab='assets',category='All',zoom=1,drag=null;
// Give each explicit blank start its own address before loading or saving a figure.
const workspaceURL=new URL(location.href);
if(workspaceURL.searchParams.get('new')==='blank'){
 workspaceURL.searchParams.delete('new');
 workspaceURL.searchParams.set('workspace',crypto.randomUUID());
 window.history.replaceState(null,'',workspaceURL.href);
}
const workspaceId=workspaceURL.searchParams.get('workspace')||'',STORAGE_KEY=workspaceKey(workspaceId);
if(workspaceId)doc=makeTemplate('blank');
const storage=createStorage(()=>window.localStorage,STORAGE_KEY),loaded=storage.load();
if(loaded.document)doc=loaded.document;
let saveStatus=loaded.status,lastDownload=null;
function toast(message){const el=$('#toast');if($('#modal').open)$('#modal').append(el);else document.body.append(el);el.textContent=message;el.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display='none',6000);}
$('#modal').addEventListener('close',()=>document.body.append($('#toast')));
function showSaveStatus(status) {
 saveStatus=status;
 const messages={saved:'Saved on this device',new:'Preparing local save',unavailable:'Not saved — download a file',recovery:'Recovery available — autosave paused',conflict:'Another tab changed this figure — autosave paused'};
 $('#save-state').textContent=messages[status];
 $('#storage-notice').hidden=status==='saved'||status==='new';
 $('#storage-message').textContent=({unavailable:'Device storage is unavailable or full. Save a file to keep your work.',recovery:loaded.document?'A previous save was recovered. Download it or resume autosave. Your original data is preserved.':'The saved figure could not be opened. Your original data is preserved. Save a file before starting over.',conflict:'Another tab saved a figure. Save your work as a file before choosing which figure to keep.'})[status]||'';
 $('#resolve-storage').hidden=!['recovery','conflict'].includes(status);
}
function persist(options){const result=storage.save(doc,options);showSaveStatus(result.status);return result.status==='saved';}
function recordHistory(before){history.push(before);if(history.length>80)history.shift();future=[];}
function commit(fn){
 if(drag)endDrag();
 const before=JSON.stringify(doc),selection=new Set(selected);
 try {
  fn();
  if(finalizeEdit(JSON.parse(before),doc)){recordHistory(before);persist();}
  render();return true;
 }catch(error){doc=JSON.parse(before);selected=selection;render();toast(error.message);return false;}
}

function undo(){if(!history.length)return;future.push(JSON.stringify(doc));doc=JSON.parse(history.pop());selected.clear();persist();render();}
function redo(){if(!future.length)return;history.push(JSON.stringify(doc));doc=JSON.parse(future.pop());selected.clear();persist();render();}
function add(n){const style=STYLES.find(s=>s.id===doc.styleId);if(style){const similar=doc.nodes.find(v=>v.type===n.type&&v.assetId===n.assetId);n.color=similar?.color||(n.type==='text'||n.type==='arrow'?style.ink:style.colors[0]);}return commit(()=>{doc.nodes.push(n);selected=new Set([n.id]);});}
function render(){const active=document.activeElement,key=active?.id,layer=active?.dataset?.layer,scroll=$('#layers').scrollTop;renderCanvas();renderProperties();renderLayers();if(key&&document.getElementById(key)!==active)document.getElementById(key)?.focus({preventScroll:true});if(layer){const replacement=$$('[data-layer]').find(b=>b.dataset.layer===layer);(replacement||$('#canvas')).focus({preventScroll:true});}$('#layers').scrollTop=scroll;$('#title').value=doc.title;$('#object-count').textContent=`${doc.nodes.length} objects`;$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;$('#selection-status').textContent=selected.size?`${selected.size} selected`:'Select an object to edit';}
function renderCanvas(){synchronizeConnections(doc);const {width,height}=dimensions(doc);$('#canvas').setAttribute('viewBox',`0 0 ${width} ${height}`);$('#canvas').style.aspectRatio=`${width} / ${height}`;layoutCanvas();$('#canvas').style.background=doc.background||'#ffffff';$('#artboard-size').textContent=`${width} × ${height} px`;$('#figure-style').textContent=STYLES.find(s=>s.id===doc.styleId)?.name||'Custom palette';$('#print-page').textContent=`@page{size:${width}px ${height}px;margin:0}`;const nodes=doc.nodes.filter(n=>selected.has(n.id)&&!n.fromNodeId);$('#canvas').innerHTML=doc.nodes.map(nodeMarkup).join('')+nodes.map(n=>`<g class="selection-overlay" transform="translate(${n.x} ${n.y}) rotate(${n.rotation||0} ${n.w/2} ${n.h/2})"><rect x="-5" y="-5" width="${n.w+10}" height="${n.h+10}" fill="none" stroke="#109e8f" stroke-width="1.6" pointer-events="none"/><path d="M${n.w/2} -5V-29" stroke="#109e8f" pointer-events="none"/><circle data-rotate="${esc(n.id)}" cx="${n.w/2}" cy="-34" r="8" fill="white" stroke="#109e8f" stroke-width="2" style="cursor:grab"><title>Drag to rotate. Shift snaps to 15°.</title></circle><rect data-handle="${esc(n.id)}" x="${n.w-1}" y="${n.h-1}" width="10" height="10" rx="2" fill="white" stroke="#109e8f" stroke-width="2" style="cursor:nwse-resize"/></g>`).join('');
 if(drag?.marquee&&drag.box){const b=drag.box;$('#canvas').insertAdjacentHTML('beforeend',`<rect class="selection-overlay selection-marquee" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#109e8f" fill-opacity="0.12" stroke="#109e8f" stroke-width="1" vector-effect="non-scaling-stroke" pointer-events="none"/>`);}
}
function renderLibrary(){
 const query=$('#search').value,items=tab==='templates'?TEMPLATES:ASSETS;
 $('#library-title').textContent=tab==='assets'?'Biological components':tab==='templates'?'Diagram starting points':'Build your diagram';
 $('.search').hidden=tab==='tools';
 if(tab==='tools') {
   $('#asset-count').textContent='4';$('#categories').innerHTML='';
   $('#library-grid').innerHTML=`<button class="template-card tool-card" data-tool="composer"><strong>Diagram composer</strong><p>Processes, cycles, branches, and comparisons from your own labels and symbols.</p></button>${STRUCTURE_DEFINITIONS.map(def=>`<button class="template-card tool-card" data-structure="${def.id}"><svg viewBox="0 0 300 100"><g transform="scale(3 1)">${glyph(def.id,'#548476',undefined,3,ILLUSTRATION_VERSION)}</g></svg><strong>${esc(def.name)}</strong><p>${esc(def.description)}</p></button>`).join('')}`;
   return;
 }
 const results=searchCatalog(items,query,category);
 $('#asset-count').textContent=`${results.length} / ${items.length}`;
 $('#categories').innerHTML=`<label class="catalog-filter" for="catalog-category">${tab==='assets'?'Discipline':'Diagram collection'}<select id="catalog-category">${catalogCategories(items).map(c=>`<option value="${esc(c)}" ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></label>`;
 $('#library-grid').innerHTML=tab==='assets'?results.map(a=>`<button class="asset-card" data-asset="${a.id}" draggable="true" title="Add ${esc(a.name)}"><svg viewBox="0 0 100 100" aria-hidden="true">${glyph(a.kind,a.color,undefined,1,a.version)}</svg><span>${esc(a.name)}</span>${a.parametric?'<small>Configurable</small>':''}</button>`).join(''):results.map(t=>`<button class="template-card" data-template="${t.id}"><div class="template-preview">${t.assets.slice(0,4).map(id=>{const a=ASSETS.find(a=>a.id===id);return `<svg viewBox="0 0 100 100">${glyph(a.kind,a.color,undefined,1,a.version)}</svg>`;}).join('')||'＋'}</div><strong>${esc(t.name)}</strong><p>${esc(t.description)}</p><small>${esc(t.category)}</small></button>`).join('');
 if(!results.length)$('#library-grid').innerHTML='<div class="library-empty"><strong>No matching items yet.</strong><p>Try a broader term, choose another discipline, or use Build to compose a diagram from available symbols.</p></div>';
}
function renderProperties(){const n=doc.nodes.find(n=>selected.has(n.id));if(!n){$('#properties').innerHTML='<div class="empty-property"><strong>Make it your figure.</strong>Select any component, label, or panel to adjust its appearance.</div><label class="property-label">Artboard</label><div class="prop-input">'+dimensions(doc).width+' × '+dimensions(doc).height+' px</div><label class="property-label">Background</label><div class="prop-input">'+(doc.background||'#ffffff')+'</div><p class="muted">Tip: drag a box on empty canvas to select objects. Hold Shift to add to your selection, then align or group them.</p>';return;}
const a=n.assetId?assetRecord(n.assetId,n.artworkVersion):null;$('#properties').innerHTML=`<span class="badge">${selected.size>1?selected.size+' objects':n.type==='asset'?'BIOLOGICAL COMPONENT':n.type.toUpperCase()}</span>${n.fromNodeId?'<p class="muted">Attached relationship. Move its endpoint objects to change its position.</p>':''}${n.type==='arrow'?`<label class="property-label" for="edge-style">Relationship</label><select class="prop-input" id="edge-style">${[['arrow','Directed arrow'],['inhibition','Inhibition bar'],['line','Undirected line']].map(([value,label])=>`<option value="${value}" ${(n.edgeStyle||'arrow')===value?'selected':''}>${label}</option>`).join('')}</select>`:''}<label class="property-label" for="prop-label">${n.type==='text'?'Text':'Name'}</label><input id="prop-label" class="prop-input" maxlength="3000" value="${esc(n.label)}"><div class="property-row">${['x','y','w','h'].map(k=>`<label><span class="property-label">${({x:'X',y:'Y',w:'Width',h:'Height'})[k]}</span><input class="prop-input" type="number" data-prop="${k}" value="${Math.round(n[k])}" ${k==='w'||k==='h'?'min="1"':''}></label>`).join('')}</div>${n.type==='text'?`<label class="property-label">Font size<input class="prop-input" type="number" data-prop="fontSize" min="6" max="300" value="${n.fontSize}"></label>`:''}<label class="property-label" for="rotation">Rotation (degrees)</label><input class="prop-input" id="rotation" type="number" step="1" value="${Math.round(n.rotation||0)}"><div class="prop-actions"><button data-action="rotate-left">↶ 90°</button><button data-action="rotate-right">↷ 90°</button></div>${n.type==='text'?`<label class="checkline"><input id="text-wrap" type="checkbox" ${n.wrap?'checked':''}>Wrap text to width</label>`:''}<label class="property-label">Color</label><div class="swatches">${[...COLORS,'#294845'].map(c=>`<button data-color="${c}" style="background:${c}" aria-label="Set color ${c}"></button>`).join('')}</div><input type="color" id="custom-color" aria-label="Custom color" value="${n.color}"><div class="prop-actions">${n.type==='asset'?`${a?.parametric?'<button data-action="configure">Configure structure</button>':''}<button class="primary" data-action="parts">Edit parts</button>`:''}<button data-action="duplicate" title="Duplicate (Ctrl/⌘ D)">Duplicate</button><button data-action="delete">Delete</button><button data-action="front">To front</button><button data-action="back">To back</button>${selected.size>1?'<button data-action="connect">Connect objects</button><button data-action="align">Align tops</button><button data-action="group">Group</button>':''}${n.group?'<button data-action="ungroup">Ungroup</button>':''}</div>${a?`<p class="muted">${a.creator} · v${a.version}<br><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p><span class="badge warning">Scientific review pending</span>`:''}`;
if(n.fromNodeId){$$('[data-prop]').forEach(el=>el.disabled=true);$('#rotation').disabled=true;$$('[data-action^="rotate-"]').forEach(el=>el.disabled=true);}
$('#text-wrap')?.addEventListener('change',e=>{const wrap=e.target.checked;commit(()=>n.wrap=wrap);});
$('#edge-style')?.addEventListener('change',e=>{const value=e.target.value;commit(()=>n.edgeStyle=value);});
$('#rotation').onchange=e=>{const angle=Number(e.target.value);if(Number.isFinite(angle))commit(()=>rotateNodes(doc.nodes.filter(v=>selected.has(v.id)),normalizeAngle(angle)-(n.rotation||0)));};$('#prop-label').onchange=e=>commit(()=>n.label=e.target.value.slice(0,3000));$$('[data-prop]').forEach(el=>el.onchange=e=>{const key=e.target.dataset.prop,value=Number(e.target.value);if(!Number.isFinite(value))return;commit(()=>n[key]=Math.max(key==='fontSize'?6:key==='w'||key==='h'?1:-10000,Math.min(key==='fontSize'?300:10000,value)));});$$('[data-color]').forEach(b=>b.onclick=()=>setColor(b.dataset.color));$('#custom-color').onchange=e=>setColor(e.target.value);$$('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));}
function setColor(c){commit(()=>doc.nodes.filter(n=>selected.has(n.id)).forEach(n=>{n.color=c;if(n.type==='part')n.recolored=true;}));}
function editParts(){
 const target=doc.nodes.find(n=>selected.has(n.id)&&n.type==='asset');if(!target)return;
 const asset=assetRecord(target.assetId,target.artworkVersion),parts=componentParts(asset.kind,target.color,target.parameters,target.w/target.h,target.artworkVersion);
 const measure=document.createElementNS('http://www.w3.org/2000/svg','svg');
 measure.setAttribute('width','100');measure.setAttribute('height','100');measure.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden';document.body.append(measure);
 let nodes;
 try{nodes=parts.map((part,i)=>{
  measure.innerHTML=`<g>${part.svg}</g>`;
  const b=measure.firstElementChild.getBBox(),pad=3,box=[b.x-pad,b.y-pad,Math.max(b.width+2*pad,6),Math.max(b.height+2*pad,6)];
  return {id:uid(),type:'part',assetId:target.assetId,...(target.artworkVersion?{artworkVersion:target.artworkVersion}:{}),partIndex:i,partBox:box,...(asset.parametric?{parameters:{...target.parameters},partAspect:target.w/target.h}:{}),x:target.x+box[0]*target.w/100,y:target.y+box[1]*target.h/100,w:box[2]*target.w/100,h:box[3]*target.h/100,color:target.color,label:`${target.label} · ${part.name||`${part.shape} ${i+1}`}`};
 });}finally{measure.remove();}
 rotateNodes(nodes,target.rotation||0,{x:target.x+target.w/2,y:target.y+target.h/2});const applied=commit(()=>{const index=doc.nodes.indexOf(target);doc.nodes.forEach(edge=>{if(edge.fromNodeId===target.id||edge.toNodeId===target.id){delete edge.fromNodeId;delete edge.toNodeId;}});doc.nodes.splice(index,1,...nodes);selected=new Set();});
 if(applied)toast(`${nodes.length} editable parts. Any relationships attached to this component are now free arrows.`);
}
function action(a){if(!selected.size)return;if(a==='configure'){const n=doc.nodes.find(n=>selected.has(n.id));diagramTools.structure(n.assetId,n.id);return;}if(a==='connect'){diagramTools.connect();return;}if(a==='parts'){editParts();return;}if(a==='rotate-left'||a==='rotate-right'){commit(()=>rotateNodes(doc.nodes.filter(n=>selected.has(n.id)),a==='rotate-left'?-90:90));return;}commit(()=>{const nodes=doc.nodes.filter(n=>selected.has(n.id));if(a==='delete'){removeNodes(doc,selected);selected.clear();}if(a==='duplicate'){const copies=duplicateSelection(doc,selected);doc.nodes.push(...copies);selected=new Set(copies.map(n=>n.id));}if(a==='front')doc.nodes=[...doc.nodes.filter(n=>!selected.has(n.id)),...nodes];if(a==='back')doc.nodes=[...nodes,...doc.nodes.filter(n=>!selected.has(n.id))];if(a==='align'){const y=Math.min(...nodes.map(n=>n.y));nodes.forEach(n=>n.y=y);}if(a==='group'){const id=uid();nodes.forEach(n=>n.group=id);}if(a==='ungroup')nodes.forEach(n=>delete n.group);});}
function select(id,append=false){const n=doc.nodes.find(n=>n.id===id);if(!n)return;const ids=n.group?doc.nodes.filter(v=>v.group===n.group).map(v=>v.id):[id],remove=append&&ids.every(id=>selected.has(id));if(!append)selected.clear();ids.forEach(id=>remove?selected.delete(id):selected.add(id));render();}
function renderLayers(){$('#layer-count').textContent=doc.nodes.length;$('#layers').innerHTML=[...doc.nodes].reverse().map(n=>`<button class="layer ${selected.has(n.id)?'active':''}" aria-pressed="${selected.has(n.id)}" data-layer="${esc(n.id)}"><span>${n.type==='text'?'T':n.type==='arrow'?'↗':n.type==='panel'?'▢':'◇'}</span><span>${esc(n.label)}</span></button>`).join('');$$('[data-layer]').forEach(b=>b.onclick=e=>select(b.dataset.layer,e.shiftKey));}
function point(e){const p=$('#canvas').createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform($('#canvas').getScreenCTM().inverse());}
$('#canvas').addEventListener('pointerdown',e=>{
 if(e.button!==0||drag)return;
 document.activeElement?.blur();$('#canvas').focus({preventScroll:true});
 const p=point(e),rotation=e.target.closest('[data-rotate]'),handle=e.target.closest('[data-handle]'),target=e.target.closest('[data-id]');
 if(!rotation&&!handle&&!target){
  drag={marquee:true,start:p,clientStart:{x:e.clientX,y:e.clientY},previous:new Set(selected),initial:e.shiftKey?new Set(selected):new Set(),pointerId:e.pointerId};
  selected=new Set(drag.initial);render();$('#canvas').setPointerCapture(e.pointerId);e.preventDefault();return;
 }
 const id=rotation?.dataset.rotate||handle?.dataset.handle||target.dataset.id;
 if(!selected.has(id)||e.shiftKey&&!rotation)select(id,e.shiftKey);
 if(!selected.has(id)||doc.nodes.find(n=>n.id===id)?.fromNodeId){e.preventDefault();return;}
 const nodes=doc.nodes.filter(n=>selected.has(n.id)&&!n.fromNodeId).map(n=>({...n})),pivot=selectionCenter(nodes);
 drag={before:JSON.stringify(doc),start:p,handle:handle?id:null,rotating:!!rotation,pivot,startAngle:Math.atan2(p.y-pivot.y,p.x-pivot.x),nodes};
 $('#canvas').setPointerCapture(e.pointerId);e.preventDefault();
});
$('#canvas').addEventListener('pointermove',e=>{
 if(!drag)return;
 const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
 if(drag.marquee){
  if(e.pointerId!==drag.pointerId)return;
  if(!drag.box&&Math.hypot(e.clientX-drag.clientStart.x,e.clientY-drag.clientStart.y)<3)return;
  drag.box=selectionBox(drag.start,p);selected=enclosedSelection(doc.nodes,drag.box,drag.initial);render();return;
 }
 if(drag.rotating){let delta=(Math.atan2(p.y-drag.pivot.y,p.x-drag.pivot.x)-drag.startAngle)*180/Math.PI;if(e.shiftKey)delta=Math.round(((drag.nodes[0].rotation||0)+delta)/15)*15-(drag.nodes[0].rotation||0);const copies=drag.nodes.map(n=>({...n}));rotateNodes(copies,delta,drag.pivot);copies.forEach(n=>Object.assign(doc.nodes.find(v=>v.id===n.id),n));}
 else drag.nodes.forEach(before=>{const n=doc.nodes.find(n=>n.id===before.id);if(drag.handle){if(n.id!==drag.handle)return;const a=(before.rotation||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);n.w=Math.max(6,Math.min(100000,before.w+dx*c+dy*s));n.h=Math.max(6,Math.min(100000,before.h-dx*s+dy*c));const dw=n.w-before.w,dh=n.h-before.h;n.x=before.x+(dw*c-dh*s-dw)/2;n.y=before.y+(dw*s+dh*c-dh)/2;}else{n.x=before.x+Math.round(dx/2)*2;n.y=before.y+Math.round(dy/2)*2;}});
 renderCanvas();
});
function endDrag(cancel=false){
 if(!drag)return;
 if(drag.marquee){const gesture=drag;drag=null;if(cancel)selected=gesture.previous;render();if($('#canvas').hasPointerCapture(gesture.pointerId))$('#canvas').releasePointerCapture(gesture.pointerId);return;}
 const before=drag.before;drag=null;
 try{if(cancel)doc=JSON.parse(before);else if(finalizeEdit(JSON.parse(before),doc)){recordHistory(before);persist();}}
 catch(error){doc=JSON.parse(before);toast(error.message);}
 render();
}
$('#canvas').addEventListener('pointerup',()=>endDrag());
$('#canvas').addEventListener('pointercancel',()=>endDrag(true));
$('#canvas').addEventListener('lostpointercapture',()=>endDrag());
$('#canvas').addEventListener('dblclick',e=>{const id=e.target.closest('[data-id]')?.dataset.id;if(id){select(id);$('#prop-label')?.focus();$('#prop-label')?.select();}});
$('#library-grid').onclick=e=>{const b=e.target.closest('[data-asset]');if(b)add(centerNode(doc,assetNode(b.dataset.asset,0,0)));const t=e.target.closest('[data-template]');if(t)confirmTemplate(t.dataset.template);if(e.target.closest('[data-tool]'))diagramTools.composer();const structure=e.target.closest('[data-structure]');if(structure)diagramTools.structure(structure.dataset.structure);};
$('#library-grid').ondragstart=e=>{const b=e.target.closest('[data-asset]');if(b)e.dataTransfer.setData('text/bioeditor-asset',b.dataset.asset);};$('#canvas').ondragover=e=>e.preventDefault();$('#canvas').ondrop=e=>{e.preventDefault();const id=e.dataTransfer.getData('text/bioeditor-asset');if(ASSETS.some(a=>a.id===id)){const p=point(e);add(assetNode(id,p.x-75,p.y-75));}};
$('#categories').onchange=e=>{if(e.target.id==='catalog-category'){category=e.target.value;renderLibrary();}};$$('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;category='All';$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('#search').value='';renderLibrary();$('.library-content').scrollTop=0;});$('#search').oninput=renderLibrary;
$('#title').onchange=e=>commit(()=>doc.title=e.target.value.trim()||'Untitled figure');$('#add-text').onclick=()=>add(centerNode(doc,{...textNode('Your label',0,0,24),wrap:true}));$('#add-arrow').onclick=()=>add(centerNode(doc,arrowNode(0,0,150)));$('#add-panel').onclick=()=>{const style=STYLES.find(s=>s.id===doc.styleId);const n=centerNode(doc,panelNode(0,0,300,280,style?.panels[doc.nodes.filter(v=>v.type==='panel').length%3]));commit(()=>{doc.nodes.unshift(n);selected=new Set([n.id]);});};$('#undo').onclick=undo;$('#redo').onclick=redo;
function layoutCanvas(){const stage=$('#stage'),css=getComputedStyle(stage),{width,height}=dimensions(doc);const availableWidth=Math.max(100,stage.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)),availableHeight=Math.max(100,stage.clientHeight-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom)-95);const fitWidth=Math.min(availableWidth,availableHeight*width/height);$('#canvas').style.width=`${fitWidth*zoom}px`;$('#canvas').style.maxWidth='none';}
function setZoom(z){zoom=Math.max(.4,Math.min(2.5,z));layoutCanvas();$('#zoom-label').textContent=`${Math.round(zoom*100)}%`;}
window.addEventListener('resize',layoutCanvas);
$('#zoom-in').onclick=()=>setZoom(zoom+.1);$('#zoom-out').onclick=()=>setZoom(zoom-.1);$('#fit').onclick=()=>setZoom(1);
function editingText(target){return target.closest?.('input,textarea,select')||target.isContentEditable;}
function canHandleClipboard(e){return !$('#modal').open&&!drag&&!editingText(e.target);}
installClipboard({canHandle:canHandleClipboard,getDoc:()=>doc,getSelected:()=>selected,toast,insert:(copies,fragment)=>commit(()=>{doc.nodes.push(...copies);const refs=templateReferences({...doc,sourceTemplates:[...(doc.sourceTemplates||[]),...(fragment.sourceTemplates||[])]});if(refs.length)doc.sourceTemplates=refs;selected=new Set(copies.map(n=>n.id));})});
document.addEventListener('keydown',e=>{
 if(e.isComposing||$('#modal').open)return;
 const mod=e.metaKey||e.ctrlKey,key=e.key.toLowerCase();
 if(mod&&key==='s'){e.preventDefault();document.activeElement?.blur();saveFile();return;}
 if(editingText(e.target))return;
 if(drag){if(e.key==='Escape'){e.preventDefault();endDrag(true);}return;}
 if(mod&&key==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
 if(mod&&key==='y'){e.preventDefault();redo();return;}
 const inEditor=e.target.closest('#canvas,#layers,#properties');
 if(mod&&!e.altKey&&key==='d'){e.preventDefault();action('duplicate');}
 if(mod&&!e.altKey&&key==='a'){e.preventDefault();selected=new Set(doc.nodes.map(n=>n.id));render();}
 if((e.key==='Delete'||e.key==='Backspace')&&inEditor){e.preventDefault();action('delete');}
 if(e.key==='Escape'){selected.clear();render();}
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&selected.size&&inEditor){e.preventDefault();const step=e.shiftKey?10:2;commit(()=>doc.nodes.filter(n=>selected.has(n.id)&&!n.fromNodeId).forEach(n=>{n.x+=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;n.y+=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;}));}
});
function download(content,name,type){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function filename(ext){return `${doc.title.replace(/[^\p{L}\p{N}\s_-]/gu,'').trim().slice(0,120)||'figure'}.${ext}`;}
function saveFile(){try{if(drag)endDrag();download(serializeDocument(doc,true),filename('biofig.json'),'application/json');lastDownload=JSON.stringify(doc);toast('Editable figure download started');}catch(error){toast(error.message);}}
$('#save').onclick=saveFile;$('#open').onclick=()=>$('#file-input').click();$('#file-input').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10_000_000)throw Error('Choose a file smaller than 10 MB.');const next=parseDocument(await file.text());if(commit(()=>{doc=next;selected.clear();}))toast('Figure opened. Undo restores the previous figure.');}catch(err){toast(err.message);}e.target.value='';};
function modal(title,body){$('#modal-content').innerHTML=`<div class="dialog-header"><h2 id="dialog-title" tabindex="-1">${esc(title)}</h2><button id="close-modal" aria-label="Close dialog">×</button></div>${body}`;$('#close-modal').onclick=()=>$('#modal').close();if(!$('#modal').open)$('#modal').showModal();$('#dialog-title').focus();}
function confirmTemplate(id){modal('Start a new figure',`<p>Open “${esc(TEMPLATES.find(t=>t.id===id).name)}”? Your current figure will be replaced. You can undo this change.</p><button id="apply-template" class="primary">Use template</button>`);$('#apply-template').onclick=()=>{commit(()=>{doc=makeTemplate(id);selected.clear();});$('#modal').close();};}
const diagramTools=installDiagramTools({getDoc:()=>doc,getSelected:()=>selected,replaceDoc:next=>commit(()=>{doc=next;selected.clear();}),add,modal,toast});
const studio=installStudio({getDoc:()=>doc,replaceDoc:next=>commit(()=>{doc=next;}),getSelected:()=>selected,selectObjects:ids=>{selected=new Set(ids);render();},modal,toast,download,filename});
$('#artboard-settings').onclick=studio.artboard;$('#style-settings').onclick=studio.styles;
$('#select-tool').onclick=()=>{selected.clear();render();};
$('#export').onclick=()=>{
 const report=preflight(doc,manifest(doc)),raster=rasterDimensions(doc);
 modal('Export your figure',`<p class="muted">Keep vectors editable or create a high-resolution image.</p><div class="export-options"><button id="export-svg"><strong>SVG</strong><small>Editable vectors</small></button><button id="export-png"><strong>PNG</strong><small>${raster.width} × ${raster.height} px</small></button><button id="export-pdf"><strong>PDF</strong><small>Browser print</small></button></div><details open><summary>Figure checks · ${report.issues.length} items to review</summary>${studio.checksMarkup(report)}</details><div class="prop-actions"><button id="export-manifest">Download attribution manifest</button><button id="export-credit">Download artwork credits</button></div><p class="muted">Include artwork credits when sharing or publishing. SVG embeds provenance; PNG and browser PDF need the companion credits. Print output depends on your browser and print settings.</p>`);
 $('#export-svg').onclick=()=>{try{download(exportSVG(doc),filename('svg'),'image/svg+xml');toast('Editable SVG exported');}catch(error){toast(error.message);}};
 $('#export-png').onclick=exportPNG;
 $('#export-pdf').onclick=()=>{$('#modal').close();window.print();};
 $('#export-manifest').onclick=()=>download(JSON.stringify(manifest(doc),null,2),filename('attribution.json'),'application/json');
 $('#export-credit').onclick=()=>download(attributionText(manifest(doc)),filename('credits.txt'),'text/plain');
 studio.bindChecks(report);
};
async function exportPNG(){
 const b=$('#export-png');b.disabled=true;let url;
 try{
  const snapshot=structuredClone(doc),name=filename('png');
  url=URL.createObjectURL(new Blob([exportSVG(snapshot)],{type:'image/svg+xml'}));
  const img=new Image();await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Image rendering timed out.')),15000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(Error('Image rendering failed.'));};img.src=url;});
  const canvas=document.createElement('canvas'),size=rasterDimensions(snapshot);canvas.width=size.width;canvas.height=size.height;
  const context=canvas.getContext('2d');if(!context)throw Error('Canvas is unavailable.');context.drawImage(img,0,0,size.width,size.height);
  const blob=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('PNG encoding timed out.')),15000);canvas.toBlob(blob=>{clearTimeout(timer);resolve(blob);},'image/png');});
  if(!blob)throw Error('PNG encoding failed.');download(blob,name);toast('High-resolution PNG exported');
 }catch(error){toast(`${error.message} Try SVG export.`);}finally{if(url)URL.revokeObjectURL(url);b.disabled=false;}
}
$('#review').onclick=studio.evidence;
$('#ai').onclick=()=>{modal('Figure assistant',`<p class="muted">Describe your study and choose an editable starting point.</p><label for="study">Study description</label><textarea id="study" maxlength="10000" placeholder="We isolate CD8+ T cells, deliver a CRISPR editing complex, and measure expansion and editing efficiency…"></textarea><label for="figure-type">Starting structure</label><select id="figure-type">${TEMPLATES.filter(t=>t.id!=='blank').map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select><div class="dialog-note"><strong>Hosted AI is not connected yet.</strong> You can prepare a template-based draft locally. This does not use an AI model or send your text anywhere.</div><button class="primary" id="prepare-draft">Prepare local draft</button>`);$('#prepare-draft').onclick=()=>{const description=$('#study').value.trim();if(description.length<12){toast('Add a short study description first.');return;}const templateId=$('#figure-type').value;const t=TEMPLATES.find(t=>t.id===templateId);modal('Review your starting point',`<div class="review-plan"><h3>${esc(t.name)}</h3><ol>${t.labels.map(l=>`<li>${l}</li>`).join('')}</ol><p class="muted">Your study note: ${esc(description)}</p></div><p class="muted">This local draft uses the selected template. It does not extract or verify claims from your text. Replace the example labels and confirm the cell type, intervention, and outcome.</p><button class="primary" id="apply-draft">Apply editable draft</button>`);$('#apply-draft').onclick=()=>{commit(()=>{doc=makeTemplate(templateId);doc.claims=[{id:uid(),text:description,status:'author-provided-unverified'}];selected.clear();});$('#modal').close();toast('Template draft ready — edit the example labels');};};};
try{document.modelContext?.registerTool({name:'bioeditor_add_component',description:'Add a biological component to the current figure.',inputSchema:{type:'object',properties:{assetId:{type:'string',enum:ASSETS.map(a=>a.id)}},required:['assetId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||!ASSETS.some(a=>a.id===input.assetId))throw Error('Unknown assetId');const n=centerNode(doc,assetNode(input.assetId,0,0));if(!add(n))throw Error('Component could not be added.');return {addedNodeId:n.id,objectCount:doc.nodes.length};}});document.modelContext?.registerTool({name:'bioeditor_read_figure',description:'Read the current figure title, objects, and provenance.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({title:doc.title,nodes:doc.nodes,provenance:manifest(doc)})});}catch{}
$('#storage-save').onclick=saveFile;
function recoveryOptions(){
 let backup;try{backup=parseDocument(localStorage.getItem(STORAGE_KEY+'.backup'));}catch{}
 modal('Keep your work safe',`<p>Save a file of this canvas before continuing. Restoring the previous save replaces this canvas; Undo restores it. When autosave is paused, resuming it preserves the existing stored data in a recovery copy on this device.</p><div class="prop-actions"><button id="recovery-download">Save this figure as a file</button>${saveStatus!=='saved'?'<button id="resume-autosave" class="primary">Use this figure for autosave</button>':''}${backup?`<button id="restore-backup">Restore previous save: ${esc(backup.title)}</button>`:''}${saveStatus==='conflict'?'<button id="load-latest">Load the other tab’s figure</button>':''}<button id="download-original">Download stored recovery data</button></div>`);
 $('#recovery-download').onclick=saveFile;
 $('#resume-autosave')?.addEventListener('click',()=>{if(persist({resolve:true})){$('#modal').close();toast('Autosave resumed. Previous data is preserved on this device.');}});
 $('#restore-backup')?.addEventListener('click',()=>{if(commit(()=>{doc=backup;selected.clear();})){$('#modal').close();toast('Previous save restored. Undo returns to your former canvas.');}});
 $('#download-original').onclick=()=>{try{download(JSON.stringify({primary:localStorage.getItem(STORAGE_KEY),backup:localStorage.getItem(STORAGE_KEY+'.backup'),recovery:localStorage.getItem(STORAGE_KEY+'.recovery')},null,2),'bioeditor-recovery.json','application/json');}catch{toast('Device storage cannot be read. Save this figure as a file.');}};
 $('#load-latest')?.addEventListener('click',()=>{const next=storage.load();if(next.document&&commit(()=>{doc=next.document;selected.clear();})){$('#modal').close();toast('Stored figure loaded. Undo restores your previous canvas.');}else{showSaveStatus(next.status);toast('The stored figure could not be loaded.');}});
}
$('#resolve-storage').onclick=recoveryOptions;
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY||e.key===null)showSaveStatus('conflict');});
window.addEventListener('beforeunload',e=>{if(drag)endDrag();if(saveStatus!=='saved'&&lastDownload!==JSON.stringify(doc)){e.preventDefault();e.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&drag)endDrag();});
installWorkspaces({modal,toast,currentId:workspaceId,prepareToLeave:()=>{document.activeElement?.blur();if(drag)endDrag();if(persist())return true;toast('Save this figure as a file and resolve its storage issue before switching workspaces.');return false;}});
installTrialGuide({modal,toast,recover:recoveryOptions,getDoc:()=>doc,getSaveStatus:()=>saveStatus});
$('#toggle-inspector').onclick=()=>{const open=!document.body.classList.contains('show-inspector');document.body.classList.toggle('show-inspector',open);$('#toggle-inspector').setAttribute('aria-expanded',String(open));if(open)$('#inspector-title').focus();};
$('#close-inspector').onclick=()=>{document.body.classList.remove('show-inspector');$('#toggle-inspector').setAttribute('aria-expanded','false');$('#toggle-inspector').focus();};
renderLibrary();render();showSaveStatus(loaded.status);if(loaded.status==='new')persist();

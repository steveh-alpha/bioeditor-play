import {ASSETS,assetNode,exportSVG,validateDocument,escapeXML as esc,glyph,ILLUSTRATION_VERSION} from '../core.js';
import {DIAGRAM_LAYOUTS,composeDiagram} from '../templates/diagrams.js';
import {STRUCTURE_DEFINITIONS,structureParameters} from '../assets/structures.js';
import {dimensions} from '../studio.js';
import {connectNodes} from '../editor/connections.js';

export function installDiagramTools({getDoc,getSelected,replaceDoc,add,modal,toast}) {
  const $=s=>document.querySelector(s);
  const symbols=ASSETS.filter(a=>!a.parametric);
  function composer() {
    let rows=[{label:'Starting material',assetId:'tube'},{label:'Intervention',assetId:'flask'},{label:'Observation',assetId:'microscope'}];
    modal('Diagram composer',`<p class="muted">Build a new editable diagram from your own labels and biological symbols. Relationships follow their linked objects. Creating a figure replaces the current canvas; Undo restores it.</p><label for="diagram-title">Diagram title</label><input class="prop-input" id="diagram-title" maxlength="200" value="My biological diagram"><label for="diagram-layout">Layout</label><select id="diagram-layout">${DIAGRAM_LAYOUTS.map(l=>`<option value="${l.id}">${l.name} — ${l.description}</option>`).join('')}</select><div id="diagram-items"></div><button id="add-diagram-item">Add item</button><div class="prop-actions"><button id="preview-diagram">Preview diagram</button><button id="create-diagram" class="primary">Create new figure</button></div><div id="diagram-preview" class="diagram-preview"></div><p class="muted">Use 2–8 items. For branching, the first item is the parent. Symbols, ordering, and arrows are schematic; verify their scientific meaning.</p>`);
    const readRows=()=>[...document.querySelectorAll('[data-diagram-row]')].map(el=>({label:el.querySelector('input').value.trim(),assetId:el.querySelector('select').value}));
    function renderRows() {
      $('#diagram-items').innerHTML=rows.map((row,i)=>`<div class="diagram-item" data-diagram-row="${i}"><label for="item-label-${i}">Item ${i+1}<input class="prop-input" id="item-label-${i}" maxlength="100" value="${esc(row.label)}"></label><label for="item-symbol-${i}">Symbol<select id="item-symbol-${i}">${symbols.map(a=>`<option value="${a.id}" ${a.id===row.assetId?'selected':''}>${esc(a.name)}</option>`).join('')}</select></label><button data-remove-item="${i}" aria-label="Remove item ${i+1}" ${rows.length<=2?'disabled':''}>×</button></div>`).join('');
      $('#add-diagram-item').disabled=rows.length>=8;
      document.querySelectorAll('[data-remove-item]').forEach(b=>b.onclick=()=>{rows=readRows();rows.splice(Number(b.dataset.removeItem),1);renderRows();$('#diagram-preview').innerHTML='';});
    }
    const draft=()=>validateDocument(composeDiagram({title:$('#diagram-title').value.trim(),layout:$('#diagram-layout').value,steps:readRows()}));
    $('#add-diagram-item').onclick=()=>{rows=readRows();if(rows.length<8)rows.push({label:`Item ${rows.length+1}`,assetId:'epithelial'});renderRows();$('#diagram-preview').innerHTML='';};
    $('#preview-diagram').onclick=()=>{try{$('#diagram-preview').innerHTML=exportSVG(draft());}catch(error){toast(error.message);}};
    $('#create-diagram').onclick=()=>{try{if(replaceDoc(draft())===false)return;$('#modal').close();toast('Editable diagram created');}catch(error){toast(error.message);}};
    renderRows();
  }
  function structure(kind,nodeId) {
    const current=getDoc().nodes.find(n=>n.id===nodeId),definition=STRUCTURE_DEFINITIONS.find(s=>s.id===kind);
    if(!definition)return;
    const params=structureParameters(kind,current?.parameters);
    modal(current?'Configure structure':`Build ${definition.name.toLowerCase()}`,`<p class="muted">${esc(definition.description)} Counts represent schematic features, not measured biology.</p><form id="structure-form">${definition.fields.map(f=>`<label for="structure-${f.key}">${f.label}<input class="prop-input" id="structure-${f.key}" type="number" min="${f.min}" max="${f.max}" step="1" required value="${params[f.key]}"></label>`).join('')}<div id="structure-preview" class="structure-preview"></div><button class="primary" type="submit">${current?'Update structure':'Insert structure'}</button></form><p class="muted">Resize the object to change its length and height. Configure it again at any time, or use Edit parts for individual shapes.</p>`);
    const read=()=>structureParameters(kind,Object.fromEntries(definition.fields.map(f=>[f.key,Number($(`#structure-${f.key}`).value)])));
    const preview=()=>{try{$('#structure-preview').innerHTML=`<svg viewBox="0 0 300 100" aria-label="Structure preview"><g transform="scale(3 1)">${glyph(kind,current?.color||'#548476',read(),3,current?current.artworkVersion:ILLUSTRATION_VERSION)}</g></svg>`;}catch{$('#structure-preview').textContent='Enter values within the displayed limits to preview.';}};
    definition.fields.forEach(f=>$(`#structure-${f.key}`).oninput=preview);preview();
    $('#structure-form').onsubmit=e=>{e.preventDefault();try{
      const parameters=read();
      if(current){const next=structuredClone(getDoc());next.nodes.find(n=>n.id===nodeId).parameters=parameters;validateDocument(next);if(replaceDoc(next)===false)return;}
      else{const {width,height}=dimensions(getDoc()),w=Math.min(420,width*.8),h=Math.min(140,height*.4);const n=assetNode(kind,(width-w)/2,(height-h)/2,w);n.h=h;n.parameters=parameters;if(add(n)===false)return;}
      $('#modal').close();
    }catch(error){toast(error.message);}};
  }
  function connect() {
    const nodes=getDoc().nodes.filter(n=>getSelected().has(n.id)&&n.type!=='arrow');
    if(nodes.length!==2){toast('Select two non-arrow objects to connect.');return;}
    modal('Connect selected objects',`<p class="muted">The relationship follows these two objects as you move or resize them.</p><label for="relationship-direction">Direction</label><select id="relationship-direction"><option value="forward">${esc(nodes[0].label)} → ${esc(nodes[1].label)}</option><option value="reverse">${esc(nodes[1].label)} → ${esc(nodes[0].label)}</option></select><label for="relationship-style">Relationship</label><select id="relationship-style"><option value="arrow">Directed arrow</option><option value="inhibition">Inhibition bar</option><option value="line">Undirected line</option></select><button class="primary" id="create-relationship">Connect objects</button><p class="muted">The label describes your intended relationship; it does not verify a biological mechanism.</p>`);
    $('#create-relationship').onclick=()=>{const endpoints=$('#relationship-direction').value==='reverse'?[...nodes].reverse():nodes;if(add(connectNodes(...endpoints,$('#relationship-style').value))!==false)$('#modal').close();};
  }
  return {composer,structure,connect};
}

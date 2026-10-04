import {ASSETS,glyph,assetRecord} from '../assets/library.js';
import {escapeXML as esc} from '../svg.js';
const discipline=document.querySelector('#discipline'),compare=document.querySelector('#compare');
discipline.innerHTML+= [...new Set(ASSETS.map(a=>a.category))].sort().map(c=>`<option>${esc(c)}</option>`).join('');
const query=new URLSearchParams(location.search);
let focused=ASSETS.find(a=>a.id===query.get('asset'));
compare.checked=query.get('compare')==='1';
if(focused)discipline.value=focused.category;
function render() {
  const assets=ASSETS.filter(a=>discipline.value==='All'||a.category===discipline.value).filter(a=>!focused||a.id===focused.id);
  document.body.classList.toggle('compare',compare.checked);
  document.body.classList.toggle('focused',!!focused);
  document.querySelector('.intro h1').textContent=focused?.name||'Precision in every part.';
  document.querySelector('.intro>p:last-child').textContent=focused?.limitations||`Finer outlines, measured proportions, and restrained tonal fills. ${ASSETS.length} editable symbols, with a consistent visual language.`;
  document.querySelector('#count').textContent=`${assets.length} symbol${assets.length===1?'':'s'}`;
  const drawing=(a,version,label)=>`<div class="drawing"><svg viewBox="0 0 100 100" role="img" aria-label="${esc(a.name)} · ${label}">${glyph(assetRecord(a.id,version).kind,a.color,undefined,1,version)}</svg>${compare.checked?`<small>${label}</small>`:''}</div>`;
  document.querySelector('#gallery').innerHTML=assets.map(a=>`<article class="specimen" data-asset="${a.id}"><div class="drawings">${compare.checked&&assetRecord(a.id).version!==a.version?drawing(a,a.previousVersion,'Earlier'):''}${drawing(a,a.version,assetRecord(a.id).version===a.version?'Original':'Refined')}</div><h2>${esc(a.name)}</h2><p>${esc(a.category)} · Editable vector${a.parametric?' · Configurable':''}</p></article>`).join('');
}
discipline.onchange=()=>{focused=undefined;render();};compare.onchange=render;render();

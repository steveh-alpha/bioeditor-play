import {ASSETS,glyph,makeTemplate,exportSVG} from './core.js';

// Use the editor's own artwork and document renderer to keep previews faithful.
for (const element of document.querySelectorAll('[data-asset]')) {
  const asset=ASSETS.find(asset=>asset.id===element.dataset.asset);
  element.innerHTML=`<svg viewBox="0 0 100 100" aria-hidden="true">${glyph(asset.kind,asset.color,undefined,1,asset.version)}</svg>`;
}
const preview=document.querySelector('#figure-preview');
preview.innerHTML=exportSVG(makeTemplate('engineering'));
preview.querySelector('svg').setAttribute('role','img');
preview.querySelector('svg').setAttribute('aria-label','Example BioEditor figure: a three-stage T cell engineering workflow.');
document.querySelector('#library-count').textContent=`${ASSETS.length} original vector illustrations · Editable in your browser`;

// Preserve workspace links saved before the editor moved off the homepage.
const workspace=new URL(location.href).searchParams.get('workspace');
if(workspace!==null){
  const editor=new URL('https://editor.vaelise.com/');
  editor.searchParams.set('workspace',workspace);
  location.replace(editor.href);
}

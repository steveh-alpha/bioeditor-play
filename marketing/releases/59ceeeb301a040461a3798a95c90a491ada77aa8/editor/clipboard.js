import {parseDocument,serializeDocument} from '../core.js';
import {duplicateNodes,synchronizeConnections} from './connections.js';
import {templateReferences} from '../studio.js';

const PREFIX='BioEditor selection v1\n';

export function selectionFragment(doc,selected) {
  const source=structuredClone(doc);
  synchronizeConnections(source);
  const nodes=source.nodes.filter(n=>selected.has(n.id)||(n.fromNodeId&&selected.has(n.fromNodeId)&&selected.has(n.toNodeId)));
  const ids=new Set(nodes.map(n=>n.id));
  // A partial relationship becomes a free arrow, keeping its visible geometry.
  for(const n of nodes)if(n.fromNodeId&&(!ids.has(n.fromNodeId)||!ids.has(n.toNodeId))){delete n.fromNodeId;delete n.toNodeId;}
  const sourceTemplates=templateReferences(source);
  return {schemaVersion:'0.1',title:'Copied objects',nodes,...(sourceTemplates.length?{sourceTemplates}:{})};
}

export function serializeSelection(doc,selected) {
  const fragment=selectionFragment(doc,selected);
  return fragment.nodes.length?PREFIX+serializeDocument(fragment,true):null;
}

export function parseSelection(raw) {
  if(typeof raw!=='string'||!raw.startsWith(PREFIX))return null;
  return parseDocument(raw.slice(PREFIX.length));
}

export function duplicateSelection(doc,selected) {
  return duplicateNodes(selectionFragment(doc,selected).nodes);
}

export function installClipboard({canHandle,getDoc,getSelected,insert,toast}) {
  let lastPaste=null,pasteCount=0;
  document.addEventListener('copy',event=>{
    if(!canHandle(event)||!event.clipboardData)return;
    try {
      const raw=serializeSelection(getDoc(),getSelected());
      if(!raw)return;
      event.clipboardData.setData('text/plain',raw);
      event.preventDefault();lastPaste=null;pasteCount=0;
      toast('Selection copied');
    }catch(error){event.preventDefault();toast(error.message);}
  });
  document.addEventListener('paste',event=>{
    if(!canHandle(event)||!event.clipboardData)return;
    const raw=event.clipboardData.getData('text/plain');
    try {
      const fragment=parseSelection(raw);
      if(!fragment)return;
      event.preventDefault();
      if(!fragment.nodes.length)return;
      const nextCount=raw===lastPaste?pasteCount+1:1;
      if(insert(duplicateNodes(fragment.nodes,24*nextCount),fragment)){lastPaste=raw;pasteCount=nextCount;}
    }catch(error){event.preventDefault();toast(error.message);}
  });
}

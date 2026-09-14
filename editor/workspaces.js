import {makeTemplate,parseDocument,serializeDocument} from '../core.js';
import {STORAGE_KEY} from './storage.js';

const PREFIX='bioeditor.workspace.';
export function workspaceKey(id) {
  if(id===null||id==='')return STORAGE_KEY;
  if(!/^[a-zA-Z0-9-]{1,100}$/.test(id))throw Error('Invalid workspace address.');
  return PREFIX+id;
}

export function listWorkspaces(storage) {
  const keys=[STORAGE_KEY];
  for(let i=0;i<storage.length;i++){
    const key=storage.key(i);
    if(key.startsWith(PREFIX)&&/^[a-zA-Z0-9-]{1,100}$/.test(key.slice(PREFIX.length)))keys.push(key);
  }
  return keys.flatMap(key=>{
    const raw=storage.getItem(key);if(raw===null)return [];
    const id=key===STORAGE_KEY?'':key.slice(PREFIX.length);
    try {const doc=parseDocument(raw);return [{id,title:doc.title||'Untitled workspace',count:doc.nodes.length}];}
    catch {return [{id,title:'Workspace needing recovery',count:null}];}
  });
}

export function createWorkspace(storage,title) {
  const id=crypto.randomUUID(),key=workspaceKey(id),doc=makeTemplate('blank');
  doc.title=title.trim()||'Untitled workspace';
  // One write creates the workspace; there is no separate index to lose or race.
  storage.setItem(key,serializeDocument(doc));
  return id;
}

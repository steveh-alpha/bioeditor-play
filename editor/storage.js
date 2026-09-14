import {parseDocument,serializeDocument} from '../core.js';

export const STORAGE_KEY='bioeditor.document';
export const BACKUP_KEY='bioeditor.document.backup';
export const RECOVERY_KEY='bioeditor.document.recovery';

// Keep the legacy primary key readable by existing installations. A previous
// valid save survives interrupted writes; damaged or conflicting data is never
// replaced automatically. Storage is injected so failure paths can be tested.
export function createStorage(getStorage,key=STORAGE_KEY) {
  const STORAGE_KEY=key,BACKUP_KEY=key+'.backup',RECOVERY_KEY=key+'.recovery';
  let expected=null,blocked=null;
  function load() {
    try {
      const storage=getStorage();
      expected=storage.getItem(STORAGE_KEY);
      const backup=storage.getItem(BACKUP_KEY);
      blocked=null;
      if(expected!==null) {
        try {return {document:parseDocument(expected),status:'saved'};}
        catch {blocked='recovery';}
      }
      if(backup!==null) {
        try {blocked='recovery';return {document:parseDocument(backup),status:'recovery';}
        catch {blocked='recovery';}
      }
      return {document:null,status:blocked||'new'};
    } catch {return {document:null,status:'unavailable'};}
  }
  function save(doc,{resolve=false}={}) {
    const raw=serializeDocument(doc);
    try {
      const storage=getStorage(),current=storage.getItem(STORAGE_KEY);
      if(current!==expected) blocked='conflict';
      if(blocked&&!resolve) return {status:blocked};
      if(blocked) {
        // Preserve both originals before an explicit recovery decision. If
        // storage is full, abort without altering the originals.
        storage.setItem(RECOVERY_KEY,JSON.stringify({primary:current,backup:storage.getItem(BACKUP_KEY)}));
      }
      if(current!==raw) {
        let valid=false;
        try {if(current!==null){parseDocument(current);valid=true;}} catch {}
        if(valid) storage.setItem(BACKUP_KEY,current);
        storage.setItem(STORAGE_KEY,raw);
      }
      expected=raw;blocked=null;
      return {status:'saved'};
    } catch {return {status:'unavailable'};}
  }
  return {load,save};
}

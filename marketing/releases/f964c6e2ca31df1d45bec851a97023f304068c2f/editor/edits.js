import {advanceRevision} from './revisions.js';
import {serializeDocument} from '../core.js';
import {synchronizeConnections} from './connections.js';
import {invalidateLinkedReviews,dimensions} from '../studio.js';

export function finalizeEdit(before,next) {
  synchronizeConnections(next);
  invalidateLinkedReviews(before,next);
  // A successful edit must remain portable, including its attribution payload.
  serializeDocument(next,true);
  const content=d=>{const {documentId,revision,...rest}=d;return JSON.stringify(rest);};
  if(content(before)===content(next)){
    // Replacing metadata alone is not an edit and cannot forge a revision.
    for(const key of ['documentId','revision']){
      if(before[key]===undefined)delete next[key];else next[key]=before[key];
    }
    return false;
  }
  advanceRevision(before,next);
  serializeDocument(next,true);
  return true;
}

export function centerNode(doc,node) {
  const {width,height}=dimensions(doc);
  const scale=Math.min(1,width*.8/node.w,height*.8/node.h);
  node.w*=scale;node.h*=scale;
  node.x=(width-node.w)/2;node.y=(height-node.h)/2;
  return node;
}

// Optional metadata keeps schema 0.1 files readable. Revision tokens are opaque:
// undo and redo issue fresh tokens, so a delayed result can never become current
// again simply because the researcher restored an earlier visual state.
export function validateRevision(d) {
  const token=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,200}$/.test(value);
  if(d.documentId===undefined&&d.revision===undefined)return;
  if(!token(d.documentId)||!token(d.revision))throw Error('Invalid document identity or revision.');
}

export function identifyDocument(d) {
  validateRevision(d);
  return d.documentId?structuredClone(d):{...structuredClone(d),documentId:crypto.randomUUID(),revision:crypto.randomUUID()};
}

export function advanceRevision(before,next) {
  next.documentId=before.documentId||next.documentId||crypto.randomUUID();
  next.revision=crypto.randomUUID();
  return next;
}

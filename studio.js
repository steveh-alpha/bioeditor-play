// Original BioEditor design and document tools. No external assets or services.
export const STYLES = [
  {id:'fieldnotes', name:'Fieldnotes', description:'Forest ink, mineral blue, and ochre on warm paper.', ink:'#243e3b', background:'#fffcf5', panels:['#eef2e5','#eaf0f4','#f8eddb'], colors:['#548476','#6485a3','#b78a42','#987a9e','#be7371','#58767a']},
  {id:'tidal', name:'Tidal', description:'Deep blue ink with cool, restrained accents.', ink:'#233653', background:'#ffffff', panels:['#edf3fa','#eaf4f3','#f2eef7'], colors:['#527ca7','#4b948b','#8c78a9','#b08b55','#b66d88','#647989']},
  {id:'graphite', name:'Graphite', description:'A neutral palette for figures that use labels to distinguish groups.', ink:'#242424', background:'#ffffff', panels:['#f1f1f1','#e8e8e8','#f7f7f7'], colors:['#555555','#777777','#999999','#444444','#888888','#666666']}
];
export const ARTBOARDS = [
  {name:'Graphical abstract', width:1200, height:760},
  {name:'Presentation · 16:9', width:1600, height:900},
  {name:'Square figure', width:1200, height:1200},
  {name:'Poster · landscape', width:2400, height:1800},
  {name:'Poster · portrait', width:1800, height:2400}
];
export const dimensions = d => ({width:d.width ?? 1200, height:d.height ?? 760});
export function templateReferences(d) {
  const refs=[...(d.sourceTemplates||[])];
  if(d.templateId&&d.templateId!=='blank')refs.push({id:d.templateId,...(d.templateVersion!==undefined?{version:d.templateVersion}:{})});
  return [...new Map(refs.map(ref=>[JSON.stringify([ref.id,ref.version]),ref])).values()];
}
export function validateStudioFields(d) {
  const {width,height}=dimensions(d);
  if (![width,height].every(v=>Number.isInteger(v)&&v>=100&&v<=6000)) throw Error('Artboard dimensions must be whole pixels from 100 to 6000.');
  if (d.background!==undefined&&(typeof d.background!=='string'||!/^#[0-9a-f]{6}$/i.test(d.background))) throw Error('Invalid artboard background.');
  if (d.styleId!==undefined&&!STYLES.some(s=>s.id===d.styleId)) throw Error('Unknown figure style.');
  if (d.templateId!==undefined&&(typeof d.templateId!=='string'||d.templateId.length>200)) throw Error('Invalid template reference.');
  if (d.templateVersion!==undefined&&(typeof d.templateVersion!=='string'||d.templateVersion.length>100)) throw Error('Invalid template version.');
  if(d.sourceTemplates!==undefined&&(!Array.isArray(d.sourceTemplates)||d.sourceTemplates.length>200||d.sourceTemplates.some(ref=>!ref||typeof ref.id!=='string'||!ref.id||ref.id.length>200||(ref.version!==undefined&&(typeof ref.version!=='string'||ref.version.length>100)))))throw Error('Invalid copied template references.');
  if (d.aiProvenance!==undefined&&(!Array.isArray(d.aiProvenance)||d.aiProvenance.length>200)) throw Error('Invalid assistant provenance.');
  if (d.claims===undefined) return;
  if (!Array.isArray(d.claims)||d.claims.length>200) throw Error('A figure can contain up to 200 claims.');
  const ids=new Set();
  for (const c of d.claims) {
    if (!c||typeof c.id!=='string'||!c.id||c.id.length>200||ids.has(c.id)||typeof c.text!=='string'||!c.text.trim()||c.text.length>10000) throw Error('Invalid claim record.');
    ids.add(c.id);
    if (!['author-provided-unverified','draft','author-reviewed'].includes(c.status)) throw Error('Invalid claim review status.');
    for (const key of ['source','reviewedBy']) if(c[key]!==undefined&&(typeof c[key]!=='string'||c[key].length>(key==='source'?3000:200))) throw Error('Invalid claim source or reviewer.');
    if (c.nodeIds!==undefined&&(!Array.isArray(c.nodeIds)||c.nodeIds.length>1500||c.nodeIds.some(id=>typeof id!=='string')||new Set(c.nodeIds).size!==c.nodeIds.length)) throw Error('Invalid claim object links.');
    if (c.status==='author-reviewed'&&(!c.source?.trim()||!c.reviewedBy?.trim())) throw Error('Author review requires a source and reviewer name.');
  }
}
export function applyStyle(d,id) {
  const style=STYLES.find(s=>s.id===id);
  if (!style) throw Error('Unknown figure style.');
  const next=structuredClone(d), colorMap=new Map();
  let panelIndex=0;
  for (const n of next.nodes) {
    if(n.type==='text'||n.type==='arrow') n.color=style.ink;
    else if(n.type==='panel') n.color=style.panels[panelIndex++%style.panels.length];
    else {
      if(!colorMap.has(n.color)) colorMap.set(n.color,style.colors[colorMap.size%style.colors.length]);
      n.color=colorMap.get(n.color);
      if(n.type==='part') n.recolored=true;
    }
  }
  next.styleId=id; next.background=style.background;
  return next;
}
export function resizeArtboard(d,width,height,fit=true) {
  const next=structuredClone(d), old=dimensions(d);
  next.width=width; next.height=height;
  validateStudioFields(next);
  if(fit) {
    const scale=Math.min(width/old.width,height/old.height), dx=(width-old.width*scale)/2, dy=(height-old.height*scale)/2;
    for (const n of next.nodes) {
      n.x=n.x*scale+dx; n.y=n.y*scale+dy; n.w*=scale; n.h*=scale;
      if(n.type==='text') n.fontSize*=scale;
    }
  }
  return next;
}
export function rasterDimensions(d) {
  const {width,height}=dimensions(d);
  // Bound memory for poster exports; do not claim a print DPI without a physical size.
  const scale=Math.min(3,Math.sqrt(24000000/(width*height)),8192/width,8192/height);
  return {width:Math.floor(width*scale),height:Math.floor(height*scale)};
}
export function objectBounds(n) {
  const angle=(n.rotation||0)*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
  const w=n.w*c+n.h*s,h=n.w*s+n.h*c;
  return {x:n.x+n.w/2-w/2,y:n.y+n.h/2-h/2,w,h};
}
export function invalidateLinkedReviews(before,next) {
  const oldNodes=new Map(before.nodes.map(n=>[n.id,JSON.stringify(n)]));
  const newNodes=new Map(next.nodes.map(n=>[n.id,JSON.stringify(n)]));
  for(const claim of next.claims||[]) {
    if(claim.status==='author-reviewed'&&claim.nodeIds?.some(id=>oldNodes.get(id)!==newNodes.get(id))) claim.status='draft';
  }
}
export function preflight(d,attribution) {
  const issues=[],{width,height}=dimensions(d),ids=new Set(d.nodes.map(n=>n.id));
  const add=(code,message,nodeIds=[])=>issues.push({code,message,nodeIds});
  if(!d.nodes.length) add('empty','The figure is empty.');
  const outside=d.nodes.filter(n=>{const b=objectBounds(n);return b.x<-.01||b.y<-.01||b.x+b.w>width+.01||b.y+b.h>height+.01;});
  if(outside.length) add('outside-artboard',`${outside.length} objects extend beyond the artboard. Check for clipped content.`,outside.map(n=>n.id));
  const small=d.nodes.filter(n=>n.type==='text'&&n.fontSize<12);
  if(small.length) add('small-text',`${small.length} labels are below 12 px. Check legibility at the final publication size.`,small.map(n=>n.id));
  const pending=attribution.assets.filter(a=>a.reviewStatus!=='scientifically-reviewed');
  if(pending.length) add('asset-review',`${pending.length} library components await scientific review.`);
  if(attribution.assets.some(a=>!a.creator||!a.source||!a.license||!a.version)) add('asset-rights','Some component rights records are incomplete.');
  if(templateReferences(d).some(ref=>!attribution.templates.some(t=>t.id===ref.id&&(ref.version===undefined||ref.version===t.version)))) add('template-rights','A declared template is unknown. Its artwork rights need review.');
  if(!(d.claims||[]).length) add('no-claims','No claims or sources are recorded. Add them if this figure makes scientific claims.');
  for(const claim of d.claims||[]) {
    if(!claim.source?.trim()) add('missing-source',`A claim has no source: ${claim.text.slice(0,90)}`);
    if(claim.status!=='author-reviewed') add('claim-review',`Author review is pending: ${claim.text.slice(0,90)}`);
    if(claim.nodeIds?.some(id=>!ids.has(id))) add('missing-object',`A claim links to removed objects: ${claim.text.slice(0,90)}`);
  }
  return {issues,notice:'These checks assist author review; they do not certify scientific accuracy, publication compliance, or legal clearance.'};
}
export function attributionText(m) {
  const records=[...m.assets,...m.templates];
  if(!records.length) return 'No known BioEditor library artwork is used. Review the rights to your own contributions separately.';
  return records.map(a=>`${a.name} (v${a.version}) — ${a.creator}. ${a.source}. ${a.license}: ${a.licenseUrl} ${a.modifications}`).join('\n')+'\nThis credit covers the listed artwork, not the complete figure. Scientific review pending.';
}

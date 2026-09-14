// Attached relationships use ordinary editable arrow nodes. Coordinates are
// derived from endpoint objects, so saved connections follow future edits.
export function connectNodes(from,to,style='arrow') {
  return {id:crypto.randomUUID(),type:'arrow',label:style==='inhibition'?'Inhibition':style==='line'?'Association':'Directed relationship',x:0,y:0,w:100,h:20,color:'#243e3b',fromNodeId:from.id,toNodeId:to.id,edgeStyle:style};
}
export function synchronizeConnections(d) {
  const byId=new Map(d.nodes.map(n=>[n.id,n]));
  for(const n of d.nodes) {
    if(!n.fromNodeId)continue;
    const from=byId.get(n.fromNodeId),to=byId.get(n.toNodeId);
    if(!from||!to)continue;
    const a={x:from.x+from.w/2,y:from.y+from.h/2},b={x:to.x+to.w/2,y:to.y+to.h/2};
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
    if(length<1){n.x=a.x;n.y=a.y;n.w=1;n.h=20;n.rotation=0;continue;}
    const reach=(object,vx,vy)=>{
      const angle=-(object.rotation||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
      const lx=vx*c-vy*s,ly=vx*s+vy*c;
      return Math.min(Math.abs(lx)>1e-9?object.w/2/Math.abs(lx):Infinity,Math.abs(ly)>1e-9?object.h/2/Math.abs(ly):Infinity);
    };
    const ux=dx/length,uy=dy/length,ra=reach(from,ux,uy),rb=reach(to,-ux,-uy);
    // When endpoints overlap, use the center span instead of reversing an edge.
    const start=ra+rb+10<length?ra+5:0,end=ra+rb+10<length?rb+5:0;
    const mx=(a.x+ux*start+b.x-ux*end)/2,my=(a.y+uy*start+b.y-uy*end)/2;
    n.w=Math.max(1,length-start-end);n.h=20;n.x=mx-n.w/2;n.y=my-10;n.rotation=Math.atan2(dy,dx)*180/Math.PI;
  }
}
export function validateConnections(d) {
  const byId=new Map(d.nodes.map(n=>[n.id,n]));
  for(const n of d.nodes) {
    if(n.edgeStyle!==undefined&&!['arrow','inhibition','line'].includes(n.edgeStyle))throw Error('Invalid relationship style.');
    if(n.fromNodeId===undefined&&n.toNodeId===undefined)continue;
    if(n.type!=='arrow'||typeof n.fromNodeId!=='string'||typeof n.toNodeId!=='string'||n.fromNodeId===n.toNodeId)throw Error('Invalid relationship endpoints.');
    for(const id of [n.fromNodeId,n.toNodeId])if(!byId.has(id)||byId.get(id).type==='arrow')throw Error('A relationship must connect two existing non-arrow objects.');
  }
}
export function removeNodes(d,ids) {
  d.nodes=d.nodes.filter(n=>!ids.has(n.id)&&!ids.has(n.fromNodeId)&&!ids.has(n.toNodeId));
}
export function duplicateNodes(nodes) {
  const ids=new Map(nodes.map(n=>[n.id,crypto.randomUUID()])),groups=new Map();
  return nodes.map(n=>{
    const copy=structuredClone(n);copy.id=ids.get(n.id);copy.x+=24;copy.y+=24;
    if(n.group){if(!groups.has(n.group))groups.set(n.group,crypto.randomUUID());copy.group=groups.get(n.group);}
    if(n.fromNodeId){copy.fromNodeId=ids.get(n.fromNodeId)||n.fromNodeId;copy.toNodeId=ids.get(n.toNodeId)||n.toNodeId;}
    return copy;
  });
}

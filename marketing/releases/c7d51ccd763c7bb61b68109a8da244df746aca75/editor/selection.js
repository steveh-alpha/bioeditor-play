export function selectionBox(start,end){
 return {x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),w:Math.abs(end.x-start.x),h:Math.abs(end.y-start.y)};
}

// Use rotated corners so the entire object must fit inside the marquee.
export function enclosedSelection(nodes,box,initial=[]){
 const selected=new Set(initial),groups=new Set();
 for(const n of nodes){
  const angle=(n.rotation||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const inside=[[-n.w/2,-n.h/2],[n.w/2,-n.h/2],[n.w/2,n.h/2],[-n.w/2,n.h/2]].every(([x,y])=>{
   const px=n.x+n.w/2+x*c-y*s,py=n.y+n.h/2+x*s+y*c;
   return px>=box.x&&px<=box.x+box.w&&py>=box.y&&py<=box.y+box.h;
  });
  if(inside){selected.add(n.id);if(n.group)groups.add(n.group);}
 }
 for(const n of nodes)if(n.group&&groups.has(n.group))selected.add(n.id);
 return selected;
}

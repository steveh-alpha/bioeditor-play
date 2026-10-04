import {dimensions,objectBounds} from '../studio.js';

// Panels are the page's background layer in both the editor and exported art.
// Keep the order within each layer so Front and Back still work there.
export function drawOrder(nodes) {
  return [...nodes.filter(node=>node.type==='panel'),...nodes.filter(node=>node.type!=='panel')];
}

const union=boxes=>({
  x:Math.min(...boxes.map(box=>box.x)),
  y:Math.min(...boxes.map(box=>box.y)),
  right:Math.max(...boxes.map(box=>box.x+box.w)),
  bottom:Math.max(...boxes.map(box=>box.y+box.h))
});

function units(nodes,selectedIds) {
  const selected=new Set(selectedIds),byGroup=new Map();
  for(const node of nodes){
    if(!selected.has(node.id)||node.fromNodeId)continue;
    const key=node.group?`group:${node.group}`:`node:${node.id}`;
    if(!byGroup.has(key))byGroup.set(key,[]);
    byGroup.get(key).push(node);
  }
  return [...byGroup.values()].map(members=>{
    const box=union(members.map(objectBounds));
    return {members,x:box.x,y:box.y,w:box.right-box.x,h:box.bottom-box.y};
  });
}

export const alignmentUnitCount=(nodes,selectedIds)=>units(nodes,selectedIds).length;

export function arrangeSelection(document,selectedIds,action) {
  const items=units(document.nodes,selectedIds),page=dimensions(document);
  if(!items.length)return false;
  const box=union(items),move=(item,dx,dy)=>item.members.forEach(node=>{node.x+=dx;node.y+=dy;});
  const positions={
    left:item=>[box.x-item.x,0],
    'center-h':item=>[(box.x+box.right-item.w)/2-item.x,0],
    right:item=>[box.right-item.x-item.w,0],
    top:item=>[0,box.y-item.y],
    'center-v':item=>[0,(box.y+box.bottom-item.h)/2-item.y],
    bottom:item=>[0,box.bottom-item.y-item.h]
  };
  if(action==='page-center-h'||action==='page-center-v'){
    const dx=action==='page-center-h'?(page.width-box.right-box.x)/2:0;
    const dy=action==='page-center-v'?(page.height-box.bottom-box.y)/2:0;
    items.forEach(item=>move(item,dx,dy));
    return !!(dx||dy);
  }
  if(action==='space-h'||action==='space-v'){
    if(items.length<3)return false;
    const horizontal=action==='space-h',axis=horizontal?'x':'y',size=horizontal?'w':'h';
    const sorted=[...items].sort((a,b)=>a[axis]-b[axis]);
    const end=sorted.at(-1)[axis]+sorted.at(-1)[size];
    const gap=(end-sorted[0][axis]-sorted.reduce((sum,item)=>sum+item[size],0))/(sorted.length-1);
    let cursor=sorted[0][axis]+sorted[0][size]+gap;
    for(const item of sorted.slice(1,-1)){
      const delta=cursor-item[axis];move(item,horizontal?delta:0,horizontal?0:delta);
      cursor+=item[size]+gap;
    }
    return true;
  }
  if(!Object.hasOwn(positions,action))throw Error('Unknown alignment action.');
  if(items.length<2)return false;
  items.forEach(item=>move(item,...positions[action](item)));
  return true;
}

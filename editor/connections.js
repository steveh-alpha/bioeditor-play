//{ATTACHED RELATIONSHIPS}
export function connectNodes(from,to,style='arrow') {
  return {id:crypto.randomUUID(),type:'arrow',label:style==='inhibition'?'Inhibition':style==='line'?'Association':'Directed relationship',x:0,y:0,w:100,h:20,color:'#243e3b',fromNodeId:from.id,toNodeId:to.id,edgeStyle:style};
}

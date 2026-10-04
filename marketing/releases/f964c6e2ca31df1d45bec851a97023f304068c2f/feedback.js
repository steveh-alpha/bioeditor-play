export function validateFeedback(input) {
  const text=(value,max)=>typeof value==='string'&&value.trim().length>0&&value.length<=max;
  const d=input?.diagnostics,v=d?.viewport;
  if(!text(input?.task,3000)||!text(input?.result,5000)||!['Yes','Partly','No'].includes(input?.completed)||
    !v||!Number.isInteger(v.width)||v.width<1||v.width>100000||!Number.isInteger(v.height)||v.height<1||v.height>100000||
    !Number.isInteger(d.objectCount)||d.objectCount<0||d.objectCount>100000||
    !['saved','new','unavailable','recovery','conflict'].includes(d.saveStatus))throw Error('Invalid feedback');
  return {product:'BioEditor free preview',task:input.task.trim(),result:input.result.trim(),completed:input.completed,
    diagnostics:{viewport:{width:v.width,height:v.height},objectCount:d.objectCount,saveStatus:d.saveStatus}};
}


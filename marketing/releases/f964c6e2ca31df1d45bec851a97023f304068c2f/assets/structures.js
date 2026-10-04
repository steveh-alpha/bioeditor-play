import {escapeXML} from '../svg.js';

export const STRUCTURE_DEFINITIONS = [
  {id:'lipid-bilayer',name:'Lipid bilayer',description:'Two opposing lipid leaflets with adjustable repetition and curvature.',defaults:{count:18,bend:0},fields:[{key:'count',label:'Lipid pairs',min:4,max:36},{key:'bend',label:'Bend',min:-25,max:25}]},
  {id:'dna-helix',name:'DNA segment',description:'An adjustable schematic helix with connected base-pair rungs.',defaults:{turns:3,bases:24},fields:[{key:'turns',label:'Helical turns',min:1,max:8},{key:'bases',label:'Schematic rungs',min:6,max:40}]},
  {id:'cell-layer',name:'Cell layer',description:'A repeated epithelial-style layer with editable rows and cell count.',defaults:{count:6,rows:1},fields:[{key:'count',label:'Cells per row',min:2,max:16},{key:'rows',label:'Rows',min:1,max:3}]}
];
export const STRUCTURE_ASSETS=STRUCTURE_DEFINITIONS.map(s=>({id:s.id,name:s.name,kind:s.id,category:'Structures',tags:`configurable ${s.id==='lipid-bilayer'?'membrane phospholipid':s.id==='dna-helix'?'genetics nucleic acid double helix':'tissue epithelium epithelial'}`,color:'#548476',parametric:true,version:'0.2.0',creator:'BioEditor project',license:'CC-BY-4.0',source:'BioEditor original structure generators v0.2',reviewStatus:'scientific-review-pending',limitations:'Schematic geometry and counts, not molecular-scale measurements.'}));
export function structureParameters(kind,parameters) {
  const definition=STRUCTURE_DEFINITIONS.find(s=>s.id===kind);
  if(!definition) {if(parameters!==undefined)throw Error('This component has no configurable structure.');return undefined;}
  if(parameters===undefined)return {...definition.defaults};
  if(!parameters||typeof parameters!=='object'||Array.isArray(parameters)||Object.keys(parameters).some(k=>!definition.fields.some(f=>f.key===k)))throw Error('Invalid structure parameters.');
  const next={...definition.defaults,...parameters};
  for(const f of definition.fields)if(!Number.isInteger(next[f.key])||next[f.key]<f.min||next[f.key]>f.max)throw Error(`${f.label} must be a whole number from ${f.min} to ${f.max}.`);
  return next;
}
export function structureGlyph(kind,color,parameters,aspect=1) {
  if(!STRUCTURE_DEFINITIONS.some(s=>s.id===kind))return null;
  if(!Number.isFinite(aspect)||aspect<=0||aspect>100000)throw Error('Invalid structure aspect ratio.');
  const p=structureParameters(kind,parameters),c=escapeXML(color),w=100*aspect;
  // Local geometry uses the rendered aspect ratio so extending a structure
  // repeats/redistributes its features rather than stretching circles into ovals.
  const margin=Math.min(12,w*.08),usable=w-2*margin;
  let body='';
  if(kind==='lipid-bilayer') {
    const step=usable/p.count,r=Math.min(4.5,step*.27);
    body=Array.from({length:p.count},(_,i)=>{
      const u=(i+.5)/p.count,x=margin+u*usable,y=50+p.bend*(4*(u-.5)**2-1),angle=Math.atan(8*p.bend*(u-.5)/usable)*180/Math.PI;
      return `<g transform="translate(${x} ${y}) rotate(${angle})">${[-1,1].map(side=>`<circle cx="0" cy="${side*16}" r="${r}" fill="${c}"/><path d="M${-r*.5} ${side*(16-r)}L${-r*.8} ${side*7} ${-r*.3} ${side*2}M${r*.5} ${side*(16-r)}L${r*.8} ${side*7} ${r*.3} ${side*2}" stroke="${c}" stroke-width="${Math.max(.3,r*.5)}" fill="none"/>`).join('')}</g>`;
    }).join('');
  }
  if(kind==='dna-helix') {
    const point=(u,side)=>[margin+u*usable,50+side*20*Math.cos(2*Math.PI*p.turns*u)];
    const path=side=>Array.from({length:p.turns*32+1},(_,i)=>`${i?'L':'M'}${point(i/(p.turns*32),side).join(' ')}`).join(' ');
    body=`<g fill="none" stroke="${c}" stroke-linecap="round"><g opacity=".5" stroke-width="2">${Array.from({length:p.bases},(_,i)=>{const u=(i+.5)/p.bases;return `<path d="M${point(u,-1).join(' ')}L${point(u,1).join(' ')}"/>`;}).join('')}</g><path d="${path(-1)}" stroke-width="3"/><path d="${path(1)}" stroke-width="3" opacity=".75"/></g>`;
  }
  if(kind==='cell-layer') {
    const gap=Math.min(4,usable/(p.count*5)),cw=(usable-gap*(p.count-1))/p.count,ch=(78-6*(p.rows-1))/p.rows;
    body=Array.from({length:p.rows*p.count},(_,i)=>{const x=margin+(i%p.count)*(cw+gap),y=8+Math.floor(i/p.count)*(ch+6);return `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="${Math.min(cw*.2,8)}" fill="${c}" fill-opacity=".15" stroke="${c}" stroke-width="1.5"/><ellipse cx="${x+cw/2}" cy="${y+ch*.65}" rx="${Math.min(cw*.23,9)}" ry="${ch*.16}" fill="${c}" fill-opacity=".7"/>`;}).join('')+`<path d="M${margin} 92H${w-margin}" stroke="${c}" stroke-width="2" fill="none"/>`;
  }
  return `<g transform="scale(${1/aspect} 1)">${body}</g>`;
}

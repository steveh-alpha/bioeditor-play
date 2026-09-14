import {illustrationPalette} from './technical.js';

export const ANTIBODY_VERSION='0.3.1';
// Original conventional IgG schematic. Biological reference (text only):
// Vidarsson et al., Front Immunol. 2014;5:520. doi:10.3389/fimmu.2014.00520.
// Two heavy chains (VH, CH1, CH2, CH3), two light chains (VL, CL).
// Deliberately omits glycans, intradomain bonds, and subclass-specific detail.
export function antibodyGeometry() {
  const chains=[],bonds=[],angle=38*Math.PI/180;
  for(const side of [-1,1]) {
    const name=side<0?'left':'right',hx=50+side*4;
    const arm=(t,offset=0)=>({x:hx+side*(Math.sin(angle)*t+Math.cos(angle)*offset),y:54-Math.cos(angle)*t+Math.sin(angle)*offset});
    const fc=y=>({x:50+side*6,y});
    chains.push({id:`heavy-${name}`,type:'heavy',
      points:[arm(34),arm(14),arm(0),fc(63),fc(69),fc(87)],
      domains:[{name:'VH',...arm(34),angle:side*38},{name:'CH1',...arm(14),angle:side*38},{name:'CH2',...fc(69),angle:0},{name:'CH3',...fc(87),angle:0}]});
    chains.push({id:`light-${name}`,type:'light',
      points:[arm(34,11),arm(14,11)],
      domains:[{name:'VL',...arm(34,11),angle:side*38},{name:'CL',...arm(14,11),angle:side*38}]});
    // Covalent H–L link near the base of each Fab arm; two hinge links H–H.
    bonds.push({type:'heavy-light',from:arm(9),to:arm(9,11)});
  }
  for(const y of [55.5,58]) {
    const inset=4+(y-54)*2/9;
    bonds.push({type:'hinge',from:{x:50-inset,y},to:{x:50+inset,y}});
  }
  return {chains,bonds};
}

export function antibodyGlyph(color) {
  const {ink,fill,accent,detail}=illustrationPalette(color),{chains,bonds}=antibodyGeometry();
  const num=n=>Number(n.toFixed(4)),p=point=>`${num(point.x)} ${num(point.y)}`;
  const stroke=(d,c,w,extra='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  // Continuous backbones run underneath all twelve domains. Gaps between folded
  // domains and the hinge are peptide linkers, never detached floating capsules.
  const backbones=chains.map(chain=>{
    const d=chain.points.map((pt,i)=>`${i?'L':'M'}${p(pt)}`).join(' ');
    return `<g data-chain="${chain.id}">${stroke(d,ink,2.8,'data-backbone="outline"')}${stroke(d,chain.type==='heavy'?accent:fill,1.25,'data-backbone="chain"')}</g>`;
  }).join('');
  const links=bonds.map(b=>stroke(`M${p(b.from)}L${p(b.to)}`,detail,1.1,`data-bond="${b.type}"`)).join('');
  const domains=chains.map(chain=>`<g data-chain="${chain.id}">${chain.domains.map(d=>`<ellipse data-domain="${d.name}" cx="${num(d.x)}" cy="${num(d.y)}" rx="5" ry="8.5" transform="rotate(${d.angle} ${p(d)})" fill="${chain.type==='heavy'?accent:fill}" stroke="${ink}" stroke-width="1.05"/>`).join('')}</g>`).join('');
  return backbones+links+domains;
}

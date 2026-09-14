import {illustrationPalette} from './technical.js';

export const DNA_VERSION='0.3.3';
export const DNA_PREVIOUS_VERSION='0.3.2';

// Independently authored, depth-ordered double-helix schematic. The projection
// is illustrative, not an atomic model or a sequence-specific representation.
const start=-Math.PI/2, sweep=3*Math.PI;
const num=n=>Number(n.toFixed(4));
const point=(side,t,radius)=>({x:50+side*radius*Math.sin(start+sweep*t),y:8+84*t});
const derivative=(side,t,radius)=>({x:side*radius*sweep*Math.cos(start+sweep*t),y:84});
const xy=p=>`${num(p.x)} ${num(p.y)}`;

// Cubic segments share exact endpoints and tangents, including at crossings.
function backbone(side,radius,from=0,to=1) {
  const steps=Math.ceil((to-from)*28),dt=(to-from)/steps;
  let d=`M${xy(point(side,from,radius))}`;
  for(let i=0;i<steps;i++) {
    const a=from+i*dt,b=from+(i+1)*dt,p=point(side,a,radius),q=point(side,b,radius);
    const u=derivative(side,a,radius),v=derivative(side,b,radius);
    d+=`C${xy({x:p.x+u.x*dt/3,y:p.y+u.y*dt/3})} ${xy({x:q.x-v.x*dt/3,y:q.y-v.y*dt/3})} ${xy(q)}`;
  }
  return d;
}

export function dnaGeometry(version=DNA_VERSION) {
  if(![DNA_VERSION,DNA_PREVIOUS_VERSION].includes(version))throw Error('Unsupported DNA artwork revision.');
  const radius=version===DNA_PREVIOUS_VERSION?23:19.5;
  const strands=[-1,1].map(side=>({side,path:backbone(side,radius)}));
  // Boundaries at the silhouette extrema keep seams away from crossings.
  const front=Array.from({length:3},(_,i)=>{
    const from=i/3,to=(i+1)/3,side=i%2?-1:1;
    return {side,path:backbone(side,radius,from,to)};
  });
  const bases=Array.from({length:18},(_,i)=>{
    const t=(i+.5)/18,a=point(-1,t,radius),b=point(1,t,radius);
    return {a,b,center:{x:50,y:a.y}};
  });
  return {strands,front,bases};
}

export function dnaGlyph(color,version=DNA_VERSION) {
  const p=illustrationPalette(color),{strands,front,bases}=dnaGeometry(version);
  const previous=version===DNA_PREVIOUS_VERSION;
  const stroke=(d,color,width,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const ribbon=({side,path},foreground=false)=>{
    const fill=side===1?p.accent:p.mid;
    return `<g data-strand="${side===1?'a':'b'}" data-depth="${foreground?'front':'back'}">${stroke(path,p.ink,previous?5.4:4.6)}${stroke(path,fill,previous?4.3:3.6)}${previous?stroke(path,side===1?p.mid:p.fill,.8):''}</g>`;
  };
  // Paired half-rungs use two related tones, with a small visible center seam.
  // The narrowest rungs are naturally occluded by the front backbone.
  const pairs=bases.map(({a,b,center},i)=>{
    const direction=Math.sign(b.x-a.x);
    return `<g data-base-pair="${i}">${stroke(`M${xy(a)}L${xy(b)}`,p.detail,2.15)}${stroke(`M${xy(a)}L${xy({...center,x:50-direction*.3})}`,p.mid,1.45)}${stroke(`M${xy({...center,x:50+direction*.3})}L${xy(b)}`,p.fill,1.45)}</g>`;
  }).join('');
  return strands.map(s=>ribbon(s)).join('')+pairs+front.map(s=>ribbon(s,true)).join('');
}

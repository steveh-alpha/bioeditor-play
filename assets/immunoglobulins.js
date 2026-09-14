import {illustrationPalette} from './technical.js';

export const IMMUNOGLOBULIN_VERSION='0.4.0';
export const ANTIBODY_REFERENCES=[
  {title:'IMGT: Human and mouse IG classes and subclasses',url:'https://www.imgt.org/IMGTeducation/Tutorials/index.php?article=IGandBcells&chapter=Properties&lang=UK&nbr=Tableau2'},
  {title:'IgG subclasses and allotypes: from structure to effector functions',url:'https://doi.org/10.3389/fimmu.2014.00520'},
  {title:'The need for IgG2c specific antiserum when isotyping antibodies from C57BL/6 and NOD mice',url:'https://pubmed.ncbi.nlm.nih.gov/9672206/'},
  {title:'The structures of secretory and dimeric immunoglobulin A',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7707832/'},
  {title:'High-resolution structures of the IgM Fc domains reveal principles of its hexamer formation',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC3690842/'},
  {title:'Molecular characterization of immunoglobulin D in mammals',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC1782270/'}
].map(r=>({...r,role:'Biological reference text; no artwork reused'}));

const definitions=[];
function add(species,subclass,form='monomer',note='') {
  const isotype=subclass.slice(0,3),id=`${species}-${subclass.toLowerCase()}${form==='monomer'?'':`-${form}`}`;
  const speciesName=species==='human'?'Human':'Mouse';
  const formName={monomer:'',dimer:' dimer',secretory:' secretory dimer',pentamer:' pentamer',hexamer:' hexamer',membrane:' membrane monomer'}[form];
  definitions.push({id,name:`${speciesName} ${subclass}${formName}`,species,isotype,subclass,form,note,
    heavyDomains:isotype==='IgM'||isotype==='IgE'?['VH','CH1','CH2','CH3','CH4']:isotype==='IgD'&&species==='mouse'?['VH','CH1','CH3']:['VH','CH1','CH2','CH3'],
    hinge:!(isotype==='IgM'||isotype==='IgE'),extendedHinge:species==='human'&&['IgG3','IgA1','IgD'].includes(subclass),
    units:form==='pentamer'?5:form==='hexamer'?6:['dimer','secretory'].includes(form)?2:1,
    jChain:['dimer','secretory','pentamer'].includes(form),secretoryComponent:form==='secretory'});
}
for(const species of ['human','mouse']) {
  for(const subclass of species==='human'?['IgG1','IgG2','IgG3','IgG4']:['IgG1','IgG2a','IgG2b','IgG2c','IgG3']) {
    add(species,subclass,'monomer',species==='mouse'?subclass==='IgG2a'?'IgG2a: e.g. BALB/c; check strain.':subclass==='IgG2c'?'IgG2c: e.g. C57BL/6; check strain.':'Mouse and human subclass names do not imply equivalent function.':subclass==='IgG3'?'Extended hinge; length varies by allotype.':'Subclass identity is labeled; sequence and effector activity are not encoded.');
  }
  for(const subclass of species==='human'?['IgA1','IgA2']:['IgA'])for(const form of ['monomer','dimer','secretory']) {
    add(species,subclass,form,`${species==='mouse'?'One IgA class without named subclasses.':subclass==='IgA1'?'Longer hinge than IgA2.':'Shorter hinge than IgA1; allotype-specific bonding is omitted.'} ${form==='monomer'?'One H2L2 unit.':form==='dimer'?'Two units + J chain.':'Two units + J chain + secretory component.'}`);
  }
  add(species,'IgM','membrane','Monomeric membrane IgM; membrane anchor shown, CD79 signaling partners omitted.');
  add(species,'IgM','pentamer','Five H2L2 units + one J chain; ten potential binding sites.');
  add(species,'IgM','hexamer','Six H2L2 units; no J chain in this assembly.');
  add(species,'IgD','monomer',species==='mouse'?'Mouse delta chain lacks CH2: VH–CH1–hinge–CH3. Anchor omitted.':'Human delta chain: VH–CH1–hinge–CH2–CH3. Anchor omitted.');
  add(species,'IgE','monomer','Four constant domains per heavy chain; no conventional hinge. Extended schematic, not the bent solution conformation.');
}
for(const [id,name,form,note] of [
  ['antibody-fab','Fab fragment','fab','One binding arm: VH/CH1 + VL/CL; no Fc.'],
  ['antibody-fab2',"F(ab′)2 fragment",'fab2','Two binding arms connected through the hinge; no Fc.'],
  ['antibody-fc','IgG Fc fragment','fc','Paired CH2/CH3 constant domains; no variable antigen-binding domains.'],
  ['antibody-scfv','scFv fragment','scfv','VH and VL joined by an engineered peptide linker; one polypeptide, no Fc.']
])definitions.push({id,name,form,note,species:'generic',isotype:'fragment',subclass:'',units:1,jChain:false,secretoryComponent:false,heavyDomains:[],hinge:false});

export const IMMUNOGLOBULIN_ASSETS=definitions.map(d=>({...d,kind:d.id,category:'Antibodies',version:IMMUNOGLOBULIN_VERSION,
  color:d.species==='mouse'?'#ad88b0':'#598fa5',
  tags:`antibody antibodies immunoglobulin immunology ${d.species==='mouse'?'murine mus musculus':d.species==='human'?'homo sapiens human':''} ${d.subclass} ${d.isotype} ${d.form} ${d.jChain?'J chain polymeric':''} ${d.secretoryComponent?'sIgA secretory component mucosal':''} ${d.form==='fab2'?"F(ab')2 bivalent":''} ${d.form==='membrane'?'BCR surface monomer':''} ${d.note}`,
  description:d.note,creator:'BioEditor project',license:'CC-BY-4.0',source:'BioEditor original antibody diagrams v0.4.0',
  creationMethod:'Independently authored procedural SVG',reviewStatus:'scientific-review-pending',references:ANTIBODY_REFERENCES,
  limitations:`${d.note} Conceptual domain topology, not to scale. Colors identify chains, not species or function. Glycans, exact disulfide maps, sequences, light-chain kappa/lambda differences and allotypes are omitted. Assembly links are schematic associations. Independent scientific review pending.`}));

const number=n=>Number(n.toFixed(4));
const point=p=>`${number(p.x)} ${number(p.y)}`;
// Independent topology for the new pack; the existing antibody revisions remain frozen.
export function immunoglobulinGeometry(id) {
  const def=definitions.find(d=>d.id===id);
  if(!def)throw Error('Unknown antibody diagram');
  const chains=[],root=def.extendedHinge?40:48,angle=38*Math.PI/180;
  for(const side of [-1,1]) {
    const arm=t=>({x:50+side*(5+Math.sin(angle)*t),y:root-Math.cos(angle)*t});
    const outer=t=>{const p=arm(t);return {x:p.x+side*9*Math.cos(angle),y:p.y+9*Math.sin(angle)};};
    const heavy=[{name:'VH',...arm(28),angle:side*38},{name:'CH1',...arm(11),angle:side*38}];
    const constant=def.heavyDomains.slice(2),ys=constant.length===3?[55,70,85]:constant.length===1?[72]:[67,85];
    heavy.push(...constant.map((name,i)=>({name,x:50+side*5,y:ys[i],angle:0})));
    const light=[{name:'VL',...outer(28),angle:side*38},{name:'CL',...outer(11),angle:side*38}];
    chains.push({id:`heavy-${side<0?'left':'right'}`,type:'heavy',domains:heavy,points:[...heavy.slice(0,2),arm(0),...heavy.slice(2)]});
    chains.push({id:`light-${side<0?'left':'right'}`,type:'light',domains:light,points:light});
  }
  return {definition:def,chains};
}

export function immunoglobulinGlyph(id,color) {
  const def=definitions.find(d=>d.id===id);
  if(!def)return null;
  const {ink,fill,accent,detail}=illustrationPalette(color);
  const line=(d,w=1.3,c=ink,attrs='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
  const ellipse=(d,type)=>`<ellipse data-domain="${d.name}" cx="${number(d.x)}" cy="${number(d.y)}" rx="4" ry="6.4" transform="rotate(${d.angle} ${point(d)})" fill="${type==='heavy'?accent:fill}" stroke="${ink}" stroke-width=".9"/>`;
  const renderChains=chains=>chains.map(c=>`<g data-chain="${c.id}">${line(c.points.map((p,i)=>`${i?'L':'M'}${point(p)}`).join(' '),2.5,ink,'data-backbone="outline"')}${line(c.points.map((p,i)=>`${i?'L':'M'}${point(p)}`).join(' '),1.2,c.type==='heavy'?accent:fill,'data-backbone="chain"')}${c.domains.map(d=>ellipse(d,c.type)).join('')}</g>`).join('');
  if(def.form==='scfv')return `<g data-fragment="scfv" data-chain="single" transform="translate(-30 -20) scale(1.6)">${line('M45 39L45 49C35 71 73 66 63 39Q60 25 55 33L55 39',2,accent,'data-link="peptide-linker"')}${ellipse({name:'VH',x:45,y:39,angle:0},'heavy')}${ellipse({name:'VL',x:55,y:39,angle:0},'light')}</g>`;
  if(['fab','fab2','fc'].includes(def.form)) {
    let {chains}=immunoglobulinGeometry('human-igg1');
    chains=chains.filter(c=>def.form==='fc'?c.type==='heavy':def.form==='fab'?c.id.endsWith('left'):true).map(c=>{
      const domains=def.form==='fc'?c.domains.slice(2):c.domains.slice(0,2);
      return {...c,domains,points:def.form==='fab2'&&c.type==='heavy'?[...domains,...c.points.slice(2,3),{x:c.points[2].x,y:53}]:domains};
    });
    const transform=def.form==='fab'?'translate(5 -10) scale(1.35)':def.form==='fc'?'translate(-20 -60) scale(1.4)':'translate(0 12)';
    return `<g data-fragment="${def.form}" transform="${transform}">${renderChains(chains)}${def.form==='fab2'?line('M45 50H55M45 53H55',1,detail,'data-link="hinge-association"'):''}</g>`;
  }
  const {chains}=immunoglobulinGeometry(id);
  const monomer=renderChains(chains);
  const jChain=(x,y)=>`<g data-chain="joining">${line(`M${x-5} ${y}Q${x} ${y-6} ${x+5} ${y}`,3,detail,'data-accessory="J-chain"')}</g>`;
  if(def.units===2) {
    return `<g data-assembly="${def.form}">${line('M44 50H56',1.2,detail,'data-link="tailpiece-association"')}<g data-unit="1" transform="translate(44 50) rotate(-90) scale(.48) translate(-50 -88)">${monomer}</g><g data-unit="2" transform="translate(56 50) rotate(90) scale(.48) translate(-50 -88)">${monomer}</g>${jChain(50,50)}${def.secretoryComponent?line('M40 49C33 70 67 70 60 49',4,fill,'data-accessory="secretory-component"')+line('M40 49C33 70 67 70 60 49',.8,ink):''}</g>`;
  }
  if(def.units>2) {
    // A pentamer occupies five of six radial positions; the gap carries J chain.
    const angles=Array.from({length:def.units},(_,i)=>i*60),ends=angles.map(a=>({x:50+10*Math.sin(a*Math.PI/180),y:50-10*Math.cos(a*Math.PI/180)}));
    const links=line(ends.map((p,i)=>`${i?'L':'M'}${point(p)}`).join(' ')+(def.jChain?'':'Z'),1.2,detail,'data-link="tailpiece-association"');
    return `<g data-assembly="${def.form}">${links}${angles.map((a,i)=>`<g data-unit="${i+1}" transform="translate(${point(ends[i])}) rotate(${a}) scale(.42) translate(-50 -88)">${monomer}</g>`).join('')}${def.jChain?line(`M${point(ends.at(-1))}Q30 37 ${point(ends[0])}`,2.5,detail,'data-accessory="J-chain"'):''}</g>`;
  }
  const membrane=def.form==='membrane'?line('M29 94H71M29 97H71',.8,detail,'data-accessory="membrane"')+line('M45 85V98M55 85V98',1.5,accent,'data-link="membrane-anchor"'):'';
  return `<g data-assembly="${def.form}" data-unit="1">${membrane}${monomer}</g>`;
}

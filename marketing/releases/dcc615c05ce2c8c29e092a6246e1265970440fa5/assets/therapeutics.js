import {illustrationPalette,technicalGlyph,technicalFinish} from './technical.js';
import {antibodyGeometry} from './antibody.js';
import {escapeXML} from '../svg.js';

// New, independently versioned topology. Part order is a persisted document API.
export const THERAPEUTICS_VERSION='0.5.0';
export const THERAPEUTICS_REFERENCES={
  antibody:[{title:'IgG subclasses and allotypes: from structure to effector functions',url:'https://doi.org/10.3389/fimmu.2014.00520'}],
  engager:[{title:'Role of naive and memory T cells in tumor cell lysis mediated by bi-specific antibodies',url:'https://pubmed.ncbi.nlm.nih.gov/9241536/'}],
  adc:[{title:'SLC46A3 Is Required to Transport Catabolites of Noncleavable Antibody Maytansine Conjugates from the Lysosome to the Cytoplasm',url:'https://pubmed.ncbi.nlm.nih.gov/26631267/'}],
  car:[{title:'CAR T cells produced in vivo to treat cardiac injury (mouse fibrosis study; delivery principle)',url:'https://doi.org/10.1126/science.abm0594'},{title:'A targeting lentiviral vector for generation of CAR-T cells in vivo',url:'https://www.nature.com/articles/s41598-025-17342-1'}],
  riptac:[{title:'Regulated induced proximity targeting chimeras: a heterobifunctional small molecule strategy for cancer selective therapies',url:'https://pubmed.ncbi.nlm.nih.gov/39116881/'}]
};
const definitions=[
 ['format-igg','Modular IgG','Antibody formats','IgG heavy light chains antibody','Four independently recolorable chains with a separate hinge.'],
 ['format-fab','Modular Fab','Antibody formats','Fab antibody fragment','VH/CH1 and VL/CL; no Fc.'],
 ['format-fab2','Modular F(ab′)₂','Antibody formats',"F(ab')2 F(ab′)₂ antibody fragment",'Two Fab arms joined at the hinge; no Fc.'],
 ['format-fc','Modular Fc','Antibody formats','Fc antibody fragment','Paired IgG CH2/CH3 domains.'],
 ['format-hinge','Antibody hinge','Antibody formats','hinge antibody peptide','Flexible heavy-chain hinge with schematic interchain bonds.'],
 ['format-scfv','scFv · VL–linker–VH','Antibody formats','scFv antibody single chain variable fragment','VL and VH joined by a flexible peptide linker; order shown is one design option.'],
 ['format-vhh','VHH / nanobody','Antibody formats','VHH nanobody single domain antibody','Single variable heavy domain; no light chain.'],
 ['flexible-linker','Peptide / flexible linker','Antibody formats','peptide flexible linker scFv','Sequence-free flexible linker.'],
 ['bispecific-igg','Bispecific IgG-like','Engagers','bispecific multispecific antibody engager','Two arm colors indicate distinct antigen specificities; chain-pairing engineering omitted.'],
 ['bite','BiTE · CD3 × tumor','Engagers','BiTE bispecific engager immune synapse','Two linked scFv modules; anti-CD3 and anti-tumor specificity.'],
 ['bike','BiKE · CD16 × tumor','Engagers','BiKE bispecific NK engager','Two linked binding modules; anti-CD16 and anti-tumor specificity.'],
 ['adc','ADC · linker–payload','ADC','ADC antibody drug conjugate linker payload','IgG with illustrative conjugates; attachment sites and drug chemistry are schematic.'],
 ['bsadc','BsADC · dual specificity','ADC','BsADC bispecific ADC antibody linker payload','IgG-like dual-specificity conjugate; no specific drug implied.'],
 ['adc-cleavable','Cleavable linker–payload','ADC','ADC cleavable linker payload','Break mark indicates a cleavable linker; trigger depends on chemistry.'],
 ['adc-noncleavable','Non-cleavable linker–payload','ADC','ADC non-cleavable noncleavable linker payload','Intact linker; antibody catabolism yields an active linker-bearing catabolite.'],
 ['payload-warhead','Payload warhead','ADC','ADC payload warhead cytotoxic','Generic polygon; does not encode chemical structure or a particular payload class.'],
 ['payload-catabolite','Linker-bearing payload catabolite','ADC','ADC noncleavable catabolite lysosome','Residual linker and amino-acid cue attached to payload after antibody proteolysis.'],
 ...[2,4,8].map(n=>[`dar-${n}`,`DAR ${n} marker`,'ADC',`ADC DAR ${n} drug antibody ratio`,`Illustrative drug-to-antibody ratio ${n}; does not establish a measured distribution.`]),
 ['early-endosome','Early endosome','ADC','ADC trafficking early endosome internalize','Single membrane compartment; sorting machinery omitted.'],
 ['late-endosome','Late endosome','ADC','ADC trafficking late endosome multivesicular','Intraluminal vesicles indicate a schematic maturing compartment.'],
 ['fcrn','FcRn receptor','ADC','FcRn neonatal Fc receptor recycling','Schematic Fc-binding receptor; pH dependence and beta-2 microglobulin detail omitted.'],
 ['recycling-arrow','Recycling arrow','ADC','FcRn recycling trafficking arrow','Return route cue; not all antibodies follow this route.'],
 ['immune-cleft','Immune synapse cleft','Engagers','immune synapse cleft T cell tumor CAR-T','Two opposing membranes; spacing and molecular segregation are schematic.'],
 ['perforin','Perforin pore marks','Engagers','perforin immune synapse kill','Schematic pore cue; not a pore stoichiometry.'],
 ['granzyme','Granzyme release marks','Engagers','granzyme immune synapse kill','Secreted cytotoxic granule contents shown as dots.'],
 ...['generic','CD19','HER2','BCMA'].map(n=>[`tumor-antigen-${n.toLowerCase()}`,`${n==='generic'?'Tumor antigen':n} badge`,'Engagers',`tumor antigen ${n} receptor`, 'Placeholder identity label; no sequence, epitope, expression level or brand artwork implied.']),
 ['mhc-peptide','MHC-I–peptide','Cell therapy','MHC I peptide antigen TCR','Peptide presentation cue for contrasting TCR and CAR recognition.'],
 ['tcr','TCR','Cell therapy','TCR T cell receptor MHC','Paired receptor cue; associated CD3 complex omitted.'],
 ...[['scfv','scFv'],['vhh','VHH'],['hinge','Hinge'],['tm','TM'],['cd28','CD28'],['4-1bb','4-1BB'],['cd3z','CD3ζ']].map(([id,label])=>[`car-${id}`,`CAR domain · ${label}`,'Cell therapy',`CAR-T CAR construct strip ${label}`, 'Editable domain block; sequence and domain length are not encoded. CD28 and 4-1BB are alternative example costimulatory domains.']),
 ['endogenous-t-cell','Circulating / endogenous T cell','Cell therapy','CAR-T in vivo CAR in situ CAR circulating endogenous T cell','Reuses the original T-cell schematic with an endogenous identity cue.'],
 ['car-t-effector','CAR+ T-cell effector','Cell therapy','CAR-T in vivo CAR in situ CAR effector','T-cell schematic with surface CAR cues; receptor density is illustrative.'],
 ['targeted-lv','T-cell-targeted lentiviral vector','Cell therapy','CAR-T in vivo CAR in situ CAR targeted LV lentiviral viral vector anti-CD3 anti-CD8 anti-CD7 durable integrating','Generic targeting ligand on an integrating LV concept; ligand identity and tropism must be specified for the study.'],
 ['targeted-lnp','T-cell-targeted LNP · CAR mRNA','Cell therapy','CAR-T in vivo CAR in situ CAR LNP mRNA lipid nanoparticle transient','Conceptual lipid cross-section with targeting ligand and CAR mRNA; not a literal LNP internal structure.'],
 ['car-mrna','CAR mRNA cargo','Cell therapy','CAR-T in vivo CAR LNP mRNA transient cargo','Sequence-free CAR mRNA cue.'],
 ['endosomal-escape','Endosomal escape arrow','Cell therapy','CAR-T in vivo CAR LNP mRNA endosomal escape','Membrane crossing cue; escape efficiency and mechanism are not specified.'],
 ...[['ex-vivo','Ex vivo manufacture'],['in-vivo','In vivo / in situ programming'],['durable','Durable (integrating)'],['transient','Transient (mRNA)'],['product','Manufactured CAR-T product']].map(([id,name])=>[`badge-${id}`,name,'Cell therapy',`CAR-T in vivo CAR in situ CAR ${name}`,'Editable identity/callout badge; duration and efficacy are context dependent.']),
 ['riptac','RIPTAC (Regulated Induced Proximity Targeting Chimera)','Proximity / RIPTAC','TP binder EP binder heterobifunctional','Target-Protein binder — linker — Effector-Protein binder; chemical structures are not encoded.'],
 ['riptac-tp','RIPTAC · tumor-selective Target Protein (TP)','Proximity / RIPTAC','TP target protein tumor selective','Tumor-enriched intracellular target context; selectivity is a design assumption, not a universal property.'],
 ['riptac-ep','RIPTAC · pan-essential Effector Protein (EP)','Proximity / RIPTAC','EP effector protein pan essential','Essential protein whose function is abrogated in the ternary complex.'],
 ['riptac-ternary','RIPTAC · TP:RIPTAC:EP ternary complex','Proximity / RIPTAC','ternary complex TP EP','Induced proximity stabilizes TP:RIPTAC:EP; geometry and occupancy are conceptual.'],
 ['hold-kill','RIPTAC · hold-and-kill / EP blockade','Proximity / RIPTAC','hold-and-kill EP function abrogation inhibition apoptosis','Inhibition bar denotes loss of EP function, leading to selective cell death in the model.'],
 ['apoptosis','Apoptosis / cell death','Engagers','apoptosis cell death kill ADC CAR-T RIPTAC','Fragmentation is a schematic endpoint, not evidence of a measured death pathway.'],
 ['tp-positive','TP+ cancer cell','Proximity / RIPTAC','TP positive cancer tumor','Cancer-cell context enriched in TP.'],
 ['tp-negative','TP− normal cell · spared','Proximity / RIPTAC','TP negative normal spared','Idealized TP-negative comparator with preserved EP function; no guarantee of clinical safety.']
];
export const THERAPEUTICS_ASSETS=definitions.map(([id,name,category,tags,description])=>({id,kind:id,name,category,tags:`${tags} ${category==='Proximity / RIPTAC'?'RIPTAC (Regulated Induced Proximity Targeting Chimera) induced proximity hold-and-kill':''}`,description,
 version:THERAPEUTICS_VERSION,color:category==='ADC'?'#e6ad75':category==='Proximity / RIPTAC'?'#b994c4':'#62aaa0',creator:'BioEditor project',license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',source:'BioEditor original therapeutic modality schematics v0.5.0',creationMethod:'Independently authored procedural SVG; existing BioEditor cell/vector geometry reused where indicated',reviewStatus:'scientific-review-pending',rightsReviewStatus:'pending',modifications:'Original modular composition; no third-party artwork imported.',
 limitations:`${description} Conceptual schematic; not to scale. Independent scientific review pending.`,references:(THERAPEUTICS_REFERENCES[category==='Proximity / RIPTAC'?'riptac':category==='Cell therapy'?'car':category==='ADC'?'adc':category==='Engagers'?'engager':'antibody']).map(r=>({...r,role:'Scientific text context; no artwork reused'}))}));

export function therapeuticParts(id,color,version,recolored=false) {
 if(!THERAPEUTICS_ASSETS.some(a=>a.id===id))return null;
 if(version!==undefined&&version!==THERAPEUTICS_VERSION)throw Error('Unsupported illustration revision.');
 const p=illustrationPalette(color),parts=[];
 const second=recolored?p.accent:illustrationPalette('#'+color.slice(5,7)+color.slice(1,5)).accent;
 const add=(name,svg)=>parts.push({name,shape:'module',svg:`<g data-module="${escapeXML(name)}">${svg}</g>`});
 const line=(d,c=p.ink,w=1.6)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const ellipse=(x,y,rx,ry,c=p.accent,angle=0)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${angle} ${x} ${y})" fill="${c}" stroke="${p.ink}" stroke-width="1.1"/>`;
 const rect=(x,y,w,h,c=p.fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}" stroke="${p.ink}" stroke-width="1.1"/>`;
 const label=(s,x=50,y=53,size=10)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" fill="${p.ink}">${escapeXML(s)}</text>`;
 const warhead=(x,y)=>`<path d="M${x-6} ${y-5}L${x+3} ${y-8} ${x+8} ${y} ${x+3} ${y+8} ${x-6} ${y+5}Z" fill="${p.accent}" stroke="${p.ink}" stroke-width="1.2"/>`;
 const rna=()=>line('M28 49Q35 32 42 49T56 49T70 49',p.detail,2.4)+line('M31 43l-3-5m12 5 3-6m12 19 3 6m9-17 3-6',p.detail);
 const ligand=(base=23)=>line(`M50 ${base}V12L42 6M50 12L58 6`,p.detail,2.8);
 // Reuse the original viral-vector envelope/backbone construction, with the
 // existing technical finish; targeting ligand remains an independent module.
 const vector=()=>technicalFinish(`<circle cx="50" cy="50" r="29" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="2.5"/><g fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round">${Array.from({length:8},(_,i)=>`<path transform="rotate(${i*45} 50 50)" d="M50 21V11M46 11H54"/>`).join('')}</g><path d="M35 45q14-20 26-2t-10 18" stroke="${color}" stroke-width="3" fill="none"/>`,color);
 const binders=(y=50)=>{add('TP binder',rect(18,y-7,18,14,p.accent));add('Flexible linker',line(`M36 ${y}Q43 ${y-8} 50 ${y}T64 ${y}`,p.detail,2));add('EP binder',ellipse(73,y,9,8,p.mid));};
 const igg=['format-igg','format-fab','format-fab2','format-fc','bispecific-igg','adc','bsadc'].includes(id);
 if(igg) {
  let {chains,bonds}=antibodyGeometry();
  if(id==='format-fab')chains=chains.filter(c=>c.id.endsWith('left'));
  if(id==='format-fc')chains=chains.filter(c=>c.type==='heavy');
  for(const c of chains) {
   const domains=id==='format-fc'?c.domains.slice(2):['format-fab','format-fab2'].includes(id)?c.domains.slice(0,2):c.domains;
   const points=id==='format-fc'||id==='format-fab'?domains:id==='format-fab2'?c.points.slice(0,c.type==='heavy'?3:2):c.points;
   if(id==='format-fab2'&&c.type==='heavy')points.push({x:50+(c.id.endsWith('left')?-1:1)*(4+8/9),y:58});
   const tone=c.type==='light'?p.fill:c.id.endsWith('right')&&['bispecific-igg','bsadc'].includes(id)?second:p.accent;
   const transform=id==='format-fc'?'translate(-20 -54) scale(1.4)':id==='format-fab'?'translate(5 -6) scale(1.4)':id==='format-fab2'?'translate(0 15)':'';
   add(c.id,`<g transform="${transform}">${line(points.map((v,i)=>`${i?'L':'M'}${v.x} ${v.y}`).join(' '),p.detail,2.5)}${domains.map(d=>`<g data-domain="${d.name}">${ellipse(d.x,d.y,5,8.5,tone,d.angle)}</g>`).join('')}</g>`);
  }
  if(!['format-fab','format-fc'].includes(id))add('Hinge bonds',`<g transform="${id==='format-fab2'?'translate(0 15)':''}">${bonds.map(b=>line(`M${b.from.x} ${b.from.y}L${b.to.x} ${b.to.y}`,p.detail,1)).join('')}</g>`);
  if(['adc','bsadc'].includes(id))for(const [i,[x,y]] of [[29,62],[71,62]].entries()){add(`Conjugate ${i+1} linker`,line(`M${i?56:44} 69L${x} ${y}`,p.detail));add(`Conjugate ${i+1} payload`,warhead(x,y));}
 } else if(id==='format-scfv'||id==='format-vhh') {
  if(id==='format-scfv'){add('Flexible peptide linker',line('M32 50C32 82 68 82 68 50',p.detail,2.2));add('VL',ellipse(32,42,10,17,p.mid));add('VH',ellipse(68,42,10,17));}
  else add('VHH',ellipse(50,50,14,25));
 } else if(id==='format-hinge'||id==='flexible-linker') {
  add('Peptide linker',line('M15 50Q24 30 33 50T51 50T69 50T87 50',p.detail,3));
  if(id==='format-hinge'){add('Second heavy-chain hinge',line('M15 60Q24 40 33 60T51 60T69 60T87 60',p.detail,3));add('Interchain bonds',line('M33 50V60M69 50V60'));}
 } else if(['bite','bike'].includes(id)) {
  add('Inter-scFv linker',line('M40 50Q50 36 60 50',p.detail,2));
  for(const [name,x,tone] of [[id==='bite'?'Anti-CD3 scFv':'Anti-CD16 scFv',27,p.accent],['Anti-tumor scFv',73,second]])add(name,line(`M${x-8} 50Q${x} 73 ${x+8} 50`,p.detail)+ellipse(x-8,45,7,12,tone)+ellipse(x+8,45,7,12,tone));
 } else if(id.startsWith('adc-')||id==='payload-catabolite') {
  add('Linker',line(id==='adc-cleavable'?'M12 50H40M52 50H75':'M12 50H75',p.detail,2.5));
  if(id==='adc-cleavable')add('Cleavage mark',line('M42 41l7 18M47 41l7 18',p.detail));
  if(id==='payload-catabolite')add('Residual amino acid',ellipse(16,50,6,6,p.mid));
  add('Payload warhead',warhead(80,50));
 } else if(id==='payload-warhead')add('Payload warhead',`<g transform="translate(-50 -50) scale(2)">${warhead(50,50)}</g>`);
 else if(id.startsWith('dar-')){const n=Number(id.slice(4));add('DAR label',rect(22,35,56,30)+label(`DAR ${n}`));for(let i=0;i<n;i++)add(`Payload count ${i+1}`,ellipse(18+i*64/Math.max(1,n-1),74,2,2));}
 else if(['early-endosome','late-endosome'].includes(id)) {
  add('Endosomal membrane',ellipse(50,50,34,30,p.fill));
  if(id==='late-endosome')for(const [i,[x,y]] of [[37,38],[61,41],[49,62]].entries())add(`Intraluminal vesicle ${i+1}`,ellipse(x,y,8,7,p.mid));
  else add('Internalized cargo',ellipse(50,53,9,7,p.mid));
 } else if(id==='fcrn'||id==='tcr'||id==='mhc-peptide') {
  add('Membrane anchor',line('M50 85V58',p.detail,4));add('Receptor domain A',ellipse(40,45,8,18));add('Receptor domain B',ellipse(60,45,8,18,p.mid));
  if(id==='mhc-peptide')add('Presented peptide',line('M34 25Q50 32 66 25',p.detail,4));
 } else if(id==='recycling-arrow'||id==='endosomal-escape') {
  add('Route',line(id==='recycling-arrow'?'M25 73A32 32 0 1 1 79 67':'M15 76Q56 81 60 28H85',p.detail,3));
  add('Arrowhead',line(id==='recycling-arrow'?'M70 64L79 67 81 57':'M77 20L85 28 77 36',p.detail,3));
  if(id==='endosomal-escape')add('Endosomal membrane',line('M15 20Q82 40 42 83',p.mid,4));
 } else if(id==='immune-cleft') {add('T-cell membrane',line('M10 12Q33 50 10 88',p.detail,4));add('Tumor membrane',line('M90 12Q67 50 90 88',p.detail,4));}
 else if(id==='perforin') {for(let i=0;i<5;i++)add(`Pore subunit ${i+1}`,ellipse(25+i*12,50+Math.sin(i)*8,4,13));}
 else if(id==='granzyme'){for(const [i,[x,y]] of [[30,32],[58,27],[43,51],[72,58],[28,72]].entries())add(`Granzyme mark ${i+1}`,ellipse(x,y,5,5));}
 else if(id.startsWith('tumor-antigen-')){add('Membrane antigen',line('M50 84V52',p.detail,4)+rect(35,23,30,30,p.mid));add('Identity badge',label(id.endsWith('generic')?'Ag':id.split('-').at(-1).toUpperCase(),50,44,9));}
 else if(id==='car-mrna')add('CAR mRNA',rna());
 else if(id.startsWith('car-')&&id!=='car-t-effector'){const s={'scfv':'scFv','vhh':'VHH','hinge':'Hinge','tm':'TM','cd28':'CD28','4-1bb':'4-1BB','cd3z':'CD3ζ'}[id.slice(4)];add(`${s} domain`,rect(5,30,90,40,p.mid)+label(s,50,55,15));}
 else if(['endogenous-t-cell','car-t-effector','tp-positive','tp-negative'].includes(id)) {
  add('Cell',technicalGlyph(id==='tp-positive'?'tumor':'cell',color));
  if(id==='car-t-effector')for(const angle of [-60,0,60])add(`CAR receptor ${angle}`,`<g transform="rotate(${angle} 50 50)">${ligand()}</g>`);
  add('Identity badge',rect(27,68,46,18)+label(id==='endogenous-t-cell'?'T':id==='car-t-effector'?'CAR+':id==='tp-positive'?'TP+':'TP−',50,81,10));
 } else if(id==='targeted-lv'||id==='targeted-lnp') {
  add('Vector envelope',id==='targeted-lv'?`<g transform="translate(10 17) scale(.8)">${vector()}</g>`:ellipse(50,56,33,30,p.fill)+ellipse(50,56,28,25,p.mid));
  add('T-cell targeting ligand',ligand(id==='targeted-lv'?34:26));
  if(id==='targeted-lnp')add('CAR mRNA cargo',rna());
 } else if(id.startsWith('badge-')) {
  const lines={'badge-ex-vivo':['Ex vivo','manufacture'],'badge-in-vivo':['In vivo / in situ','programming'],'badge-durable':['Durable','(integrating)'],'badge-transient':['Transient','(mRNA)'],'badge-product':['Manufactured','CAR-T product']}[id];
  add('Identity badge',rect(3,28,94,44)+label(lines[0],50,46,10)+label(lines[1],50,62,10));
 } else if(id==='riptac')binders();
 else if(id==='riptac-tp')add('Target Protein (TP)',rect(23,24,54,52,p.mid)+label('TP',50,56,18));
 else if(id==='riptac-ep')add('Effector Protein (EP)',ellipse(50,50,29,25)+label('EP',50,56,18));
 else if(id==='riptac-ternary') {
  add('Target Protein (TP)',rect(5,17,35,65,p.mid)+label('TP',22,35,12));
  add('Effector Protein (EP)',ellipse(77,50,19,32)+label('EP',77,31,12));binders();
 } else if(id==='hold-kill') {add('EP function',ellipse(28,50,20,20,p.mid)+label('EP',28,55,13));add('Function blockade',line('M50 50H85M85 32V68',p.detail,3));}
 else if(id==='apoptosis') {for(const [i,[x,y,r]] of [[35,32,14],[67,38,12],[42,65,12],[72,72,7],[20,63,5]].entries())add(`Cell fragment ${i+1}`,ellipse(x,y,r,r*.8,p.mid));}
 return parts;
}
export const therapeuticGlyph=(id,color,version)=>therapeuticParts(id,color,version)?.map(p=>p.svg).join('')??null;

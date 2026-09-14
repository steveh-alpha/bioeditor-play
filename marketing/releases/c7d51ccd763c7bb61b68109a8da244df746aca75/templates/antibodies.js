import {ASSETS} from '../assets/library.js';
import {ANTIBODY_REFERENCES} from '../assets/immunoglobulins.js';
import {wrapLabel} from '../svg.js';

const card=(asset,label,note)=>({asset,label,note});
const speciesClasses=species=>[
  card(`${species}-igg1`,'IgG','Monomer · 2 binding sites'),
  card(`${species}-${species==='human'?'iga1':'iga'}-secretory`,'IgA','Secretory dimer shown · J chain + SC'),
  card(`${species}-igm-pentamer`,'IgM','Pentamer shown · J chain'),
  card(`${species}-igd`,'IgD',species==='mouse'?'CH1 + CH3 · lacks CH2':'CH1 + CH2 + CH3'),
  card(`${species}-ige`,'IgE','CH1–CH4 · no conventional hinge')
];
const templates=[
  {id:'antibody-species',name:'Human vs mouse antibodies',description:'Five antibody classes across two species, with structural differences.',columns:5,rowLabels:['HUMAN · Homo sapiens','MOUSE · Mus musculus'],cards:[...speciesClasses('human'),...speciesClasses('mouse')],
    notes:['IgG: human IgG1–4; mouse IgG1, IgG2a or IgG2c (strain dependent), IgG2b and IgG3. Names do not imply equivalent function.','IgA also occurs as a monomer and other polymers. Membrane IgM is monomeric. IgD drawings omit membrane anchors.']},
  {id:'antibody-human-igg',name:'Human IgG subclasses',description:'IgG1, IgG2, IgG3 and IgG4 with an extended IgG3 hinge.',columns:4,cards:['IgG1','IgG2','IgG3','IgG4'].map(s=>card(`human-${s.toLowerCase()}`,`Human ${s}`,s==='IgG3'?'Extended hinge; allotype dependent.':'Shared IgG domain organization.')),
    notes:['Each IgG has two heavy and two light chains. VH/VL form the binding tips; CH2/CH3 form the Fc region.','Geometry does not encode subclass-specific receptor affinities, complement activity, disulfide patterns or IgG4 Fab-arm exchange.']},
  {id:'antibody-mouse-igg',name:'Mouse IgG subclasses',description:'IgG1, IgG2a, IgG2b, IgG2c and IgG3 with strain context.',columns:5,cards:['IgG1','IgG2a','IgG2b','IgG2c','IgG3'].map(s=>card(`mouse-${s.toLowerCase()}`,`Mouse ${s}`,s==='IgG2a'?'Example strain: BALB/c':s==='IgG2c'?'Example strain: C57BL/6':'Shared IgG domain organization.')),
    notes:['IgG2a and IgG2c depend on genetic background; these cards are a species catalog, not five subclasses assumed present in every strain.','Human and mouse subclass names are not a functional equivalence map. Confirm the strain and reagent specificity for your study.']},
  {id:'antibody-iga',name:'IgA subclasses and assemblies',description:'Human IgA1/IgA2 and mouse IgA, from monomers to secretory dimers.',columns:3,rowLabels:['MONOMER','DIMER · J CHAIN','SECRETORY DIMER · J CHAIN + SC'],cards:['','-dimer','-secretory'].flatMap(suffix=>['human-iga1','human-iga2','mouse-iga'].map(id=>card(id+suffix,ASSETS.find(a=>a.id===id).name,id==='human-iga1'?'Longer hinge':id==='human-iga2'?'Shorter hinge':'Single mouse IgA class'))),
    notes:['J chain joins the polymeric assembly. Secretory component (SC) is the retained extracellular portion of the polymeric Ig receptor.','The dimer is a representative secretory form; higher IgA polymers and subclass/allotype-specific bond arrangements are outside this schematic.']},
  {id:'antibody-igm',name:'IgM membrane and secreted forms',description:'Human and mouse membrane monomers, J-chain pentamers and hexamers.',columns:3,rowLabels:['HUMAN','MOUSE'],cards:['human','mouse'].flatMap(species=>[
    card(`${species}-igm-membrane`,'Membrane monomer','1 H2L2 unit · 2 potential binding sites'),
    card(`${species}-igm-pentamer`,'Pentamer + J chain','5 H2L2 units · 10 potential binding sites'),
    card(`${species}-igm-hexamer`,'Hexamer','6 H2L2 units · no J chain')]),
    notes:['Mu heavy chains contain VH plus CH1–CH4. Potential site counts describe topology; they do not guarantee simultaneous antigen occupancy.','Membrane anchors are schematic; CD79a/CD79b and secretory component on secretory IgM are omitted.']},
  {id:'antibody-igd-ige',name:'IgD and IgE across species',description:'Compare the mouse IgD CH2 deletion and four-domain IgE heavy chains.',columns:2,rowLabels:['IgD','IgE'],cards:[
    card('human-igd','Human IgD','VH–CH1–hinge–CH2–CH3'),card('mouse-igd','Mouse IgD','VH–CH1–hinge–CH3'),
    card('human-ige','Human IgE','VH–CH1–CH2–CH3–CH4'),card('mouse-ige','Mouse IgE','VH–CH1–CH2–CH3–CH4')],
    notes:['IgE lacks a conventional hinge; its native bent conformation is simplified here into an extended domain diagram.','Mouse IgD lacks CH2. IgD membrane anchors and receptor complexes are omitted.']},
  {id:'antibody-fragments',name:'Antibody fragments',description:'Fab, F(ab′)2, Fc and scFv topology in editable vectors.',columns:4,cards:[
    card('antibody-fab','Fab','One binding arm · no Fc'),card('antibody-fab2','F(ab′)2','Two linked binding arms · no Fc'),
    card('antibody-fc','IgG Fc','CH2/CH3 pair · no binding tips'),card('antibody-scfv','scFv','VH + linker + VL · single chain')],
    notes:['These are format schematics, not species-specific isotypes. Light chains can be kappa or lambda; that sequence distinction is not drawn.','Binding-site counts describe the fragment format. Specificity, affinity, linker sequence and fragment preparation are study dependent.']},
  {id:'antibody-anatomy',name:'Antibody anatomy',description:'IgG chain, domain, Fab, Fc and hinge labels.',columns:1,cards:[card('antibody','Conventional IgG','')],notes:[]}
];
export const ANTIBODY_TEMPLATES=templates.map(t=>({...t,category:'Antibodies',version:'0.4.0',tags:'antibody immunoglobulin human mouse murine immunology',subtitle:t.description,assets:t.cards.map(c=>c.asset),labels:t.cards.map(c=>c.label)}));

const uid=()=>crypto.randomUUID();
function text(label,x,y,w,size=18,color='#243e3b') {
  return {id:uid(),type:'text',label,x,y,w,h:Math.max(size*1.4,wrapLabel(label,w,size).length*size*1.3),fontSize:size,color,wrap:true};
}
function asset(id,x,y,size) {
  const a=ASSETS.find(a=>a.id===id);
  return {id:uid(),type:'asset',assetId:id,artworkVersion:a.version,label:a.name,x,y,w:size,h:size,color:a.color};
}
export function makeAntibodyTemplate(id) {
  const t=ANTIBODY_TEMPLATES.find(t=>t.id===id);
  if(!t)throw Error('Unknown antibody template');
  const width=1400,nodes=[text(t.name,60,36,1280,34),text(t.description,60,88,1280,18)];
  let bottom=0;
  if(id==='antibody-anatomy') {
    nodes.push(asset('antibody',465,150,460));
    // Leaders use native editable line nodes with tips on the corresponding domains.
    const callout=(label,x,y,w,toX,toY)=>{
      const n=text(label,x,y,w,19),fromX=x<465?x+w+12:x-12,fromY=y+20;
      const length=Math.hypot(toX-fromX,toY-fromY);
      nodes.push(n,{id:uid(),type:'arrow',label:`${label} leader`,edgeStyle:'line',x:(fromX+toX-length)/2,y:(fromY+toY)/2-1,w:length,h:2,rotation:(Math.atan2(toY-fromY,toX-fromX)*180/Math.PI+360)%360,color:'#809790'});
    };
    callout('Variable tips · VH + VL\nAntigen-binding site',65,165,305,560,291);
    callout('Light chain · VL + CL\nTwo light chains per IgG',65,315,305,597,379);
    callout('Fab arm · VH/CH1 + VL/CL\nTwo binding arms',65,470,305,618,362);
    callout('Heavy chain · VH + CH1–CH3\nTwo heavy chains per IgG',1000,175,340,810,275);
    callout('Hinge\nConnects Fab arms to Fc',1000,340,340,700,414);
    callout('Fc region · paired CH2/CH3\nConstant heavy-chain domains',1000,490,340,722,550);
    nodes.push(text('Darker domains: heavy chains. Lighter domains: light chains. Short cross-links: schematic interchain disulfides.',65,640,1270,18));
    nodes.push(text('Heavy and light chains each contribute a variable domain. Kappa/lambda light-chain sequence differences and glycans are omitted.',65,677,1270,18));
    bottom=748;
  } else {
    const gap=18,cardWidth=(1280-(t.columns-1)*gap)/t.columns,size=Math.min(190,cardWidth-24),rowHeight=342;
    t.cards.forEach((c,i)=>{
      const row=Math.floor(i/t.columns),col=i%t.columns,x=60+col*(cardWidth+gap),y=174+row*rowHeight;
      if(col===0&&t.rowLabels)nodes.push(text(t.rowLabels[row],60,y-34,1280,16,'#52716e'));
      nodes.push({id:uid(),type:'panel',label:`${c.label} panel`,x,y,w:cardWidth,h:290,color:row%2?'#f1edf4':'#edf4f5'});
      nodes.push(asset(c.asset,x+(cardWidth-size)/2,y+10,size));
      nodes.push(text(c.label,x+14,y+204,cardWidth-28,21));
      nodes.push(text(c.note,x+14,y+238,cardWidth-28,15));
      bottom=y+310;
    });
    for(const note of t.notes){const n=text(note,60,bottom,1280,17);nodes.push(n);bottom+=n.h+12;}
  }
  const footer=text('ORIGINAL EDITABLE SCHEMATIC · Not to scale · Scientific review pending · Sources retained in figure evidence.',60,bottom+10,1280,14,'#52716e');nodes.push(footer);
  return {schemaVersion:'0.1',title:t.name,width,height:Math.ceil(footer.y+footer.h+40),background:'#ffffff',nodes,templateId:id,templateVersion:t.version,diagramLayout:'comparison',
    claims:[{id:uid(),text:`Reference context for ${t.name}. Domain schematics omit glycans, exact disulfide maps and sequence/allotype detail.`,source:ANTIBODY_REFERENCES.map(r=>`${r.title}: ${r.url}`).join('\n'),status:'draft'}],aiProvenance:[]};
}

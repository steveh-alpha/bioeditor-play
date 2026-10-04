import {ASSETS} from '../assets/library.js';
import {THERAPEUTICS_REFERENCES,THERAPEUTICS_VERSION} from '../assets/therapeutics.js';
import {wrapLabel} from '../svg.js';
import {connectNodes,synchronizeConnections} from '../editor/connections.js';

export const THERAPEUTICS_TEMPLATES=[
 ['antibody-format-gallery','Antibody format gallery','Antibody formats','IgG, Fab, F(ab′)₂, Fc, scFv, VHH and hinge modules.',['format-igg','format-fab','format-fab2','format-fc','format-scfv','format-vhh','format-hinge'],'antibody nanobody VHH scFv'],
 ['bite-moa','Bispecific / BiTE mechanism','Engagers','CD3 × tumor-antigen bridging, immune synapse and cytotoxic release.',['t-cell','bite','tumor','immune-cleft','perforin','granzyme','apoptosis'],'bispecific multispecific engager BiTE immune synapse'],
 ['adc-moa','ADC binding and trafficking','ADC','Binding, uptake, endosomal transit and lysosomal payload release.',['adc','tumor-antigen-her2','early-endosome','late-endosome','lysosome','payload-warhead','apoptosis'],'ADC DAR FcRn trafficking linker payload'],
 ['bsadc-architecture','BsADC architecture callout','ADC','An editable dual-specificity antibody with linker–payload conjugates.',['bsadc','adc-cleavable','adc-noncleavable','dar-4'],'BsADC bispecific ADC linker payload DAR'],
 ['car-construct-synapse','CAR construct and kill synapse','Cell therapy','Modular receptor strip with a classic CAR-T / tumor synapse.',['car-scfv','car-hinge','car-tm','car-cd28','car-4-1bb','car-cd3z','car-t-effector','tumor'],'CAR-T construct immune synapse TCR MHC'],
 ['car-ex-vivo-vs-in-vivo','Ex vivo vs in vivo CAR-T','Cell therapy','Compare manufacture with systemic targeted LV or LNP programming of endogenous T cells.',['tube','targeted-lv','targeted-lnp','endogenous-t-cell','car-t-effector','tumor'],'CAR-T in vivo CAR in situ CAR LNP mRNA lentiviral durable transient'],
 ['riptac-moa','RIPTAC (Regulated Induced Proximity Targeting Chimera) MoA','Proximity / RIPTAC','Tumor-selective TP binding, TP:RIPTAC:EP complex and EP-function blockade.',['tp-positive','riptac','riptac-ternary','hold-kill','apoptosis','tp-negative'],'RIPTAC Regulated Induced Proximity Targeting Chimera induced proximity hold-and-kill ternary complex TP EP']
].map(([id,name,category,description,assets,tags])=>({id,name,category,description,subtitle:description,assets,tags,version:THERAPEUTICS_VERSION,creator:'BioEditor project',license:'CC-BY-4.0',reviewStatus:'scientific-review-pending',limitations:'Conceptual schematic, not to scale; mechanism and selectivity depend on the study.'}));

export function makeTherapeuticTemplate(id) {
 const t=THERAPEUTICS_TEMPLATES.find(t=>t.id===id);if(!t)throw Error('Unknown therapeutic template');
 const nodes=[],edges=[],uid=()=>crypto.randomUUID(),width=1600;
 const text=(label,x,y,w=400,size=18,color='#294845')=>{const n={id:uid(),type:'text',label,x,y,w,h:Math.max(size*1.4,wrapLabel(label,w,size).length*size*1.3),fontSize:size,color,wrap:true};nodes.push(n);return n;};
 const panel=(label,x,y,w,h,color='#edf4f5')=>{const n={id:uid(),type:'panel',label,x,y,w,h,color};nodes.push(n);return n;};
 const asset=(id,x,y,w=140,h=w)=>{const a=ASSETS.find(a=>a.id===id);if(!a)throw Error(`Missing therapeutic component ${id}`);const n={id:uid(),type:'asset',assetId:id,artworkVersion:a.version,label:a.name,x,y,w,h,color:a.color};nodes.push(n);return n;};
 const connect=(a,b,label,style='arrow')=>{const n=connectNodes(a,b,style);n.label=label;edges.push(n);return n;};
 const leader=(label,x,y,w,target)=>connect(text(label,x,y,w,18),target,label,'line');
 const row=(items,x,y,span=1480,size=130)=>{const step=span/items.length;const icons=items.map(([id,label,note],i)=>{const cx=x+step*i;text(label,cx,y+size+12,step-22,20);if(note)text(note,cx,y+size+47,step-22,16);return asset(id,cx+(step-size-22)/2,y,size);});for(let i=1;i<icons.length;i++)connect(icons[i-1],icons[i],`${items[i-1][1]} → ${items[i][1]}`);return icons;};
 // Molecular bridge physically spans two opposing cell surfaces. All components
 // (including both cells) are independent native objects, not a flattened scene.
 const synapse=(x,y,car=false)=>{
  const a=asset(car?'car-t-effector':'t-cell',x,y,210),b=asset('tumor',x+320,y,210);
  asset('immune-cleft',x+187,y+34,155,135);
  if(car)asset('receptor',x+187,y+16,130).rotation=90;
  else {asset('receptor',x+175,y+35,75).rotation=90;asset('bite',x+210,y+24,110);}
  asset('tumor-antigen-generic',x+281,y+28,75).rotation=270;
  asset('perforin',x+287,y+113,52);asset('granzyme',x+238,y+120,65);
  text(car?'CAR+ T cell':'T cell · CD3',x,y+215,210,20);text('Antigen+ tumor',x+327,y+215,220,20);
  text(car?'CAR → surface antigen':'Anti-CD3 ← BiTE → anti-tumor',x+155,y-13,310,17);
  text('Perforin / granzymes',x+190,y+189,220,16);
  return {a,b};
 };
 text(t.name,60,32,1480,id==='riptac-moa'?28:34);
 text(t.description,60,90,1480,18);
 let footerY=920;
 if(id==='antibody-format-gallery') {
  const cards=[['format-igg','IgG','2 heavy + 2 light chains'],['format-fab','Fab','One binding arm'],['format-fab2','F(ab′)₂','Two arms + hinge'],['format-fc','Fc','Paired CH2 / CH3'],['format-scfv','scFv','VL–linker–VH'],['format-vhh','VHH / nanobody','One heavy-chain domain'],['format-hinge','Hinge','Flexible connection']];
  cards.forEach(([a,label,note],i)=>{const x=60+i*212;panel(label,x,164,196,345);asset(a,x+8,186,180);const heading=text(label,x+14,385,170,20);text(note,x+14,heading.y+heading.h+12,170,16);});
  text('Select a format → Edit parts → select a named chain or domain to recolor, move or duplicate it.',60,553,1480,23);
  text('IgG and fragments use chain modules. scFv exposes VL, peptide linker and VH separately. VHH contains no light chain.',60,604,1480,18);
  text('Specificity, affinity, linker sequence and exact disulfide connectivity remain study dependent.',60,646,1480,18);footerY=715;
 } else if(id==='bite-moa') {
  panel('A · Molecular bridge',60,154,910,610);panel('B · Cytotoxic response',995,154,545,610,'#f7eef1');
  text('A   BRIDGE AND SYNAPSE',85,180,820,21);synapse(135,300);
  const death=asset('apoptosis',1135,335,205);text('B   KILL',1020,180,480,21);text('Granule release → apoptosis',1050,570,440,22);
  const bridge=text('CD3 and tumor antigen co-engagement',180,645,700,19);connect(bridge,death,'Cytotoxic T-cell response');
  text('BiTE: tandem scFv example. IgG-like bispecifics can be substituted; Fc function and target geometry differ.',60,803,1480,18);
  text('Example tumor-antigen labels: CD19, HER2 or BCMA. Replace with your studied target; no antigen expression is assumed.',60,845,1480,18);footerY=914;
 } else if(id==='adc-moa') {
  panel('ADC route',60,155,1480,398);
  text('A   RECEPTOR-MEDIATED DELIVERY',82,177,1400,21);
  row([['adc','01  Bind','Antigen+ surface'],['early-endosome','02  Internalize','Uptake to early endosome'],['late-endosome','03  Mature','Late endosome'],['lysosome','04  Process','Lysosomal proteolysis'],['payload-warhead','05  Release','Active payload / catabolite'],['apoptosis','06  Cell death','Payload-dependent response']],82,235,1435,130);
  asset('tumor-antigen-her2',190,218,58).rotation=180;
  panel('Linker routes',60,577,960,287,'#f8f1e8');text('B   RELEASE DEPENDS ON LINKER CHEMISTRY',82,599,910,20);
  const cl=asset('adc-cleavable',95,656,110),free=asset('payload-warhead',367,656,110);connect(cl,free,'Cleavage releases payload');text('Cleavable → free payload',90,785,425,18);
  const nc=asset('adc-noncleavable',551,656,110),cat=asset('payload-catabolite',840,656,110);connect(nc,cat,'Proteolysis produces linker-bearing catabolite');text('Non-cleavable → linker-bearing catabolite',535,785,465,18);
  panel('Recycling branch',1044,577,496,287);text('C   POSSIBLE RECYCLING',1065,599,455,20);
  asset('fcrn',1087,654,100);asset('recycling-arrow',1247,654,100);text('FcRn-associated sorting can return antibody to the surface instead of lysosomal delivery.',1068,768,440,17);
  text('Not every ADC follows the same route. Cleavage, bystander effects and Fc-mediated killing depend on the construct and cellular context.',60,899,1480,18);footerY=960;
 } else if(id==='bsadc-architecture') {
  panel('BsADC assembly',60,155,1480,460);
  const bs=asset('bsadc',588,180,390);
  leader('Specificity A\nLeft binding arm',125,245,350,bs);leader('Specificity B\nRight binding arm',1110,245,350,bs);
  leader('Linker–payload\nIllustrative conjugation sites',1110,458,365,bs);
  text('Two arm colors = two specificities',575,570,460,17);
  asset('adc-cleavable',100,663,145);text('Cleavable linker',88,825,350,20);
  asset('adc-noncleavable',520,663,145);text('Non-cleavable linker',485,825,370,20);
  asset('dar-4',950,663,145);text('Example DAR 4',917,825,300,20);
  text('DAR badge is an annotation, not the count of illustrated conjugates. Alternatives: DAR 2 / 8. Attachment sites and release chemistry require study-specific edits.',60,882,1480,18);footerY=952;
 } else if(id==='car-construct-synapse') {
  panel('Construct strip',60,150,1480,235);text('A   EXAMPLE SECOND-GENERATION CAR · N → C',83,173,1400,21);
  const blocks=['car-scfv','car-hinge','car-tm','car-cd28','car-cd3z'];blocks.forEach((a,i)=>asset(a,90+i*220,174,190));
  asset('car-4-1bb',1230,164,210);text('Alternative to CD28',1225,326,270,17);
  text('Extracellular binding / spacer',93,330,410,17);text('Membrane',530,330,180,17);text('Intracellular signaling',751,330,420,17);
  panel('CAR killing',60,418,925,438);text('B   CAR RECOGNIZES SURFACE ANTIGEN',83,440,875,21);const killing=synapse(120,521,true);
  const dead=asset('apoptosis',772,562,130);connect(killing.b,dead,'Granule-mediated tumor cell death');text('Apoptosis',759,736,195,20);
  panel('TCR comparison',1010,418,530,438,'#f7eef1');text('C   TCR CONTRAST',1034,440,470,21);
  const tcr=asset('tcr',1050,529,155),mhc=asset('mhc-peptide',1320,529,155);connect(tcr,mhc,'TCR recognizes peptide–MHC-I','line');
  text('TCR → peptide–MHC-I',1050,719,450,21);text('CAR binding in this example does not require peptide presentation by MHC.',1040,766,450,18);
  text('CD28 or 4-1BB is shown as an alternative costimulatory domain; both are not implied in the same second-generation construct.',60,897,1480,18);footerY=958;
 } else if(id==='car-ex-vivo-vs-in-vivo') {
  panel('Ex vivo manufacture',60,150,1480,300);text('A   EX VIVO MANUFACTURE',82,173,1400,22);
  row([['tube','Leukapheresis','Collect T cells'],['electro','Engineer','Introduce CAR construct'],['flask','Expand','Manufactured CAR-T product'],['car-t-effector','Infuse','Administer engineered cells'],['apoptosis','Kill','CAR effectors attack tumor']],86,223,1410,105);
  panel('In vivo programming',60,479,1480,535,'#f1edf4');text('B   IN VIVO / IN SITU PROGRAMMING',82,501,1400,22);
  text('Systemic targeted delivery',86,551,320,20);
  const lv=asset('targeted-lv',110,594,120),lnp=asset('targeted-lnp',110,814,120);
  text('Targeted LV',87,718,240,18);text('Durable (integrating)',87,750,320,17);
  text('Targeted LNP · CAR mRNA',87,940,340,18);text('Transient (mRNA)',87,970,320,17);
  const escape=asset('endosomal-escape',383,814,110);text('Endosomal escape',334,940,245,16);
  const cell=asset('endogenous-t-cell',598,690,170),effector=asset('car-t-effector',912,690,170),tumor=asset('tumor',1262,690,170);
  connect(lv,cell,'Targeted LV → in situ CAR gene delivery');connect(lnp,escape,'LNP uptake');connect(escape,cell,'CAR mRNA reaches cytosol');connect(cell,effector,'Express CAR in endogenous T cells');connect(effector,tumor,'Antigen recognition → kill');
  text('Program circulating /\nendogenous T cells',573,879,300,19);text('CAR+ effectors',900,879,265,19);text('Tumor killing',1250,879,255,19);
  asset('granzyme',1180,773,65);asset('apoptosis',1400,816,75);
  text('LV and LNP are alternative delivery paths. Targeting ligands are schematic (e.g. anti-CD3, CD8 or CD7 cues); tropism and expression duration are study dependent.',60,1046,1480,18);
  text('Integrating LV can support durable expression; delivered mRNA is transient. This schematic does not establish efficacy, persistence or delivery efficiency.',60,1105,1480,18);footerY=1172;
 } else if(id==='riptac-moa') {
  const labels=['01  SELECTIVE ACCUMULATION','02  TERNARY COMPLEX','03  HOLD-AND-KILL'];
  labels.forEach((s,i)=>{panel(s,60+i*500,160,480,520,i===2?'#f7eef1':'#f1edf4');text(s,82+i*500,184,440,20);});
  asset('tp-positive',75,245,310);asset('riptac-tp',150,280,150);asset('riptac',176,298,180);
  text('TP binder — linker — EP binder',83,525,440,18);text('TP binding retains RIPTAC in a TP+ cell; accumulation is context dependent.',83,567,432,18);
  const ternary=asset('riptac-ternary',653,274,255);text('TP : RIPTAC : EP',627,544,405,22);text('Induced proximity stabilizes the complex.',585,594,432,18);
  const hold=asset('hold-kill',1110,298,140),death=asset('apoptosis',1340,298,140);connect(hold,death,'EP-function abrogation → apoptosis');text('EP function blocked → apoptosis',1085,516,432,20);text('Selective death in the TP+ model',1085,571,432,18);
  // Step relationships use text endpoints above the illustrations to avoid
  // drawing mechanistic arrows through the intracellular protein complex.
  const step1=text('TP binding',355,251,150,16),step2=text('EP recruitment',572,251,190,16);connect(step1,step2,'Accumulate then recruit EP');connect(ternary,hold,'Ternary complex abrogates EP function');
  panel('TP-negative comparator',60,714,1480,232,'#edf4f5');asset('tp-negative',98,750,155);asset('riptac-ep',337,767,110);asset('riptac',500,772,140);
  text('TP− NORMAL CELL · SPARED IN THE SELECTIVITY MODEL',710,753,780,22);
  text('No TP-mediated stable ternary complex; EP function retained. Selectivity requires an appropriate exposure window and is not guaranteed in every normal tissue.',710,801,770,18);
  text('Induced proximity / hold-and-kill: EP-function abrogation, not ubiquitin–proteasome degradation. TP and EP represent roles, not named molecular targets.',60,982,1480,18);footerY=1052;
 }
 text('ORIGINAL EDITABLE SCHEMATIC · Not to scale · Scientific review pending · CC BY 4.0 artwork · Sources in figure evidence',60,footerY,1480,14,'#52716e');
 const refs=THERAPEUTICS_REFERENCES[id==='riptac-moa'?'riptac':id.startsWith('car-')?'car':id==='bite-moa'?'engager':['adc-moa','bsadc-architecture'].includes(id)?'adc':'antibody'];
 const d={schemaVersion:'0.1',title:t.name,width,height:footerY+72,background:'#ffffff',nodes:[...nodes.filter(n=>n.type==='panel'),...edges,...nodes.filter(n=>n.type!=='panel')],templateId:id,templateVersion:t.version,diagramLayout:'comparison',claims:[{id:uid(),text:`${t.description} Conceptual mechanism; scientific review pending. Selectivity and efficacy are study dependent.`,source:refs.map(r=>`${r.title}: ${r.url}`).join('\n'),status:'draft'}],aiProvenance:[]};
 synchronizeConnections(d);return d;
}

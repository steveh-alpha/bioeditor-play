import {ASSETS} from '../assets/library.js';
import {VIRUSES_VERSION,VIRUSES_REFERENCES} from '../assets/viruses.js';
import {wrapLabel} from '../svg.js';
import {connectNodes,synchronizeConnections} from '../editor/connections.js';

export const VIRUSES_TEMPLATES=[
 ['virus-particle-gallery','Virus & VLP particle gallery','Viruses','Enveloped, naked, AAV, AdV, LV and VLP particles, plus empty and full capsids.',['virus-enveloped','virus-icosahedral','aav','adenovirus','lentiviral-vector','vlp','capsid-empty','capsid-full','format-fab','virus-spike'],'virus virion envelope spike glycoprotein capsid AAV adenovirus lentivirus retrovirus VLP virus-like particle'],
 ['aav-gene-therapy-moa','AAV gene-therapy MoA','Gene delivery','Binding → uptake → endosomal transit → nuclear entry → episomal expression.',['aav','receptor','entry-receptor-arrow','early-endosome','endosomal-escape','nuclear-pore-entry','nucleus','episomal-transgene','cargo-ssrna','protein-complex','aav-itr-cassette'],'AAV ITR gene therapy virus gene delivery'],
 ['vlp-vaccine-moa','VLP vaccine MoA','VLP / vaccine','Antigen display → B-cell recognition → antibody response; no viral replication.',['vlp','vlp-enveloped','b-cell','format-igg','format-fab','virus-spike','badge-vlp'],'VLP virus-like particle vaccine platform virus antigen display antibody'],
 ['empty-vs-full-capsid','Empty vs partial vs full capsid','Gene delivery','A manufacturing / QC comparison of genome-cargo states; illustrative categories, not measured results.',['capsid-empty','capsid-partial','capsid-full','badge-capsid-empty','badge-capsid-partial','badge-capsid-full','aav-itr-cassette'],'virus AAV empty capsid full capsid partial capsid QC packaging genome cargo'],
 ['lv-vs-aav-vs-vlp','LV vs AAV vs VLP','Gene delivery','Compare an integrating LV vector, episomal AAV gene delivery and a non-genomic VLP vaccine platform.',['lentiviral-vector','aav','vlp','cargo-ssrna','aav-itr-cassette','badge-vlp'],'virus lentivirus retrovirus AAV VLP virus-like particle gene therapy vaccine platform']
].map(([id,name,category,description,assets,tags])=>({id,name,category,description,subtitle:description,assets,tags,
 version:VIRUSES_VERSION,creator:'BioEditor project',source:'BioEditor original Virus & VLP template compositions v0.6.0',creationMethod:'Independently authored native editable objects and relationships; existing BioEditor support and antibody assets reused',
 license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',reviewStatus:'scientific-review-pending',rightsReviewStatus:'pending',modifications:'Original composition; no third-party artwork imported.',limitations:'Conceptual schematic; not to scale. No clinical tropism, titer, potency or safety is implied.'}));

export function makeVirusTemplate(id) {
 const t=VIRUSES_TEMPLATES.find(t=>t.id===id);if(!t)throw Error('Unknown virus template');
 const nodes=[],edges=[],uid=()=>crypto.randomUUID();
 const text=(label,x,y,w=400,size=18,color='#294845')=>{const n={id:uid(),type:'text',label,x,y,w,h:Math.max(size*1.4,wrapLabel(label,w,size).length*size*1.3),fontSize:size,color,wrap:true};nodes.push(n);return n;};
 const panel=(label,x,y,w,h,color='#edf4f5')=>{const n={id:uid(),type:'panel',label,x,y,w,h,color};nodes.push(n);return n;};
 const asset=(id,x,y,w=140)=>{const a=ASSETS.find(a=>a.id===id);if(!a)throw Error(`Missing virus component ${id}`);const n={id:uid(),type:'asset',assetId:id,artworkVersion:a.version,label:a.name,x,y,w,h:w,color:a.color};nodes.push(n);return n;};
 const connect=(a,b,label,style='arrow')=>{const n=connectNodes(a,b,style);n.label=label;edges.push(n);return n;};
 // A binding composition reuses the existing Fab artwork, including its chains.
 // Binding tip of the rotated Fab touches the detachable spike tip.
 const boundSpike=(x,y)=>{
  const spike=asset('virus-spike',x+100,y+75,110);
  const fab=asset('format-fab',x+64.5,y+42.6,110);fab.rotation=142;
  return {spike,fab};
 };
 text(t.name,60,32,1480,34);text(t.description,60,90,1480,18);
 let footerY=960;
 if(id==='virus-particle-gallery') {
  const cards=[['virus-enveloped','Enveloped','Envelope + spikes + capsid'],['virus-icosahedral','Naked / icosahedral','Non-enveloped; cargo unspecified'],['aav','AAV','Small capsid + ssDNA cue'],['adenovirus','Adenovirus · AdV','Capsid + fibers + dsDNA'],['lentiviral-vector','LV / retroviral vector','Envelope + capsid + paired RNA'],['vlp','VLP · no genome','Antigen shell; non-replicating'],['capsid-empty','Empty capsid','No genome cargo'],['capsid-full','Full capsid','Genome cargo; potency unspecified']];
  cards.forEach(([a,label,note],i)=>{const x=60+i%4*375,y=155+Math.floor(i/4)*285;panel(label,x,y,355,265);asset(a,x+103,y+16,150);text(label,x+20,y+170,315,21);text(note,x+20,y+207,315,16);});
  panel('Bound spike and identity callouts',60,748,1480,268,'#f8f1e8');
  boundSpike(90,765);text('Neutralizing Fab–spike example',82,973,410,17);
  text('Identity is an explicit annotation',480,769,960,22);
  for(const [i,[a,label]] of [['badge-gene-delivery','Vector design must be specified'],['badge-infectious-virus','Infectivity requires evidence'],['badge-vlp','No genome; non-replicating']].entries()) {
   asset(a,500+i*340,794,135);text(label,480+i*340,935,315,16);
  }
  text('Particles are not size-calibrated. Surface modules, capsid and cargo are independently editable. Binding is illustrative; neutralization depends on the antibody and epitope.',60,1043,1480,18);footerY=1118;
 } else if(id==='aav-gene-therapy-moa') {
  const labels=['01  Bind','02  Internalize','03  Endosome','04  Nuclear entry','05  Episome','06  Expression'];
  const notes=['Attachment / receptor context is study dependent.','Receptor-mediated uptake.','Trafficking and escape; intermediate compartments omitted.','Pore transport and uncoating are simplified.','Uncoating and DNA processing yield an expression template.','Transcription → translation → transgene product.'];
  const anchors=[];
  labels.forEach((s,i)=>{const x=60+i*250;panel(s,x,160,230,410);text(s,x+15,182,205,21);anchors.push(text(String(i+1).padStart(2,'0'),x+89,230,48,17));text(notes[i],x+16,448,198,16);});
  for(let i=1;i<anchors.length;i++)connect(anchors[i-1],anchors[i],`${labels[i-1]} → ${labels[i]}`);
  asset('aav',86,278,110);asset('receptor',144,339,85);
  asset('entry-receptor-arrow',340,288,160);asset('aav',350,273,65);
  asset('early-endosome',580,270,175);asset('aav',634,324,65);asset('endosomal-escape',703,357,70);
  asset('nuclear-pore-entry',842,295,150);asset('aav',881,266,62);
  asset('nucleus',1080,280,185);asset('episomal-transgene',1108,366,75);
  asset('cargo-ssrna',1336,279,105);asset('protein-complex',1390,352,90);
  panel('Expression cassette',60,610,725,290);text('ITR-FLANKED TRANSGENE CASSETTE',84,632,680,21);
  asset('aav-itr-cassette',90,650,240);text('ITR · promoter · transgene · poly(A) · ITR',350,693,390,19);text('Separate editable genome map. Block lengths do not encode sequence length or packaging capacity.',350,762,390,17);
  panel('Nuclear fate',810,610,730,290,'#f8f1e8');text('EPISOMAL EXPRESSION',834,632,680,21);
  text('Recombinant AAV is shown with predominantly episomal DNA, not integration as the default outcome. Rare integration is not excluded.',834,686,670,19);
  text('Expression and persistence depend on the construct, cell type and cell division. This route does not imply a clinical tropism or delivery efficiency.',834,790,670,17);
  text('Schematic route through a target cell; receptor usage, trafficking, uncoating and second-strand processing require study-specific review.',60,937,1480,18);footerY=1007;
 } else if(id==='vlp-vaccine-moa') {
  const steps=[];
  for(const [i,label] of ['01  ANTIGEN DISPLAY','02  B-CELL RECOGNITION','03  ANTIBODY RESPONSE'].entries()){panel(label,60+i*500,160,480,470,i===0?'#f8f1e8':'#edf4f5');steps.push(text(label,82+i*500,183,435,22));}
  const display=asset('vlp',125,273,205);asset('badge-vlp',338,313,160);
  text('Repeated capsid antigens',85,518,425,21);text('No viral genome · no viral replication',85,562,425,17);
  const cell=asset('b-cell',767,284,210);asset('vlp',608,331,130);
  // The existing IgG serves as a membrane BCR cue, not a new antibody format.
  const bcr=asset('format-igg',675,318,140);bcr.rotation=270;
  text('Surface immunoglobulin / BCR',584,518,430,21);text('Antigen recognition; activation needs context',584,562,430,17);
  const ab=asset('format-igg',1200,285,185);asset('format-igg',1115,370,90);asset('format-igg',1370,370,90);
  text('Antigen-specific antibodies',1085,518,425,21);text('Activation / differentiation steps simplified',1085,562,425,17);
  connect(steps[0],steps[1],'VLP antigen is recognized by B-cell receptor');connect(steps[1],steps[2],'B-cell activation and differentiation → antibodies');
  panel('Neutralization example',60,667,730,302,'#f8f1e8');text('ANTIBODY RECOGNITION OF A SURFACE SPIKE',83,687,680,20);boundSpike(89,737);
  text('Neutralizing Fab bound to spike',382,776,365,21);text('Example of matched antigen recognition. Binding alone does not establish neutralization in an assay.',382,840,365,17);
  panel('Alternative envelope',815,667,725,302);asset('vlp-enveloped',849,730,175);text('Enveloped VLP alternative',1050,718,455,22);
  text('Lipid envelope + displayed antigens; still no viral genome. No replication step is present in this template.',1050,775,450,18);
  text('T-cell help, antigen presentation and germinal-center steps are omitted. Antibody specificity and protection must be established experimentally.',60,1003,1480,18);footerY=1080;
 } else if(id==='empty-vs-full-capsid') {
  const descriptions=['No genome cargo shown. Empty capsid is a cargo state, not automatically a vaccine VLP.','Incomplete cargo is shown as a short strand. Identity and length are unspecified.','Genome cargo is shown; an intact therapeutic cassette and potency cannot be inferred from filling alone.'];
  for(const [i,state] of ['empty','partial','full'].entries()) {
   const x=60+i*500;panel(state,x,160,480,555,i===1?'#f8f1e8':'#edf4f5');asset(`badge-capsid-${state}`,x+125,159,230);asset(`capsid-${state}`,x+112,310,255);text(descriptions[i],x+27,595,425,18);
  }
  panel('Interpretation',60,750,1480,240);asset('aav-itr-cassette',90,755,230);text('QC CLASSIFICATION ≠ FUNCTIONAL PERFORMANCE',380,777,1100,23);
  text('Equal shell geometry makes cargo the comparison variable. These categories are conceptual; no measured proportions, titers or acceptance thresholds are supplied.',380,827,1090,18);
  text('Characterize cargo identity / integrity and functional activity separately. Full-looking capsids are not a potency or safety claim.',380,906,1090,18);footerY=1030;
 } else if(id==='lv-vs-aav-vs-vlp') {
  const columns=[
   {particle:'lentiviral-vector',heading:'Integrating LV vector',cargo:'Paired ssRNA vector genome',fate:'Reverse transcription → DNA → chromosomal integration in this example.',use:'Gene delivery / transgene expression',limit:'Integrating LV is the selected design; integration-deficient LV variants also exist.'},
   {particle:'aav',heading:'AAV gene therapy',cargo:'ITR-flanked DNA cassette',fate:'Nuclear DNA processing → predominantly episomal expression; rare integration is not excluded.',use:'Gene delivery / transgene expression',limit:'Persistence depends on cell division, construct and tissue context.'},
   {particle:'vlp',heading:'VLP vaccine platform',cargo:'No viral genome',fate:'No genome delivery or viral replication; antigens are recognized by the immune system.',use:'Antigen display / immune recognition',limit:'Non-replicating does not imply clinical safety, protection or a measured antibody titer.'}
  ];
  for(const [i,c] of columns.entries()) {
   const x=60+i*500;panel(c.heading,x,160,480,840,i===2?'#f8f1e8':'#edf4f5');text(c.heading,x+24,183,430,24);asset(c.particle,x+138,239,200);
   text('PACKAGED CARGO',x+25,469,425,16);text(c.cargo,x+25,505,315,21);asset(['cargo-ssrna','aav-itr-cassette','badge-vlp'][i],x+357,470,98);
   text('CELLULAR FATE',x+25,571,425,16);text(c.fate,x+25,608,425,19);
   text('INTENDED ROLE',x+25,718,425,16);text(c.use,x+25,754,425,20);
   text(c.limit,x+25,847,425,17);
  }
  text('Alternative platforms, not interchangeable performance claims. Particle icons do not encode tropism, dose, titer, immunogenicity, potency or safety.',60,1040,1480,18);footerY=1120;
 }
 text('ORIGINAL EDITABLE SCHEMATIC · Not to scale · Scientific review pending · CC BY 4.0 artwork · Sources in figure evidence',60,footerY,1480,14,'#52716e');
 const keys=id==='aav-gene-therapy-moa'?['aav']:id==='vlp-vaccine-moa'?['vlp']:id==='empty-vs-full-capsid'?['qc']:id==='lv-vs-aav-vs-vlp'?['lv','aav','vlp']:['adenovirus','lv','aav','vlp','qc'];
 const refs=keys.flatMap(k=>VIRUSES_REFERENCES[k]);
 const d={schemaVersion:'0.1',title:t.name,width:1600,height:footerY+72,background:'#ffffff',nodes:[...nodes.filter(n=>n.type==='panel'),...edges,...nodes.filter(n=>n.type!=='panel')],templateId:id,templateVersion:t.version,diagramLayout:'comparison',claims:[{id:uid(),text:`${t.description} Conceptual schematic; scientific review pending. No clinical performance is implied.`,source:refs.map(r=>`${r.title}: ${r.url}`).join('\n'),status:'draft'}],aiProvenance:[]};
 synchronizeConnections(d);return d;
}

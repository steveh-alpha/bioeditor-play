import {illustrationPalette} from './technical.js';
import {escapeXML} from '../svg.js';

// New IDs only: legacy virus, phage and targeted-lv artwork stays frozen.
// Names and order are the persisted Edit-parts API for this revision.
export const VIRUSES_VERSION='0.6.0';
export const VIRUSES_REFERENCES={
 aav:[{title:'An essential receptor for adeno-associated virus infection',url:'https://www.nature.com/articles/nature16465'},{title:'Recombinant AAV vector genomes take the form of long-lived, transcriptionally competent episomes in human muscle',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5374867/'}],
 adenovirus:[{title:'Model of the trimeric fiber and its interactions with the pentameric penton base of human adenovirus',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC3392045/'}],
 lv:[{title:'In vivo gene delivery and stable transduction of nondividing cells by a lentiviral vector',url:'https://pubmed.ncbi.nlm.nih.gov/8602510/'}],
 vlp:[{title:'Papillomavirus L1 major capsid protein self-assembles into virus-like particles that are highly immunogenic',url:'https://pubmed.ncbi.nlm.nih.gov/1334560/'}],
 qc:[{title:'Quantification of empty, partially filled and full AAV vectors using mass photometry',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10341871/'}]
};
const definitions=[
 ['virus-enveloped','Enveloped virus','Viruses','virus virion envelope spike glycoprotein capsid','Generic envelope, surface proteins and internal capsid; genome type is unspecified.','lv'],
 ['virus-icosahedral','Non-enveloped icosahedral virus','Viruses','virus virion naked capsid nonenveloped','Faceted naked capsid; cargo state is unspecified. Facets do not encode atomic geometry.','adenovirus'],
 ['aav','AAV vector particle','Gene delivery','AAV adeno associated virus capsid gene therapy virion','Small icosahedral capsid with removable ssDNA cue; ITR cassette is also available separately.','aav'],
 ['adenovirus','Adenovirus particle · AdV','Viruses','adenovirus AdV virus virion capsid fiber knob dsDNA','Larger schematic capsid with detachable fiber/knobs and dsDNA; no serotype or infectivity inferred.','adenovirus'],
 ['lentiviral-vector','Lentiviral / retroviral vector','Gene delivery','lentivirus lentiviral LV retrovirus retroviral virus virion gene therapy RNA envelope glycoprotein','Generic LV vector without a T-cell targeting ligand; paired RNA cues and cone-like capsid. Integration depends on vector design.','lv'],
 ['vlp','Virus-like particle · no genome','VLP / vaccine','virus virion VLP virus-like particle capsid vaccine platform non replicating','Antigen-bearing protein shell without viral genome; non-replicating VLP concept.','vlp'],
 ['vlp-enveloped','Enveloped VLP · no genome','VLP / vaccine','virus VLP virus-like particle envelope glycoprotein vaccine platform non replicating','Envelope plus antigen-bearing shell, without viral genome; non-replicating VLP concept.','vlp'],
 ...[['empty','Empty','No genome cargo shown.'],['partial','Partially filled','Short cargo cue; no specific fragment length or percentage.'],['full','Full / genome-containing','Genome cargo cue; completeness, identity and potency require measurements.']].map(([id,name,note])=>[`capsid-${id}`,`${name} capsid`,'Gene delivery',`virus AAV capsid ${id} capsid QC packaging manufacturing`,`${note} Same capsid geometry across QC states.`,'qc']),
 ...[['ssdna','ssDNA'],['ssrna','ssRNA'],['dsdna','dsDNA']].map(([id,label])=>[`cargo-${id}`,`${label} cargo`,'Gene delivery',`virus genome cargo ${label} gene therapy`,`${label} topology cue only; sequence-free and not length-scaled.`,'aav']),
 ['aav-itr-cassette','ITR-flanked transgene cassette','Gene delivery','virus AAV ITR gene therapy ssDNA genome cargo transgene cassette','Separate ITR ends, promoter, transgene and poly(A) blocks; functional map, not DNA sequence or packaging capacity.','aav'],
 ['viral-packaging-signal','Packaging signal / genome map','Gene delivery','virus lentivirus retrovirus packaging signal psi genome RNA cargo','Generic sequence-free genome with a marked packaging region; no functional sequence is supplied.','lv'],
 ['virus-envelope','Lipid envelope','Viruses','virus virion envelope lipid membrane','Two contours indicate a lipid envelope; molecular lipid composition is omitted.','lv'],
 ['virus-spike','Spike module','Viruses','virus spike glycoprotein antigen envelope','Generic surface spike; shape does not identify a virus or epitope.','lv'],
 ['virus-glycoprotein','Glycoprotein module','Viruses','virus glycoprotein spike envelope','Generic surface glycoprotein; oligomeric state and glycosylation are unspecified.','lv'],
 ['adenovirus-fiber-knob','Fiber–knob module','Viruses','virus adenovirus AdV fiber knob','Schematic shaft and terminal knob; not a serotype-accurate structure.','adenovirus'],
 ['entry-receptor-arrow','Receptor-mediated entry arrow','Gene delivery','virus receptor mediated entry internalize uptake gene therapy','Generic uptake route; receptor identity and trafficking depend on the study.','aav'],
 ['nuclear-pore-entry','Nuclear entry / NPC cue','Gene delivery','virus nucleus nuclear pore NPC entry gene therapy','Interrupted double membrane and pore with entry arrow; no pore stoichiometry or transport rate.','aav'],
 ['episomal-transgene','Episomal transgene','Gene delivery','virus AAV episome episomal expression gene therapy nuclear DNA','Circular double-stranded DNA expression template; simplified episomal outcome, not chromosomal integration.','aav'],
 ...[['empty','EMPTY','No genome'],['partial','PARTIAL','Partial cargo'],['full','FULL','Genome cargo']].map(([id,label,note])=>[`badge-capsid-${id}`,`${label} capsid state badge`,'Gene delivery',`virus ${id} capsid genome QC manufacturing`,`${note}; annotation only, not a measured batch classification.`,'qc']),
 ['badge-gene-delivery','Gene delivery identity badge','Gene delivery','virus gene therapy vector delivery','Identity annotation; replication competence and vector design must be specified.','aav'],
 ['badge-infectious-virus','Infectious virus identity badge','Viruses','virus virion infectious infection','Explicit author-assigned identity; morphology alone cannot establish infectivity.','lv'],
 ['badge-vlp','VLP / non-replicating identity badge','VLP / vaccine','virus VLP virus-like particle vaccine platform no genome non replicating','Non-genomic, non-replicating VLP identity; does not assert clinical safety.','vlp'],
 ...[2,5,8,9].map(n=>[`badge-aav${n}`,`AAV${n} label badge`,'Gene delivery',`virus AAV AAV${n} serotype gene therapy`,`Label only; shared badge geometry. No tropism, titer, safety or atomic structure is encoded.`,'aav'])
];
export const VIRUSES_ASSETS=definitions.map(([id,name,category,tags,description,reference])=>({
 id,kind:id,name,category,tags,description,version:VIRUSES_VERSION,color:category==='Viruses'?'#7ea4cd':category==='VLP / vaccine'?'#e6ad75':'#62aaa0',
 creator:'BioEditor project',source:'BioEditor original Virus & VLP schematics v0.6.0',creationMethod:'Independently authored procedural SVG from basic geometry; no third-party artwork imported',
 license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',reviewStatus:'scientific-review-pending',rightsReviewStatus:'pending',modifications:'Original modular illustration.',
 limitations:`${description} Conceptual schematic; not to scale. Scientific review pending. No clinical tropism, titer or safety is implied.`,
 references:VIRUSES_REFERENCES[reference].map(r=>({...r,role:'Scientific text context only; no artwork or structural coordinates reused'}))
}));

export function virusParts(id,color,version) {
 if(!VIRUSES_ASSETS.some(a=>a.id===id))return null;
 if(version!==undefined&&version!==VIRUSES_VERSION)throw Error('Unsupported illustration revision.');
 const p=illustrationPalette(color),parts=[];
 const add=(name,svg)=>parts.push({name,shape:'module',svg:`<g data-module="${escapeXML(name)}">${svg}</g>`});
 const path=(d,fill='none',width=1.4)=>`<path d="${d}" fill="${fill}" stroke="${p.ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const circle=(x,y,r,fill=p.fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${p.ink}" stroke-width="1.2"/>`;
 const rect=(x,y,w,h,fill=p.fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${p.ink}" stroke-width="1.1"/>`;
 const label=(s,x=50,y=54,size=9)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" fill="${p.ink}">${escapeXML(s)}</text>`;
 const transform=(svg,s=1,x=0,y=0)=>`<g transform="translate(${x} ${y}) scale(${s})">${svg}</g>`;
 // Triangular outer facets surround a conceptual cargo cutaway window.
 const capsid=()=>path('M50 14L81 32V68L50 86 19 68V32Z',p.fill)+path('M50 14L67 39 81 32M67 39L67 61 81 68M67 61L50 86 33 61 19 68M33 61V39L19 32M33 39L50 14M33 39H67M33 61H67M19 32L33 61M67 39L81 68', 'none',.9);
 const envelope=()=>circle(50,50,32,p.mid)+circle(50,50,28,p.fill);
 const strand=(rna=false,short=false)=>path(short?'M36 48C39 39 42 39 45 48S51 57 54 48':'M32 48C36 36 40 36 44 48S52 60 56 48S64 36 68 48','none',2)+path(short?'M40.5 41.25v-4M49.5 54.75v4':rna?'M38 39l-3-4M50 57l3 4M62 39l3-4':'M38 39v-5M50 57v5M62 39v-5','none',1.1);
 const duplex=()=>path('M32 45Q38 35 44 45T56 45T68 45M32 55Q38 45 44 55T56 55T68 55','none',1.6)+path('M34 42v10m7-10v10m7-5v10m7-3v10m7-17v10m5-12v10','none',.8);
 const spike=()=>path('M50 20V12','none',2.6)+path('M46 12L44 7 50 4 56 7 54 12Z',p.accent);
 const glyco=()=>path('M50 20V12','none',2.6)+circle(47,8,3.5,p.accent)+circle(53,8,3.5,p.accent);
 const fiber=()=>path('M50 19V7','none',2)+path('M45 7L43 3H57L55 7Z',p.accent);
 const radial=(name,shape,count=8)=>{for(let i=0;i<count;i++)add(`${name} ${i+1}`,`<g transform="rotate(${i*360/count} 50 50)">${shape}</g>`);};
 const noGenome=()=>`<circle cx="50" cy="49" r="13" fill="none" stroke="${p.detail}" stroke-width="1.1" stroke-dasharray="2 2"/>`+label('NO',50,47,7)+label('GENOME',50,56,6);
 const particle=['virus-enveloped','lentiviral-vector','vlp-enveloped'].includes(id);
 if(particle) {
  add('Lipid envelope',envelope());radial(id==='virus-enveloped'?'Spike':'Glycoprotein',id==='virus-enveloped'?spike():glyco());
  add('Internal capsid',id==='lentiviral-vector'?path('M41 29L59 29 69 68Q50 78 31 68Z',p.mid):transform(capsid(),.57,21.5,21.5));
  if(id==='lentiviral-vector'){add('RNA genome copy 1',transform(strand(true),.65,17.5,10));add('RNA genome copy 2',transform(strand(true),.65,17.5,24));}
  if(id==='vlp-enveloped')add('No viral genome',noGenome());
 } else if(['virus-icosahedral','aav','adenovirus','vlp','capsid-empty','capsid-partial','capsid-full'].includes(id)) {
  const small=id==='aav';add('Icosahedral capsid',small?transform(capsid(),.78,11,11):capsid());
  if(id==='adenovirus'){radial('Fiber–knob',fiber(),6);add('dsDNA genome',duplex());}
  if(id==='aav')add('ssDNA genome',transform(strand(),.68,16,16));
  if(id==='vlp') {
   // Surface antigen dots are distinct from detachable envelope spikes.
   for(const [i,[x,y]] of [[50,14],[81,32],[81,68],[50,86],[19,68],[19,32]].entries())add(`Capsid antigen ${i+1}`,circle(x,y,4,p.accent));
   add('No viral genome',noGenome());
  }
  if(id==='capsid-empty')add('Empty core',noGenome());
  if(id==='capsid-partial')add('Partial genome cargo',strand(false,true));
  if(id==='capsid-full')add('Genome cargo',strand());
 } else if(id.startsWith('cargo-')) {
  add(id.slice(6)==='dsdna'?'Double-stranded DNA':'Single-stranded backbone',transform(id==='cargo-dsdna'?duplex():strand(id==='cargo-ssrna'),1.6,-30,-32));
  add('Cargo identity',label({'cargo-ssdna':'ssDNA','cargo-ssrna':'ssRNA','cargo-dsdna':'dsDNA'}[id],50,80,12));
 } else if(id==='aav-itr-cassette') {
  add('Cassette backbone',path('M9 50H91'));
  add('Left ITR',path('M12 50V27H5V40H18V27H12','none',1.8)+label('ITR',12,69,7));
  add('Promoter',rect(23,41,15,18,p.mid)+label('P',30.5,53,8));
  add('Transgene',rect(41,41,27,18,p.accent)+label('Gene',54.5,53,7));
  add('Poly(A) signal',rect(71,41,11,18,p.mid)+label('pA',76.5,53,6));
  add('Right ITR',path('M88 50V27H95V40H82V27H88','none',1.8)+label('ITR',88,69,7));
 } else if(id==='viral-packaging-signal') {
  add('Genome backbone',path('M8 56H92','none',2));
  add('Packaging signal',path('M27 56V35Q17 18 28 15Q39 18 30 35V56','none',1.8)+label('Packaging',29,76,8));
  add('Cargo region',rect(46,45,39,22,p.mid)+label('Cargo',65,59,9));
 } else if(id==='virus-envelope')add('Lipid envelope',envelope());
 else if(['virus-spike','virus-glycoprotein','adenovirus-fiber-knob'].includes(id)) {
  const s=id==='virus-spike'?spike():id==='virus-glycoprotein'?glyco():fiber();
  add(id==='adenovirus-fiber-knob'?'Fiber–knob':id==='virus-spike'?'Spike':'Glycoprotein',transform(s,3,-100,12));
 } else if(id==='entry-receptor-arrow') {
  add('Cell membrane',path('M8 72H38Q50 95 62 72H92','none',3));
  add('Receptor',path('M49 72V56L41 48M49 56L57 48','none',2.4));
  add('Entry route',path('M18 23Q77 10 78 60M72 53L78 61 85 54','none',2.2));
 } else if(id==='nuclear-pore-entry') {
  add('Nuclear envelope',path('M12 34H36M64 34H88M12 65H36M64 65H88','none',2.3));
  add('Nuclear pore',rect(32,30,9,39,p.mid)+rect(59,30,9,39,p.mid));
  add('Nuclear entry route',path('M50 12V87M44 79L50 87 56 79','none',2));
 } else if(id==='episomal-transgene') {
  add('Episomal dsDNA',circle(50,47,30,'none')+circle(50,47,26,'none'));
  add('Transgene',path('M39 19Q50 15 61 19L59 25Q50 22 41 25Z',p.accent));
  add('Episome identity',label('EPISOME',50,51,9));
 } else if(id.startsWith('badge-')) {
  const lines={'badge-capsid-empty':['EMPTY','No genome'],'badge-capsid-partial':['PARTIAL','Partial cargo'],'badge-capsid-full':['FULL','Genome cargo'],'badge-gene-delivery':['GENE','DELIVERY'],'badge-infectious-virus':['INFECTIOUS','VIRUS'],'badge-vlp':['VLP','Non-replicating']}[id];
  add('Badge frame',rect(3,28,94,44,p.mid));
  add('Identity label',lines?label(lines[0],50,46,10)+label(lines[1],50,62,9):label(id.slice(6).toUpperCase(),50,55,16));
 }
 return parts;
}
export const virusGlyph=(id,color,version)=>virusParts(id,color,version)?.map(p=>p.svg).join('')??null;

import {wrapLabel} from '../svg.js';
import {ASSETS} from '../assets/library.js';
import {applyStyle} from '../studio.js';
import {connectNodes,synchronizeConnections} from '../editor/connections.js';

export const DIAGRAM_LAYOUTS=[
  {id:'process',name:'Process',description:'A sequence of steps with attached arrows.'},
  {id:'cycle',name:'Cycle',description:'A closed loop of stages.'},
  {id:'branching',name:'Branching',description:'One starting point with multiple outcomes.'},
  {id:'comparison',name:'Comparison',description:'Parallel subjects with no implied relationship.'}
];
export const DIAGRAM_TEMPLATES=[
  {id:'secretory-route',name:'Protein trafficking',category:'Cell biology',layout:'process',assets:['rough-er','golgi','vesicle'],labels:['Endoplasmic reticulum','Golgi apparatus','Transport vesicle'],description:'An editable secretory-route scaffold'},
  {id:'cell-compartments',name:'Cell compartments',category:'Cell biology',layout:'comparison',assets:['nucleus','mitochondrion','lysosome','ribosome'],labels:['Nucleus','Mitochondrion','Lysosome','Ribosome'],description:'Compare cellular compartments and machinery'},
  {id:'cell-cycle',name:'Cell-cycle stages',category:'Cell biology',layout:'cycle',assets:['nucleus','dna','chromosome','epithelial'],labels:['G1','S','G2','M'],description:'Four editable stage placeholders; symbols are schematic'},
  {id:'gene-expression',name:'Gene expression',category:'Genetics',layout:'process',assets:['dna','rna','ribosome','protein-complex'],labels:['DNA','RNA','Translation','Protein product'],description:'An editable information-flow scaffold'},
  {id:'chromatin',name:'DNA packaging',category:'Genetics',layout:'process',assets:['dna','nucleosome','chromosome'],labels:['DNA','Nucleosome','Condensed chromosome'],description:'Compare schematic scales of DNA organization'},
  {id:'signaling',name:'Signal to response',category:'Molecular biology',layout:'process',assets:['cytokine','receptor','enzyme','nucleus'],labels:['Extracellular signal','Receptor','Intracellular mediator','Cellular response'],description:'Replace generic stages with your studied mechanism'},
  {id:'microbe-comparison',name:'Microbial forms',category:'Microbiology',layout:'comparison',assets:['bacterium','coccus','yeast','phage'],labels:['Rod bacterium','Coccus cluster','Budding yeast','Bacteriophage'],description:'Conceptual forms, shown without a common scale'},
  {id:'microbe-study',name:'Microbiology experiment',category:'Microbiology',layout:'process',assets:['bacterium','dish','microscope','gel'],labels:['Biological sample','Culture condition','Imaging','Example readout'],description:'Plan a study without prescribing experimental conditions'},
  {id:'neural-route',name:'Neural communication',category:'Neuroscience',layout:'process',assets:['neuron','myelin','synapse','neuron'],labels:['Source neuron','Axonal conduction','Synaptic transmission','Target neuron'],description:'A generic neural communication scaffold'},
  {id:'plant-growth',name:'Plant development',category:'Plant biology',layout:'process',assets:['seed','seedling','leaf','flower'],labels:['Germination','Seedling','Vegetative growth','Flowering'],description:'An editable plant life-history sequence'},
  {id:'plant-resources',name:'Plant resource inputs',category:'Plant biology',layout:'comparison',assets:['sun','water','soil','chloroplast'],labels:['Light','Water','Soil context','Chloroplast'],description:'Arrange inputs and processes for your plant study'},
  {id:'organ-comparison',name:'Organ overview',category:'Anatomy',layout:'comparison',assets:['heart','lungs','liver','kidney'],labels:['Heart','Lungs','Liver','Kidney'],description:'Conceptual organ silhouettes, not an anatomy atlas'},
  {id:'model-organisms',name:'Model organism study',category:'Organisms',layout:'comparison',assets:['mouse','zebrafish','fruit-fly','nematode'],labels:['Mouse','Zebrafish','Fruit fly','Nematode'],description:'Compare experimental systems without implying equivalence'},
  {id:'ecology-context',name:'Ecosystem study',category:'Ecology',layout:'branching',assets:['tree','soil','water','sun'],labels:['Study system','Soil context','Water context','Light context'],description:'A study-context map; arrows require your interpretation'},
  {id:'sample-analysis',name:'Sample-to-analysis workflow',category:'Lab methods',layout:'process',assets:['tube','centrifuge','microplate','microscope'],labels:['Sample','Separation','Assay setup','Imaging readout'],description:'A high-level workflow with no protocol parameters'},
  {id:'experimental-arms',name:'Experimental comparison',category:'Lab methods',layout:'branching',assets:['tube','flask','flask','flask'],labels:['Starting sample','Control arm','Condition A','Condition B'],description:'Arrange study arms and supply your own conditions'}
].map(t=>({...t,version:'0.2.0',subtitle:t.description}));

const id=()=>crypto.randomUUID();
const text=(label,x,y,w,size=20)=>({id:id(),type:'text',label,x,y,w,h:Math.max(size*1.4,wrapLabel(label,w,size).length*size*1.3),fontSize:size,color:'#243e3b',wrap:true});
export function composeDiagram({title='Untitled diagram',layout='process',steps,templateId='blank',templateVersion}) {
  if(!DIAGRAM_LAYOUTS.some(l=>l.id===layout))throw Error('Choose a supported diagram layout.');
  if(typeof title!=='string'||!title.trim()||title.length>200)throw Error('Use a title from 1 to 200 characters.');
  if(!Array.isArray(steps)||steps.length<2||steps.length>8)throw Error('Use between 2 and 8 diagram items.');
  for(const step of steps)if(!step||typeof step.label!=='string'||!step.label.trim()||step.label.length>100||!ASSETS.some(a=>a.id===step.assetId&&!a.parametric))throw Error('Each item needs a label (up to 100 characters) and a library component.');
  const width=layout==='process'?Math.max(1200,steps.length*260):layout==='branching'?Math.max(1200,(steps.length-1)*240):layout==='cycle'&&steps.length>6?1600:1200,height=layout==='cycle'&&steps.length>6?1100:layout==='process'||layout==='comparison'&&steps.length<=4?620:900,nodes=[text(title,60,40,width-120,32),text('EDITABLE SCHEMATIC · Supply your sources and review the relationships.',60,94,1080,14)],icons=[],edges=[];
  const n=steps.length,positions=[];
  if(layout==='cycle') {
    for(let i=0;i<n;i++){const angle=-Math.PI/2+i*2*Math.PI/n;positions.push({x:width/2+width*.25*Math.cos(angle),y:height*.55+height*.272*Math.sin(angle)});}
  } else if(layout==='branching') {
    positions.push({x:width/2,y:235});
    const leaves=n-1;
    for(let i=0;i<leaves;i++)positions.push({x:60+(i+.5)*(width-120)/leaves,y:575});
  } else if(layout==='process') {
    for(let i=0;i<n;i++)positions.push({x:60+(i+.5)*(width-120)/n,y:300});
  } else {
    const cols=Math.min(n,4),rows=Math.ceil(n/cols);
    for(let i=0;i<n;i++){const row=Math.floor(i/cols),col=layout==='process'&&row%2?cols-1-i%cols:i%cols;positions.push({x:60+(col+.5)*1080/cols,y:rows===1?300:280+row*330});}
  }
  const size=layout==='cycle'?120:160,labelWidth=layout==='cycle'?190:210;
  for(let i=0;i<n;i++) {
    const {x,y}=positions[i],step=steps[i],a=ASSETS.find(a=>a.id===step.assetId);
    if(layout==='comparison')nodes.push({id:id(),type:'panel',label:`${step.label} panel`,x:x-125,y:y-105,w:250,h:330,color:'#eef2e5'});
    const icon={id:id(),type:'asset',assetId:a.id,artworkVersion:a.version,label:a.name,x:x-size/2,y:y-size/2,w:size,h:size,color:a.color};icons.push(icon);
    let labelX=x-labelWidth/2,labelY=y+size/2+16;
    if(layout==='branching'&&i===0)labelY=y-size/2-60;
    if(layout==='cycle'){const angle=-Math.PI/2+i*2*Math.PI/n;labelX=x+Math.cos(angle)*(size/2+labelWidth/2+12)-labelWidth/2;labelY=y+Math.sin(angle)*(size/2+40)-12;}
    nodes.push(icon,text(step.label,labelX,labelY,labelWidth,18));
  }
  if(layout==='process'||layout==='cycle')for(let i=1;i<n;i++)edges.push(connectNodes(icons[i-1],icons[i]));
  if(layout==='cycle')edges.push(connectNodes(icons[n-1],icons[0]));
  if(layout==='branching')for(let i=1;i<n;i++)edges.push(connectNodes(icons[0],icons[i]));
  // Reserve enough space for wrapped titles before the biological composition.
  nodes[1].y=nodes[0].y+nodes[0].h+14;
  const shift=Math.max(0,nodes[1].y+nodes[1].h+35-Math.min(...nodes.slice(2).map(n=>n.y)));
  nodes.slice(2).forEach(n=>n.y+=shift);
  // Put edges above panels but below labels and biological symbols.
  const ordered=[...nodes.filter(n=>n.type==='panel'),...edges,...nodes.filter(n=>n.type!=='panel')];
  const d=applyStyle({schemaVersion:'0.1',title,width,height,nodes:ordered,claims:[],aiProvenance:[],templateId,...(templateVersion?{templateVersion}:{}),diagramLayout:layout},'fieldnotes');
  d.width=Math.ceil(Math.max(width,...nodes.map(n=>n.x+n.w+40)));d.height=Math.ceil(Math.max(height,...nodes.map(n=>n.y+n.h+40)));
  synchronizeConnections(d);return d;
}

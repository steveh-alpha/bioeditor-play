import {escapeXML} from '../svg.js';

// Independently authored, deliberately simplified silhouettes. These are
// conceptual illustrations, not microscopy, molecular structures, or anatomy atlases.
const records = [
  ['nucleus','Nucleus','Organelles','nuclear envelope nucleolus chromatin'],
  ['mitochondrion','Mitochondrion','Organelles','mitochondria cristae respiration'],
  ['ribosome','Ribosome','Organelles','translation protein synthesis'],
  ['golgi','Golgi apparatus','Organelles','secretory trafficking cisternae'],
  ['rough-er','Rough ER','Organelles','endoplasmic reticulum translation'],
  ['lysosome','Lysosome','Organelles','degradation digestion vesicle'],
  ['chloroplast','Chloroplast','Organelles','photosynthesis thylakoid plastid'],
  ['vacuole','Vacuole','Organelles','plant storage compartment'],
  ['vesicle','Transport vesicle','Organelles','secretion endocytosis trafficking'],
  ['neuron','Neuron','Neuroscience','axon dendrite soma nerve'],
  ['synapse','Chemical synapse','Neuroscience','presynaptic postsynaptic neurotransmitter'],
  ['myelin','Myelinated axon','Neuroscience','nerve impulse insulation'],
  ['astrocyte','Astrocyte','Neuroscience','glia astroglia'],
  ['erythrocyte','Red blood cell','Cells','erythrocyte blood biconcave'],
  ['platelet','Platelet','Cells','thrombocyte clotting fragment'],
  ['epithelial','Epithelial cell','Cells','epithelium barrier polarity'],
  ['adipocyte','Adipocyte','Cells','fat lipid droplet'],
  ['fibroblast','Fibroblast','Cells','connective tissue spindle'],
  ['muscle-fiber','Skeletal muscle fiber','Cells','striated myocyte muscle'],
  ['sperm','Sperm cell','Cells','gamete spermatozoon flagellum'],
  ['oocyte','Oocyte','Cells','egg gamete zona pellucida'],
  ['bacterium','Rod bacterium','Microbiology','bacillus prokaryote flagellum'],
  ['coccus','Coccus cluster','Microbiology','bacteria cocci spherical'],
  ['yeast','Budding yeast','Microbiology','fungus saccharomyces eukaryote'],
  ['phage','Bacteriophage','Microbiology','virus phage capsid tail'],
  ['hypha','Fungal hypha','Microbiology','fungus mycelium filament'],
  ['heart','Heart silhouette','Anatomy','cardiac cardiovascular organ'],
  ['lungs','Lung pair','Anatomy','respiratory pulmonary bronchi'],
  ['liver','Liver silhouette','Anatomy','hepatic organ metabolism'],
  ['kidney','Kidney section','Anatomy','renal organ cortex pelvis'],
  ['intestine','Intestinal tract','Anatomy','gut digestive bowel'],
  ['brain','Brain silhouette','Anatomy','cerebral cortex organ'],
  ['blood-vessel','Blood vessel','Anatomy','vascular lumen artery vein'],
  ['skin','Skin section','Anatomy','epidermis dermis tissue barrier'],
  ['plant-cell','Plant cell','Plants','cell wall vacuole chloroplast'],
  ['leaf','Leaf','Plants','lamina veins photosynthesis'],
  ['roots','Root system','Plants','root branching uptake'],
  ['stomata','Stoma','Plants','guard cells pore gas exchange'],
  ['seed','Germinating seed','Plants','germination seedling embryo'],
  ['flower','Flower','Plants','petals reproduction pollen'],
  ['mouse','Mouse silhouette','Organisms','mus musculus rodent model organism'],
  ['zebrafish','Zebrafish silhouette','Organisms','danio rerio fish model organism'],
  ['fruit-fly','Fruit fly silhouette','Organisms','drosophila insect model organism'],
  ['nematode','Nematode','Organisms','caenorhabditis elegans worm model organism'],
  ['seedling','Seedling','Plants','plant development growth shoot'],
  ['microscope','Microscope','Lab','imaging optical microscopy'],
  ['centrifuge','Centrifuge','Lab','spin pellet separation instrument'],
  ['microplate','Microplate','Lab','multiwell plate assay screening'],
  ['gel','Electrophoresis gel','Lab','gel bands electrophoresis illustrative'],
  ['thermocycler','Thermocycler','Lab','PCR polymerase chain reaction instrument'],
  ['syringe','Syringe','Lab','injection delivery'],
  ['enzyme','Enzyme schematic','Molecules','active site substrate catalysis protein'],
  ['atp','ATP schematic','Molecules','adenosine triphosphate energy nucleotide'],
  ['protein-complex','Protein complex','Molecules','assembly subunits interaction'],
  ['chromosome','Chromosome schematic','Genetics','sister chromatids centromere mitosis'],
  ['nucleosome','Nucleosome schematic','Genetics','histone chromatin DNA packaging'],
  ['tree','Tree silhouette','Ecology','forest producer ecosystem canopy'],
  ['sun','Sunlight','Ecology','light energy photosynthesis environment'],
  ['water','Water droplet','Ecology','water environment aquatic hydrology'],
  ['soil','Soil section','Ecology','soil roots terrestrial substrate']
];
const palette={Organelles:'#6485a3',Neuroscience:'#987a9e',Cells:'#548476',Microbiology:'#b78a42',Anatomy:'#be7371',Plants:'#648951',Organisms:'#7d8292',Lab:'#58767a',Molecules:'#b18b50',Genetics:'#6485a3',Ecology:'#7b9460'};
export const BIOLOGY_ASSETS=records.map(([id,name,category,tags])=>({id,name,category,kind:id,color:palette[category],tags,version:'0.2.0',creator:'BioEditor project',license:'CC-BY-4.0',source:'BioEditor original biology schematics v0.2',creationMethod:'Independently authored procedural SVG',reviewStatus:'scientific-review-pending',limitations:'Conceptual schematic; not to scale. Confirm morphology and context before publication.'}));

export function biologyGlyph(kind,color) {
  if(!BIOLOGY_ASSETS.some(a=>a.kind===kind)) return null;
  const c=escapeXML(color), outline=`fill="${c}" fill-opacity=".18" stroke="${c}" stroke-width="2.5"`,line=`fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
  const path=d=>`<path d="${d}" ${line}/>`;
  const circle=(x,y,r,opacity=.55)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${opacity}"/>`;
  switch(kind) {
    case 'nucleus':return `<circle cx="50" cy="50" r="36" ${outline}/><circle cx="50" cy="50" r="30" ${line}/>${path('M30 42q12-16 20 0t18 0M29 58q13 14 20 0t20 0')}${circle(57,49,9,.7)}`;
    case 'mitochondrion':return `<path d="M16 36C29 11 84 21 86 45S64 86 35 77 5 57 16 36Z" ${outline}/>${path('M23 39Q29 31 35 35L31 56 43 62 47 34 59 35 56 61 67 58 73 38Q86 56 65 68Q36 82 21 60Z')}`;
    case 'ribosome':return `<path d="M20 47Q14 17 43 19Q75 8 82 42L73 53H29Z" ${outline}/><path d="M24 60H76Q84 81 51 85T24 60Z" ${outline}/>${path('M9 56H92M50 20V7')}`;
    case 'golgi':return `${[23,36,49,62].map((y,i)=>`<path d="M${21+i*2} ${y}Q50 ${y+16} ${81-i*3} ${y-1}L${78-i*3} ${y+7}Q49 ${y+25} ${20+i*2} ${y+6}Z" ${outline}/>`).join('')}${circle(15,35,4)}${circle(85,60,5)}${circle(76,83,4)}`;
    case 'rough-er':return `${path('M12 23Q30 10 49 24T87 23M12 38Q30 25 49 39T87 38M12 53Q30 40 49 54T87 53M12 68Q30 55 49 69T87 68M12 83Q30 70 49 84T87 83')}${[[23,18],[45,23],[66,27],[31,35],[73,43],[21,51],[51,55],[79,67],[31,66],[51,84]].map(([x,y])=>circle(x,y,2.6,.9)).join('')}`;
    case 'lysosome':return `<circle cx="50" cy="50" r="34" ${outline}/>${[[34,38],[65,35],[45,60],[68,61],[29,61]].map(([x,y],i)=>i%2?path(`M${x-4} ${y-4}l8 8m0-8-8 8`):circle(x,y,4)).join('')}`;
    case 'chloroplast':return `<ellipse cx="50" cy="50" rx="39" ry="29" ${outline}/><ellipse cx="50" cy="50" rx="33" ry="23" ${line}/>${[29,58].map(x=>[39,45,51,57].map(y=>`<rect x="${x}" y="${y}" width="15" height="5" rx="2" ${outline}/>`).join('')).join('')}${path('M44 48H58')}`;
    case 'vacuole':return `<path d="M24 20Q55 9 78 28Q93 50 77 79Q53 90 27 77Q10 50 24 20Z" ${outline}/>${path('M31 31Q48 23 65 29')}`;
    case 'vesicle':return `<circle cx="50" cy="50" r="32" ${outline}/><circle cx="50" cy="50" r="26" ${line}/>${circle(42,44,5)}${circle(60,54,5)}${circle(41,61,4)}`;
    case 'neuron':return `<path d="M25 35 36 25 50 34 48 50 34 57 22 47Z" ${outline}/>${circle(36,41,7)}${path('M25 35 15 24 10 12m5 12-9 4M36 25V12l8-7M22 47 11 57l-5-2M34 57 29 72l-12 7M48 45Q60 50 67 42T81 44L88 58m-7-14 11-10m-4 24 7 7m-7-7-9 9')}`;
    case 'synapse':return `<path d="M31 7V28Q11 44 22 53H79Q90 43 68 27V7" ${outline}/><path d="M18 70Q50 62 82 70V87H18Z" ${outline}/>${[30,46,61,74].map(x=>circle(x,44,4)).join('')}${[35,53,68].map(x=>circle(x,60,2)).join('')}${path('M35 69v8m17-9v8m16-7v8')}`;
    case 'myelin':return `${path('M8 50H93')}${[16,39,62].map(x=>`<rect x="${x}" y="32" width="18" height="36" rx="8" ${outline}/>${path(`M${x+5} 36V64m5-28V64`)}`).join('')}`;
    case 'astrocyte':return `<path d="M44 39 38 12 49 30 69 9 59 37 87 31 68 47 90 64 62 59 64 87 48 65 27 86 35 60 8 62 29 47 13 25 38 37Z" ${outline}/>${circle(48,49,10)}`;
    case 'erythrocyte':return `<ellipse cx="50" cy="50" rx="38" ry="28" ${outline}/><ellipse cx="50" cy="50" rx="21" ry="13" fill="${c}" opacity=".22"/>${path('M28 47Q50 34 72 47')}`;
    case 'platelet':return `<path d="M34 24 47 30 59 19 65 35 81 40 70 54 76 69 56 70 45 84 35 68 18 62 25 47 19 33Z" ${outline}/>${circle(41,43,4)}${circle(58,51,4)}${circle(46,62,3)}`;
    case 'epithelial':return `<rect x="25" y="20" width="50" height="66" rx="8" ${outline}/><ellipse cx="50" cy="65" rx="12" ry="14" fill="${c}" opacity=".5"/>${path('M31 19V8m9 11V8m10 11V8m10 11V8m9 11V8M20 90H80')}`;
    case 'adipocyte':return `<circle cx="50" cy="50" r="37" ${outline}/><circle cx="46" cy="47" r="28" fill="white" fill-opacity=".8" stroke="${c}" stroke-width="2"/><ellipse cx="73" cy="65" rx="5" ry="10" transform="rotate(35 73 65)" fill="${c}"/>`;
    case 'fibroblast':return `<path d="M8 77Q20 67 30 35Q44 17 63 37Q73 39 93 22Q72 43 66 67Q48 84 33 62Q24 65 8 77Z" ${outline}/><ellipse cx="49" cy="50" rx="10" ry="17" transform="rotate(37 49 50)" fill="${c}" opacity=".65"/>`;
    case 'muscle-fiber':return `<rect x="12" y="28" width="76" height="45" rx="12" ${outline}/>${[25,34,43,52,61,70,79].map(x=>path(`M${x} 30V71`)).join('')}${circle(23,36,3)}${circle(72,65,3)}`;
    case 'sperm':return `<ellipse cx="26" cy="26" rx="11" ry="15" transform="rotate(-35 26 26)" ${outline}/>${path('M34 38 43 50Q62 47 61 63T87 87')}`;
    case 'oocyte':return `<circle cx="50" cy="50" r="39" ${outline}/><circle cx="50" cy="50" r="32" ${line}/>${circle(45,45,12)}${circle(73,34,4,.8)}`;
    case 'bacterium':return `<rect x="13" y="27" width="65" height="43" rx="21" ${outline}/>${path('M24 42q13-12 20 1t20 0q-4 18-20 13t-19-1M78 49q19-15 15 5t0 28')}${[28,45,60].map(x=>circle(x,35,2)).join('')}`;
    case 'coccus':return `${[[37,25],[62,30],[24,48],[49,51],[75,55],[37,75],[64,78]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="12" ${outline}/>`).join('')}`;
    case 'yeast':return `<ellipse cx="42" cy="58" rx="25" ry="30" ${outline}/><ellipse cx="72" cy="28" rx="16" ry="19" transform="rotate(35 72 28)" ${outline}/>${circle(40,58,10)}${circle(71,27,5)}`;
    case 'phage':return `<path d="M50 9 69 19V40L50 50 31 40V19Z" ${outline}/>${path('M50 50V71m-7-15h14m-14 6h14M50 71 27 79 19 91m31-20 23 8 8 12M50 71V91')}`;
    case 'hypha':return `${path('M43 92V62L19 36V9M53 92V57L29 32V9M43 52 61 35V9M53 55 71 40V9M53 74 79 59V33M53 84 89 65V33M43 83H53M23 29H29M61 25H71M79 48H89')}`;
    case 'heart':return `<path d="M46 30Q26 13 17 39Q8 63 47 86Q75 79 83 55Q91 24 63 25L58 12 46 16Z" ${outline}/>${path('M46 31Q58 43 53 62L47 86M63 25 70 15M33 27 31 15M53 62 72 51')}`;
    case 'lungs':return `<path d="M41 26Q21 25 14 65Q10 89 37 77L42 43ZM59 26Q79 25 86 65Q90 89 63 77L58 43Z" ${outline}/>${path('M46 9V35L28 55m26-46v26l18 20M28 55l-8 13m8-13 8 12m36-12 8 13m-8-13-8 12')}`;
    case 'liver':return `<path d="M12 34Q41 14 86 30L91 50Q69 63 53 55Q34 84 12 70Z" ${outline}/>${path('M56 28 53 55M15 46Q35 36 53 39')}`;
    case 'kidney':return `<path d="M62 15Q22 5 17 46T54 87Q76 87 73 69Q72 58 56 57Q45 45 63 38Q82 32 62 15Z" ${outline}/>${path('M51 25Q28 27 28 52T57 76M58 45 78 48m-20 1 15 10V91')}`;
    case 'intestine':return `<path d="M20 82V25Q20 16 30 16H72Q82 16 82 26V77H68" ${line}/>${path('M34 32H66q12 0 12 9t-12 9H39q-13 0-13 10t13 10H60q12 0 12 9t-12 9H42V95')}`;
    case 'brain':return `<path d="M14 48Q7 29 25 22Q32 9 49 15Q64 8 76 23Q94 27 89 48Q94 68 74 72L65 85 53 70Q34 81 24 65Q9 64 14 48Z" ${outline}/>${path('M48 17Q35 30 45 41T46 65M25 25Q40 29 29 43T25 61M63 21Q53 34 69 38T72 63M17 48Q29 35 41 50m13 3q13-14 32-5')}`;
    case 'blood-vessel':return `<path d="M17 22H83V78H17" ${outline}/><ellipse cx="17" cy="50" rx="10" ry="28" ${outline}/><ellipse cx="83" cy="50" rx="10" ry="28" ${outline}/><ellipse cx="83" cy="50" rx="6" ry="20" ${line}/>${[35,56].map(x=>`<ellipse cx="${x}" cy="50" rx="7" ry="4" fill="${c}" opacity=".7"/>`).join('')}`;
    case 'skin':return `<path d="M10 25Q20 16 30 25T50 25 70 25 90 25V82H10Z" ${outline}/>${path('M10 37Q20 28 30 37T50 37 70 37 90 37M10 63H90M34 24V54q15 12 12-4V13')}${[24,51,76].map(x=>circle(x,74,6,.3)).join('')}`;
    case 'plant-cell':return `<rect x="12" y="12" width="76" height="76" rx="13" ${outline}/><rect x="18" y="18" width="64" height="64" rx="9" ${line}/><rect x="36" y="29" width="38" height="45" rx="13" fill="white" fill-opacity=".8" stroke="${c}" stroke-width="2"/>${circle(28,49,8)}${[28,51,70].map(x=>`<ellipse cx="${x}" cy="23" rx="6" ry="3" fill="${c}"/>`).join('')}`;
    case 'leaf':return `<path d="M20 80Q7 18 83 13Q94 74 20 80Z" ${outline}/>${path('M12 89 73 25M30 70 28 43m12 15 2-26m9 15 1-22M30 70 59 71M43 55 72 54')}`;
    case 'roots':return `${path('M50 6V50L40 68 38 94M50 38 30 49 14 71m16-22-9-18M50 48 72 56 89 80m-17-24 9-24M46 62 62 78 64 94M40 68 22 86')}`;
    case 'stomata':return `<path d="M39 14Q8 17 10 52T40 86L40 73Q23 50 40 28Z" ${outline}/><path d="M61 14Q92 17 90 52T60 86V73Q77 50 60 28Z" ${outline}/>${[[27,27],[22,48],[27,73],[73,27],[78,48],[73,73]].map(([x,y])=>circle(x,y,3)).join('')}`;
    case 'seed':return `<path d="M30 28Q61 8 77 35T58 79Q26 89 22 62T30 28Z" ${outline}/>${path('M58 26Q42 39 49 57L45 74 32 91M48 48Q66 44 70 28Q54 25 48 48')}`;
    case 'flower':return `${[0,72,144,216,288].map(a=>`<ellipse cx="50" cy="29" rx="12" ry="20" transform="rotate(${a} 50 50)" ${outline}/>`).join('')}${circle(50,50,11,.75)}`;
    case 'mouse':return `<path d="M15 62Q15 35 45 35Q67 24 85 53L93 60 81 69Q57 83 30 74Z" ${outline}/><circle cx="65" cy="32" r="12" ${outline}/>${circle(80,51,2,.9)}${path('M16 62Q3 53 7 37M37 74l-5 9m33-11 6 8')}`;
    case 'zebrafish':return `<path d="M10 51Q44 20 76 46L91 31V70L76 55Q39 79 10 51Z" ${outline}/>${path('M29 44Q49 38 69 46M24 51H69M29 58Q49 64 68 56M42 35 51 24 60 38')}${circle(22,47,2,.9)}`;
    case 'fruit-fly':return `<ellipse cx="33" cy="37" rx="13" ry="24" transform="rotate(-28 33 37)" ${outline}/><ellipse cx="67" cy="37" rx="13" ry="24" transform="rotate(28 67 37)" ${outline}/><ellipse cx="50" cy="62" rx="11" ry="24" ${outline}/>${circle(50,31,10)}${path('M43 56h14m-14 10h14m-13 10h12M39 48 22 60m18 6L25 81m35-33 18 12M60 66 75 81M44 23l-5-10m17 10 5-10')}`;
    case 'nematode':return `<path d="M12 32Q36 3 53 40T89 61Q77 91 56 63T12 32Z" ${outline}/>${path('M20 31Q39 18 52 46T80 66')}`;
    case 'seedling':return `${path('M50 89V44M50 74 34 92m16-12 17 14')}<path d="M50 53Q15 49 17 21Q43 20 50 53ZM51 42Q54 12 84 15Q84 44 51 42Z" ${outline}/>`;
    case 'microscope':return `<path d="M34 12 50 22 39 44 25 35Z" ${outline}/>${path('M49 25Q83 43 65 66L52 81M19 83H83M20 57H54M36 59 32 81M31 11l8-6')}<circle cx="65" cy="49" r="8" ${outline}/>`;
    case 'centrifuge':return `<rect x="13" y="33" width="74" height="51" rx="10" ${outline}/><ellipse cx="50" cy="34" rx="36" ry="20" ${outline}/><ellipse cx="50" cy="34" rx="23" ry="12" ${line}/>${circle(50,34,4)}${path('M50 23V30m21 4H57m-7 11V38m-21-4H43M29 67H48')}${circle(71,68,4)}`;
    case 'microplate':return `<rect x="9" y="18" width="82" height="64" rx="7" ${outline}/>${Array.from({length:24},(_,i)=>`<circle cx="${20+(i%6)*12}" cy="${29+Math.floor(i/6)*14}" r="4" ${outline}/>`).join('')}`;
    case 'gel':return `<rect x="14" y="12" width="72" height="76" rx="4" ${outline}/>${[25,40,55,70].map(x=>`<rect x="${x}" y="19" width="7" height="5" fill="${c}"/>`).join('')}${[[25,35],[25,46],[25,57],[25,68],[40,42],[40,66],[55,55],[70,39],[70,55],[70,73]].map(([x,y])=>`<rect x="${x}" y="${y}" width="7" height="3" fill="${c}" opacity=".65"/>`).join('')}`;
    case 'thermocycler':return `<rect x="15" y="27" width="70" height="61" rx="7" ${outline}/><path d="M15 27 25 13H75L85 27Z" ${outline}/><rect x="28" y="39" width="44" height="21" rx="2" ${line}/>${path('M33 53h8v-8h10v8h13')}${[33,49,65].map(x=>circle(x,73,3)).join('')}`;
    case 'syringe':return `<g transform="rotate(35 50 50)"><rect x="38" y="28" width="24" height="40" ${outline}/>${path('M50 9V28M40 9H60M31 28H69M50 68V93M43 41h7m-7 9h7m-7 9h7')}</g>`;
    case 'enzyme':return `<path d="M49 15Q85 12 86 52Q84 87 47 87Q12 83 13 48Q12 27 29 21L33 41 48 40Z" ${outline}/><path d="M30 8 44 8 41 25 34 26Z" fill="${c}" opacity=".7"/>`;
    case 'atp':return `<path d="M9 30 23 21 36 30 30 46H15Z" ${outline}/><path d="M27 47 36 57 29 71 14 66 13 51Z" ${outline}/>${path('M36 59H46M56 59H66M76 59H86')}${[50,70,90].map(x=>`<circle cx="${x}" cy="59" r="6" ${outline}/>`).join('')}`;
    case 'protein-complex':return `${[[36,32,18],[66,40,19],[52,68,20],[26,62,12]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" ${outline}/>`).join('')}`;
    case 'chromosome':return `${path('M29 14Q22 34 44 48Q25 64 29 86M40 13Q37 32 50 43Q64 32 60 13M60 87Q63 68 50 55Q36 69 40 87M71 14Q78 34 56 48Q75 64 71 86')}${circle(50,49,7)}`;
    case 'nucleosome':return `<ellipse cx="50" cy="50" rx="23" ry="25" ${outline}/>${path('M6 65Q19 67 24 50C28 20 82 26 78 45C74 67 23 66 23 49C23 35 75 34 78 50Q84 62 94 49')}`;
    case 'tree':return `<path d="M44 52H58L64 90H36Z" ${outline}/><path d="M20 55Q5 39 24 30Q21 8 45 17Q64 4 73 26Q95 26 89 49Q80 72 59 63Q34 75 20 55Z" ${outline}/>`;
    case 'sun':return `<circle cx="50" cy="50" r="23" ${outline}/>${Array.from({length:8},(_,i)=>`<path transform="rotate(${i*45} 50 50)" d="M50 8V19" ${line}/>`).join('')}`;
    case 'water':return `<path d="M50 10Q41 28 25 47Q7 74 36 88Q66 100 80 73Q91 52 50 10Z" ${outline}/>${path('M28 61Q23 75 40 80')}`;
    case 'soil':return `<path d="M10 30Q25 22 43 29T90 27V87H10Z" ${outline}/>${path('M10 51H90M10 70H90M38 30 42 48 34 60m8-12 13 6')}${[[21,42],[68,40],[79,61],[23,76],[61,79]].map(([x,y])=>circle(x,y,2.5)).join('')}`;
    default:throw Error(`Missing original glyph: ${kind}`);
  }
}

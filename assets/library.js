import {VIRUSES_VERSION,VIRUSES_ASSETS,virusGlyph} from './viruses.js';
import {THERAPEUTICS_VERSION,THERAPEUTICS_ASSETS,therapeuticGlyph} from './therapeutics.js';
import {ANTIBODY_VERSION,antibodyGlyph} from './antibody.js';
import {IMMUNOGLOBULIN_VERSION,IMMUNOGLOBULIN_ASSETS,immunoglobulinGlyph} from './immunoglobulins.js';
import {ILLUSTRATION_VERSION,technicalGlyph,technicalFinish} from './technical.js';
export {ILLUSTRATION_VERSION};
import {escapeXML} from '../svg.js';
import {BIOLOGY_ASSETS,biologyGlyph} from './biology.js';
import {STRUCTURE_ASSETS,structureGlyph} from './structures.js';
export const COLORS=['#62aaa0','#7ea4cd','#b994c4','#e6ad75','#df8999','#587884'];
const LEGACY_ASSETS=[
 ['t-cell','T cell','Cells','cell','#73b7a3','lymphocyte immune'],['cd8','CD8+ T cell','Cells','cell','#63a89f','killer cytotoxic lymphocyte'],['b-cell','B cell','Cells','cell','#86a6d2','lymphocyte immune'],['nk','NK cell','Cells','granular','#b994c4','natural killer'],['tumor','Tumor cell','Cells','tumor','#df8999','cancer malignant'],['macrophage','Macrophage','Cells','granular','#e6ad75','phagocyte immune'],['dendritic','Dendritic cell','Cells','star','#b095be','antigen presenting APC'],['stem','Stem cell','Cells','cell','#9abbbc','progenitor'],
 ['dna','DNA','Genetics','dna','#709ec9','gene double helix'],['rna','Guide RNA','Genetics','rna','#d49c70','gRNA CRISPR'],['cas9','Cas9 complex','Genetics','cas','#85b6aa','CRISPR nuclease editing'],['plasmid','Plasmid','Genetics','plasmid','#b097c9','vector circular DNA'],['gene','Target locus','Genetics','gene','#7cacca','genome knockout'],['virus','Viral vector','Genetics','virus','#bea0c2','lentivirus AAV delivery'],
 ['antibody','Antibody','Molecules','antibody','#d3a974','immunoglobulin IgG'],['receptor','Receptor','Molecules','receptor','#78a7b8','CAR membrane protein'],['cytokine','Cytokine','Molecules','molecule','#ddae71','signaling protein'],['antigen','Antigen','Molecules','star','#df91a1','epitope'],
 ['dish','Culture dish','Lab','dish','#79a9ba','expansion culture plate'],['tube','Sample tube','Lab','tube','#79a9ba','blood sample isolation'],['pipette','Pipette','Lab','pipette','#779cb3','liquid transfer'],['flask','Culture flask','Lab','flask','#73b7a3','expansion culture'],['electro','Electroporation','Lab','electro','#86a6d2','delivery engineering'],['assay','Assay readout','Lab','assay','#85b6aa','flow cytometry analysis results']
].map(([id,name,category,kind,color,tags])=>({id,name,category,kind,color,tags,version:'0.1.0',creator:'BioEditor project',license:'CC-BY-4.0',source:'BioEditor original schematic library v0.1',reviewStatus:'scientific-review-pending'})).concat(BIOLOGY_ASSETS,STRUCTURE_ASSETS);
const TECHNICAL_ASSETS=LEGACY_ASSETS.map(a=>({...a,kind:a.id==='antigen'?'epitope':a.kind,version:ILLUSTRATION_VERSION,source:'BioEditor original technical illustrations v0.3',creationMethod:'Independently authored procedural SVG',limitations:a.limitations||'Conceptual schematic; not to scale. Confirm morphology and context before publication.'}));
export const ASSETS=TECHNICAL_ASSETS.map(a=>a.id==='antibody'?{...a,version:ANTIBODY_VERSION,previousVersion:ILLUSTRATION_VERSION,source:'BioEditor original IgG schematic v0.3.1',limitations:'Conventional monomeric IgG schematic, not to scale. Glycans, intradomain disulfides, and subclass-specific detail are omitted.',references:[{title:'IgG subclasses and allotypes: from structure to effector functions',url:'https://doi.org/10.3389/fimmu.2014.00520',role:'Biological structure reference; no artwork reused'}]}:a).concat(IMMUNOGLOBULIN_ASSETS,THERAPEUTICS_ASSETS,VIRUSES_ASSETS);
export const isTechnicalArtwork=version=>[ILLUSTRATION_VERSION,ANTIBODY_VERSION,IMMUNOGLOBULIN_VERSION,THERAPEUTICS_VERSION,VIRUSES_VERSION].includes(version);
export const isLatestArtwork=node=>assetRecord(node.assetId,node.artworkVersion).version===ASSETS.find(a=>a.id===node.assetId).version;
// An absent revision means the exact original artwork used by older documents.
export function assetRecord(id,version) {
 const virus=VIRUSES_ASSETS.find(a=>a.id===id);
 if(virus){if(version===undefined||version===VIRUSES_VERSION)return virus;throw Error('Unsupported illustration revision.');}
 const therapeutic=THERAPEUTICS_ASSETS.find(a=>a.id===id);
 if(therapeutic){if(version===undefined||version===THERAPEUTICS_VERSION)return therapeutic;throw Error('Unsupported illustration revision.');}
 const antibody=IMMUNOGLOBULIN_ASSETS.find(a=>a.id===id);
 if(antibody){if(version===undefined||version===IMMUNOGLOBULIN_VERSION)return antibody;throw Error('Unsupported illustration revision.');}
 const original=LEGACY_ASSETS.find(a=>a.id===id);
 if(!original)throw Error('Unknown component');
 if(version===undefined||version===original.version)return original;
 if(version===ILLUSTRATION_VERSION)return TECHNICAL_ASSETS.find(a=>a.id===id);
 if(id==='antibody'&&version===ANTIBODY_VERSION)return ASSETS.find(a=>a.id===id);
 throw Error('Unsupported illustration revision.');
}
export function glyph(kind,color,parameters,aspect=1,version) {
 const virus=virusGlyph(kind,color,version);
 if(virus!==null)return virus;
 const therapeutic=therapeuticGlyph(kind,color,version);
 if(therapeutic!==null)return therapeutic;
 if(IMMUNOGLOBULIN_ASSETS.some(a=>a.kind===kind)) {
  if(version!==undefined&&version!==IMMUNOGLOBULIN_VERSION)throw Error('Unsupported illustration revision.');
  return immunoglobulinGlyph(kind,color);
 }
 if(kind==='antibody'&&version===ANTIBODY_VERSION)return antibodyGlyph(color);
 if(version===ILLUSTRATION_VERSION)return technicalGlyph(kind,color)??technicalFinish(legacyGlyph(kind,color,parameters,aspect),color);
 if(version!==undefined&&!['0.1.0','0.2.0'].includes(version))throw Error('Unsupported illustration revision.');
 return legacyGlyph(kind,color,parameters,aspect);
}
function legacyGlyph(kind,color,parameters,aspect=1){const added=biologyGlyph(kind,color)??structureGlyph(kind,color,parameters,aspect);if(added!==null)return added;const c=escapeXML(color);const ring=`fill="${c}" fill-opacity=".28" stroke="${c}" stroke-width="2.5"`;switch(kind){
case 'cell':return `<circle cx="50" cy="50" r="35" ${ring}/><path d="M38 28C60 22 73 48 60 65S31 66 30 50 29 34 38 28" fill="${c}" opacity=".75"/><path d="M29 22l-5-7m54 20 8-3M25 71l-8 6m46 5 3 9" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
case 'granular':return `<path d="M17 37Q13 13 40 18Q56 6 71 25Q94 31 80 59Q88 83 59 82Q29 98 22 72Q7 61 17 37" ${ring}/><ellipse cx="48" cy="47" rx="17" ry="13" fill="${c}" opacity=".7"/><g fill="${c}"><circle cx="30" cy="65" r="3"/><circle cx="61" cy="69" r="3"/><circle cx="72" cy="48" r="3"/><circle cx="35" cy="27" r="2"/></g>`;
case 'tumor':return `<path d="M24 24Q43 8 56 20Q81 11 78 36Q94 52 77 66Q78 88 54 79Q31 94 25 73Q7 60 20 43Q12 31 24 24Z" ${ring}/><ellipse cx="51" cy="49" rx="19" ry="23" fill="${c}" opacity=".72"/><circle cx="55" cy="45" r="7" fill="${c}"/>`;
case 'dna': {
 const strands=[-1,1].map(side=>Array.from({length:65},(_,i)=>[+(50+side*22*Math.cos(3*Math.PI*i/64)).toFixed(3),+(12+76*i/64).toFixed(3)]));
 const path=points=>points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ');
 const rungs=Array.from({length:11},(_,i)=>4+i*5).map(i=>`<path d="M${strands[0][i].join(' ')}L${strands[1][i].join(' ')}"/>`).join('');
 return `<g fill="none" stroke="${c}" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="2.5" opacity=".65">${rungs}</g><path d="${path(strands[0])}" stroke-width="4"/><path d="${path(strands[1])}" stroke-width="4" opacity=".8"/></g>`;
}
case 'rna': {
 const points=Array.from({length:65},(_,i)=>[+(43+14*Math.sin(2*Math.PI*i/64-.5)).toFixed(3),+(12+76*i/64).toFixed(3)]);
 const backbone=points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ');
 const bases=Array.from({length:10},(_,i)=>5+i*6).map(i=>{const [x,y]=points[i];return `<path d="M${x} ${y}L${+(x+12).toFixed(3)} ${+(y-4).toFixed(3)}"/>`;}).join('');
 return `<g fill="none" stroke="${c}" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="3" opacity=".75">${bases}</g><path d="${backbone}" stroke-width="4"/></g>`;
}
case 'cas':return `<path d="M18 40Q25 15 48 22L63 12 85 38 71 62 80 79 49 89 22 72Z" ${ring}/><path d="M15 62Q48 48 86 58" stroke="#b187b4" stroke-width="5" fill="none"/><circle cx="51" cy="42" r="9" fill="${c}" opacity=".6"/>`;
case 'plasmid':return `<circle cx="50" cy="50" r="30" fill="none" stroke="${c}" stroke-width="7"/><path d="M50 20A30 30 0 0 1 80 50" stroke="#dfac71" stroke-width="8" fill="none"/><path d="m73 47 7 10 7-10" fill="#dfac71"/>`;
case 'gene':return `<path d="M8 42H92M8 58H92" stroke="${c}" stroke-width="3"/><rect x="31" y="32" width="38" height="36" rx="4" fill="${c}" opacity=".6"/><path d="M17 43v14m65-14v14M43 35v30m13-30v30" stroke="${c}" stroke-width="2"/>`;
case 'virus':return `<circle cx="50" cy="50" r="29" ${ring}/><g fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round">${Array.from({length:8},(_,i)=>`<path transform="rotate(${i*45} 50 50)" d="M50 21V11M46 11H54"/>`).join('')}</g><path d="M35 45q14-20 26-2t-10 18" stroke="${c}" stroke-width="3" fill="none"/>`;
case 'antibody':return `<path d="M47 84V53L23 25m30 59V53l24-28" stroke="${c}" stroke-width="8" stroke-linecap="round" fill="none"/><path d="m15 30 18 22m52-22L67 52" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
case 'receptor':return `<path d="M12 61H88M12 71H88" stroke="#bacdc9" stroke-width="3"/><path d="M48 85V42L29 24m25 61V42l19-18" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
case 'molecule':return `<g ${ring}><circle cx="38" cy="38" r="20"/><circle cx="63" cy="46" r="21"/><circle cx="43" cy="64" r="19"/></g>`;
case 'star':return `<path d="M50 10 60 32 84 22 72 44 94 54 70 62 79 86 56 73 44 94 37 70 13 80 26 57 7 45 32 39 23 15 44 29Z" ${ring}/><circle cx="49" cy="50" r="14" fill="${c}" opacity=".6"/>`;
case 'dish':return `<path d="M13 44v17c0 20 74 20 74 0V44" ${ring}/><ellipse cx="50" cy="44" rx="37" ry="14" ${ring}/><g fill="${c}" opacity=".6"><circle cx="35" cy="45" r="4"/><circle cx="57" cy="48" r="3"/><circle cx="69" cy="42" r="4"/></g>`;
case 'tube':return `<path d="M35 22V72a15 15 0 0 0 30 0V22" ${ring}/><path d="M38 49H62V72a12 12 0 0 1-24 0Z" fill="${c}" opacity=".5"/><rect x="31" y="14" width="38" height="11" rx="3" fill="${c}"/><path d="M39 34h8m-8 8h8" stroke="${c}" stroke-width="2"/>`;
case 'pipette':return `<g transform="rotate(35 50 50)"><rect x="42" y="12" width="16" height="50" rx="4" ${ring}/><path d="M44 62h12l-4 21h-4Z" fill="${c}"/><path d="M46 11V5h8v6" stroke="${c}" stroke-width="3"/></g>`;
case 'flask':return `<path d="M38 18v26L18 79q-4 9 7 9h50q11 0 7-9L62 44V18Z" ${ring}/><path d="M30 60 20 80q-1 5 7 5h46q8 0 7-5L70 60Z" fill="${c}" opacity=".5"/><path d="M34 15h32" stroke="${c}" stroke-width="5"/>`;
case 'electro':return `<rect x="20" y="20" width="60" height="64" rx="6" ${ring}/><path d="M56 26 36 54h16l-8 24 23-33H53Z" fill="#d5a365"/>`;
case 'assay':return `<path d="M18 14v70h70" stroke="${c}" stroke-width="3" fill="none"/>${Array.from({length:14},(_,i)=>`<circle cx="${28+(i*17)%52}" cy="${25+(i*13)%49}" r="3" fill="${c}" opacity=".7"/>`).join('')}`;
default:return `<circle cx="50" cy="50" r="30" ${ring}/>`;}}

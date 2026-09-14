import {cp,mkdir,readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const source=resolve(process.argv[2]||'../BioEditor');
const target=resolve(import.meta.dirname,'..');
const build=join(source,'dist');
const sha=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(execFileSync('git',['-C',source,'status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim())throw Error('Source must be clean before publishing.');
const prefix=`/marketing/releases/${sha}/`;
const marketing=join(target,prefix);
await cp(build,target,{recursive:true});
// Existing editor hostname uses the Pages root; public homepage uses marketing/.
await cp(join(build,'editor.html'),join(target,'index.html'));
await mkdir(marketing,{recursive:true});
await cp(build,marketing,{recursive:true});
for(const name of ['index.html','illustrations.html']){
  let html=await readFile(join(build,name),'utf8');
  html=html.replace(/href="editor\.html"/g,'href="https://editor.vaelise.com/"');
  html=html.replace(/(href|src)="([^"#]+)"/g,(match,attr,url)=>{
    if(/^(?:[a-z]+:|\/)/i.test(url))return match;
    return `${attr}="${prefix}${url}"`;
  });
  await writeFile(join(marketing,name),html);
  if(name==='index.html')await writeFile(join(target,'marketing/index.html'),html);
}
const home=await readFile(join(build,'home.js'),'utf8');
await writeFile(join(marketing,'home.js'),home.replace("new URL('editor.html',location.href)","new URL('https://editor.vaelise.com/')"));
for(const name of ['app.js.gz.b64','app.js.gz.b64.0','home-3.css'])await rm(join(target,name),{force:true});
const files={};
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,entry.name);
  if(entry.isDirectory())await walk(path);
  else files[relative(build,path)]=createHash('sha256').update(await readFile(path)).digest('hex');
}}
await walk(build);
await writeFile(join(target,'SOURCE_SHA'),sha+'\n');
await writeFile(join(target,'BUILD_MANIFEST.json'),JSON.stringify({source_repository:'steveh-alpha/BioEditor',source_sha:sha,source_build_sha256:files,hosting:{editor_root:'index.html is an exact copy of source editor.html',homepage:'marketing/index.html',public_assets:prefix,adaptations:'Marketing HTML URLs and legacy workspace navigation point to their hosted routes; root JavaScript and CSS are exact build copies.'}},null,2)+'\n');
console.log(`Published ${Object.keys(files).length} build files from ${sha}`);

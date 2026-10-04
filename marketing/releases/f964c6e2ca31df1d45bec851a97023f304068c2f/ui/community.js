import {prepareContribution,remixContribution} from '../community.js';
import {exportSVG,manifest,escapeXML as esc} from '../core.js';
import {portalRequest,openPrivateWorkspace} from './ai-portal.js';

export function installCommunity({modal,toast,getDoc,getSelected,insert}) {
  const $=selector=>document.querySelector(selector);
  let status;
  // A dialog render owns its async results only while that exact view is open.
  const currentView=()=>{const title=$('#dialog-title');return ()=>$('#modal').open&&title.isConnected;};
  async function mutate(button,path,body,message,view){
    const current=currentView();button.disabled=true;
    try{await portalRequest(path,{body});if(!current())return;toast(message);await browse(view);}
    catch(error){if(current()){toast(error.message);button.disabled=false;}}
  }
  const publicDetails=doc=>`<details class="public-details"><summary>Shared labels and attribution</summary><ul>${doc.nodes.map(n=>`<li>${esc(n.label)}</li>`).join('')}</ul>${[...manifest(doc).assets,...manifest(doc).templates,...manifest(doc).community].map(ref=>`<p>${esc(ref.name)} · ${esc(ref.creator)} · ${esc(ref.version)}<br>${esc(ref.source)}<br>${esc(ref.license)} · ${esc(ref.licenseUrl)}<br>${esc(ref.modifications)}</p>`).join('')}</details>`;
  async function browse(view='published'){
    if(typeof view!=='string')view='published';
    const pending=view==='pending',mine=view==='mine',heading=pending?'Community review queue':mine?'My contributions':'Community library';
    modal(heading,'<p role="status">Loading shared materials…</p>');
    const current=currentView();
    try{
      const nextStatus=await portalRequest('/status');
      if(!current())return;status=nextStatus;
      const result=status.community?await portalRequest(`/community${pending?'?pending=1':mine?'?mine=1':''}`):{items:[]};
      if(!current())return;
      modal(heading,`<p>Reuse published elements, compositions, and complete diagrams as editable objects. Your private workspaces are never listed here.</p><div class="prop-actions"><button id="community-publish">Publish my figure</button><button id="community-selection" ${getSelected().size?'':'disabled'}>Publish selected elements</button>${status.user?'<button id="community-mine">My contributions</button>':''}${view!=='published'?'<button id="community-library">Public library</button>':''}${status.user?.moderator?'<button id="community-review">Review queue</button>':''}</div>${!status.community?'<p class="dialog-note">The shared library is not connected on this local preview. Publishing becomes available when the hosted portal is configured.</p>':''}<div class="community-grid">${result.items.map(item=>`<button class="community-card" data-publication="${esc(item.id)}"><strong>${esc(item.title)}</strong><span>${esc(item.kind)} · ${esc(item.creator)} · ${esc(item.status)}</span><p>${esc(item.description)}</p></button>`).join('')||'<p class="muted">No contributions here yet.</p>'}</div>`);
      $('#community-publish').onclick=()=>publish();$('#community-selection').onclick=()=>publish([...getSelected()]);$('#community-review')?.addEventListener('click',()=>browse('pending'));
      $('#community-mine')?.addEventListener('click',()=>browse('mine'));$('#community-library')?.addEventListener('click',()=>browse());
      document.querySelectorAll('[data-publication]').forEach(button=>button.onclick=()=>detail(button.dataset.publication,view));
    }catch(error){if(current())modal('Community library',`<p>${esc(error.message)}</p>`);}
  }
  async function detail(id,view){
    const pending=view==='pending',mine=view==='mine';let current=currentView();
    try{
      const item=await portalRequest(`/community/${id}`);
      if(!current())return;
      modal(item.title,`<div class="ai-preview">${exportSVG(item.document)}</div>${publicDetails(item.document)}<p>${esc(item.description)}</p><p>By ${esc(item.creator)} · CC BY 4.0. ${item.aiAssisted?'AI-assisted contribution.':''}</p>${pending?'<label for="science-review">Scientific review evidence</label><textarea id="science-review" maxlength="2000"></textarea><label for="rights-review">Rights review evidence</label><textarea id="rights-review" maxlength="2000"></textarea><button class="primary" id="approve-community">Publish reviewed contribution</button>':item.status==='published'?'<div class="prop-actions"><button class="primary" id="remix-community">Open editable copy</button><button id="insert-community">Insert into my figure</button></div>':'<p>Awaiting review. Only you and community reviewers can access this submission.</p>'}${mine?'<p>Removing a contribution deletes the portal listing and submitted content. Your local workspace stays private. Copies already downloaded by others cannot be recalled.</p><button id="withdraw-contribution">Remove my contribution</button>':''}`);
      current=currentView();
      $('#withdraw-contribution')?.addEventListener('click',event=>mutate(event.currentTarget,`/community/${id}/withdraw`,{},'Contribution removed.','mine'));
      $('#remix-community')?.addEventListener('click',()=>{try{openPrivateWorkspace(remixContribution(item));}catch(error){toast(error.message);}});
      $('#insert-community')?.addEventListener('click',()=>{try{if(insert(remixContribution(item)))$('#modal').close();}catch(error){toast(error.message);}});
      $('#approve-community')?.addEventListener('click',event=>mutate(event.currentTarget,`/community/${id}/review`,{scienceReview:$('#science-review').value,rightsReview:$('#rights-review').value},'Contribution published.','pending'));
    }catch(error){if(current())toast(error.message);}
  }
  function publish(selectedIds){
    const snapshot=structuredClone(getDoc());
    modal('Publish to the community',`<p>Choose a public name and description. The next step previews exactly what will be submitted. Publishing is optional.</p><label for="contribution-title">Title</label><input class="prop-input" id="contribution-title" maxlength="150" value="${esc(snapshot.title.slice(0,150))}"><label for="contribution-creator">Public creator name</label><input class="prop-input" id="contribution-creator" maxlength="120"><label for="contribution-description">Public description</label><textarea id="contribution-description" maxlength="2000"></textarea><label for="contribution-kind">Reusable material</label><select id="contribution-kind"><option value="${selectedIds?'composition':'diagram'}">${selectedIds?'Selected composition':'Complete diagram'}</option><option value="element">Reusable element</option></select><label for="contribution-license">Reuse license for your contribution</label><select id="contribution-license"><option value="CC-BY-4.0">CC BY 4.0 — reuse and adaptation with attribution</option></select><button class="primary" id="preview-contribution">Preview public content</button>`);
    $('#preview-contribution').onclick=()=>{
      try{
        const contribution=prepareContribution(snapshot,{title:$('#contribution-title').value,creator:$('#contribution-creator').value,description:$('#contribution-description').value,kind:$('#contribution-kind').value,license:$('#contribution-license').value},selectedIds);
        modal('Review public content',`<div class="ai-preview">${exportSVG(contribution.document)}</div>${publicDetails(contribution.document)}<p><strong>${esc(contribution.title)}</strong> — ${esc(contribution.creator)}</p><p>${esc(contribution.description)}</p><p>The previewed objects, labels, description, public creator name, and attribution will be submitted. Private prompts, notes, evidence records, and workspace history are excluded. Existing artwork retains its original attribution.</p><label class="checkline"><input type="checkbox" id="confirm-public">I want to share this content publicly and it contains no confidential information.</label><label class="checkline"><input type="checkbox" id="confirm-rights">I have permission to share this contribution under CC BY 4.0. Published copies may continue to be reused even if I later remove the listing.</label><button class="primary" id="submit-contribution" ${!status?.community||!status?.user?'disabled':''}>Submit for community review</button><p class="muted">A separate scientific and rights review is required before the contribution appears in the public library.</p>`);
        $('#submit-contribution').onclick=async()=>{
          const current=currentView();
          if(!$('#confirm-public').checked||!$('#confirm-rights').checked){toast('Confirm public sharing and the reuse license.');return;}
          $('#submit-contribution').disabled=true;
          try{const saved=await portalRequest('/community',{body:{...contribution,confirmPublic:true,confirmRights:true}});if(!current())return;modal('Submitted for review',`<p>Your contribution is awaiting review. Your private workspace is unchanged. Find this submission again in My contributions.</p><p>Submission: ${esc(saved.id)}</p><button id="withdraw-contribution">Withdraw this submission</button>`);$('#withdraw-contribution').onclick=event=>mutate(event.currentTarget,`/community/${saved.id}/withdraw`,{},'Submission removed.','mine');}catch(error){if(current()){toast(error.message);$('#submit-contribution').disabled=false;}}
        };
      }catch(error){toast(error.message);}
    };
  }
  return browse;
}

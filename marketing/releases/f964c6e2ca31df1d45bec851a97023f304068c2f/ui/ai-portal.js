import {compileFigurePlan} from '../ai/plan.js';
import {exportSVG,serializeDocument,escapeXML as esc} from '../core.js';
import {workspaceKey} from '../editor/workspaces.js';

export async function portalRequest(path,{body,key,signal}={}) {
  const response=await fetch(`/api/portal${path}`,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json',...(key?{'X-BioEditor-API-Key':key}:{})}:{},...(body?{body:JSON.stringify(body)}:{}),signal});
  let result;try{result=await response.json();}catch{throw Error('The AI portal is unavailable. On a hosted editor, sign in and retry.');}
  if(!response.ok)throw Error(result.error||'The portal could not complete the request.');return result;
}
export function openPrivateWorkspace(document) {
  const id=crypto.randomUUID();localStorage.setItem(workspaceKey(id),serializeDocument(document,true));
  location.href=`editor.html?workspace=${id}`;
}

export function installAIPortal({modal,toast,getDoc,replaceDraft}) {
  const $=selector=>document.querySelector(selector);
  return async function open(){
    let status,prompt='',key='',model='',mode='byok',result=null,draft=null,controller=null,closed=false;
    const baseRevision=getDoc().revision,baseId=getDoc().documentId;
    const dialog=$('#modal');
    const close=()=>{closed=true;controller?.abort();key='';if($('#ai-key'))$('#ai-key').value='';dialog.removeEventListener('close',close);};dialog.addEventListener('close',close);
    modal('Create with AI','<p role="status">Connecting to the AI portal…</p>');
    try{status=await portalRequest('/status');}catch(error){if(!closed)modal('Create with AI',`<p>${esc(error.message)}</p>`);return;}
    if(closed||!dialog.open)return;
    if(status.managed&&status.subscription?.active)mode='managed';
    function draw(){
      const sub=status.subscription,manage=status.billingAccount&&(!status.managed||!['none','canceled','incomplete_expired'].includes(sub?.status));
      modal('Create with AI',`<p class="muted">Describe the biology and the story you want to explain. Your draft stays private on this device until you choose to publish it.</p>
      ${draft?`<div class="ai-preview" aria-label="Generated draft preview">${exportSVG(draft)}</div><p><strong>Review before use.</strong> Scientific accuracy has not been verified.</p>${result.plan.assumptions.length?`<p>Assumptions to check:</p><ul>${result.plan.assumptions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`:''}${result.plan.missingMaterials.length?`<p>Materials needing attention:</p><ul>${result.plan.missingMaterials.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`:''}<div class="prop-actions"><button class="primary" id="ai-use-new">Open in new private workspace</button><button id="ai-replace">Replace current figure</button></div>`:''}
      <div class="ai-connections"><label><input type="radio" name="ai-mode" value="managed" ${mode==='managed'?'checked':''} ${!status.managed?'disabled':''}> BioEditor subscription</label><label><input type="radio" name="ai-mode" value="byok" ${mode==='byok'?'checked':''}> My OpenAI API key</label></div>
      <div id="ai-connection-details">${mode==='managed'?`<p>${sub?.active?`${sub.used} of ${sub.limit} included generations used this billing period.`:'Subscribe to use managed AI generation.'}</p>`:'<label for="ai-key">OpenAI API key</label><input id="ai-key" class="prop-input" type="password" autocomplete="off" spellcheck="false" placeholder="Enter your API key"><label for="ai-model">OpenAI model ID</label><input id="ai-model" class="prop-input" placeholder="Enter a model supporting Structured Outputs" autocomplete="off"><p class="muted">Your provider bills your account directly. The key is relayed through BioEditor for this request and is never saved.</p>'}</div>
      ${status.billing&&(status.managed||manage)?`<button id="ai-billing">${manage?'Manage subscription':'Subscribe to managed AI'}</button>`:'<p class="muted">Subscription AI is not available on this deployment.</p>'}
      ${sub?.verified===false?'<p class="dialog-note">Subscription verification is temporarily unavailable. Retry later or use your personal API key.</p>':''}
      <label for="ai-prompt">${result?'Refine this draft':'Describe your diagram'}</label><textarea id="ai-prompt" maxlength="12000" placeholder="Show an antibody blocking a virus from binding to its receptor on a cell. Include a control and treatment panel."></textarea>
      <p class="muted">Generate sends this description${result?' and the previewed draft':''} to OpenAI. It does not send your existing workspace, private notes, or other files. Provider data policies apply. ${mode==='managed'?'A successful draft uses one included generation.':'Provider charges may apply even if a draft is unusable.'}</p>
      <button class="primary" id="ai-generate" ${mode==='managed'&&!sub?.active?'disabled':''}>${result?'Generate revision':'Generate editable draft'}</button><button id="ai-cancel" hidden>Cancel request</button><p id="ai-status" role="status" aria-live="polite"></p>
`);
      $('#ai-prompt').value=prompt;
      if($('#ai-key')){$('#ai-key').value=key;$('#ai-model').value=model;$('#ai-key').oninput=e=>key=e.target.value;$('#ai-model').oninput=e=>model=e.target.value.trim();}
      $('#ai-prompt').oninput=e=>prompt=e.target.value;
      document.querySelectorAll('[name=ai-mode]').forEach(input=>input.onchange=()=>{mode=input.value;draw();});
      $('#ai-billing')?.addEventListener('click',async()=>{try{const {url}=await portalRequest(manage?'/billing/manage':'/billing/checkout',{body:{}});if(closed||!dialog.open)return;const target=new URL(url);if(target.protocol!=='https:'||!['checkout.stripe.com','billing.stripe.com'].includes(target.hostname))throw Error('Invalid billing destination.');location.href=url;}catch(error){if(!closed)toast(error.message);}});
      $('#ai-cancel').onclick=()=>controller?.abort();
      $('#ai-generate').onclick=async()=>{
        if(prompt.trim().length<12){$('#ai-status').textContent='Add a description of at least 12 characters.';return;}
        if(mode==='byok'&&(!key.trim()||!model)){ $('#ai-status').textContent='Enter your API key and model ID.';return;}
        controller=new AbortController();$('#ai-generate').disabled=true;$('#ai-cancel').hidden=false;$('#ai-status').textContent='Preparing your editable draft…';
        document.querySelectorAll('[name=ai-mode],#ai-billing,#ai-use-new,#ai-replace').forEach(el=>el.disabled=true);
        try{
          const next=await portalRequest('/generate',{body:{mode,prompt,model,requestId:crypto.randomUUID(),...(result?{previousPlan:result.plan}:{})},key:mode==='byok'?key:undefined,signal:controller.signal});
          if(closed||!dialog.open||controller.signal.aborted)return;
          const nextDraft=compileFigurePlan(next.plan,next);result=next;draft=nextDraft;if(mode==='managed')status.subscription.used++;prompt='';draw();
        }catch(error){if(!closed&&dialog.open){$('#ai-status').textContent=controller.signal.aborted?'Request canceled. Your figure is unchanged.':error.message;$('#ai-generate').disabled=false;$('#ai-cancel').hidden=true;document.querySelectorAll('[name=ai-mode],#ai-billing,#ai-use-new,#ai-replace').forEach(el=>el.disabled=false);if(!status.managed)$('[name=ai-mode][value=managed]').disabled=true;}}
      };
      $('#ai-use-new')?.addEventListener('click',()=>{try{openPrivateWorkspace(draft);}catch(error){toast(`Could not save the new workspace: ${error.message}`);}});
      $('#ai-replace')?.addEventListener('click',()=>{if(getDoc().revision!==baseRevision||getDoc().documentId!==baseId){toast('Your figure changed while this draft was being prepared. Open it in a new workspace.');return;}if(replaceDraft(draft)){dialog.close();toast('Editable AI draft applied. Use Undo to restore the previous figure.');}});
    }
    draw();
  };
}

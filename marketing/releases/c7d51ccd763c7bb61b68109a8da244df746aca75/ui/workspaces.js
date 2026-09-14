import {createWorkspace,listWorkspaces} from '../editor/workspaces.js';
import {escapeXML as esc} from '../core.js';

export function installWorkspaces({modal,toast,prepareToLeave,currentId}) {
  const $=s=>document.querySelector(s);
  function navigate(id){const url=new URL(location.href);if(id)url.searchParams.set('workspace',id);else url.searchParams.delete('workspace');location.assign(url.href);}
  function show(){
    let entries;
    try{entries=listWorkspaces(localStorage);}catch{toast('Workspaces could not be read. Save a file to keep your work.');return;}
    modal('Workspaces',`<p>Create a blank workspace or return to a saved figure. Workspaces are saved in this browser on this device.</p><form id="new-workspace-form"><label for="workspace-name">New workspace name</label><input class="prop-input" id="workspace-name" maxlength="3000" placeholder="Untitled workspace"><button class="primary" type="submit">Create workspace</button></form><div class="workspace-list" aria-label="Saved workspaces">${entries.map(w=>`<button data-workspace="${esc(w.id)}" ${w.id===currentId?'disabled aria-current="true"':''}><strong>${esc(w.title)}</strong><span>${w.id===currentId?'Current workspace · ':''}${w.count===null?'Recovery available':`${w.count} objects`}</span></button>`).join('')}</div>`);
    $('#new-workspace-form').onsubmit=e=>{
      e.preventDefault();if(!prepareToLeave())return;
      try{navigate(createWorkspace(localStorage,$('#workspace-name').value));}catch(error){toast(`Workspace could not be created. ${error.message}`);}
    };
    document.querySelectorAll('[data-workspace]').forEach(button=>button.onclick=()=>{if(prepareToLeave())navigate(button.dataset.workspace);});
  }
  $('#new-canvas').onclick=()=>{
    if(!prepareToLeave())return;
    try{navigate(createWorkspace(localStorage,'Untitled figure'));}catch(error){toast(`Canvas could not be created. ${error.message}`);}
  };
  $('#workspaces').onclick=show;
}

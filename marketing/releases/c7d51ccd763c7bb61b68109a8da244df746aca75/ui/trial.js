export function installTrialGuide({modal,toast,recover,getDoc,getSaveStatus}) {
  const $=s=>document.querySelector(s);
  function guide() {
    modal('Welcome to the free preview',`<p>Build an editable scientific figure, save it on your device, and tell us where you get stuck. This is an early research preview; library artwork still awaits scientific review.</p>
      <ol class="trial-steps"><li><strong>Choose a starting point.</strong> Use Workspaces to create a separate blank figure or return to a saved one. Edit the example figure, open Templates, or use Build to compose your own diagram.</li><li><strong>Make it yours.</strong> Add components and text. Select objects on the canvas or in Layers to edit their properties. On smaller screens, open Properties from the toolbar.</li><li><strong>Keep an editable copy.</strong> Save file downloads a BioEditor JSON document. Open restores it. Autosave belongs to this browser and device; clearing site data removes it.</li><li><strong>Review and export.</strong> Record sources in Evidence & provenance, inspect the figure checks, then export SVG or PNG. PDF uses your browser’s print dialog. Include the supplied artwork credits when sharing.</li></ol>
      <details><summary>Keyboard controls</summary><p>Tab moves between controls. In Layers, Tab to an object and press Enter or Space to select it. Shift-click toggles objects or groups. Focus the canvas or a layer to use arrows to move the selection (Shift moves 10 px), and Delete to remove it. Outside text fields, Ctrl/⌘ A selects the entire diagram, Ctrl/⌘ C copies selected objects, Ctrl/⌘ V pastes them, and Ctrl/⌘ D duplicates them. Copies remain editable, including individual parts and connections between copied objects. Repeated pastes are offset so you can move each copy. Copy and paste also work between BioEditor tabs. Ctrl/⌘ Z undoes; Ctrl/⌘ Shift Z or Ctrl Y redoes. Ctrl/⌘ S saves a file. Escape clears selection or cancels an active drag.</p></details>
      <p class="muted">Figures and study notes stay in this browser unless you download and share them. Feedback is sent only when you choose Send feedback. No hosted AI, accounts, cloud backups, or analytics are connected.</p><div class="prop-actions"><button class="primary" id="guide-feedback">Give feedback</button><button id="guide-recovery">Recovery & backups</button></div>`);
    $('#guide-feedback').onclick=feedback;$('#guide-recovery').onclick=recover;
  }
  function feedback() {
    modal('Share trial feedback',`<p>Tell us what you tried, what happened, and what would help. Select Send feedback to share your answers directly with the BioEditor team.</p><form id="feedback-form"><label for="feedback-task">What were you trying to do?</label><textarea id="feedback-task" maxlength="3000" required placeholder="For example: make a three-step experiment overview"></textarea><label for="feedback-result">What happened, and what did you expect?</label><textarea id="feedback-result" maxlength="5000" required></textarea><label for="feedback-rating">Could you complete your task?</label><select id="feedback-rating"><option>Yes</option><option>Partly</option><option>No</option></select><p class="muted">We send your answers, screen size, object count, and save status. Figure text, sources, artwork, and files are excluded. Please leave private study details out of your answers.</p><p id="feedback-status" role="status" aria-live="polite"></p><button type="submit" class="primary">Send feedback</button></form>`);
    const form=$('#feedback-form'),button=form.querySelector('button[type=submit]'),status=$('#feedback-status');
    form.onsubmit=async e=>{
      e.preventDefault();
      if(button.disabled)return;
      const task=$('#feedback-task').value.trim(),result=$('#feedback-result').value.trim();
      if(!task||!result){toast('Describe your task and what happened.');return;}
      const report={product:'BioEditor free preview',createdAt:new Date().toISOString(),task,result,completed:$('#feedback-rating').value,diagnostics:{viewport:{width:window.innerWidth,height:window.innerHeight},objectCount:getDoc().nodes.length,saveStatus:getSaveStatus()}};
      button.disabled=true;button.textContent='Sending…';status.textContent='Sending your feedback…';
      try {
        const response=await fetch('./api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report),signal:AbortSignal.timeout(15000)});
        if(!response.ok||(await response.json()).received!==true)throw Error('Submission failed');
        status.textContent='Thank you! Your feedback has been sent to the BioEditor team.';
        button.textContent='Feedback sent';
        form.querySelectorAll('textarea,select').forEach(field=>field.disabled=true);
      }catch{
        status.textContent='We couldn’t confirm delivery. Your answers are still here. Please try again.';
        button.disabled=false;button.textContent='Send feedback';
      }
    };
  }
  $('#help').onclick=guide;
}

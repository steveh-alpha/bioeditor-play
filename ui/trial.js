export function installTrialGuide({modal,toast,download,recover,getDoc,getSaveStatus}) {
  const $=s=>document.querySelector(s);
  function guide() {
    modal('Welcome to the free preview',`<p>Build an editable scientific figure, save it on your device, and tell us where you get stuck. This is an early research preview; library artwork still awaits scientific review.</p>
      <ol class="trial-steps"><li><strong>Choose a starting point.</strong> Use Workspaces to create a separate blank figure or return to a saved one. Edit the example figure, open Templates, or use Build to compose your own diagram.</li><li><strong>Make it yours.</strong> Add components and text. Select objects on the canvas or in Layers to edit their properties. On smaller screens, open Properties from the toolbar.</li><li><strong>Keep an editable copy.</strong> Save file downloads a BioEditor JSON document. Open restores it. Autosave belongs to this browser and device; clearing site data removes it.</li><li><strong>Review and export.</strong> Record sources in Evidence & provenance, inspect the figure checks, then export SVG or PNG. PDF uses your browser’s print dialog. Include the supplied artwork credits when sharing.</li></ol>
      <details><summary>Keyboard controls</summary><p>Tab moves between controls. In Layers, Tab to an object and press Enter or Space to select it. Shift-click toggles objects or groups. Focus the canvas or a layer to use arrows to move the selection (Shift moves 10 px), and Delete to remove it. Outside text fields, Ctrl/⌘ A selects the entire diagram, Ctrl/⌘ C copies selected objects, Ctrl/⌘ V pastes them, and Ctrl/⌘ D duplicates them. Copies remain editable, including individual parts and connections between copied objects. Repeated pastes are offset so you can move each copy. Copy and paste also work between BioEditor tabs. Ctrl/⌘ Z undoes; Ctrl/⌘ Shift Z or Ctrl Y redoes. Ctrl/⌘ S saves a file. Escape clears selection or cancels an active drag.</p></details>
      <p class="muted">Figures and study notes stay in this browser unless you download and share them. No hosted AI, accounts, cloud backups, analytics, or automatic feedback submission are connected.</p><div class="prop-actions"><button class="primary" id="guide-feedback">Prepare feedback</button><button id="guide-recovery">Recovery & backups</button></div>`);
    $('#guide-feedback').onclick=feedback;$('#guide-recovery').onclick=recover;
  }
  function feedback() {
    modal('Share trial feedback',`<p>Tell us what you tried, what happened, and what would help. Download the report and send it to the person who invited you.</p><form id="feedback-form"><label for="feedback-task">What were you trying to do?</label><textarea id="feedback-task" maxlength="3000" required placeholder="For example: make a three-step experiment overview"></textarea><label for="feedback-result">What happened, and what did you expect?</label><textarea id="feedback-result" maxlength="5000" required></textarea><label for="feedback-rating">Could you complete your task?</label><select id="feedback-rating"><option>Yes</option><option>Partly</option><option>No</option></select><p class="muted">The report includes your answers, screen size, object count, and save status. It excludes figure text, sources, artwork, and files. Nothing is sent automatically.</p><button type="submit" class="primary">Download feedback report</button></form>`);
    $('#feedback-form').onsubmit=e=>{
      e.preventDefault();
      const task=$('#feedback-task').value.trim(),result=$('#feedback-result').value.trim();
      if(!task||!result){toast('Describe your task and what happened.');return;}
      const report={product:'BioEditor free preview',createdAt:new Date().toISOString(),task,result,completed:$('#feedback-rating').value,diagnostics:{viewport:{width:window.innerWidth,height:window.innerHeight},objectCount:getDoc().nodes.length,saveStatus:getSaveStatus()}};
      download(JSON.stringify(report,null,2),'bioeditor-feedback.json','application/json');toast('Feedback report downloaded. Send it to your trial contact.');
    };
  }
  $('#help').onclick=guide;
}

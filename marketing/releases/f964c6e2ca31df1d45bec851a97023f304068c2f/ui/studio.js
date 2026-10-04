import {uid,validateDocument,manifest,refineIllustrations,isLatestArtwork,escapeXML as esc} from '../core.js';
import {STYLES,ARTBOARDS,dimensions,applyStyle,resizeArtboard,preflight,attributionText} from '../studio.js';

export function installStudio({getDoc,replaceDoc,getSelected,selectObjects,modal,toast,download,filename}) {
  const $=s=>document.querySelector(s);
  function save(next) {
    try {validateDocument(next);if(replaceDoc(next)===false)return false;$('#modal').close();return true;}
    catch(error) {toast(error.message);return false;}
  }
  function artboard() {
    const d=getDoc(),size=dimensions(d);
    modal('Set up your artboard',`<p class="muted">Choose a working size in pixels. Check your journal or printer’s physical-size requirements before publishing.</p><label for="board-preset">Format</label><select id="board-preset"><option value="custom">Custom</option>${ARTBOARDS.map((p,i)=>`<option value="${i}" ${p.width===size.width&&p.height===size.height?'selected':''}>${esc(p.name)} · ${p.width} × ${p.height}</option>`).join('')}</select><form id="board-form"><div class="property-row"><label for="board-width">Width<input class="prop-input" id="board-width" type="number" min="100" max="6000" step="1" value="${size.width}" required></label><label for="board-height">Height<input class="prop-input" id="board-height" type="number" min="100" max="6000" step="1" value="${size.height}" required></label></div><label for="board-mode">Existing artwork</label><select id="board-mode"><option value="fit">Scale proportionally and center</option><option value="keep">Keep positions and sizes</option></select><p class="muted">Proportional scaling preserves object shapes. Color, grouping, and rotation stay editable. Very small labels may require a larger artboard.</p><button class="primary" type="submit">Apply artboard</button></form>`);
    $('#board-preset').onchange=e=>{const preset=ARTBOARDS[e.target.value];if(preset){$('#board-width').value=preset.width;$('#board-height').value=preset.height;}};
    for(const id of ['#board-width','#board-height']) $(id).oninput=()=>$('#board-preset').value='custom';
    $('#board-form').onsubmit=e=>{e.preventDefault();try{save(resizeArtboard(getDoc(),Number($('#board-width').value),Number($('#board-height').value),$('#board-mode').value==='fit'));}catch(error){toast(error.message);}};
  }
  function styles() {
    const older=getDoc().nodes.filter(n=>n.type==='asset'&&!isLatestArtwork(n)).length;
    modal('BioEditor figure styles',`${older?`<div class="illustration-upgrade"><strong>Refined scientific illustrations</strong><p>Update ${older} component${older===1?'':'s'} with finer outlines, restrained shading, and more detailed geometry. Colors and positions stay in place. Individually edited parts keep their existing artwork.</p><button class="primary" id="refine-illustrations">Refine illustrations</button></div>`:'<p class="muted">New components use our refined scientific illustration style. Individually edited parts retain their saved artwork.</p>'}`+`<p class="muted">Original palettes for a consistent visual voice. Applying a style changes colors across the figure; check any color-coded groups and legends afterward.</p><p class="muted"><a href="illustrations.html" target="_blank" rel="noopener">Explore the illustration library ↗</a></p><div class="style-options">${STYLES.map(s=>`<button class="style-card" data-style="${s.id}"><span class="style-sample" style="background:${s.background}">${s.colors.map(c=>`<i style="background:${c}"></i>`).join('')}</span><strong>${s.name}${getDoc().styleId===s.id?' · Applied':''}</strong><small>${s.description}</small></button>`).join('')}</div><p class="muted">All changes can be undone. Palettes alone do not establish accessibility; use labels and test the final figure.</p>`);
    $('#refine-illustrations')?.addEventListener('click',()=>{if(save(refineIllustrations(getDoc())))toast('Illustrations refined. Undo is available.');});
    document.querySelectorAll('[data-style]').forEach(b=>b.onclick=()=>{save(applyStyle(getDoc(),b.dataset.style));});
  }
  function claimEditor(id) {
    const current=(getDoc().claims||[]).find(c=>c.id===id);
    let nodeIds=current?.nodeIds?[...current.nodeIds]:[...getSelected()];
    modal(current?'Edit claim & source':'Add claim & source',`<form id="claim-form"><label for="claim-text">Scientific claim or study note</label><textarea id="claim-text" maxlength="10000" required>${esc(current?.text||'')}</textarea><label for="claim-source">Source or evidence reference</label><textarea id="claim-source" class="short-textarea" maxlength="3000" placeholder="DOI, article citation, dataset reference, or your own experiment record">${esc(current?.source||'')}</textarea><div class="claim-links"><span id="claim-link-count"></span><button type="button" id="claim-link-selection">Use selected objects</button><button type="button" id="claim-unlink">Clear links</button></div><label for="claim-reviewer">Reviewer name</label><input class="prop-input" id="claim-reviewer" maxlength="200" value="${esc(current?.reviewedBy||'')}"><label class="checkline"><input type="checkbox" id="claim-reviewed" ${current?.status==='author-reviewed'?'checked':''}>I reviewed this claim against its source. This records author review, not independent verification.</label><button class="primary" type="submit">Save claim</button></form>`);
    const showLinks=()=>$('#claim-link-count').textContent=`${nodeIds.length} linked objects`;
    const resetReview=()=>$('#claim-reviewed').checked=false;
    ['#claim-text','#claim-source','#claim-reviewer'].forEach(id=>$(id).oninput=resetReview);
    $('#claim-link-selection').onclick=()=>{nodeIds=[...getSelected()];resetReview();showLinks();};
    $('#claim-unlink').onclick=()=>{nodeIds=[];resetReview();showLinks();};showLinks();
    $('#claim-form').onsubmit=e=>{
      e.preventDefault();const next=structuredClone(getDoc());
      const claim={...current,id:current?.id||uid(),text:$('#claim-text').value.trim(),source:$('#claim-source').value.trim(),reviewedBy:$('#claim-reviewer').value.trim(),nodeIds,status:$('#claim-reviewed').checked?'author-reviewed':'draft'};
      next.claims=current?next.claims.map(c=>c.id===current.id?claim:c):[...(next.claims||[]),claim];
      if(save(next)) evidence();
    };
  }
  function evidence() {
    const d=getDoc(),m=manifest(d),report=preflight(d,m);
    modal('Evidence & provenance',`<p class="muted">Keep claims, sources, and artwork credits with your editable figure. These local records are author supplied.</p><div class="evidence-summary"><strong>${(d.claims||[]).length} claims</strong><span>${m.assets.length} components</span><span>${m.templates.length} template</span></div><button id="add-claim" class="primary">Add claim & source</button><div class="claim-list">${(d.claims||[]).map(c=>`<article class="claim-card"><span class="badge ${c.status==='author-reviewed'?'':'warning'}">${c.status==='author-reviewed'?'Author reviewed':'Review pending'}</span><p>${esc(c.text)}</p><small>${esc(c.source||'No source recorded')}</small>${c.reviewedBy?`<small>Reviewer: ${esc(c.reviewedBy)}</small>`:''}<div class="prop-actions"><button data-edit-claim="${esc(c.id)}">Edit</button><button data-remove-claim="${esc(c.id)}">Remove</button></div></article>`).join('')||'<p class="muted">Select objects in the figure, then add a claim to link the evidence to them.</p>'}</div><details><summary>Artwork credits · ${m.assets.length+m.templates.length} records</summary><div class="provenance-list">${[...m.assets,...m.templates].map(a=>`<div class="provenance-item">${esc(a.name)}<span>${esc(a.creator)} · ${esc(a.license)} · v${esc(a.version)}<br>${esc(a.source)}<br>Scientific review pending</span></div>`).join('')||'<p>No known library artwork.</p>'}</div></details><details><summary>Figure checks · ${report.issues.length} items to review</summary>${checksMarkup(report)}</details><div class="prop-actions"><button id="download-provenance">Download manifest</button><button id="download-credit">Download artwork credits</button></div>`);
    $('#add-claim').onclick=()=>claimEditor();
    document.querySelectorAll('[data-edit-claim]').forEach(b=>b.onclick=()=>claimEditor(b.dataset.editClaim));
    document.querySelectorAll('[data-remove-claim]').forEach(b=>b.onclick=()=>{const next=structuredClone(getDoc());next.claims=next.claims.filter(c=>c.id!==b.dataset.removeClaim);if(save(next))evidence();});
    $('#download-provenance').onclick=()=>download(JSON.stringify(m,null,2),filename('attribution.json'),'application/json');
    $('#download-credit').onclick=()=>download(attributionText(m),filename('credits.txt'),'text/plain');
    bindChecks(report);
  }
  function checksMarkup(report) {
    return `<ul class="figure-checks">${report.issues.map((issue,i)=>`<li>${esc(issue.message)}${issue.nodeIds.length?` <button data-check="${i}">Select objects</button>`:''}</li>`).join('')||'<li>No issues found by the available checks.</li>'}</ul><p class="muted">${esc(report.notice)} Bounds checks use object boxes; inspect the final export for text overflow.</p>`;
  }
  function bindChecks(report) {
    document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{selectObjects(report.issues[Number(b.dataset.check)].nodeIds);$('#modal').close();});
  }
  return {artboard,styles,evidence,checksMarkup,bindChecks};
}

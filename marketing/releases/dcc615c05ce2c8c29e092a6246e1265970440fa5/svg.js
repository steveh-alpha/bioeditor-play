export const escapeXML=s=>String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,'�').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

// Deterministic wrapping for portable SVG. This estimates glyph advances;
// final-size typography still needs visual review with the export font.
export function wrapLabel(label,width,fontSize) {
  const capacity=Math.max(1,Math.floor(width/(fontSize*.6))),lines=[];
  for(const paragraph of label.split(/\r?\n/)) {
    let line='';
    for(const word of paragraph.split(/\s+/).filter(Boolean)) {
      const chunks=[];const chars=Array.from(word);
      for(let i=0;i<chars.length;i+=capacity)chunks.push(chars.slice(i,i+capacity).join(''));
      for(const chunk of chunks) {
        if(line&&Array.from(line+' '+chunk).length>capacity){lines.push(line);line='';}
        line+=(line?' ':'')+chunk;
      }
    }
    lines.push(line);
  }
  return lines;
}

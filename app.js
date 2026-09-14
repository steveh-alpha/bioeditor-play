/* BioEditor d8b1f966 — exact dist app.js (gzip; corrects known 1-char deploy glitch) */
const FIX_AT = 8173;
const b64raw = (await (await fetch(new URL('./app.js.gz.b64', import.meta.url))).text()).trim();
const b64 = b64raw.length > FIX_AT && b64raw[FIX_AT] === 'n'
  ? b64raw.slice(0, FIX_AT) + 'l' + b64raw.slice(FIX_AT + 1)
  : b64raw;
const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
const stream = new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
const code = await new Response(stream).text();
await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));

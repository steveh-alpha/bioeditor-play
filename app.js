/* BioEditor 6ff8dde — loads exact dist app.js (gzip) */
const b64 = await (await fetch(new URL('./app.js.gz.b64', import.meta.url))).text();
const bin = Uint8Array.from(atob(b64.trim()), c => c.charCodeAt(0));
const stream = new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
const code = await new Response(stream).text();
await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));

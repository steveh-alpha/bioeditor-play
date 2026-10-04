// Keep the blank intent in the browser URL until the editor loads. This path
// is deliberately query-free so an authentication redirect cannot discard it.
const editor=new URL('editor.html',location.href);
editor.searchParams.set('new','blank');
location.replace(editor.href);

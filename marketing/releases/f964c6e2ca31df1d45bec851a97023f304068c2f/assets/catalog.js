export const normalizeSearch=text=>String(text).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function searchCatalog(items,query='',category='All') {
  const terms=normalizeSearch(query).split(/\s+/).filter(Boolean);
  return items.filter(item=>{
    const text=normalizeSearch([item.name,item.category,item.tags,item.description,item.layout,...(item.labels||[])].filter(Boolean).join(' '));
    return (category==='All'||item.category===category)&&terms.every(term=>text.includes(term));
  });
}
export const catalogCategories=items=>['All',...new Set(items.map(i=>i.category).filter(Boolean))];

/* Stable Hong Kong daily selection; each paid draw independently picks one of three. */
globalThis.DailySouvenirs=(()=>{
 function hash(text){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
 function pool(items,kind,day,legacy){
  const unique=[...new Map(items.filter(x=>x?.id&&x.image).map(x=>[x.id,x])).values()];
  unique.sort((a,b)=>hash(kind+'|'+day+'|'+a.id)-hash(kind+'|'+day+'|'+b.id)||a.id.localeCompare(b.id));
  if(legacy?.id){const prior=unique.find(x=>x.id===legacy.id)||legacy;unique.splice(unique.findIndex(x=>x.id===legacy.id),unique.some(x=>x.id===legacy.id)?1:0);unique.unshift(prior);}
  return unique.slice(0,3).map(x=>structuredClone(x));
 }
 function draw(items,random=Math.random){return items.length?structuredClone(items[Math.min(items.length-1,Math.floor(random()*items.length))]):null;}
 return {pool,draw};
})();

importScripts('./offline-manifest.js');
const PREFIX='island-play-',CACHE=PREFIX+OFFLINE_MANIFEST.version;
const base=self.registration.scope;
const urls=OFFLINE_MANIFEST.entries.map(e=>new URL(e.url,base).href);
const allowed=new Set(urls);
let downloading=null;
function key(request){const u=new URL(request.url);u.search='';u.hash='';if(u.origin===new URL(base).origin&&u.pathname.endsWith('/'))u.pathname+='index.html';return u.href;}
async function notify(value){for(const c of await self.clients.matchAll({includeUncontrolled:true}))c.postMessage({type:'ISLAND_OFFLINE',...value});}
async function status(){const c=await caches.open(CACHE),keys=await c.keys(),present=new Set(keys.map(r=>r.url));return {ready:urls.every(u=>present.has(u)),done:urls.filter(u=>present.has(u)).length,total:urls.length,bytes:OFFLINE_MANIFEST.bytes,downloading:!!downloading};}
async function put(c,url){const r=await fetch(url,{cache:'reload',credentials:'omit',signal:AbortSignal.timeout(90000)});if(!r.ok||r.type==='opaque')throw Error('無法下載部分內容');await c.put(url,r);}
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 for(const item of OFFLINE_MANIFEST.entries.filter(e=>/\.(html|js|css|json|webmanifest)$/.test(e.url)))await put(c,new URL(item.url,base).href);
})()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
async function download(){
 const c=await caches.open(CACHE);let done=0,index=0;const failures=[];
 await Promise.all(Array.from({length:4},async()=>{while(index<urls.length){const url=urls[index++];try{if(!await c.match(url))await put(c,url);done++;await notify({done,total:urls.length,bytes:OFFLINE_MANIFEST.bytes,downloading:true});}catch(e){failures.push(e);}}}));
 if(failures.length)throw Error('部分內容尚未下載完成，請連線後再試；已下載的內容會保留。');
 // Keep previous packs until their replacement is complete; never touch save storage.
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
}
self.addEventListener('message',e=>{
 if(e.data?.type==='OFFLINE_STATUS')e.waitUntil(status().then(s=>e.source?.postMessage({type:'ISLAND_OFFLINE',...s})));
 if(e.data?.type==='OFFLINE_DOWNLOAD'){
  if(!downloading)downloading=download().then(()=>null,e=>e.message).then(async error=>{downloading=null;await notify({...await status(),error});});
  e.waitUntil(downloading);
 }
});
async function ranged(request,response){
 const range=request.headers.get('range');if(!range)return response;
 const blob=await response.blob(),m=/^bytes=(\d*)-(\d*)$/.exec(range);
 if(!m)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${blob.size}`}});
 const start=m[1]?Number(m[1]):Math.max(0,blob.size-Number(m[2])),end=m[1]?(m[2]?Math.min(Number(m[2]),blob.size-1):blob.size-1):blob.size-1;
 if(start>end||start>=blob.size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${blob.size}`}});
 const headers=new Headers(response.headers);headers.set('Content-Range',`bytes ${start}-${end}/${blob.size}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
 return new Response(blob.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;const url=key(e.request);
 // Never cache auth tokens, Firestore, weather or YouTube.
 if(!allowed.has(url))return;
 e.respondWith((async()=>{const c=await caches.open(CACHE),cached=await c.match(url);if(cached)return ranged(e.request,cached);
  try{const r=await fetch(e.request);if(r.ok&&r.status===200)await c.put(url,r.clone());return r;}catch(error){
   for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE){const old=await (await caches.open(name)).match(url);if(old)return ranged(e.request,old);}
   if(e.request.mode==='navigate')return (await c.match(new URL('offline.html',base).href))||Response.error();throw error;
  }
 })());
});

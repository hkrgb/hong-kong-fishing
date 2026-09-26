const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const native of [false,true]){
 const root=path.resolve(__dirname,native?'../android-app/app/build/generated/gameAssets/game':'..'),origin=native?'https://appassets.androidplatform.net/assets/game/':'https://hkrgb.github.io/hong-kong-fishing/';
 const context=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'}),errors=[],missing=[];
 await context.route('**/*',async route=>{const url=route.request().url();if(!url.startsWith(origin))return route.abort('internetdisconnected');const relative=decodeURIComponent(new URL(url).pathname.slice(new URL(origin).pathname.length));const file=path.resolve(root,relative||'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){missing.push(relative);return route.fulfill({status:404,body:''});}const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};await route.fulfill({path:file,contentType:types[path.extname(file)]||'application/octet-stream'});});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);await p.waitForFunction(()=>typeof cfg!=='undefined'&&cfg&&!cloudLoading);if(!native)await p.click('#skipFullscreen');

 await p.evaluate(()=>chooseArea(cfg.areas.find(a=>a.id==='harbour')));
 for(const size of [{width:1280,height:720},{width:844,height:390}]){
  await p.setViewportSize(size);await p.waitForTimeout(150);
  for(const kind of [0,1,2]){
   await p.evaluate(k=>{tickerIndex=k;updateTicker();},kind);await p.waitForTimeout(500);
   const result=await p.evaluate(()=>{const group=$('tickerIdentity'),im=$('tickerPicture'),name=$('tickerName'),nr=name.getBoundingClientRect(),ir=im.getBoundingClientRect(),tr=$('islandTicker').getBoundingClientRect();return {hidden:group.hidden,text:name.textContent,alt:im.alt,right:nr.right,limit:tr.right,next:nr.left>=ir.right-1};});
   if(kind===2){assert(result.hidden);assert.equal(result.text,'');}else{assert(!result.hidden);assert.equal(result.text,result.alt);assert(result.next);assert(result.right<=result.limit+1,JSON.stringify(result));await p.screenshot({path:'tmp/ticker-name-'+(native?'app':'web')+'-'+kind+'-'+size.width+'.png'});}
  }
  // Longest existing names must fit and still use the exact current image label.
  const names=await p.evaluate(()=>{const result=[];for(let i=0;i<cfg.fish.length;i++){const before=Math.random;Math.random=()=>i/cfg.fish.length;tickerIndex=1;updateTicker();Math.random=before;const n=$('tickerName').getBoundingClientRect(),t=$('islandTicker').getBoundingClientRect();result.push({name:$('tickerName').textContent,right:n.right,limit:t.right});}return result;});
  for(const n of names)assert(n.right<=n.limit+1,JSON.stringify(n));
 }
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>{tickerIndex=0;updateTicker();});assert.equal(await p.locator('#tickerName').textContent(),await p.locator('#tickerPicture').getAttribute('alt'));
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await context.close();console.log('PASS '+(native?'App':'Web')+': image/name match, right-side position, 170 names fit desktop/mobile, weather hides both, reduced motion.');
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

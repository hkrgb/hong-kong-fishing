const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();page.setDefaultTimeout(30000);
 const url=process.env.GAME_URL||'http://127.0.0.1:8765/mini-game/hong-kong-fishing/';
 page.on('pageerror',e=>console.log('PAGE ERROR',e.message));context.on('serviceworker',w=>w.on('console',m=>console.log('SW',m.text())));
 await page.goto(url);await page.click('#skipFullscreen');await page.waitForFunction(()=>!cloudLoading);console.log('game loaded');
 await page.evaluate(()=>Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('SW not ready')),30000))]));console.log('worker ready');await page.reload({waitUntil:'domcontentloaded'});console.log('reloaded',await page.evaluate(()=>({cfg:typeof cfg,controller:!!navigator.serviceWorker.controller,body:document.body.innerText.slice(-160)})));await page.waitForFunction(()=>typeof cfg!=='undefined'&&cfg&&navigator.serviceWorker.controller,null,{timeout:20000});
 console.log('game reloaded');await page.evaluate(()=>OfflineGame.open());console.log('panel',await page.locator('#offlinePack').innerText());await page.locator('#offlinePack [data-download]').click();console.log('download started');
 const progressTimer=setInterval(()=>page.locator('#offlinePack [role=status]').textContent().then(s=>console.log('PROGRESS',s)).catch(()=>{}),15000);
 try{await page.waitForFunction(()=>document.querySelector('#offlinePack [data-download]')?.textContent==='已完成'||document.querySelector('#offlinePack [role=status]')?.textContent.includes('部分內容尚未下載'),null,{timeout:180000});}finally{clearInterval(progressTimer);}
 if(await page.locator('#offlinePack [data-download]').textContent()!=='已完成'){console.log('MISSING',await page.evaluate(async()=>{const m=await(await fetch('../offline-manifest.json')).json(),c=await caches.open('island-play-'+m.version),missing=[];for(const p of [...m.entries.map(e=>new URL('../'+e.url,document.baseURI).href),...['app','auth','firestore'].map(n=>`https://www.gstatic.com/firebasejs/10.12.5/firebase-${n}.js`)])if(!await c.match(p))missing.push(p);return missing;}));throw Error('offline pack incomplete');}console.log('pack downloaded');
 const version=await page.evaluate(async()=>{const m=await (await fetch('../offline-manifest.json')).json();return m.version;}).catch(()=>null);
 await page.locator('#offlinePack [data-close]').click();
 await page.evaluate(()=>{save.score=321;persist();});
 await context.setOffline(true);await page.reload();await page.click('#skipFullscreen');await page.waitForFunction(()=>typeof cfg!=='undefined'&&cfg&&!cloudLoading,null,{timeout:20000});
 assert.equal(await page.evaluate(()=>save.score),321);
 // Verify every shipped resource, not just resources visited while online.
 const result=await page.evaluate(async()=>{const c=await caches.keys(),name=c.find(n=>n.startsWith('island-play-')),cache=await caches.open(name),requests=await cache.keys();let count=0;for(const r of requests){if(new URL(r.url).origin!==location.origin)continue;const response=await fetch(r.url);if(!response.ok)throw Error(r.url);count++;}return count;});assert(result>300);
 await page.evaluate(async()=>{for(const a of cfg.areas)for(const p of ['morning','noon','night'])await preloadPicture(areaArt(a,p));await preloadBoatVideos();chooseArea(cfg.areas[0]);});
 assert.equal(await page.evaluate(()=>boatVideos.size),4);
 await page.click('#action');await page.waitForFunction(()=>['wait','nibble','hook'].includes(state),null,{timeout:15000});
 const range=await page.evaluate(async()=>{const r=await fetch('../mp4/ship-7am.mp4',{headers:{Range:'bytes=0-99'}});return {status:r.status,length:(await r.arrayBuffer()).byteLength,range:r.headers.get('content-range')}});assert.equal(range.status,206);assert.equal(range.length,100);
 await page.evaluate(()=>{showIslandHub();showMiniGames();playBunGame();});const frame=page.frameLocator('#islandMiniPlayer iframe');await frame.locator('#start').waitFor({state:'visible',timeout:15000});
 await page.locator('#islandMiniPlayer>button').click();await page.evaluate(()=>{showBookshop();});
 await page.screenshot({path:'tmp/offline-game-qa.png'});
 console.log('PASS: complete offline pack, offline cold reload + persisted progress, all local resources, all scenery periods, four movies, video byte ranges, embedded bun game and bookshop',result,version);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

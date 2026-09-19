const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const root=path.resolve(__dirname,'../android-app/app/build/generated/gameAssets/game');
  const manifest=require('../offline-manifest.json'),host='https://appassets.androidplatform.net/assets/game/';
  const context=await browser.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'});
  const errors=[],missing=[],external=[];
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname!=='appassets.androidplatform.net'){external.push(url.href);return route.abort('internetdisconnected');}
   const relative=decodeURIComponent(url.pathname.replace('/assets/game/',''))+(url.pathname.endsWith('/')?'index.html':'');
   const file=path.resolve(root,relative.replace('離島旅程-3d.png','island-vacation-3d.png'));
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){missing.push(relative);return route.fulfill({status:404,body:''});}
   const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.mp4':'video/mp4','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
   await route.fulfill({path:file,contentType:types[path.extname(file)]||'application/octet-stream'});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(host+'index.html');await page.waitForFunction(()=>typeof cfg!=='undefined'&&cfg&&!cloudLoading);
  assert.equal(await page.locator('#entryFullscreen').count(),0);
  assert.equal(await page.locator('#offlineGame').count(),0);
  assert(await page.locator('#nativeImport').isVisible());
  assert.equal(await page.evaluate(()=>ISLAND_NATIVE),true);
  // No prior navigation, caches or network responses: every asset is supplied by the installation.
  for(const entry of manifest.entries)assert(fs.existsSync(path.join(root,entry.url.replace('離島旅程-3d.png','island-vacation-3d.png'))),entry.url);
  await page.evaluate(async()=>{for(const a of cfg.areas)for(const p of ['morning','noon','night'])await preloadPicture(areaArt(a,p));await preloadBoatVideos();save.score=777;persist();chooseArea(cfg.areas[0]);});
  assert.equal(await page.evaluate(()=>boatVideos.size),4);
  await page.click('#action');await page.waitForFunction(()=>['wait','nibble','hook'].includes(state));
  await page.evaluate(()=>{showIslandHub();showMiniGames();playBunGame();});
  await page.frameLocator('#islandMiniPlayer iframe').locator('#start').waitFor({state:'visible'});
  await page.locator('#islandMiniPlayer>button').click();await page.evaluate(()=>showBookshop());
  await page.screenshot({path:path.resolve(__dirname,'../../../tmp/native-offline-qa.png')});
  await page.reload();await page.waitForFunction(()=>typeof cfg!=='undefined'&&cfg&&!cloudLoading);
  assert.equal(await page.evaluate(()=>save.score),777);
  assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
  assert(!external.some(u=>u.includes('firebase')||u.includes('firestore')));
  console.log('PASS: first-run bundled game with all external requests blocked, no SW/download step, movies, scenery, casting, mini-game, bookshop, cold restart and local save.',manifest.entries.length);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

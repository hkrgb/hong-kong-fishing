// Run against a served game: NODE_PATH=<playwright modules> node tests/navigation.browser.cjs
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://www.gstatic.com/**',r=>r.abort());
  await page.route('https://firestore.googleapis.com/**',r=>r.abort());
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8765/mini-game/hong-kong-fishing/');
  await page.waitForSelector('#skipFullscreen');await page.click('#skipFullscreen');await page.waitForFunction(()=>!cloudLoading);
  async function hubVisible(){assert.equal(await page.locator('#islandHub button:visible').count(),3);assert.equal(await page.evaluate(()=>dialogOpen),true);}
  await page.evaluate(()=>showIslandHub());await page.click('#menu');await page.click('#closeModal');await hubVisible();
  await page.evaluate(()=>chooseArea(cfg.areas.find(a=>a.category==='local')));
  await page.click('#returnDirectory');await page.click('#menu');await page.click('#closeModal');await hubVisible();
  await page.click('#menu');await page.click('#bookDisclaimer');await page.getByRole('button',{name:'返回',exact:true}).click();await page.click('#closeModal');await hubVisible();
  await page.click('#menu');await page.keyboard.press('Escape');await hubVisible();
  await page.evaluate(()=>{backgroundPeriodOverride='noon';chooseArea(cfg.areas.find(a=>a.category==='other'));globalThis.tripCount=0;const original=playBoatTrip;playBoatTrip=(...args)=>{tripCount++;return original(...args)}});
  assert.equal(await page.locator('#returnDirectory').innerText(),'回長洲');
  const money=await page.evaluate(()=>wallet().money);
  await page.click('#returnDirectory');await page.waitForSelector('#boatTrip video');
  await page.evaluate(()=>returnToIslandDirectory()); // repeated click cannot start another trip
  assert.equal(await page.evaluate(()=>tripCount),1);
  assert.match(await page.locator('#boatTrip video').getAttribute('src'),/ship-1pm\.mp4/);
  await page.waitForFunction(()=>{const v=document.querySelector('#boatTrip video');return v&&Number.isFinite(v.duration)&&v.duration>0});
  await page.evaluate(()=>{const v=document.querySelector('#boatTrip video');v.currentTime=Math.max(0,v.duration-.15)});
  await page.waitForSelector('#boatTrip',{state:'detached'});await hubVisible();
  assert.equal(await page.evaluate(()=>area.category),'local');assert.equal(await page.evaluate(()=>save.lastArea===area.id),true);
  assert.equal(await page.evaluate(()=>wallet().money),money);
  assert.match(await page.locator('#islandBackdrop').getAttribute('style'),/menu-day\.jpg/);
  await page.click('#hubFishing');await page.click('[data-region="local"]');await page.locator('.regionPlace').nth(1).click();await page.getByRole('button',{name:'進入遊戲',exact:true}).click();await page.waitForFunction(()=>!dialogOpen);
  assert.equal(await page.evaluate(()=>tripCount),1);assert.equal(await page.locator('#returnDirectory').innerText(),'返回目錄');
  await page.click('#menu');await page.click('#closeModal');assert.equal(await page.evaluate(()=>dialogOpen),false);
  await page.click('#returnDirectory');await hubVisible();assert.equal(await page.evaluate(()=>tripCount),1);
  assert.deepEqual(errors,[]);
  console.log('PASS: actual menu-close buttons, first and returning hub, disclaimer/Escape, real noon boat video, duplicate guard, free return, saved local position, no second local boat, fishing menu resume');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

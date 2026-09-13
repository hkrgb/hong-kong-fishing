// NODE_PATH=<bundled node_modules> node tests/bookshop.browser.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://www.gstatic.com/**',r=>r.abort());await page.route('https://firestore.googleapis.com/**',r=>r.abort());
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:8765/mini-game/hong-kong-fishing/');await page.waitForSelector('#skipFullscreen');await page.click('#skipFullscreen');await page.waitForFunction(()=>!cloudLoading);
 await page.evaluate(()=>{showIslandHub();});assert.equal(await page.locator('#islandHub button:visible').count(),4);await page.click('#hubBooks');await page.click('#recommendBooks');
 assert.match(await page.locator('.bookCopy').innerText(),/2026 塞爾維亞 AI Film Fest/);assert.equal(await page.locator('.bookCover').getAttribute('src').then(decodeURI).then(v=>v.endsWith('離島旅程-3d.png')),true);
 await page.click('#bookMediaTab');assert.equal(await page.locator('.bookVideos iframe').count(),2);assert.match(await page.locator('.bookVideos').innerText(),/主題曲及MV/);await page.click('#closeModal');assert.equal(await page.locator('#bookshopHub:visible').count(),1);
 const open=async(kind)=>{await page.click(kind==='toy'?'#dailyToys':'#dailyPostcards');const frame=await(await page.waitForSelector('#bookshopPlayer iframe')).contentFrame();await frame.waitForFunction(()=>!!state);return frame;};
 let f=await open('toy');await f.click('#play');await f.waitForSelector('#result:not([hidden])');const first=await f.locator('#resultName').innerText();assert.equal(await page.evaluate(()=>wallet().money),480);
 // Retry the same message: no extra deduction. Wrong source and incomplete puzzles cannot mint rewards.
 await f.evaluate(()=>send({type:'bookshop-play',request}));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>wallet().money),480);
 await page.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:location.origin,source:window,data:{type:'bookshop-play',session:dailySession.id,request:'forged'}})));assert.equal(await page.evaluate(()=>wallet().money),480);
 await f.click('#closeResult');await f.click('#play');await f.waitForSelector('#result:not([hidden])');assert.equal(await f.locator('#resultName').innerText(),first);assert.equal(await page.evaluate(()=>wallet().money),460);
 await page.click('#bookshopPlayer>button');f=await open('toy');await f.click('#play');await f.waitForSelector('#result:not([hidden])');assert.equal(await f.locator('#resultName').innerText(),first);assert.equal(await page.evaluate(()=>wallet().money),440);await page.click('#bookshopPlayer>button');
 f=await open('postcard');await f.click('#play');await f.waitForSelector('#puzzle button');assert.equal(await page.evaluate(()=>wallet().money),420);assert.equal(await page.evaluate(()=>wallet().collection.size),1);
 await f.evaluate(()=>send({type:'bookshop-complete',request,order:[0]}));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>wallet().collection.size),1);
 // Solve through the actual selectable tiles.
 for(let i=0;i<12;i++){const other=await f.evaluate(i=>order.indexOf(i),i);if(other!==i){await f.locator('#puzzle button').nth(i).click();await f.locator('#puzzle button').nth(other).click();}}
 await f.waitForSelector('#result:not([hidden])');assert.equal(await page.evaluate(()=>wallet().collection.size),2);assert.equal(await page.evaluate(()=>wallet().money),420);await page.click('#bookshopPlayer>button');
 // A new catch remains in the atlas/records after release and cannot enter either sale path.
 await page.evaluate(()=>{chooseArea(cfg.areas.find(a=>a.category==='local'));const f={...cfg.fish[0],catchId:'release-ui-test',weight:1,time:Date.now(),area:area.name};save.bag.unshift(f);showFish(f,true);});
 assert.equal(await page.getByRole('button',{name:'放入釣箱',exact:true}).count(),1);await page.getByRole('button',{name:'放生',exact:true}).click();assert.equal(await page.evaluate(()=>wallet().released.has('release-ui-test')),true);
 await page.evaluate(()=>showMarket());assert.equal(await page.locator('.saleOffer').count(),0);assert.equal(await page.locator('#modalTitle').innerText(),'海鮮檔');assert.equal(await page.evaluate(()=>transact({type:'sell',catchKey:'release-ui-test',amount:200})),false);
 await page.evaluate(()=>showCatalog());await page.selectOption('#catalogRegion',{index:2});assert.equal(await page.evaluate(()=>document.querySelector('.catalogSearch span').textContent.startsWith(String(cfg.areas[1].fish.length))),true);
 await page.evaluate(()=>{showIslandHub();showBookshop();transact({type:'buy',bait:'basic',amount:wallet().money});});f=await open('toy');assert.equal(await f.locator('#play').isDisabled(),true);await f.evaluate(()=>send({type:'bookshop-play',request:'empty-wallet'}));await f.waitForTimeout(100);assert.equal(await page.evaluate(()=>wallet().money),0);await page.click('#bookshopPlayer>button');
 await page.evaluate(()=>{showIslandHub();chooseArea(cfg.areas[0]);});await page.click('#musicToggle');assert.equal(await page.locator('#musicToggle').getAttribute('aria-pressed'),'false');await page.click('#musicToggle');await page.waitForFunction(()=>!document.querySelector('#journeyMusic').paused);await page.click('#returnDirectory');
 await page.setViewportSize({width:844,height:390});await page.click('#hubBooks');await page.click('#recommendBooks');assert.equal(await page.locator('#bookMediaTab').isVisible(),true);const stage=await page.locator('#stage').boundingBox();assert(stage.x>=-1&&stage.y>=-1&&stage.x+stage.width<=845&&stage.y+stage.height<=391);
 assert.deepEqual(errors,[]);console.log('PASS: books/media, actual paid toy/puzzle controls, same-day/reopen, duplicate and forged messages, release/market/atlas, empty wallet, music, mobile bookshop');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

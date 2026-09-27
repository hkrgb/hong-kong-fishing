const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const native of [false,true]){
 const root=path.resolve(__dirname,native?'../android-app/app/build/generated/gameAssets/game':'..'),origin=native?'https://appassets.androidplatform.net/assets/game/':'https://play.rgb-workshop.com/';
 const context=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'}),errors=[],missing=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(!u.href.startsWith(origin))return route.abort('internetdisconnected');let relative=decodeURIComponent(u.pathname.slice(new URL(origin).pathname.length));if(!relative||relative.endsWith('/'))relative+='index.html';const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){missing.push(relative);return route.fulfill({status:404,body:''});}const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.svg':'image/svg+xml'};return route.fulfill({path:file,contentType:types[path.extname(file)]||'application/octet-stream'});});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);await p.waitForFunction(()=>typeof cfg!=='undefined'&&cfg&&!cloudLoading);if(!native)await p.click('#skipFullscreen');
 assert.equal(await p.locator('#hudHearts').textContent(),'♥ 10');assert.equal(await p.evaluate(()=>cfg.fish.length),170);
 await p.evaluate(async()=>{for(const v of [...BookshopDefaults.toys,...BookshopDefaults.postcards,...MarineLitter]){const im=new Image();im.src=bookAsset(v.image);await im.decode();}chooseArea(cfg.areas[0]);showBookshop();});
 assert.equal(await p.evaluate(()=>BookshopDefaults.toys.length),15);assert.equal(await p.evaluate(()=>BookshopDefaults.postcards.length),12);
 await p.screenshot({path:'tmp/0927-bookshop-'+native+'.png'});
 await p.click('#dailyToys');let daily=await (await p.locator('#bookshopPlayer iframe').elementHandle()).contentFrame();await daily.locator('#play').click();await daily.locator('#result:not([hidden])').waitFor();
 await p.locator('#bookshopPlayer>button').click();await p.click('#dailyPostcards');daily=await (await p.locator('#bookshopPlayer iframe').elementHandle()).contentFrame();await daily.locator('#play').click();await daily.locator('#puzzle .piece').first().waitFor();
 for(let i=0;i<12;i++){const order=await daily.evaluate(()=>Array.from(order));const j=order.indexOf(i);if(i!==j){await daily.locator('#puzzle .piece').nth(i).click();await daily.locator('#puzzle .piece').nth(j).click();}}
 await daily.locator('#result:not([hidden])').waitFor();await p.locator('#bookshopPlayer>button').click();
 await p.evaluate(()=>{closeDialog();chooseArea(cfg.areas[0]);selected=school[0];bait={x:500,y:420};startFight();const rnd=Math.random,trip=playBoatTrip;Math.random=()=>0;playBoatTrip=async f=>f();land();Math.random=rnd;playBoatTrip=trip;});
 assert.equal(await p.evaluate(()=>save.bag.length),0);assert.equal(await p.evaluate(()=>wallet().collection.size),3);await p.getByRole('button',{name:'簡介',exact:true}).click();assert(await p.locator('.litterInfo').isVisible());
 await p.evaluate(()=>showRecycling());await p.screenshot({path:'tmp/0927-recycling-'+native+'.png'});
 await p.locator('.recyclingOffer button').first().click();await p.getByRole('button',{name:'確認回收／轉贈',exact:true}).click();assert.equal(await p.evaluate(()=>wallet().hearts),15);assert.equal(await p.evaluate(()=>wallet().money),460);assert.equal(await p.evaluate(()=>wallet().collection.size),2);
 await p.reload();await p.waitForFunction(()=>cfg&&!cloudLoading);assert.equal(await p.evaluate(()=>wallet().hearts),15);assert.equal(await p.evaluate(()=>wallet().collection.size),2);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 await context.close();console.log('PASS '+(native?'offline app':'custom-domain web')+': 170 fish, 33 collection images, both games, litter catch, recycling, hearts and reload');
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});


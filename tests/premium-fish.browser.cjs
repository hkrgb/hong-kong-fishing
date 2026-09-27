const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const native of [false,true]){
 const root=path.resolve(__dirname,native?'../android-app/app/build/generated/gameAssets/game':'..'),origin=native?'https://appassets.androidplatform.net/assets/game/':'https://hkrgb.github.io/hong-kong-fishing/';
 const context=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'}),errors=[],missing=[];
 await context.route('**/*',async route=>{const url=route.request().url();if(!native&&url.includes('/documents/miniGames/hongKongFishingPro')){const old=JSON.parse(fs.readFileSync(path.join(root,'pro/config.json'),'utf8'));old.fish=old.fish.filter(f=>!f.premium);return route.fulfill({contentType:'application/json',body:JSON.stringify({fields:{payload:{stringValue:JSON.stringify(old)}}})});}if(!url.startsWith(origin))return route.abort('internetdisconnected');const relative=decodeURIComponent(new URL(url).pathname.slice(new URL(origin).pathname.length));const file=path.resolve(root,relative||'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){missing.push(relative);return route.fulfill({status:404,body:''});}const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};await route.fulfill({path:file,contentType:types[path.extname(file)]||'application/octet-stream'});});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);await p.waitForFunction(()=>typeof cfg!=='undefined'&&cfg&&!cloudLoading);if(!native)await p.click('#skipFullscreen');
 assert.equal(await p.evaluate(()=>cfg.fish.length),170);
 await p.evaluate(async()=>{for(const f of cfg.fish.filter(f=>f.premium)){const im=new Image();im.src=asset(f.image);await im.decode();}});
 // Normal saved catch survives new fish, catalogue, and reload.
 await p.evaluate(()=>{save.bag=[{id:'seabream',name:'黃腳鱲',weight:1,catchId:'old-catch',time:1,area:'長洲'}];persist();chooseArea(cfg.areas.find(a=>a.id==='cheung-chau'));school.forEach((s,i)=>{s.species=i<4?cfg.fish.find(f=>f.premium):cfg.fish.find(f=>f.id==='seabream');s.x=360+i*93;s.y=420;s.angle=0;});});
 await p.waitForTimeout(400);await p.screenshot({path:'tmp/premium-shadows-'+(native?'app':'web')+'.png'});
 await p.evaluate(()=>{selected=school[0];bait={x:500,y:420};startFight();const prior=playBoatTrip;playBoatTrip=async next=>next();const random=Math.random;Math.random=()=>.5;land();Math.random=random;playBoatTrip=prior;});
 assert.equal(await p.evaluate(()=>save.bag.length),2);const id=await p.evaluate(()=>save.bag[0].id);assert.notEqual(id,'seabream');
 assert(await p.locator('.fishIdentity').isVisible());await p.locator('.fishIdentity').screenshot({path:'tmp/premium-catch-identity-'+(native?'app':'web')+'.png'});
 await p.evaluate(()=>{const fish=save.bag[0];if(salePrice(fish)<=fish.weight*50)throw Error('premium sale missing');transact({type:'sell',catchKey:CoastEconomy.catchKey(fish),amount:salePrice(fish)});persist();});
 await p.reload();await p.waitForFunction(()=>cfg&&!cloudLoading);assert.equal(await p.evaluate(()=>save.bag.length),2);assert.equal(await p.evaluate(()=>wallet().sold.has(CoastEconomy.catchKey(save.bag[0]))),true);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 if(native){await p.evaluate(()=>{$('home').hidden=true;modal('新增珍貴魚種', '<div id="premiumSheet" style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">'+cfg.fish.filter(f=>f.premium).map(f=>'<div style="text-align:center;font-size:12px">'+fishMarkup(f)+'<b>'+f.name+'</b></div>').join('')+'</div>');document.querySelectorAll('#premiumSheet img').forEach(im=>{im.loading='eager';im.style='width:100%;height:70px;object-fit:contain'});});await p.setViewportSize({width:1280,height:720});await p.evaluate(()=>Promise.all([...document.querySelectorAll('#premiumSheet img')].map(im=>im.decode())));await p.screenshot({path:'tmp/premium-art-sheet.png'});}
 await context.close();console.log('PASS '+(native?'App offline':'Web')+': 20 images, 170 fish, real premium catch, high sale price, old saves and sold collection after reload.');
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});


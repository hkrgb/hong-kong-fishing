const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
 await page.route('https://www.gstatic.com/**',r=>r.abort());await page.route('https://firestore.googleapis.com/**',r=>r.abort());
 const url=process.env.GAME_URL||'http://127.0.0.1:8765/mini-game/hong-kong-fishing/';
 await page.goto(url);await page.click('#skipFullscreen');await page.waitForFunction(()=>!cloudLoading);
 const manifestURL=await page.locator('link[rel=manifest]').getAttribute('href');assert.equal(manifestURL,'../manifest.webmanifest');
 const manifest=await page.evaluate(async()=>await (await fetch(document.querySelector('link[rel=manifest]').href)).json());assert.equal(manifest.display,'fullscreen');assert.equal(manifest.orientation,'landscape');
 for(const icon of manifest.icons){const response=await page.request.get(new URL(icon.src,new URL('../manifest.webmanifest',await page.evaluate(()=>document.baseURI))).href);assert(response.ok());}
 await page.evaluate(()=>{showIslandHub();showJournal('settings')});const links=page.locator('.personalSettings a');assert.equal(await links.count(),3);
 for(const size of [{width:1280,height:720},{width:844,height:390}]){await page.setViewportSize(size);await page.waitForTimeout(300);for(const card of await page.locator('.personalSettings > *').all()){const r=await card.boundingBox();assert(r&&r.x>=0&&r.y>=0&&r.x+r.width<=size.width+1&&r.y+r.height<=size.height+1,JSON.stringify(r));}}
 await page.screenshot({path:'tmp/android-settings-qa.png'});
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.goto(new URL('privacy.html',url).href);assert(await page.getByRole('heading',{name:'離島旅程 · 隱私權政策'}).isVisible());
 await page.goto(new URL('delete-account.html',url).href);assert(await page.getByRole('link',{name:'以電郵提出刪除要求'}).isVisible());
 await context.setOffline(true);await page.goto(new URL('?offline-test=1',url).href);assert(await page.getByRole('heading',{name:'海風暫時停了'}).isVisible());await context.setOffline(false);
 console.log('PASS: PWA manifest and icons, all settings controls in desktop/mobile bounds, privacy/deletion routes, offline fallback');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

/* UI revision from 修改資料/ui.pdf. Existing saves and fishing mechanics are shared. */
const islandAsset=name=>new URL('assets/island-ui/'+name,document.baseURI).href;
let islandBrowsing=false,miniSession=null;
function updateIslandBackdrop(){
 const layer=$('islandBackdrop');if(!layer)return;
 const file={morning:'menu-morning.jpg',noon:'menu-day.jpg',night:'menu-night.jpg'}[scenePeriod()];
 const url=islandAsset(file);if(layer.dataset.picture!==url){layer.style.backgroundImage='url("'+url+'")';layer.dataset.picture=url;}
}
function showIslandHub(){
 cancelCast();held=false;dialogOpen=true;islandBrowsing=true;
 stage.classList.add('islandBrowsing');$('home').hidden=true;$('modal').hidden=true;
 $('islandHub').hidden=false;updateIslandBackdrop();updateQuickHud();$('hubFishing').focus();
}
async function returnToIslandDirectory(){
 if(arriving||!economyReady())return;
 if(!area||area.category==='local'){showIslandHub();return;}
 const homeArea=cfg.areas.find(a=>a.category==='local');
 if(!homeArea)return;
 arriving=true;cancelCast();enter('ready');dialogOpen=true;$('returnDirectory').disabled=true;
 try{
  await playBoatTrip(()=>{
   if(!economyReady())throw Error('save');
   chooseArea(homeArea);showIslandHub();
  },boatFiles[scenePeriod()]);
 }catch{
  modal('暫時未能返回長洲','<p class="intro">請再試一次。回程免費，沒有扣除金錢。</p>',returnToIslandDirectory,'重試',true);
  foot('返回釣魚',closeDialog);
 }finally{arriving=false;$('returnDirectory').disabled=false;}
}
const originalSetupHome=setupHome;
setupHome=function(){
 originalSetupHome();
 const backdrop=document.createElement('div');backdrop.id='islandBackdrop';stage.append(backdrop);
 const hub=document.createElement('section');hub.id='islandHub';hub.hidden=true;hub.setAttribute('aria-label','旅程目錄');
 hub.innerHTML='<button id="hubFishing"><span>前往釣魚</span><img alt="" src="'+esc(areaArt(cfg.areas[0]))+'"></button><button id="hubShops"><span>前往店舖</span><img alt="" src="'+shopAsset('tackle-shop')+'"></button><button id="hubGames"><span>小遊戲</span><img alt="" src="'+new URL('../../peace-bun-whack/assets/festival-board.png',document.baseURI).href+'"></button>';
 stage.append(hub);$('hubFishing').onclick=showAreas;$('hubShops').onclick=openHarbour;$('hubGames').onclick=showMiniGames;
 const version=document.createElement('small');version.className='homeVersion';version.textContent='ver 1.0';$('home').append(version);
 $('newJourney').onclick=async()=>{if($('boatPreload'))return;await preloadBoatVideos();showIslandHub();};
 const back=document.createElement('button');back.id='returnDirectory';back.textContent='返回目錄';back.onclick=returnToIslandDirectory;stage.append(back);
};
const originalShowHome=showHome;
showHome=function(){
 islandBrowsing=false;stage.classList.remove('islandBrowsing');if($('islandHub'))$('islandHub').hidden=true;
 originalShowHome();document.title='離島旅程 · 從長洲出發的釣魚之旅';
 $('homeTitle').innerHTML='<img src="'+islandAsset('titlename.png')+'" alt="離島旅程 · 從長洲出發的釣魚之旅">';$('homeSubtitle').textContent='';
};
const originalModal=modal;
modal=function(...args){
 if($('islandHub'))$('islandHub').hidden=true;
 originalModal(...args);document.querySelector('.dialog').classList.remove('islandBookDialog');
 $('modalKicker').textContent='';
 $('closeModal').disabled=false;
};
const originalCloseDialog=closeDialog;
closeDialog=function(){if(islandBrowsing||!area){showIslandHub();return;}originalCloseDialog();};
const originalChooseArea=chooseArea;
chooseArea=function(a){islandBrowsing=false;stage.classList.remove('islandBrowsing');$('islandHub').hidden=true;originalChooseArea(a);updateQuickHud();};
const originalShowAreas=showAreas;
showAreas=function(...args){islandBrowsing=true;stage.classList.add('islandBrowsing');updateIslandBackdrop();originalShowAreas(...args);};
const originalUpdateQuickHud=updateQuickHud;
updateQuickHud=function(){originalUpdateQuickHud();updateIslandBackdrop();if(area)document.querySelector('.brand h1').textContent=area.name;if($('returnDirectory'))$('returnDirectory').textContent=area&&area.category!=='local'?'回長洲':'返回目錄';};
returnFromShop=function(){if(islandBrowsing||!area)showIslandHub();else closeDialog();};
showJournal=function(){
 modal('遊戲選單','<div class="islandBookActions"><button id="bookFullscreen">'+(isFullscreen()?'退出全屏幕':'全屏幕')+'</button><a href="https://sites.google.com/rgb-workshop.com/book-001/%E8%A9%A6%E9%96%B1" target="_blank" rel="noopener noreferrer">遊戲 / 故事起源</a><button id="bookDisclaimer">免責聲明</button><a href="mailto:info@rgb-workshop.com">聯絡我們</a></div>');
 document.querySelector('.dialog').classList.add('islandBookDialog');
 $('bookFullscreen').onclick=async()=>{await toggleFullscreen();$('bookFullscreen').textContent=isFullscreen()?'退出全屏幕':'全屏幕';};$('bookDisclaimer').onclick=showDisclaimer;
};
function showDisclaimer(){
 modal('免責聲明','<article class="islandDisclaimer"><p>本遊戲以休閒娛樂及認識香港海岸為目的。遊戲內的文字、魚類介紹、圖片及其他資料主要由人工智能（AI）生成或輔助製作，可能存在錯誤、遺漏或與實際情況不符。</p><p>遊戲中的魚種分布、釣獲機率、價格及環境設定屬遊戲設計，請勿用作實際出海、垂釣或食用魚類的判斷依據。</p><p>如發現資料有誤、圖片或內容有問題，或希望提出建議，歡迎電郵至 <a href="mailto:info@rgb-workshop.com">info@rgb-workshop.com</a>，我們會跟進及作適當修訂。多謝你幫助我們完善這段離島旅程。</p></article>',showJournal,'返回');
}
function showMiniGames(){
 modal('小遊戲','<div class="islandMiniGrid"><button id="playBun" class="islandMiniCard"><img src="'+new URL('../../peace-bun-whack/assets/festival-board.png',document.baseURI).href+'" alt="平安包打地鼠遊戲"><span><b>平安包打地鼠</b><small>初級 $100 · 中級 $200 · 高級 $300</small></span></button><p>通關獎金自動存入釣魚遊戲，可用來買魚餌及支付船費。</p></div>',showIslandHub,'返回');
 $('playBun').onclick=playBunGame;
}
function playBunGame(){
 if(!economyReady()||miniSession)return;
 const session=crypto.randomUUID(),url=new URL('../../peace-bun-whack/',document.baseURI);
 url.searchParams.set('fishingSession',session);url.searchParams.set('parentOrigin',location.origin);
 const layer=document.createElement('section');layer.id='islandMiniPlayer';layer.setAttribute('aria-label','平安包打地鼠');
 const frame=document.createElement('iframe');frame.title='平安包打地鼠';frame.allow='fullscreen';frame.src=url.href;
 const back=document.createElement('button');back.textContent='返回釣魚目錄';back.onclick=()=>{miniSession=null;layer.remove();showMiniGames();};
 layer.append(frame,back);stage.append(layer);miniSession={session,frame,origin:url.origin,layer};
}
addEventListener('message',e=>{
 const m=miniSession,d=e.data;
 if(!m||e.source!==m.frame.contentWindow||e.origin!==m.origin||!d||d.type!=='coastline-bun-result'||d.session!==m.session||typeof d.run!=='string'||d.run.length>80||!Array.isArray(d.levels))return;
 if(!economyReady())return;
 const levels=[...new Set(d.levels)].sort((a,b)=>a-b);
 if(levels.length>3||levels.some((n,i)=>n!==i+1))return;
 for(const level of levels){
  const rewardKey=m.session+':'+d.run+':'+level;
  if(!wallet().rewards.has(rewardKey))transact({type:'minigame',game:'peace-bun-whack',level,rewardKey,amount:level*100});
 }
 updateQuickHud();m.frame.contentWindow.postMessage({type:'coastline-bun-ack',session:m.session,run:d.run,levels},m.origin);
 if(d.complete){miniSession=null;m.layer.remove();showMiniGames();}
});

/* September bookshop, catch decisions and daily paid activities. */
const bookAsset=name=>/^https?:\/\//.test(name)?name:new URL('assets/bookshop/'+name,document.baseURI).href;
const bookshopData=()=>Object.fromEntries(['books','toys','postcards'].map(k=>[k,k==='books'?BookshopDefaults.books:[...BookshopDefaults[k],...(cfg.bookshop?.[k]||[]).filter(v=>!BookshopDefaults[k].some(x=>x.id===v.id))].filter(v=>k!=='toys'||!StorySouvenirs.some(x=>x.id===v.id||x.name===v.name))]));
let inBookshop=false,dailySession=null;
const septemberHub=showIslandHub;
showIslandHub=function(){inBookshop=false;$('bookshopHub')?.remove();septemberHub();};
const septemberBackdrop=updateIslandBackdrop;
updateIslandBackdrop=function(){const preview=$('hubBooks')?.querySelector('img');if(preview){const url=bookAsset({morning:'bookshop-morning.png',noon:'bookshop-bg.jpg',night:'bookshop-night.png'}[scenePeriod()]);if(preview.src!==url)preview.src=url;}if(inBookshop){const file={morning:'bookshop-morning.png',noon:'bookshop-bg.jpg',night:'bookshop-night.png'}[scenePeriod()],url=bookAsset(file),layer=$('islandBackdrop');if(layer.dataset.picture!==url){layer.style.backgroundImage='url("'+url+'")';layer.dataset.picture=url;}}else septemberBackdrop();};
const septemberSetup=setupHome;
setupHome=function(){
 septemberSetup();$('hubFishing').querySelector('span').textContent='出發釣魚';
 const b=document.createElement('button');b.id='hubBooks';b.innerHTML='<span>前往書店</span><img alt="" src="'+bookAsset('bookshop-bg.jpg')+'">';b.onclick=showBookshop;$('hubGames').before(b);
 const ticker=document.createElement('section');ticker.id='islandTicker';ticker.innerHTML='<img alt="" src="'+bookAsset('radio2.png')+'"><div><div class="tickerHeading"><h2 id="tickerTitle">景點簡介</h2><span id="tickerIdentity" hidden><img id="tickerPicture" alt=""><span id="tickerName"></span></span></div><div class="tickerWindow"><p id="tickerText"></p></div></div>';stage.append(ticker);
 updateTicker();
};
const septemberQuickSetup=setupQuickHud;
setupQuickHud=function(){septemberQuickSetup();$('hudHearts').before($('returnDirectory'));setupJourneyMusic();};
const septemberHud=updateQuickHud;
updateQuickHud=function(){septemberHud();if($('returnDirectory')){$('returnDirectory').textContent='⌂ 回家';$('returnDirectory').title=area&&area.category!=='local'?'乘船返回長洲目錄':'返回長洲目錄';}};
const septemberClose=closeDialog;
closeDialog=function(){if(inBookshop){showBookshop();return;}septemberClose();};
const septemberChoose=chooseArea;
chooseArea=function(a){inBookshop=false;$('bookshopHub')?.remove();septemberChoose(a);tickerIndex=0;updateTicker();};
const septemberHome=showHome;
showHome=function(){inBookshop=false;$('bookshopHub')?.remove();septemberHome();};
const septemberModal=modal;
modal=function(...args){$('bookshopHub')?.remove();septemberModal(...args);document.querySelector('.dialog').classList.remove('bookDetailDialog');};
function showBookshop(){
 cancelCast();held=false;dialogOpen=true;islandBrowsing=true;inBookshop=true;stage.classList.add('islandBrowsing');$('home').hidden=true;$('modal').hidden=true;$('islandHub').hidden=true;$('bookshopHub')?.remove();updateIslandBackdrop();
 const hub=document.createElement('section');hub.id='bookshopHub';hub.setAttribute('aria-label','長洲書店');
 hub.innerHTML='<button id="recommendBooks">店長推介</button><button id="dailyToys">懷舊扭蛋</button><button id="dailyPostcards">明信片</button><button id="recyclingStation">回收站</button>';
 stage.append(hub);$('recommendBooks').onclick=()=>showBooks();$('dailyToys').onclick=()=>openDailyGame('toy');$('dailyPostcards').onclick=()=>openDailyGame('postcard');$('recyclingStation').onclick=()=>showRecycling();
}
function showBookCollection(){
 const entries=[...wallet().instances.entries()];
 modal('我的收藏',entries.length?'<div class="souvenirCollection">'+entries.map(([key,v])=>'<article><img src="'+esc(bookAsset(v.image))+'" alt="'+esc(v.name)+'"><b>'+esc(v.name)+'</b><small>'+ (key.startsWith('toy|')?'懷舊玩具':'已完成明信片')+'</small></article>').join('')+'</div>':'<p class="intro">到扭蛋機轉出童年玩具，或完成一張明信片拼圖吧。</p>',showBookshop,'返回書店');
}
const septemberFish=showFish;
showFish=function(f,newCatch=false){
 septemberFish(f,newCatch);const key=CoastEconomy.catchKey(f),w=wallet();
 if(newCatch&&!w.sold.has(key)&&!w.released.has(key)&&!w.offered.has(key)){
  $('modalFooter').replaceChildren();let decided=false;
  const finish=()=>{if(pendingPrize)showPrize();else closeDialog();};
  foot('放入釣箱',()=>{if(decided)return;decided=true;finish();},true);
  foot('放生',()=>{if(decided||!transact({type:'release',catchKey:key}))return;decided=true;updateQuickHud();finish();});
 }else if(w.offered.has(key)||w.released.has(key)||w.sold.has(key)){
  const s=document.createElement('p');s.className='catchDisposition';s.textContent=w.offered.has(key)?'已用於解鎖小劇場':w.released.has(key)?'已放生 · 保留紀錄，不能出售':'已出售 · 保留紀錄';$('modalBody').append(s);
 }
};
let tickerIndex=0,tickerTimer=null,tickerAnimation=0;
function tickerItem(){
 switch(tickerIndex++%3){
  case 0:{const a=tickerIndex===1&&area?area:cfg.areas[Math.floor(Math.random()*cfg.areas.length)];return {title:'景點簡介',text:a.name+'：'+(a.introText||a.description||'放慢步伐，欣賞海岸景色。'),image:areaArt(a,'noon'),alt:a.name};}
  case 1:{const f=cfg.fish[Math.floor(Math.random()*cfg.fish.length)];return {title:'魚類小知識',text:f.name+'：'+(f.educationIntro||f.description||[f.en,f.scientificName,f.family].filter(Boolean).join(' · ')),image:asset(f.image),alt:f.name};}
  default:{const s=CoastWeather.snapshot(area||cfg.areas[0]),parts=['香港天文台：'+s.name];
   if(s.air)parts.push(s.air.place+'氣溫 '+s.air.value+'°C（'+observationTime(s.airTime)+'）');
   if(s.humidity)parts.push(s.humidity.place+'相對濕度 '+s.humidity.value+'%');
   if(s.uv)parts.push(s.uv.place+'紫外線指數 '+s.uv.value+'（'+s.uv.desc+'）');
   if(s.sea)parts.push(s.sea.place+'海水溫度 '+s.sea.value+'°C（'+observationTime(s.seaTime)+'）');
   if(s.forecast){const f=s.forecast;parts.push('今日預測：'+f.forecastWeather+' '+f.forecastWind);if(f.forecastMintemp?.unit==='C'&&f.forecastMaxtemp?.unit==='C')parts.push('預測氣溫 '+f.forecastMintemp.value+'–'+f.forecastMaxtemp.value+'°C');}
   if(parts.length===1)parts.push('即時觀測暫未能載入，稍後會再更新');
   return {title:'天氣消息',text:parts.join('；'),image:'',alt:''};}
 }
}
function updateTicker(){
 const track=$('tickerText');if(!track||!cfg)return;cancelAnimationFrame(tickerAnimation);clearTimeout(tickerTimer);track.replaceChildren();track.style.animation='none';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let x=null,last=0,active=null,items=[];track.style.transform='translateX('+(track.parentElement.clientWidth||649)+'px)';
 const label=item=>{if(active===item)return;active=item;const heading=$('tickerTitle'),picture=$('tickerPicture'),identity=$('tickerIdentity'),name=$('tickerName');heading.textContent=item.title;identity.hidden=!item.image;picture.hidden=!item.image;name.textContent=item.image?item.alt:'';if(item.image){picture.src=item.image;picture.alt=item.alt;picture.dataset.category=item.title;}if(!reduced){heading.animate([{opacity:0},{opacity:1}],{duration:450});identity.getAnimations().forEach(animation=>animation.cancel());identity.animate([{opacity:0},{opacity:1}],{duration:450});}};
 const append=()=>{const item=tickerItem(),node=document.createElement('span');node.className='tickerItem';node.textContent=item.text;track.append(node);item.node=node;items.push(item);};
 append();label(items[0]);
 if(reduced){track.style.transform='none';tickerTimer=setTimeout(updateTicker,Math.max(15000,items[0].text.length*350));return;}
 append();
 const tick=now=>{const dt=last?Math.min((now-last)/1000,.1):0;last=now;
  if(!document.hidden&&track.getClientRects().length){const width=track.parentElement.clientWidth;if(width){if(x===null)x=width;x-=45*dt;while(items.length>1&&x+items[0].node.offsetWidth<0){x+=items[0].node.offsetWidth;items.shift().node.remove();append();}while(x+track.scrollWidth<width+100)append();let offset=x,current=items[0];for(const item of items){if(offset<=width)current=item;offset+=item.node.offsetWidth;}label(current);track.style.transform='translateX('+x+'px)';}}
  tickerAnimation=requestAnimationFrame(tick);
 };tickerAnimation=requestAnimationFrame(tick);
}
function setupJourneyMusic(){
 const audio=new Audio(bookAsset('bgm-piano.mp3'));audio.id='journeyMusic';audio.loop=true;audio.volume=.3;document.body.append(audio);
 let enabled=true,started=false;try{enabled=localStorage.getItem('islandMusic')!=='off';}catch{}
 const b=document.createElement('button');b.id='musicToggle';b.setAttribute('aria-label','背景音樂');$('hudTemperature').after(b);
 const refresh=()=>{b.textContent=enabled?'♫':'♩';b.title=enabled?'關閉背景音樂':'開啟背景音樂';b.setAttribute('aria-pressed',String(enabled));const blocked=document.hidden||dailySession||miniSession||[...document.querySelectorAll('video')].some(v=>!v.paused&&!v.ended)||!!document.querySelector('.bookVideos');if(enabled&&started&&!blocked)audio.play().catch(()=>{});else audio.pause();};
 b.onclick=()=>{enabled=!enabled;started=true;try{localStorage.setItem('islandMusic',enabled?'on':'off');}catch{}refresh();};
 document.addEventListener('pointerdown',()=>{started=true;refresh();},{once:true});document.addEventListener('keydown',()=>{started=true;refresh();},{once:true});document.addEventListener('visibilitychange',refresh);document.addEventListener('play',refresh,true);document.addEventListener('pause',e=>{if(e.target!==audio)refresh();},true);setInterval(refresh,1000);refresh();
}
function hkDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function dailyPool(kind,day){
 const w=wallet(),key=kind+'|'+day;
 return w.dailyPools.get(key)||DailySouvenirs.pool(bookshopData()[kind==='toy'?'toys':'postcards'],kind,day,w.daily.get(key));
}
function dailyItem(kind,day){return DailySouvenirs.draw(dailyPool(kind,day));}
function dailyReply(message){if(dailySession)dailySession.frame.contentWindow.postMessage({...message,session:dailySession.id},dailySession.origin);}
function openDailyGame(kind){
 if(dailySession||!economyReady())return;
 const path=kind==='toy'?'yes-card-gacha':'jigsaw-puzzle';
 const url=new URL('../mini-games/'+path+'/',document.baseURI);
 const id=crypto.randomUUID();url.searchParams.set('bookshopSession',id);url.searchParams.set('parentOrigin',location.origin);
 const layer=document.createElement('section');layer.id='bookshopPlayer';const frame=document.createElement('iframe');frame.title=kind==='toy'?'懷舊扭蛋':'每日明信片';frame.src=url.href;frame.allow='fullscreen';
 const close=document.createElement('button');close.textContent='‹ 返回書店';close.className='bookshopBack';close.onclick=()=>{dailySession=null;layer.remove();showBookshop();};layer.append(frame,close);stage.append(layer);dailySession={id,frame,origin:url.origin,kind,requests:new Map()};
}
addEventListener('message',e=>{
 const s=dailySession,d=e.data;if(!s||e.source!==s.frame.contentWindow||e.origin!==s.origin||!d||d.session!==s.id)return;
 const sendState=()=>dailyReply({type:'bookshop-state',kind:s.kind,day:hkDay(),money:wallet().money,price:20,art:{machine:bookAsset('machine.png'),background:bookAsset('postcard-table.png')},collection:[...wallet().instances.entries()].filter(([k])=>k.startsWith(s.kind+'|')).map(([,v])=>({...collectionItem(v),image:bookAsset(collectionItem(v).image)}))});
 if(d.type==='bookshop-ready'){sendState();return;}
 if(d.type==='bookshop-play'){
  if(typeof d.request!=='string'||!/^[\w-]{1,80}$/.test(d.request))return;
  const purchaseKey=s.id+'|'+d.request;let receipt=wallet().purchases.get(purchaseKey);
  if(!receipt){const day=hkDay(),item=dailyItem(s.kind,day);if(!item||!transact({type:'souvenir',kind:s.kind,day,item,dailyMode:3,dailyPool:dailyPool(s.kind,day),amount:20,purchaseKey})){dailyReply({type:'bookshop-error',request:d.request,text:item?'金錢不足或存檔正在同步，未有扣款。':'本日藏品尚未準備好，未有扣款。'});return;}receipt=wallet().purchases.get(purchaseKey);}
  s.requests.set(d.request,purchaseKey);updateQuickHud();dailyReply({type:'bookshop-paid',request:d.request,day:receipt.day,money:wallet().money,item:{...collectionItem(receipt.item),image:bookAsset(collectionItem(receipt.item).image)}});return;
 }
 if(d.type==='bookshop-complete'&&s.kind==='postcard'&&s.requests.has(d.request)){
  // The host validates a complete permutation, and grants no cash for puzzles.
  if(!Array.isArray(d.order)||d.order.length!==12||!d.order.every((v,i)=>v===i))return;
  const purchaseKey=s.requests.get(d.request);if(!wallet().purchases.has(purchaseKey))return;
  if(!save.economyEvents.some(v=>v.type==='postcard-complete'&&v.purchaseKey===purchaseKey)&&!transact({type:'postcard-complete',purchaseKey}))return;
  sendState();dailyReply({type:'bookshop-collected',request:d.request});
 }
});


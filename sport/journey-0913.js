/* September bookshop, catch decisions and daily paid activities. */
const bookAsset=name=>/^https?:\/\//.test(name)?name:new URL('assets/bookshop/'+name,document.baseURI).href;
const bookshopData=()=>Object.fromEntries(['books','toys','postcards'].map(k=>[k,cfg.bookshop?.[k]??BookshopDefaults[k]]));
let inBookshop=false,dailySession=null;
const septemberHub=showIslandHub;
showIslandHub=function(){inBookshop=false;$('bookshopHub')?.remove();septemberHub();};
const septemberBackdrop=updateIslandBackdrop;
updateIslandBackdrop=function(){const preview=$('hubBooks')?.querySelector('img');if(preview){const url=bookAsset({morning:'bookshop-morning.png',noon:'bookshop-bg.jpg',night:'bookshop-night.png'}[scenePeriod()]);if(preview.src!==url)preview.src=url;}if(inBookshop){const file={morning:'bookshop-morning.png',noon:'bookshop-bg.jpg',night:'bookshop-night.png'}[scenePeriod()],url=bookAsset(file),layer=$('islandBackdrop');if(layer.dataset.picture!==url){layer.style.backgroundImage='url("'+url+'")';layer.dataset.picture=url;}}else septemberBackdrop();};
const septemberSetup=setupHome;
setupHome=function(){
 septemberSetup();$('hubFishing').querySelector('span').textContent='出發釣魚';
 const b=document.createElement('button');b.id='hubBooks';b.innerHTML='<span>前往書店</span><img alt="" src="'+bookAsset('bookshop-bg.jpg')+'">';b.onclick=showBookshop;$('hubGames').before(b);
 const ticker=document.createElement('section');ticker.id='islandTicker';ticker.innerHTML='<img alt="" src="'+bookAsset('radio2.png')+'"><div><div class="tickerHeading"><h2 id="tickerTitle">旅遊</h2><img id="tickerPicture" alt=""></div><div class="tickerWindow"><p id="tickerText"></p></div></div>';stage.append(ticker);
 updateTicker();
};
const septemberQuickSetup=setupQuickHud;
setupQuickHud=function(){septemberQuickSetup();$('hudFish').after($('returnDirectory'));setupJourneyMusic();};
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
 hub.innerHTML='<button id="recommendBooks">好書推介</button><button id="dailyToys">懷舊扭蛋</button><button id="dailyPostcards">明信片</button><button id="bookshopHome">⌂ 回家</button>';
 stage.append(hub);$('recommendBooks').onclick=()=>showBooks();$('dailyToys').onclick=()=>openDailyGame('toy');$('dailyPostcards').onclick=()=>openDailyGame('postcard');$('bookshopHome').onclick=returnToIslandDirectory;
}
function showBooks(index=0,tab='info',videoPage=0){
 const books=bookshopData().books,b=books[index];if(!b){modal('好書推介','<p class="intro">新書正在準備中。</p>');return;}
 const media=(b.videos||[]).filter(v=>/^[\w-]{11}$/.test(v.id));
 videoPage=clamp(videoPage,0,Math.max(0,media.length-1));
 const content=tab==='info'?'<article class="bookCopy"><h2>'+esc(b.name)+'</h2><h3>'+esc(b.subtitle||'')+'</h3>'+String(b.description||'').split('\n').filter(Boolean).map(p=>'<p>'+esc(p)+'</p>').join('')+'</article><img class="bookCover" src="'+esc(bookAsset(b.image))+'" alt="'+esc(b.name)+'書籍封面">':'<div class="bookVideos">'+(media.length?media.slice(videoPage,videoPage+1).map(v=>'<article><iframe title="'+esc(v.title)+'" src="https://www.youtube-nocookie.com/embed/'+v.id+'" allow="fullscreen; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><h3>'+esc(v.title)+'</h3><a href="https://www.youtube.com/watch?v='+v.id+'" target="_blank" rel="noopener">在 YouTube 觀看 ↗</a></article>').join(''):'<p class="intro">影片正在準備中。</p>')+'</div>';
 modal('好書推介','<div class="bookLayout"><nav class="bookTabs"><button id="bookInfoTab" aria-pressed="'+(tab==='info')+'">書籍資料</button><button id="bookMediaTab" aria-pressed="'+(tab==='media')+'">多媒體</button></nav><div class="bookContent">'+content+'</div></div>');
 document.querySelector('.dialog').classList.add('bookDetailDialog');const back=foot('‹ 返回書店',showBookshop);back.className='bookshopBack';$('bookInfoTab').onclick=()=>showBooks(index,'info');$('bookMediaTab').onclick=()=>showBooks(index,'media');
 if(tab==='media'&&media.length){foot('上一頁',()=>showBooks(index,'media',videoPage-1)).disabled=videoPage===0;foot((videoPage+1)+' / '+media.length,()=>{}).disabled=true;foot('下一頁',()=>showBooks(index,'media',videoPage+1)).disabled=videoPage===media.length-1;}
 if(books.length>1){foot('上一本',()=>showBooks(index-1)).disabled=index===0;foot((index+1)+' / '+books.length,()=>{}).disabled=true;foot('下一本',()=>showBooks(index+1)).disabled=index===books.length-1;}
}
function showBookCollection(){
 const entries=[...wallet().collection.entries()];
 modal('我的收藏',entries.length?'<div class="souvenirCollection">'+entries.map(([key,v])=>'<article><img src="'+esc(bookAsset(v.image))+'" alt="'+esc(v.name)+'"><b>'+esc(v.name)+'</b><small>'+ (key.startsWith('toy|')?'懷舊玩具':'已完成明信片')+'</small></article>').join('')+'</div>':'<p class="intro">到扭蛋機轉出童年玩具，或完成一張明信片拼圖吧。</p>',showBookshop,'返回書店');
}
const septemberFish=showFish;
showFish=function(f,newCatch=false){
 septemberFish(f,newCatch);const key=CoastEconomy.catchKey(f),w=wallet();
 if(newCatch&&!w.sold.has(key)&&!w.released.has(key)){
  $('modalFooter').replaceChildren();let decided=false;
  const finish=()=>{if(pendingPrize)showPrize();else closeDialog();};
  foot('放入釣箱',()=>{if(decided)return;decided=true;finish();},true);
  foot('放生',()=>{if(decided||!transact({type:'release',catchKey:key}))return;decided=true;updateQuickHud();finish();});
 }else if(w.released.has(key)||w.sold.has(key)){
  const s=document.createElement('p');s.className='catchDisposition';s.textContent=w.released.has(key)?'已放生 · 保留紀錄，不能出售':'已出售 · 保留紀錄';$('modalBody').append(s);
 }
};
let tickerIndex=0,tickerTimer=null,tickerAnimation=0;
function tickerItem(){
 switch(tickerIndex++%3){
  case 0:{const a=cfg.areas[Math.floor(Math.random()*cfg.areas.length)];return {title:'旅遊',text:a.name+'：'+(a.introText||a.description||'放慢步伐，欣賞海岸景色。'),image:areaArt(a,'noon'),alt:a.name};}
  case 1:{const f=cfg.fish[Math.floor(Math.random()*cfg.fish.length)];return {title:'魚',text:f.name+'：'+(f.educationIntro||f.description||[f.en,f.scientificName,f.family].filter(Boolean).join(' · ')),image:asset(f.image),alt:f.name};}
  default:{const s=CoastWeather.snapshot(area||cfg.areas[0]),parts=['香港天文台：'+s.name];
   if(s.air)parts.push(s.air.place+'氣溫 '+s.air.value+'°C（'+observationTime(s.airTime)+'）');
   if(s.humidity)parts.push(s.humidity.place+'相對濕度 '+s.humidity.value+'%');
   if(s.uv)parts.push(s.uv.place+'紫外線指數 '+s.uv.value+'（'+s.uv.desc+'）');
   if(s.sea)parts.push(s.sea.place+'海水溫度 '+s.sea.value+'°C（'+observationTime(s.seaTime)+'）');
   if(s.forecast){const f=s.forecast;parts.push('今日預測：'+f.forecastWeather+' '+f.forecastWind);if(f.forecastMintemp?.unit==='C'&&f.forecastMaxtemp?.unit==='C')parts.push('預測氣溫 '+f.forecastMintemp.value+'–'+f.forecastMaxtemp.value+'°C');}
   if(parts.length===1)parts.push('即時觀測暫未能載入，稍後會再更新');
   return {title:'天氣',text:parts.join('；'),image:'',alt:''};}
 }
}
function updateTicker(){
 const track=$('tickerText');if(!track||!cfg)return;cancelAnimationFrame(tickerAnimation);clearTimeout(tickerTimer);track.replaceChildren();track.style.animation='none';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let x=0,last=0,active=null,items=[];
 const label=item=>{if(active===item)return;active=item;const heading=$('tickerTitle'),picture=$('tickerPicture');heading.textContent=item.title;picture.hidden=!item.image;if(item.image){picture.src=item.image;picture.alt=item.alt;picture.dataset.category=item.title;}if(!reduced){heading.animate([{opacity:0},{opacity:1}],{duration:450});picture.animate([{opacity:0},{opacity:1}],{duration:450});}};
 const append=()=>{const item=tickerItem(),node=document.createElement('span');node.className='tickerItem';node.textContent=item.text;track.append(node);item.node=node;items.push(item);};
 append();label(items[0]);
 if(reduced){track.style.transform='none';tickerTimer=setTimeout(updateTicker,Math.max(15000,items[0].text.length*350));return;}
 append();
 const tick=now=>{const dt=last?Math.min((now-last)/1000,.1):0;last=now;
  if(!document.hidden&&track.getClientRects().length){const width=track.parentElement.clientWidth;if(width){x-=45*dt;while(items.length>1&&x+items[0].node.offsetWidth<0){x+=items[0].node.offsetWidth;items.shift().node.remove();append();}while(x+track.scrollWidth<width+100)append();let offset=x,current=items[0];for(const item of items){if(offset<=width)current=item;offset+=item.node.offsetWidth;}label(current);track.style.transform='translateX('+x+'px)';}}
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
function dailyItem(kind,day){
 const fixed=wallet().daily.get(kind+'|'+day);if(fixed)return fixed;
 const list=bookshopData()[kind==='toy'?'toys':'postcards'].filter(v=>v.id&&v.image).slice().sort((a,b)=>a.id.localeCompare(b.id));
 let hash=2166136261;for(const c of kind+'|'+day)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
 return list.length?structuredClone(list[hash%list.length]):null;
}
function dailyReply(message){if(dailySession)dailySession.frame.contentWindow.postMessage({...message,session:dailySession.id},dailySession.origin);}
function openDailyGame(kind){
 if(dailySession||!economyReady())return;
 const remote=location.hostname==='hkrgb.github.io',path=kind==='toy'?'yes-card-gacha':remote?'island-jigsaw-puzzle':'jigsaw-puzzle';
 const url=remote?new URL('https://hkrgb.github.io/'+path+'/'):new URL('../../'+path+'/',document.baseURI);
 const id=crypto.randomUUID();url.searchParams.set('bookshopSession',id);url.searchParams.set('parentOrigin',location.origin);
 const layer=document.createElement('section');layer.id='bookshopPlayer';const frame=document.createElement('iframe');frame.title=kind==='toy'?'懷舊扭蛋':'每日明信片';frame.src=url.href;frame.allow='fullscreen';
 const close=document.createElement('button');close.textContent='‹ 返回書店';close.className='bookshopBack';close.onclick=()=>{dailySession=null;layer.remove();showBookshop();};layer.append(frame,close);stage.append(layer);dailySession={id,frame,origin:url.origin,kind,requests:new Map()};
}
addEventListener('message',e=>{
 const s=dailySession,d=e.data;if(!s||e.source!==s.frame.contentWindow||e.origin!==s.origin||!d||d.session!==s.id)return;
 const sendState=()=>dailyReply({type:'bookshop-state',kind:s.kind,day:hkDay(),money:wallet().money,price:20,art:{machine:bookAsset('machine.png'),background:bookAsset('postcard-table.png')},collection:[...wallet().collection.entries()].filter(([k])=>k.startsWith(s.kind+'|')).map(([,v])=>({...v,image:bookAsset(v.image)}))});
 if(d.type==='bookshop-ready'){sendState();return;}
 if(d.type==='bookshop-play'){
  if(typeof d.request!=='string'||!/^[\w-]{1,80}$/.test(d.request))return;
  const purchaseKey=s.id+'|'+d.request;let receipt=wallet().purchases.get(purchaseKey);
  if(!receipt){const day=hkDay(),item=dailyItem(s.kind,day);if(!item||!transact({type:'souvenir',kind:s.kind,day,item,amount:20,purchaseKey})){dailyReply({type:'bookshop-error',request:d.request,text:item?'金錢不足或存檔正在同步，未有扣款。':'本日藏品尚未準備好，未有扣款。'});return;}receipt=wallet().purchases.get(purchaseKey);}
  s.requests.set(d.request,purchaseKey);updateQuickHud();dailyReply({type:'bookshop-paid',request:d.request,day:receipt.day,money:wallet().money,item:{...receipt.item,image:bookAsset(receipt.item.image)}});return;
 }
 if(d.type==='bookshop-complete'&&s.kind==='postcard'&&s.requests.has(d.request)){
  // The host validates a complete permutation, and grants no cash for puzzles.
  if(!Array.isArray(d.order)||d.order.length!==12||!d.order.every((v,i)=>v===i))return;
  const purchaseKey=s.requests.get(d.request);if(!wallet().purchases.has(purchaseKey))return;
  if(!save.economyEvents.some(v=>v.type==='postcard-complete'&&v.purchaseKey===purchaseKey)&&!transact({type:'postcard-complete',purchaseKey}))return;
  sendState();dailyReply({type:'bookshop-collected',request:d.request});
 }
});

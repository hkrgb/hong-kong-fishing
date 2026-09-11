const arrivalCache=new Map();let arriving=false;
const boatFiles={morning:'ship-7am.mp4',noon:'ship-1pm.mp4',night:'ship-9pm.mp4'},boatVideos=new Map();
const preloadedMovies=[...Object.values(boatFiles),'get.mp4'];
async function preloadBoatVideos(){
 if(boatVideos.size===preloadedMovies.length)return;
 const layer=document.createElement('div');layer.id='boatPreload';layer.innerHTML='<section><h2 style="font-size:26px;margin:0 0 20px">資料載入中</h2><p role="status" hidden></p><progress aria-label="載入乘船影片" max="4" value="0"></progress><div></div></section>';stage.append(layer);
 async function attempt(){
  const status=layer.querySelector('p'),actions=layer.querySelector('div');actions.replaceChildren();status.hidden=true;status.textContent='資料載入中';
  await Promise.all(preloadedMovies.map(async name=>{if(boatVideos.has(name))return;try{const r=await fetch(asset('../mp4/'+name),{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('video');const blob=await r.blob();if(!blob.size)throw Error('empty');boatVideos.set(name,URL.createObjectURL(blob));}catch{}layer.querySelector('progress').value=boatVideos.size;status.textContent='已預載 '+boatVideos.size+' / 4 段影片';}));
  if(boatVideos.size===preloadedMovies.length){layer.remove();return;}
  status.hidden=false;status.textContent='部分影片未能載入。可重試，或先進入遊戲（乘船時再載入）。';
  await new Promise(resolve=>{for(const [label,action] of [['重試預載',async()=>{await attempt();resolve();}],['先進入遊戲',()=>{layer.remove();resolve();}]]){const b=document.createElement('button');b.textContent=label;b.onclick=action;actions.append(b);}});
 }
 await attempt();
}
function preloadPicture(url){if(arrivalCache.has(url))return arrivalCache.get(url);const p=new Promise((resolve,reject)=>{const i=new Image(),timer=setTimeout(()=>reject(Error('timeout')),12000);i.onload=async()=>{try{await i.decode();clearTimeout(timer);resolve(i)}catch(e){clearTimeout(timer);reject(e)}};i.onerror=()=>{clearTimeout(timer);reject(Error('image'))};i.src=url;});arrivalCache.set(url,p);p.catch(()=>arrivalCache.delete(url));return p;}
async function enterAreaLoaded(a,confirmed=false){
 if(arriving)return;
 const travelling=area?.id!==a.id,price=travelling?areaPrice(a):0;
 if(price&&!confirmed){modal('確認乘船','<div class="boatCheckout"><h3>'+esc(a.name)+'</h3><div class="boatAmounts"><p>本次船費<strong>🪙 '+price+'</strong></p><p>現有金錢<strong>🪙 '+wallet().money+'</strong></p></div><p class="boatNote">每次前往外區需付船費，返回長洲免費。</p></div>',()=>enterAreaLoaded(a,true),'確認出發',true);foot('取消',()=>showRegionAreas(a.category));return;}
 arriving=true;modal('準備前往 '+a.name,'<div class="arrival"><div class="arrivalSpinner"></div><h2>正在準備海岸…</h2></div>');$('closeModal').disabled=true;
 try{
  await preloadPicture(areaArt(a));if(!economyReady())throw Error('save');
  if(price&&!transact({type:'travel',areaId:a.id,amount:price})){economyMessage('金錢不足','沒有扣款，請先到免費釣區釣魚或出售魚獲。',showAreas);return;}
  updateWallet();updateQuickHud();
  if(travelling&&(a.category!=='local'||(area&&area.category!=='local')))await playBoatTrip(()=>chooseArea(a));
  else chooseArea(a);
 }catch{modal('暫時未能載入釣區','<p class="intro">請檢查網絡，然後重試。</p>',()=>enterAreaLoaded(a),'重試',true);foot('返回釣區',showAreas);}
 finally{arriving=false;$('closeModal').disabled=false;}
}
function playBoatTrip(revealScene=()=>{},file=boatFiles[RegionGuide.period()]){return new Promise((resolve,reject)=>{
 const layer=document.createElement('div');layer.id='boatTrip';
 const video=document.createElement('video');video.playsInline=true;video.muted=true;video.preload='auto';
 video.src=boatVideos.get(file)||asset('../mp4/'+file);
 const button=document.createElement('button');button.textContent='資料載入中';button.hidden=true;layer.append(video,button);stage.append(layer);
 let done=false;const finish=async()=>{
  if(done)return;done=true;clearTimeout(timer);video.pause();button.hidden=true;
  try{
   // Keep the final video frame over the prepared scene throughout the dissolve.
   revealScene();
   const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:800;
   const fade=layer.animate([{opacity:1},{opacity:0}],{duration,easing:'ease-in-out',fill:'forwards'});
   await fade.finished.catch(()=>{});resolve();
  }catch(error){reject(error);}finally{layer.remove();}
 };
 const fallback=()=>{button.hidden=false;button.textContent='影片未能播放 · 繼續';button.onclick=finish;};
 const timer=setTimeout(fallback,15000);video.onplaying=()=>{clearTimeout(timer);button.hidden=true;};video.onended=finish;video.onerror=fallback;
 video.play().catch(()=>{button.hidden=false;button.textContent='點按播放影片';button.onclick=()=>video.play().catch(fallback);});
});}
document.addEventListener('contextmenu',e=>{if(e.target.closest('#stage')&&!e.target.closest('input,textarea,[contenteditable="true"]'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(e.target.closest('#stage')&&!e.target.closest('input,textarea,[contenteditable="true"]'))e.preventDefault()});

const arrivalCache=new Map();let arriving=false;
function preloadPicture(url){if(arrivalCache.has(url))return arrivalCache.get(url);const p=new Promise((resolve,reject)=>{const i=new Image(),timer=setTimeout(()=>reject(Error('timeout')),12000);i.onload=async()=>{try{await i.decode();clearTimeout(timer);resolve(i)}catch(e){clearTimeout(timer);reject(e)}};i.onerror=()=>{clearTimeout(timer);reject(Error('image'))};i.src=url;});arrivalCache.set(url,p);p.catch(()=>arrivalCache.delete(url));return p;}
async function enterAreaLoaded(a,confirmed=false){
 if(arriving)return;
 const travelling=area?.id!==a.id,price=travelling?areaPrice(a):0;
 if(price&&!confirmed){modal('乘船前往 '+a.name,'<p class="intro">本次船費：'+price+'<br>現有金錢：'+wallet().money+'<br>每次前往外區均需付船費，返回長洲免費。</p>',()=>enterAreaLoaded(a,true),'確認出發',true);foot('取消',()=>showRegionAreas(a.category));return;}
 arriving=true;modal('準備前往 '+a.name,'<div class="arrival"><div class="arrivalSpinner"></div><h2>正在準備海岸…</h2></div>');$('closeModal').disabled=true;
 try{
  await preloadPicture(areaArt(a));if(!economyReady())throw Error('save');
  if(price&&!transact({type:'travel',areaId:a.id,amount:price})){economyMessage('金錢不足','沒有扣款，請先到免費釣區釣魚或出售魚獲。',showAreas);return;}
  updateWallet();updateQuickHud();
  if(travelling&&(a.category!=='local'||(area&&area.category!=='local')))await playBoatTrip();
  chooseArea(a);
 }catch{modal('暫時未能載入釣區','<p class="intro">請檢查網絡，然後重試。</p>',()=>enterAreaLoaded(a),'重試',true);foot('返回釣區',showAreas);}
 finally{arriving=false;$('closeModal').disabled=false;}
}
function playBoatTrip(){return new Promise(resolve=>{
 const layer=document.createElement('div');layer.id='boatTrip';
 const video=document.createElement('video');video.playsInline=true;video.muted=true;video.preload='auto';
 video.src=asset('../mp4/'+({morning:'ship-7am.mp4',noon:'ship-1pm.mp4',night:'ship-9pm.mp4'}[RegionGuide.period()]));
 const button=document.createElement('button');button.textContent='載入乘船影片…';button.hidden=true;layer.append(video,button);stage.append(layer);
 let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);video.pause();layer.remove();resolve();};
 const fallback=()=>{button.hidden=false;button.textContent='影片未能播放 · 繼續前往釣區';button.onclick=finish;};
 const timer=setTimeout(fallback,15000);video.onplaying=()=>{clearTimeout(timer);button.hidden=true;};video.onended=finish;video.onerror=fallback;
 video.play().catch(()=>{button.hidden=false;button.textContent='點按播放乘船影片';button.onclick=()=>video.play().catch(fallback);});
});}
document.addEventListener('contextmenu',e=>{if(e.target.closest('#stage')&&!e.target.closest('input,textarea,[contenteditable="true"]'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(e.target.closest('#stage')&&!e.target.closest('input,textarea,[contenteditable="true"]'))e.preventDefault()});

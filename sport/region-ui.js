function showAreas(){
 $('home').hidden=true;
 modal('今天，想去哪裡？','<div class="regionGroups"></div>');
 for(const [key,name,note] of [['local','長洲本地','三個釣點 · 全部免費'],['other','香港其他地區','探索香港 · 一次付費解鎖']]){
  const a=cfg.areas.find(a=>a.category===key),b=document.createElement('button');b.className='regionGroup';b.dataset.region=key;
  if(a)b.style.backgroundImage='linear-gradient(transparent,#031923ee),url("'+areaArt(a)+'")';
  b.innerHTML='<b>'+name+'</b><span>'+note+'</span>';b.onclick=()=>showRegionAreas(key);$('modalBody').firstChild.append(b);
 }
 foot('商舖',openHarbour);foot('主選單',showHome);
}
function showRegionAreas(category='local',page=0){
 const list=cfg.areas.filter(a=>(a.category||'other')===category),pages=Math.max(1,Math.ceil(list.length/3));page=clamp(page,0,pages-1);
 modal(category==='local'?'長洲本地 · 免費釣區':'香港其他地區','<div class="regionPlaces"></div>');
 for(const a of list.slice(page*3,page*3+3)){
  const b=document.createElement('button');b.className='regionPlace';b.dataset.area=a.id;b.style.backgroundImage='linear-gradient(transparent 15%,#041b27f5),url("'+areaArt(a)+'")';
  b.innerHTML='<b>'+esc(a.name)+'</b><span>'+ (areaOwned(a)?'免費進入':'一次解鎖 $'+areaPrice(a))+'</span><small>查看簡介 →</small>';
  b.disabled=!cfg.fish.some(f=>a.fish?.includes(f.id));b.onclick=()=>requestArea(a);$('modalBody').firstChild.append(b);
 }
 foot('返回分類',showAreas);if(pages>1){foot('上一頁',()=>showRegionAreas(category,page-1)).disabled=page===0;foot((page+1)+' / '+pages,()=>{}).disabled=true;foot('下一頁',()=>showRegionAreas(category,page+1)).disabled=page===pages-1;}foot('主選單',showHome);
}
function confirmBaitPurchase(kind){
 if(!economyReady())return;const amount=baitPrice(kind);let done=false;
 modal('確認購買魚餌？','<div class="purchaseSummary"><span>'+esc(baitNames[kind])+' × 1</span><strong>$'+amount+'</strong><p>目前金錢 $'+wallet().money+'</p></div>',()=>{
  if(done)return;done=true;
  if(transact({type:'buy',bait:kind,amount}))showTackle();
  else economyMessage('未能購買','金錢不足或存檔仍在同步，沒有扣款。',showTackle);
 },'是',true);foot('否',showTackle);
}
function showBaitKnowledge(kind='basic',page=0){
 const list=cfg.baitKnowledge?.[kind]||RegionGuide.baitKnowledge[kind],pages=Math.max(1,list.length);page=clamp(page,0,pages-1);const entry=list[page];
 modal('魚餌小知識','<div class="baitKnowledge"><div class="knowledgeTabs"></div><article><small>'+esc(baitNames[kind])+' · '+(page+1)+' / '+pages+'</small><h3>'+esc(entry?.[0]||'未有資料')+'</h3><p>'+esc(entry?.[1]||'')+'</p><aside>生活知識介紹，不影響遊戲的魚種機率。<br>遊戲中每次拋竿消耗一份所選級別魚餌。</aside></article></div>');
 for(const k of ['basic','advanced','master']){const b=document.createElement('button');b.textContent=baitNames[k];b.classList.toggle('active',k===kind);b.onclick=()=>showBaitKnowledge(k);document.querySelector('.knowledgeTabs').append(b);}
 foot('上一款',()=>showBaitKnowledge(kind,page-1)).disabled=page===0;foot('下一款',()=>showBaitKnowledge(kind,page+1)).disabled=page===pages-1;foot('返回釣具店',showTackle,true);
}
// Load before swapping; a late response must not replace a newly selected region.
let sceneryRefreshPending=false;
async function refreshScenery(){
 if(!area||tournament||sceneryRefreshPending)return;
 const chosen=area,url=areaArt(chosen),current=$('background').style.backgroundImage;
 if(current.includes(url))return;
 sceneryRefreshPending=true;
 try{await preloadPicture(url);if(area===chosen&&!tournament&&areaArt(chosen)===url){setScene();stage.dataset.dayPeriod=RegionGuide.period();}}catch{}finally{sceneryRefreshPending=false;}
}
setInterval(refreshScenery,15000);

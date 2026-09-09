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
 if(!economyReady())return;
 const price=baitPrice(kind),balance=wallet().money,max=Math.min(99,price?Math.floor(balance/price):99);let quantity=1,done=false;
 modal('購買'+baitNames[kind],'<div class="baitCheckout"><div class="checkoutInfo"><small>單價 / 每份</small><strong>$'+price+'</strong><p>現有 '+wallet().bait[kind]+' 份</p><span>每次拋竿消耗 1 份</span></div><div class="checkoutOrder"><label for="baitQuantity">購買數量</label><div class="quantityStepper"><button id="baitMinus" aria-label="減少一份">−</button><input id="baitQuantity" type="number" inputmode="numeric" min="1" max="'+max+'" value="1" aria-label="購買數量"><button id="baitPlus" aria-label="增加一份">＋</button></div><div class="quantityPresets"></div><div class="checkoutTotal"><span>合計</span><b id="baitTotal"></b></div><p id="baitRemaining"></p><small id="baitPurchaseHint"></small></div></div>');
 const buy=foot('確認購買',()=>{
  if(done||!Number.isInteger(quantity)||quantity<1||quantity>max)return;
  done=true;buy.disabled=true;
  if(buyBaitBatch(kind,quantity,price)){economyMessage('購買成功','已購入 '+baitNames[kind]+' '+quantity+' 份，共 $'+(price*quantity)+'。餘額 $'+wallet().money+'。',showTackle);}
  else economyMessage('未能購買','金錢不足或存檔仍在同步，沒有扣款。',showTackle);
 },true);foot('取消',showTackle);
 function update(value){quantity=Number(value);const valid=Number.isInteger(quantity)&&quantity>=1&&quantity<=max;
  $('baitQuantity').value=value;$('baitTotal').textContent=valid?'$'+(price*quantity):'—';
  $('baitRemaining').textContent=valid?'目前 $'+balance+' → 購買後 $'+(balance-price*quantity):'請輸入 1–'+max+' 份';
  $('baitPurchaseHint').textContent=max?'最多可買 '+max+' 份（每次上限 99 份）':'金錢不足，請先出售魚獲';
  buy.disabled=!valid||!economyReady();$('baitMinus').disabled=!valid||quantity<=1;$('baitPlus').disabled=!valid||quantity>=max;
 }
 $('baitQuantity').oninput=e=>update(e.target.value);$('baitMinus').onclick=()=>update(quantity-1);$('baitPlus').onclick=()=>update(quantity+1);
 for(const n of [1,5,10]){const b=document.createElement('button');b.textContent=n+' 份';b.disabled=n>max;b.onclick=()=>update(n);document.querySelector('.quantityPresets').append(b);}
 update(1);
}
function buyBaitBatch(kind,quantity,price){
 if(!economyReady()||!Number.isInteger(quantity)||quantity<1||quantity>99||baitPrice(kind)!==price)return false;
 const events=CoastEconomy.mergeEvents(save.economyEvents),seq=events.at(-1)?.seq||0;
 const added=Array.from({length:quantity},(_,i)=>({id:crypto.randomUUID(),seq:seq+i+1,type:'buy',bait:kind,amount:price}));
 const candidate={...save,economyEvents:[...events,...added]},account=CoastEconomy.account(candidate);
 if(!added.every(e=>account.accepted.has(e.id)))return false;
 save.economyEvents=candidate.economyEvents;persist();updateWallet();return true;
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
 try{await preloadPicture(url);if(area===chosen&&!tournament&&areaArt(chosen)===url){setScene();stage.dataset.dayPeriod=scenePeriod();}}catch{}finally{sceneryRefreshPending=false;}
}
setInterval(refreshScenery,15000);

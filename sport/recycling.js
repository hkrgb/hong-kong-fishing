/* Marine objects stay outside the fish ledger, catalogue and tournament score. */
function showLitter(item){
 modal('海洋拾獲物','<div class="litterCatch"><img src="'+esc(bookAsset(item.image))+'" alt="'+esc(item.name)+'"><h3>'+esc(item.name)+'</h3><p>已放入「我的收藏品 → 物件」</p></div>',closeDialog,'繼續釣魚');
 foot('簡介',()=>{modal(item.name,'<div class="litterInfo"><img src="'+esc(bookAsset(item.image))+'" alt=""><p>'+esc(item.description)+'</p></div>',()=>showLitter(item),'返回');});
}
const fishOnlyLand=land;
land=function(){
 // Basic bait occasionally retrieves an object; premium bait keeps its fish guarantees.
 if(state!=='fight'||equippedBait!=='basic'||Math.random()>=.12)return fishOnlyLand();
 const item=MarineLitter[Math.floor(Math.random()*MarineLitter.length)];
 if(!transact({type:'litter',catchId:crypto.randomUUID(),item})){ready('存檔正在同步，請稍後再試。');return;}
 if(selected)selected.species=RegionGuide.weighted(fishList,area);
 cancelCast();enter('landed');playBoatTrip(()=>showLitter(item),'get.mp4').catch(()=>showLitter(item));
};
function showRecycling(page=0){
 const w=wallet(),items=[...w.instances.entries()].filter(([key])=>!key.startsWith('certificate|')),pages=Math.max(1,Math.ceil(items.length/3));page=clamp(page,0,pages-1);
 modal('回收站','<div class="recyclingShop"><p class="recyclingWelcome">讓小物找到新主人，讓海岸少一件垃圾。每個小行動，都值得一顆愛心。</p><div class="recyclingOffers"></div><p class="recyclingNote">明信片、玩具：♥ 5　海洋拾獲物：♥ 2<br>交出後會從物件收藏移除。每次只交出所選的一件，重複物件亦逐件保留。</p></div>');
 if(!items.length)document.querySelector('.recyclingOffers').innerHTML='<p class="recyclingEmpty">目前沒有可回收或轉贈的物件。謝謝你一起愛護海洋。</p>';
 for(const [key,stored] of items.slice(page*3,page*3+3)){
  const item=collectionItem(stored),reward=key.startsWith('litter|')?2:5,row=document.createElement('section');row.className='recyclingOffer';
  row.innerHTML='<img src="'+esc(bookAsset(item.image))+'" alt=""><div><b>'+esc(item.name)+'</b><p>♥ '+reward+'</p></div>';
  const b=document.createElement('button');b.textContent='回收／轉贈';b.onclick=()=>{
   const owner=w.instanceOwners.get(key);
   modal('回收／轉贈這件物件？','<div class="recyclingConfirm"><img src="'+esc(bookAsset(item.image))+'" alt=""><p>'+esc(item.name)+'<br>交出後獲得 ♥ '+reward+'，物件會從收藏移除。</p></div>',()=>{
    const accepted=transact({type:'recycle',key,owner,instance:true});updateQuickHud();
    modal(accepted?'謝謝你的心意':'物件狀態已更新','<p class="intro">'+(accepted?'已獲得 ♥ '+reward+'。<br>目前共有 ♥ '+wallet().hearts+'。<br>讓資源繼續被珍惜，讓海岸保持美麗。':'這件物件已交出或存檔正在同步，沒有重複增加愛心。')+'</p>',()=>showRecycling(page),'返回回收站');
   },'確認回收／轉贈');foot('取消',()=>showRecycling(page));
  };row.append(b);document.querySelector('.recyclingOffers').append(row);
 }
 foot('上一頁',()=>showRecycling(page-1)).disabled=page===0;foot((page+1)+' / '+pages,()=>{}).disabled=true;foot('下一頁',()=>showRecycling(page+1)).disabled=page===pages-1;foot('返回書店',()=>{closeDialog();showBookshop();});
}

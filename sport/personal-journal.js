/* Three-part notebook from 修改-2026-09-13b.pdf. */
function awardRegionStamps(){if(!cfg||!save)return false;const result=CoastStamps.award(cfg,save);if(result.changed)save.regionStamps=result.stamps;return result.changed;}
const journalPersist=persist;
persist=function(){awardRegionStamps();journalPersist();};
const personalModal=modal;
modal=function(...args){personalModal(...args);document.querySelector('.dialog').classList.remove('personalJournal');};
showJournal=function(tab='collection',page=0,view=''){
 if(awardRegionStamps())persist();
 if(!['collection','achievements','settings'].includes(tab))tab='collection';
 const stamps=CoastStamps.merge(save.regionStamps),objects=[...wallet().collection.entries()];
 modal('旅程手帳','<div class="journalSpread"><nav class="personalTabs" aria-label="手帳分類"></nav><section class="personalPage"><div class="personalPageHeading"></div><div id="personalContent"></div><div id="personalPagination"></div></section></div>');
 document.querySelector('.dialog').classList.remove('islandBookDialog');document.querySelector('.dialog').classList.add('personalJournal');
 const groups=[['collection','我的收藏品',save.bag.length+' 尾魚獲 · '+objects.length+' 款物件'],['achievements','我的成就',Object.keys(stamps).length+' 枚地區印章'],['settings','遊戲設定','讓旅程更自在']];
 for(const [key,title,note] of groups){const b=document.createElement('button');b.className='personalTab';b.setAttribute('aria-pressed',String(tab===key));b.innerHTML='<b>'+title+'</b><span>'+note+'</span>';b.onclick=()=>showJournal(key);document.querySelector('.personalTabs').append(b);}
 const exit=document.createElement('button');exit.id='personalExit';exit.textContent='離開遊戲';exit.onclick=()=>{exitJourney();$('modalFooter').lastElementChild.onclick=()=>showJournal(tab,page,view);};document.querySelector('.personalTabs').append(exit);
 const heading=document.querySelector('.personalPageHeading'),body=$('personalContent');
 const setTitle=(title,desc)=>{heading.innerHTML='<h3>'+title+'</h3><p>'+desc+'</p>';};
 const paginate=(count,size)=>{const pages=Math.max(1,Math.ceil(count/size));page=clamp(page,0,pages-1);if(pages>1){const bar=$('personalPagination');for(const [label,delta] of [['上一頁',-1],[(page+1)+' / '+pages,0],['下一頁',1]]){const b=document.createElement('button');b.textContent=label;b.disabled=!delta||page+delta<0||page+delta>=pages;b.onclick=()=>showJournal(tab,page+delta,view);bar.append(b);}}return page*size;};
 if(tab==='collection'&&!view){
  setTitle('我的收藏品','每一尾魚、每一件小物，都是旅途留下的回憶。');
  body.className='personalCollections';body.innerHTML='<button id="personalFish">'+fishMarkup(save.bag[0]||cfg.fish[Math.floor(Math.random()*cfg.fish.length)])+'<b>魚獲</b><small>'+save.bag.length+' 尾旅途紀錄</small><span class="collectionArrow">翻開魚獲手帳 →</span></button><button id="personalObjects"><img src="'+bookAsset('yoyo.png')+'" alt=""><b>物件</b><small>'+objects.length+' 款玩具與明信片</small><span class="collectionArrow">看看我的收藏 →</span></button>';
  $('personalFish').onclick=()=>showJournal('collection',0,'fish');$('personalObjects').onclick=()=>showJournal('collection',0,'objects');
 }else if(tab==='collection'){
  const isFish=view==='fish',items=isFish?save.bag:objects,start=paginate(items.length,6);setTitle(isFish?'魚獲':'物件',isFish?'已出售或放生的魚，也會留在這本手帳。':'書店玩具與完成的明信片，都收藏在這裡。');
  body.className='personalItems';if(!items.length)body.innerHTML='<p class="journalEmpty">'+(isFish?'還未有魚獲，出發釣魚吧。':'還未有物件，到書店轉扭蛋或完成拼圖吧。')+'</p>';
  for(const item of items.slice(start,start+6)){const b=document.createElement('button');b.className='personalItem';if(isFish){const key=CoastEconomy.catchKey(item),w=wallet();b.innerHTML=fishMarkup(item)+'<b>'+esc(item.name)+'</b><small>'+Number(item.weight).toFixed(2)+' kg · '+(w.released.has(key)?'已放生':w.sold.has(key)?'已出售':'釣箱內')+'</small>';b.onclick=()=>showJournalFish(item,page);}else{const [key,v]=item;b.innerHTML='<img src="'+esc(bookAsset(v.image))+'" alt=""><b>'+esc(v.name)+'</b><small>'+(key.startsWith('toy|')?'懷舊玩具':'明信片')+'</small>';b.onclick=()=>{modal(v.name,'<div class="personalObjectPreview"><img src="'+esc(bookAsset(v.image))+'" alt="'+esc(v.name)+'"></div>',()=>showJournal('collection',page,'objects'),'返回物件');};}body.append(b);}
  foot('返回收藏品',()=>showJournal('collection'));
 }else if(tab==='achievements'){
  setTitle('我的成就','集齊一個釣場的圖鑑魚種，蓋下專屬的地區印章。');
  const areas=cfg.areas.slice();for(const s of Object.values(stamps))if(!areas.some(a=>a.id===s.areaId))areas.push({id:s.areaId,name:s.name,fish:[],retired:true});
  const start=paginate(areas.length,4);body.className='personalStamps';
  for(const a of areas.slice(start,start+4)){const s=stamps[a.id],p=CoastStamps.progress(a,cfg.fish,save.bag),percent=p.total?Math.floor(p.caught/p.total*100):0,b=document.createElement('button');b.className='regionStampCard '+(s?'earned':'lockedStamp');b.setAttribute('aria-label',a.name+'：'+(s?'已獲得印章':percent+'%'));const image=a.retired?'':areaArt(a);
   b.innerHTML='<div class="regionStamp" aria-hidden="true">'+(image?'<img src="'+esc(image)+'" alt="">':'')+'<span>'+(s?'100%':'待蓋章')+'</span><small>'+esc(a.name.split('—').at(-1).split('（')[0].trim())+'</small></div><div><b>'+esc(a.name)+'</b><small>'+(s?'已蓋章 · '+new Date(s.earnedAt).toLocaleDateString('zh-HK',{timeZone:'Asia/Hong_Kong'}):p.caught+' / '+p.total+' 種 · '+percent+'%')+'</small><i class="stampProgress"><span style="width:'+(s?100:percent)+'%"></span></i></div>';
   b.onclick=()=>showRegionStamp(a,s,p,page);body.append(b);
  }
 }else{
  setTitle('遊戲設定','放慢腳步，按自己的步調享受旅程。');body.className='personalSettings';
  body.innerHTML='<button id="bookFullscreen"><b>'+(isFullscreen()?'退出全屏幕':'全屏幕')+'</b><span>調整遊戲顯示方式</span></button><button id="personalMusic"><b>背景音樂</b><span></span></button><button id="bookDisclaimer"><b>免責聲明</b><span>遊戲及資料使用說明</span></button><a href="mailto:info@rgb-workshop.com"><b>聯絡我們</b><span>info@rgb-workshop.com</span></a>';
  $('bookFullscreen').onclick=async()=>{await toggleFullscreen();$('bookFullscreen').querySelector('b').textContent=isFullscreen()?'退出全屏幕':'全屏幕';};
  const music=()=>{const on=$('musicToggle')?.getAttribute('aria-pressed')==='true';$('personalMusic').querySelector('span').textContent=on?'播放中 · 按此關閉':'已關閉 · 按此播放';$('personalMusic').setAttribute('aria-pressed',String(on));};music();$('personalMusic').onclick=()=>{$('musicToggle')?.click();music();};$('bookDisclaimer').onclick=()=>{showDisclaimer();$('modalFooter').replaceChildren();foot('返回遊戲設定',()=>showJournal('settings'),true);};
 }
};
function showJournalFish(f,page){const w=wallet(),key=CoastEconomy.catchKey(f);modal('魚獲紀錄','<div class="detail fishShowcase">'+fishPresentation(f)+'</div>',()=>showJournal('collection',page,'fish'),'返回魚獲');if(w.released.has(key)||w.sold.has(key)){const p=document.createElement('p');p.className='catchDisposition';p.textContent=w.released.has(key)?'已放生 · 保留紀錄，不能出售':'已出售 · 保留紀錄';$('modalBody').append(p);}fishNavigation(save.bag,save.bag.indexOf(f),next=>showJournalFish(next,page));}
function showRegionStamp(a,s,p,page){
 const picture=a.retired?'':areaArt(a);modal(a.name+' · 地區印章','<div class="stampDetail '+(s?'earned':'lockedStamp')+'"><div class="regionStamp">'+(picture?'<img src="'+esc(picture)+'" alt="">':'')+'<span>'+(s?'100%':'待蓋章')+'</span><small>'+esc(a.name)+'</small></div><div><h3>'+(s?'這片海，已留下你的印記。':'下一枚印章，等你來蓋。')+'</h3><p>'+(s?'完成此區圖鑑，已獲得專屬地區印章。<br>蓋章日期：'+new Date(s.earnedAt).toLocaleDateString('zh-HK',{timeZone:'Asia/Hong_Kong'}):'已收集 '+p.caught+' / '+p.total+' 種魚。<br>集齊本區圖鑑魚種，即可獲得印章。')+'</p><p>已放生及出售的魚仍計入收集進度。</p></div></div>',()=>showJournal('achievements',page),'返回我的成就');
 if(!a.retired)foot('查看本區圖鑑',()=>{catalogRegion=a.id;showCatalog();foot('返回我的成就',()=>showJournal('achievements',page));});
}

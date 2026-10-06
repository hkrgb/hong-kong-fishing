/* Online stories integrate with the same persistent collection ledger. */
const TheatreStory={id:'star-thrower',game:'拋海星的人-musby6ef',title:'拋海星的人',origin:'https://hkrgb.github.io',url:'https://hkrgb.github.io/island-journey-visual-novel/'};
const theatreAsset=n=>new URL('assets/theatre/'+n,document.baseURI).href;
let theatreSession=null,theatreView=false;
function stopTheatre(){clearTimeout(theatreSession?.timer);clearTimeout(theatreSession?.coverTimer);theatreSession=null;$('theatrePlayer')?.remove();$('theatreShelf')?.remove();stage.classList.remove('theatreMode');theatreView=false;}
const theatreHome=showIslandHub;showIslandHub=function(){stopTheatre();theatreHome();};
const theatreShowHome=showHome;showHome=function(){stopTheatre();theatreShowHome();};
const theatreChoose=chooseArea;chooseArea=function(...args){stopTheatre();theatreChoose(...args);};
const theatreShop=showBookshop;showBookshop=function(){stopTheatre();theatreShop();};
const theatreSetup=setupHome;setupHome=function(){theatreSetup();const button=document.createElement('button');button.id='hubTheatre';button.setAttribute('aria-label','離島旅程小劇場');button.innerHTML='<img alt="離島旅程小劇場" src="'+theatreAsset('story.png')+'">';button.onclick=showTheatre;stage.append(button);};
const theatreHud=updateQuickHud;updateQuickHud=function(){theatreHud();$('hubTheatre')?.toggleAttribute('hidden',!$('islandHub')||$('islandHub').hidden);};
function showTheatre(){
 stopTheatre();cancelCast();held=false;inBookshop=false;islandBrowsing=true;dialogOpen=true;theatreView=true;
 $('bookshopHub')?.remove();$('islandHub').hidden=true;$('home').hidden=true;$('modal').hidden=true;stage.classList.add('islandBrowsing','theatreMode');
 const unlocked=wallet().stories.has(TheatreStory.id),section=document.createElement('section');section.id='theatreShelf';
 section.innerHTML='<div class="theatrePoster"><img src="'+theatreAsset('story-01.jpg')+'" alt="拋海星的人"><button id="theatreLock" aria-label="'+(unlocked?'查看解鎖狀態':'查看解鎖條件')+'">'+(unlocked?'<span>✓ 已解鎖</span>':'<img alt="未解鎖" src="'+theatreAsset('lock.png')+'">')+'</button></div><button id="theatrePlay" aria-label="播放拋海星的人"><img alt="PLAY" src="'+theatreAsset('play-bu.png')+'"></button><p class="theatreNetwork">小劇場需連線觀看 · 1 / 1</p>';
 stage.append(section);$('theatreLock').onclick=showTheatreUnlock;$('theatrePlay').onclick=()=>wallet().stories.has(TheatreStory.id)?playTheatre():showTheatreUnlock();updateQuickHud();
}
function availableTheatreFish(){const w=wallet();return save.bag.filter(f=>f.id==='siganus-canaliculatus'&&!w.sold.has(CoastEconomy.catchKey(f))&&!w.released.has(CoastEconomy.catchKey(f))&&!w.offered.has(CoastEconomy.catchKey(f)));}
function showTheatreUnlock(){
 const w=wallet(),fish=availableTheatreFish();
 if(w.stories.has(TheatreStory.id)){modal('已永久解鎖','<p class="intro">可不限次數連線觀看，不需再次扣除魚或愛心。</p>',showTheatre,'返回小劇場');return;}
 modal('選擇解鎖方式','<p class="intro">請選擇交出一條白點泥鯭，或扣除 10 個愛心。確認後才會扣除，解鎖後可不限次數連線觀看。</p><p class="intro">釣箱內白點泥鯭：'+fish.length+' 條　·　愛心：'+w.hearts+'</p>',showTheatre,'取消');
 foot('交出 1 條白點泥鯭',()=>confirmTheatreUnlock('fish',CoastEconomy.catchKey(fish[0]))).disabled=!fish.length;
 foot('扣除 10 個愛心',()=>confirmTheatreUnlock('hearts')).disabled=w.hearts<10;
}
function confirmTheatreUnlock(payment,catchKey){
 const description=payment==='fish'?'交出 1 條白點泥鯭（保留魚獲紀錄，不能再出售或放生）':'扣除 10 個愛心';
 modal('確認解鎖《拋海星的人》','<p class="intro">'+description+'，永久解鎖這套小劇場？</p>',showTheatreUnlock,'返回選擇');
 foot('確認扣除並播放',()=>{
  if(wallet().stories.has(TheatreStory.id)){showTheatre();playTheatre();return;}
  if(transact({type:'story-unlock-paid',story:TheatreStory.id,payment,catchKey})){showTheatre();playTheatre();}
  else modal('未能解鎖','<p class="intro">魚或愛心不足，或存檔尚未準備好。沒有扣除，請重新選擇。</p>',showTheatreUnlock,'重新選擇');
 },true);
}

function playTheatre(){
 if(!wallet().stories.has(TheatreStory.id))return showTheatreUnlock();
 if(!navigator.onLine){modal('需要網絡連線','<p class="intro">小劇場會載入最新故事，請連線後再試。已解鎖資格會保留。</p>',showTheatre,'返回小劇場');return;}
 $('modal').hidden=true;$('theatreShelf')?.remove();
 const token=crypto.randomUUID(),url=new URL(TheatreStory.url);url.searchParams.set('game',TheatreStory.game);url.searchParams.set('fishing','1');url.searchParams.set('parentOrigin',location.origin);url.searchParams.set('session',token);
 const layer=document.createElement('section');layer.id='theatrePlayer';layer.innerHTML='<iframe title="拋海星的人線上小劇場" allow="autoplay; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="theatreLoading"><p>正在連線載入小劇場…</p><button id="cancelTheatre">返回小劇場</button></div>';stage.append(layer);
 const frame=layer.querySelector('iframe');theatreSession={token,frame,ready:false};$('cancelTheatre').onclick=showTheatre;
 const cover=document.createElement('div');cover.className='theatreCover';cover.innerHTML='<img alt="拋海星的人故事封面" src="'+theatreAsset('story-01.jpg')+'">';layer.append(cover);
 const begin=()=>{if(theatreSession?.token!==token)return;theatreSession.coverTimer=setTimeout(()=>{if(theatreSession?.token!==token)return;cover.remove();loadStory();},3000);};cover.querySelector('img').decode().then(begin,begin);
 function loadStory(){
 theatreSession.timer=setTimeout(()=>{if(theatreSession?.token===token&&!theatreSession.ready){layer.querySelector('.theatreLoading p').textContent='暫時未能載入，請檢查網絡後返回重試。';}},45000);frame.src=url.href;
 }
}
addEventListener('message',event=>{
 const s=theatreSession,d=event.data;if(!s||event.source!==s.frame.contentWindow||event.origin!==TheatreStory.origin||!d||d.channel!=='island-theatre'||d.game!==TheatreStory.game||d.session!==s.token)return;
 if(d.type==='ready'){s.ready=true;clearTimeout(s.timer);$('theatrePlayer')?.querySelector('.theatreLoading')?.remove();}
 if(d.type==='error'){clearTimeout(s.timer);const p=$('theatrePlayer')?.querySelector('.theatreLoading p');if(p)p.textContent='未能載入最新故事，請返回重試。';}
 if(d.type==='complete'&&s.ready)finishTheatreCollection();
});
const theatreClose=closeDialog;closeDialog=function(){if(theatreView){$('modal').hidden=true;if(!$('theatrePlayer'))showTheatre();return;}theatreClose();};

function finishTheatreCollection(){
 const already=wallet().storyRewards.has(TheatreStory.id);
 if(!already&&!transact({type:'story-complete',story:TheatreStory.id})){
  modal('暫時未能保存獎勵','<p class="intro">請稍後再試，物件尚未入庫。</p>',finishTheatreCollection,'重試');return;
 }
 showTheatre();
 const pictures=StorySouvenirs.map(item=>'<figure><img src="'+esc(bookAsset(item.image))+'" alt="'+esc(item.name)+'"><figcaption>'+esc(item.name)+'</figcaption></figure>').join('');
 modal(already?'再次完成《拋海星的人》':'獲得小劇場特別物件','<div class="theatreRewards">'+pictures+'</div><p class="intro">'+(already?'這兩件特別物件已在你的收藏中。':'已加入「我的收藏品 → 物件」。')+'卡片盒及泥鯭粥為劇場專屬，不會在扭蛋出現。</p>',showTheatre,'返回小劇場');
 foot('查看物件',()=>showJournal('collection',0,'objects'));
}

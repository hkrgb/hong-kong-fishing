let equippedBait='basic',castSpecies=null;
const baitNames={basic:'基本魚餌',advanced:'高級魚餌',master:'最高級魚餌'};
const shopAsset=n=>new URL('assets/economy/'+n+'.webp',document.baseURI).href;
const wallet=()=>CoastEconomy.account(save);
const moneyValue=(v,fallback)=>Number.isFinite(+v)&&v!==null&&v!==''?clamp(Math.round(+v),0,10000000):fallback;
function baitPrice(kind){return moneyValue(cfg.economy?.[kind+'Price'],{basic:10,advanced:60,master:150}[kind]);}
function areaPrice(a){const i=cfg.areas.findIndex(v=>v.id===a.id);return i===0?0:moneyValue(a.unlockPrice,[0,200,400,800][i]??800);}
function areaOwned(a){return areaPrice(a)===0||wallet().areas.has(a.id);}
function economyReady(){return !cloudLoading&&(!embedded||hostReady);}
function transact(event){
 if(!economyReady())return false;
 const events=CoastEconomy.mergeEvents(save.economyEvents),id=crypto.randomUUID();
 const next={...event,id,seq:(events.at(-1)?.seq||0)+1};
 const candidate={...save,economyEvents:[...events,next]};
 if(!CoastEconomy.account(candidate).accepted.has(id))return false;
 save.economyEvents=candidate.economyEvents;persist();return true;
}
function updateWallet(){if(!$('walletButton'))return;const w=wallet();$('walletButton').textContent='金錢 $'+w.money+' · '+baitNames[equippedBait]+' ×'+w.bait[equippedBait];}
function returnFromShop(){if(area&&$('home').hidden)closeDialog();else showHome();}
function economyMessage(title,text,back){modal(title,'<p class="intro">'+esc(text)+'</p>',back,'知道了',true);}
function openHarbour(){if(!economyReady())return;const w=wallet();$('home').hidden=true;modal('海港商街 · $'+w.money,'<div class="harbourGrid"><button id="visitTackle" class="harbourCard" style="background-image:url('+shopAsset('tackle-shop')+')"><b>釣具店</b><span>購買、選用魚餌</span></button><button id="visitMarket" class="harbourCard" style="background-image:url('+shopAsset('fish-market')+')"><b>海鮮檔</b><span>出售魚獲賺取金錢</span></button></div>',returnFromShop,'返回');$('visitTackle').onclick=showTackle;$('visitMarket').onclick=()=>showMarket();}
function showTackle(){
 const w=wallet();modal('海港釣具店 · $'+w.money,'<div class="tackleShop" style="background-image:linear-gradient(#071d2966,#071d29aa),url('+shopAsset('bait-kit')+')"><div class="shopOffers"></div><p class="baitNote">每次拋竿用 1 份魚餌，空手或斷線亦會消耗。</p></div>');
 for(const kind of ['basic','advanced','master']){const row=document.createElement('section');row.className='baitOffer';const desc={basic:'可釣到本區任何魚種',advanced:'60% 選未釣過魚種；40% 選已釣過',master:'100% 選本區未釣過魚種'}[kind];row.innerHTML='<b>'+baitNames[kind]+' · $'+baitPrice(kind)+'</b><p>'+desc+'<br>持有 '+w.bait[kind]+' 份</p>';
 const buy=document.createElement('button');buy.textContent='購買 1 份';buy.disabled=w.money<baitPrice(kind);buy.onclick=()=>{if(transact({type:'buy',bait:kind,amount:baitPrice(kind)}))showTackle();};
 const equip=document.createElement('button');equip.textContent=equippedBait===kind?'使用中':'選用';equip.disabled=!w.bait[kind];equip.onclick=()=>{equippedBait=kind;updateWallet();showTackle();};row.append(buy,equip);document.querySelector('.shopOffers').append(row);}
 foot('商街',openHarbour);foot('返回釣魚',returnFromShop,true);
 if(w.money<baitPrice('basic')&&Object.values(w.bait).every(n=>n===0))foot('領取 3 份救急基本餌',()=>{transact({type:'relief',limit:baitPrice('basic')});showTackle();});
}
function salePrice(f){const current=cfg.fish.find(v=>v.id===f.id);return Math.max(10,Math.round((+f.weight||0)*moneyValue(current?.sellPerKg,moneyValue(cfg.economy?.sellPerKg,50))));}
function showMarket(page=0){
 const w=wallet(),fish=save.bag.filter(f=>!w.sold.has(CoastEconomy.catchKey(f))),pages=Math.max(1,Math.ceil(fish.length/3));page=clamp(page,0,pages-1);
 modal('海鮮檔 · $'+w.money,'<div class="shopScene" style="background-image:url('+shopAsset('fish-market')+')"><div class="shopDisplay"><img src="'+shopAsset('market-scale')+'" alt="海鮮磅與魚獲竹籃"><p>只用遊戲金錢交易。出售後仍保留魚庫、紀錄及獎章。</p></div><div class="marketOffers">'+(fish.length?'':'<p>暫時沒有可出售魚獲。先去免費釣區試試！</p>')+'</div></div>');
 for(const f of fish.slice(page*3,page*3+3)){const row=document.createElement('section');row.className='saleOffer';row.innerHTML=fishMarkup(f)+'<div><b>'+esc(f.name)+'</b><p>'+Number(f.weight).toFixed(2)+' kg · $'+salePrice(f)+'</p></div>';const b=document.createElement('button');b.textContent='出售';b.onclick=()=>confirmSale(f,page);row.append(b);document.querySelector('.marketOffers').append(row);}
 foot('上一頁',()=>showMarket(page-1)).disabled=page===0;foot((page+1)+' / '+pages,()=>{}).disabled=true;foot('下一頁',()=>showMarket(page+1)).disabled=page===pages-1;foot('商街',openHarbour);foot('返回',returnFromShop);
}
function confirmSale(f,page){const amount=salePrice(f);modal('確認出售？','<div class="saleConfirm">'+fishMarkup(f)+'<p>'+esc(f.name)+' · '+Number(f.weight).toFixed(2)+' kg<br>獲得 $'+amount+'<br>魚庫解鎖及魚獲紀錄會保留。</p></div>',()=>{transact({type:'sell',catchKey:CoastEconomy.catchKey(f),amount});showMarket(page);},'確認出售');foot('取消',()=>showMarket(page));}
function requestArea(a){if(areaOwned(a)){showAreaIntro(a);return;}const price=areaPrice(a);modal('解鎖 '+a.name,'<p class="intro">一次支付 $'+price+'，之後可免費返回。<br>目前金錢：$'+wallet().money+'</p>',()=>{if(transact({type:'unlock',areaId:a.id,amount:price}))showAreaIntro(a);else economyMessage('金錢不足','可以在免費釣區釣魚，再到海鮮檔出售。',()=>showAreas());},'支付並解鎖',true);foot('取消',()=>showAreas());}
function canBaitCast(){const w=wallet();if(!economyReady())return false;if(!w.bait[equippedBait]){showTackle();return false;}if(equippedBait!=='basic'&&fishList.every(hasCaught)){economyMessage('本區魚種已全部收集','未有未釣過魚種，高級魚餌不會被消耗。請換基本魚餌或其他釣區。',showTackle);return false;}return true;}
function useCastBait(){if(!canBaitCast())return false;const pool=CoastEconomy.pool(fishList,new Set(save.bag.map(f=>f.id)),equippedBait,Math.random());if(!pool.length||!transact({type:'use',bait:equippedBait}))return false;castSpecies=equippedBait==='basic'?null:pool[Math.floor(Math.random()*pool.length)];return true;}
function attractedFish(){const close=(a,b)=>Math.hypot(a.x-target.x,a.y-target.y)<Math.hypot(b.x-target.x,b.y-target.y)?a:b;const matching=castSpecies?school.filter(f=>f.species.id===castSpecies.id):school;const f=(matching.length?matching:school).reduce(close);if(castSpecies)f.species=castSpecies;return f;}
function setupEconomy(){const b=document.createElement('button');b.id='walletButton';b.onclick=openHarbour;document.querySelector('nav').append(b);updateWallet();setupQuickHud();
 const entry=document.createElement('section');entry.id='entryFullscreen';entry.innerHTML='<div><small>COASTLINE</small><h2>以橫向 16:9 開始旅程</h2><p>全屏幕置中顯示，多餘位置保留黑邊。</p><button id="enterFullscreen">全屏幕</button><button id="skipFullscreen">繼續視窗模式</button><p id="entryFullscreenStatus" role="status"></p></div>';stage.append(entry);
 const rotate=document.createElement('section');rotate.id='entryRotate';rotate.setAttribute('role','status');rotate.innerHTML='<div><span aria-hidden="true">↻</span><h2>請先將手機轉為橫向</h2><p>轉成橫向後，再按「全屏幕」開始遊戲。</p></div>';document.body.append(rotate);
 const portrait=()=>matchMedia('(pointer: coarse)').matches&&innerHeight>innerWidth;
 const updateEntry=()=>{const blocked=portrait();rotate.hidden=!blocked;$('enterFullscreen').disabled=blocked;$('entryFullscreenStatus').textContent=blocked?'請先將手機轉為橫向，再按全屏幕。':'';};
 const dismissEntry=()=>{removeEventListener('resize',updateEntry);visualViewport?.removeEventListener('resize',updateEntry);rotate.remove();entry.remove();};
 addEventListener('resize',updateEntry);visualViewport?.addEventListener('resize',updateEntry);updateEntry();
 $('skipFullscreen').onclick=dismissEntry;$('enterFullscreen').onclick=async()=>{if(portrait()){updateEntry();return;}await toggleFullscreen();if(isFullscreen())dismissEntry();else $('entryFullscreenStatus').textContent='瀏覽器未能開啟全屏幕，可繼續使用視窗模式。';};
}

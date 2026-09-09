function setupQuickHud(){
 document.title=cfg.texts?.title||'香港專業釣魚';document.querySelector('.brand h1').textContent=document.title;
 const bar=document.createElement('div');bar.id='quickHud';bar.innerHTML='<span id="hudMoney" aria-label="金錢"></span><button id="hudBait" aria-label="選擇魚餌"></button><button id="hudFish" aria-label="魚類圖鑑">🐟 圖鑑</button><button id="hudPeriods" aria-label="選擇早午晚背景"><span data-period="morning">🌅 早</span><span data-period="noon">☀ 午</span><span data-period="night">☾ 晚</span></button><span id="hudClock"></span><button id="hudTemperature" aria-label="氣溫資料"></button>';document.querySelector('#stage>header').insertBefore(bar,document.querySelector('.conditions'));
 $('hudPeriods').onclick=showPeriodPicker;$('hudBait').onclick=showBaitPicker;$('hudFish').onclick=()=>showCatalog();$('hudTemperature').onclick=()=>$('weatherInfo').click();updateQuickHud();setInterval(updateQuickHud,1000);
}
function updateQuickHud(){if(!$('quickHud'))return;document.querySelectorAll('#hudPeriods span').forEach(s=>s.classList.toggle('active',s.dataset.period===scenePeriod()));const w=wallet();$('hudMoney').textContent='🪙 $'+w.money;$('hudBait').textContent='🪱 '+baitNames[equippedBait].replace('魚餌','餌')+' ×'+w.bait[equippedBait];$('hudClock').textContent=new Date().toLocaleTimeString('zh-HK',{timeZone:'Asia/Hong_Kong',hour:'2-digit',minute:'2-digit',hour12:false});$('hudTemperature').textContent='🌡 '+(liveConditions?.air?liveConditions.air.value+'°C':'暫無氣溫');}
function showBaitPicker(){modal('選擇魚餌','<div class="baitChoices"></div>');for(const kind of ['basic','advanced','master']){const b=document.createElement('button');b.className='baitChoice';const qty=wallet().bait[kind];b.innerHTML='<b>'+baitNames[kind]+'</b><span>持有 '+qty+' 份</span><small>'+({basic:'本區任何魚種',advanced:'60% 未釣過魚種',master:'100% 未釣過魚種'}[kind])+'</small>';b.disabled=!qty;b.setAttribute('aria-pressed',String(equippedBait===kind));b.onclick=()=>{equippedBait=kind;updateWallet();updateQuickHud();closeDialog();};document.querySelector('.baitChoices').append(b);}foot('購買魚餌',showTackle);foot('取消',closeDialog);}
let backgroundPeriodOverride=null;
function scenePeriod(){return backgroundPeriodOverride||RegionGuide.period();}
function showPeriodPicker(){
 let selected=backgroundPeriodOverride||'auto';
 modal('想切換海岸背景嗎？','<div class="periodPicker"><p>只改變背景，不會更改實際時間及魚種機率。</p><div id="periodChoices"></div><p id="periodStatus">選擇時段，再按確認。</p></div>');
 const confirm=foot('確認切換',async()=>{
  confirm.disabled=true;$('periodStatus').textContent='正在載入背景…';
  const previous=backgroundPeriodOverride;backgroundPeriodOverride=selected==='auto'?null:selected;
  try{if(area)await preloadPicture(areaArt(area));setScene();updateQuickHud();closeDialog();}
  catch{backgroundPeriodOverride=previous;$('periodStatus').textContent='背景載入失敗，請重試。';confirm.disabled=false;}
 },true);foot('取消',closeDialog);
 for(const [key,label] of [['morning','🌅 早晨'],['noon','☀ 午間'],['night','☾ 晚上'],['auto','◷ 跟隨香港時間']]){
  const b=document.createElement('button');b.textContent=label;b.dataset.period=key;b.setAttribute('aria-pressed',String(key===selected));b.onclick=()=>{selected=key;document.querySelectorAll('#periodChoices button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));};$('periodChoices').append(b);
 }
}
document.addEventListener('selectstart',e=>{if(e.target.closest?.('#stage')&&!e.target.closest('input,textarea,[contenteditable="true"]'))e.preventDefault();});
document.addEventListener('dragstart',e=>{if(e.target.closest?.('#stage'))e.preventDefault();});

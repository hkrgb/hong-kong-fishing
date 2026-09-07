let liveConditions=null;
function observationTime(value){const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleString('zh-HK',{timeZone:'Asia/Hong_Kong',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}):'未提供';}
function renderConditions(){
  if(!area)return;
  liveConditions=CoastWeather.snapshot(area);
  const s=liveConditions;
  $('weather').textContent=(s.live?'香港天氣：'+s.name:'天氣連線暫不可用')+' · 氣溫 '+(s.air?s.air.value+'°C（'+s.air.place+'）':'暫無資料');
  $('waterTemperature').textContent=s.sea?'水溫 '+s.sea.value+'°C · '+s.sea.place+' '+observationTime(s.seaTime):'水溫：暫無近期觀測';
  $('weatherInfo').textContent='天文台資料 / 詳情 · '+tide.name+'（潮汐模擬）';
  $('weatherInfo').onclick=showWeatherInfo;
}
async function refreshConditions(force=false){renderConditions();await CoastWeather.refresh(force);renderConditions();}
function showWeatherInfo(){
  const s=CoastWeather.snapshot(area);
  modal('天氣與海水觀測',`<div class="weatherFacts"><section><h3>氣溫 · ${esc(s.air?.place||s.station)}</h3><p>${s.air?esc(s.air.value)+' °C':'暫無兩小時內的有效資料'}</p><p>觀測：${esc(observationTime(s.airTime))} HKT</p><p>香港天氣：${esc(s.name)}</p></section><section><h3>海水溫度 · ${esc(s.sea?.place||'北角')}</h3><p>${s.sea?esc(s.sea.value)+' °C':'暫無 48 小時內的有效資料'}</p><p>觀測：${esc(observationTime(s.seaTime))} HKT</p><p>這是測站最新海面水溫，並非本釣區即時水溫。</p></section></div><p class="weatherDisclaimer">資料來源：<a href="https://www.hko.gov.hk/tc/abouthko/opendata_intro.htm" target="_blank" rel="noopener noreferrer">香港天文台開放數據</a>。約每十分鐘更新；過期或斷線會標示不可用，不會編造數值。雨、雲及夜色依香港天氣作藝術化呈現，並非釣點實景；潮汐、魚訊與比賽難度仍為遊戲模擬。不可作出海或安全決策依據。</p>`,closeDialog,'返回釣魚');
  const b=foot('更新資料',async()=>{b.disabled=true;await refreshConditions(true);if(!$('modal').hidden&&$('modalTitle').textContent==='天氣與海水觀測')showWeatherInfo();});
}
setInterval(()=>{if(typeof area!=='undefined'&&area&&!document.hidden)refreshConditions();},600000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&typeof area!=='undefined'&&area)refreshConditions();});

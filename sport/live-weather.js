/* HKO observations only. No API keys, geolocation, player IDs or save writes. */
window.CoastWeather = (() => {
  const endpoint = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php';
  const stations = {'cheung-chau':'長洲',lantau:'赤鱲角',ninepins:'西貢','po-toi':'赤柱'};
  const names = {50:'天晴',51:'間有陽光',52:'短暫陽光',53:'陽光及驟雨',54:'陽光及驟雨',60:'多雲',61:'密雲',62:'微雨',63:'有雨',64:'大雨',65:'雷雨',76:'晚間多雲',77:'晚間大致天晴',80:'大風',81:'乾燥',82:'潮濕',83:'霧',84:'薄霧',85:'煙霞',90:'炎熱',91:'溫暖',92:'清涼',93:'寒冷'};
  let data={}, lastAttempt=0, pending=null;
  const fresh=(stamp,hours)=>{const age=Date.now()-Date.parse(stamp);return Number.isFinite(age)&&age>=-600000&&age<hours*3600000};
  const temperature=v=>typeof v==='number'&&Number.isFinite(v)&&v>=-10&&v<=50;
  try {const cached=JSON.parse(sessionStorage.getItem('coast-hko-v1'));if(cached&&typeof cached==='object')data=cached;} catch {}
  async function refresh(force=false){
    if(pending)return pending;
    if(!force&&Date.now()-lastAttempt<600000)return data;
    lastAttempt=Date.now();
    pending=(async()=>{
      await Promise.all(['rhrread','fnd'].map(async type=>{try{
        const response=await fetch(endpoint+'?dataType='+type+'&lang=tc',{signal:AbortSignal.timeout(7000),credentials:'omit'});
        if(!response.ok)throw Error('weather');const json=await response.json();
        if(type==='rhrread'&&!Array.isArray(json.temperature?.data))throw Error('invalid observations');
        if(type==='fnd'&&!json.seaTemp)throw Error('no sea observation');
        data[type]=json;
      }catch{/* Retain last observation with its timestamp; never invent a temperature. */}}));
      try{sessionStorage.setItem('coast-hko-v1',JSON.stringify(data));}catch{}
      return data;
    })().finally(()=>{pending=null});return pending;
  }
  function snapshot(area){
    const current=data.rhrread, sea=data.fnd?.seaTemp;
    const preferred=stations[area?.id]||'香港天文台';
    const readings=Array.isArray(current?.temperature?.data)?current.temperature.data:[];
    const air=readings.find(v=>v?.place===preferred)||readings.find(v=>v?.place==='香港天文台');
    const airTime=current?.temperature?.recordTime;
    const airOK=air?.unit==='C'&&temperature(air.value)&&fresh(airTime,2);
    const seaOK=sea?.unit==='C'&&temperature(sea.value)&&fresh(sea.recordTime,48);
    const code=Number(current?.icon?.[0]), iconOK=fresh(current?.iconUpdateTime||current?.updateTime,18)&&fresh(current?.updateTime,2);
    return {air:airOK?air:null,airTime,sea:seaOK?sea:null,seaTime:sea?.recordTime,
      live:!!iconOK,name:iconOK?(names[code]||(code>=70&&code<=75?'晚間天晴':'香港天氣')):'天氣資料暫不可用',
      rain:iconOK&&[53,54,62,63,64,65].includes(code),cloud:iconOK&&[60,61,62,63,64,65,76].includes(code),
      night:iconOK&&code>=70&&code<=77,wind:iconOK&&code===80,
      updated:current?.updateTime,station:preferred};
  }
  return {refresh,snapshot,fresh};
})();

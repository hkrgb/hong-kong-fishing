/* Offline pack is opt-in: show actual completion, keep partial downloads resumable. */
(()=>{
 let registration,info={ready:false,done:0,total:0,bytes:0},failure='';
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../offline-ui.css',document.baseURI);document.head.append(css);
 const status=()=>registration?.active?.postMessage({type:'OFFLINE_STATUS'});
 function label(){return info.ready?'已準備好 · 可離線遊玩':info.downloading?'下載中 '+Math.floor(info.done/info.total*100)+'%':'下載離線遊戲';}
 function render(){
  const button=document.getElementById('offlineGame');if(button)button.textContent=label();
  const panel=document.getElementById('offlinePack');if(!panel)return;
  panel.querySelector('progress').max=info.total||1;panel.querySelector('progress').value=info.done||0;
  panel.querySelector('[role=status]').textContent=failure||info.error||(info.ready?'釣魚、各區風景、乘船影片、收藏、書店及小遊戲已儲存在此裝置。':info.downloading?'正在下載 '+info.done+' / '+info.total+' 項，請保持此頁開啟。':'首次下載約 '+(info.bytes?Math.ceil(info.bytes/1048576):'…')+' MB，建議使用 Wi-Fi。');
  const start=panel.querySelector('[data-download]');start.disabled=!registration?.active||info.downloading||info.ready||!navigator.onLine;start.textContent=info.ready?'已完成':info.downloading?'下載中…':info.done?'繼續下載':'開始下載';
 }
 function open(){
  if(document.getElementById('offlinePack'))return;
  const panel=document.createElement('section');panel.id='offlinePack';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','離線遊戲');
  panel.innerHTML='<div><h2>把旅程帶到離線</h2><p>下載完成後，沒有網絡也能繼續遊玩及保存進度。</p><progress></progress><p role="status"></p><p>Google 登入、雲端同步、即時天氣與 YouTube 影片需要網絡。請保留此網站的儲存資料。</p><button data-download>開始下載</button><button data-close>返回遊戲</button></div>';
  document.body.append(panel);panel.querySelector('[data-close]').onclick=()=>panel.remove();
  panel.querySelector('[data-download]').onclick=()=>{failure='';navigator.storage?.persist?.().catch(()=>{});registration?.active?.postMessage({type:'OFFLINE_DOWNLOAD'});info.downloading=true;render();};status();render();
 }
 window.OfflineGame={open,status};
 function attach(){const home=document.querySelector('.homeCenter');if(!home)return false;if(!document.getElementById('offlineGame')){const b=document.createElement('button');b.id='offlineGame';b.onclick=open;home.append(b);}render();return true;}
 const observer=new MutationObserver(()=>{if(attach())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});attach();
 if(!('serviceWorker' in navigator)||!window.isSecureContext){failure='此瀏覽器不支援離線儲存。';return;}
 navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='ISLAND_OFFLINE'){info=e.data;render();}});
 addEventListener('online',()=>{failure='';status();render();});addEventListener('offline',()=>{failure=info.ready?'已離線 · 遊戲進度會保存在本機。':'尚未完成下載；部分內容可能無法離線開啟。';render();});
 addEventListener('load',async()=>{try{registration=await navigator.serviceWorker.register(new URL('../service-worker.js',document.baseURI));await navigator.serviceWorker.ready;status();render();if(registration.waiting){failure='離線內容有更新，請關閉所有遊戲分頁後重新開啟，再下載新內容。';render();}}catch{failure='離線儲存未能啟用，請連線後重新開啟遊戲。';render();}});
})();

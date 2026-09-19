/* The installed app ships every game asset; browser edition keeps its download UI. */
globalThis.ISLAND_NATIVE = location.hostname === 'appassets.androidplatform.net';
if (ISLAND_NATIVE) {
 function nativeHome(){
  const home=document.querySelector('.homeCenter');if(!home)return;
  const login=document.getElementById('googleLogin');
  if(login){login.textContent='開啟網頁版／Google 雲端存檔';login.onclick=()=>{location.href='https://hkrgb.github.io/hong-kong-fishing/';};}
  const backup=document.getElementById('exportSave');if(backup)backup.onclick=()=>{location.href='island-save://export';};
  if(!document.getElementById('nativeImport')){
   const button=document.createElement('button');button.id='nativeImport';button.textContent='匯入舊版存檔';button.onclick=()=>{location.href='island-save://import';};home.append(button);
   const note=document.createElement('p');note.textContent='1.1.0 · 遊戲內容已內置，可直接離線遊玩。進度儲存在此手機；網頁版／Google 存檔可下載備份後匯入。';home.append(note);
  }
  document.getElementById('entryOrientation')?.remove();
  document.getElementById('skipFullscreen')?.click();
 }
 const nativeObserver=new MutationObserver(()=>{if(document.querySelector('.homeCenter')){nativeObserver.disconnect();nativeHome();}});
 nativeObserver.observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('load',nativeHome);
}

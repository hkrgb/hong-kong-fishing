import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getFirestore,doc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {mergeSaves,emptySave} from './save-merge.js?v=20260909-economy';
const config={projectId:'yes-card-gacha-rgb',appId:'1:496431023991:web:b62a7768104553c9958372',apiKey:'AIzaSyB8f7LK3UR-l2UgV_6qYPgAfDNfV4YlYrM',authDomain:'yes-card-gacha-rgb.firebaseapp.com'};
export function createCloud(hooks){
 const app=initializeApp(config,'coastline-player'),auth=getAuth(app),db=getFirestore(app);
 let user=null,epoch=0,timer=null,busy=false,again=false,localOk=true;
 const key=uid=>'coastline-account-v1:'+uid;
 const local=uid=>{try{return JSON.parse(localStorage.getItem(key(uid))||'null')||emptySave()}catch{return emptySave()}};
 function cache(){if(user)try{localStorage.setItem(key(user.uid),JSON.stringify(hooks.read()));localOk=true}catch{localOk=false}return localOk}
 async function sync(){
  clearTimeout(timer);if(!user)return false;if(busy){again=true;return false}
  busy=true;const who=user,version=epoch,snapshot=hooks.read();hooks.status('正在同步…',user);
  try{
   const ref=doc(db,'fishingPlayers',who.uid,'saves','coastline');
   const merged=await runTransaction(db,async tx=>{
    const remote=await tx.get(ref),prior=remote.exists()?JSON.parse(remote.data().payload):emptySave();
    const result=mergeSaves(prior,snapshot),payload=JSON.stringify(result);
    if(new TextEncoder().encode(payload).length>850000)throw Error('存檔較大，請先匯出備份，再聯絡管理員');
    tx.set(ref,{version:1,payload,updatedAt:serverTimestamp()});return result;
   });
   if(epoch!==version)return false;
   const current=hooks.read(),combined=mergeSaves(merged,current);
   hooks.replace(combined);cache();
   if(JSON.stringify(current)!==JSON.stringify(snapshot))again=true;
   hooks.status('已同步至 Google 帳戶',user);return true;
  }catch(e){if(epoch===version)hooks.status('尚未同步：'+(e.code==='permission-denied'?'雲端權限未就緒':e.message||'請檢查網絡')+(localOk?'。本機備份仍保留。':'。本機亦無法備份，請立即下載存檔。'),user);return false}
  finally{busy=false;if(again){again=false;timer=setTimeout(sync,600)}}
 }
 onAuthStateChanged(auth,async next=>{
  epoch++;user=next;clearTimeout(timer);again=false;
  if(!user){hooks.guest();hooks.status('訪客模式 · 只儲存在此瀏覽器',null);return}
  hooks.replace(local(user.uid));hooks.status('正在讀取 Google 存檔…',user);
  await sync();
 });
 const api={
  login:async()=>{try{await signInWithPopup(auth,new GoogleAuthProvider())}catch(e){hooks.status(e.code==='auth/popup-blocked'?'登入視窗被阻擋，請允許彈出視窗後再試。':'未完成 Google 登入，現有存檔沒有刪除。',user)}},
  logout:async()=>{if(user)cache();await signOut(auth)},
  changed:()=>{if(!user)return;cache();hooks.status(localOk?'已本機備份 · 等待雲端同步':'本機備份失敗 · 正在嘗試雲端同步',user);clearTimeout(timer);timer=setTimeout(sync,500)},
  sync, get user(){return user},
  importGuest:()=>{if(!user)return;hooks.replace(mergeSaves(hooks.read(),hooks.readGuest()));api.changed()}
 };
 addEventListener('online',()=>{if(user)sync()});
 return api;
}

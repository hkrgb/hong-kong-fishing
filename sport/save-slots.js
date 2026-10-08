/* Manual snapshots stay separate from the live autosave, scoped to each local account. */
const manualSlotPrefix='coastline-manual-slots-v1:';
function manualSlotKey(){return manualSlotPrefix+(cloud?.user?.uid||'guest');}
function readManualSlots(){
 const raw=localStorage.getItem(manualSlotKey());
 if(!raw)return [null,null,null];
 const data=JSON.parse(raw);
 if(data.version!==1||!Array.isArray(data.slots)||data.slots.length!==3)throw Error('無法讀取手動存檔，原有紀錄已保留。');
 return data.slots;
}
function slotSummary(snapshot){
 const data=snapshot?.progress||save,w=CoastEconomy.account(data),ids=new Set(cfg.fish.map(f=>f.id));
 const count=new Set((data.bag||[]).map(f=>f.id).filter(id=>ids.has(id))).size;
 const destination=cfg.areas.find(a=>a.id===data.lastArea)?.name||'長洲旅程目錄';
 return esc(destination)+'<br>金幣 $'+w.money+' · 圖鑑 '+count+' / '+cfg.fish.length+'<br>愛心 '+w.hearts+' · 收藏物件 '+w.instances.size+' 件';
}
function showSaveSlots(){
 if(!economyReady())return;
 if(embedded){economyMessage('故事模式存檔','此模式由主程式保存進度。',()=>showJournal('settings'));return;}
 let slots;try{slots=readManualSlots();}catch(e){economyMessage('未能讀取存檔',e.message,()=>showJournal('settings'));return;}
 $('home').hidden=true;
 modal('儲存／讀取進度','<p class="slotIntro">三格手動存檔保存在此裝置，與目前自動儲存分開。讀取會還原該次完整進度。</p><div class="saveSlotGrid"></div>');
 const grid=document.querySelector('.saveSlotGrid');
 slots.forEach((entry,index)=>{
  const card=document.createElement('section');card.className='saveSlotCard';card.dataset.slot=String(index);
  card.innerHTML='<h3>存檔 '+(index+1)+'</h3><div class="slotDetails">'+(entry?slotSummary(entry):'空白存檔')+'</div><small>'+(entry?esc(new Date(entry.savedAt).toLocaleString('zh-HK')):'尚未儲存')+'</small><div class="slotActions"></div>';
  for(const [label,action,disabled] of [['儲存',()=>confirmManualSave(index),false],['讀取',()=>confirmManualLoad(index),!entry]]){const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.onclick=action;card.querySelector('.slotActions').append(b);}
  grid.append(card);
 });
 foot('繼續目前進度',()=>loadJourney(),true);foot('返回遊戲設定',()=>showJournal('settings'));foot('返回主畫面',showHome);
}
function confirmManualSave(index){
 let prior;try{prior=readManualSlots()[index];}catch(e){economyMessage('未能儲存',e.message,showSaveSlots);return;}
 modal(prior?'覆蓋存檔 '+(index+1)+'？':'儲存至存檔 '+(index+1)+'？','<p class="intro">'+(prior?'這一格的舊紀錄會被目前進度取代。<br>':'')+slotSummary()+'</p>',()=>{
  try{
   const slots=readManualSlots();
   slots[index]={savedAt:Date.now(),progress:JSON.parse(JSON.stringify(save)),equippedBait,certificate:localStorage.getItem('peace-bun-master-certificate-v1')};
   localStorage.setItem(manualSlotKey(),JSON.stringify({version:1,slots}));
   economyMessage('已儲存','目前進度已保存至存檔 '+(index+1)+'。',showSaveSlots);
  }catch{economyMessage('未能儲存','儲存空間不足或無法存取。原有存檔沒有被覆蓋。',showSaveSlots);}
 },prior?'確認覆蓋':'確認儲存',true);foot('取消',showSaveSlots);
}
function confirmManualLoad(index){
 let entry;try{entry=readManualSlots()[index];}catch(e){economyMessage('未能讀取',e.message,showSaveSlots);return;}
 if(!entry)return;
 modal('讀取存檔 '+(index+1)+'？','<p class="intro">目前尚未手動儲存的進度會被取代。<br>金幣、魚獲、收藏和解鎖狀態會回到此紀錄：<br>'+slotSummary(entry)+'</p>',()=>{
  if(!entry.progress||!Array.isArray(entry.progress.bag)||!Array.isArray(entry.progress.economyEvents||[])){economyMessage('未能讀取','此存檔格式不完整，目前進度保持不變。',showSaveSlots);return;}
  const next=JSON.parse(JSON.stringify(entry.progress));
  // A new timeline prevents event-union cloud sync resurrecting the progress just rolled back.
  next.progressTimeline={at:Math.max(Date.now(),(+save.progressTimeline?.at||0)+1,(+next.progressTimeline?.at||0)+1),id:crypto.randomUUID()};
  next.legacyImported=true;
  const liveKey=cloud?.user?'coastline-account-v1:'+cloud.user.uid:KEY;
  const oldCertificate=localStorage.getItem('peace-bun-master-certificate-v1');
  try{
   if(entry.certificate)localStorage.setItem('peace-bun-master-certificate-v1',entry.certificate);else localStorage.removeItem('peace-bun-master-certificate-v1');
   localStorage.setItem(liveKey,JSON.stringify(next));
  }catch{
   try{if(oldCertificate)localStorage.setItem('peace-bun-master-certificate-v1',oldCertificate);else localStorage.removeItem('peace-bun-master-certificate-v1');}catch{}
   economyMessage('未能讀取','無法保存還原進度，目前進度保持不變。',showSaveSlots);return;
  }
  stopTheatre();cancelCast();tournament=null;pendingPrize=null;held=false;castSpecies=null;miniSession=null;school=[];area=null;
  save=next;equippedBait=['basic','advanced','master'].includes(entry.equippedBait)?entry.equippedBait:'basic';
  showHome();$('home').hidden=true;persist();updateQuickHud();
  const restoredArea=cfg.areas.find(a=>a.id===save.lastArea);
  economyMessage('已讀取存檔 '+(index+1),'已還原進度。三格手動紀錄仍然保留。',()=>restoredArea?chooseArea(restoredArea):showIslandHub());
 },'確認讀取',true);foot('取消',showSaveSlots);
}
const slotsSetupHome=setupHome;
setupHome=function(){slotsSetupHome();$('loadJourney').textContent='儲存／讀取進度';$('loadJourney').onclick=showSaveSlots;};
const slotsShowJournal=showJournal;
showJournal=function(...args){slotsShowJournal(...args);if(args[0]!=='settings'||!$('personalContent'))return;const b=document.createElement('button');b.id='manualSaveSlots';b.innerHTML='<b>儲存／讀取進度</b><span>三個獨立手動存檔 · 保留自動儲存</span>';b.onclick=showSaveSlots;$('personalContent').prepend(b);};

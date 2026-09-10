/* JSON configuration backups; no player records or credentials. */
import '../sport/fish-education.js';
export function exportData(config,scope){
 if(!['all','fish','areas'].includes(scope))throw Error('不支援的分類');
 const data=structuredClone(scope==='all'?config:config[scope]);
 const fish=scope==='all'?data.fish:scope==='fish'?data:[];
 for(const item of fish){
  if(!String(item.educationIntro||'').trim()){
   const entry=globalThis.FishEducation?.[item.id];
   if(entry?.paragraphs?.length)item.educationIntro=entry.paragraphs.join('\n\n');
  }
 }
 return {format:'hk-fishing-config',version:1,scope,exportedAt:new Date().toISOString(),data};
}
function checkTree(value){if(!value||typeof value!=='object')return;for(const [key,v] of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))throw Error('檔案含不安全欄位');checkTree(v);}}
function listCheck(list,kind){
 if(!Array.isArray(list)||!list.length||list.length>3000)throw Error('資料列表必須包含 1–3000 筆');
 const ids=new Set();for(const x of list){if(!x||typeof x.id!=='string'||!x.id.trim()||ids.has(x.id)||typeof x.name!=='string'||!x.name.trim())throw Error('ID／名稱缺漏或 ID 重複');ids.add(x.id);
 if(kind==='fish'){for(const k of ['min','max','hits'])if(!Number.isFinite(x[k])||x[k]<0)throw Error(x.name+'：重量或難度無效');if(x.min>x.max||x.hits<1)throw Error(x.name+'：重量範圍或難度無效');}
 if(kind==='areas'&&(!Array.isArray(x.fish)||x.fish.some(id=>typeof id!=='string')))throw Error(x.name+'：魚種列表無效');
 }
}
export function importData(config,file,scope){
 if(!['all','fish','areas'].includes(scope))throw Error('不支援的分類');
 checkTree(file);if(file?.format!=='hk-fishing-config'||file.version!==1||file.scope!==scope)throw Error('格式或分類不符，請選擇相應的匯出檔案');
 const data=structuredClone(file.data),next=structuredClone(config);
 if(scope==='all'){
  if(!data||typeof data!=='object'||Array.isArray(data))throw Error('全部資料格式無效');
  for(const k of ['texts','settings'])if(!data[k]||typeof data[k]!=='object'||Array.isArray(data[k]))throw Error('缺少 '+k);
  for(const k of ['weather','tides','tournaments','medals'])if(!Array.isArray(data[k]))throw Error('缺少 '+k);
  listCheck(data.fish,'fish');listCheck(data.areas,'areas');
 }else{listCheck(data,scope);const merged=new Map(next[scope].map(x=>[x.id,x]));for(const item of data)merged.set(item.id,item);next[scope]=[...merged.values()];}
 const result=scope==='all'?data:next,fishIds=new Set(result.fish.map(x=>x.id));
 for(const key of ['presentation','economy'])if(result[key]!=null&&(typeof result[key]!=='object'||Array.isArray(result[key])))throw Error(key+' 格式無效');
 for(const key of ['weather','tides','tournaments','medals'])if(result[key].some(x=>!x||typeof x!=='object'||Array.isArray(x)))throw Error(key+' 項目格式無效');
 if(result.baitKnowledge)for(const key of ['basic','advanced','master'])if(!Array.isArray(result.baitKnowledge[key])||result.baitKnowledge[key].some(x=>!Array.isArray(x)||x.length!==2||x.some(v=>typeof v!=='string')))throw Error('魚餌知識格式無效');
 for(const area of result.areas){
  if(area.boostedFish!=null&&(!Array.isArray(area.boostedFish)||area.boostedFish.some(id=>typeof id!=='string')))throw Error(area.name+'：加權魚種格式無效');
  if(area.backgrounds!=null&&(typeof area.backgrounds!=='object'||Array.isArray(area.backgrounds)))throw Error(area.name+'：背景格式無效');
 }
 for(const area of result.areas)if(area.fish.some(id=>!fishIds.has(id)))throw Error(area.name+' 引用了不存在的魚種，請先匯入魚類或使用全部資料');
 if(new TextEncoder().encode(JSON.stringify(result)).length>900000)throw Error('合併後設定超過 900 KB，請減少內容');
 return result;
}
export function mountTransfer(get,set){
 const section=document.createElement('section');section.id='dataTransfer';section.innerHTML='<h2>資料匯出／匯入</h2><p>JSON 備份包含設定、介紹及圖片網址，不包含圖片檔案、玩家進度或登入資料。魚類／釣區依 ID 更新或新增，不刪除其他項目；全部資料會取代整份設定。</p><label>資料分類 <select id="transferScope"><option value="all">全部資料</option><option value="fish">魚類</option><option value="areas">釣區</option></select></label><p><button type="button" id="exportConfig">匯出 JSON</button> <button type="button" id="importConfig">匯入 JSON</button> <button type="button" id="undoImport" disabled>復原上次匯入</button></p><input id="transferFile" type="file" accept=".json,application/json" hidden><p id="transferMessage" role="status"></p>';
 document.getElementById('basic').parentElement.before(section);const $=id=>document.getElementById(id);let previous=null;
 $('exportConfig').onclick=()=>{const scope=$('transferScope').value,blob=new Blob([JSON.stringify(exportData(get(),scope),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='hong-kong-fishing-'+scope+'-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('importConfig').onclick=()=>{$('transferFile').value='';$('transferFile').click();};
 $('transferFile').onchange=async()=>{const file=$('transferFile').files[0],scope=$('transferScope').value;if(!file)return;try{if(file.size>900000)throw Error('檔案超過 900 KB，請縮小設定檔');const parsed=JSON.parse((await file.text()).replace(/^\uFEFF/,'')),next=importData(get(),parsed,scope);const detail=scope==='all'?'取代全部設定':scope==='fish'?'更新／新增 '+parsed.data.length+' 種魚':'更新／新增 '+parsed.data.length+' 個釣區';if(!confirm(detail+'。只套用到後台，尚未發佈。確定匯入？'))return;previous=structuredClone(get());set(next);$('undoImport').disabled=false;$('transferMessage').textContent='匯入完成，請檢查後按「發佈全部設定」。如有需要，可復原上次匯入。';}catch(e){$('transferMessage').textContent='沒有匯入：'+e.message;}};
 $('undoImport').onclick=()=>{if(previous&&confirm('復原至上次匯入前的後台設定？')){set(previous);previous=null;$('undoImport').disabled=true;$('transferMessage').textContent='已復原後台設定，尚未發佈。';}};
}

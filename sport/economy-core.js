/* Shared deterministic ledger: never merge money with Math.max or sum starting gifts. */
globalThis.CoastEconomy=(()=>{
 const catchKey=f=>f.catchId||[f.id,f.time,f.weight,f.area].join('|');
 const storyEligible=(save,s)=>s.hearts>=10||(save.bag||[]).some(f=>f.id==='siganus-canaliculatus'&&!s.sold.has(catchKey(f))&&!s.released.has(catchKey(f)));
 const kinds=['basic','advanced','master'];
 function mergeEvents(a=[],b=[]){const map=new Map();for(const e of [...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])]){if(!e||typeof e.id!=='string'||!Number.isSafeInteger(e.seq)||e.seq<1)continue;const old=map.get(e.id);if(!old||JSON.stringify(e)<JSON.stringify(old))map.set(e.id,e);}return [...map.values()].sort((x,y)=>x.seq-y.seq||x.id.localeCompare(y.id));}
 function account(save={}){
  const s={stories:new Set(),storyRewards:new Set(),money:500,hearts:10,bait:{basic:10,advanced:0,master:0},areas:new Set(),sold:new Set(),released:new Set(),purchases:new Map(),daily:new Map(),dailyPools:new Map(),collection:new Map(),instances:new Map(),instanceOwners:new Map(),ownership:new Map(),completed:new Set(),litterCatches:new Set(),rewards:new Set(),accepted:new Set(),rejected:[]};
  const addItem=(kind,item,owner)=>{const key=kind+'|'+item.id;s.collection.set(key,item);s.ownership.set(key,owner);s.instances.set(kind+'|'+owner,item);s.instanceOwners.set(kind+'|'+owner,owner);};
  const fish=new Set((save.bag||[]).map(catchKey));
  for(const e of mergeEvents(save.economyEvents)){
   const price=Number.isSafeInteger(e.amount)&&e.amount>=0&&e.amount<=10000000;let ok=false;
   if(e.type==='buy'&&kinds.includes(e.bait)&&price&&s.money>=e.amount){s.money-=e.amount;s.bait[e.bait]++;ok=true;}
   if(e.type==='use'&&kinds.includes(e.bait)&&s.bait[e.bait]>0){s.bait[e.bait]--;ok=true;}
   if(e.type==='unlock'&&typeof e.areaId==='string'&&!s.areas.has(e.areaId)&&price&&s.money>=e.amount){s.money-=e.amount;s.areas.add(e.areaId);ok=true;}
   if(e.type==='travel'&&typeof e.areaId==='string'&&price&&s.money>=e.amount){s.money-=e.amount;ok=true;}
   if(e.type==='sell'&&fish.has(e.catchKey)&&!s.sold.has(e.catchKey)&&!s.released.has(e.catchKey)&&price){s.sold.add(e.catchKey);s.money+=e.amount;ok=true;}
   if(e.type==='release'&&fish.has(e.catchKey)&&!s.sold.has(e.catchKey)&&!s.released.has(e.catchKey)){s.released.add(e.catchKey);ok=true;}
   if(e.type==='souvenir'&&['toy','postcard'].includes(e.kind)&&e.amount===20&&s.money>=20&&typeof e.purchaseKey==='string'&&e.purchaseKey.length>0&&e.purchaseKey.length<200&&!s.purchases.has(e.purchaseKey)&&/^\d{4}-\d{2}-\d{2}$/.test(e.day)&&e.item&&typeof e.item.id==='string'&&e.item.id.length>0){
    const key=e.kind+'|'+e.day,prior=s.daily.get(key);
    const pool=e.dailyPool,validPool=Array.isArray(pool)&&pool.length===3&&new Set(pool.map(v=>v?.id)).size===3&&pool.every(v=>v&&typeof v.id==='string'&&typeof v.image==='string')&&pool.some(v=>JSON.stringify(v)===JSON.stringify(e.item));
    const fixed=s.dailyPools.get(key),valid=e.dailyMode===3?validPool&&(!fixed||JSON.stringify(fixed)===JSON.stringify(pool)):!prior||JSON.stringify(prior)===JSON.stringify(e.item);
    if(valid){s.money-=20;if(e.dailyMode===3)s.dailyPools.set(key,pool);else s.daily.set(key,e.item);s.purchases.set(e.purchaseKey,e);if(e.kind==='toy'){addItem('toy',e.item,e.id);}ok=true;}
   }
   if(e.type==='postcard-complete'&&s.purchases.get(e.purchaseKey)?.kind==='postcard'&&!s.completed.has(e.purchaseKey)){const item=s.purchases.get(e.purchaseKey).item;s.completed.add(e.purchaseKey);addItem('postcard',item,e.id);ok=true;}
   if(e.type==='litter'&&typeof e.catchId==='string'&&!s.litterCatches.has(e.catchId)&&e.item&&/^litter-[1-6]$/.test(e.item.id)){const key='litter|'+e.item.id;s.litterCatches.add(e.catchId);addItem('litter',e.item,e.id);ok=true;}
   // Consume the exact acquisition, so a replay or stale device cannot redeem it twice.
   if(e.type==='recycle'){
    const kind=String(e.key||'').split('|')[0],key=e.instance===true?e.key:kind+'|'+e.owner;
    const legacy=e.instance===true||(s.collection.has(e.key)&&s.ownership.get(e.key)===e.owner);
    const reward={toy:5,postcard:5,litter:2}[kind],item=s.instances.get(key);
    if(legacy&&reward&&item&&s.instanceOwners.get(key)===e.owner){s.instances.delete(key);s.instanceOwners.delete(key);const oldKey=kind+'|'+item.id;if(s.ownership.get(oldKey)===e.owner){s.collection.delete(oldKey);s.ownership.delete(oldKey);}s.hearts+=reward;ok=true;}
   }
   if(e.type==='minigame'&&e.game==='peace-bun-whack'&&[1,2,3].includes(e.level)&&e.amount===e.level*100&&typeof e.rewardKey==='string'&&e.rewardKey.length>0&&e.rewardKey.length<200&&!s.rewards.has(e.rewardKey)){s.rewards.add(e.rewardKey);s.money+=e.amount;if(e.level===3)addItem('certificate',{id:'peaceBunMaster',name:'平安包達人證書',image:'../../../mini-games/peace-bun-whack/assets/peace-bun-master-certificate.png'},e.id);ok=true;}
   if(e.type==='certificate-import'&&e.certificate==='peaceBunMaster'&&![...s.instances.keys()].some(k=>k.startsWith('certificate|'))){addItem('certificate',{id:'peaceBunMaster',name:'平安包達人證書',image:'../../../mini-games/peace-bun-whack/assets/peace-bun-master-certificate.png'},e.id);ok=true;}
   if(e.type==='story-unlock'&&e.story==='star-thrower'&&!s.stories.has(e.story)&&storyEligible(save,s)){s.stories.add(e.story);ok=true;}
   if(e.type==='story-complete'&&e.story==='star-thrower'&&s.stories.has(e.story)&&!s.storyRewards.has(e.story)){s.storyRewards.add(e.story);addItem('story',{id:'star-congee',name:'泥鯭粥',image:'../theatre/congee.png'},e.id+'-congee');addItem('story',{id:'star-card-case',name:'卡片盒',image:'../theatre/card-case.png'},e.id+'-card');ok=true;}
   if(e.type==='relief'&&Number.isFinite(e.limit)&&s.money<e.limit&&kinds.every(k=>s.bait[k]===0)){s.bait.basic=3;ok=true;}
   if(ok)s.accepted.add(e.id);else s.rejected.push(e.id);
  }return s;
 }
 function pool(fish,caught,kind,roll){const unseen=fish.filter(f=>!caught.has(f.id)),seen=fish.filter(f=>caught.has(f.id));if(kind==='basic')return fish;if(!unseen.length)return [];if(kind==='master'||!seen.length||roll<.6)return unseen;return seen;}
 return {account,mergeEvents,catchKey,pool,storyEligible};
})();

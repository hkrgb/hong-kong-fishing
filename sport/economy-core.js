/* Shared deterministic ledger: never merge money with Math.max or sum starting gifts. */
globalThis.CoastEconomy=(()=>{
 const catchKey=f=>f.catchId||[f.id,f.time,f.weight,f.area].join('|');
 const kinds=['basic','advanced','master'];
 function mergeEvents(a=[],b=[]){const map=new Map();for(const e of [...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])]){if(!e||typeof e.id!=='string'||!Number.isSafeInteger(e.seq)||e.seq<1)continue;const old=map.get(e.id);if(!old||JSON.stringify(e)<JSON.stringify(old))map.set(e.id,e);}return [...map.values()].sort((x,y)=>x.seq-y.seq||x.id.localeCompare(y.id));}
 function account(save={}){
  const s={money:500,bait:{basic:10,advanced:0,master:0},areas:new Set(),sold:new Set(),accepted:new Set(),rejected:[]};
  const fish=new Set((save.bag||[]).map(catchKey));
  for(const e of mergeEvents(save.economyEvents)){
   const price=Number.isSafeInteger(e.amount)&&e.amount>=0&&e.amount<=10000000;let ok=false;
   if(e.type==='buy'&&kinds.includes(e.bait)&&price&&s.money>=e.amount){s.money-=e.amount;s.bait[e.bait]++;ok=true;}
   if(e.type==='use'&&kinds.includes(e.bait)&&s.bait[e.bait]>0){s.bait[e.bait]--;ok=true;}
   if(e.type==='unlock'&&typeof e.areaId==='string'&&!s.areas.has(e.areaId)&&price&&s.money>=e.amount){s.money-=e.amount;s.areas.add(e.areaId);ok=true;}
   if(e.type==='sell'&&fish.has(e.catchKey)&&!s.sold.has(e.catchKey)&&price){s.sold.add(e.catchKey);s.money+=e.amount;ok=true;}
   if(e.type==='relief'&&Number.isFinite(e.limit)&&s.money<e.limit&&kinds.every(k=>s.bait[k]===0)){s.bait.basic=3;ok=true;}
   if(ok)s.accepted.add(e.id);else s.rejected.push(e.id);
  }return s;
 }
 function pool(fish,caught,kind,roll){const unseen=fish.filter(f=>!caught.has(f.id)),seen=fish.filter(f=>caught.has(f.id));if(kind==='basic')return fish;if(!unseen.length)return [];if(kind==='master'||!seen.length||roll<.6)return unseen;return seen;}
 return {account,mergeEvents,catchKey,pool};
})();

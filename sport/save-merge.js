import './economy-core.js?v=20260909-economy';
export const emptySave=()=>({bag:[],medals:{},visited:{},score:0,cupWins:{},cupRewards:{}});
export function mergeSaves(a={},b={}){
 const fish=new Map();for(const f of [...(a.bag||[]),...(b.bag||[])])fish.set(f.catchId||[f.id,f.time,f.weight,f.area].join('|'),f);
 const rewards={...(a.cupRewards||{})};for(const [k,v] of Object.entries(b.cupRewards||{}))rewards[k]=Math.max(+rewards[k]||0,+v||0);
 return {...a,...b,economyEvents:globalThis.CoastEconomy.mergeEvents(a.economyEvents,b.economyEvents),bag:[...fish.values()].sort((x,y)=>(+y.time||0)-(+x.time||0)),medals:{...a.medals,...b.medals},visited:{...a.visited,...b.visited},cupWins:{...a.cupWins,...b.cupWins},cupRewards:rewards,score:Math.max(+a.score||0,+b.score||0,Object.values(rewards).reduce((s,n)=>s+n,0))};
}

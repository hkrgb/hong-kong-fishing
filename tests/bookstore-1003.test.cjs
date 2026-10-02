const assert=require('node:assert/strict');require('../sport/economy-core.js');const E=CoastEconomy;
const events=[];let n=0;const add=e=>{events.push({...e,id:'e'+(++n),seq:n});return E.account({economyEvents:events});};
const item={id:'yoyo',name:'搖搖',image:'yoyo.png'};
add({type:'souvenir',kind:'toy',amount:20,day:'2026-10-03',purchaseKey:'p1',item});let w=add({type:'souvenir',kind:'toy',amount:20,day:'2026-10-03',purchaseKey:'p2',item});assert.equal(w.instances.size,2);
w=add({type:'recycle',key:'toy|e1',owner:'e1',instance:true});assert.equal(w.instances.size,1);assert(w.instances.has('toy|e2'));assert.equal(w.hearts,15);
w=add({type:'recycle',key:'toy|e1',owner:'e1',instance:true});assert.equal(w.hearts,15);
for(let i=0;i<2;i++){add({type:'souvenir',kind:'postcard',amount:20,day:'2026-10-03',purchaseKey:'card'+i,item:{id:'postcard-1',image:'postcard-1.jpg'}});add({type:'postcard-complete',purchaseKey:'card'+i});add({type:'litter',catchId:'catch'+i,item:{id:'litter-1',image:'litter-1.png'}});}
assert.equal(E.account({economyEvents:events}).instances.size,5);
for(let level=1;level<=3;level++)w=add({type:'minigame',game:'peace-bun-whack',level,amount:level*100,rewardKey:'run:'+level});assert.equal([...w.instances.keys()].filter(k=>k.startsWith('certificate|')).length,1);
const same=E.account({economyEvents:E.mergeEvents(events,events)});assert.equal(same.instances.size,6);assert.equal(same.money,w.money);
const old=[{id:'a',seq:1,type:'souvenir',kind:'toy',amount:20,day:'2026-10-02',purchaseKey:'a',item},{id:'b',seq:2,type:'souvenir',kind:'toy',amount:20,day:'2026-10-02',purchaseKey:'b',item},{id:'c',seq:3,type:'recycle',key:'toy|yoyo',owner:'b'}];const migrated=E.account({economyEvents:old});assert.equal(migrated.instances.size,1);assert(migrated.instances.has('toy|a'));assert.equal(migrated.hearts,15);
console.log('PASS duplicate acquisition retention, one-item recycling, replay, legacy recovery and level-three certificate');

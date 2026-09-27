const assert=require('node:assert/strict');require('../sport/economy-core.js');
const E=globalThis.CoastEconomy,events=[];let n=0;
function add(e){events.push({...e,id:'e'+(++n),seq:n});return E.account({economyEvents:events});}
assert.equal(E.account({}).hearts,10);
const item={id:'yoyo',name:'搖搖',image:'yoyo.png'};
add({type:'souvenir',kind:'toy',amount:20,day:'2026-09-27',purchaseKey:'p1',item});
let w=add({type:'recycle',key:'toy|yoyo',owner:'e1'});assert.equal(w.hearts,15);assert.equal(w.money,480);assert.equal(w.collection.size,0);
w=add({type:'recycle',key:'toy|yoyo',owner:'e1'});assert.equal(w.hearts,15);assert(w.rejected.includes('e3'));
add({type:'souvenir',kind:'toy',amount:20,day:'2026-09-27',purchaseKey:'p2',item});
w=add({type:'recycle',key:'toy|yoyo',owner:'e1'});assert.equal(w.hearts,15);assert.equal(w.collection.size,1);
add({type:'souvenir',kind:'postcard',amount:20,day:'2026-09-27',purchaseKey:'p3',item:{id:'postcard-1'}});
add({type:'postcard-complete',purchaseKey:'p3'});w=add({type:'recycle',key:'postcard|postcard-1',owner:'e7'});assert.equal(w.hearts,20);
w=add({type:'postcard-complete',purchaseKey:'p3'});assert(!w.collection.has('postcard|postcard-1'));
add({type:'litter',catchId:'c1',item:{id:'litter-1'}});w=add({type:'recycle',key:'litter|litter-1',owner:'e10'});assert.equal(w.hearts,22);
w=add({type:'litter',catchId:'c1',item:{id:'litter-1'}});assert(!w.collection.has('litter|litter-1'));
const merged=E.mergeEvents(events,[...events,{id:'other-device',seq:11,type:'recycle',key:'litter|litter-1',owner:'e10'}]);
assert.equal(E.account({economyEvents:merged}).hearts,22);assert.equal(E.account({economyEvents:merged}).money,440);
console.log('PASS hearts, consumption, duplicate and stale-device redemptions, postcard replay, litter isolation and merged events');

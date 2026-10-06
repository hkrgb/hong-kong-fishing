const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const c={};vm.runInNewContext(fs.readFileSync(__dirname+'/../sport/economy-core.js','utf8'),c);const E=c.CoastEconomy;
const event=(type,seq)=>({id:'e'+seq,seq,type,story:'star-thrower'});
let save={bag:[],economyEvents:[event('story-unlock',1),event('story-complete',2),event('story-complete',3)]},w=E.account(save);
assert(w.stories.has('star-thrower'));assert.equal(w.hearts,10);assert.equal(w.instances.size,2);assert(w.rejected.includes('e3'));
assert.equal(E.account({economyEvents:[event('story-complete',1)]}).instances.size,0);
const low={hearts:0,sold:new Set(),released:new Set()},fish={id:'siganus-canaliculatus',catchId:'fish1'};
assert(!E.storyEligible({bag:[]},low));assert(E.storyEligible({bag:[fish]},low));low.sold.add('fish1');assert(!E.storyEligible({bag:[fish]},low));
assert.equal(E.account({bag:[],economyEvents:E.mergeEvents(save.economyEvents,save.economyEvents)}).instances.size,2);
console.log('PASS story eligibility, permanent ledger unlock, no consumption, two rewards, replay and completion-before-unlock rejection');

const paid=(seq,payment,catchKey)=>({...event('story-unlock-paid',seq),payment,catchKey});
let charged=E.account({economyEvents:[paid(1,'hearts'),paid(2,'hearts')]});assert.equal(charged.hearts,0);assert.equal(charged.stories.size,1);assert(charged.rejected.includes('e2'));
charged=E.account({bag:[fish],economyEvents:[paid(1,'fish','fish1'),{id:'s',seq:2,type:'sell',catchKey:'fish1',amount:100},{id:'r',seq:3,type:'release',catchKey:'fish1'}]});assert.equal(charged.hearts,10);assert(charged.offered.has('fish1'));assert.equal(charged.money,500);assert(!charged.sold.has('fish1'));assert(!charged.released.has('fish1'));
for(const prior of ['sell','release']){const w=E.account({bag:[fish],economyEvents:[{id:'prior',seq:1,type:prior,catchKey:'fish1',amount:100},paid(2,'fish','fish1')]});assert.equal(w.stories.size,0);assert.equal(w.hearts,10);}
assert.equal(E.account({bag:[{...fish,id:'wrong-species'}],economyEvents:[paid(1,'fish','fish1')]}).stories.size,0);
assert.equal(E.account({economyEvents:[paid(1,'invalid')]}).stories.size,0);
const both=E.account({bag:[fish],economyEvents:E.mergeEvents([paid(1,'fish','fish1')],[{...paid(1,'hearts'),id:'z'}])});assert.equal(both.offered.size,1);assert.equal(both.hearts,10);
console.log('PASS paid fish/hearts, atomic debit, replay and merged choices, invalid fish, sale/release prevention; legacy unlocks retained');

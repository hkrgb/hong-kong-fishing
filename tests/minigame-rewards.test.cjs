const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
vm.runInThisContext(fs.readFileSync(require('node:path').join(__dirname,'../sport/economy-core.js'),'utf8'));
test('bun level payouts persist and duplicate deliveries cannot mint money',()=>{
 const e=(id,level,key,amount=level*100)=>({id,seq:Number(id),type:'minigame',game:'peace-bun-whack',level,rewardKey:key,amount});
 const events=[e('1',1,'run:1'),e('2',2,'run:2'),e('3',3,'run:3'),e('4',1,'run:1'),e('5',3,'forged',99999),e('6',4,'bad-level',400)];
 const save=JSON.parse(JSON.stringify({economyEvents:events}));const w=CoastEconomy.account(save);
 assert.equal(w.money,1100);assert.equal(w.rewards.size,3);assert.deepEqual(w.rejected,['4','5','6']);
 const merged=CoastEconomy.mergeEvents(events,events);assert.equal(CoastEconomy.account({economyEvents:merged}).money,1100);
});

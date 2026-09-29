const assert=require('node:assert/strict');require('../sport/daily-souvenirs.js');require('../sport/economy-core.js');require('../sport/bookshop-data.js');
for(const kind of ['toy','postcard']){
 const items=BookshopDefaults[kind==='toy'?'toys':'postcards'],day='2026-09-29',pool=DailySouvenirs.pool(items,kind,day);
 assert.equal(new Set(pool.map(x=>x.id)).size,3);assert.deepEqual(DailySouvenirs.pool(items.slice().reverse(),kind,day),pool);
 assert(new Set(Array.from({length:20},(_,i)=>DailySouvenirs.pool(items,kind,'2026-10-'+String(i+1).padStart(2,'0')).map(x=>x.id).join('|'))).size>1);
 assert.deepEqual([0,.34,.67].map(n=>DailySouvenirs.draw(pool,()=>n).id),pool.map(x=>x.id));
 const events=pool.map((item,i)=>({type:'souvenir',id:kind+i,seq:i+1,kind,day,item,amount:20,purchaseKey:kind+'-p'+i,dailyMode:3,dailyPool:pool}));
 let w=CoastEconomy.account({economyEvents:events});assert.equal(w.money,440);assert.equal(w.purchases.size,3);assert.deepEqual(w.dailyPools.get(kind+'|'+day),pool);
 w=CoastEconomy.account({economyEvents:[...events,{...events[0],id:'retry',seq:4}]});assert.equal(w.money,440);
 w=CoastEconomy.account({economyEvents:[...events,{...events[0],id:'outside',seq:4,purchaseKey:'outside',item:items.find(x=>!pool.some(v=>v.id===x.id))}]});assert.equal(w.money,440);
 const old={type:'souvenir',id:'old',seq:1,kind,day,item:items[0],amount:20,purchaseKey:'old'};const migration=DailySouvenirs.pool(items,kind,day,items[0]);assert(migration.some(x=>x.id===items[0].id));
 w=CoastEconomy.account({economyEvents:[old,...migration.map((item,i)=>({...events[i],id:'new'+i,seq:i+2,dailyPool:migration,item}))]});assert.equal(w.money,420);assert.equal(w.purchases.size,4);
}
console.log('PASS three distinct daily options, date rotation, independent draws, three purchases, retries, invalid item rejection and legacy same-day migration');

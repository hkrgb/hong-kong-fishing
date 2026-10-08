const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'../sport'),ctx=vm.createContext({});for(const file of ['economy-core.js','region-stamps.js','save-merge.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8').replace(/^import .*;$/gm,'').replace(/export /g,''),ctx);
const merge=(a,b)=>JSON.parse(JSON.stringify(ctx.mergeSaves(a,b)));
const old={bag:[{id:'old',catchId:'a'}],score:100,economyEvents:[{id:'buy',seq:1,type:'buy',bait:'basic',amount:100}]},restored={bag:[],score:0,economyEvents:[],progressTimeline:{at:100,id:'restore'}};
assert.deepEqual(merge(old,restored),restored);assert.deepEqual(merge(restored,old),restored);
const recent={...restored,bag:[{id:'new',catchId:'b'}],economyEvents:[{id:'new-buy',seq:1,type:'buy',bait:'basic',amount:10}]};assert.equal(merge(restored,recent).bag.length,1);assert.equal(merge(restored,recent).economyEvents.length,1);
const newer={...restored,progressTimeline:{at:101,id:'restore-2'}};assert.deepEqual(merge(recent,newer),newer);
assert.equal(merge(old,{bag:[{id:'another',catchId:'c'}],score:1}).bag.length,2);
console.log('PASS stale cloud cannot resurrect rolled-back purchases/fish; same timeline and legacy saves still merge');

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('offline signed-in progress stays in its account backup and reconnect requests sync',async()=>{
 const data=new Map([['coastline-account-v1:test-user',JSON.stringify({bag:[],score:7})]]);let authChanged,current={bag:[],score:0},message='',transactions=0;
 const listeners={};const context={navigator:{onLine:false},localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),onAuthStateChanged:(a,cb)=>authChanged=cb,emptySave:()=>({bag:[],score:0}),mergeSaves:(a,b)=>({...a,...b}),doc:()=>({}),serverTimestamp:()=>0,runTransaction:async(db,cb)=>{transactions++;return cb({get:async()=>({exists:()=>false}),set:()=>{}})},setTimeout:()=>1,clearTimeout:()=>{},TextEncoder,addEventListener:(n,cb)=>listeners[n]=cb};
 vm.createContext(context);let source=fs.readFileSync(require('node:path').join(__dirname,'../sport/cloud.js'),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export function createCloud','function createCloud');vm.runInContext(source,context);
 const cloud=context.createCloud({read:()=>current,replace:v=>current=v,status:v=>message=v,guest:()=>{},readGuest:()=>({bag:[]})});
 await authChanged({uid:'test-user'});assert.equal(current.score,7);assert.equal(transactions,0);assert.match(message,/離線/);
 current.score=12;cloud.changed();assert.equal(JSON.parse(data.get('coastline-account-v1:test-user')).score,12);
 assert.equal(await cloud.sync(),false);assert.equal(transactions,0);
 context.navigator.onLine=true;await cloud.sync();assert.equal(transactions,1);assert.equal(current.score,12);assert.match(message,/已同步/);
 assert.equal(typeof listeners.online,'function');
});

const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),raw=JSON.parse(fs.readFileSync(path.join(root,'pro/config.json'))),box={structuredClone,Intl,Date};box.globalThis=box;
for(const f of ['sport/premium-fish.js','region-guide.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),box);
assert.equal(raw.fish.length,170);assert.equal(new Set(raw.fish.map(f=>f.id)).size,170);assert.equal(new Set(raw.fish.map(f=>f.scientificName?.toLowerCase())).size,170);
const old=structuredClone(raw);old.fish=old.fish.filter(f=>!f.premium);for(const a of old.areas)a.fish=a.fish.filter(id=>old.fish.some(f=>f.id===id));
const c=box.RegionGuide.normalize(old);assert.equal(c.fish.length,170);box.RegionGuide.normalize(c);assert.equal(c.fish.length,170);
for(const f of c.fish.filter(f=>f.premium)){assert(c.areas.some(a=>a.fish.includes(f.id)));assert(f.sellPerKg>50);assert(f.spawnWeight<1);assert(f.image.endsWith('.png'));assert.equal(f.artStatus,'ai-photorealistic-real-reference');const bytes=fs.readFileSync(path.resolve(root,'sport',f.image));assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes[25],6,'RGBA cutout required');assert.equal(raw.fish.find(item=>item.id===f.id).image,f.image);}
const normal={id:'normal'},rare={id:'rare',spawnWeight:.22};let count=0;for(let i=0;i<12200;i++)if(box.RegionGuide.weighted([normal,rare],{},()=>i/12200).id==='rare')count++;assert.equal(count,2200);assert.equal(box.RegionGuide.weighted([],{}),null);
// The actual Canvas draw function must colour rarity, independent of physical size.
const motion=fs.readFileSync(path.join(root,'sport/motion.js'),'utf8'),start=motion.indexOf('function drawNaturalFish(');const fills=[];
const ctx=new Proxy({},{get:(o,k)=>()=>{},set:(o,k,v)=>{if(k==='fillStyle')fills.push(v);return true;}});
const drawBox={ctx,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),fishSize:f=>({type:f.sizeType}),time:0};vm.createContext(drawBox);vm.runInContext(motion.slice(start),drawBox);
for(const [premium,sizeType] of [[true,'small'],[true,'unknown'],[false,'large']]){fills.length=0;drawBox.drawNaturalFish({x:400,y:420,angle:0,size:1,phase:0,species:{premium,sizeType}});assert.equal(fills[0].startsWith('rgba(225,43,47'),premium);}
console.log('PASS: 170 distinct species, 20 new, old remote migration/idempotence, all areas/art, premium pricing, exact rarity weighting, Canvas red only for premium fish.');

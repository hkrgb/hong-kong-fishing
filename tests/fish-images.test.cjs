const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),box={structuredClone,Intl,Date};box.globalThis=box;
for(const f of ['sport/premium-fish.js','region-guide.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),box);
const cfg=box.RegionGuide.normalize(JSON.parse(fs.readFileSync(path.join(root,'pro/config.json'))));
const changes=JSON.parse(fs.readFileSync(path.join(root,'docs/fish-image-prompts-20261008.json')));
assert.equal(cfg.fish.length,170);assert.equal(changes.length,11);
for(const c of changes){
 const expected='../assets/fish/review-20261008/'+c.id+'.png';
 assert.equal(cfg.fish.find(f=>f.id===c.id).image,expected);
 assert.equal(box.FishImagePath(c.old),expected,'legacy configured image');
 assert.equal(box.FishImagePath(expected),expected,'idempotence');
 for(const stem of [c.id,c.id+'-v2','cutout-'+c.id,'cutout-'+c.id+'-v2'])
  assert.equal(box.FishImagePath('../assets/fish/'+stem+'.webp'),expected,'old generated/cutout alias');
 const bytes=fs.readFileSync(path.resolve(root,'sport',expected));
 assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes[25],6,'transparent RGBA');
}
for(const f of cfg.fish)assert(fs.existsSync(path.resolve(root,'sport',f.image)),f.id);
const remote='https://example.org/assets/fish/pampus-chinensis.png';assert.equal(box.FishImagePath(remote),remote);
console.log('PASS: 170 fish paths exist, 11 RGBA replacements and legacy aliases resolve, no third-party URL rewrite.');

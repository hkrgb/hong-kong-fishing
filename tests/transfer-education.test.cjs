const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..');
 vm.runInThisContext(fs.readFileSync(path.join(root,'sport/fish-education.js'),'utf8'));
 const source=fs.readFileSync(path.join(root,'pro/data-transfer.js'),'utf8').replace("import '../sport/fish-education.js';",'');
 const {exportData,importData}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const config=JSON.parse(fs.readFileSync(path.join(root,'pro/config.json'),'utf8'));
 const before=JSON.stringify(config);
 for(const scope of ['all','fish']){
  const file=exportData(config,scope),fish=scope==='all'?file.data.fish:file.data;
  assert.equal(fish.length,150);
  for(const f of fish)assert.equal(f.educationIntro,globalThis.FishEducation[f.id].paragraphs.join('\n\n'));
  fish[0].educationIntro='自行修改的簡介。';
  const restored=importData(config,file,scope);
  assert.equal(restored.fish[0].educationIntro,'自行修改的簡介。');
  assert.equal(exportData(restored,'fish').data[0].educationIntro,'自行修改的簡介。');
 }
 assert.equal(JSON.stringify(config),before,'Export must not mutate draft');
 assert.deepEqual(exportData(config,'areas').data,config.areas);
 console.log('PASS 150 built-in introductions, all/fish roundtrip, custom precedence, no mutation, areas unchanged');
})().catch(e=>{console.error(e);process.exit(1)});

/* Run after changing shipped artwork or game code. Never include editor/private files. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),files=new Set();
const sandbox={structuredClone,Intl,Date};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync(path.join(root,'region-guide.js'),'utf8'),sandbox);
function add(relative){relative=relative.replaceAll('\\','/');if(fs.statSync(path.join(root,relative),{throwIfNoEntry:false})?.isFile())files.add(relative);}
function walk(folder,filter=()=>true){for(const e of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){const p=folder+'/'+e.name;if(e.isDirectory())walk(p,filter);else if(filter(p))add(p);}}
for(const p of ['index.html','region-guide.js','app-install.js','offline-ui.css','offline.html','privacy.html','delete-account.html','manifest.webmanifest','pro/config.json'])add(p);
walk('sport',p=>/\.(html|js|css|json|png|jpe?g|webp|svg|mp3|ogg|wav|mp4)$/i.test(p));
walk('mp4');walk('app-assets');walk('mini-games');
for(const e of fs.readdirSync(path.join(root,'assets'),{withFileTypes:true}))if(e.isFile())add('assets/'+e.name);
// Include the current equivalent of legacy fish paths as well as unmapped species.
walkFish('assets/fish');
function walkFish(folder){for(const e of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){const p=folder+'/'+e.name;if(e.isDirectory())walkFish(p);else if(/\.(png|webp|jpe?g)$/i.test(p))add(sandbox.FishImagePath('../'+p).replace(/^\.\.\//,''));}}
const entries=[...files].sort().map(url=>{const b=fs.readFileSync(path.join(root,url));return {url,bytes:b.length,revision:crypto.createHash('sha256').update(b).digest('hex').slice(0,16)}});
const version=crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0,16);
fs.writeFileSync(path.join(root,'offline-manifest.json'),JSON.stringify({version,bytes:entries.reduce((s,e)=>s+e.bytes,0),entries},null,2)+'\n');
fs.writeFileSync(path.join(root,'offline-manifest.js'),'self.OFFLINE_MANIFEST='+JSON.stringify({version,bytes:entries.reduce((s,e)=>s+e.bytes,0),entries})+';\n');
console.log(`${entries.length} files, ${(entries.reduce((s,e)=>s+e.bytes,0)/1048576).toFixed(1)} MB, ${version}`);

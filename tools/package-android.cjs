/* Only audited release resources are included, never editors or signing material. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'android-app/app/build/generated/gameAssets/game');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'offline-manifest.json'),'utf8'));
fs.mkdirSync(out,{recursive:true});
for(const entry of manifest.entries){
 const packaged=entry.url.replace('離島旅程-3d.png','island-vacation-3d.png');
 const source=path.resolve(root,entry.url),dest=path.resolve(out,packaged);
 if(!source.startsWith(root+path.sep)||!dest.startsWith(out+path.sep))throw Error('Invalid asset path');
 const bytes=fs.readFileSync(source);
 if(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16)!==entry.revision)throw Error('Regenerate offline manifest: '+entry.url);
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);
 if(packaged!==entry.url){const old=path.resolve(out,entry.url);if(old.startsWith(out+path.sep)&&fs.existsSync(old))fs.unlinkSync(old);}
}
console.log('Bundled '+manifest.entries.length+' assets ('+manifest.bytes+' bytes), version '+manifest.version);

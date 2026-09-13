/* Permanent completion stamps, shared by local saves and cloud merging. */
globalThis.CoastStamps=(()=>{
 const valid=v=>v&&typeof v.areaId==='string'&&typeof v.name==='string'&&Number.isFinite(v.earnedAt)&&v.earnedAt>0;
 function merge(a={},b={}){const out={};for(const v of [...Object.values(a||{}),...Object.values(b||{})]){if(!valid(v))continue;const old=out[v.areaId];if(!old||v.earnedAt<old.earnedAt||v.earnedAt===old.earnedAt&&JSON.stringify(v)<JSON.stringify(old))out[v.areaId]={...v};}return out;}
 function progress(area,fish,bag){const available=new Set((fish||[]).map(f=>f.id)),ids=[...new Set(area.fish||[])].filter(id=>available.has(id)),caught=new Set((bag||[]).map(f=>f.id));return {total:ids.length,caught:ids.filter(id=>caught.has(id)).length};}
 function award(config,save,now=Date.now()){
  const stamps=merge(save.regionStamps);let changed=false;
  for(const a of config.areas||[]){const p=progress(a,config.fish,save.bag);if(p.total&&p.caught===p.total&&!stamps[a.id]){stamps[a.id]={areaId:a.id,name:a.name,speciesCount:p.total,earnedAt:now};changed=true;}}
  return {stamps,changed};
 }
 return {merge,progress,award};
})();

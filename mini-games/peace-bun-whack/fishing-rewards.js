// The fishing edition uses level rewards; standalone/story scoring remains available.
const fishingParams=new URLSearchParams(location.search);
const fishingSession=fishingParams.get('fishingSession'),fishingParentOrigin=fishingParams.get('parentOrigin');
const fishingMode=parent!==window&&!!fishingSession&&/^https?:\/\//.test(fishingParentOrigin||'');
let fishingRun='',fishingLevels=[],fishingPending=null;
function configureFishingRewards(){
 config.levels=config.levels.slice(0,3).map((l,i)=>({...l,reward:(i+1)*100}));
 Object.assign(config.texts,{scoreLabel:'獎金',scoreUnit:'元',returnButton:'返回釣魚遊戲',returningButton:'正在保存獎金…',levelRewardText:'本關獎金 ${reward} · 共 ${score}。',successText:'三關完成！已獲得 ${score}，可以回去釣魚了。',helpText:'打平安包，避開蛋撻。過關獎金 $100／$200／$300。',startText:'打平安包，避開蛋撻。三關全過可獲得 $600！'});
 queueMicrotask(()=>{const penalty=document.querySelector('#tartPenalty');if(penalty)penalty.textContent='命中 −1';const copy=document.querySelector('.game-menu-card p');if(copy)copy.textContent='已通關的獎金會存入釣魚遊戲；未完成的關卡不會發放獎金。';});
}
function reportFishingReward(done=false){
 if(!fishingRun&&!done)return;
 fishingPending={type:'coastline-bun-result',session:fishingSession,run:fishingRun||'exit',levels:[...fishingLevels],complete:!!done};
 parent.postMessage(fishingPending,fishingParentOrigin);
}
addEventListener('message',e=>{
 const d=e.data;if(!fishingMode||e.source!==parent||e.origin!==fishingParentOrigin||d?.type!=='coastline-bun-ack'||d.session!==fishingSession||d.run!==fishingPending?.run)return;
 if(JSON.stringify(d.levels)===JSON.stringify(fishingPending.levels))fishingPending=null;
});
setInterval(()=>{if(fishingMode&&fishingPending)parent.postMessage(fishingPending,fishingParentOrigin);},1500);

'use strict';
const CoastMotion = (() => {
  const base=new Image(),hand=new Image();
  base.src=new URL('assets/motion/rod-base-v2.webp',document.baseURI).href;
  hand.src=new URL('assets/motion/reeling-hand.webp',document.baseURI).href;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let phase=2.3,velocity=0,clock=0;
  // Pre-render soft cloud texture once: no per-frame blur or pixel processing.
  const cloud=document.createElement('canvas');cloud.width=512;cloud.height=160;
  const c=cloud.getContext('2d');
  for(let i=0;i<55;i++){const x=35+(i*83.71)%440,y=63+Math.sin(i*2.399)*26,r=20+(i*13)%40;
    const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(225,236,238,.28)');g.addColorStop(1,'rgba(225,236,238,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
  function update(dt,reeling,paused){if(paused)return;clock+=dt;const target=reeling?5.8:0;velocity+=(target-velocity)*(1-Math.exp(-dt*14));if(velocity<.002&&!reeling)velocity=0;phase=(phase+velocity*dt)%(Math.PI*2);}
  function draw(rig){
    if(!base.complete||!base.naturalWidth||!hand.complete||!hand.naturalWidth)return false;
    rig.drawImage(base,-370,-690,480,720);
    // Axle position measured in the base sprite, crank and hand share one endpoint.
    const ax=-136,ay=-146,p=phase,x=ax-23+Math.cos(p)*33,y=ay+Math.sin(p)*23;
    rig.save();rig.lineCap='round';rig.lineJoin='round';
    rig.beginPath();rig.moveTo(ax,ay);rig.lineTo(ax-16,ay+4);rig.lineTo(x,y);rig.strokeStyle='#132837';rig.lineWidth=8;rig.stroke();rig.strokeStyle='#9db7c7';rig.lineWidth=4;rig.stroke();
    rig.beginPath();rig.ellipse(ax,ay,7,12,-.3,0,Math.PI*2);rig.fillStyle='#182e3e';rig.fill();rig.strokeStyle='#a8bec8';rig.lineWidth=2;rig.stroke();
    // Rotor highlights orbit the spool without rotating the fixed reel body.
    if(velocity>.05){rig.strokeStyle='rgba(215,237,238,.65)';rig.lineWidth=1.8;rig.beginPath();rig.ellipse(-117,-217,27,9,-.22,phase*4,phase*4+2.2);rig.stroke();}
    rig.translate(x,y);rig.rotate(Math.sin(p)*.07);const scale=1+Math.sin(p)*.035;rig.scale(scale,scale);
    rig.drawImage(hand,-.77*260,-.20*260,260,260);rig.restore();return true;
  }
  function atmosphere(ctx,conditions){
    const t=reduced.matches?0:clock;
    ctx.save();
    if(conditions?.night){ctx.fillStyle='rgba(5,20,51,.22)';ctx.fillRect(0,0,1280,720);}
    if(conditions?.cloud||conditions?.rain){ctx.fillStyle='rgba(21,39,51,.15)';ctx.fillRect(0,0,1280,720);}
    ctx.save();ctx.beginPath();ctx.rect(0,0,1280,250);ctx.clip();
    for(let i=0;i<5;i++){const x=((i*347+t*(conditions?.wind?24:13))%1770)-450,y=10+(i*43)%120;ctx.globalAlpha=conditions?.cloud ? .85 : .65;ctx.drawImage(cloud,x,y,620,145);}
    ctx.restore();
    if(conditions?.rain&&!reduced.matches){ctx.strokeStyle='rgba(190,219,229,.18)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<80;i++){const y=((i*101+t*330)%730),x=(i*197-y*.22)%1320;ctx.moveTo(x,y);ctx.lineTo(x-5,y+16);}ctx.stroke();}
    ctx.restore();
  }
  function waves(ctx){const t=reduced.matches?0:clock;ctx.save();ctx.beginPath();ctx.rect(290,332,850,245);ctx.clip();
    for(let i=0;i<96;i++){const depth=(i%16)/16,y=340+depth*224+Math.sin(t*1.2+i)*6,x=300+(i*137)%820+Math.sin(t*.65+i)*32;
      const length=10+depth*35,alpha=.10+depth*.10+Math.sin(t*1.6+i)*.05;
      ctx.strokeStyle=`rgba(210,238,231,${alpha})`;ctx.lineWidth=1+depth*1.2;ctx.beginPath();ctx.moveTo(x-length,y);ctx.bezierCurveTo(x-length*.3,y-2-depth*2,x+length*.3,y+1,x+length,y);ctx.stroke();}
    ctx.restore();}
  return {update,draw,atmosphere,waves,get phase(){return phase},get velocity(){return velocity},get clock(){return clock},get reduced(){return reduced.matches}};
})();

function updateSeaLife(dt){
  for(const f of school){
    const feeding=f===selected&&['wait','nibble','hook'].includes(state);
    let desiredSpeed=f.speed*(.65+.25*Math.sin(time*.65+f.phase*.15));
    if(feeding){
      const head=18*f.size,dx=bait.x-f.x,dy=bait.y-f.y,d=Math.hypot(dx,dy);
      f.desired=d>head?Math.atan2(dy,dx):f.angle;
      desiredSpeed=clamp((d-head)*.75,0,32)*clamp(+weather.bite||1,.7,1.4);
      if(state==='wait'&&d<head+12&&stateTime>1.5){nibble=0;enter('nibble');}
      if(state==='nibble'){desiredSpeed=Math.sin(stateTime*5)>0?2.8:0;if(stateTime>3){enter('hook');ring(bait.x,bait.y);}}
      if(state==='hook')desiredSpeed=1;
    }else if(f===selected&&state==='fight'){
      f.desired=Math.atan2(bait.y-f.y,bait.x-f.x);desiredSpeed=Math.min(44,Math.hypot(bait.x-f.x,bait.y-f.y)*1.8);
    }else{
      f.turn-=dt;if(f.turn<=0){f.desired+=rand(-.65,.65);f.turn=rand(2.5,6);}
      // Soft shore avoidance and separation; no teleporting or instantaneous turns.
      let vx=Math.cos(f.desired),vy=Math.sin(f.desired);
      vx+=Math.max(0,355-f.x)*.025-Math.max(0,f.x-1035)*.025;
      vy+=Math.max(0,365-f.y)*.045-Math.max(0,f.y-520)*.045;
      for(const other of school){if(other===f)continue;const dx=f.x-other.x,dy=f.y-other.y,d=Math.hypot(dx,dy);if(d>0&&d<48){vx+=dx/d*(48-d)*.025;vy+=dy/d*(48-d)*.025;}}
      f.desired=Math.atan2(vy,vx);
    }
    const delta=Math.atan2(Math.sin(f.desired-f.angle),Math.cos(f.desired-f.angle));
    f.bend=clamp(delta,-1,1);f.angle+=clamp(delta,-dt*1.15,dt*1.15);
    f.actualSpeed=(f.actualSpeed??f.speed)+(desiredSpeed-(f.actualSpeed??f.speed))*(1-Math.exp(-dt*2.5));
    f.x+=Math.cos(f.angle)*f.actualSpeed*dt;f.y+=Math.sin(f.angle)*f.actualSpeed*dt*.68;
    f.phase+=dt*(1.6+f.actualSpeed*.16);f.feeding=feeding;
  }
}
function drawNaturalFish(f){
  ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);
  const depth=clamp((f.y-320)/230,.1,1);const size=fishSize(f.species).type,scale=size==='large'?1.35:size==='small'?.65:1;ctx.scale(scale*f.size*(.55+depth*.5),scale*f.size*(.55+depth*.5)*.62);
  ctx.fillStyle=size==='large'?`rgba(190,39,31,${.5+depth*.2})`:`rgba(3,29,34,${.13+depth*.18})`;
  const spine=x=>Math.sin(f.phase-(30-x)*.055)*Math.pow((30-x)/75,1.7)*5+(f.bend||0)*Math.pow((30-x)/75,2)*6;
  ctx.beginPath();ctx.moveTo(30,0);
  for(let side=-1;side<=1;side+=2){for(let i=0;i<=14;i++){const u=side<0?i/14:1-i/14,x=30-u*63,width=Math.sin(Math.PI*u)*10.5*(1-u*.45);ctx.lineTo(x,spine(x)+width*side);}}
  ctx.closePath();ctx.fill();
  const tail=spine(-43);ctx.beginPath();ctx.moveTo(-29,spine(-29));ctx.lineTo(-48,tail-10);ctx.quadraticCurveTo(-43,tail,-48,tail+10);ctx.closePath();ctx.fill();
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(10,s*6);ctx.quadraticCurveTo(1,s*(17+Math.sin(f.phase*.7)*2),-7,s*12);ctx.lineTo(0,s*6);ctx.fill();}
  if(f.feeding){ctx.fillStyle='rgba(167,206,204,.12)';ctx.beginPath();ctx.ellipse(28,0,1.5+Math.max(0,Math.sin(time*5))*1.5,2,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

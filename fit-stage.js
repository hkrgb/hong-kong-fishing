(function(){
  var W=1000,H=562;
  function fit(){
    var el=document.getElementById('game');
    if(!el) return;
    var vw=window.innerWidth||document.documentElement.clientWidth;
    var vh=window.innerHeight||document.documentElement.clientHeight;
    var s=Math.min(vw/W, vh/H);
    var x=(vw-W*s)/2;
    var y=(vh-H*s)/2;
    el.style.position='absolute';
    el.style.left='0';
    el.style.top='0';
    el.style.transformOrigin='0 0';
    el.style.transform='translate('+x+'px,'+y+'px) scale('+s+')';
  }
  window.addEventListener('resize',fit);
  window.addEventListener('orientationchange',fit);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fit);
  else fit();
})();

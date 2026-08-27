(function(){
  var W=1600,H=900;
  function fit(){
    var el=document.getElementById('game');
    if(!el) return;
    var s=Math.min(window.innerWidth/W, window.innerHeight/H);
    el.style.transform='scale('+s+')';
  }
  window.addEventListener('resize',fit);
  window.addEventListener('orientationchange',fit);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fit);
  else fit();
})();

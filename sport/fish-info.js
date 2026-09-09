function openFishInfo(f){
 if(document.getElementById('fishInfoOverlay'))return;
 const entry=FishEducation[f.id],custom=String(f.educationIntro||'').trim();
 const pages=custom?custom.match(/[\s\S]{1,170}/g):(entry?.paragraphs||['這種魚的簡介尚未加入，可由後台補充。']);let page=0;
 const focus=document.activeElement,overlay=document.createElement('div');overlay.id='fishInfoOverlay';
 overlay.innerHTML='<section class="fishInfoPanel" role="dialog" aria-modal="true" aria-labelledby="fishInfoTitle"><header><h2 id="fishInfoTitle"></h2><button aria-label="關閉魚類資料">×</button></header><p id="fishInfoText"></p><footer><button id="infoPrevious">上一頁</button><span id="infoPage"></span><button id="infoNext">下一頁</button></footer><a id="fishInfoSource" target="_blank" rel="noopener noreferrer">參考：漁護署歷史魚類名錄 ↗</a></section>';
 document.querySelector('.dialog').append(overlay);const panel=overlay.firstChild,close=panel.querySelector('header button');
 function done(){overlay.remove();document.removeEventListener('keydown',keys,true);if(focus?.isConnected)focus.focus();}
 const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();done();}if(e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();const all=[...panel.querySelectorAll('button:not(:disabled),a[href]')],i=all.indexOf(document.activeElement);all[(i+(e.shiftKey?-1:1)+all.length)%all.length].focus();}};
 function render(){panel.querySelector('h2').textContent=f.name+' · 小知識';panel.querySelector('p').textContent=pages[page];document.getElementById('infoPage').textContent=(page+1)+' / '+pages.length;document.getElementById('infoPrevious').disabled=page===0;document.getElementById('infoNext').disabled=page===pages.length-1;}
 close.onclick=done;document.getElementById('infoPrevious').onclick=()=>{page--;render()};document.getElementById('infoNext').onclick=()=>{page++;render()};
 const link=document.getElementById('fishInfoSource');link.href='https://www.afcd.gov.hk/english/fisheries/ar/files/ar_fish_list.pdf';
 document.addEventListener('keydown',keys,true);render();close.focus();
}
new MutationObserver(()=>{
 const identity=document.querySelector('.fishIdentity[data-fish-id]'),existing=document.getElementById('fishInfoButton');
 if(!identity){existing?.remove();return;}
 const button=existing||document.createElement('button');button.id='fishInfoButton';button.type='button';button.textContent='ⓘ';button.setAttribute('aria-label','查看魚類資料');button.title='魚類資料';
 button.onclick=()=>{const f=cfg.fish.find(f=>f.id===identity.dataset.fishId);if(f)openFishInfo(f)};
 if(!existing)document.getElementById('closeModal').before(button);
}).observe(document.getElementById('modalBody'),{childList:true,subtree:true});

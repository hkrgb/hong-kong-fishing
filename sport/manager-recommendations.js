/* Independent books and media catalogues; the supplied book copy stays unchanged. */
const ManagerMedia=[
 {id:'a7WQss1TqI0',title:'《離島旅程——一趟關於迷失與重新出發的長洲之旅》'},
 {id:'YKiMrg6rgYQ',title:'五月天〈頑固 Tough〉Official Music Video'},
 {id:'jBUrsbRQvGY',title:'AI MV〈天地之間〉'},
 {id:'7z1dYHFqsTo',title:'平井堅〈アイシテル〉MUSIC VIDEO'}
];
let managerBookSize='small';
try{const value=localStorage.getItem('manager-book-text-size');if(['small','medium','large'].includes(value))managerBookSize=value;}catch{}
const managerBaseModal=modal;
modal=function(...args){managerBaseModal(...args);document.querySelector('.dialog').classList.remove('managerDialog','managerBooks','managerBookInfo','managerMedia');};
function managerShell(view,content){
 modal('店長推介','<nav class="managerTabs" aria-label="店長推介分類"><button id="managerBooks" aria-pressed="'+(view!=='media')+'">書籍</button><button id="managerMedia" aria-pressed="'+(view==='media')+'">多媒體</button><button id="managerBack">返回書店</button></nav><section class="managerContent">'+content+'</section>');
 const dialog=document.querySelector('.dialog');dialog.classList.add('managerDialog',view==='media'?'managerMedia':view==='detail'?'managerBookInfo':'managerBooks');
 $('managerBooks').onclick=()=>showBookshelf();$('managerMedia').onclick=()=>showManagerMedia();$('managerBack').onclick=showBookshop;
}
function managerPages(page,pages,select,unit='頁'){
 const prev=foot('◀',()=>select(page-1));prev.disabled=page===0;prev.setAttribute('aria-label','上一'+unit);
 const label=document.createElement('span');label.className='managerPageCount';label.textContent=(page+1)+' / '+pages;label.setAttribute('aria-live','polite');$('modalFooter').append(label);
 const next=foot('▶',()=>select(page+1));next.disabled=page===pages-1;next.setAttribute('aria-label','下一'+unit);
}
function showBookshelf(page=0){
 const books=bookshopData().books,pages=Math.max(1,Math.ceil(books.length/8));page=clamp(page,0,pages-1);
 managerShell('books','<div class="managerShelf">'+books.slice(page*8,page*8+8).map((b,i)=>'<button class="shelfBook" data-book="'+(page*8+i)+'" aria-label="閱讀《'+esc(b.name)+'》"><img src="'+esc(bookAsset(b.image))+'" alt="'+esc(b.name)+'"></button>').join('')+'</div>');
 document.querySelectorAll('.shelfBook').forEach(b=>b.onclick=()=>showBooks(Number(b.dataset.book)));
 managerPages(page,pages,showBookshelf);
}
function showBooks(index=-1){
 if(index<0){showBookshelf();return;}const books=bookshopData().books;index=clamp(index,0,books.length-1);const b=books[index];if(!b){showBookshelf();return;}
 managerShell('detail','<div class="managerFontControls" role="group" aria-label="內文字體大小"><span>字體</span>'+[['small','小'],['medium','中'],['large','大']].map(([size,label])=>'<button data-size="'+size+'" aria-label="'+label+'字體" aria-pressed="'+(managerBookSize===size)+'">'+label+'</button>').join('')+'</div><div class="managerBookLayout"><img class="bookCover" src="'+esc(bookAsset(b.image))+'" alt="'+esc(b.name)+'書籍封面"><article class="bookCopy" data-size="'+managerBookSize+'" tabindex="0" aria-label="'+esc(b.name)+'介紹，可向下捲動"><h2>'+esc(b.name)+'</h2>'+(b.subtitle?'<h3>'+esc(b.subtitle)+'</h3>':'')+String(b.description||'').split('\n').filter(Boolean).map(t=>'<p>'+esc(t)+'</p>').join('')+'</article></div>');
 document.querySelectorAll('.managerFontControls button').forEach(button=>button.onclick=()=>{managerBookSize=button.dataset.size;document.querySelector('.bookCopy').dataset.size=managerBookSize;document.querySelectorAll('.managerFontControls button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));try{localStorage.setItem('manager-book-text-size',managerBookSize);}catch{}});
 const back=foot('‹ 返回書架',()=>showBookshelf(Math.floor(index/8)));back.className='managerShelfBack';
 managerPages(index,books.length,showBooks,'本');
}
function managerVideoUrl(id){return 'https://www.youtube-nocookie.com/embed/'+id+'?playsinline=1&rel=0&origin='+encodeURIComponent(location.origin);}
function showManagerMedia(page=0){
 page=clamp(page,0,ManagerMedia.length-1);const video=ManagerMedia[page],online=navigator.onLine;
 managerShell('media','<button id="managerMediaExpand" aria-label="全屏觀看影片"'+(!online?' disabled':'')+'><img src="'+esc(bookAsset('manager-1003/yt-icon.png'))+'" alt=""><span>全屏觀看</span></button><div class="managerTV"><div id="managerPlayer">'+(online?'<iframe title="'+esc(video.title)+'" src="'+managerVideoUrl(video.id)+'" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>':'<p class="managerOffline">影片需要網絡連線。<br>書籍介紹及主遊戲可離線使用。</p>')+'<button id="managerMediaCollapse" aria-label="返回電視畫面">×</button></div></div><div class="managerVideoCaption"><b>'+esc(video.title)+'</b><a href="https://www.youtube.com/watch?v='+video.id+'" target="_blank" rel="noopener">在 YouTube 開啟 ↗</a></div>');
 managerPages(page,ManagerMedia.length,showManagerMedia);
 $('managerMediaExpand').onclick=expandManagerVideo;
 $('managerMediaCollapse').onclick=()=>{if(document.fullscreenElement===$('managerPlayer'))document.exitFullscreen().catch(()=>{});};
}
async function expandManagerVideo(){
 const player=$('managerPlayer');if(!player?.querySelector('iframe'))return;
 try{if(player.requestFullscreen){await player.requestFullscreen();return;}}catch{}
 // Browsers without element fullscreen still offer a screen-filling, black-backed player.
 const layer=document.createElement('div');layer.className='managerVideoFallback';layer.setAttribute('role','dialog');layer.setAttribute('aria-label','全屏觀看影片');const frame=player.querySelector('iframe').cloneNode();layer.append(frame);const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','返回電視畫面');layer.append(close);const previous=player.querySelector('iframe').src;player.querySelector('iframe').src='about:blank';document.body.append(layer);const finish=()=>{layer.remove();if(player.isConnected)player.querySelector('iframe').src=previous;document.removeEventListener('keydown',onKey,true);$('managerMediaExpand')?.focus();};const onKey=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();finish();}};close.onclick=finish;document.addEventListener('keydown',onKey,true);close.focus();
}

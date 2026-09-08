function showJournal(tab='journey'){
 const groups={journey:{name:'出海行程',items:[['選擇釣區','探索已解鎖的海岸',()=>showAreas()],['海釣賽事','參賽與挑戰',()=>showCups()],['天氣資料','氣溫、水溫及觀測來源',()=>$('weatherInfo').click()]]},collection:{name:'魚獲收藏',items:[['魚獲手帳','查看每一次收穫',()=>showBag()],['魚類圖鑑','發現與收集魚種',()=>showCatalog()],['榮譽獎章','回顧釣魚成就',()=>showMedals()]]},shop:{name:'海港商街',items:[['釣具店','購買及選用魚餌',showTackle],['海鮮檔','出售魚獲賺取金錢',()=>showMarket()]]},settings:{name:'遊戲設定',items:[['全屏幕','16:9 畫面・黑邊留白',()=>toggleFullscreen()],['玩法說明','拋竿、揚竿與收絲',showHelp],['返回主畫面','結束本次拋竿及比賽',()=>journalConfirm(false)],['離開遊戲','保存後離開',()=>journalConfirm(true)]]}};
 const current=groups[tab]||groups.journey;
 modal('釣魚手帳','<div class="journalBook"><div class="journalTabs" role="group" aria-label="手帳分類"></div><div class="journalPage"><h3>'+current.name+'</h3><div class="journalItems"></div></div></div>');
 document.querySelector('.dialog').classList.add('journalDialog');
 $('modalKicker').textContent='海岸生活誌';
 for(const [key,group] of Object.entries(groups)){const b=document.createElement('button');b.textContent=group.name;b.setAttribute('aria-pressed',String(key===tab));b.onclick=()=>showJournal(key);document.querySelector('.journalTabs').append(b);}
 for(const [title,desc,fn] of current.items){const b=document.createElement('button');b.className='journalItem';b.innerHTML='<b>'+title+'</b><span>'+desc+'</span><i aria-hidden="true">›</i>';b.onclick=fn;document.querySelector('.journalItems').append(b);}
 const w=wallet(),s=document.createElement('p');s.className='journalWallet';s.textContent='$'+w.money+' · '+baitNames[equippedBait]+' ×'+w.bait[equippedBait];$('modalFooter').append(s);foot('繼續釣魚',closeDialog,true);
}
function journalConfirm(exit){modal(exit?'離開遊戲？':'返回主畫面？','<p class="intro">魚獲已保存。'+(exit?'':'正在進行的拋竿及比賽會結束。')+'</p>',()=>{if(exit){persist();if(parent!==window)report(true);else showHome();}else showHome();},'確定',true);foot('取消',()=>showJournal('settings'));}

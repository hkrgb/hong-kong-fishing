// Classifications are independent of caught weight, rarity and game difficulty.
const verifiedSizes={
 'Scomber japonicus':{type:'medium',note:'FishBase 常見體長 30 cm FL；屬遊戲中型級別。',source:'https://www.fishbase.se/summary/Scomber-japonicus.html'},
 'Fistularia commersonii':{type:'large',note:'FishBase 常見體長 100 cm TL。',source:'https://www.fishbase.se/summary/Fistularia-commersonii.html'},
 'Mugil cephalus':{type:'medium',note:'FishBase 常見體長 50 cm SL；非香港成年魚平均值。',source:'https://www.fishbase.se/summary/Mugil-cephalus'},
 'Seriola dumerili':{type:'large',note:'FishBase 常見體長 100 cm TL。',source:'https://www.fishbase.se/summary/seriola-dumerili'},
 'Ambassis gymnocephalus':{type:'small',note:'FishBase 最大體長亦只有 16 cm TL，可確定屬小型；未把最大值當典型體長。',source:'https://www.fishbase.se/summary/4806'}
};
function fishSize(f){const current=cfg.fish.find(v=>v.id===f.id)||f;const n=Number(current.adultLengthCm);if(n>0&&n<2000&&current.sizeSource)return {type:n<30?'small':n<80?'medium':'large',note:'管理員提供成年參考體長：'+n+' cm。',source:current.sizeSource};return verifiedSizes[current.scientificName]||{type:'unknown',note:'成年體型資料待核實，沒有用遊戲重量推算。'};}
function sizeBadge(f){const s=fishSize(f);return '<span class="sizeBadge '+s.type+'">'+({small:'小型魚',medium:'中型魚',large:'大型魚',unknown:'體型待核實'}[s.type])+'</span>';}
function hasCaught(f){return save.bag.some(c=>c.id===f.id);}
function unknownFish(){return '<div class="unknownFish" role="img" aria-label="未解鎖魚類剪影"><svg viewBox="0 0 180 90" aria-hidden="true"><path d="M145 45C122 12 64 12 42 39L14 21 23 45 14 69 42 51C64 78 122 78 145 45Z"/></svg></div>';}
function sizeDetail(f){const s=fishSize(f);let link='';try{const u=new URL(s.source);if(u.protocol==='https:')link='<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">體型資料來源</a>';}catch{}return sizeBadge(f)+'<p class="sizeNote">'+esc(s.note)+' '+link+'</p>';}

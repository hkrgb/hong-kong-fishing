// Browser-only A4 catalogue. Raster pages preserve Chinese fonts on all PDF readers.
export function buildPdf(pages){
 const enc=new TextEncoder(),chunks=[],offsets=[0];let size=0;
 const add=v=>{const b=typeof v==='string'?enc.encode(v):v;chunks.push(b);size+=b.length;};
 const obj=(id,body)=>{offsets[id]=size;add(id+' 0 obj\n');body();add('\nendobj\n');};
 add('%PDF-1.4\n');
 obj(1,()=>add('<< /Type /Catalog /Pages 2 0 R >>'));
 obj(2,()=>add('<< /Type /Pages /Count '+pages.length+' /Kids ['+pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>'));
 pages.forEach((p,i)=>{const id=3+i*3;
  obj(id,()=>add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.275591 841.889764] /Resources << /XObject << /Im '+(id+1)+' 0 R >> >> /Contents '+(id+2)+' 0 R >>'));
  obj(id+1,()=>{add('<< /Type /XObject /Subtype /Image /Width '+p.width+' /Height '+p.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+p.bytes.length+' >>\nstream\n');add(p.bytes);add('\nendstream');});
  const content='q 595.275591 0 0 841.889764 0 0 cm /Im Do Q';
  obj(id+2,()=>add('<< /Length '+enc.encode(content).length+' >>\nstream\n'+content+'\nendstream'));
 });
 const xref=size;add('xref\n0 '+offsets.length+'\n0000000000 65535 f \n');
 for(const offset of offsets.slice(1))add(String(offset).padStart(10,'0')+' 00000 n \n');
 add('trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');return new Blob(chunks,{type:'application/pdf'});
}
function picture(path){return new Promise(resolve=>{const img=new Image();img.crossOrigin='anonymous';const timer=setTimeout(()=>resolve(null),12000);img.onload=()=>{clearTimeout(timer);resolve(img)};img.onerror=()=>{clearTimeout(timer);resolve(null)};try{const url=new URL(globalThis.FishImagePath?.(path)||path,document.baseURI);if(!['http:','https:'].includes(url.protocol))throw Error('url');img.src=url.href;}catch{clearTimeout(timer);resolve(null)}});}
export async function createCatalog(fish,progress=()=>{}){
 if(!fish.length)throw Error('魚庫沒有魚類');
 await document.fonts.ready;
 const pages=[],missing=[];const W=2480,H=3508,margin=118,gap=20,top=230,cw=(W-margin*2-gap*3)/4,ch=480;
 for(let page=0;page<Math.ceil(fish.length/24);page++){
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#123540';ctx.font='bold 64px "Microsoft JhengHei", sans-serif';ctx.fillText('魚類目錄',margin,125);
  ctx.font='30px sans-serif';ctx.fillStyle='#52666b';ctx.fillText('A4 · 4 × 6 · '+fish.length+' 種',margin,180);
  const batch=fish.slice(page*24,page*24+24),images=await Promise.all(batch.map(f=>picture(f.image)));
  batch.forEach((f,i)=>{const x=margin+(i%4)*(cw+gap),y=top+Math.floor(i/4)*(ch+gap);ctx.fillStyle='#f2f6f6';ctx.fillRect(x,y,cw,ch);ctx.strokeStyle='#ccd7d9';ctx.lineWidth=2;ctx.strokeRect(x,y,cw,ch);
   const img=images[i];if(img){const scale=Math.min((cw-36)/img.naturalWidth,(ch-110)/img.naturalHeight);ctx.drawImage(img,x+(cw-img.naturalWidth*scale)/2,y+12+(ch-110-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);}else{missing.push(f.name);ctx.fillStyle='#65797e';ctx.font='32px sans-serif';ctx.textAlign='center';ctx.fillText('圖片未能載入',x+cw/2,y+ch/2);}
   ctx.fillStyle='#123540';ctx.textAlign='center';let font=40;const name=String(f.name||'未命名');do{ctx.font='bold '+font+'px "Microsoft JhengHei", sans-serif';if(ctx.measureText(name).width<=cw-30)break;font--;}while(font>20);ctx.fillText(name,x+cw/2,y+ch-40,cw-30);ctx.textAlign='left';
  });
  ctx.fillStyle='#52666b';ctx.textAlign='center';ctx.font='30px sans-serif';ctx.fillText((page+1)+' / '+Math.ceil(fish.length/24),W/2,H-80);ctx.textAlign='left';
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.94));if(!blob)throw Error('無法建立 PDF 圖片');pages.push({width:W,height:H,bytes:new Uint8Array(await blob.arrayBuffer())});canvas.width=1;canvas.height=1;progress(page+1,Math.ceil(fish.length/24));
 }
 return {blob:buildPdf(pages),missing};
}
export function mountCatalog(get){
 if(document.getElementById('downloadFishPdf'))return;
 const button=document.createElement('button');button.type='button';button.id='downloadFishPdf';button.textContent='下載魚類目錄 PDF（A4・4 × 6）';
 const status=document.createElement('p');status.setAttribute('role','status');document.getElementById('fish').before(button,status);
 button.onclick=async()=>{button.disabled=true;status.textContent='正在載入縮圖及製作 PDF…';try{const {blob,missing}=await createCatalog(structuredClone(get().fish),(n,total)=>status.textContent='正在製作 PDF：'+n+' / '+total+' 頁');const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='fish-catalog-A4-'+new Date().toISOString().slice(0,10)+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent=missing.length?'PDF 已下載；以下圖片未能載入（可能不允許跨網站存取）：'+missing.join('、'):'PDF 已下載。列印時選擇 A4、實際大小／100%。';}catch(e){status.textContent='未能製作 PDF：'+e.message;}finally{button.disabled=false;}};
}

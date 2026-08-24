/* Wirello Market — stable chart renderer v2.
   Clean analytical curves for the Wirello demo: real series, adaptive scale,
   no dense daily markers and no global SVG mutation. */
(function(){
'use strict';
if(window.__WIRELLO_CURVES_STABLE_V2)return;window.__WIRELLO_CURVES_STABLE_V2=true;
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
let seq=0;
function wrap(api){
 if(!api||api.__wirelloStableV2)return api;
 const originalDraw=typeof api.draw==='function'?api.draw.bind(api):null;
 const originalSeries=typeof api.series==='function'?api.series.bind(api):null;
 function draw(key,opt={}){
  try{
   const wirello=document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
   if(!wirello||!originalSeries)return originalDraw?originalDraw(key,opt):'';
   const rows=(originalSeries(key)||[]).map(x=>({date:String(x.date||''),value:N(x.value)})).filter(x=>x.value!==null);
   const compact=!!opt.compact;
   if(rows.length<2)return `<div class="${compact?'scan':'ov-no-data'}">Няма достатъчно стойности за тенденция.</div>`;
   const w=compact?220:(opt.width||720),h=compact?54:(opt.height||240),l=compact?4:24,r=compact?4:18,t=compact?5:16,b=compact?5:32,color=opt.color||'#1766e8';
   const vals=rows.map(x=>x.value),lo0=Math.min(...vals),hi0=Math.max(...vals),spread=Math.max(1,hi0-lo0),pad=Math.max(.8,spread*.24),min=Math.max(0,lo0-pad),max=Math.min(100,hi0+pad),span=Math.max(1,max-min);
   const X=i=>l+(w-l-r)*(i/(rows.length-1)),Y=v=>t+(h-t-b)*(1-(v-min)/span),pts=rows.map((x,i)=>[X(i),Y(x.value)]);
   let path=`M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
   for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2,c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;path+=` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`}
   const id=`wirelloCurve${++seq}`;
   const grid=compact?'':[t+8,(t+h-b)/2,h-b].map(y=>`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e5ebf1" stroke-width="1"/>`).join('');
   const area=compact?'':`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity=".02"/></linearGradient></defs><path d="${path} L ${pts.at(-1)[0]} ${h-b} L ${pts[0][0]} ${h-b} Z" fill="url(#${id})"/>`;
   const labels=compact?'':(()=>{const idx=[0,Math.round((rows.length-1)*.2),Math.round((rows.length-1)*.4),Math.round((rows.length-1)*.6),Math.round((rows.length-1)*.8),rows.length-1];return [...new Set(idx)].map(i=>`<text x="${X(i)}" y="${h-8}" text-anchor="middle" font-size="9" fill="#6f8092">${E((rows[i].date||'').slice(5).split('-').reverse().join('.'))}</text>`).join('')})();
   return `<svg class="wirello-stable-curve" data-curve-key="${E(key)}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Тенденция ${E(key)}">${grid}${area}<path d="${path}" fill="none" stroke="${color}" stroke-width="${compact?2.1:2.8}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${labels}</svg>`;
  }catch(e){return originalDraw?originalDraw(key,opt):''}
 }
 const out=Object.assign({},api,{draw});
 Object.defineProperty(out,'__wirelloStableV2',{value:true});
 return out;
}
let stored=window.BLISCurves;
try{Object.defineProperty(window,'BLISCurves',{configurable:true,get(){return stored},set(v){stored=wrap(v)}});if(stored)stored=wrap(stored)}catch(e){const timer=setInterval(()=>{if(window.BLISCurves&&!window.BLISCurves.__wirelloStableV2){window.BLISCurves=wrap(window.BLISCurves);clearInterval(timer)}},50);setTimeout(()=>clearInterval(timer),5000)}
})();

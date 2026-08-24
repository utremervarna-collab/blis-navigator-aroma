/* Wirello Market — stable chart renderer v1
   Replaces only BLISCurves.draw for the Wirello demo. */
(function(){
'use strict';
if(window.__WIRELLO_CURVES_STABLE_V1)return;window.__WIRELLO_CURVES_STABLE_V1=true;
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const fmt=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
let seq=0;
function wrap(api){
 if(!api||api.__wirelloStable)return api;
 const originalDraw=typeof api.draw==='function'?api.draw.bind(api):null;
 const originalSeries=typeof api.series==='function'?api.series.bind(api):null;
 function draw(key,opt={}){
  try{
   const isWirello=document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
   if(!isWirello||!originalSeries)return originalDraw?originalDraw(key,opt):'';
   const rows=(originalSeries(key)||[]).map(x=>({date:String(x.date||''),value:N(x.value)})).filter(x=>x.value!=null);
   const compact=!!opt.compact;
   if(rows.length<2)return `<div class="${compact?'scan':'ov-no-data'}">Няма достатъчно стойности за тенденция.</div>`;
   const w=compact?220:(opt.width||720),h=compact?54:(opt.height||240);
   const l=compact?5:48,r=compact?5:18,t=compact?6:18,b=compact?6:38;
   const color=opt.color||'#1766e8';
   const vals=rows.map(x=>x.value);
   let min,max;
   if(compact){
     const lo=Math.min(...vals),hi=Math.max(...vals),spread=Math.max(1,hi-lo),pad=Math.max(.8,spread*.18);
     min=Math.max(0,lo-pad);max=Math.min(100,hi+pad);
   }else{min=0;max=100;}
   const span=Math.max(1,max-min);
   const X=i=>l+(w-l-r)*(i/(rows.length-1));
   const Y=v=>t+(h-t-b)*(1-(v-min)/span);
   const pts=rows.map((x,i)=>[X(i),Y(x.value)]);
   const path=pts.map((p,i)=>`${i?'L':'M'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
   const id=`wirelloCurve${++seq}`;
   const grid=compact?'':[0,25,50,75,100].map(v=>{const y=Y(v);return `<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e5ebf1" stroke-width="1"/><text x="${l-9}" y="${y+4}" text-anchor="end" font-size="10" fill="#6f8092">${v}</text>`}).join('');
   const axis=compact?'':`<line x1="${l}" y1="${t}" x2="${l}" y2="${h-b}" stroke="#b7c3cf" stroke-width="1"/><line x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}" stroke="#b7c3cf" stroke-width="1"/>`;
   const area=compact?'':`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".16"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${path} L ${pts[pts.length-1][0]} ${h-b} L ${pts[0][0]} ${h-b} Z" fill="url(#${id})"/>`;
   const dots=compact?'':pts.map((p,i)=>`<circle class="blis-curve-point" data-chart-key="${E(key)}" data-chart-date="${E(rows[i].date)}" data-chart-value="${E(rows[i].value)}" cx="${p[0]}" cy="${p[1]}" r="3.4" fill="${color}" stroke="#fff" stroke-width="1.3"><title>${E(rows[i].date)} · ${fmt(rows[i].value)}/100</title></circle>`).join('');
   const labels=compact?'':(()=>{const step=Math.max(1,Math.ceil(rows.length/6));return rows.map((x,i)=>(i%step===0||i===rows.length-1)?`<text x="${X(i)}" y="${h-12}" text-anchor="middle" font-size="10" fill="#6f8092">${E((x.date||'').slice(5).split('-').reverse().join('.'))}</text>`:'').join('')})();
   return `<svg class="wirello-stable-curve" data-curve-key="${E(key)}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Тенденция ${E(key)}">${grid}${axis}${area}<path d="${path}" fill="none" stroke="${color}" stroke-width="${compact?2.2:2.6}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${dots}${labels}</svg>`;
  }catch(e){return originalDraw?originalDraw(key,opt):''}
 }
 const out=Object.assign({},api,{draw});
 Object.defineProperty(out,'__wirelloStable',{value:true});
 return out;
}
let stored=window.BLISCurves;
try{
 Object.defineProperty(window,'BLISCurves',{configurable:true,get(){return stored},set(v){stored=wrap(v)}});
 if(stored)stored=wrap(stored);
}catch(e){
 const timer=setInterval(()=>{if(window.BLISCurves&&!window.BLISCurves.__wirelloStable){window.BLISCurves=wrap(window.BLISCurves);clearInterval(timer)}},50);
 setTimeout(()=>clearInterval(timer),5000);
}
})();
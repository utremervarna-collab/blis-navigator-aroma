/* BLIS Navigator — canonical daily BLIS trend v5.
   Uses only recorded daily measurements. No synthetic points or front-end index invention.
   Purpose: visibly truthful day-to-day curve + overlap-safe chart footer. */
(function(){
'use strict';
if(window.__BLIS_DAILY_TREND_V5)return;window.__BLIS_DAILY_TREND_V5=true;

const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const fmt=v=>Number(v).toLocaleString('bg-BG',{minimumFractionDigits:Number(v)%1?1:0,maximumFractionDigits:1});
const dateLabel=d=>{const p=String(d||'').slice(0,10).split('-');return p.length===3?`${p[2]}.${p[1]}`:String(d||'')};

function series(){
  let rows=[];
  try{rows=window.BLISCurves?.series?.('blis')||[]}catch(_){}
  if(!Array.isArray(rows)||rows.length<2){
    try{rows=window.BLISPeriod?.dailySeries?.('blis')||[]}catch(_){}
  }
  const byDay=new Map();
  (Array.isArray(rows)?rows:[]).forEach(x=>{
    const d=String(x?.date||'').slice(0,10),v=N(x?.value);
    if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&v!=null)byDay.set(d,{date:d,value:Math.round(clamp(v)*10)/10});
  });
  return [...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date));
}

function smoothPath(points){
  if(points.length<2)return'';
  if(points.length===2){
    const a=points[0],b=points[1],m=(a[0]+b[0])/2;
    return `M ${a[0]} ${a[1]} C ${m} ${a[1]}, ${m} ${b[1]}, ${b[0]} ${b[1]}`;
  }
  const n=points.length,d=new Array(n-1),m=new Array(n).fill(0);
  for(let i=0;i<n-1;i++){const dx=points[i+1][0]-points[i][0];d[i]=dx?(points[i+1][1]-points[i][1])/dx:0}
  m[0]=d[0];m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++){
    const a=d[i-1],b=d[i];
    m[i]=(a===0||b===0||a*b<=0)?0:(a+b)/2;
  }
  for(let i=0;i<n-1;i++){
    if(d[i]===0){m[i]=0;m[i+1]=0;continue}
    const a=m[i]/d[i],b=m[i+1]/d[i],q=a*a+b*b;
    if(q>9){const tau=3/Math.sqrt(q);m[i]=tau*a*d[i];m[i+1]=tau*b*d[i]}
  }
  let out=`M ${points[0][0]} ${points[0][1]}`;
  for(let i=0;i<n-1;i++){
    const p0=points[i],p1=points[i+1],dx=p1[0]-p0[0];
    out+=` C ${(p0[0]+dx/3).toFixed(2)} ${(p0[1]+m[i]*dx/3).toFixed(2)}, ${(p1[0]-dx/3).toFixed(2)} ${(p1[1]-m[i+1]*dx/3).toFixed(2)}, ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
  }
  return out;
}

function scale(rows){
  const vals=rows.map(x=>x.value),lo=Math.min(...vals),hi=Math.max(...vals),spread=Math.max(.1,hi-lo);
  let pad=Math.max(2,spread*.34),min=Math.max(0,lo-pad),max=Math.min(100,hi+pad);
  if(max-min<10){const mid=(max+min)/2;min=Math.max(0,mid-5);max=Math.min(100,mid+5)}
  min=Math.floor(min/2)*2;max=Math.ceil(max/2)*2;
  if(max<=min)max=Math.min(100,min+10);
  return{min,max};
}

function chartHTML(rows){
  if(rows.length<2){
    const d=window.BLISPeriod?.days||30;
    return `<div class="blis-daily-empty">Тенденцията ще се появи след поне две реални дневни измервания за избраните ${E(d)} дни.</div>`;
  }
  const w=700,h=238,l=46,r=18,t=18,b=42;
  const times=rows.map(x=>Date.parse(x.date+'T00:00:00Z'));
  const minT=Math.min(...times),maxT=Math.max(...times),spanT=Math.max(86400000,maxT-minT);
  const sc=scale(rows),spanV=Math.max(1,sc.max-sc.min);
  const X=i=>l+(w-l-r)*(times[i]-minT)/spanT;
  const Y=v=>t+(h-t-b)*(1-(v-sc.min)/spanV);
  const pts=rows.map((x,i)=>[X(i),Y(x.value)]),path=smoothPath(pts);
  const area=`${path} L ${pts.at(-1)[0]} ${h-b} L ${pts[0][0]} ${h-b} Z`;
  const ticks=[0,.25,.5,.75,1].map(q=>sc.max-(sc.max-sc.min)*q);
  const grid=ticks.map(v=>{const y=Y(v);return `<line class="blis-daily-grid" x1="${l}" y1="${y}" x2="${w-r}" y2="${y}"/><text class="blis-daily-axis" x="5" y="${y+3}">${E(fmt(v))}</text>`}).join('');
  const step=Math.max(1,Math.ceil(rows.length/6));
  const labels=rows.map((x,i)=>(i===0||i===rows.length-1||i%step===0)?`<text class="blis-daily-date" x="${X(i)}" y="${h-10}" text-anchor="middle">${E(dateLabel(x.date))}</text>`:'').join('');
  const dots=rows.map((x,i)=>`<circle class="blis-daily-point" cx="${X(i)}" cy="${Y(x.value)}" r="3.5"><title>${E(x.date)} · BLIS ${E(fmt(x.value))}/100</title></circle>`).join('');
  const last=rows.at(-1),first=rows[0],delta=Math.round((last.value-first.value)*10)/10;
  return `<div class="blis-daily-chart" data-blis-daily-signature="${E(rows.map(x=>x.date+':'+x.value).join('|'))}"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Реална дневна динамика на BLIS индекса"><defs><linearGradient id="blisDailyAreaV5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b79f3" stop-opacity=".20"/><stop offset="1" stop-color="#2b79f3" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#blisDailyAreaV5)"/><path d="${path}" class="blis-daily-line"/>${dots}${labels}</svg><div class="blis-daily-foot"><span><b>${rows.length}</b> реални дневни стойности</span><span>Промяна за видимия период: <b class="${delta>0?'up':delta<0?'down':'flat'}">${delta>0?'+':''}${E(fmt(delta))} т.</b></span><span>Последна: <b>${E(fmt(last.value))}/100</b></span></div></div>`;
}

function patchLegacy(rows){
  const host=document.querySelector('#overviewPremium .ov-trend');
  if(!host)return false;
  const html=chartHTML(rows),sig=rows.map(x=>x.date+':'+x.value).join('|');
  if(host.querySelector('.blis-daily-chart')?.dataset.blisDailySignature===sig)return true;
  host.innerHTML=html;
  const card=host.closest('.ov-panel,.ov-card');
  card?.querySelector(':scope > .ov-method-note')?.remove();
  return true;
}

function patchOv3(rows){
  const section=document.querySelector('#overviewPremium .ov3-trend');
  if(!section)return false;
  const current=section.querySelector('.blis-daily-chart');
  const sig=rows.map(x=>x.date+':'+x.value).join('|');
  if(current?.dataset.blisDailySignature===sig)return true;
  const old=section.querySelector('.ov3-chart,.blis-daily-chart,.blis-daily-empty');
  const wrapper=document.createElement('div');wrapper.innerHTML=chartHTML(rows);
  const node=wrapper.firstElementChild;
  if(old)old.replaceWith(node);else section.appendChild(node);
  section.querySelectorAll('.blis-daily-foot + .blis-daily-foot').forEach(x=>x.remove());
  return true;
}

function draw(){
  const rows=series();
  patchLegacy(rows);
  patchOv3(rows);
}

let raf=0;
function schedule(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>setTimeout(draw,35));
}
function init(){
  schedule();
  const root=document.getElementById('overviewPremium');
  if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  ['blis:periodchange','blis:clientdata','blis:routechange','blis:navigator-route'].forEach(ev=>window.addEventListener(ev,schedule));
  document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,[data-page="overview"],.datebox,#blisPeriodMenu'))schedule()},true);
  setTimeout(schedule,180);setTimeout(schedule,700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BLISDrawDailyTrend=draw;
window.BLISDailyTrendV5={series,draw,version:'5.0-real-daily'};
})();
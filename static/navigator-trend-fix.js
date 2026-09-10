/* BLIS Navigator — canonical realtime BLIS trend v5.1.
   Uses only recorded measurements and factual incoming-event markers.
   No synthetic points, no daily collapsing and no front-end index invention. */
(function(){
'use strict';
if(window.__BLIS_DAILY_TREND_V5)return;window.__BLIS_DAILY_TREND_V5=true;

const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const fmt=v=>Number(v).toLocaleString('bg-BG',{minimumFractionDigits:Number(v)%1?1:0,maximumFractionDigits:1});
const timeLabel=stamp=>{const d=new Date(stamp);if(isNaN(d))return String(stamp||'');const n=new Date(),same=d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate();return same?d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'}):d.toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','')};

function series(){
  let rows=[];
  try{rows=window.BLISCurves?.series?.('blis')||[]}catch(_){}
  if(!Array.isArray(rows)||rows.length<2){
    try{rows=(window.BLISPeriod?.dailySeries?.('blis')||[]).map(x=>({timestamp:String(x?.date||'')+'T12:00:00Z',value:x?.value}))}catch(_){}
  }
  const seen=new Map();
  (Array.isArray(rows)?rows:[]).forEach(x=>{
    const raw=x?.timestamp||x?.date,d=raw?new Date(raw):null,v=N(x?.value);
    if(d&&!isNaN(d)&&v!=null){const row={timestamp:d.toISOString(),date:d.toISOString(),value:Math.round(clamp(v)*10)/10};seen.set(`${row.timestamp}|${row.value}`,row)}
  });
  return [...seen.values()].sort((a,b)=>a.timestamp.localeCompare(b.timestamp)).slice(-720);
}
function events(){
  try{return (window.BLISCurves?.events?.('blis')||[]).filter(x=>x?.timestamp)}catch(_){return[]}
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
  for(let i=1;i<n-1;i++){const a=d[i-1],b=d[i];m[i]=(a===0||b===0||a*b<=0)?0:(a+b)/2}
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
  min=Math.floor(min/2)*2;max=Math.ceil(max/2)*2;if(max<=min)max=Math.min(100,min+10);return{min,max};
}
function chartHTML(rows,ev){
  if(rows.length<2){
    if(ev.length)return `<div class="blis-daily-empty">Получени са <b>${E(ev.length)}</b> реални информационни събития за периода. Графиката ще свърже линия при второ числово измерване; събитията вече не се губят.</div>`;
    const d=window.BLISPeriod?.days||30;return `<div class="blis-daily-empty">Няма две потвърдени числови измервания за избраните ${E(d)} дни.</div>`;
  }
  const w=700,h=238,l=46,r=18,t=18,b=42;
  const times=rows.map(x=>new Date(x.timestamp).getTime()),minT=Math.min(...times),maxT=Math.max(...times),spanT=Math.max(1,maxT-minT);
  const sc=scale(rows),spanV=Math.max(1,sc.max-sc.min);
  const Xtime=tt=>l+(w-l-r)*Math.max(0,Math.min(1,(tt-minT)/spanT));
  const X=i=>Xtime(times[i]),Y=v=>t+(h-t-b)*(1-(v-sc.min)/spanV);
  const pts=rows.map((x,i)=>[X(i),Y(x.value)]),path=smoothPath(pts),area=`${path} L ${pts.at(-1)[0]} ${h-b} L ${pts[0][0]} ${h-b} Z`;
  const ticks=[0,.25,.5,.75,1].map(q=>sc.max-(sc.max-sc.min)*q);
  const grid=ticks.map(v=>{const y=Y(v);return `<line class="blis-daily-grid" x1="${l}" y1="${y}" x2="${w-r}" y2="${y}"/><text class="blis-daily-axis" x="5" y="${y+3}">${E(fmt(v))}</text>`}).join('');
  const step=Math.max(1,Math.ceil(rows.length/6));
  const labels=rows.map((x,i)=>(i===0||i===rows.length-1||i%step===0)?`<text class="blis-daily-date" x="${X(i)}" y="${h-10}" text-anchor="middle">${E(timeLabel(x.timestamp))}</text>`:'').join('');
  const dots=rows.map((x,i)=>`<circle class="blis-daily-point" cx="${X(i)}" cy="${Y(x.value)}" r="3.2"><title>${E(timeLabel(x.timestamp))} · BLIS ${E(fmt(x.value))}/100</title></circle>`).join('');
  const eventMarks=ev.filter(e=>{const tt=new Date(e.timestamp).getTime();return tt>=minT&&tt<=maxT}).map(e=>{const x=Xtime(new Date(e.timestamp).getTime());return `<line x1="${x}" y1="${h-b-10}" x2="${x}" y2="${h-b}" stroke="#2b79f3" stroke-width="1.5" opacity=".72"><title>${E(`${timeLabel(e.timestamp)} · ${e.title||'Информационно събитие'}${e.source?' · '+e.source:''}`)}</title></line><circle cx="${x}" cy="${h-b-11}" r="2.4" fill="#2b79f3" opacity=".85"/>`}).join('');
  const last=rows.at(-1),first=rows[0],delta=Math.round((last.value-first.value)*10)/10;
  const signature=rows.map(x=>x.timestamp+':'+x.value).join('|')+'#'+ev.map(x=>x.id||x.timestamp).join('|');
  return `<div class="blis-daily-chart" data-blis-daily-signature="${E(signature)}"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Реална динамика на BLIS индекса"><defs><linearGradient id="blisDailyAreaV5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b79f3" stop-opacity=".20"/><stop offset="1" stop-color="#2b79f3" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#blisDailyAreaV5)"/><path d="${path}" class="blis-daily-line"/>${dots}${eventMarks}${labels}</svg><div class="blis-daily-foot"><span><b>${rows.length}</b> реални времеви точки</span>${ev.length?`<span><b>${ev.length}</b> информационни събития</span>`:''}<span>Промяна за видимия период: <b class="${delta>0?'up':delta<0?'down':'flat'}">${delta>0?'+':''}${E(fmt(delta))} т.</b></span><span>Последна: <b>${E(fmt(last.value))}/100</b></span></div></div>`;
}
function patchLegacy(rows,ev){
  const host=document.querySelector('#overviewPremium .ov-trend');if(!host)return false;
  const html=chartHTML(rows,ev),sig=rows.map(x=>x.timestamp+':'+x.value).join('|')+'#'+ev.map(x=>x.id||x.timestamp).join('|');
  if(host.querySelector('.blis-daily-chart')?.dataset.blisDailySignature===sig)return true;
  host.innerHTML=html;const card=host.closest('.ov-panel,.ov-card');card?.querySelector(':scope > .ov-method-note')?.remove();return true;
}
function patchOv3(rows,ev){
  const section=document.querySelector('#overviewPremium .ov3-trend');if(!section)return false;
  const current=section.querySelector('.blis-daily-chart'),sig=rows.map(x=>x.timestamp+':'+x.value).join('|')+'#'+ev.map(x=>x.id||x.timestamp).join('|');
  if(current?.dataset.blisDailySignature===sig)return true;
  const old=section.querySelector('.ov3-chart,.blis-daily-chart,.blis-daily-empty');const wrapper=document.createElement('div');wrapper.innerHTML=chartHTML(rows,ev);const node=wrapper.firstElementChild;
  if(old)old.replaceWith(node);else section.appendChild(node);section.querySelectorAll('.blis-daily-foot + .blis-daily-foot').forEach(x=>x.remove());return true;
}
function draw(){const rows=series(),ev=events();patchLegacy(rows,ev);patchOv3(rows,ev)}
let raf=0;
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setTimeout(draw,35))}
function init(){
  schedule();const root=document.getElementById('overviewPremium');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  ['blis:periodchange','blis:clientdata','blis:routechange','blis:navigator-route'].forEach(ev=>window.addEventListener(ev,schedule));
  document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,[data-page="overview"],.datebox,#blisPeriodMenu'))schedule()},true);
  setTimeout(schedule,180);setTimeout(schedule,700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BLISDrawDailyTrend=draw;
window.BLISDailyTrendV5={series,events,draw,version:'5.1-realtime'};
})();

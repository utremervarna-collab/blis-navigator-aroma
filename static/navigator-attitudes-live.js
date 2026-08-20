/* BLIS Navigator — live enhancement for Мрежа на нагласите. */
(function(){
  'use strict';

  const STYLE_ID='attitudesLiveV1Styles';
  let ticker=0;

  function qs(s,r=document){return r.querySelector(s)}
  function qsa(s,r=document){return [...r.querySelectorAll(s)]}
  function active(){return !!qs('#market.page.active')}
  function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
  function fmt(v,d=1){const n=num(v);return n===null?'—':n.toLocaleString('bg-BG',{minimumFractionDigits:d,maximumFractionDigits:d})}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function globals(){
    let d={},a=[],h=[];
    try{if(typeof D!=='undefined'&&D)d=D}catch(_){ }
    try{if(typeof A!=='undefined'&&Array.isArray(A))a=A}catch(_){ }
    try{if(typeof H!=='undefined'&&Array.isArray(H))h=H}catch(_){ }
    return{d,a,h}
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
#market .att-live-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 8px;padding:10px 12px;border:1px solid #dce7e4;border-radius:11px;background:linear-gradient(180deg,#f7fbfa,#fff)}
#market .att-live-left{display:flex;align-items:center;gap:9px;min-width:0}
#market .att-live-dot{width:8px;height:8px;border-radius:50%;background:#16a36a;box-shadow:0 0 0 0 rgba(22,163,106,.34);animation:attPulse 1.45s infinite}
#market .att-live-copy b{display:block;font-size:10px;line-height:1.2;color:#344054;font-weight:800}
#market .att-live-copy span{display:block;margin-top:2px;font-size:8.5px;color:#7b8794}
#market .att-clock{font-variant-numeric:tabular-nums;font-size:15px;line-height:1;color:#0f7568;font-weight:850;letter-spacing:.04em;white-space:nowrap}
#market .att-mini{margin-top:10px;padding-top:9px;border-top:1px solid #edf1f5}
#market .att-mini-head{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:5px}
#market .att-mini-head b{font-size:9.5px;color:#344054;font-weight:800}
#market .att-mini-head span{font-size:7.8px;color:#98a2b3}
#market .att-mini svg{display:block;width:100%;height:58px;overflow:visible}
#market .att-mini-grid{stroke:#edf2f6;stroke-width:1}
#market .att-mini-area{fill:url(#attMiniFill)}
#market .att-mini-line{fill:none;stroke:#0f7568;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#market .att-mini-dot{fill:#fff;stroke:#0f7568;stroke-width:1.5}
#market .att-main-svg{display:block;width:100%;height:132px;overflow:visible}
#market .att-main-grid{stroke:#e9eef3;stroke-width:1}
#market .att-main-area{fill:url(#attMainFill)}
#market .att-main-line{fill:none;stroke:#147d8b;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 3px 5px rgba(20,125,139,.13))}
#market .att-main-dot{fill:#fff;stroke:#147d8b;stroke-width:2}
#market .att-axis{font-size:8px;fill:#98a2b3}
@keyframes attPulse{0%{box-shadow:0 0 0 0 rgba(22,163,106,.34)}70%{box-shadow:0 0 0 7px rgba(22,163,106,0)}100%{box-shadow:0 0 0 0 rgba(22,163,106,0)}}
@media(max-width:720px){#market .att-live-strip{align-items:flex-start;flex-direction:column}#market .att-clock{font-size:14px}}
`;
    document.head.appendChild(s);
  }

  function latestTime(){
    const {d,a}=globals(),times=[];
    (d?.signals||[]).forEach(x=>{const t=new Date(x.time||x.created_at||x.createdAt||0).getTime();if(t)times.push(t)});
    (a||[]).forEach(x=>{const t=new Date(x.time||x.observed_at||x.created_at||x.timestamp||0).getTime();if(t)times.push(t)});
    return times.length?Math.max(...times):null
  }
  function elapsedText(t){
    if(!t)return'няма timestamp';
    const s=Math.max(0,Math.floor((Date.now()-t)/1000));
    if(s<60)return`преди ${s} сек.`;
    const m=Math.floor(s/60);if(m<60)return`преди ${m} мин.`;
    const h=Math.floor(m/60);if(h<24)return`преди ${h} ч.`;
    return`преди ${Math.floor(h/24)} дни`;
  }
  function tick(){
    const c=qs('#attLiveClock'),e=qs('#attElapsed');
    if(c)c.textContent='LIVE '+new Date().toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(e)e.textContent=elapsedText(latestTime());
  }

  function indexValue(payload,keys){
    const arr=Array.isArray(payload?.indices)?payload.indices:[];
    for(const k of keys){const x=arr.find(v=>v.key===k),n=num(x?.value);if(n!==null)return n}
    return null
  }
  function composite(payload){
    const parts=[
      [indexValue(payload,['reputation','experience','product']),.30],
      [indexValue(payload,['interest','content']),.25],
      [indexValue(payload,['digital']),.25],
      [indexValue(payload,['presence','info']),.20]
    ].filter(x=>x[0]!==null&&x[0]>0);
    const sw=parts.reduce((s,x)=>s+x[1],0);
    return sw?parts.reduce((s,x)=>s+x[0]*x[1],0)/sw:null
  }
  function activeMetricId(){return qs('#market .pm-kpi.active')?.dataset?.kpi||'perception'}
  function metricValue(payload,id){
    if(id==='perception')return composite(payload);
    if(id==='presence')return indexValue(payload,['presence']);
    if(id==='digital')return indexValue(payload,['digital']);
    if(id==='interest')return indexValue(payload,['interest','content']);
    if(id==='context')return indexValue(payload,['reputation','product','experience','info']);
    return composite(payload)
  }
  function historySeries(){
    const {h}=globals(),id=activeMetricId();
    const days=Number(qs('#market [data-pm-period]')?.value)||30,cut=Date.now()-days*864e5;
    return (h||[]).map(x=>{
      const t=new Date(x.created_at||x.createdAt||0).getTime();
      const v=metricValue(x.payload||{},id);
      return t&&t>=cut&&v!==null?{t,v}:null
    }).filter(Boolean).sort((a,b)=>a.t-b.t)
  }
  function smoothPath(points){
    if(points.length<2)return'';
    let d=`M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for(let i=0;i<points.length-1;i++){
      const p0=points[i-1]||points[i],p1=points[i],p2=points[i+1],p3=points[i+2]||p2;
      const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;
      const c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
      d+=` C${c1x.toFixed(1)} ${c1y.toFixed(1)},${c2x.toFixed(1)} ${c2y.toFixed(1)},${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d
  }
  function mainChart(){
    const s=historySeries();
    if(s.length<2)return null;
    const w=620,h=132,l=32,r=12,t=10,b=20,vals=s.map(x=>x.v),min=Math.max(0,Math.min(...vals)-3),max=Math.min(100,Math.max(...vals)+3),range=Math.max(1,max-min),t0=s[0].t,t1=s[s.length-1].t,dt=Math.max(1,t1-t0);
    const pts=s.map(p=>[l+(w-l-r)*(p.t-t0)/dt,t+(h-t-b)*(1-(p.v-min)/range)]),path=smoothPath(pts),area=`${path} L${pts[pts.length-1][0].toFixed(1)} ${h-b} L${pts[0][0].toFixed(1)} ${h-b} Z`;
    const grid=[0,.5,1].map(f=>{const y=t+(h-t-b)*f;return`<line class="att-main-grid" x1="${l}" y1="${y}" x2="${w-r}" y2="${y}"/>`}).join('');
    const axes=`<text class="att-axis" x="${l}" y="${h-3}">${new Date(t0).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text><text class="att-axis" text-anchor="end" x="${w-r}" y="${h-3}">${new Date(t1).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text>`;
    return`<svg class="att-main-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Динамика на нагласите"><defs><linearGradient id="attMainFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#147d8b" stop-opacity=".20"/><stop offset="1" stop-color="#147d8b" stop-opacity="0"/></linearGradient></defs>${grid}${axes}<path class="att-main-area" d="${area}"/><path class="att-main-line" d="${path}"/>${pts.map((p,i)=>`<circle class="att-main-dot" cx="${p[0]}" cy="${p[1]}" r="2.7"><title>${new Date(s[i].t).toLocaleDateString('bg-BG')} · ${fmt(s[i].v)}</title></circle>`).join('')}</svg>`
  }

  function activityBins(){
    const {a}=globals();
    const now=Date.now(),hours=6,start=now-hours*3600e3,bins=12,vals=Array(bins).fill(0);
    (a||[]).forEach(x=>{const t=new Date(x.time||x.observed_at||x.created_at||0).getTime();if(!t||t<start||t>now)return;const i=Math.min(bins-1,Math.floor((t-start)/(now-start)*bins));vals[i]++});
    return{vals,hours}
  }
  function miniChart(){
    const {vals,hours}=activityBins(),w=620,h=58,l=3,r=3,t=6,b=5,max=Math.max(1,...vals),pts=vals.map((v,i)=>[l+(w-l-r)*(i/(vals.length-1)),t+(h-t-b)*(1-v/max)]),path=smoothPath(pts),area=`${path} L${pts[pts.length-1][0].toFixed(1)} ${h-b} L${pts[0][0].toFixed(1)} ${h-b} Z`;
    const total=vals.reduce((s,v)=>s+v,0);
    return`<div class="att-mini"><div class="att-mini-head"><b>Активност на сигналите</b><span>${total} измервания · последните ${hours} часа</span></div><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Активност на сигналите"><defs><linearGradient id="attMiniFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f7568" stop-opacity=".18"/><stop offset="1" stop-color="#0f7568" stop-opacity="0"/></linearGradient></defs><line class="att-mini-grid" x1="3" y1="${h-b}" x2="${w-r}" y2="${h-b}"/><path class="att-mini-area" d="${area}"/><path class="att-mini-line" d="${path}"/>${pts.map((p,i)=>vals[i]?`<circle class="att-mini-dot" cx="${p[0]}" cy="${p[1]}" r="2.1"><title>${vals[i]} измервания</title></circle>`:'').join('')}</svg></div>`
  }

  function decorate(){
    if(!active())return;
    ensureStyles();
    const card=qs('#market .pm-history')||qs('#market .pm-lower .pm-card');if(!card)return;
    const head=qs('.pm-lower-head',card)||qs('.ref-head',card)||card.firstElementChild;
    if(!qs('.att-live-strip',card)){
      const box=document.createElement('div');box.className='att-live-strip';box.innerHTML='<div class="att-live-left"><i class="att-live-dot"></i><div class="att-live-copy"><b>Живо наблюдение</b><span>последен сигнал: <strong id="attElapsed">—</strong></span></div></div><div class="att-clock" id="attLiveClock">LIVE --:--:--</div>';
      head?.after(box);
    }
    const timeline=qs('#pmTimeline',card)||qs('.pm-timeline',card);
    const main=mainChart();if(timeline&&main)timeline.innerHTML=main;
    const old=qs('.att-mini',card);if(old)old.remove();
    const wrap=document.createElement('div');wrap.innerHTML=miniChart();card.appendChild(wrap.firstElementChild);
    tick();
  }
  function schedule(ms=0){setTimeout(()=>requestAnimationFrame(decorate),ms)}

  function install(){
    ensureStyles();
    schedule(0);schedule(160);schedule(520);
    if(!ticker)ticker=setInterval(tick,1000);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="market"],#market [data-kpi],#market [data-theme],#market .pm-node'))schedule(80)
  },true);
  document.addEventListener('change',e=>{
    if(e.target.matches?.('#market [data-pm-period],#market [data-pm-type],#market [data-pm-source],#clientSel'))schedule(100)
  },true);
  window.addEventListener('blis:clientdata',()=>schedule(120));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>schedule(120),{once:true});
  window.BLISAttitudesLive={refresh:decorate};
})();
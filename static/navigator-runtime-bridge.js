/* BLIS Navigator — runtime compatibility bridge.
   Keeps app.js as the data/API loader and applies final production ownership
   without exposing legacy page renders. */
(function(){
  'use strict';

  if(!document.getElementById('blisPrepaintGuard')){
    const guard=document.createElement('style');
    guard.id='blisPrepaintGuard';
    guard.textContent='.page{visibility:hidden!important}.page.active{min-height:560px!important}';
    document.head.appendChild(guard);
  }
  if(!document.getElementById('blisCompetitionPaintGuard')){
    const guard=document.createElement('style');
    guard.id='blisCompetitionPaintGuard';
    guard.textContent='#competitionBody{visibility:hidden!important}body.blis-competition-ready #competitionBody{visibility:visible!important}';
    document.head.appendChild(guard);
  }
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="competition"]'))document.body.classList.remove('blis-competition-ready');
  },true);

  const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox']);
  const initialClient=()=>{
    try{const q=new URLSearchParams(location.search).get('client');if(q&&clients.has(q))return q}catch(e){}
    return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
  };

  const legacyLoad=window.load;
  if(typeof legacyLoad==='function'){
    window.load=async function(){
      const wanted=initialClient();
      if(wanted){try{slug=wanted}catch(e){}const sel=document.getElementById('clientSel');if(sel)sel.value=wanted}
      return legacyLoad();
    };
  }

  window.renderAll=function(){
    try{
      try{window.D=D;window.S=S;window.Q=Q;window.A=A;window.H=H}catch(e){}
      const x=typeof dossier==='function'?dossier():null;
      if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
      if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
      const note=document.getElementById('clientNote');if(note)note.textContent=D?.note||x?.descriptor||'';
      const sync=document.getElementById('lastSync');if(sync)sync.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
      window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:typeof slug!=='undefined'?slug:null}}));
    }catch(e){console.error('BLIS bridge render state failed',e)}
  };

  function loadScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.head.appendChild(s)}
  const v='20260821-1242';
  loadScript('blisGlobalLiveScript','/navigator-global-live.js?v='+v);
  loadScript('blisUITerminologyScript','/navigator-ui-terminology.js?v='+v);
  loadScript('blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v='+v);
  loadScript('blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v='+v);
  loadScript('blisCompetitionMotionV6Script','/navigator-competition-motion-fix-v6.js?v='+v);
  loadScript('blisCompetitionIntelligenceV9Script','/navigator-competition-intelligence-v9.js?v='+v);
  loadScript('blisCompetitionEnvironmentV10Script','/navigator-competition-environment-v10.js?v='+v);
  loadScript('blisCompetitionPageV11Script','/navigator-competition-page-v11.js?v='+v);
  loadScript('blisCompetitionPageV12Script','/navigator-competition-page-v12.js?v='+v);
  loadScript('blisArchitectureV15Script','/navigator-architecture-v15.js?v='+v);

  const num=n=>{const x=Number(n);return Number.isFinite(x)?x:null};
  const stamp=o=>{const raw=o?.time||o?.observed_at||o?.observedAt||o?.timestamp||o?.created_at||o?.createdAt||o?.date||o?.updated_at||o?.updatedAt;const t=raw?new Date(raw).getTime():NaN;return Number.isFinite(t)?t:null};
  const arr=x=>Array.isArray(x)?x:[];
  const sourceName=k=>arr(window.S).find(x=>String(x.key||x.source_key||'')===String(k||''))?.label||arr(window.S).find(x=>String(x.key||x.source_key||'')===String(k||''))?.name||k||'Публичен източник';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const rel=t=>{if(!t)return'LIVE';let s=Math.max(0,Math.floor((Date.now()-t)/1000));if(s<60)return s+' сек.';let m=Math.floor(s/60);if(m<60)return m+' мин.';let h=Math.floor(m/60);if(h<48)return h+' ч.';return Math.floor(h/24)+' дни'};
  const dateShort=t=>new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'});

  function patchCSS(){
    if(document.getElementById('blisFinalRuntimeFixCSS'))return;
    const st=document.createElement('style');st.id='blisFinalRuntimeFixCSS';st.textContent=`
      .n15-blis strong,.n15-mini strong,.n15-livekpi strong,.n15-lastactivity b,.n15-dir b,.n15-sigm b,.n15-digindex strong,.n15-digcard strong,
      #competition .cmpv11-flowmetric b,#competition .cmpv10-current b,#competition .cmpv10-kpi b,#competition [class*="score"],
      #market [class*="value"],#market [class*="score"],#overview [class*="value"],#live [class*="value"],#digital [class*="value"]{
        font-family:Georgia,serif!important;font-weight:600!important;font-variant-numeric:tabular-nums!important
      }
      #social .dv-sweep{animation:none!important;will-change:transform!important}
      #market .pm-maphead>div:first-of-type:before,#market .pm-maphead>div:first-of-type:after{content:none!important;display:none!important}
      #market .att-v2-live{display:none!important}
      #market .pm-maphead .blis-market-clean-live{margin-left:auto;display:inline-flex;align-items:center;gap:7px;color:#0c8e60;font:800 10px/1 Inter,system-ui,sans-serif;white-space:nowrap}
      #market .pm-maphead .blis-market-clean-live i{width:7px;height:7px;border-radius:50%;background:#17a56c;box-shadow:0 0 0 0 rgba(23,165,108,.35);animation:blisCleanPulse 1.35s ease-out infinite}
      .blis-runtime-curve{width:100%;height:100%;display:block;overflow:visible}.blis-runtime-curve .grid{stroke:#e5edf6;stroke-width:1}.blis-runtime-curve .area{opacity:.18}.blis-runtime-curve .line{fill:none;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round}.blis-runtime-curve .dot{fill:#fff;stroke-width:3}.blis-runtime-curve text{font:700 9px/1 Inter,system-ui,sans-serif;fill:#8090a3}
      #overview .n15-blis:before,#overview .n15-orbit:after{animation:none!important;transform:none!important}
      #overview .n15-overaside{display:none!important}
      #overview .n15-overhero{display:block!important}
      #overview .n15-orbit{min-height:620px!important}
      #overview .n15-overcurve{left:24px!important;right:24px!important;bottom:20px!important;height:190px!important;z-index:10!important;padding:16px 18px 12px!important}
      #overview .n15-overcurve .hd{display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:14px!important;margin-bottom:8px!important}
      #overview .n15-overcurve .hd b{font-size:14px!important;color:#17315c!important}#overview .n15-overcurve .hd span{font-size:9px!important;color:#7f8ca0!important}
      #overview .n15-overcurve .blis-runtime-curve{height:135px!important}
      .blis-over-intel{display:grid;grid-template-columns:1.05fr 1fr 1.15fr 1.3fr;gap:12px;margin-top:14px}
      .blis-over-card{position:relative;min-height:146px;padding:18px;border:1px solid #e2e9f2;border-radius:18px;background:linear-gradient(145deg,#fff,#f8fbff);box-shadow:0 12px 30px rgba(25,49,83,.055);overflow:hidden}
      .blis-over-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent,#1766e8)}
      .blis-over-card .eyebrow{display:block;font:850 8px/1 Inter,system-ui,sans-serif;letter-spacing:.12em;color:#8793a3;text-transform:uppercase}.blis-over-card strong{display:block;margin-top:10px;font:600 25px/1.05 Georgia,serif;color:#17345a}.blis-over-card p{margin:8px 0 0;font-size:9px;line-height:1.55;color:#6f7f93}.blis-over-card .meta{display:block;margin-top:9px;font-size:8px;color:#8390a0}.blis-over-card.signal strong{font:800 13px/1.35 Inter,system-ui,sans-serif;color:#203955}.blis-over-status{display:grid;gap:7px;margin-top:10px}.blis-over-status span{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:9px;background:#f3f7fb;font-size:8px;color:#596b80}.blis-over-status b{font-size:8px;color:#1a7d5b}.blis-over-status b.flat{color:#6f8093}.blis-over-status b.down{color:#c45a51}
      #competition .cmpv11-flowbox{height:182px!important;padding:0!important;overflow:hidden!important;background:linear-gradient(180deg,#fbfffd,#f2faf7)!important;border:1px solid #dbe9e4!important}
      #competition .blis-flow-river{width:100%;height:100%;display:block}.blis-flow-river .river{filter:drop-shadow(0 8px 12px rgba(21,145,100,.16))}.blis-flow-river .shine{fill:none;stroke:#fff;stroke-width:2;opacity:.34}.blis-flow-river .inner{fill:none;stroke-linecap:round;stroke-width:3;opacity:.55;stroke-dasharray:18 14;animation:blisRiverMove 1.8s linear infinite}
      #competition .cmpv10-layout>section .cmpv10-head h3{font-size:22px!important}.n15-cmpexplain{font-size:10.5px!important;line-height:1.62!important}
      @keyframes blisRiverMove{to{stroke-dashoffset:-64}}@keyframes blisCleanPulse{0%{box-shadow:0 0 0 0 rgba(23,165,108,.35)}70%{box-shadow:0 0 0 8px rgba(23,165,108,0)}100%{box-shadow:0 0 0 0 rgba(23,165,108,0)}}
      @media(max-width:1100px){.blis-over-intel{grid-template-columns:1fr 1fr}}@media(max-width:720px){.blis-over-intel{grid-template-columns:1fr}}
    `;document.head.appendChild(st)
  }

  function latestActivity(){
    const candidates=[];
    arr(window.A).forEach(o=>{const t=stamp(o);if(t)candidates.push({t,source:sourceName(o.source||o.source_key)})});
    arr(window.D?.signals).forEach(o=>{const t=stamp(o);if(t)candidates.push({t,source:sourceName(o.source||o.source_key||o.sourceKey)})});
    return candidates.sort((a,b)=>b.t-a.t)[0]||null;
  }

  function latestSignal(){
    const list=arr(window.D?.signals).map(s=>({t:stamp(s),title:s.title||s.label||'Наблюдаван сигнал',source:sourceName(s.source||s.source_key||s.sourceKey)})).filter(x=>x.t).sort((a,b)=>b.t-a.t);
    if(list.length)return list[0];
    const x=latestActivity();return x?{t:x.t,title:'Последна засечена активност',source:x.source}:null;
  }

  function patchLive(){
    const box=document.querySelector('#live .n15-lastactivity');if(!box)return;
    const x=latestActivity();if(!x)return;
    const b=box.querySelector('b'),s=box.querySelector('span');
    if(b)b.textContent=new Date(x.t).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(s)s.textContent=x.source+' · '+rel(x.t);
  }

  function driveRadar(){
    const phase=((performance.now()%5800)/5800)*360;
    document.querySelectorAll('#social .dv-sweep').forEach(el=>{el.style.transform='rotate('+phase.toFixed(2)+'deg)'});
    requestAnimationFrame(driveRadar);
  }

  function smoothPath(points){
    if(points.length<2)return'';let d=`M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for(let i=0;i<points.length-1;i++){
      const p0=points[i-1]||points[i],p1=points[i],p2=points[i+1],p3=points[i+2]||p2;
      const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
      d+=` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }return d;
  }

  function curveSVG(rows,color='#1766e8'){
    rows=rows.filter(x=>x.t&&Number.isFinite(x.v)).sort((a,b)=>a.t-b.t);if(rows.length<2)return'';
    const dedup=[];for(const r of rows){const day=new Date(r.t).toISOString().slice(0,10),last=dedup[dedup.length-1];if(last&&last.day===day){last.v=r.v;last.t=r.t}else dedup.push({...r,day})}
    rows=dedup;if(rows.length<2)return'';
    const w=780,h=180,L=22,R=20,T=16,B=34,vals=rows.map(x=>x.v),mn=Math.min(...vals),mx=Math.max(...vals),span=Math.max(1,mx-mn),lo=mn-span*.35,hi=mx+span*.35,rng=Math.max(1,hi-lo),t0=rows[0].t,t1=rows.at(-1).t||t0+1;
    const pts=rows.map(x=>[L+(w-L-R)*((x.t-t0)/Math.max(1,t1-t0)),T+(h-T-B)*(1-(x.v-lo)/rng)]),d=smoothPath(pts),area=`${d} L ${pts.at(-1)[0]} ${h-B+4} L ${pts[0][0]} ${h-B+4} Z`;
    const labels=rows.map((x,i)=>i===0||i===rows.length-1||i%Math.max(1,Math.ceil(rows.length/5))===0?`<text x="${pts[i][0]}" y="${h-9}" text-anchor="middle">${dateShort(x.t)}</text>`:'').join('');
    const dots=rows.map((x,i)=>`<circle class="dot" cx="${pts[i][0]}" cy="${pts[i][1]}" r="4" stroke="${color}"><title>${new Date(x.t).toLocaleDateString('bg-BG')} · ${x.v.toFixed(1)}</title></circle>`).join('');
    return `<svg class="blis-runtime-curve" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="blisCurveFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><g class="grid"><line x1="${L}" y1="${T}" x2="${w-R}" y2="${T}"/><line x1="${L}" y1="${(T+h-B)/2}" x2="${w-R}" y2="${(T+h-B)/2}"/><line x1="${L}" y1="${h-B+4}" x2="${w-R}" y2="${h-B+4}"/></g><path class="area" d="${area}" fill="url(#blisCurveFill)"/><path class="line" d="${d}" stroke="${color}"/>${dots}${labels}</svg>`;
  }

  function payloadIndex(payload,key){return num(arr(payload?.indices).find(i=>String(i.key||'')===key)?.value)}
  function blisValue(payload){
    const direct=num(payload?.blis_index??payload?.blis);if(direct!==null)return direct;
    const vals=arr(payload?.indices).map(i=>num(i?.value)).filter(v=>v!==null&&v>0);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  }
  function blisSeries(){
    const out=[];arr(window.H).forEach(s=>{const t=stamp(s),v=blisValue(s?.payload||{});if(t&&v!==null)out.push({t,v})});
    const cur=blisValue(window.D||{});if(cur!==null)out.push({t:Date.now(),v:cur});return out;
  }
  function metricSeries(key){
    const out=[];arr(window.H).forEach(s=>{const t=stamp(s),v=payloadIndex(s?.payload||{},key);if(t&&v!==null)out.push({t,v})});
    const cur=payloadIndex(window.D||{},key);if(cur!==null)out.push({t:Date.now(),v:cur});return out;
  }
  function attitudesValue(payload){
    const parts=[['reputation',.30],['content',.25],['digital',.25],['presence',.20]].map(([k,w])=>({v:payloadIndex(payload,k),w})).filter(x=>x.v!==null);
    const sw=parts.reduce((a,x)=>a+x.w,0);return sw?parts.reduce((a,x)=>a+x.v*x.w,0)/sw:null;
  }
  function attitudesSeries(){const out=[];arr(window.H).forEach(s=>{const t=stamp(s),v=attitudesValue(s?.payload||{});if(t&&v!==null)out.push({t,v})});const cur=attitudesValue(window.D||{});if(cur!==null)out.push({t:Date.now(),v:cur});return out}
  function competitionSeries(){
    const out=[];const avg=p=>{const vals=arr(p?.competitors).map(c=>num(c.score)).filter(v=>v!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
    arr(window.H).forEach(s=>{const t=stamp(s),v=avg(s?.payload);if(t&&v!==null)out.push({t,v})});const v=avg(window.D);if(v!==null)out.push({t:Date.now(),v});return out;
  }
  function dayRows(rows){
    const m=new Map();rows.filter(x=>x.t&&Number.isFinite(x.v)).sort((a,b)=>a.t-b.t).forEach(x=>m.set(new Date(x.t).toISOString().slice(0,10),x));return [...m.values()].sort((a,b)=>a.t-b.t);
  }
  function direction(rows){
    const d=dayRows(rows);if(d.length<2)return{word:'без сравнение',cls:'flat',delta:null};const delta=d.at(-1).v-d.at(-2).v;if(Math.abs(delta)<.05)return{word:'стабилно',cls:'flat',delta};return delta>0?{word:'засилване',cls:'up',delta}:{word:'отслабване',cls:'down',delta};
  }

  function patchOverview(){
    const root=document.querySelector('#overview #n15Overview');if(!root)return;
    const rows=dayRows(blisSeries()),curve=root.querySelector('.n15-overcurve');
    if(curve){
      const range=rows.length?`${dateShort(rows[0].t)} – ${dateShort(rows.at(-1).t)}`:'няма записана история';
      const chart=curveSVG(rows,'#1766e8');
      curve.innerHTML=`<div class="hd"><b>Динамика на BLIS индекса</b><span>${range}${rows.length?` · ${rows.length} реални дневни измервания`:''}</span></div>${chart||'<div style="padding:42px 0;text-align:center;color:#7f8ca0;font-size:10px">Необходими са поне две реални дневни измервания за крива.</div>'}`;
    }
    const core=root.querySelector('.n15-blis strong');const current=blisValue(window.D||{});if(core&&current!==null)core.innerHTML=`${current.toLocaleString('bg-BG',{maximumFractionDigits:1})}<small>/100</small>`;
    const modules=[
      {sel:'.n15-s1 b',label:'активно',cls:'up'},
      {sel:'.n15-s2 b',...direction(metricSeries('content'))},
      {sel:'.n15-s3 b',...direction(metricSeries('reputation'))},
      {sel:'.n15-s4 b',...direction(attitudesSeries())},
      {sel:'.n15-s5 b',...direction(competitionSeries())}
    ];
    modules.forEach(m=>{const el=root.querySelector(m.sel);if(el)el.textContent=m.label||m.word});
    let intel=root.querySelector('.blis-over-intel');if(!intel){intel=document.createElement('section');intel.className='blis-over-intel';root.querySelector('.n15-overhero')?.insertAdjacentElement('afterend',intel)}
    if(!intel)return;
    const first=rows[0],last=rows.at(-1),periodDelta=first&&last?last.v-first.v:null,periodText=periodDelta===null?'—':Math.abs(periodDelta)<.05?'Стабилно':`${periodDelta>0?'+':''}${periodDelta.toLocaleString('bg-BG',{maximumFractionDigits:1})} т.`;
    const candidates=[
      {label:'Дигитална видимост',page:'digital',d:direction(metricSeries('digital'))},
      {label:'Репутация',page:'reputation',d:direction(metricSeries('reputation'))},
      {label:'Нагласи',page:'market',d:direction(attitudesSeries())},
      {label:'Конкурентна среда',page:'competition',d:direction(competitionSeries())}
    ].filter(x=>x.d.delta!==null).sort((a,b)=>Math.abs(b.d.delta)-Math.abs(a.d.delta));
    const key=candidates[0]||{label:'Няма съществено отклонение',page:'overview',d:{word:'стабилно',cls:'flat'}};
    const sig=latestSignal(),status=candidates.slice(0,4);
    const signature=JSON.stringify([rows.map(x=>[x.t,x.v]),key.label,key.d.word,sig?.t,sig?.title,status.map(x=>[x.label,x.d.word])]);if(intel.dataset.sig===signature)return;intel.dataset.sig=signature;
    intel.innerHTML=`<div class="blis-over-card" style="--accent:#1766e8"><span class="eyebrow">КАРТИНА ЗА ПЕРИОДА</span><strong>${esc(periodText)}</strong><p>${rows.length?`${rows.length} реални дневни измервания · ${dateShort(rows[0].t)} – ${dateShort(rows.at(-1).t)}`:'Няма достатъчна историческа серия.'}</p><span class="meta">Показват се само реално записани дни. Липсващи дати не се запълват изкуствено.</span></div><button class="blis-over-card" style="--accent:#6f5bd6;text-align:left;cursor:pointer" onclick="window.refGo&&refGo('${key.page}')"><span class="eyebrow">КЛЮЧОВА ПРОМЯНА</span><strong>${esc(key.label)}</strong><p>${esc(key.d.word)} спрямо последните две реални измервания.</p><span class="meta">Отвори модула →</span></button><button class="blis-over-card signal" style="--accent:#13a36d;text-align:left;cursor:pointer" onclick="window.refGo&&refGo('social')"><span class="eyebrow">ПОСЛЕДЕН ЗНАЧИМ СИГНАЛ</span><strong>${esc(sig?.title||'Няма нов значим сигнал')}</strong><p>${esc(sig?`${sig.source} · ${new Date(sig.t).toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`:'Наблюдението продължава.')}</p><span class="meta">Към Сигнали →</span></button><div class="blis-over-card" style="--accent:#e5942b"><span class="eyebrow">СЪСТОЯНИЕ НА МОДУЛИТЕ</span><div class="blis-over-status">${status.length?status.map(x=>`<span>${esc(x.label)}<b class="${x.d.cls}">${esc(x.d.word)}</b></span>`).join(''):'<span>Мониторинг<b>активно</b></span><span>Сигнали<b>наблюдение</b></span><span>Репутация<b class="flat">текущо</b></span><span>Нагласи<b class="flat">текущо</b></span>'}</div></div>`;
  }

  function patchCompetition(){
    const root=document.getElementById('competitionBody');if(!root)return;
    const flow=root.querySelector('.cmpv11-flowbox');
    if(flow&&!flow.querySelector('.blis-flow-river')){
      flow.innerHTML=`<svg class="blis-flow-river" viewBox="0 0 1000 180" preserveAspectRatio="none"><defs><linearGradient id="blisRiverG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#11a56d"/><stop offset=".48" stop-color="#29b69d"/><stop offset="1" stop-color="#377de9"/></linearGradient></defs><path class="river" d="M0 52 C120 20 180 70 300 52 C430 32 500 8 620 43 C748 80 835 68 1000 34 L1000 132 C850 160 760 125 635 145 C510 164 420 126 300 146 C170 168 92 128 0 151 Z" fill="url(#blisRiverG)" opacity=".84"/><path class="shine" d="M0 66 C120 34 188 83 302 65 C430 45 510 24 625 58 C750 95 842 82 1000 50"/><path class="inner" d="M0 98 C128 70 195 118 310 98 C438 77 512 55 628 91 C758 128 846 113 1000 83" stroke="#d8fff3"/><path class="inner" d="M0 126 C130 101 202 144 316 126 C442 105 520 86 638 119 C765 154 854 143 1000 112" stroke="#c8dcff" style="animation-delay:-.8s"/></svg>`;
    }
    const viz=root.querySelector('.cmpv10-layout>section .cmpv10-series:not(.small) .cmpv10-viz');if(viz){const svg=curveSVG(competitionSeries(),'#2568e8');if(svg)viz.innerHTML=svg}
    const explanation=root.querySelector('.n15-cmpexplain');if(explanation)explanation.innerHTML='<b>Текущо движение:</b> кривата показва средната реално измерена конкурентна позиция за периода. Формата следва записаните дневни стойности; повишението означава засилване на конкурентната среда, а спадът — отслабване.';
    if(root.querySelector('.cmpv12-root,.cmpv10-layout,.cmpv11-flowbox'))document.body.classList.add('blis-competition-ready');
  }

  function cleanMarketHeader(){
    const head=document.querySelector('#market .pm-maphead');if(!head)return;
    const b=head.querySelector('b');if(b)b.textContent='';
    const small=head.querySelector('small');if(small)small.textContent='';
    [...head.querySelectorAll('*')].forEach(el=>{const t=(el.textContent||'').trim();if(el!==b&&!el.classList.contains('blis-market-clean-live')&&/Интерактивна карта на възприятията|НАГЛАСИ В РЕАЛНО ВРЕМЕ|В РЕАЛНО ВРЕМЕ|3D мрежа на възприятията/i.test(t)&&!el.querySelector('b'))el.style.display='none'});
    let live=head.querySelector('.blis-market-clean-live');if(!live){live=document.createElement('span');live.className='blis-market-clean-live';live.innerHTML='<i></i> LIVE';head.appendChild(live)}
  }

  function patchAll(){patchCSS();patchOverview();patchLive();patchCompetition();cleanMarketHeader()}
  function startFinalFixes(){patchAll();setInterval(patchAll,700);requestAnimationFrame(driveRadar);window.addEventListener('blis:clientdata',()=>setTimeout(patchAll,60));window.addEventListener('blis:periodchange',()=>setTimeout(patchAll,60));document.addEventListener('click',()=>setTimeout(patchAll,80),true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startFinalFixes,{once:true});else startFinalFixes();
})();
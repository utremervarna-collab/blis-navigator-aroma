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

  const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
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
  const v='20260821-1114';
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
  const rel=t=>{if(!t)return'LIVE';let s=Math.max(0,Math.floor((Date.now()-t)/1000));if(s<60)return s+' сек.';let m=Math.floor(s/60);if(m<60)return m+' мин.';let h=Math.floor(m/60);if(h<48)return h+' ч.';return Math.floor(h/24)+' дни'};

  function patchCSS(){
    if(document.getElementById('blisFinalRuntimeFixCSS'))return;
    const st=document.createElement('style');st.id='blisFinalRuntimeFixCSS';st.textContent=`
      .n15-blis strong,.n15-mini strong,.n15-livekpi strong,.n15-lastactivity b,.n15-dir b,.n15-sigm b,.n15-digindex strong,.n15-digcard strong,
      #competition .cmpv11-flowmetric b,#competition .cmpv10-current b,#competition .cmpv10-kpi b,#competition [class*="score"],
      #market [class*="value"],#market [class*="score"],#market .pm-node b,#overview [class*="value"],#live [class*="value"],#digital [class*="value"]{
        font-family:Georgia,serif!important;font-weight:600!important;font-variant-numeric:tabular-nums!important
      }
      #social .dv-sweep{animation:none!important;will-change:transform!important}
      #market .pm-maphead>div:first-of-type:before,#market .pm-maphead>div:first-of-type:after{content:none!important;display:none!important}
      #market .att-v2-live{display:none!important}
      #market .pm-maphead .blis-market-clean-live{margin-left:auto;display:inline-flex;align-items:center;gap:7px;color:#0c8e60;font:800 10px/1 Inter,system-ui,sans-serif;white-space:nowrap}
      #market .pm-maphead .blis-market-clean-live i{width:7px;height:7px;border-radius:50%;background:#17a56c;box-shadow:0 0 0 0 rgba(23,165,108,.35);animation:blisCleanPulse 1.35s ease-out infinite}
      .blis-runtime-curve{width:100%;height:100%;display:block;overflow:visible}.blis-runtime-curve .grid{stroke:#e5edf6;stroke-width:1}.blis-runtime-curve .area{opacity:.18}.blis-runtime-curve .line{fill:none;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round}.blis-runtime-curve .dot{fill:#fff;stroke-width:3}.blis-runtime-curve text{font:700 9px/1 Inter,system-ui,sans-serif;fill:#8090a3}
      #competition .cmpv11-flowbox{height:182px!important;padding:0!important;overflow:hidden!important;background:linear-gradient(180deg,#fbfffd,#f2faf7)!important;border:1px solid #dbe9e4!important}
      #competition .blis-flow-river{width:100%;height:100%;display:block}.blis-flow-river .river{filter:drop-shadow(0 8px 12px rgba(21,145,100,.16))}.blis-flow-river .shine{fill:none;stroke:#fff;stroke-width:2;opacity:.34}.blis-flow-river .inner{fill:none;stroke-linecap:round;stroke-width:3;opacity:.55;stroke-dasharray:18 14;animation:blisRiverMove 1.8s linear infinite}
      #competition .cmpv10-layout>section .cmpv10-head h3{font-size:22px!important}.n15-cmpexplain{font-size:10.5px!important;line-height:1.62!important}
      @keyframes blisRiverMove{to{stroke-dashoffset:-64}}@keyframes blisCleanPulse{0%{box-shadow:0 0 0 0 rgba(23,165,108,.35)}70%{box-shadow:0 0 0 8px rgba(23,165,108,0)}100%{box-shadow:0 0 0 0 rgba(23,165,108,0)}}
    `;document.head.appendChild(st)
  }

  function latestActivity(){
    const candidates=[];
    arr(window.A).forEach(o=>{const t=stamp(o);if(t)candidates.push({t,source:sourceName(o.source||o.source_key)})});
    arr(window.D?.signals).forEach(o=>{const t=stamp(o);if(t)candidates.push({t,source:sourceName(o.source||o.source_key||o.sourceKey)})});
    return candidates.sort((a,b)=>b.t-a.t)[0]||null;
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
    const labels=rows.map((x,i)=>i===0||i===rows.length-1||i%Math.max(1,Math.ceil(rows.length/5))===0?`<text x="${pts[i][0]}" y="${h-9}" text-anchor="middle">${new Date(x.t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text>`:'').join('');
    const dots=rows.map((x,i)=>`<circle class="dot" cx="${pts[i][0]}" cy="${pts[i][1]}" r="4" stroke="${color}"><title>${new Date(x.t).toLocaleDateString('bg-BG')} · ${x.v.toFixed(1)}</title></circle>`).join('');
    return `<svg class="blis-runtime-curve" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="blisCurveFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><g class="grid"><line x1="${L}" y1="${T}" x2="${w-R}" y2="${T}"/><line x1="${L}" y1="${(T+h-B)/2}" x2="${w-R}" y2="${(T+h-B)/2}"/><line x1="${L}" y1="${h-B+4}" x2="${w-R}" y2="${h-B+4}"/></g><path class="area" d="${area}" fill="url(#blisCurveFill)"/><path class="line" d="${d}" stroke="${color}"/>${dots}${labels}</svg>`;
  }

  function indexSeries(key){
    const out=[];arr(window.H).forEach(s=>{const t=stamp(s),p=s?.payload||{},ix=arr(p.indices).find(i=>String(i.key||'')===key),v=num(ix?.value);if(t&&v!==null)out.push({t,v})});
    const cur=arr(window.D?.indices).find(i=>String(i.key||'')===key),v=num(cur?.value);if(v!==null)out.push({t:Date.now(),v});
    return out;
  }

  function patchDigital(){
    const host=document.querySelector('#digital .n15-digchart');if(!host)return;
    const svg=curveSVG(indexSeries('digital'),'#1766e8');if(svg)host.innerHTML=svg;
  }

  function competitionSeries(){
    const out=[];
    const avg=p=>{const vals=arr(p?.competitors).map(c=>num(c.score)).filter(v=>v!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
    arr(window.H).forEach(s=>{const t=stamp(s),v=avg(s?.payload);if(t&&v!==null)out.push({t,v})});
    const v=avg(window.D);if(v!==null)out.push({t:Date.now(),v});return out;
  }

  function patchCompetition(){
    const root=document.getElementById('competitionBody');if(!root)return;
    const flow=root.querySelector('.cmpv11-flowbox');
    if(flow&&!flow.querySelector('.blis-flow-river')){
      flow.innerHTML=`<svg class="blis-flow-river" viewBox="0 0 1000 180" preserveAspectRatio="none"><defs><linearGradient id="blisRiverG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#11a56d"/><stop offset=".48" stop-color="#29b69d"/><stop offset="1" stop-color="#377de9"/></linearGradient></defs><path class="river" d="M0 52 C120 20 180 70 300 52 C430 32 500 8 620 43 C748 80 835 68 1000 34 L1000 132 C850 160 760 125 635 145 C510 164 420 126 300 146 C170 168 92 128 0 151 Z" fill="url(#blisRiverG)" opacity=".84"/><path class="shine" d="M0 66 C120 34 188 83 302 65 C430 45 510 24 625 58 C750 95 842 82 1000 50"/><path class="inner" d="M0 98 C128 70 195 118 310 98 C438 77 512 55 628 91 C758 128 846 113 1000 83" stroke="#d8fff3"/><path class="inner" d="M0 126 C130 101 202 144 316 126 C442 105 520 86 638 119 C765 154 854 143 1000 112" stroke="#c8dcff" style="animation-delay:-.8s"/></svg>`;
    }
    const viz=root.querySelector('.cmpv10-layout>section .cmpv10-series:not(.small) .cmpv10-viz');if(viz){const svg=curveSVG(competitionSeries(),'#2568e8');if(svg)viz.innerHTML=svg}
    const explanation=root.querySelector('.n15-cmpexplain');if(explanation)explanation.innerHTML='<b>Текущо движение:</b> кривата показва средната реално измерена конкурентна позиция за периода. Формата следва записаните дневни стойности; повишението означава засилване на конкурентната среда, а спадът — отслабване.';
  }

  function cleanMarketHeader(){
    const head=document.querySelector('#market .pm-maphead');if(!head)return;
    const b=head.querySelector('b');if(b)b.textContent='НАГЛАСИ';
    const small=head.querySelector('small');if(small)small.textContent='';
    [...head.querySelectorAll('*')].forEach(el=>{const t=(el.textContent||'').trim();if(el!==b&&!el.classList.contains('blis-market-clean-live')&&/Интерактивна карта на възприятията|НАГЛАСИ В РЕАЛНО ВРЕМЕ|В РЕАЛНО ВРЕМЕ/i.test(t)&&!el.querySelector('b'))el.style.display='none'});
    let live=head.querySelector('.blis-market-clean-live');if(!live){live=document.createElement('span');live.className='blis-market-clean-live';live.innerHTML='<i></i> LIVE';head.appendChild(live)}
  }

  function patchAll(){patchCSS();patchLive();patchDigital();patchCompetition();cleanMarketHeader()}
  function startFinalFixes(){patchAll();setInterval(patchAll,700);requestAnimationFrame(driveRadar);window.addEventListener('blis:clientdata',()=>setTimeout(patchAll,60));window.addEventListener('blis:periodchange',()=>setTimeout(patchAll,60));document.addEventListener('click',()=>setTimeout(patchAll,80),true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startFinalFixes,{once:true});else startFinalFixes();
})();
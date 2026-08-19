/* BLIS Navigator — Social Signals interaction controller v5.
   Restores the prior BLISCurves visual: green wavy curve, shaded area, interactive points and dates below. */
(function(){
  'use strict';
  if(window.__BLISSocialInteractiveV5)return;
  window.__BLISSocialInteractiveV5=true;

  const GREEN='#2daf65';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
  const shortDate=s=>{const p=String(s||'').slice(0,10).split('-');return p.length===3?`${p[2]}.${p[1]}`:String(s||'')};

  function styles(){
    if(document.getElementById('smInteractiveStylesV5'))return;
    const s=document.createElement('style');s.id='smInteractiveStylesV5';s.textContent=`
      #socialBody .sm-kpi[data-sm-destination]{cursor:pointer;position:relative;transition:border-color .16s ease,transform .16s ease,box-shadow .16s ease}
      #socialBody .sm-kpi[data-sm-destination]:hover{border-color:#b9cceb;transform:translateY(-1px);box-shadow:0 8px 22px rgba(23,49,92,.08)}
      #socialBody .sm-kpi[data-sm-destination]:focus-visible{outline:2px solid #1766e8;outline-offset:3px}
      #socialBody .sm-kpi-link{display:block;margin-top:8px;color:#1766e8;font-size:10px;font-weight:700;letter-spacing:.01em}
      #socialBody .sm-anchor-flash{animation:smAnchorFlash .9s ease}
      @keyframes smAnchorFlash{0%{box-shadow:0 0 0 3px rgba(23,102,232,.20)}100%{box-shadow:none}}
      #socialBody #socialTrend .sm-chart{height:205px!important;min-height:205px!important;overflow:hidden!important;padding:0!important}
      #socialBody #socialTrend .sm-chart svg{width:100%;height:100%;display:block}
      #socialBody #socialTrend .blis-click-point{cursor:pointer;transition:r .12s ease}
      #socialBody #socialTrend .blis-click-point:hover,#socialBody #socialTrend .blis-click-point.is-selected{r:5.2}
      #socialBody #socialTrend .sm-chart-dates{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 12px 0 28px;color:#74839a;font-size:9px;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums}
      #socialBody #socialTrend .sm-chart-dates span{min-width:30px;text-align:center}
      #socialBody #socialTrend .sm-chart-dates span:first-child{text-align:left}
      #socialBody #socialTrend .sm-chart-dates span:last-child{text-align:right}
      #socialBody #socialTrend .blis-series-note{display:none!important}
      @media(max-width:700px){#socialBody #socialTrend .sm-chart-dates span:nth-child(even){display:none}}
    `;document.head.appendChild(s);
  }

  const KPI_MAP=[
    {type:'part',id:'socialTrend',hint:'Виж динамиката →'},
    {type:'part',id:'socialTrend',hint:'Виж динамиката →'},
    {type:'part',id:'socialChannels',hint:'Виж каналите →'},
    {type:'part',id:'socialPosts',hint:'Виж публикациите →'},
    {type:'page',page:'signals',hint:'Виж сигналите →'}
  ];

  function markSections(root){
    for(const c of root.querySelectorAll('.sm-card')){
      const h=(c.querySelector('.sm-card-head h3')?.textContent||'').trim();
      if(h==='СОЦИАЛНА ДИНАМИКА')c.id='socialTrend';
      else if(h==='КАНАЛИ И ПРИНОС')c.id='socialChannels';
      else if(h==='ПОСЛЕДНИ ПУБЛИКАЦИИ ПО КАНАЛИ')c.id='socialPosts';
    }
  }

  function makeKpisInteractive(root){
    [...root.querySelectorAll('.sm-kpis .sm-kpi')].forEach((card,i)=>{
      const m=KPI_MAP[i];if(!m)return;
      card.dataset.smDestination=m.type==='page'?`page:${m.page}`:`part:${m.id}`;
      card.setAttribute('role','button');card.setAttribute('tabindex','0');
      if(!card.querySelector('.sm-kpi-link'))card.insertAdjacentHTML('beforeend',`<span class="sm-kpi-link">${esc(m.hint)}</span>`);
    });
  }

  function dateStrip(series){
    if(!series.length)return'';
    const maxLabels=7;
    const idx=[];
    if(series.length<=maxLabels){for(let i=0;i<series.length;i++)idx.push(i)}
    else{for(let i=0;i<maxLabels;i++)idx.push(Math.round(i*(series.length-1)/(maxLabels-1)))}
    return `<div class="sm-chart-dates" aria-label="Дати на социалната динамика">${idx.map(i=>`<span>${esc(shortDate(series[i]?.date))}</span>`).join('')}</div>`;
  }

  function restorePriorCurve(root){
    if(!window.BLISCurves?.draw||!window.BLISCurves?.series)return;
    const card=root.querySelector('#socialTrend');
    const host=card?.querySelector('.sm-chart');
    if(!host)return;

    const series=window.BLISCurves.series('presence')||[];
    if(series.length<2)return;

    host.innerHTML=window.BLISCurves.draw('presence',{color:GREEN,width:760,height:190});

    const svg=host.querySelector('svg[data-curve-key="presence"]');
    const dots=[...svg?.querySelectorAll('circle')||[]];
    dots.forEach((dot,i)=>{
      const row=series[i];if(!row)return;
      dot.classList.add('blis-click-point');
      dot.dataset.chartKey='presence';
      dot.dataset.chartLabel='Социален индекс';
      dot.dataset.chartDate=row.date||'';
      dot.dataset.chartValue=String(row.value??'');
      dot.setAttribute('role','button');dot.setAttribute('tabindex','0');
      dot.style.cursor='pointer';dot.style.pointerEvents='all';
      dot.setAttribute('stroke','#fff');dot.setAttribute('stroke-width','1.5');dot.setAttribute('r','3.6');
    });

    card.querySelector('.sm-chart-dates')?.remove();
    host.insertAdjacentHTML('afterend',dateStrip(series));

    const sub=card.querySelector('.sm-card-head p');
    if(sub)sub.textContent='Дневна динамика на социалния индекс';
    const pill=card.querySelector('.sm-card-head .sm-pill');
    if(pill)pill.textContent='ДНЕВНА ДИНАМИКА';
    const meta=card.querySelector('.sm-chart-meta span:first-child');
    if(meta)meta.innerHTML=`<b>${series.length}</b> дневни точки`;
  }

  function patch(){
    const root=document.getElementById('socialBody');
    if(!root||!root.children.length)return false;
    styles();markSections(root);makeKpisInteractive(root);restorePriorCurve(root);return true;
  }

  function gotoPart(id){
    const el=document.getElementById(id);if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.remove('sm-anchor-flash');void el.offsetWidth;el.classList.add('sm-anchor-flash');
  }
  function activate(dest){
    if(!dest)return;
    if(dest.startsWith('part:'))gotoPart(dest.slice(5));
    else if(dest.startsWith('page:')){const page=dest.slice(5);if(typeof window.refGo==='function')window.refGo(page);else if(typeof window.go==='function')window.go(page)}
  }

  document.addEventListener('click',e=>{
    const kpi=e.target?.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi)activate(kpi.dataset.smDestination);
    const nav=e.target?.closest?.('#nav button[data-page="social"]');if(nav){setTimeout(patch,120);setTimeout(patch,650)}
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const kpi=e.target?.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi){e.preventDefault();activate(kpi.dataset.smDestination)}
  });

  const oldRefGo=window.refGo;
  if(typeof oldRefGo==='function'&&!oldRefGo.__socialInteractiveV5){
    const wrapped=function(id){const r=oldRefGo.apply(this,arguments);if(id==='social'){setTimeout(patch,120);setTimeout(patch,650)}return r};
    wrapped.__socialInteractiveV5=true;wrapped.__previous=oldRefGo;window.refGo=wrapped;
  }

  setTimeout(patch,900);setTimeout(patch,1800);
  window.BLISSocialInteractivePatch=patch;
})();
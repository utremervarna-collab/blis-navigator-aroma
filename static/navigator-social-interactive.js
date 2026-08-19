/* BLIS Navigator — Social Signals interaction controller v2.
   Preserves the original Social chart design, repairs point order/geometry, and keeps KPI drill-down. */
(function(){
  'use strict';
  if(window.__BLISSocialInteractiveV2)return;
  window.__BLISSocialInteractiveV2=true;

  const NS='http://www.w3.org/2000/svg';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const fmt=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});

  function styles(){
    if(document.getElementById('smInteractiveStylesV2'))return;
    const s=document.createElement('style');s.id='smInteractiveStylesV2';s.textContent=`
      #socialBody .sm-kpi[data-sm-destination]{cursor:pointer;position:relative;transition:border-color .16s ease,transform .16s ease,box-shadow .16s ease}
      #socialBody .sm-kpi[data-sm-destination]:hover{border-color:#b9cceb;transform:translateY(-1px);box-shadow:0 8px 22px rgba(23,49,92,.08)}
      #socialBody .sm-kpi[data-sm-destination]:focus-visible{outline:2px solid #1766e8;outline-offset:3px}
      #socialBody .sm-kpi-link{display:block;margin-top:8px;color:#1766e8;font-size:10px;font-weight:700;letter-spacing:.01em}
      #socialBody .sm-anchor-flash{animation:smAnchorFlash .9s ease}
      @keyframes smAnchorFlash{0%{box-shadow:0 0 0 3px rgba(23,102,232,.20)}100%{box-shadow:none}}
      #socialBody #socialTrend .sm-chart svg{width:100%;height:100%;display:block}
      #socialBody #socialTrend .sm-chart circle.sm-social-point{cursor:pointer}
      #socialBody #socialTrend .sm-chart circle.sm-social-point:hover{stroke:#1766e8;stroke-width:2}
    `;document.head.appendChild(s);
  }

  function measuredRows(){
    const src=(typeof H!=='undefined'&&Array.isArray(H))?H:[];
    const byDay=new Map();
    for(const x of src){
      const p=x?.payload||x||{};
      const idx=Array.isArray(p.indices)?p.indices.find(i=>String(i?.key||i?.name||'').toLowerCase()==='presence'):null;
      const value=num(idx?.value),time=x?.time||x?.created_at||x?.date||p?.time||p?.date;
      if(value==null||!time)continue;
      const day=String(time).slice(0,10);
      byDay.set(day,{date:day,value});
    }
    return [...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-30);
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

  /* Keep the original v6 visual: same 760×190 canvas, same five horizontal grid lines,
     same thin angular line and small blue points. Only the temporal order is repaired. */
  function repairOriginalChart(root){
    const host=root.querySelector('#socialTrend .sm-chart');
    const svg=host?.querySelector('svg');
    const rows=measuredRows();
    if(!svg||rows.length<2)return;

    const vb=(svg.getAttribute('viewBox')||'0 0 760 190').trim().split(/\s+/).map(Number);
    const w=vb[2]||760,h=vb[3]||190,l=28,r=10,t=12,b=22;
    const vals=rows.map(x=>x.value),min0=Math.min(...vals),max0=Math.max(...vals);
    const min=Math.max(0,min0-5),max=Math.min(100,max0+5),span=Math.max(1,max-min);
    const X=i=>l+(w-l-r)*i/(rows.length-1),Y=v=>t+(h-t-b)*(1-(v-min)/span);
    const pts=rows.map((row,i)=>({x:X(i),y:Y(row.value),...row}));

    const path=[...svg.querySelectorAll('path')].find(p=>p.getAttribute('fill')==='none'&&p.getAttribute('stroke'));
    if(path){
      path.setAttribute('d',pts.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' '));
      path.setAttribute('stroke-linejoin','miter');
    }

    svg.querySelectorAll('circle').forEach(c=>c.remove());
    for(const p of pts){
      const c=document.createElementNS(NS,'circle');
      c.classList.add('sm-social-point','blis-click-point');
      c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r','2.5');
      c.setAttribute('fill','#1766e8');c.setAttribute('role','button');c.setAttribute('tabindex','0');
      c.dataset.chartDate=p.date;c.dataset.chartValue=String(p.value);c.dataset.chartLabel='Социален индекс';
      c.style.cursor='pointer';c.style.pointerEvents='all';
      const title=document.createElementNS(NS,'title');title.textContent=`${p.date} · ${fmt(p.value)}/100`;c.appendChild(title);
      svg.appendChild(c);
    }

    const meta=root.querySelector('#socialTrend .sm-chart-meta span:first-child b');
    if(meta)meta.textContent=String(rows.length);
  }

  function patch(){
    const root=document.getElementById('socialBody');
    if(!root||!root.children.length)return false;
    styles();markSections(root);makeKpisInteractive(root);repairOriginalChart(root);return true;
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
  if(typeof oldRefGo==='function'&&!oldRefGo.__socialInteractiveV2){
    const wrapped=function(id){const r=oldRefGo.apply(this,arguments);if(id==='social'){setTimeout(patch,120);setTimeout(patch,650)}return r};
    wrapped.__socialInteractiveV2=true;wrapped.__previous=oldRefGo;window.refGo=wrapped;
  }

  setTimeout(patch,900);setTimeout(patch,1800);
  window.BLISSocialInteractivePatch=patch;
})();
/* BLIS Navigator — Social Signals interaction controller v3.
   Green smooth measured curve + interactive points + KPI drill-down. */
(function(){
  'use strict';
  if(window.__BLISSocialInteractiveV3)return;
  window.__BLISSocialInteractiveV3=true;

  const NS='http://www.w3.org/2000/svg';
  const GREEN='#2daf65';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const fmt=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});

  function styles(){
    if(document.getElementById('smInteractiveStylesV3'))return;
    const s=document.createElement('style');s.id='smInteractiveStylesV3';s.textContent=`
      #socialBody .sm-kpi[data-sm-destination]{cursor:pointer;position:relative;transition:border-color .16s ease,transform .16s ease,box-shadow .16s ease}
      #socialBody .sm-kpi[data-sm-destination]:hover{border-color:#b9cceb;transform:translateY(-1px);box-shadow:0 8px 22px rgba(23,49,92,.08)}
      #socialBody .sm-kpi[data-sm-destination]:focus-visible{outline:2px solid #1766e8;outline-offset:3px}
      #socialBody .sm-kpi-link{display:block;margin-top:8px;color:#1766e8;font-size:10px;font-weight:700;letter-spacing:.01em}
      #socialBody .sm-anchor-flash{animation:smAnchorFlash .9s ease}
      @keyframes smAnchorFlash{0%{box-shadow:0 0 0 3px rgba(23,102,232,.20)}100%{box-shadow:none}}
      #socialBody #socialTrend .sm-chart svg{width:100%;height:100%;display:block}
      #socialBody #socialTrend .sm-social-line{fill:none;stroke:${GREEN};stroke-width:3;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
      #socialBody #socialTrend circle.sm-social-point{fill:${GREEN};stroke:#fff;stroke-width:1.7;cursor:pointer;vector-effect:non-scaling-stroke;transition:r .12s ease,stroke-width .12s ease}
      #socialBody #socialTrend circle.sm-social-point:hover,#socialBody #socialTrend circle.sm-social-point.is-selected{r:5.5;stroke-width:2.3}
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

  function smoothPath(pts){
    if(pts.length<2)return'';
    if(pts.length===2)return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
    let d=`M ${pts[0].x} ${pts[0].y}`;
    for(let i=0;i<pts.length-1;i++){
      const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
      const c1x=p1.x+(p2.x-p0.x)/6;
      const c1y=p1.y+(p2.y-p0.y)/6;
      const c2x=p2.x-(p3.x-p1.x)/6;
      const c2y=p2.y-(p3.y-p1.y)/6;
      d+=` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
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

  function repairGreenChart(root){
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

    let path=[...svg.querySelectorAll('path')].find(p=>p.getAttribute('fill')==='none'&&p.getAttribute('stroke'));
    if(!path){path=document.createElementNS(NS,'path');svg.appendChild(path)}
    path.classList.add('sm-social-line');
    path.setAttribute('d',smoothPath(pts));
    path.setAttribute('fill','none');
    path.setAttribute('stroke',GREEN);
    path.setAttribute('stroke-width','3');
    path.setAttribute('stroke-linecap','round');
    path.setAttribute('stroke-linejoin','round');

    svg.querySelectorAll('circle').forEach(c=>c.remove());
    for(const p of pts){
      const c=document.createElementNS(NS,'circle');
      c.classList.add('sm-social-point','blis-click-point');
      c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r','3.5');
      c.setAttribute('fill',GREEN);c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','1.7');
      c.setAttribute('role','button');c.setAttribute('tabindex','0');
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
    styles();markSections(root);makeKpisInteractive(root);repairGreenChart(root);return true;
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
  if(typeof oldRefGo==='function'&&!oldRefGo.__socialInteractiveV3){
    const wrapped=function(id){const r=oldRefGo.apply(this,arguments);if(id==='social'){setTimeout(patch,120);setTimeout(patch,650)}return r};
    wrapped.__socialInteractiveV3=true;wrapped.__previous=oldRefGo;window.refGo=wrapped;
  }

  setTimeout(patch,900);setTimeout(patch,1800);
  window.BLISSocialInteractivePatch=patch;
})();
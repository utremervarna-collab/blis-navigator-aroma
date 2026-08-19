/* BLIS Navigator — Social Signals interaction controller v1.
   Fixes measured chart geometry and makes Social KPI cards navigable. */
(function(){
  'use strict';
  if(window.__BLISSocialInteractiveV1)return;
  window.__BLISSocialInteractiveV1=true;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const fmt=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1,minimumFractionDigits:1});
  const bgDate=s=>{const d=new Date(s||0);return isNaN(d)?String(s||''):d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})};

  function styles(){
    if(document.getElementById('smInteractiveStyles'))return;
    const s=document.createElement('style');s.id='smInteractiveStyles';s.textContent=`
      #socialBody .sm-kpi[data-sm-destination]{cursor:pointer;position:relative;transition:border-color .16s ease,transform .16s ease,box-shadow .16s ease}
      #socialBody .sm-kpi[data-sm-destination]:hover{border-color:#b9cceb;transform:translateY(-1px);box-shadow:0 8px 22px rgba(23,49,92,.08)}
      #socialBody .sm-kpi[data-sm-destination]:focus-visible{outline:2px solid #1766e8;outline-offset:3px}
      #socialBody .sm-kpi-link{display:block;margin-top:8px;color:#1766e8;font-size:10px;font-weight:700;letter-spacing:.01em}
      #socialBody .sm-anchor-flash{animation:smAnchorFlash .9s ease}
      @keyframes smAnchorFlash{0%{box-shadow:0 0 0 3px rgba(23,102,232,.20)}100%{box-shadow:none}}
      #socialBody .sm-chart{min-height:250px!important;height:auto!important;overflow:visible!important;padding:2px 0 0}
      #socialBody .sm-measured-chart{display:block;width:100%;height:224px;overflow:visible}
      #socialBody .sm-measured-chart text{font-family:Arial,sans-serif;fill:#8290a5;font-size:10px}
      #socialBody .sm-measured-chart .sm-y-label{text-anchor:end}
      #socialBody .sm-measured-chart .sm-x-label{text-anchor:middle}
      #socialBody .sm-measured-chart .sm-line{fill:none;stroke:#1766e8;stroke-width:2.5;stroke-linejoin:miter;stroke-linecap:square;vector-effect:non-scaling-stroke}
      #socialBody .sm-measured-chart .sm-point{fill:#1766e8;stroke:#fff;stroke-width:2;cursor:pointer;vector-effect:non-scaling-stroke;transition:r .12s ease}
      #socialBody .sm-measured-chart .sm-point:hover,#socialBody .sm-measured-chart .sm-point.is-selected{r:6.2}
      #socialBody .sm-chart-readout{min-height:24px;margin-top:2px;color:#52647f;font-size:11px}
      #socialBody .sm-chart-readout b{color:#17315c;font-size:13px;margin-right:6px}
    `;document.head.appendChild(s);
  }

  function rawHistory(){
    const src=(typeof H!=='undefined'&&Array.isArray(H))?H:[];
    const byDay=new Map();
    for(const x of src){
      const p=x?.payload||x||{};
      const idx=Array.isArray(p.indices)?p.indices.find(i=>String(i?.key||i?.name||'').toLowerCase()==='presence'):null;
      const value=num(idx?.value),time=x?.time||x?.created_at||x?.date||p?.time||p?.date;
      if(value==null||!time)continue;
      const day=String(time).slice(0,10);
      byDay.set(day,{date:day,value,time});
    }
    let rows=[...byDay.values()].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    if(rows.length>=2)return rows.slice(-30);

    const old=document.querySelector('#socialBody .sm-chart svg');
    if(old){
      rows=[];
      old.querySelectorAll('circle title').forEach(t=>{
        const m=String(t.textContent||'').match(/(\d{4}-\d{2}-\d{2}).*?(-?\d+(?:[.,]\d+)?)/);
        if(m)rows.push({date:m[1],value:Number(m[2].replace(',','.'))});
      });
    }
    return rows.filter(x=>Number.isFinite(x.value)).slice(-30);
  }

  function chartHTML(rows){
    if(rows.length<2)return '<div class="sm-history-empty">Натрупва се измерена история за социалния индекс.<br>Графиката ще се активира след поне две реални измервания.</div>';
    const w=820,h=220,l=54,r=20,t=18,b=42;
    const vals=rows.map(x=>x.value),min0=Math.min(...vals),max0=Math.max(...vals),spread=max0-min0;
    const pad=Math.max(1.5,spread*.22),min=Math.max(0,min0-pad),max=Math.min(100,max0+pad),span=Math.max(1,max-min);
    const X=i=>l+(w-l-r)*(rows.length===1?0:i/(rows.length-1));
    const Y=v=>t+(h-t-b)*(1-(v-min)/span);
    const pts=rows.map((row,i)=>({x:X(i),y:Y(row.value),...row}));
    const path=pts.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const grid=[];
    for(let i=0;i<5;i++){
      const q=i/4,y=t+(h-t-b)*q,v=max-(max-min)*q;
      grid.push(`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e8edf4" stroke-width="1" vector-effect="non-scaling-stroke"/><text class="sm-y-label" x="${l-10}" y="${y+3}">${esc(fmt(v))}</text>`);
    }
    const labelIdx=[0,Math.floor((rows.length-1)/2),rows.length-1].filter((v,i,a)=>a.indexOf(v)===i);
    return `<svg class="sm-measured-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Измерена социална динамика">${grid.join('')}<path class="sm-line" d="${path}"/>${pts.map((p,i)=>`<circle class="sm-point" cx="${p.x}" cy="${p.y}" r="4.4" role="button" tabindex="0" data-sm-date="${esc(p.date)}" data-sm-value="${esc(p.value)}"><title>${esc(bgDate(p.date))} · ${esc(fmt(p.value))}/100</title></circle>`).join('')}${labelIdx.map(i=>`<text class="sm-x-label" x="${pts[i].x}" y="${h-13}">${esc(bgDate(rows[i].date).slice(0,5))}</text>`).join('')}</svg><div id="smChartReadout" class="sm-chart-readout">Кликни върху точка за точната стойност.</div>`;
  }

  const KPI_MAP=[
    {type:'part',id:'socialTrend',hint:'Виж динамиката →'},
    {type:'part',id:'socialTrend',hint:'Виж динамиката →'},
    {type:'part',id:'socialChannels',hint:'Виж каналите →'},
    {type:'part',id:'socialPosts',hint:'Виж публикациите →'},
    {type:'page',page:'signals',hint:'Виж сигналите →'}
  ];

  function markSections(root){
    const cards=[...root.querySelectorAll('.sm-card')];
    for(const c of cards){
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

  function repairChart(root){
    const host=root.querySelector('#socialTrend .sm-chart')||root.querySelector('.sm-chart');
    if(!host)return;
    const rows=rawHistory();
    host.innerHTML=chartHTML(rows);
    const meta=root.querySelector('#socialTrend .sm-chart-meta span:first-child b');
    if(meta)meta.textContent=String(rows.length);
  }

  function patch(){
    const root=document.getElementById('socialBody');
    if(!root||!root.children.length)return false;
    styles();markSections(root);makeKpisInteractive(root);repairChart(root);return true;
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
  function selectPoint(p){
    document.querySelectorAll('#socialBody .sm-point').forEach(x=>x.classList.toggle('is-selected',x===p));
    const out=document.getElementById('smChartReadout');if(out)out.innerHTML=`<b>${esc(fmt(p.dataset.smValue))}/100</b>${esc(bgDate(p.dataset.smDate))}`;
  }

  document.addEventListener('click',e=>{
    const point=e.target?.closest?.('#socialBody .sm-point');if(point){selectPoint(point);return}
    const kpi=e.target?.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi)activate(kpi.dataset.smDestination);
    const nav=e.target?.closest?.('#nav button[data-page="social"]');if(nav){setTimeout(patch,120);setTimeout(patch,650)}
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const point=e.target?.closest?.('#socialBody .sm-point');if(point){e.preventDefault();selectPoint(point);return}
    const kpi=e.target?.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi){e.preventDefault();activate(kpi.dataset.smDestination)}
  });

  const oldRefGo=window.refGo;
  if(typeof oldRefGo==='function'&&!oldRefGo.__socialInteractive){
    const wrapped=function(id){const r=oldRefGo.apply(this,arguments);if(id==='social'){setTimeout(patch,120);setTimeout(patch,650)}return r};
    wrapped.__socialInteractive=true;wrapped.__previous=oldRefGo;window.refGo=wrapped;
  }

  setTimeout(patch,900);setTimeout(patch,1800);
  window.BLISSocialInteractivePatch=patch;
})();
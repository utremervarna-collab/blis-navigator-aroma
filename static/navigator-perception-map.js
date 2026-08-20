(() => {
  'use strict';

  const STYLE_ID='pmxMasterStyles';
  const local={active:'perception',scheduled:0};
  const CAT_LABELS={search:'Търсене',social:'Социални сигнали',reviews:'Отзиви',content:'Съдържание',behavior:'Поведение'};
  const CAT_ICONS={search:'⌕',social:'◉',reviews:'★',content:'▤',behavior:'↗'};

  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{if(v===null||v===undefined||v==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null};
  const fmt=(v,d=1)=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('bg-BG',{minimumFractionDigits:d,maximumFractionDigits:d});
  const marketActive=()=>!!qs('#market.page.active');
  const clientSlug=()=>String(qs('#clientSel')?.value||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma');
  const periodDays=()=>Number(qs('#market [data-pm-period]')?.value)||30;
  const now=()=>Date.now();
  const ctx=()=>{
    let d={},a=[],h=[],s=[],q={};
    try{if(typeof D!=='undefined'&&D)d=D}catch(_){}
    try{if(typeof A!=='undefined'&&Array.isArray(A))a=A}catch(_){}
    try{if(typeof H!=='undefined'&&Array.isArray(H))h=H}catch(_){}
    try{if(typeof S!=='undefined'&&Array.isArray(S))s=S}catch(_){}
    try{if(typeof Q!=='undefined'&&Q)q=Q}catch(_){}
    return{d,a,h,s,q};
  };
  const timeOf=x=>{const raw=x?.observed_at||x?.time||x?.created_at||x?.createdAt||x?.timestamp||x?.date||x?.updated_at;const t=raw?new Date(raw).getTime():NaN;return Number.isFinite(t)?t:null};
  const metricKey=x=>String(x?.metric||x?.metric_key||x?.key||'').toLowerCase();
  const sourceKey=x=>String(x?.source||x?.source_key||'').toLowerCase();
  const displayMetric=k=>String(k||'Измерване').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
  const displayValue=(k,v)=>{const n=num(v);if(n==null)return String(v??'—').slice(0,42);if(/rating/.test(k))return fmt(n,1);if(/_active$|reachable|profile_active|website_active/.test(k))return n>0?'Потвърдено':'Не е потвърдено';return n.toLocaleString('bg-BG',{maximumFractionDigits:1})};

  function indexValue(payload,keys){
    const arr=Array.isArray(payload?.indices)?payload.indices:[];
    for(const key of keys){const hit=arr.find(x=>String(x.key||x.name||'').toLowerCase()===key);const v=num(hit?.value);if(v!=null)return v}
    return null;
  }
  function composite(payload){
    const parts=[
      [indexValue(payload,['reputation','experience','product']),.30],
      [indexValue(payload,['interest','content']),.25],
      [indexValue(payload,['digital']),.25],
      [indexValue(payload,['presence','info']),.20]
    ].filter(x=>x[0]!=null&&x[0]>0);
    const sw=parts.reduce((a,x)=>a+x[1],0);return sw?parts.reduce((a,x)=>a+x[0]*x[1],0)/sw:null;
  }
  function historyRows(project){
    const cut=now()-periodDays()*864e5,byDay=new Map();
    ctx().h.forEach(row=>{const t=timeOf(row);if(t==null||t<cut)return;const v=project(row?.payload||row);if(v==null||!Number.isFinite(v))return;const day=new Date(t).toISOString().slice(0,10),prev=byDay.get(day);if(!prev||t>prev.t)byDay.set(day,{t,v})});
    return[...byDay.values()].sort((a,b)=>a.t-b.t);
  }
  const perceptionSeries=()=>historyRows(p=>composite(p));
  function activityRows(){const cut=now()-periodDays()*864e5;return ctx().a.filter(x=>{const t=timeOf(x);return t!=null&&t>=cut})}
  function dailyCountSeries(filter=()=>true,aggregate='count'){
    const by=new Map();
    activityRows().filter(filter).forEach(x=>{const t=timeOf(x),day=new Date(t).toISOString().slice(0,10),n=num(x.value);if(!by.has(day))by.set(day,[]);by.get(day).push({n,t,x})});
    return[...by.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([day,rows])=>{
      let v=rows.length;
      if(aggregate==='sum')v=rows.reduce((z,r)=>z+(r.n||0),0);
      if(aggregate==='avg'){const n=rows.map(r=>r.n).filter(x=>x!=null);v=n.length?n.reduce((z,x)=>z+x,0)/n.length:null}
      return v==null?null:{t:new Date(day+'T12:00:00').getTime(),v};
    }).filter(Boolean)
  }
  function latestUnique(re){
    const map=new Map();
    activityRows().forEach(x=>{const k=metricKey(x);if(!re.test(k))return;const n=num(x.value);if(n==null)return;const id=sourceKey(x)+'|'+k,t=timeOf(x)||0,prev=map.get(id);if(!prev||t>prev.t)map.set(id,{n,t,x})});
    return[...map.values()]
  }
  function interactionsValue(){
    const rows=latestUnique(/(^|_)(likes|comments|shares|reactions|interactions|clicks|engagement_count|visible_reactions|visible_reaction_markers)$/i).filter(r=>!/rate|pct|percent/i.test(metricKey(r.x)));
    return rows.length?rows.reduce((a,r)=>a+Math.max(0,r.n),0):null
  }
  function interactionsSeries(){return dailyCountSeries(x=>/(^|_)(likes|comments|shares|reactions|interactions|clicks|engagement_count|visible_reactions|visible_reaction_markers)$/i.test(metricKey(x))&&!/rate|pct|percent/i.test(metricKey(x)),'sum')}
  function ratingBundle(){
    const ratings=latestUnique(/(^|_)(rating|average_rating|review_rating|google_rating)$/i).filter(r=>r.n>0&&r.n<=5);
    if(!ratings.length)return{value:null,series:[]};
    const counts=new Map(latestUnique(/(^|_)(ratings|rating_count|review_count|reviews|total_reviews)$/i).map(r=>[sourceKey(r.x),Math.max(0,r.n)]));
    let sw=0,sum=0;ratings.forEach(r=>{const w=counts.get(sourceKey(r.x))||1;sum+=r.n*w;sw+=w});
    const series=dailyCountSeries(x=>/(^|_)(rating|average_rating|review_rating|google_rating)$/i.test(metricKey(x))&&num(x.value)>0&&num(x.value)<=5,'avg');
    return{value:sw?sum/sw:null,series}
  }
  function positiveBundle(){
    const re=/(positive(_share|_sentiment|_pct|_percent)?|sentiment_positive|positive_ratio)$/i,rows=latestUnique(re);
    if(!rows.length)return{value:null,series:[]};
    const norm=v=>v>=0&&v<=1?v*100:v;
    const vals=rows.map(r=>norm(r.n)).filter(v=>v>=0&&v<=100),series=dailyCountSeries(x=>re.test(metricKey(x)),'avg').map(x=>({...x,v:norm(x.v)})).filter(x=>x.v>=0&&x.v<=100);
    return{value:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,series}
  }
  function lastDelta(series){if(series.length<2)return null;return series.at(-1).v-series.at(-2).v}
  function deltaLabel(series,unit=''){const d=lastDelta(series);if(d==null)return{className:'unknown',text:'няма сравнима история'};if(Math.abs(d)<.005)return{className:'flat',text:'→ без промяна'};return{className:d>0?'up':'down',text:`${d>0?'↑':'↓'} ${fmt(Math.abs(d),unit==='%'?1:1)}${unit}`}}
  function spark(series){
    if(!series||series.length<2)return'<span class="pmx-spark-empty"></span>';
    const vals=series.map(x=>x.v),w=150,h=30,p=2,min=Math.min(...vals),max=Math.max(...vals),span=max-min||1;
    const pts=vals.map((v,i)=>`${p+i*(w-p*2)/(vals.length-1)},${h-p-(v-min)*(h-p*2)/span}`).join(' ');
    return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}"/></svg>`
  }
  function readCoreValue(id){const el=qs(`#market .pm-kpi[data-kpi="${id}"] .pm-kpi-value`);if(!el)return null;const m=el.textContent.replace(/\s/g,'').match(/-?\d+(?:[.,]\d+)?/);return m?num(m[0]):null}
  function metricPack(){
    const pSeries=perceptionSeries(),pValue=readCoreValue('perception')??composite(ctx().d),pDelta=lastDelta(pSeries),trendPct=pSeries.length>1&&pSeries.at(-2).v?((pSeries.at(-1).v-pSeries.at(-2).v)/pSeries.at(-2).v*100):null;
    const aSeries=dailyCountSeries(()=>true,'count'),aVal=activityRows().length;
    const iSeries=interactionsSeries(),iVal=interactionsValue();
    const rating=ratingBundle(),positive=positiveBundle();
    return[
      {id:'perception',label:'Индекс на възприятието',value:pValue,display:pValue==null?'—':fmt(pValue,1),suffix:pValue==null?'':'/100',series:pSeries,delta:deltaLabel(pSeries,' т.'),core:'perception',note:'Обобщена оценка от наличните измерими BLIS компоненти.'},
      {id:'trend',label:'Тренд',value:trendPct,display:trendPct==null?'—':`${trendPct>0?'+':''}${fmt(trendPct,1)}%`,suffix:'',series:pSeries,delta:pDelta==null?{className:'unknown',text:'няма сравнение'}:{className:pDelta>0?'up':pDelta<0?'down':'flat',text:`${pDelta>0?'↑':pDelta<0?'↓':'→'} ${fmt(Math.abs(pDelta),1)} т.`},core:'perception',note:'Промяна на индекса спрямо предходното сравнимо измерване.'},
      {id:'activity',label:'Активност',value:aVal,display:aVal.toLocaleString('bg-BG'),suffix:'',series:aSeries,delta:deltaLabel(aSeries,''),core:'presence',note:`Измерени елементи за последните ${periodDays()} дни.`},
      {id:'interactions',label:'Взаимодействия',value:iVal,display:iVal==null?'—':Math.round(iVal).toLocaleString('bg-BG'),suffix:'',series:iSeries,delta:deltaLabel(iSeries,''),core:'presence',note:'Последни измерими реакции, коментари, споделяния и взаимодействия.'},
      {id:'rating',label:'Оценка',value:rating.value,display:rating.value==null?'—':fmt(rating.value,2),suffix:rating.value==null?'':'/5',series:rating.series,delta:deltaLabel(rating.series,''),core:'context',note:'Средна стойност от наличните публично измерени рейтинги.'},
      {id:'positive',label:'Позитивен дял',value:positive.value,display:positive.value==null?'—':`${fmt(positive.value,1)}%`,suffix:'',series:positive.series,delta:deltaLabel(positive.series,'%'),core:'context',note:'Показва се само при измерима позитивна sentiment база.'}
    ]
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
#market .pm-hero{align-items:center!important;margin-bottom:12px!important}#market .pm-hero h2{font-size:23px!important;font-weight:800!important;color:#101828!important;letter-spacing:-.025em!important}#market .pm-hero p{font-size:11px!important;color:#667085!important}
#market .pm-kpis{display:block!important;margin-bottom:11px!important}#market .pm-kpis>.pm-kpi{display:none!important}.pmx-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.pmx-kpi{position:relative;min-width:0;height:104px;padding:11px 12px 8px;border:1px solid #e4e9f0;border-radius:11px;background:#fff;text-align:left;cursor:pointer;overflow:hidden;transition:.16s ease}.pmx-kpi:hover,.pmx-kpi.active{border-color:#b8cef7;box-shadow:0 7px 20px rgba(29,78,216,.07);transform:translateY(-1px)}.pmx-kpi.active:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--pm-accent)}.pmx-kpi-label{display:block;font-size:9px!important;color:#667085;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmx-kpi-main{display:flex;align-items:baseline;gap:5px;margin-top:3px}.pmx-kpi-main strong{font-size:24px;line-height:1;color:#101828;letter-spacing:-.04em}.pmx-kpi-main small{font-size:9px!important;color:#98a2b3}.pmx-kpi-delta{font-size:8px!important;font-weight:750;margin-left:auto;white-space:nowrap}.pmx-kpi-delta.up{color:#0b9b57}.pmx-kpi-delta.down{color:#d64b55}.pmx-kpi-delta.flat,.pmx-kpi-delta.unknown{color:#98a2b3}.pmx-spark{height:26px;margin-top:7px}.pmx-spark svg{width:100%;height:100%;overflow:visible}.pmx-spark polyline{fill:none;stroke:#1766e8;stroke-width:2;vector-effect:non-scaling-stroke}.pmx-spark-empty{display:block;height:1px;background:#edf1f5;margin-top:12px}.pmx-kpi:hover .pmx-spark polyline,.pmx-kpi.active .pmx-spark polyline{stroke:var(--pm-accent)}
#market .pm-focusbar{min-height:38px!important;padding:8px 11px!important;margin-bottom:10px!important}#market .pm-focusbar b{font-size:10px!important}#market .pm-focusbar span,#market .pm-focusbar small{font-size:8.5px!important}
#market .pm-main{grid-template-columns:minmax(0,1fr) 338px!important;gap:11px!important;align-items:stretch!important}#market .pm-main.pmx-drawer-closed{grid-template-columns:1fr!important}#market .pm-mapcard{min-height:650px!important}#market .pm-maphead{height:48px;padding:9px 12px!important}#market .pm-maphead b{font-size:13px!important}#market .pm-maphead small{font-size:8.5px!important}.pmx-map-tools{display:flex;align-items:center;gap:6px;margin-left:auto;margin-right:6px}.pmx-livepill{display:inline-flex;align-items:center;gap:5px;padding:5px 7px;border-radius:7px;background:#eef9f3;color:#138653;font-size:7.5px!important;font-weight:850}.pmx-livepill i{width:5px;height:5px;border-radius:50%;background:#22b573;box-shadow:0 0 0 3px rgba(34,181,115,.10)}.pmx-reset-view{height:28px;padding:0 8px;border:1px solid #e1e7ef;border-radius:7px;background:#fff;color:#475467;font-size:8px!important;font-weight:750;cursor:pointer}
#market .pm-toolbar{padding:8px 10px!important;align-items:center!important}.pmx-filter-label{display:inline-flex;height:30px;align-items:center;padding:0 10px;border-radius:8px;background:#1766e8;color:#fff;font-size:8.5px!important;font-weight:800}.pmx-filter-label:before{content:'▽';margin-right:5px}#market .pm-filterbar label{font-size:7.5px!important}#market .pm-filterbar select{height:30px!important;font-size:9px!important;border-radius:8px!important}.pmx-kind-filter{height:30px;border:1px solid #dfe5ee;background:#fff;color:#475467;border-radius:8px;padding:0 8px;font-size:9px!important;font-weight:650}.pm-node.pmx-kind-hidden{opacity:.07!important;pointer-events:none!important}
#market .pm-drawer{min-height:650px!important;padding:0!important;overflow:auto!important;border-radius:12px!important;background:#fff!important;position:relative}.pmx-inspector{min-height:100%;display:flex;flex-direction:column}.pmx-inspector-head{position:sticky;top:0;z-index:4;height:47px;padding:0 13px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-bottom:1px solid #edf1f5}.pmx-inspector-head b{font-size:12px;color:#101828}.pmx-inspector-head button{border:0;background:transparent;color:#667085;font-size:18px;cursor:pointer}.pmx-inspector-body{padding:13px}.pmx-signal-summary{display:grid;grid-template-columns:39px minmax(0,1fr);gap:10px;align-items:center;padding-bottom:12px;border-bottom:1px solid #edf1f5}.pmx-signal-icon{width:39px;height:39px;border-radius:50%;display:grid;place-items:center;background:#1766e8;color:#fff;font-size:15px;font-weight:850}.pmx-signal-summary small{display:block;font-size:7.5px!important;color:#168457;text-transform:uppercase;font-weight:850;letter-spacing:.05em}.pmx-signal-summary h3{margin:3px 0 2px!important;font-size:13px!important;color:#101828!important}.pmx-signal-summary p{margin:0;font-size:8px!important;color:#98a2b3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmx-signal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}.pmx-signal-stat{padding:8px;border:1px solid #edf1f5;border-radius:8px;background:#f8fafc;min-width:0}.pmx-signal-stat span{display:block;font-size:7px!important;color:#98a2b3}.pmx-signal-stat b{display:block;margin-top:3px;font-size:9px;color:#344054;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmx-section{padding:11px 0;border-top:1px solid #edf1f5}.pmx-section h4{margin:0 0 7px;font-size:8.5px!important;color:#344054;font-weight:820}.pmx-section p{margin:0;font-size:9px!important;line-height:1.5;color:#475467}.pmx-sentbar{display:flex;height:6px;border-radius:99px;overflow:hidden;background:#edf1f5;margin:7px 0}.pmx-sentbar i.pos{background:#27ae68}.pmx-sentbar i.neu{background:#f2b74a}.pmx-sentbar i.neg{background:#e55d68}.pmx-sentlegend{display:flex;justify-content:space-between;gap:5px}.pmx-sentlegend span{font-size:7px!important;color:#667085}.pmx-empty{font-size:8.5px!important;color:#98a2b3!important}.pmx-related{display:grid}.pmx-related button{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;width:100%;padding:8px 1px;border:0;border-bottom:1px solid #f1f3f6;background:#fff;color:#475467;text-align:left;font-size:8.5px!important;cursor:pointer}.pmx-related button:after{content:'›';color:#a6b1c1;font-size:13px}.pmx-source-row{display:grid;grid-template-columns:23px minmax(0,1fr) auto;gap:7px;align-items:center;padding:7px 0;border-bottom:1px solid #f2f4f7}.pmx-source-row i{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:#eef4ff;color:#1766e8;font-style:normal;font-size:7px;font-weight:850}.pmx-source-row span{font-size:8.5px;color:#344054;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmx-source-row b{font-size:7.5px;color:#98a2b3}.pmx-examples{display:grid;gap:6px}.pmx-example{padding:8px 9px;border:1px solid #e7ecf2;border-radius:8px;background:#f8fafc}.pmx-example b{display:block;font-size:8.5px;line-height:1.35;color:#344054;font-weight:700}.pmx-example small{display:block;margin-top:3px;font-size:7px!important;color:#98a2b3}.pmx-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding-top:11px;margin-top:auto}.pmx-actions button{min-height:34px;border:1px solid #dfe6ef;border-radius:8px;background:#fff;color:#344054;font-size:8px!important;font-weight:800;cursor:pointer}.pmx-actions button.primary{background:#1766e8;border-color:#1766e8;color:#fff}.pmx-actions button.saved{background:#eef9f3;border-color:#bee6cf;color:#138653}
#market .pm-lower{display:grid!important;grid-template-columns:1.35fr 1fr 1fr!important;gap:10px!important;margin-top:10px!important}.pmx-lower-card{min-height:198px;padding:13px!important;border-radius:12px!important}.pmx-lower-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.pmx-lower-head h3{margin:0!important;font-size:12px!important;color:#101828}.pmx-lower-head small{font-size:7.5px!important;color:#98a2b3}.pmx-summary-row{display:flex;gap:14px;margin:8px 0 5px}.pmx-summary-row span{font-size:7.5px!important;color:#98a2b3}.pmx-summary-row b{color:#344054}.pmx-chart{height:115px}.pmx-chart svg{width:100%;height:100%;overflow:visible}.pmx-chart line{stroke:#edf1f5}.pmx-chart path{fill:none;stroke:#1766e8;stroke-width:2.2;vector-effect:non-scaling-stroke}.pmx-chart circle{fill:#fff;stroke:#1766e8;stroke-width:1.8;vector-effect:non-scaling-stroke}.pmx-chart text{font-size:7px;fill:#98a2b3}.pmx-chart-empty{height:112px;display:grid;place-items:center;text-align:center;color:#98a2b3;font-size:8.5px;padding:15px}.pmx-change-list{margin-top:8px}.pmx-change-row{display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:7px;align-items:center;width:100%;padding:7px 6px;border:0;border-bottom:1px solid #f0f3f6;background:#fff;text-align:left;cursor:pointer}.pmx-change-row i{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#f3f8ff;color:#1766e8;font-style:normal;font-size:9px;font-weight:800}.pmx-change-row b{display:block;font-size:8.5px;color:#344054}.pmx-change-row small{display:block;font-size:7px!important;color:#98a2b3}.pmx-change-row em{font-style:normal;font-size:8px;font-weight:800}.pmx-change-row.up em{color:#14955b}.pmx-change-row.down em{color:#d64b55}.pmx-change-row.flat em{color:#98a2b3}.pmx-theme-cloud{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.pmx-theme-cloud button{padding:6px 8px;border:1px solid #e1e7ef;border-radius:8px;background:#f8fafc;color:#475467;font-size:8px!important;font-weight:700;cursor:pointer}.pmx-theme-cloud button:hover{border-color:#b8cef7;color:#1766e8;background:#f3f7ff}.pmx-theme-foot{margin-top:10px;padding-top:8px;border-top:1px solid #edf1f5;font-size:7.5px;color:#98a2b3}
@media(max-width:1260px){.pmx-kpis{grid-template-columns:repeat(3,1fr)}#market .pm-main{grid-template-columns:minmax(0,1fr) 310px!important}#market .pm-lower{grid-template-columns:1fr 1fr!important}}@media(max-width:900px){#market .pm-main{grid-template-columns:1fr!important}#market .pm-drawer{min-height:auto!important;max-height:none!important}.pmx-kpis{grid-template-columns:repeat(2,1fr)}#market .pm-lower{grid-template-columns:1fr!important}.pmx-actions{grid-template-columns:1fr 1fr}}@media(max-width:560px){.pmx-kpis{grid-template-columns:1fr 1fr}.pmx-kpi{height:96px;padding:9px}.pmx-kpi-main strong{font-size:20px}.pmx-signal-grid{grid-template-columns:1fr 1fr}.pmx-actions{grid-template-columns:1fr}}
`;
    document.head.appendChild(st)
  }

  function setCopy(){
    const h=qs('#market .pm-hero h2'),p=qs('#market .pm-hero p');
    if(h)h.textContent='Карта на потребителското възприятие';
    if(p)p.textContent='Какво се променя във възприятието за бранда, откъде идва промяната и кои сигнали я формират.';
    const a=qs('#blisActiveModule'),d=qs('#blisSystemDetail');if(marketActive()&&a)a.textContent='Карта на възприятието';if(marketActive()&&d)d.textContent='Свързване на теми, сигнали, източници и историческа динамика.'
  }
  function topCard(m){return`<button class="pmx-kpi ${local.active===m.id?'active':''}" data-pmx-kpi="${m.id}" title="${esc(m.note)}"><span class="pmx-kpi-label">${esc(m.label)}</span><div class="pmx-kpi-main"><strong>${esc(m.display)}</strong><small>${esc(m.suffix)}</small><em class="pmx-kpi-delta ${m.delta.className}">${esc(m.delta.text)}</em></div><div class="pmx-spark">${spark(m.series)}</div></button>`}
  function upgradeKpis(){
    const host=qs('#market .pm-kpis');if(!host)return;
    let master=qs('.pmx-kpis',host);if(!master){master=document.createElement('div');master.className='pmx-kpis';host.appendChild(master)}
    const pack=metricPack();if(!pack.some(x=>x.id===local.active))local.active='perception';master.innerHTML=pack.map(topCard).join('');
    master.querySelectorAll('[data-pmx-kpi]').forEach(b=>b.addEventListener('click',()=>activateMetric(b.dataset.pmxKpi)))
  }
  function activateMetric(id){
    local.active=id;const m=metricPack().find(x=>x.id===id)||metricPack()[0];
    const core=qs(`#market .pm-kpi[data-kpi="${m.core}"]`);if(core)core.click();
    upgradeKpis();setTimeout(()=>{renderLower();syncFocusCopy(m)},0)
  }
  function syncFocusCopy(m){const bar=qs('#market .pm-focusbar');if(!bar||!m)return;bar.innerHTML=`<div><b>${esc(m.label)}</b><span>${esc(m.note)}</span></div><small>${esc(m.delta.text)} · ${periodDays()} дни</small>`}

  function sourceName(key){const s=ctx().s.find(x=>String(x.key||x.source_key||'').toLowerCase()===String(key||'').toLowerCase());return s?.label||s?.name||key||'Източник'}
  function sourceIcon(name){const t=String(name||'').toLowerCase();if(t.includes('facebook'))return'f';if(t.includes('instagram'))return'◎';if(t.includes('linkedin'))return'in';if(t.includes('youtube'))return'▶';if(t.includes('google'))return'G';if(t.includes('tripadvisor'))return'TA';return'•'}
  function sentiment(){
    const fields={pos:/(positive(_share|_sentiment|_pct|_percent)?|sentiment_positive|positive_ratio)$/i,neu:/(neutral(_share|_sentiment|_pct|_percent)?|sentiment_neutral|neutral_ratio)$/i,neg:/(negative(_share|_sentiment|_pct|_percent)?|sentiment_negative|negative_ratio)$/i};
    const out={};for(const [k,re] of Object.entries(fields)){const rows=latestUnique(re);if(rows.length){let vals=rows.map(r=>r.n>=0&&r.n<=1?r.n*100:r.n).filter(v=>v>=0&&v<=100);if(vals.length)out[k]=vals.reduce((a,b)=>a+b,0)/vals.length}}
    if(out.pos==null||out.neu==null||out.neg==null)return null;const sum=out.pos+out.neu+out.neg;if(sum<=0)return null;return{pos:out.pos/sum*100,neu:out.neu/sum*100,neg:out.neg/sum*100}
  }
  function selectedRaw(){
    const d=qs('#pmDrawer'),node=qs('#market .pm-node.selected');if(!d||!node)return null;
    const head=qs('.pm-drawer-head',d),grid=qsa('.pm-detail-grid>div',d),grab=label=>{const x=grid.find(z=>(qs('span',z)?.textContent||'').trim().toLowerCase()===label.toLowerCase());return qs('b',x)?.textContent?.trim()||'—'};
    const rel=qsa('[data-related]',d).map(x=>({id:x.dataset.related,title:x.textContent.trim()}));
    const desc=qsa('.pm-drawer-section',d).map(x=>qs('p',x)?.textContent?.trim()).find(Boolean)||'Проверим сигнал от текущата информационна среда.';
    return{id:node.dataset.node,cat:node.dataset.cat||'content',title:qs('h3',head)?.textContent?.trim()||qs('b',node)?.textContent?.trim()||'Избран сигнал',source:qs('small',head)?.textContent?.trim()||node.dataset.src||'Източник',value:grab('Стойност'),change:grab('Промяна'),period:grab('Период'),description:desc,related:rel}
  }
  function evidenceSources(info){
    const names=new Set([info.source]);
    info.related.forEach(r=>{const n=qs(`#market .pm-node[data-node="${CSS.escape(r.id)}"]`);if(n?.dataset.src)names.add(n.dataset.src)});
    const rows=activityRows();return[...names].filter(Boolean).slice(0,5).map(name=>{const source=ctx().s.find(x=>(x.label||x.name||x.key)===name);const key=String(source?.key||source?.source_key||'').toLowerCase();const count=key?rows.filter(x=>sourceKey(x)===key).length:rows.filter(x=>sourceName(sourceKey(x))===name).length;return{name,count}})
  }
  function examplesFor(info){
    const words=info.title.toLowerCase().split(/[^a-zа-я0-9]+/i).filter(x=>x.length>3).slice(0,3),signals=Array.isArray(ctx().d?.signals)?ctx().d.signals:[];
    let out=signals.filter(s=>{const text=`${s.title||s.label||''} ${s.description||s.detail||s.text||''}`.toLowerCase();return words.some(w=>text.includes(w))}).slice(0,3).map(s=>({text:s.description||s.detail||s.text||s.title||s.label,source:s.source_name||s.source||'BLIS сигнал',time:s.time||s.created_at||''}));
    if(out.length)return out;
    const source=ctx().s.find(x=>(x.label||x.name||x.key)===info.source),key=String(source?.key||source?.source_key||'').toLowerCase();
    out=activityRows().filter(x=>!key||sourceKey(x)===key).slice().sort((a,b)=>(timeOf(b)||0)-(timeOf(a)||0)).slice(0,3).map(x=>({text:`${displayMetric(metricKey(x))}: ${displayValue(metricKey(x),x.value)}`,source:sourceName(sourceKey(x)),time:x.observed_at||x.time||''}));return out
  }
  function routeFor(cat){if(cat==='reviews')return'reputation';if(cat==='social')return'social';if(cat==='search'||cat==='behavior')return'digital';if(cat==='content')return'sources';return'signals'}
  function alertKey(info){return`${clientSlug()}|${info.id}`}
  function savedAlert(info){try{return JSON.parse(localStorage.getItem('blis_pmx_alerts')||'[]').some(x=>x.key===alertKey(info))}catch{return false}}
  function toggleAlert(info){try{let arr=JSON.parse(localStorage.getItem('blis_pmx_alerts')||'[]');const key=alertKey(info),i=arr.findIndex(x=>x.key===key);if(i>=0)arr.splice(i,1);else arr.push({key,title:info.title,client:clientSlug(),created_at:new Date().toISOString()});localStorage.setItem('blis_pmx_alerts',JSON.stringify(arr));renderInspector(info);toast(i>=0?'Алармата е премахната.':'Алармата е създадена за този сигнал.')}catch(_){toast('Алармата не можа да бъде записана.')}
  }
  function toast(text){let t=qs('#pmToast');if(!t){t=document.createElement('div');t.id='pmToast';t.className='pm-toast';document.body.appendChild(t)}t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
  function renderInspector(info){
    const d=qs('#pmDrawer');if(!d||!info)return;d.style.display='';qs('#market .pm-main')?.classList.remove('pmx-drawer-closed');
    const sent=sentiment(),sources=evidenceSources(info),examples=examplesFor(info),cat=CAT_LABELS[info.cat]||'Сигнал',saved=savedAlert(info);
    d.innerHTML=`<div class="pmx-inspector"><div class="pmx-inspector-head"><b>Детайли за сигнал</b><button type="button" data-pmx-close aria-label="Затвори">×</button></div><div class="pmx-inspector-body"><div class="pmx-signal-summary"><span class="pmx-signal-icon">${CAT_ICONS[info.cat]||'◎'}</span><div><small>${esc(cat)}</small><h3>${esc(info.title)}</h3><p>${esc(info.source)}</p></div></div><div class="pmx-signal-grid"><div class="pmx-signal-stat"><span>Стойност</span><b>${esc(info.value)}</b></div><div class="pmx-signal-stat"><span>Промяна</span><b>${esc(info.change)}</b></div><div class="pmx-signal-stat"><span>Период</span><b>${esc(info.period)}</b></div></div><section class="pmx-section"><h4>Ключова тема</h4><p>${esc(info.description)}</p></section><section class="pmx-section"><h4>Настроение</h4>${sent?`<div class="pmx-sentbar"><i class="pos" style="width:${sent.pos}%"></i><i class="neu" style="width:${sent.neu}%"></i><i class="neg" style="width:${sent.neg}%"></i></div><div class="pmx-sentlegend"><span>${fmt(sent.pos,0)}% позитивно</span><span>${fmt(sent.neu,0)}% неутрално</span><span>${fmt(sent.neg,0)}% негативно</span></div>`:'<p class="pmx-empty">Няма достатъчно измерими данни за надеждно sentiment разпределение.</p>'}</section><section class="pmx-section"><h4>Свързани подтеми</h4><div class="pmx-related">${info.related.length?info.related.slice(0,6).map(r=>`<button type="button" data-pmx-related="${esc(r.id)}">${esc(r.title)}</button>`).join(''):'<p class="pmx-empty">Няма допълнителни потвърдени връзки в текущия набор.</p>'}</div></section><section class="pmx-section"><h4>Източници</h4>${sources.length?sources.map(s=>`<div class="pmx-source-row"><i>${sourceIcon(s.name)}</i><span>${esc(s.name)}</span><b>${s.count?`${s.count} елемента`:'източник'}</b></div>`).join(''):'<p class="pmx-empty">Няма свързан измерим източник.</p>'}</section><section class="pmx-section"><h4>Примери за сигнали</h4><div class="pmx-examples">${examples.length?examples.map(x=>`<article class="pmx-example"><b>${esc(x.text)}</b><small>${esc(x.source)}${x.time?` · ${new Date(x.time).toLocaleDateString('bg-BG')}`:''}</small></article>`).join(''):'<p class="pmx-empty">Няма текстови примери в измеримата база.</p>'}</div></section><div class="pmx-actions"><button type="button" data-pmx-alert class="${saved?'saved':''}">${saved?'✓ Алармата е активна':'Създай аларма'}</button><button type="button" class="primary" data-pmx-analytics>Отвори в Аналитика</button></div></div></div>`;
    qs('[data-pmx-close]',d)?.addEventListener('click',()=>{d.style.display='none';qs('#market .pm-main')?.classList.add('pmx-drawer-closed')});
    qsa('[data-pmx-related]',d).forEach(b=>b.addEventListener('click',()=>qs(`#market .pm-node[data-node="${CSS.escape(b.dataset.pmxRelated)}"]`)?.click()));
    qs('[data-pmx-alert]',d)?.addEventListener('click',()=>toggleAlert(info));
    qs('[data-pmx-analytics]',d)?.addEventListener('click',()=>window.refGo?.(routeFor(info.cat)))
  }
  function upgradeDrawer(){const d=qs('#pmDrawer');if(!d)return;if(qs('.pmx-inspector',d))return;const info=selectedRaw();if(info)renderInspector(info)}

  function chart(series,label){
    if(!series||series.length<2)return`<div class="pmx-chart-empty">Нужни са поне две сравними измервания за ${esc(label)}. Не се генерира изкуствена крива.</div>`;
    const w=500,h=112,l=25,r=9,t=10,b=21,vals=series.map(x=>x.v),mn=Math.min(...vals),mx=Math.max(...vals),pad=Math.max((mx-mn)*.18,1),min=mn-pad,max=mx+pad,span=max-min||1,minT=series[0].t,maxT=series.at(-1).t,tr=Math.max(1,maxT-minT),X=x=>l+(w-l-r)*(x.t-minT)/tr,Y=v=>t+(h-t-b)*(1-(v-min)/span),path=series.map((x,i)=>`${i?'L':'M'}${X(x).toFixed(1)} ${Y(x.v).toFixed(1)}`).join(' ');
    return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="${esc(label)}"><line x1="${l}" y1="${t}" x2="${w-r}" y2="${t}"/><line x1="${l}" y1="${(t+h-b)/2}" x2="${w-r}" y2="${(t+h-b)/2}"/><line x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}"/><path d="${path}"/>${series.map(x=>`<circle cx="${X(x)}" cy="${Y(x.v)}" r="2.4"><title>${new Date(x.t).toLocaleDateString('bg-BG')} · ${fmt(x.v,1)}</title></circle>`).join('')}<text x="${l}" y="${h-3}">${new Date(minT).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text><text x="${w-r}" y="${h-3}" text-anchor="end">${new Date(maxT).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text></svg>`
  }
  function topThemes(){
    const nodes=qsa('#market .pm-node').filter(n=>!n.classList.contains('dim')),links=qsa('#market .pm-link'),degree={};nodes.forEach(n=>degree[n.dataset.node]=0);links.forEach(l=>{if(l.dataset.a in degree)degree[l.dataset.a]++;if(l.dataset.b in degree)degree[l.dataset.b]++});
    return nodes.map(n=>({id:n.dataset.node,title:qs('b',n)?.textContent?.trim()||'Тема',cat:n.dataset.cat,deg:degree[n.dataset.node]||0,kind:n.classList.contains('kind-signal')?'Сигнал':n.classList.contains('kind-index')?'Индекс':'Измерване'})).sort((a,b)=>b.deg-a.deg).slice(0,9)
  }
  function renderLower(){
    const host=qs('#market .pm-lower');if(!host)return;const pack=metricPack(),m=pack.find(x=>x.id===local.active)||pack[0],d=lastDelta(m.series),themes=topThemes(),changes=pack.filter(x=>x.id!=='trend').map(x=>({m:x,d:lastDelta(x.series)})).filter(x=>x.d!=null).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)).slice(0,5);
    host.innerHTML=`<section class="pm-card pmx-lower-card"><div class="pmx-lower-head"><div><h3>Динамика на индекса</h3><small>${esc(m.label)} · последните ${periodDays()} дни</small></div></div><div class="pmx-summary-row"><span>Текущо <b>${esc(m.display)}${esc(m.suffix)}</b></span><span>Промяна <b>${d==null?'—':`${d>0?'+':''}${fmt(d,1)}`}</b></span><span>Точки <b>${m.series.length}</b></span></div><div class="pmx-chart">${chart(m.series,m.label)}</div></section><section class="pm-card pmx-lower-card"><div class="pmx-lower-head"><div><h3>Ключови промени</h3><small>Най-големите измерени движения</small></div></div><div class="pmx-change-list">${changes.length?changes.map(x=>{const cls=Math.abs(x.d)<.005?'flat':x.d>0?'up':'down';return`<button type="button" class="pmx-change-row ${cls}" data-pmx-change="${x.m.id}"><i>${x.d>0?'↑':x.d<0?'↓':'→'}</i><span><b>${esc(x.m.label)}</b><small>${esc(x.m.note)}</small></span><em>${x.d>0?'+':''}${fmt(x.d,1)}</em></button>`}).join(''):'<div class="pmx-chart-empty">Няма достатъчно сравнима история за промени.</div>'}</div></section><section class="pm-card pmx-lower-card"><div class="pmx-lower-head"><div><h3>Топ теми</h3><small>Най-свързаните елементи в текущата мрежа</small></div></div><div class="pmx-theme-cloud">${themes.length?themes.map(x=>`<button type="button" data-pmx-theme="${esc(x.id)}" title="${esc((CAT_LABELS[x.cat]||'')+' · '+x.kind)}">${esc(x.title)}</button>`).join(''):'<span class="pmx-empty">Няма достатъчно измерими теми.</span>'}</div><div class="pmx-theme-foot">${themes.length} активни теми · клик върху тема фокусира съответния възел</div></section>`;
    qsa('[data-pmx-change]',host).forEach(b=>b.addEventListener('click',()=>activateMetric(b.dataset.pmxChange)));
    qsa('[data-pmx-theme]',host).forEach(b=>b.addEventListener('click',()=>qs(`#market .pm-node[data-node="${CSS.escape(b.dataset.pmxTheme)}"]`)?.click()))
  }
  function upgradeToolbar(){
    const bar=qs('#market .pm-filterbar');if(bar&&!qs('.pmx-filter-label',bar)){const x=document.createElement('span');x.className='pmx-filter-label';x.textContent='Филтри';bar.prepend(x)}
    if(bar&&!qs('.pmx-kind-filter',bar)){const sel=document.createElement('select');sel.className='pmx-kind-filter';sel.innerHTML='<option value="all">Всички елементи</option><option value="index">Индекси</option><option value="measurement">Измервания</option><option value="signal">Сигнали</option>';sel.addEventListener('change',()=>{const v=sel.value;qsa('#market .pm-node').forEach(n=>{const kind=n.classList.contains('kind-index')?'index':n.classList.contains('kind-signal')?'signal':'measurement';n.classList.toggle('pmx-kind-hidden',v!=='all'&&kind!==v)});renderLower()});bar.appendChild(sel)}
    const head=qs('#market .pm-maphead');if(head&&!qs('.pmx-map-tools',head)){const box=document.createElement('div');box.className='pmx-map-tools';box.innerHTML='<span class="pmx-livepill"><i></i>3D ГЛОБУС</span><button type="button" class="pmx-reset-view">Нулирай изгледа</button>';head.insertBefore(box,qs('.pm-expand',head));qs('.pmx-reset-view',box).addEventListener('click',()=>window.BLISPerceptionGlobe?.reset?.())}
  }

  function enhance(){
    if(!marketActive())return;ensureStyles();setCopy();upgradeKpis();upgradeToolbar();upgradeDrawer();renderLower();const m=metricPack().find(x=>x.id===local.active)||metricPack()[0];syncFocusCopy(m);window.BLISPerceptionGlobe?.apply?.()
  }
  function scheduleEnhance(delay=0){clearTimeout(local.scheduled);local.scheduled=setTimeout(()=>requestAnimationFrame(enhance),delay)}
  function mount(){if(!marketActive()||!window.BLISPerceptionMap)return;window.BLISPerceptionMap.mount?.();scheduleEnhance(0);scheduleEnhance(120)}
  function wrapRoute(name){const fn=window[name];if(typeof fn!=='function'||fn.__pmxMaster)return;const w=function(id){const r=fn.apply(this,arguments);if(id==='market')setTimeout(mount,0);return r};w.__pmxMaster=true;window[name]=w}
  function install(){ensureStyles();wrapRoute('refGo');wrapRoute('go');if(marketActive())mount();const body=qs('#marketBody');if(body){new MutationObserver(()=>{if(marketActive())scheduleEnhance(50)}).observe(body,{childList:true,subtree:true})}}

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="market"]'))setTimeout(mount,0);
    if(e.target.closest?.('#market .pm-node')){const d=qs('#pmDrawer');if(d)d.style.display='';qs('#market .pm-main')?.classList.remove('pmx-drawer-closed');setTimeout(upgradeDrawer,0);setTimeout(renderLower,20)}
  },true);
  document.addEventListener('change',e=>{if(e.target.matches?.('#market [data-pm-period],#market [data-pm-type],#market [data-pm-source]'))scheduleEnhance(80);if(e.target?.id==='clientSel'&&marketActive()){local.active='perception';setTimeout(mount,150)}},true);
  window.addEventListener('blis:clientdata',()=>{if(marketActive()){local.active='perception';setTimeout(mount,120)}});
  window.addEventListener('blis:periodchange',()=>{if(marketActive())scheduleEnhance(60)});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>{if(marketActive())setTimeout(mount,80)},{once:true});
  window.BLISPerceptionBridge={mount,refresh:enhance};
})();
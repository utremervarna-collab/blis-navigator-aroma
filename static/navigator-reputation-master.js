/* BLIS Navigator — Reputation master screen. Real measured values only. */
(function(){
  'use strict';
  const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const clientSlug=()=>{try{return typeof slug!=='undefined'&&slug?slug:(window.BLIS_INITIAL_CLIENT||new URLSearchParams(location.search).get('client')||'aroma')}catch(e){return' ar oma'.replaceAll(' ','')}};
  const dashboard=()=>{try{return typeof D!=='undefined'?D:null}catch(e){return null}};
  const sources=()=>{try{return Array.isArray(S)?S:[]}catch(e){return[]}};
  const activity=()=>{try{return Array.isArray(A)?A:[]}catch(e){return[]}};
  const history=()=>{try{return Array.isArray(H)?H:[]}catch(e){return[]}};
  const quality=()=>{try{return typeof Q!=='undefined'&&Q?Q:{} }catch(e){return{}}};

  const aliases={
    rating:['rating','google_rating','average_rating','review_rating','bolyarka_svetlo_rating'],
    ratings:['ratings','review_count','reviews','rating_count','total_reviews','bolyarka_svetlo_ratings'],
    mentions:['news_mentions_30d','mentions_30d','media_mentions_30d','news30'],
    positive:['positive_keyword_hits','positive_mentions'],
    negative:['negative_keyword_hits','negative_mentions']
  };
  const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9а-я]+/g,'_');
  const numFmt=(v,max=1)=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:max});
  const dateFmt=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})};

  function indexValue(d,key='reputation'){
    if(!d)return null;
    if(key==='blis')return N(d.blis_index);
    const row=(d.indices||[]).find(x=>x&&x.key===key);
    return row?N(row.value):null;
  }
  function allMeasuredObjects(root){
    const out=[],seen=new Set();
    function walk(x,path='',depth=0){
      if(depth>7||x==null)return;
      if(Array.isArray(x)){x.forEach((v,i)=>walk(v,`${path}[${i}]`,depth+1));return}
      if(typeof x!=='object')return;
      if(seen.has(x))return;seen.add(x);
      const key=x.metric_key||x.metric||x.key||x.id||'';
      const label=x.label||x.title||x.name||'';
      if(('value'in x||'display'in x||'numeric'in x)&& (key||label))out.push({key:norm(key),label:String(label||key),value:x.value??x.numeric,display:x.display,source:x.source||x.source_key||'',raw:x,path});
      Object.entries(x).forEach(([k,v])=>{if(!['payload'].includes(k)||depth<5)walk(v,path?`${path}.${k}`:k,depth+1)});
    }
    walk(root);return out;
  }
  function metricFromObjects(objects,keys,labelRx){
    const wanted=(keys||[]).map(norm);
    for(const o of objects){
      if(wanted.some(k=>o.key===k||o.key.endsWith('_'+k)||o.key.includes(k))){const n=N(o.value);if(n!=null)return{value:n,display:o.display,source:o.source||o.raw?.source||'',label:o.label}}
    }
    if(labelRx){for(const o of objects){if(labelRx.test(String(o.label))){const n=N(o.value);if(n!=null)return{value:n,display:o.display,source:o.source||'',label:o.label}}}}
    return null;
  }
  function metricFromActivity(keys){
    const wanted=(keys||[]).map(norm);
    const rows=activity().slice().reverse();
    for(const x of rows){const k=norm(x.metric||x.metric_key);if(wanted.some(w=>k===w||k.includes(w))){const n=N(x.value);if(n!=null)return{value:n,source:x.source||x.source_key||'',label:x.metric||x.metric_key}}}
    return null;
  }
  function keywordMetric(keywords,rx,excludeRx){
    for(const k of keywords||[]){const title=String(k.title||k.keyword||'');if(rx.test(title)&&(!excludeRx||!excludeRx.test(title))){const n=N(k.value);if(n!=null)return{value:n,display:k.display,source:k.source||'',label:title}}}return null;
  }
  function findRating(objects,keywords){return metricFromObjects(objects,aliases.rating,/средна.*оценка|rating/i)||keywordMetric(keywords,/средна.*оценка|rating/i,/брой|ratings|отзив/i)||metricFromActivity(aliases.rating)}
  function findRatings(objects,keywords){return metricFromObjects(objects,aliases.ratings,/публични оценки|брой.*оцен|reviews|ratings/i)||keywordMetric(keywords,/публични оценки|брой.*оцен|отзив/i)||metricFromActivity(aliases.ratings)}
  function findMentions(objects,keywords){return metricFromObjects(objects,aliases.mentions,/медийни споменавания|news mentions|mentions 30/i)||keywordMetric(keywords,/медийни споменавания|нови медийни/i)||metricFromActivity(aliases.mentions)}
  function coverageValue(q){const c=N(q?.coverage);return c!=null?c:null}
  function confidenceValue(d,q){for(const v of [d?.confidence,d?.data_confidence,q?.confidence,q?.reliability]){const n=N(v);if(n!=null)return n}return null}

  function repSeries(h,range){
    const now=Date.now(),cut=range==='all'?0:now-(Number(range)||30)*86400000;
    const pts=[];
    (Array.isArray(h)?h:[]).forEach((row,i)=>{
      const p=row?.payload||row;const v=indexValue(p,'reputation');if(v==null)return;
      const raw=row?.created_at||p?.data_updated||p?.updated_at||'';const t=Date.parse(raw);const time=Number.isFinite(t)?t:i;
      if(cut&&Number.isFinite(t)&&t<cut)return;
      pts.push({value:v,time,date:Number.isFinite(t)?new Date(t):null});
    });
    pts.sort((a,b)=>a.time-b.time);return pts;
  }
  function lastRealDelta(series){if(series.length<2)return null;const cur=series[series.length-1].value;for(let i=series.length-2;i>=0;i--){const d=cur-series[i].value;if(Math.abs(d)>=.05)return d}return 0}
  function deltaHTML(d){if(d==null)return'<span class="rep-na">—</span>';if(Math.abs(d)<.05)return'±0.0';return d>0?`<span class="rep-plus">+${d.toFixed(1)}</span>`:`<span class="rep-minus">−${Math.abs(d).toFixed(1)}</span>`}
  function sourceLabel(key,list){if(!key)return'';const x=list.find(s=>s.key===key||s.source_key===key);return x?.label||key}
  function clientIdentity(d){
    let mono='',name=d?.name||document.querySelector('.client-brand-name')?.textContent||'Клиент';
    try{const x=typeof dossier==='function'?dossier():null;mono=x?.mono||''}catch(e){}
    if(!mono)mono=name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    return{mono,name};
  }
  function freshness(d){
    const raw=d?.data_updated||d?.updated_at;const t=Date.parse(raw||'');if(!Number.isFinite(t))return{cls:'stale',text:'Няма потвърден timestamp'};
    const hrs=(Date.now()-t)/3600000;return hrs<=48?{cls:'',text:`Измерено: ${dateFmt(raw)}`}:{cls:'stale',text:`Последно измерване: ${dateFmt(raw)}`};
  }

  function relevantSources(list){
    const rx=/review|rating|google|tripadvisor|booking|untappd|beeradvocate|pintplease|beertasting|news|media|facebook|instagram|linkedin|youtube|official|website|maps|trustpilot|holidaycheck|expedia|hotels|trivago/i;
    return list.filter(s=>rx.test(`${s.key||''} ${s.label||''} ${s.method||''}`)).slice(0,24);
  }
  function srcCategory(s){const x=norm(`${s.key||''} ${s.label||''}`);if(/review|rating|tripadvisor|booking|untappd|beeradvocate|google_business|google_hotels|holidaycheck|expedia|hotels|trivago/.test(x))return'ratings';if(/news|media/.test(x))return'media';if(/facebook|instagram|linkedin|youtube|tiktok/.test(x))return'social';return'owned'}
  function sourceMeasured(s){const key=s.key||s.source_key;return activity().some(a=>(a.source||a.source_key)===key)}
  function reputationSignals(d){
    const rx=/репутац|оцен|отзив|меди|спомен|негатив|позитив|google|review|rating|trust|status/i;
    return (d?.signals||[]).filter(s=>rx.test(`${s.title||s.label||''} ${s.description||s.detail||s.text||''}`)).slice(0,8);
  }
  function evidenceRows(keywords,rating,ratings,mentions){
    const out=[];
    if(rating)out.push({ico:'★',title:'Средна публична оценка',text:rating.display||`${numFmt(rating.value,2)} от 5`,badge:'Измерено',kind:'info'});
    if(ratings)out.push({ico:'▤',title:'Обем на публичните оценки',text:ratings.display||`${numFmt(ratings.value,0)} оценки/отзива`,badge:'Измерено',kind:'info'});
    if(mentions)out.push({ico:'◉',title:'Медийни споменавания',text:mentions.display||`${numFmt(mentions.value,0)} за последните 30 дни`,badge:'Измерено',kind:'info'});
    (keywords||[]).filter(k=>/оцен|репутац|меди|отзив/i.test(String(k.title||''))).slice(0,4).forEach(k=>{
      if(out.some(x=>x.title===k.title))return;out.push({ico:'⌁',title:k.title||'Репутационно наблюдение',text:k.display||k.explanation||String(k.value??'—'),badge:k.status||'Наблюдение',kind:/огранич|няма|watch/i.test(String(k.status||''))?'watch':'info'});
    });
    return out.slice(0,6);
  }
  function dim(label,ico,value,note,source){return `<div class="rep-card rep-dim"><div><div class="rep-dim-top"><div class="rep-dim-label">${E(label)}</div><div class="rep-dim-icon">${ico}</div></div><div class="rep-dim-value ${value==='—'?'rep-na':''}">${value}</div><div class="rep-dim-note">${E(note)}</div></div><div class="rep-dim-source">${E(source||'Няма отделен измерен източник')}</div></div>`}
  function kpi(label,value,foot){return `<div class="rep-card rep-kpi"><div class="rep-kpi-label">${E(label)}</div><div class="rep-kpi-value ${value==='—'?'rep-na':''}">${value}</div><div class="rep-kpi-foot">${E(foot)}</div></div>`}

  function chartSVG(series){
    if(series.length<2)return'<div class="rep-chart-empty">Нужни са поне две реални исторически измервания, за да се покаже динамика. Не се генерира изкуствена крива.</div>';
    const w=760,h=190,l=34,r=14,t=12,b=24,vals=series.map(x=>x.value),min=Math.max(0,Math.floor(Math.min(...vals)-4)),max=Math.min(100,Math.ceil(Math.max(...vals)+4));
    const span=Math.max(1,max-min),X=i=>l+(w-l-r)*(i/(series.length-1)),Y=v=>t+(h-t-b)*(1-(v-min)/span);
    const grid=[0,.25,.5,.75,1].map(f=>{const v=min+span*f,y=Y(v);return `<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e9edf1"/><text x="2" y="${y+3}" font-size="8" fill="#8996a2">${v.toFixed(0)}</text>`}).join('');
    const d=series.map((p,i)=>(i?'L':'M')+X(i)+' '+Y(p.value)).join(' ');
    const dots=series.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.value)}" r="3" fill="#315b78"><title>${p.date?p.date.toLocaleDateString('bg-BG'):'Измерване'} · ${p.value.toFixed(1)}</title></circle>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Реална динамика на репутационния индекс">${grid}<path d="${d}" fill="none" stroke="#315b78" stroke-width="2.5" vector-effect="non-scaling-stroke"/>${dots}</svg>`;
  }

  let state={range:'30',keywords:[],freshData:null};
  async function fetchFresh(){
    const s=clientSlug(),b=Date.now();
    const get=u=>fetch(u,{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
    const [d,h,src,q,k]=await Promise.all([
      get(`/api/clients/${encodeURIComponent(s)}/dashboard?_=${b}`),get(`/api/clients/${encodeURIComponent(s)}/history?_=${b}`),get(`/api/clients/${encodeURIComponent(s)}/sources?_=${b}`),get(`/api/clients/${encodeURIComponent(s)}/data-quality?_=${b}`),get(`/api/clients/${encodeURIComponent(s)}/keywords?_=${b}`)
    ]);
    state.freshData={d:d||dashboard(),h:Array.isArray(h)?h:history(),src:Array.isArray(src)?src:sources(),q:q||quality(),keywords:Array.isArray(k)?k:[]};
    state.keywords=state.freshData.keywords;return state.freshData;
  }

  function render(data){
    const d=data?.d||dashboard()||{},h=data?.h||history(),src=data?.src||sources(),q=data?.q||quality(),keywords=data?.keywords||[];
    const objects=allMeasuredObjects(d),rep=indexValue(d,'reputation'),rating=findRating(objects,keywords),ratings=findRatings(objects,keywords),mentions=findMentions(objects,keywords),coverage=coverageValue(q),confidence=confidenceValue(d,q),series=repSeries(h,state.range),delta=lastRealDelta(series),identity=clientIdentity(d),fresh=freshness(d),relSources=relevantSources(src),signals=reputationSignals(d),evidence=evidenceRows(keywords,rating,ratings,mentions);
    const allSeries=repSeries(h,'all');
    const histText=allSeries.length>=2?`${allSeries.length} измервания`:(allSeries.length===1?'1 измерване':'—');
    const ratingDisplay=rating?(rating.display||`${numFmt(rating.value,2)} /5`):'—';
    const ratingsDisplay=ratings?(ratings.display||numFmt(ratings.value,0)):'—';
    const mentionsDisplay=mentions?(mentions.display||numFmt(mentions.value,0)):'—';
    const repDisplay=rep==null?'—':rep.toFixed(1);
    const covDisplay=coverage==null?'—':`${numFmt(coverage,0)}%`;
    const confDisplay=confidence==null?'—':`${numFmt(confidence,0)}%`;
    const host=document.getElementById('reputationBody');if(!host)return;
    host.innerHTML=`<div class="rep-screen">
      <div class="rep-head"><div class="rep-title"><h2>Репутация и публичен образ</h2><p>Единна картина на измеримата публична репутация: оценки, отзиви, медийни сигнали, източници и реална историческа динамика. Липсващите измервания се показват като „—“, без заместващи стойности.</p><div class="rep-fresh ${fresh.cls}"><i></i>${E(fresh.text)}</div></div><div class="rep-tools"><button class="rep-btn" id="repRefresh">↻ Обнови данните</button><button class="rep-btn" onclick="location.href='/api/clients/${E(clientSlug())}/generate?type=reputation&format=html'">HTML анализ</button><button class="rep-btn primary" onclick="location.href='/api/clients/${E(clientSlug())}/generate?type=reputation&format=pdf'">PDF анализ</button></div></div>
      <div class="rep-hero">
        <div class="rep-dimension-stack">${dim('Публични оценки','★',ratingDisplay,rating?'Текуща видима средна оценка':'Няма надеждно измерена средна оценка',rating?sourceLabel(rating.source,src):'')}${dim('Информационно покритие','▥',covDisplay,coverage==null?'Няма изчислено покритие':'Дял използваеми данни в текущото наблюдение','BLIS Data Quality')}</div>
        <div class="rep-card rep-column"><div class="rep-brand"><div class="rep-mark">${E(identity.mono)}</div><b>${E(identity.name)}</b><span>репутационен профил</span></div><div class="rep-core"><div class="rep-core-label">Репутационен индекс</div><div class="rep-core-score ${rep==null?'rep-na':''}">${repDisplay}${rep==null?'':'<small>/100</small>'}</div><div class="rep-core-meta">${rep==null?'Няма достатъчна измерима база за индекс':'Стойност от текущия аналитичен модел на профила'}</div></div><div class="rep-column-foot"><div class="rep-mini"><span>Последна измерена промяна</span><b>${deltaHTML(delta)}</b></div><div class="rep-mini"><span>Историческа база</span><b>${E(histText)}</b></div></div></div>
        <div class="rep-dimension-stack">${dim('Медийна среда','◉',mentionsDisplay,mentions?'Измерени споменавания за 30 дни':'Няма надеждно измерен обем за периода',mentions?sourceLabel(mentions.source,src):'')}${dim('Надеждност на данните','✓',confDisplay,confidence==null?'Няма отделна оценка за надеждност':'Текуща оценка на надеждността на използваните данни','BLIS Data Quality')}</div>
      </div>
      <div class="rep-kpis">${kpi('Репутационен индекс',repDisplay,rep==null?'Няма достатъчна база':'Текуща измерена оценка')}${kpi('Средна публична оценка',ratingDisplay,rating?sourceLabel(rating.source,src)||'Публичен източник':'Няма измерване')}${kpi('Обем оценки / отзиви',ratingsDisplay,ratings?sourceLabel(ratings.source,src)||'Публичен източник':'Няма измерване')}${kpi('Медийни споменавания · 30 дни',mentionsDisplay,mentions?sourceLabel(mentions.source,src)||'Медиен източник':'Няма измерване')}${kpi('Последна промяна',deltaHTML(delta),delta==null?'Няма две сравними измервания':'Спрямо последната различна реална стойност')}</div>
      <div class="rep-grid2"><div class="rep-card rep-panel"><div class="rep-panel-head"><div><h3>Реална динамика на репутационния индекс</h3><p>Само записани исторически измервания. Без аналитично генерирани междинни точки.</p></div><div class="rep-range"><button data-range="30" class="${state.range==='30'?'active':''}">30 дни</button><button data-range="90" class="${state.range==='90'?'active':''}">90 дни</button><button data-range="all" class="${state.range==='all'?'active':''}">Всички</button></div></div><div class="rep-chart">${chartSVG(series)}</div><div class="rep-chart-legend"><span>Точки: <b>${series.length}</b></span><span>Последна стойност: <b>${rep==null?'—':rep.toFixed(1)}</b></span><span>Промяна: <b>${delta==null?'—':(delta>0?'+':'')+delta.toFixed(1)}</b></span></div></div>
      <div class="rep-card rep-panel"><div class="rep-panel-head"><div><h3>Репутационни доказателства</h3><p>Измерени стойности и проверими наблюдения от текущия профил.</p></div></div><div class="rep-evidence-list">${evidence.length?evidence.map(x=>`<div class="rep-evidence"><div class="rep-evidence-ico">${x.ico}</div><div><b>${E(x.title)}</b><p>${E(x.text)}</p></div><span class="rep-badge ${x.kind||''}">${E(x.badge||'Данни')}</span></div>`).join(''):'<div class="rep-empty">Няма отделни измерени репутационни доказателства извън текущия индекс.</div>'}</div></div></div>
      <div class="rep-lower"><div class="rep-card rep-panel"><div class="rep-panel-head"><div><h3>Материали и източници</h3><p>Проверимата база зад репутационния модул.</p></div><span class="rep-badge info">${relSources.length} източника</span></div><div class="rep-filter"><button data-filter="all" class="active">Всички</button><button data-filter="ratings">Оценки</button><button data-filter="media">Медии</button><button data-filter="social">Социални</button><button data-filter="owned">Собствени</button></div><div class="rep-source-list">${relSources.length?relSources.map(s=>`<div class="rep-source" data-cat="${srcCategory(s)}"><div><b>${E(s.label||s.key)}</b><p>${E(s.method||'Публичен източник')}</p><div class="rep-src-state">${sourceMeasured(s)?'● Има измерени данни':'○ Конфигуриран източник'}</div></div>${s.url?`<a href="${E(s.url)}" target="_blank" rel="noopener">Отвори ↗</a>`:''}</div>`).join(''):'<div class="rep-empty">Няма конфигурирани репутационни източници.</div>'}</div><details class="rep-method"><summary>Как се интерпретира страницата</summary><p>Репутационният индекс се взема от текущия клиентски аналитичен модел. Оценките, отзивите, медийните споменавания и покритието се показват отделно като доказателства. Липсващо или блокирано измерване не се преобразува в нула.</p></details></div>
      <div class="rep-card rep-panel"><div class="rep-panel-head"><div><h3>Репутационни сигнали</h3><p>Сигнали, които имат пряка връзка с публичното възприятие.</p></div></div><div class="rep-signals">${signals.length?signals.map(s=>{const lv=String(s.level||s.severity||'').toLowerCase(),cl=/high|critical|red/.test(lv)?'high':/watch|warn|medium/.test(lv)?'watch':'';return`<div class="rep-signal ${cl}"><b>${E(s.title||s.label||'Сигнал')}</b><p>${E(s.description||s.detail||s.text||'Наблюдавана промяна в публичната среда.')}</p></div>`}).join(''):'<div class="rep-empty">Няма активен репутационен сигнал в текущия набор от данни.</div>'}</div></div></div>
    </div>`;
    bindInteractions();
  }

  function bindInteractions(){
    document.querySelectorAll('.rep-range button').forEach(b=>b.onclick=()=>{state.range=b.dataset.range;render(state.freshData||{d:dashboard(),h:history(),src:sources(),q:quality(),keywords:state.keywords})});
    document.querySelectorAll('.rep-filter button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.rep-filter button').forEach(x=>x.classList.toggle('active',x===b));const f=b.dataset.filter;document.querySelectorAll('.rep-source').forEach(x=>x.classList.toggle('hidden',f!=='all'&&x.dataset.cat!==f))});
    const refresh=document.getElementById('repRefresh');if(refresh)refresh.onclick=async()=>{refresh.disabled=true;refresh.textContent='Обновяване…';try{render(await fetchFresh());refresh.textContent='✓ Обновено'}catch(e){refresh.textContent='Неуспешно'}setTimeout(()=>{if(document.getElementById('repRefresh')){document.getElementById('repRefresh').disabled=false;document.getElementById('repRefresh').textContent='↻ Обнови данните'}},1200)};
  }

  async function mount(){
    const host=document.getElementById('reputationBody');if(!host)return;
    host.innerHTML='<div class="rep-screen"><div class="rep-card rep-panel"><div class="rep-empty">Зареждане на реалните репутационни измервания…</div></div></div>';
    try{render(await fetchFresh())}catch(e){render({d:dashboard(),h:history(),src:sources(),q:quality(),keywords:[]})}
  }
  function activate(){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById('reputation')?.classList.add('active');document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='reputation'));window.scrollTo({top:0,behavior:'smooth'});mount()}
  function install(){
    if(typeof window.refGo!=='function')return false;
    const old=window.refGo;if(old.__repMaster)return true;
    const wrapped=function(id){if(id==='reputation'){activate();return}return old(id)};wrapped.__repMaster=true;wrapped.__repOld=old;window.refGo=wrapped;return true;
  }
  function boot(){install();document.addEventListener('click',e=>{if(e.target.closest('#nav button[data-page="reputation"]'))setTimeout(()=>{if(document.getElementById('reputation')?.classList.contains('active'))mount()},0)},true);window.addEventListener('blis:clientdata',()=>{if(document.getElementById('reputation')?.classList.contains('active'))mount()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

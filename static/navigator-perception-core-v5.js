(() => {
  'use strict';

  const CLIENTS = {
    aroma:{name:'Aroma Cosmetics',type:'Козметика',mark:'A',accent:'#1677ff',soft:'#eef6ff'},
    bolyarka:{name:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ',accent:'#a61f2b',soft:'#fff2f3'},
    'astor-garden':{name:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG',accent:'#0b6f73',soft:'#ecfafa'},
    'varna-towers':{name:'Varna Towers',type:'Бизнес център / недвижими имоти',mark:'VT',accent:'#315b78',soft:'#eef4f8'}
  };
  const CATS = [
    {id:'search',label:'Търсене',color:'#2979ff'},
    {id:'social',label:'Социални сигнали',color:'#7b61ff'},
    {id:'reviews',label:'Отзиви',color:'#f3a43b'},
    {id:'content',label:'Съдържание',color:'#20a77a'},
    {id:'behavior',label:'Поведение',color:'#df5f8b'}
  ];
  const state={period:30,type:'all',source:'all',view:'map',zoom:1,depth:true,selected:null,kpi:'perception',focusLinks:false};

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const fmt=(v,d=1)=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('bg-BG',{minimumFractionDigits:d,maximumFractionDigits:d});
  const ctx=()=>{
    let d={},q={},a=[],h=[],s=[];
    try{if(typeof D!=='undefined'&&D)d=D}catch(_){}
    try{if(typeof Q!=='undefined'&&Q)q=Q}catch(_){}
    try{if(typeof A!=='undefined'&&Array.isArray(A))a=A}catch(_){}
    try{if(typeof H!=='undefined'&&Array.isArray(H))h=H}catch(_){}
    try{if(typeof S!=='undefined'&&Array.isArray(S))s=S}catch(_){}
    return{d,q,a,h,s};
  };

  function clientKey(){const s=document.getElementById('clientSel');const v=(s&&s.value)||document.body.dataset.client||window.BLIS_INITIAL_CLIENT||'aroma';return CLIENTS[v]?v:'aroma'}
  function client(){return CLIENTS[clientKey()]||CLIENTS.aroma}
  function setTheme(){const c=client();document.documentElement.style.setProperty('--client-accent',c.accent);document.documentElement.style.setProperty('--client-soft',c.soft)}
  function syncNavLabel(){const b=document.querySelector('#nav [data-page="market"]');if(!b)return;const label=b.querySelector('.navtxt')||b.querySelector('span:last-child');if(label&&label.textContent!=='Карта на възприятията')label.textContent='Карта на възприятията'}
  function setSystemCopy(){document.body.classList.add('pm-market-active');const a=document.getElementById('blisActiveModule'),d=document.getElementById('blisSystemDetail');if(a)a.textContent='Карта на възприятията';if(d)d.textContent='Индекси, измервания и потвърдени връзки между сигналите'}

  function indexObj(keys,payload){
    const d=payload||ctx().d,arr=Array.isArray(d?.indices)?d.indices:[];
    for(const key of keys){const hit=arr.find(x=>x.key===key),v=num(hit?.value);if(v!==null)return{key,value:v,label:hit.label||key,raw:hit}}
    return null
  }
  function compositeFromPayload(payload){
    const parts=[
      {hit:indexObj(['reputation','experience','product'],payload),w:.30},
      {hit:indexObj(['interest','content'],payload),w:.25},
      {hit:indexObj(['digital'],payload),w:.25},
      {hit:indexObj(['presence','info'],payload),w:.20}
    ].filter(x=>x.hit&&x.hit.value>0);
    const sw=parts.reduce((a,x)=>a+x.w,0);
    return sw?parts.reduce((a,x)=>a+x.hit.value*x.w,0)/sw:null
  }
  function metricSpec(id,label,hit,cats,note){
    return{id,label,value:hit?.value??null,display:hit?fmt(hit.value):'—',suffix:hit?'/100':'',note:hit?note||`Източник: ${hit.label}.`:'Няма достатъчна измерима база.',cats,histKey:hit?.key}
  }
  function currentMetrics(){
    const {d,q}=ctx();
    const presence=indexObj(['presence']);
    const digital=indexObj(['digital']);
    const interest=indexObj(['interest','content']);
    const fourth=indexObj(['reputation','product','experience','info']);
    const perception=compositeFromPayload(d);
    const confidence=num(d?.confidence),coverage=num(q?.coverage);
    const fourthLabel=fourth?.key==='reputation'?'Репутация':fourth?.key==='product'?'Продуктово представяне':fourth?.key==='experience'?'Потребителско изживяване':'Информационно присъствие';
    return{
      perception:{id:'perception',label:'Индекс на възприятието',value:perception,display:perception===null?'—':fmt(perception),suffix:perception===null?'':'/100',note:`Композитен показател от наличните BLIS индекси${confidence!==null?` · надеждност ${fmt(confidence,0)}%`:''}.`,cats:CATS.map(x=>x.id)},
      presence:metricSpec('presence','Публично присъствие',presence,['social','search'],'Аудитория, активност и публична видимост.'),
      digital:metricSpec('digital','Дигитално присъствие',digital,['search','content','behavior'],'Сайт, e-commerce и дигитална откриваемост.'),
      interest:metricSpec('interest',interest?.key==='interest'?'Публичен интерес':'Съдържание и интерес',interest,['search','social','content'],'Съдържателна активност и наблюдаем интерес.'),
      context:metricSpec('context',fourthLabel,fourth,fourth?.key==='reputation'?['reviews']:fourth?.key==='product'?['behavior','content']:fourth?.key==='experience'?['reviews','behavior']:['content','search'],fourth?.label?`Източник: ${fourth.label}.`:undefined),
      coverage:{id:'coverage',label:'Покритие на данните',value:coverage,display:coverage===null?'—':fmt(coverage,0),suffix:coverage===null?'':'%',note:'Дял на конфигурираните източници с реално измерени данни.',cats:CATS.map(x=>x.id)}
    }
  }

  function rawHistory(key,project){
    const {h}=ctx(),cut=Date.now()-state.period*864e5;
    return h.map(s=>{
      const t=new Date(s.created_at||s.createdAt||0).getTime();
      if(!t||t<cut)return null;
      const v=project?project(s.payload||{}):indexObj([key],s.payload||{})?.value;
      return v===null||v===undefined?null:{t,v:Number(v)}
    }).filter(x=>x&&Number.isFinite(x.v)).sort((a,b)=>a.t-b.t)
  }
  function normalizeSeries(series){
    if(!series.length)return[];
    const byDay=new Map();
    series.forEach(p=>{const day=new Date(p.t).toISOString().slice(0,10);const prev=byDay.get(day);if(!prev||p.t>prev.t)byDay.set(day,p)});
    const daily=[...byDay.values()].sort((a,b)=>a.t-b.t);
    if(daily.length<=2)return daily;
    const out=[daily[0]];
    for(let i=1;i<daily.length-1;i++){
      const prev=out[out.length-1],cur=daily[i],next=daily[i+1];
      if(Math.abs(cur.v-prev.v)>.05||Math.abs(cur.v-next.v)>.05)out.push(cur)
    }
    const last=daily[daily.length-1];
    if(out[out.length-1].t!==last.t)out.push(last);
    return out
  }
  function seriesForMetric(id){
    const m=currentMetrics()[id];
    if(!m)return[];
    if(id==='perception')return normalizeSeries(rawHistory(null,p=>compositeFromPayload(p)));
    if(m.histKey)return normalizeSeries(rawHistory(m.histKey));
    return[]
  }
  function metricDelta(id){
    const s=seriesForMetric(id);
    if(s.length<2)return null;
    return s[s.length-1].v-s[s.length-2].v
  }
  function deltaText(id){
    const d=metricDelta(id);
    if(d===null)return{cls:'unknown',text:'няма сравнима история'};
    if(Math.abs(d)<.05)return{cls:'flat',text:'без промяна'};
    return{cls:d>0?'up':'down',text:`${d>0?'+':''}${fmt(d)} т.`}
  }

  function sourceLabel(key){const {s}=ctx();return s.find(x=>x.key===key)?.label||key||'Източник'}
  function metricLabel(k){
    const map={
      followers:'Публична аудитория',visible_posts_90d:'Публикации за 90 дни',
      news_mentions_30d:'Новинарски споменавания',news_mentions_7d:'Новинарски споменавания за 7 дни',
      rating:'Публична оценка',reviews:'Публични отзиви',profile_active:'Публичен профил',
      website_active:'Официален сайт',ecommerce_active:'Електронна търговия',pricing_visible:'Видими цени',
      cart_active:'Функция за покупка',product_details:'Продуктова информация',category_count:'Продуктови категории',
      language_count:'Езиково покритие',direct_booking:'Директна резервация',monthly_activity:'Месечна активност',
      recent_industry_events:'Секторни прояви',active_offers:'Активни оферти',review_functionality:'Функция за отзиви',
      public_platform_profiles:'Публични платформи',cleanliness:'Чистота',comfort:'Комфорт',location:'Локация',
      facilities:'Удобства',staff:'Персонал',value_for_money:'Цена / качество',wifi:'Безжичен интернет',
      portfolio_items:'Продуктово портфолио'
    };
    return map[k]||String(k||'').replaceAll('_',' ')
  }
  function meaningfulMeasurement(o){
    const k=String(o?.metric||'');
    if(!k)return false;
    if(/response_ms|page_words|html_bytes|page_title|canonical|structured_data|sitemap|contact|email|title$|reachable|term_signal_count|(^|_)score$|words|bytes/i.test(k))return false;
    return /followers|visible_posts|news_mentions|rating|reviews|profile_active|website_active|ecommerce_active|pricing_visible|cart_active|product_details|category_count|language_count|direct_booking|monthly_activity|recent_industry_events|active_offers|review_functionality|public_platform_profiles|cleanliness|comfort|location|facilities|staff|value_for_money|wifi|portfolio_items/i.test(k)
  }
  function catFor(metric,source){
    const s=(String(metric)+' '+String(source)).toLowerCase();
    if(/rating|review|tripadvisor|booking|google_hotels|complaint|untappd|cleanliness|comfort|staff|value_for_money|wifi|facilities/.test(s))return'reviews';
    if(/followers|post|profile|facebook|instagram|linkedin|youtube|tiktok|social/.test(s))return'social';
    if(/search|news|google|mention|trend/.test(s))return'search';
    if(/cart|booking|ecommerce|pricing|direct|intent|visit|traffic|portfolio/.test(s))return'behavior';
    return'content'
  }
  function formatObs(o){
    const v=o?.value;
    if(v===null||v===undefined||v==='')return'—';
    const k=String(o.metric||''),n=num(v);
    if(n!==null&&/_active$|profile_active|website_active|pricing_visible|product_details|direct_booking|ecommerce_active|cart_active|review_functionality/.test(k))return n>0?'Потвърдено':'Не е потвърдено';
    if(n!==null&&/rating/.test(k))return n.toLocaleString('bg-BG',{maximumFractionDigits:1});
    if(n!==null)return n.toLocaleString('bg-BG',{maximumFractionDigits:1});
    return String(v).slice(0,30)
  }
  function indexCat(key){
    if(/reputation|experience/.test(key))return'reviews';
    if(/presence/.test(key))return'social';
    if(/interest/.test(key))return'search';
    if(/digital|info/.test(key))return'content';
    if(/product/.test(key))return'behavior';
    return'content'
  }
  function rawNodes(){
    const {d,a}=ctx(),out=[];
    const indices=(d?.indices||[]).filter(x=>['reputation','experience','presence','interest','content','digital','product','info'].includes(x.key));
    indices.forEach(x=>{
      const v=num(x.value);if(v===null)return;
      const hs=normalizeSeries(rawHistory(x.key)),delta=hs.length>1?hs[hs.length-1].v-hs[hs.length-2].v:null;
      out.push({id:`idx-${x.key}`,cat:indexCat(x.key),title:x.label||metricLabel(x.key),value:`${fmt(v)}/100`,numeric:v,trend:delta,src:'BLIS индекс',kind:'index',time:null,description:x.description||'Съставен индекс от проверими компоненти.'})
    });
    const cut=Date.now()-state.period*864e5;
    (a||[]).filter(o=>{
      const t=new Date(o.time||o.observed_at||0).getTime();
      return meaningfulMeasurement(o)&&(!t||t>=cut)
    }).slice(0,6).forEach((o,i)=>{
      out.push({id:`obs-${i}-${o.metric||'m'}`,cat:catFor(o.metric,o.source),title:metricLabel(o.metric),value:formatObs(o),numeric:num(o.value),trend:null,src:sourceLabel(o.source),kind:'measurement',time:o.time||o.observed_at||null,description:'Последно проверимо измерване от активен източник.'})
    });
    (d?.signals||[]).slice(0,3).forEach((s,i)=>{
      const text=`${s.title||''} ${s.description||s.detail||''}`;
      out.push({id:`sig-${i}`,cat:catFor(text,'signal'),title:s.title||s.label||'Потвърден сигнал',value:'Сигнал',numeric:null,trend:null,src:'BLIS сигнал',kind:'signal',time:s.time||s.created_at||null,description:s.description||s.detail||'Потвърдена промяна в наблюдаваната среда.'})
    });
    return out.slice(0,15)
  }

  function categoryHub(data,cat){return data.find(n=>n.cat===cat&&n.kind==='index')||data.find(n=>n.cat===cat)}
  function buildLinks(data){
    const links=[],byCat=data.reduce((m,n)=>((m[n.cat]??=[]).push(n),m),{});
    Object.entries(byCat).forEach(([cat,arr])=>{
      const hub=categoryHub(data,cat);if(!hub)return;
      arr.forEach(n=>{if(n.id!==hub.id)links.push([hub.id,n.id,'within'])})
    });
    [['search','social'],['search','content'],['social','content'],['reviews','content'],['content','behavior']].forEach(([a,b])=>{
      const x=categoryHub(data,a),y=categoryHub(data,b);
      if(x&&y)links.push([x.id,y.id,'cross'])
    });
    return links
  }
  function mapLayout(data){
    const grouped=CATS.reduce((m,c)=>(m[c.id]=data.filter(n=>n.cat===c.id),m),{});
    const centers={search:10,social:30,reviews:50,content:70,behavior:90};
    CATS.forEach(c=>{
      const arr=grouped[c.id];
      arr.forEach((n,i)=>{
        n.x=arr.length===1?55:30+(54*(i/(arr.length-1)));
        n.y=centers[c.id]+(arr.length>2?(i%2?2.4:-2.4):0)
      })
    });
    return data
  }
  function networkLayout(data,links){
    const deg=Object.fromEntries(data.map(n=>[n.id,0]));
    links.forEach(([a,b])=>{if(a in deg)deg[a]++;if(b in deg)deg[b]++});
    const sorted=[...data].sort((a,b)=>deg[b.id]-deg[a.id]);
    sorted.forEach((n,i)=>{
      if(i===0){n.x=54;n.y=50;return}
      const ring=i<=5?1:2,index=ring===1?i-1:i-6,count=ring===1?5:Math.max(1,sorted.length-6);
      const ang=-Math.PI/2+index*(Math.PI*2/count),rx=ring===1?22:37,ry=ring===1?25:38;
      n.x=54+Math.cos(ang)*rx;n.y=50+Math.sin(ang)*ry
    });
    return data
  }
  function nodesAndLinks(){let data=rawNodes(),links=buildLinks(data);data=state.view==='network'?networkLayout(data,links):mapLayout(data);return{data,links}}
  function linkPath(a,b){
    const x1=a.x*10,y1=a.y*5.9,x2=b.x*10,y2=b.y*5.9;
    if(state.view==='network'){const mx=(x1+x2)/2,my=(y1+y2)/2-18;return`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
    const mid=(x1+x2)/2;return`M${x1} ${y1} C${mid} ${y1},${mid} ${y2},${x2} ${y2}`
  }
  function linksMarkup(data,links){
    const by=Object.fromEntries(data.map(n=>[n.id,n]));
    return links.map(([a,b,kind])=>by[a]&&by[b]?`<path class="pm-link ${kind==='cross'?'cross':''}" data-a="${a}" data-b="${b}" d="${linkPath(by[a],by[b])}"/>`:'').join('')
  }
  function nodeMarkup(n){
    const cat=CATS.find(x=>x.id===n.cat),trend=n.trend===null?'':`<em class="${n.trend<0?'down':Math.abs(n.trend)<.05?'flat':''}">${Math.abs(n.trend)<.05?'без промяна':`${n.trend>0?'+':''}${fmt(n.trend)} т.`}</em>`;
    return`<button class="pm-node kind-${n.kind}${n.id===state.selected?' selected':''}" data-node="${n.id}" data-cat="${n.cat}" data-src="${esc(n.src)}" style="left:${n.x}%;top:${n.y}%;--node:${cat.color}"><span class="pm-kind">${n.kind==='index'?'ИНДЕКС':n.kind==='measurement'?'ИЗМЕРВАНЕ':'СИГНАЛ'}</span><b><span class="pm-dot"></span>${esc(n.title)}</b><small>${esc(n.value)} ${trend}</small></button>`
  }

  function kpiCard(m){
    const active=state.kpi===m.id?' active':'',d=deltaText(m.id);
    return`<button class="pm-kpi${active}" data-kpi="${m.id}" title="${esc(m.note)}"><span class="pm-kpi-label">${esc(m.label)}</span><div class="pm-kpi-value">${esc(m.display)}<small>${esc(m.suffix)}</small></div><span class="pm-kpi-delta ${d.cls}">${esc(d.text)}</span><span class="pm-kpi-note">${esc(m.note)}</span></button>`
  }
  function activeMetric(){return currentMetrics()[state.kpi]||currentMetrics().perception}
  function focusBar(){
    const m=activeMetric(),cats=m.cats?.map(id=>CATS.find(c=>c.id===id)?.label).filter(Boolean).join(' · ')||'Всички слоеве',d=deltaText(m.id);
    return`<div class="pm-focusbar"><div><b>${esc(m.label)}</b><span>${esc(m.note)}</span></div><small>${esc(d.text)} · Фокус: ${esc(cats)}</small></div>`
  }
  function historyMeta(){
    const s=seriesForMetric(activeMetric().id),distinct=new Set(s.map(x=>x.v.toFixed(2))).size;
    return s.length?`${activeMetric().label} · ${state.period} дни · ${s.length} опорни точки · ${distinct} стойности`:`${activeMetric().label} · ${state.period} дни`
  }
  function historyChart(){
    const m=activeMetric(),series=seriesForMetric(m.id);
    if(series.length<2)return`<div class="pm-emptychart"><b>${esc(m.label)}</b><span>Нужни са поне две сравними исторически измервания. Не се рисува изкуствена крива.</span></div>`;
    const w=620,h=118,l=30,r=14,t=12,b=20,vals=series.map(x=>x.v),min=Math.max(0,Math.min(...vals)-4),max=Math.min(100,Math.max(...vals)+4),range=Math.max(1,max-min);
    const minT=series[0].t,maxT=series[series.length-1].t,timeRange=Math.max(1,maxT-minT);
    const X=p=>l+(w-l-r)*((p.t-minT)/timeRange),Y=v=>t+(h-t-b)*(1-(v-min)/range);
    const d=series.map((p,i)=>(i?'L':'M')+X(p)+' '+Y(p.v)).join(' ');
    const grid=[0,.5,1].map(f=>{const v=min+range*f;return`<line x1="${l}" y1="${Y(v)}" x2="${w-r}" y2="${Y(v)}"/><text x="0" y="${Y(v)+3}">${fmt(v,0)}</text>`}).join('');
    const dates=`<text class="pm-date" x="${l}" y="${h-2}">${new Date(minT).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text><text class="pm-date" text-anchor="end" x="${w-r}" y="${h-2}">${new Date(maxT).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text>`;
    return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Историческа динамика на ${esc(m.label)}">${grid}${dates}<path class="pm-history-line" d="${d}"/>${series.map(p=>`<circle cx="${X(p)}" cy="${Y(p.v)}" r="3"><title>${new Date(p.t).toLocaleDateString('bg-BG')} · ${fmt(p.v)}</title></circle>`).join('')}</svg>`
  }

  function sourceOptions(data){return[...new Set(data.map(n=>n.src).filter(Boolean))]}
  function factorNodes(data){return data.filter(n=>n.kind!=='signal').slice(0,6)}
  function render(){
    const root=document.getElementById('marketBody');if(!root)return;
    setTheme();setSystemCopy();syncNavLabel();
    const c=client(),pack=nodesAndLinks(),data=pack.data,links=pack.links,sources=sourceOptions(data),metrics=currentMetrics(),factors=factorNodes(data);
    if(state.source!=='all'&&!sources.includes(state.source))state.source='all';
    if(!state.selected||!data.some(n=>n.id===state.selected))state.selected=data.find(n=>n.kind==='index')?.id||data[0]?.id||null;
    root.innerHTML=`<div class="pm-wrap"><div class="pm-hero"><div><h2>Карта на възприятията</h2><p>Карта на проверимите фактори, които формират текущото възприятие за ${esc(c.name)}.</p></div><div class="pm-client-badge"><span class="pm-client-mark">${esc(c.mark)}</span><span><b>${esc(c.name)}</b><small>${esc(c.type)}</small></span><i>● LIVE</i></div></div><div class="pm-kpis">${Object.values(metrics).map(kpiCard).join('')}</div>${focusBar()}<div class="pm-main"><section class="pm-card pm-mapcard"><div class="pm-maphead"><div><b>${state.view==='map'?'Карта на сигналите':'Мрежа на връзките'}</b><small>${state.view==='map'?'подреждане по тип сигнал':'подреждане по свързаност'} · ${data.length} елемента</small></div><button class="pm-expand" data-expand title="Цял екран">↗</button></div><div class="pm-toolbar"><div class="pm-filterbar"><label>Период<select data-pm-period><option value="7"${state.period===7?' selected':''}>7 дни</option><option value="30"${state.period===30?' selected':''}>30 дни</option><option value="90"${state.period===90?' selected':''}>90 дни</option></select></label><label>Тип<select data-pm-type><option value="all">Всички</option>${CATS.map(x=>`<option value="${x.id}"${state.type===x.id?' selected':''}>${esc(x.label)}</option>`).join('')}</select></label><label>Източник<select data-pm-source><option value="all">Всички</option>${sources.map(x=>`<option value="${esc(x)}"${state.source===x?' selected':''}>${esc(x)}</option>`).join('')}</select></label></div><div class="pm-tools"><div class="pm-viewset"><button class="pm-view${state.view==='map'?' active':''}" data-view="map" title="Подрежда елементите по тип сигнал">Карта</button><button class="pm-view${state.view==='network'?' active':''}" data-view="network" title="Подрежда елементите по свързаност">Мрежа</button></div><button class="pm-depth${state.depth?' active':''}" data-depth title="Включва перспектива и дълбочина">3D</button><button class="pm-zoom" data-zoom="-">−</button><button class="pm-zoom" data-zoom="+">+</button><button class="pm-zoom" data-zoom="reset">${Math.round(state.zoom*100)}%</button></div></div><div class="pm-stage${state.view==='network'?' network':''}${state.depth?' depth':''}"><div class="pm-canvas"><div class="pm-lanes">${CATS.map(x=>`<div class="pm-lane" style="--lane:${x.color}">${esc(x.label)}</div>`).join('')}</div><svg class="pm-links" viewBox="0 0 1000 590" preserveAspectRatio="none">${linksMarkup(data,links)}</svg>${data.map(nodeMarkup).join('')}</div></div></section><aside class="pm-card pm-drawer" id="pmDrawer"></aside></div><div class="pm-lower"><section class="pm-card pm-history"><div class="pm-lower-head"><div><h3>Историческа динамика</h3><span id="pmHistoryLabel">${esc(historyMeta())}</span></div></div><div class="pm-timeline" id="pmTimeline">${historyChart()}</div></section><section class="pm-card"><h3>Какво се променя</h3>${changeList()}</section><section class="pm-card"><h3>Ключови фактори</h3><div class="pm-theme-cloud">${factors.map(n=>`<button data-theme="${n.id}">${esc(n.title)}</button>`).join('')||'<span class="pm-empty">Няма достатъчно измерими фактори.</span>'}</div></section></div><div class="pm-toast" id="pmToast"></div></div>`;
    bind();applyState();selectNode(state.selected,false,data,links)
  }
  function changeList(){
    const metrics=currentMetrics(),rows=Object.values(metrics).filter(m=>m.id!=='coverage').map(m=>({m,d:metricDelta(m.id)})).filter(x=>x.d!==null).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)).slice(0,3);
    if(!rows.length)return'<div class="pm-empty">Няма достатъчна историческа база за сравнение.</div>';
    return rows.map(({m,d})=>{
      const cls=Math.abs(d)<.05?'flat':d>0?'up':'down',txt=Math.abs(d)<.05?'Без промяна спрямо предходното сравнимо измерване':`${d>0?'Покачване':'Спад'} с ${fmt(Math.abs(d))} т.`;
      return`<div class="pm-change ${cls}"><i></i><div><b>${esc(m.label)}</b><small>${esc(txt)}</small></div></div>`
    }).join('')
  }
  function relatedModule(n){
    if(n.cat==='reviews')return{page:'reputation',label:'Репутация'};
    if(n.cat==='social')return{page:'social',label:'Социални канали'};
    if(n.cat==='search'||n.cat==='behavior')return{page:'digital',label:'Дигитална видимост'};
    return{page:'sources',label:'Източници'}
  }
  function drawer(n,links,data){
    const d=document.getElementById('pmDrawer');if(!d||!n)return;
    const cat=CATS.find(x=>x.id===n.cat),rels=links.filter(([a,b])=>a===n.id||b===n.id).map(([a,b])=>a===n.id?b:a).map(id=>data.find(x=>x.id===id)).filter(Boolean),mod=relatedModule(n),trend=n.trend===null?'Няма сравнима серия':Math.abs(n.trend)<.05?'Без промяна':`${n.trend>0?'+':''}${fmt(n.trend)} т.`;
    d.innerHTML=`<div class="pm-drawer-head"><div><div class="pm-category" style="color:${cat.color}">${esc(cat.label)} · ${n.kind==='index'?'индекс':n.kind==='measurement'?'измерване':'сигнал'}</div><h3>${esc(n.title)}</h3><small>${esc(n.src)}</small></div></div><div class="pm-detail-grid"><div><span>Стойност</span><b>${esc(n.value)}</b></div><div><span>Промяна</span><b>${esc(trend)}</b></div><div><span>Източник</span><b>${esc(n.src)}</b></div><div><span>Период</span><b>${n.time?new Date(n.time).toLocaleDateString('bg-BG'):'Текущ'}</b></div></div><div class="pm-drawer-section"><h4>Как се чете</h4><p>${esc(n.description)}</p></div><div class="pm-drawer-section"><h4>Свързани елементи</h4><div class="pm-related">${rels.length?rels.slice(0,5).map(r=>`<button data-related="${r.id}">${esc(r.title)}</button>`).join(''):'<span>Няма допълнителна връзка в текущия набор.</span>'}</div></div><div class="pm-actions"><button class="pm-action" data-focus-links>${state.focusLinks?'Покажи всички връзки':'Покажи само свързаните'}</button><button class="pm-action linklike" data-module>Виж модул „${esc(mod.label)}“ →</button></div>`;
    d.querySelectorAll('[data-related]').forEach(b=>b.addEventListener('click',()=>selectNode(b.dataset.related,true,data,links)));
    d.querySelector('[data-focus-links]')?.addEventListener('click',()=>{state.focusLinks=!state.focusLinks;applyState();drawer(n,links,data)});
    d.querySelector('[data-module]')?.addEventListener('click',()=>window.refGo&&window.refGo(mod.page))
  }
  function selectNode(id,scroll=true,dataArg=null,linksArg=null){
    const pack=dataArg?{data:dataArg,links:linksArg||[]}:nodesAndLinks(),data=pack.data,links=pack.links,n=data.find(x=>x.id===id)||data[0];
    if(!n)return;
    state.selected=n.id;
    document.querySelectorAll('.pm-node').forEach(el=>el.classList.toggle('selected',el.dataset.node===n.id));
    document.querySelectorAll('.pm-link').forEach(el=>el.classList.toggle('hot',el.dataset.a===n.id||el.dataset.b===n.id));
    drawer(n,links,data);
    if(scroll&&innerWidth<900)document.getElementById('pmDrawer')?.scrollIntoView({behavior:'smooth',block:'nearest'})
  }
  function applyState(){
    const m=activeMetric();
    document.querySelectorAll('.pm-node').forEach(el=>{
      const typeOk=state.type==='all'||el.dataset.cat===state.type,sourceOk=state.source==='all'||el.dataset.src===state.source,kpiOk=!m.cats?.length||m.cats.includes(el.dataset.cat);
      el.classList.toggle('dim',!(typeOk&&sourceOk&&kpiOk))
    });
    if(state.focusLinks&&state.selected)document.querySelectorAll('.pm-link').forEach(el=>el.classList.toggle('muted',el.dataset.a!==state.selected&&el.dataset.b!==state.selected));
    else document.querySelectorAll('.pm-link').forEach(el=>el.classList.remove('muted'));
    const canvas=document.querySelector('.pm-canvas');if(canvas)canvas.style.setProperty('--pm-scale',state.zoom);
    document.querySelector('.pm-stage')?.classList.toggle('depth',state.depth)
  }
  function refreshMetricFocus(){
    document.querySelectorAll('[data-kpi]').forEach(x=>x.classList.toggle('active',x.dataset.kpi===state.kpi));
    const bar=document.querySelector('.pm-focusbar');if(bar)bar.outerHTML=focusBar();
    const tl=document.getElementById('pmTimeline');if(tl)tl.innerHTML=historyChart();
    const lab=document.getElementById('pmHistoryLabel');if(lab)lab.textContent=historyMeta();
    applyState()
  }
  function bind(){
    document.querySelectorAll('[data-kpi]').forEach(b=>b.addEventListener('click',()=>{state.kpi=b.dataset.kpi;refreshMetricFocus()}));
    document.querySelectorAll('.pm-node').forEach(b=>{
      b.addEventListener('click',()=>selectNode(b.dataset.node));
      b.addEventListener('mouseenter',()=>document.querySelectorAll('.pm-link').forEach(el=>el.classList.toggle('hot',el.dataset.a===b.dataset.node||el.dataset.b===b.dataset.node)));
      b.addEventListener('mouseleave',()=>document.querySelectorAll('.pm-link').forEach(el=>el.classList.toggle('hot',el.dataset.a===state.selected||el.dataset.b===state.selected)))
    });
    document.querySelector('[data-pm-period]')?.addEventListener('change',e=>{state.period=Number(e.target.value)||30;render()});
    document.querySelector('[data-pm-type]')?.addEventListener('change',e=>{state.type=e.target.value;applyState()});
    document.querySelector('[data-pm-source]')?.addEventListener('change',e=>{state.source=e.target.value;applyState()});
    document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;render()}));
    document.querySelector('[data-depth]')?.addEventListener('click',()=>{state.depth=!state.depth;document.querySelector('[data-depth]')?.classList.toggle('active',state.depth);applyState()});
    document.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{const z=b.dataset.zoom;state.zoom=z==='+'?Math.min(1.25,state.zoom+.08):z==='-'?Math.max(.8,state.zoom-.08):1;const zr=document.querySelector('[data-zoom="reset"]');if(zr)zr.textContent=`${Math.round(state.zoom*100)}%`;applyState()}));
    document.querySelector('[data-expand]')?.addEventListener('click',()=>{const card=document.querySelector('.pm-mapcard');if(!card)return;if(document.fullscreenElement)document.exitFullscreen?.();else card.requestFullscreen?.().catch(()=>{})});
    document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>selectNode(b.dataset.theme)));
    const stage=document.querySelector('.pm-stage'),canvas=document.querySelector('.pm-canvas');
    if(stage&&canvas){
      stage.addEventListener('pointermove',e=>{if(!state.depth||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=stage.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;canvas.style.setProperty('--pm-ry',`${px*6}deg`);canvas.style.setProperty('--pm-rx',`${-py*4.5}deg`)});
      stage.addEventListener('pointerleave',()=>{canvas.style.setProperty('--pm-rx','0deg');canvas.style.setProperty('--pm-ry','0deg')})
    }
  }

  function mount(){const market=document.getElementById('market');if(!market||!market.classList.contains('active'))return;render()}
  window.BLISPerceptionMap={mount,render};
  if(document.getElementById('market')?.classList.contains('active'))requestAnimationFrame(mount);
})();
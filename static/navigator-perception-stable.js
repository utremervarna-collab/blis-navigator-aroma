(() => {
  'use strict';

  let selectedInfo=null, selectedNode='', scheduled=0, clockTimer=0;
  const qs=(s,r=document)=>r?.querySelector?.(s)||null;
  const qsa=(s,r=document)=>r?.querySelectorAll?[...r.querySelectorAll(s)]:[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>{const m=String(v??'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null};
  const marketActive=()=>!!qs('#market.page.active');
  const getD=()=>{try{return typeof D!=='undefined'&&D?D:{}}catch(_){return{}}};
  const getA=()=>{try{return typeof A!=='undefined'&&Array.isArray(A)?A:[]}catch(_){return[]}};
  const getH=()=>{try{return typeof H!=='undefined'&&Array.isArray(H)?H:[]}catch(_){return[]}};
  const getS=()=>{try{return typeof S!=='undefined'&&Array.isArray(S)?S:[]}catch(_){return[]}};
  const periodDays=()=>Number(qs('#market [data-pm-period]')?.value)||30;
  const timeOf=x=>{const raw=x?.observed_at||x?.time||x?.created_at||x?.createdAt||x?.timestamp||x?.date||x?.updated_at;const t=raw?new Date(raw).getTime():NaN;return Number.isFinite(t)?t:null};
  const sourceOf=x=>String(x?.source||x?.source_key||'').trim();
  const metricOf=x=>String(x?.metric||x?.metric_key||x?.key||'').trim().toLowerCase();
  const fmt=(v,d=1)=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('bg-BG',{minimumFractionDigits:d,maximumFractionDigits:d});

  function sourceName(key){const hit=getS().find(x=>String(x.key||x.source_key||'').toLowerCase()===String(key||'').toLowerCase());return hit?.label||hit?.name||key||'Източник'}
  function relTime(t){if(!t)return'—';const s=Math.max(0,Math.floor((Date.now()-t)/1000));if(s<60)return'преди малко';if(s<3600)return`преди ${Math.floor(s/60)} мин.`;if(s<86400)return`преди ${Math.floor(s/3600)} ч.`;return new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}
  function metricName(k){
    const key=String(k||'').toLowerCase();
    const map={followers:'Аудитория',visible_posts_90d:'Публикации',news_mentions_30d:'Медийни споменавания',news_mentions_7d:'Медийни споменавания',rating:'Оценка',average_rating:'Средна оценка',reviews:'Отзиви',review_count:'Брой отзиви',ratings:'Брой оценки',rating_count:'Брой оценки',profile_active:'Публичен профил',website_active:'Официален сайт',ecommerce_active:'Електронна търговия',pricing_visible:'Видими цени',cart_active:'Функция за покупка',product_details:'Продуктова информация',category_count:'Продуктови категории',language_count:'Езиково покритие',direct_booking:'Директна резервация',monthly_activity:'Месечна активност',portfolio_items:'Портфолио',brand_visible:'Видимост на марката',brand_mentions_on_result:'Споменавания на марката',news_sources_30d:'Медийни източници',positive_keyword_hits:'Позитивни сигнали',negative_keyword_hits:'Негативни сигнали',social_links:'Социални канали',recent_industry_events:'Индустриални събития'};
    return map[key]||key.replaceAll('_',' ').replace(/^./,m=>m.toUpperCase())
  }
  function isClientMetric(x){
    const k=metricOf(x);
    if(!k)return false;
    return !/(response_ms|page_words|reachable|search_url|page_title|term_signal_count|relevant_term_hits|contact_terms|email_visible|price_markers|aroma_mentions|sitemap_|category_signal_count|content_words|url$)/i.test(k)
  }
  function valueText(x){
    const k=metricOf(x),v=x?.value,n=Number(v);
    if(Number.isFinite(n)&&(/_active$|profile_active|website_active|pricing_visible|cart_active|ecommerce_active|direct_booking|brand_visible/.test(k)))return n>0?'Да':'Не';
    if(Number.isFinite(n)&&/rating/.test(k)&&!/count|ratings/.test(k))return n.toLocaleString('bg-BG',{maximumFractionDigits:1});
    if(Number.isFinite(n))return n.toLocaleString('bg-BG',{maximumFractionDigits:1});
    return String(v??'—').slice(0,30)
  }
  function coreValue(id){const el=qs(`#market .pm-kpi[data-kpi="${id}"] .pm-kpi-value`);return num(el?.textContent)}
  function indexValue(payload,keys){const arr=Array.isArray(payload?.indices)?payload.indices:[];for(const k of keys){const hit=arr.find(x=>String(x.key||'').toLowerCase()===k),v=Number(hit?.value);if(Number.isFinite(v))return v}return null}
  function composite(payload){const parts=[[indexValue(payload,['reputation','experience','product']),.30],[indexValue(payload,['interest','content']),.25],[indexValue(payload,['digital']),.25],[indexValue(payload,['presence','info']),.20]].filter(x=>x[0]!=null&&x[0]>0),sw=parts.reduce((a,x)=>a+x[1],0);return sw?parts.reduce((a,x)=>a+x[0]*x[1],0)/sw:null}
  function perceptionSeries(){const cut=Date.now()-periodDays()*864e5,by=new Map();getH().forEach(row=>{const t=timeOf(row),v=composite(row?.payload||row);if(!t||t<cut||v==null)return;const day=new Date(t).toISOString().slice(0,10),prev=by.get(day);if(!prev||t>prev.t)by.set(day,{t,v})});return[...by.values()].sort((a,b)=>a.t-b.t)}
  function latestUnique(re){const map=new Map(),cut=Date.now()-periodDays()*864e5;getA().forEach(x=>{const t=timeOf(x);if(!t||t<cut)return;const k=metricOf(x);if(!re.test(k))return;const n=num(x.value);if(n==null)return;const id=sourceOf(x)+'|'+k,prev=map.get(id);if(!prev||t>prev.t)map.set(id,{x,n,t})});return[...map.values()]}
  function ratingValue(){const rows=latestUnique(/(^|_)(rating|average_rating|review_rating|google_rating)$/i).filter(r=>r.n>0&&r.n<=5);if(!rows.length)return null;return rows.reduce((a,r)=>a+r.n,0)/rows.length}
  function signalCount(){const arr=Array.isArray(getD()?.signals)?getD().signals:[];return arr.length||qsa('#market .pm-node.kind-signal').length}
  function sourceCount(){const cut=Date.now()-periodDays()*864e5,set=new Set();getA().forEach(x=>{const t=timeOf(x);if(t&&t>=cut&&sourceOf(x)&&isClientMetric(x))set.add(sourceOf(x))});return set.size}
  function topPack(){
    const series=perceptionSeries(),current=coreValue('perception')??composite(getD()),prev=series.length>1?series.at(-2).v:null,latest=series.at(-1)?.v??current,delta=latest!=null&&prev!=null?latest-prev:null,rate=ratingValue();
    return[
      {label:'Общо възприятие',value:current==null?'—':fmt(current,1),suffix:current==null?'':'/100',delta:delta==null?'':`${delta>0?'↑':delta<0?'↓':'→'} ${fmt(Math.abs(delta),1)} т.`,cls:delta>0?'up':delta<0?'down':'',foot:'обобщена картина от наличните измервания',action:'perception'},
      {label:'Промяна за периода',value:delta==null?'—':`${delta>0?'+':''}${fmt(delta,1)}`,suffix:delta==null?'':' т.',delta:'',cls:delta>0?'up':delta<0?'down':'',foot:`спрямо предходното сравнимо измерване`,action:'perception'},
      {label:'Активни сигнали',value:String(signalCount()),suffix:'',delta:'',cls:'',foot:`наблюдавани в текущия профил`,action:'signals'},
      rate!=null?{label:'Средна оценка',value:fmt(rate,1),suffix:'/5',delta:'',cls:'',foot:'от наличните публично измерени рейтинги',action:'rating'}:{label:'Активни източници',value:String(sourceCount()),suffix:'',delta:'',cls:'',foot:`с клиентски данни за ${periodDays()} дни`,action:'sources'}
    ]
  }
  function renderTop(){
    const host=qs('#market .pm-kpis');if(!host)return;
    let wrap=qs('.pms-kpis',host);if(!wrap){wrap=document.createElement('div');wrap.className='pms-kpis';host.appendChild(wrap)}
    const pack=topPack(),sig=JSON.stringify(pack);if(wrap.dataset.sig===sig)return;wrap.dataset.sig=sig;
    wrap.innerHTML=pack.map(x=>`<button type="button" class="pms-kpi" data-pms-action="${x.action}"><span class="pms-kpi-label">${esc(x.label)}</span><div class="pms-kpi-row"><strong class="pms-kpi-value">${esc(x.value)}${x.suffix?` <small>${esc(x.suffix)}</small>`:''}</strong>${x.delta?`<em class="pms-kpi-delta ${x.cls}">${esc(x.delta)}</em>`:''}</div><span class="pms-kpi-foot">${esc(x.foot)}</span></button>`).join('');
    qsa('[data-pms-action]',wrap).forEach(b=>b.onclick=()=>{const a=b.dataset.pmsAction;if(a==='signals'){qs('#market .pm-node.kind-signal')?.click()}else if(a==='sources'){window.refGo?.('sources')}else{qs(`#market .pm-kpi[data-kpi="${a}"]`)?.click()}})
  }

  function captureInfo(){
    const d=qs('#pmDrawer'),node=qs('#market .pm-node.selected');if(!d||!node)return selectedInfo;if(qs('.pms-panel',d))return selectedInfo;
    const head=qs('.pm-drawer-head',d),grid=qsa('.pm-detail-grid>div',d);if(!head)return selectedInfo;
    const grab=label=>{const x=grid.find(z=>(qs('span',z)?.textContent||'').trim().toLowerCase()===label.toLowerCase());return qs('b',x)?.textContent?.trim()||'—'};
    const sections=qsa('.pm-drawer-section',d),desc=sections.map(x=>qs('p',x)?.textContent?.trim()).find(Boolean)||'Показател от текущата информационна среда.';
    const related=qsa('[data-related]',d).map(x=>({id:x.dataset.related,title:x.textContent.trim()}));
    selectedNode=node.dataset.node||'';
    selectedInfo={id:selectedNode,cat:node.dataset.cat||'content',title:qs('h3',head)?.textContent?.trim()||qs('b',node)?.textContent?.trim()||'Избран сигнал',source:qs('small',head)?.textContent?.trim()||node.dataset.src||'Източник',value:grab('Стойност'),change:grab('Промяна'),period:grab('Период'),description:desc,related};
    return selectedInfo
  }
  function categoryLabel(cat){return({search:'Търсене',social:'Социални канали',reviews:'Отзиви',content:'Съдържание',behavior:'Поведение'})[cat]||'Сигнал'}
  function relatedSources(info){const names=new Set([info.source]);info.related.forEach(r=>{const n=qs(`#market .pm-node[data-node="${CSS.escape(r.id)}"]`);if(n?.dataset.src)names.add(n.dataset.src)});return[...names].filter(Boolean).slice(0,5)}
  function latestUpdate(){const d=getD(),t=timeOf({time:d?.data_updated||d?.updated_at});if(t)return t;return getA().map(timeOf).filter(Boolean).sort((a,b)=>b-a)[0]||null}
  function routeFor(cat){return cat==='reviews'?'reputation':cat==='social'?'social':cat==='search'||cat==='behavior'?'digital':'sources'}
  function renderInspector(){
    const d=qs('#pmDrawer');if(!d)return;const info=captureInfo();if(!info)return;const sources=relatedSources(info),upd=latestUpdate();const cls=/^\+|↑/.test(info.change)?'up':/^-|↓/.test(info.change)?'down':'';
    const saved=(()=>{try{return localStorage.getItem(`blis-watch:${document.body.dataset.client||'client'}:${info.id}`)==='1'}catch(_){return false}})();
    const sig=JSON.stringify({info,sources,saved});if(d.dataset.pmsSig===sig&&qs('.pms-panel',d))return;d.dataset.pmsSig=sig;
    d.innerHTML=`<div class="pms-panel"><div class="pms-panel-head"><b>Какво показва сигналът</b><span class="pms-live-chip"><i></i>АКТУАЛНО</span></div><div class="pms-panel-body"><div class="pms-signal-top"><span class="pms-signal-icon">◎</span><div><small>${esc(categoryLabel(info.cat))}</small><h3>${esc(info.title)}</h3><p>${esc(info.source)}</p></div></div><div class="pms-signal-value"><span class="pms-value-label">Текуща стойност</span><div class="pms-value-row"><strong>${esc(info.value)}</strong>${info.change&&info.change!=='—'?`<em class="${cls}">${esc(info.change)}</em>`:''}</div><div class="pms-value-foot"><span>${esc(info.period||'Текущ период')}</span><span data-pms-time="${upd||''}">${esc(relTime(upd))}</span></div></div><div class="pms-facts"><div class="pms-fact"><span>Източници</span><b>${sources.length}</b></div><div class="pms-fact"><span>Свързани теми</span><b>${info.related.length}</b></div></div><section class="pms-section"><h4>Какво означава</h4><p>${esc(info.description)}</p></section>${sources.length?`<section class="pms-section"><h4>Източници</h4><div class="pms-source-chips">${sources.map(x=>`<span class="pms-source-chip">${esc(x)}</span>`).join('')}</div></section>`:''}${info.related.length?`<section class="pms-section"><h4>Свързани теми</h4><div class="pms-related">${info.related.slice(0,5).map(r=>`<button type="button" data-pms-related="${esc(r.id)}">${esc(r.title)}</button>`).join('')}</div></section>`:''}<div class="pms-actions"><button type="button" data-pms-watch class="${saved?'saved':''}">${saved?'✓ Следиш сигнала':'Следи сигнал'}</button><button type="button" class="primary" data-pms-module>Отвори анализа</button></div></div></div>`;
    qsa('[data-pms-related]',d).forEach(b=>b.onclick=()=>qs(`#market .pm-node[data-node="${CSS.escape(b.dataset.pmsRelated)}"]`)?.click());
    qs('[data-pms-watch]',d)?.addEventListener('click',e=>{let on=false;try{const k=`blis-watch:${document.body.dataset.client||'client'}:${info.id}`;on=localStorage.getItem(k)!=='1';localStorage.setItem(k,on?'1':'0')}catch(_){}e.currentTarget.classList.toggle('saved',on);e.currentTarget.textContent=on?'✓ Следиш сигнала':'Следи сигнал'});
    qs('[data-pms-module]',d)?.addEventListener('click',()=>window.refGo?.(routeFor(info.cat)))
  }

  function chart(series){
    if(series.length<2)return'<div class="pms-chart-empty">Графиката ще се появи след поне две сравними измервания.</div>';
    const w=640,h=138,l=8,r=8,t=8,b=20,vals=series.map(x=>x.v),mn=Math.min(...vals),mx=Math.max(...vals),pad=Math.max((mx-mn)*.22,1),min=mn-pad,max=mx+pad,span=max-min||1,minT=series[0].t,maxT=series.at(-1).t,tr=Math.max(1,maxT-minT),X=x=>l+(w-l-r)*(x.t-minT)/tr,Y=v=>t+(h-t-b)*(1-(v-min)/span),line=series.map((x,i)=>`${i?'L':'M'}${X(x).toFixed(1)} ${Y(x.v).toFixed(1)}`).join(' '),area=`${line} L${X(series.at(-1)).toFixed(1)} ${h-b} L${X(series[0]).toFixed(1)} ${h-b} Z`;
    return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="pmsStableArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1766e8" stop-opacity=".20"/><stop offset="1" stop-color="#1766e8" stop-opacity=".015"/></linearGradient></defs><line class="grid" x1="${l}" y1="${t+25}" x2="${w-r}" y2="${t+25}"/><line class="grid" x1="${l}" y1="${t+65}" x2="${w-r}" y2="${t+65}"/><line class="grid" x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}"/><path class="area" d="${area}"/><path class="line" d="${line}"/>${series.map(x=>`<circle cx="${X(x)}" cy="${Y(x.v)}" r="2.7"><title>${new Date(x.t).toLocaleDateString('bg-BG')} · ${fmt(x.v,1)}</title></circle>`).join('')}<text x="${l}" y="${h-3}">${new Date(minT).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text><text x="${w-r}" y="${h-3}" text-anchor="end">${new Date(maxT).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text></svg>`
  }
  function latestRows(){const cut=Date.now()-periodDays()*864e5;return getA().map(x=>({x,t:timeOf(x)})).filter(r=>r.t&&r.t>=cut&&isClientMetric(r.x)).sort((a,b)=>b.t-a.t).slice(0,6)}
  function renderLower(){
    const host=qs('#market .pm-lower');if(!host)return;const series=perceptionSeries(),current=series.at(-1)?.v??coreValue('perception')??composite(getD()),delta=series.length>1?series.at(-1).v-series.at(-2).v:null,rows=latestRows(),sources=new Set(rows.map(r=>sourceOf(r.x)).filter(Boolean)).size;
    const sig=JSON.stringify({series:series.map(x=>[x.t,x.v]),current,delta,rows:rows.map(r=>[metricOf(r.x),r.x.value,sourceOf(r.x),r.t])});if(host.dataset.pmsSig===sig&&qs('.pms-bottom-card',host))return;host.dataset.pmsSig=sig;
    host.innerHTML=`<section class="pm-card pms-bottom-card"><div class="pms-bottom-head"><div><h3>Как се променя възприятието</h3><p>Общата посока през избрания период</p></div><span class="pms-bottom-live"><i></i>актуални данни</span></div><div class="pms-trend-top"><div class="pms-trend-number"><strong>${current==null?'—':fmt(current,1)}</strong><span>/100</span></div>${delta==null?'':`<div class="pms-trend-change ${delta>0?'up':delta<0?'down':''}">${delta>0?'↑':delta<0?'↓':'→'} ${fmt(Math.abs(delta),1)} т.</div>`}</div><div class="pms-chart">${chart(series)}</div></section><section class="pm-card pms-bottom-card"><div class="pms-bottom-head"><div><h3>Последно отчетени показатели</h3><p>Най-новите измерими данни с значение за бранда</p></div><span class="pms-bottom-live"><i></i>АКТУАЛНО</span></div><div class="pms-stream">${rows.length?rows.map(({x,t})=>`<div class="pms-stream-row"><i class="pms-stream-dot"></i><div class="pms-stream-copy"><b>${esc(metricName(metricOf(x)))}</b><small>${esc(sourceName(sourceOf(x)))}</small></div><div class="pms-stream-value"><b>${esc(valueText(x))}</b><small data-pms-time="${t}">${esc(relTime(t))}</small></div></div>`).join(''):'<div class="pms-chart-empty">Няма нови клиентски измервания за избрания период.</div>'}</div>${rows.length?`<div class="pms-stream-foot"><span>${rows.length} последни показателя</span><span>${sources} източника</span></div>`:''}</section>`
  }

  function simplifyCopy(){const h=qs('#market .pm-hero h2'),p=qs('#market .pm-hero p');if(h)h.textContent='Карта на възприятието';if(p)p.textContent='Какво формира възприятието за бранда, как се променя и откъде идват сигналите.';const sys=qs('#blisActiveModule');if(sys&&marketActive())sys.textContent='Пазарни сигнали'}
  function applyAll(){if(!marketActive())return;renderTop();captureInfo();renderInspector();renderLower();simplifyCopy();window.BLISPerceptionGlobe?.apply?.()}
  function schedule(delay=0){clearTimeout(scheduled);scheduled=setTimeout(()=>requestAnimationFrame(applyAll),delay)}
  function updateTimes(){qsa('#market [data-pms-time]').forEach(el=>{const t=Number(el.dataset.pmsTime);if(t)el.textContent=relTime(t)})}
  function initialBoot(){[80,260,650,1100,1700].forEach(ms=>setTimeout(()=>{if(marketActive())applyAll()},ms));clearInterval(clockTimer);clockTimer=setInterval(()=>{if(marketActive())updateTimes()},60000)}

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="market"]')){selectedInfo=null;setTimeout(()=>schedule(0),140)}
    const node=e.target.closest?.('#market .pm-node');if(node){if(node.dataset.node!==selectedNode)selectedInfo=null;setTimeout(()=>{captureInfo();renderInspector()},70)}
  },true);
  document.addEventListener('change',e=>{if(e.target.matches?.('#market [data-pm-period],#market [data-pm-type],#market [data-pm-source],#clientSel')){selectedInfo=null;setTimeout(()=>schedule(0),120)}},true);
  window.addEventListener('blis:clientdata',()=>{selectedInfo=null;setTimeout(()=>schedule(0),150)});
  window.addEventListener('blis:periodchange',()=>setTimeout(()=>schedule(0),100));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialBoot,{once:true});else initialBoot();
  window.addEventListener('load',()=>setTimeout(()=>schedule(0),120),{once:true});
  window.BLISPerceptionStable={refresh:applyAll};
})();

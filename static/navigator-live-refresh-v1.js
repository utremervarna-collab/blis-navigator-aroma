/* BLIS Navigator — visible mention streams v6.
   Lightweight, event-driven chronology for Monitoring and Competition. */
(function(){
'use strict';
if(window.__BLIS_LIVE_REFRESH_V6)return;
window.__BLIS_LIVE_REFRESH_V6=true;
window.__BLIS_LIVE_REFRESH_V5=true;
window.__BLIS_LIVE_REFRESH_V4=true;
window.__BLIS_LIVE_REFRESH_V3=true;
window.__BLIS_LIVE_REFRESH_V2=true;

const MENTION_MS=30000,MAX_ROWS=300,LOOKBACK_MONTHS=3;
const states=new Map();
let mentionBusy=false,mentionTimer=0,mountTimer=0,started=false;
const nativeFetch=window.fetch.bind(window);
const A=v=>Array.isArray(v)?v:[];
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>String(v??'').toLowerCase().replace(/\s+/g,' ').trim();

function client(){
  try{return String(window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.D?.slug||'aroma').toLowerCase()}
  catch(_){return String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma').toLowerCase()}
}
function publishedTs(s){const t=Date.parse(s?.published_at||s?.observed_at||s?.date||'');return Number.isFinite(t)?t:0}
function ts(s){const p=publishedTs(s);if(p)return p;const t=Date.parse(s?.detected_at||'');return Number.isFinite(t)?t:0}
function key(s){return N(s?.fingerprint||s?.id||s?.url||`${s?.title||''}|${s?.source||''}|${ts(s)}`)}
function valid(s,scope,c){const sc=N(s?.scope);return N(s?.client)===c&&(scope==='competitor'?sc==='competitor':(sc==='external'||sc==='owned'))&&/^https?:\/\//i.test(String(s?.url||''))&&String(s?.source||'').trim()&&String(s?.title||'').trim()}
function merge(prev,next,scope,c){const m=new Map();for(const s of A(prev)){if(valid(s,scope,c)){const k=key(s);if(k)m.set(k,s)}}for(const s of A(next)){if(!valid(s,scope,c))continue;const k=key(s);if(!k)continue;const old=m.get(k);if(!old||ts(s)>=ts(old))m.set(k,s)}return [...m.values()].sort((a,b)=>ts(b)-ts(a)).slice(0,MAX_ROWS)}
function state(c){if(!states.has(c))states.set(c,{brand:[],competitor:[],updated:0,error:false});return states.get(c)}
function cutoff3m(){const d=new Date();d.setMonth(d.getMonth()-LOOKBACK_MONTHS);return d.getTime()}
function recent3m(rows){const cut=cutoff3m();return A(rows).filter(s=>{const t=ts(s);return t&&t>=cut}).sort((a,b)=>ts(b)-ts(a))}
function fmt(t){return t?new Date(t).toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'без потвърдена дата'}
function day(t){return t?new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'long',year:'numeric'}):'Без дата'}
function source(s){return String(s?.source||'Неуточнен източник').replace(/\s+/g,' ').trim()}
function brand(s){return String(s?.brand||'Конкурент').replace(/\s+/g,' ').trim()}
function cleanTitle(s){
  let t=String(s?.title||'Споменаване').replace(/\s+/g,' ').trim();
  const b=brand(s);
  if(/^офиси под наем/i.test(t)&&b&&N(t).includes(N(b)))t='Офиси под наем — '+b;
  t=t.replace(/\b(Home|Начало)\s*[-–—|:]?\s*(Black Sea Capital(?: Center)?|Business Park Varna|Landmark Centre Varna)\b/i,'$2');
  return t||'Споменаване';
}
function cleanBody(s){
  let x=String(s?.text||'').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim();
  if(!x)return'';
  const junk=[
    /\bВход\b/gi,/\bРегистрация\b/gi,/\bМоите предпочитания\b/gi,
    /\bГенерирай карта\b/gi,/\bСравни\b/gi,/\bПопитай за избраните офис проекти\b/gi,
    /\bДруги услуги\b/gi,/\bконтакт BG\s*\|\s*EN\b/gi,/\bСлед влизане\b/gi,
    /\bНачало\b/gi,/\bПроекти\b/gi,/\bНовини\b/gi,/\bЗа нас\b/gi,
    /\bПродажби\b/gi,/\bКонтакти\b/gi,/\bБългарски\b/gi,/\bEnglish\b/gi,/\bРусский\b/gi,
    /\bКарта и Локация\b/gi,/\bОфертни наемни нива\b/gi
  ];
  junk.forEach(r=>{x=x.replace(r,' ')});
  x=x.replace(/https?:\/\/\S+/gi,' ');
  x=x.replace(/\b(?:Telephone|Phone|E-mail|web):?\s*[^,;|]+/gi,' ');
  x=x.replace(/\s*\|\s*/g,' · ').replace(/\s{2,}/g,' ').replace(/^[·,;:\-–—\s]+|[·,;:\-–—\s]+$/g,'').trim();
  if(x.length<45)return'';
  return x.slice(0,240).replace(/\s+\S*$/,'').trim();
}
function title(s){return cleanTitle(s)}
function body(s){return cleanBody(s)}

async function fetchScope(c,scope){
  const r=await nativeFetch(`/api/public/mentions?client=${encodeURIComponent(c)}&scope=${scope}&limit=${MAX_ROWS}&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'},credentials:'same-origin'});
  if(!r.ok)throw new Error(`${scope} mentions ${r.status}`);
  const j=await r.json();return A(j?.signals)
}
async function refreshMentions(force=false){
  if(mentionBusy||document.hidden)return;
  const c=client(),st=state(c);
  if(!force&&Date.now()-st.updated<MENTION_MS-1000)return;
  mentionBusy=true;
  try{
    const [b,k]=await Promise.all([fetchScope(c,'brand'),fetchScope(c,'competitor')]);
    if(client()!==c)return;
    st.brand=merge(st.brand,b,'brand',c);st.competitor=merge(st.competitor,k,'competitor',c);
    st.updated=Date.now();st.error=false;
    if(document.body){document.body.dataset.blisMentionStream='live';document.body.dataset.blisMentionUpdated=String(st.updated)}
  }catch(e){
    if(client()===c&&document.body){st.error=true;document.body.dataset.blisMentionStream='degraded'}
    console.warn('BLIS mention stream',e?.message||e)
  }finally{mentionBusy=false;scheduleMount(20)}
}

function status(st){const x=st.error?'Потокът временно се възстановява':st.updated?`На живо · проверка на 30 сек. · ${fmt(st.updated)}`:'Свързване с потока…';return `<span class="blis-ms-status ${st.error?'warn':'live'}">${E(x)}</span>`}
function timeline(rows,scope){
  if(!rows.length)return '<div class="blis-ms-empty">Няма открити публични споменавания в последните 3 месеца. Потокът остава активен.</div>';
  let ld='';
  return rows.slice(0,MAX_ROWS).map(s=>{const p=publishedTs(s),t=p||ts(s),d=day(t),newDay=d!==ld;ld=d;const summary=body(s),kind=p?'публикувано':'открито';return `${newDay?`<div class="blis-ms-day">${E(d)}</div>`:''}<article class="blis-ms-event"><i></i><div><div class="blis-ms-meta">${scope==='competitor'?`<span class="blis-ms-brand">${E(brand(s))}</span>`:''}<span>${E(source(s))}</span><span>${kind}</span><time>${E(fmt(t))}</time></div><strong>${E(title(s))}</strong>${summary&&summary!==title(s)?`<p>${E(summary.slice(0,300))}</p>`:''}</div><a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">ИЗТОЧНИК ↗</a></article>`}).join('')
}
function ticker(rows){
  if(!rows.length)return '<div class="blis-ms-ticker blis-ms-ticker-empty"><div>Няма открити конкурентни споменавания в последните 3 месеца.</div></div>';
  const groups=new Map();
  for(const s of A(rows)){const b=N(brand(s))||'конкурент';if(!groups.has(b))groups.set(b,[]);groups.get(b).push(s)}
  const names=[...groups.keys()].sort((a,b)=>ts(groups.get(b)[0])-ts(groups.get(a)[0]));
  const balanced=[];let round=0,added=true;
  while(balanced.length<24&&added){added=false;for(const n of names){const s=groups.get(n)[round];if(!s)continue;balanced.push(s);added=true;if(balanced.length>=24)break}round++}
  const item=s=>`<a class="blis-ms-ticker-item" href="${E(s.url)}" target="_blank" rel="noopener noreferrer"><b>${E(brand(s))}</b><span>${E(title(s))}</span><small>${E(source(s))}</small></a>`;
  const base=balanced.map(item).join('');return `<div class="blis-ms-ticker"><div class="blis-ms-track">${base}${base}</div></div>`
}
function css(){
  if(document.getElementById('blisMentionStreamCSSV6'))return;
  const s=document.createElement('style');s.id='blisMentionStreamCSSV6';s.textContent=`
.blis-ms{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;margin:14px 0 20px!important;border:1px solid #dbe5ee!important;border-radius:18px!important;background:#fff!important;box-shadow:0 12px 32px rgba(31,65,96,.06)!important;overflow:hidden!important;min-height:90px!important}.blis-ms-head{display:flex;justify-content:space-between;gap:18px;padding:18px 20px 14px}.blis-ms-head h3{margin:0;color:#234764;font-size:19px;letter-spacing:-.025em}.blis-ms-head p{margin:5px 0 0;color:#758a9d;font-size:10px;line-height:1.5}.blis-ms-status{flex:0 0 auto;border:1px solid #cfe2ee;border-radius:999px;background:#f7fbfe;padding:7px 10px;color:#3b6c8e;font-size:8.5px;font-weight:800;white-space:nowrap}.blis-ms-status.live:before{content:'';display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:#18a66a;box-shadow:0 0 0 4px rgba(24,166,106,.1);vertical-align:middle}.blis-ms-status.warn{color:#a06a22;background:#fffaf2;border-color:#eed9b9}.blis-ms-count{padding:0 20px 12px;color:#8193a3;font-size:9px}.blis-ms-count b{color:#2f668f;font-size:14px}.blis-ms-timeline{padding:0 20px 18px}.blis-ms-day{margin:13px 0 4px;color:#7590a5;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.055em}.blis-ms-event{display:grid;grid-template-columns:10px minmax(0,1fr) auto;gap:12px;padding:12px 0;border-bottom:1px solid #edf2f6}.blis-ms-event>i{width:9px;height:9px;margin-top:6px;border-radius:50%;background:#3b83bd;box-shadow:0 0 0 4px #edf6fc}.blis-ms-event strong{display:block;color:#284b68;font-size:11px;line-height:1.4}.blis-ms-event p{margin:5px 0 0;color:#6f8496;font-size:9px;line-height:1.5}.blis-ms-meta{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:5px;color:#8999a7;font-size:8px}.blis-ms-brand{border-radius:999px;padding:3px 6px;font-weight:850;background:#edf4ff;color:#2f65a8}.blis-ms-event>a{align-self:center;color:#2b6998;text-decoration:none;font-size:8px;font-weight:850;white-space:nowrap}.blis-ms-empty{margin:0 20px 18px;border:1px dashed #d9e4ec;border-radius:11px;background:#fbfdff;padding:15px;color:#73889a;font-size:9.5px}.blis-ms-ticker{overflow:hidden;border-top:1px solid #e4ebf2;border-bottom:1px solid #e4ebf2;background:#12304b;color:#fff}.blis-ms-track{display:flex;width:max-content;animation:blisMentionTicker 80s linear infinite}.blis-ms-ticker:hover .blis-ms-track{animation-play-state:paused}.blis-ms-ticker-item{display:flex;align-items:center;gap:9px;min-width:380px;max-width:540px;padding:11px 16px;border-right:1px solid rgba(255,255,255,.13);color:#fff;text-decoration:none}.blis-ms-ticker-item b{flex:0 0 auto;border-radius:999px;background:rgba(255,255,255,.12);padding:4px 7px;font-size:8px}.blis-ms-ticker-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.5px;font-weight:700}.blis-ms-ticker-item small{flex:0 0 auto;color:#adc1d1;font-size:7.5px}.blis-ms-ticker-empty>div{padding:12px 20px;color:#c9d7e2;font-size:9px}@keyframes blisMentionTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(max-width:760px){.blis-ms-head{flex-direction:column}.blis-ms-status{white-space:normal}.blis-ms-event{grid-template-columns:10px 1fr}.blis-ms-event>a{grid-column:2}.blis-ms-ticker-item{min-width:300px}}
`;document.head.appendChild(s)
}
function panel(id,kind){let p=document.getElementById(id);if(!p){p=document.createElement('section');p.id=id;p.className=`blis-ms blis-ms-${kind}`}return p}
function mountInPage(pageId,p){
  const body=document.getElementById(pageId+'Body')||document.getElementById(pageId);if(!body)return false;
  const root=body.querySelector(':scope > .vs-page')||body.querySelector('.vs-page');
  const host=root||body;
  if(p.parentNode!==host)host.appendChild(p);
  return true
}
function renderMonitoring(){
  const c=client(),st=state(c),rows=recent3m(st.brand),p=panel('blisBrandMentionTimeline','monitoring');
  const host=document.querySelector('#n3SocialRoot > .vs-page')||document.querySelector('#n3SocialRoot .vs-page')||document.getElementById('n3SocialRoot');if(!host)return;
  if(p.parentNode!==host)host.appendChild(p);
  const sig=[c,st.updated,st.error,rows.map(key).join('|')].join('::');if(p.dataset.signature===sig)return;p.dataset.signature=sig;
  p.innerHTML=`<div class="blis-ms-head"><div><h3>Хронология на споменаванията</h3><p>Потвърдени публични споменавания с дата от последните 3 месеца, подредени от най-новото към по-старото.</p></div>${status(st)}</div><div class="blis-ms-count"><b>${rows.length}</b> потвърдени споменавания през последните 3 месеца</div><div class="blis-ms-timeline">${timeline(rows,'brand')}</div>`
}
function renderCompetition(){
  const c=client(),st=state(c),rows=recent3m(st.competitor),p=panel('blisCompetitorMentionTimeline','competition');
  if(!mountInPage('competition',p))return;
  const sig=[c,st.updated,st.error,rows.map(key).join('|')].join('::');if(p.dataset.signature===sig)return;p.dataset.signature=sig;
  p.innerHTML=`<div class="blis-ms-head"><div><h3>Хронология на конкурентните споменавания</h3><p>Публични споменавания, публикувани или открити от мониторинга през последните 3 месеца. Когато източникът не дава дата на публикация, се показва датата на откриване.</p></div>${status(st)}</div>${ticker(rows)}<div class="blis-ms-count" style="padding-top:13px"><b>${rows.length}</b> конкурентни споменавания през последните 3 месеца</div><div class="blis-ms-timeline">${timeline(rows,'competitor')}</div>`
}
function renderStreams(){css();renderMonitoring();renderCompetition()}
function scheduleMount(delay=80){clearTimeout(mountTimer);mountTimer=setTimeout(renderStreams,delay)}
function routePulse(){[80,280,700].forEach(ms=>setTimeout(renderStreams,ms));refreshMentions(false)}
function reset(){const st=state(client());st.updated=0;routePulse();setTimeout(()=>refreshMentions(true),120)}
function start(){
  if(started)return;started=true;css();
  [40,220,650,1400].forEach(ms=>setTimeout(renderStreams,ms));setTimeout(()=>refreshMentions(true),180);
  clearInterval(mentionTimer);mentionTimer=setInterval(()=>refreshMentions(false),MENTION_MS);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){routePulse();refreshMentions(true)}});
  window.addEventListener('focus',()=>{routePulse();refreshMentions(false)});
  window.addEventListener('blis:clientdata',reset);
  window.addEventListener('blis:periodchange',routePulse);
  for(const ev of ['blis:routechange','blis:navigator-route','popstate'])window.addEventListener(ev,routePulse)
}
function awaitNavigator(){if(started)return;if(document.documentElement.dataset.navigatorVersion==='3.0-preserved-visuals-5plus2'||document.documentElement.classList.contains('blis-dashboard-ready')){start();return}setTimeout(awaitNavigator,180)}
window.BLISLiveRefresh={refreshMentions,renderStreams,interval:MENTION_MS,mentionInterval:MENTION_MS,lookbackMonths:LOOKBACK_MONTHS,version:'6.0-three-month-intelligence'};
window.addEventListener('blis:production-ready',()=>setTimeout(start,0),{once:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',awaitNavigator,{once:true});else awaitNavigator();
})();
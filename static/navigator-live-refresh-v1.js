/* BLIS Navigator — 24/7 visible-data refresh v2.
   Keeps the client shell fresh and exposes a universal source-backed mention
   stream in Monitoring and Competition for every real Navigator profile. */
(function(){
'use strict';
if(window.__BLIS_LIVE_REFRESH_V2)return;window.__BLIS_LIVE_REFRESH_V2=true;
const INTERVAL=15000,MENTION_INTERVAL=30000,MAX_ROWS=300;
let busy=false,timer=0,mentionTimer=0,mentionBusy=false,observer=null,renderTimer=0;
const nativeFetch=window.fetch.bind(window);
const mentionState=new Map();
const A=v=>Array.isArray(v)?v:[];
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=v=>String(v??'').toLowerCase().replace(/\s+/g,' ').trim();

window.fetch=function(input,init){
  try{
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    const u=new URL(raw,location.origin);
    if(/^\/api\/clients\/[^/]+\/(dashboard|sources|data-quality|activity|history|keywords|reports|exports)$/.test(u.pathname)||u.pathname==='/api/public/mentions'){
      init=Object.assign({},init||{},{cache:'no-store'});
    }
  }catch(_){}
  return nativeFetch(input,init);
};

function currentClient(){
  try{return String(window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.D?.slug||'aroma').toLowerCase()}
  catch(_){return String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma').toLowerCase()}
}
function periodDays(){return Math.max(1,Number(window.BLISPeriod?.days)||30)}
function stamp(s){const t=Date.parse(s?.published_at||s?.detected_at||s?.observed_at||s?.date||'');return Number.isFinite(t)?t:0}
function key(s){return norm(s?.fingerprint||s?.url||`${s?.title||''}|${s?.source||''}|${stamp(s)}`)}
function valid(s,scope,c){const sc=norm(s?.scope);return norm(s?.client)===c&&(scope==='competitor'?sc==='competitor':(sc==='external'||sc==='owned'))&&/^https?:\/\//i.test(String(s?.url||''))&&String(s?.source||'').trim()&&String(s?.title||'').trim()}
function merge(prev,next,scope,c){
  const by=new Map();
  for(const s of A(prev)){if(valid(s,scope,c)){const k=key(s);if(k)by.set(k,s)}}
  for(const s of A(next)){if(!valid(s,scope,c))continue;const k=key(s);if(!k)continue;const old=by.get(k);if(!old||stamp(s)>=stamp(old))by.set(k,s)}
  return [...by.values()].sort((a,b)=>stamp(b)-stamp(a)).slice(0,MAX_ROWS);
}
function stateFor(c){if(!mentionState.has(c))mentionState.set(c,{brand:[],competitor:[],updated:0,error:false});return mentionState.get(c)}
async function fetchScope(c,scope){
  const r=await nativeFetch(`/api/public/mentions?client=${encodeURIComponent(c)}&scope=${scope}&limit=${MAX_ROWS}&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error(`mentions ${scope}: ${r.status}`);
  const j=await r.json();return A(j?.signals);
}
async function refreshMentions(force=false){
  if(mentionBusy||document.hidden)return;
  const c=currentClient(),st=stateFor(c);
  if(!force&&Date.now()-st.updated<MENTION_INTERVAL-1000)return;
  mentionBusy=true;
  try{
    const [brand,competitor]=await Promise.all([fetchScope(c,'brand'),fetchScope(c,'competitor')]);
    if(currentClient()!==c)return;
    st.brand=merge(st.brand,brand,'brand',c);
    st.competitor=merge(st.competitor,competitor,'competitor',c);
    st.updated=Date.now();st.error=false;
    document.body.dataset.blisMentionStream='live';
    document.body.dataset.blisMentionUpdated=String(st.updated);
  }catch(e){
    if(currentClient()===c){st.error=true;document.body.dataset.blisMentionStream='degraded'}
    console.warn('BLIS mention stream',e?.message||e);
  }finally{mentionBusy=false;scheduleRender()}
}

function periodRows(rows){const now=Date.now(),cut=now-periodDays()*864e5;return A(rows).filter(s=>{const t=stamp(s);return !t||(t>=cut&&t<=now+864e5)})}
function dateTime(t){return t?new Date(t).toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'часът не е указан'}
function dayLabel(t){return t?new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'long',year:'numeric'}):'Без дата'}
function signalTitle(s){return String(s?.title||'Споменаване').replace(/\s+/g,' ').trim()}
function signalText(s){return String(s?.text||'').replace(/\s+/g,' ').trim()}
function source(s){return String(s?.source||'Неуточнен източник').replace(/\s+/g,' ').trim()}
function brand(s){return String(s?.brand||'Конкурент').replace(/\s+/g,' ').trim()}
function statusHTML(st){
  const label=st.error?'Потокът временно се възстановява':st.updated?`На живо · проверка на 30 сек. · ${dateTime(st.updated)}`:'Свързване с потока…';
  return `<span class="blis-ms-status ${st.error?'warn':'live'}">${E(label)}</span>`;
}
function timelineHTML(rows,{competitor=false}={}){
  if(!rows.length)return '<div class="blis-ms-empty">Няма потвърдено споменаване за избрания период. Потокът остава активен и ще добави новия сигнал автоматично.</div>';
  let lastDay='';
  return rows.slice(0,40).map(s=>{
    const t=stamp(s),d=dayLabel(t),showDay=d!==lastDay;lastDay=d;
    const summary=signalText(s),tag=competitor?`<span class="blis-ms-brand">${E(brand(s))}</span>`:'';
    return `${showDay?`<div class="blis-ms-day">${E(d)}</div>`:''}<article class="blis-ms-event"><i aria-hidden="true"></i><div class="blis-ms-event-main"><div class="blis-ms-event-meta">${tag}<span>${E(source(s))}</span><time>${E(dateTime(t))}</time></div><strong>${E(signalTitle(s))}</strong>${summary&&summary!==signalTitle(s)?`<p>${E(summary.slice(0,300))}</p>`:''}</div><a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">ИЗТОЧНИК ↗</a></article>`;
  }).join('');
}
function tickerHTML(rows){
  if(!rows.length)return '<div class="blis-ms-ticker-empty">Няма ново конкурентно споменаване в избрания период.</div>';
  const one=s=>`<a class="blis-ms-ticker-item" href="${E(s.url)}" target="_blank" rel="noopener noreferrer"><b>${E(brand(s))}</b><span>${E(signalTitle(s))}</span><small>${E(source(s))}</small></a>`;
  const base=rows.slice(0,16).map(one).join('');
  return `<div class="blis-ms-ticker"><div class="blis-ms-track">${base}${base}</div></div>`;
}
function ensureCSS(){
  if(document.getElementById('blisMentionStreamCSS'))return;
  const st=document.createElement('style');st.id='blisMentionStreamCSS';st.textContent=`
.blis-ms{margin:16px 0 20px;border:1px solid #dbe5ee;border-radius:18px;background:#fff;box-shadow:0 12px 32px rgba(31,65,96,.055);overflow:hidden}
.blis-ms-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:18px 20px 14px}.blis-ms-head h3{margin:0;color:#234764;font-size:18px;letter-spacing:-.025em}.blis-ms-head p{margin:5px 0 0;color:#758a9d;font-size:10px;line-height:1.5}.blis-ms-status{flex:0 0 auto;border:1px solid #cfe2ee;border-radius:999px;background:#f7fbfe;padding:7px 10px;color:#3b6c8e;font-size:8.5px;font-weight:800;white-space:nowrap}.blis-ms-status.live:before{content:'';display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:#18a66a;box-shadow:0 0 0 4px rgba(24,166,106,.1);vertical-align:middle}.blis-ms-status.warn{color:#a06a22;background:#fffaf2;border-color:#eed9b9}
.blis-ms-count{padding:0 20px 12px;color:#8193a3;font-size:9px}.blis-ms-count b{color:#2f668f;font-size:13px}
.blis-ms-timeline{padding:0 20px 18px}.blis-ms-day{margin:12px 0 4px;color:#7590a5;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.055em}.blis-ms-event{position:relative;display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:12px;padding:12px 0;border-bottom:1px solid #edf2f6}.blis-ms-event>i{width:9px;height:9px;margin-top:5px;border-radius:50%;background:#3b83bd;box-shadow:0 0 0 4px #edf6fc}.blis-ms-event strong{display:block;color:#284b68;font-size:11px;line-height:1.4}.blis-ms-event p{margin:5px 0 0;color:#6f8496;font-size:9px;line-height:1.5}.blis-ms-event-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:5px;color:#8999a7;font-size:8px}.blis-ms-brand{border-radius:999px;background:#edf4ff;color:#2f65a8;padding:3px 6px;font-weight:850}.blis-ms-event>a{align-self:center;color:#2b6998;text-decoration:none;font-size:8px;font-weight:850;white-space:nowrap}.blis-ms-empty{margin:0 20px 18px;border:1px dashed #d9e4ec;border-radius:11px;background:#fbfdff;padding:15px;color:#73889a;font-size:9.5px;line-height:1.5}
.blis-ms-ticker{overflow:hidden;border-top:1px solid #e4ebf2;border-bottom:1px solid #e4ebf2;background:#12304b}.blis-ms-track{display:flex;width:max-content;animation:blisMentionTicker 52s linear infinite}.blis-ms-ticker:hover .blis-ms-track{animation-play-state:paused}.blis-ms-ticker-item{display:flex;align-items:center;gap:9px;min-width:380px;max-width:520px;padding:11px 16px;border-right:1px solid rgba(255,255,255,.13);color:#fff;text-decoration:none}.blis-ms-ticker-item b{flex:0 0 auto;border-radius:999px;background:rgba(255,255,255,.12);padding:4px 7px;font-size:8px}.blis-ms-ticker-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.5px;font-weight:700}.blis-ms-ticker-item small{flex:0 0 auto;color:#adc1d1;font-size:7.5px}.blis-ms-ticker-empty{padding:12px 20px;background:#f8fbfd;color:#778c9d;font-size:9px}
@keyframes blisMentionTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media(max-width:760px){.blis-ms-head{flex-direction:column}.blis-ms-status{white-space:normal}.blis-ms-event{grid-template-columns:12px 1fr}.blis-ms-event>a{grid-column:2}.blis-ms-ticker-item{min-width:300px}}
`;
  document.head.appendChild(st);
}
function panelSignature(kind,rows,st){return [currentClient(),kind,periodDays(),st.error,st.updated,rows.slice(0,40).map(key).join('|')].join('::')}
function renderMonitoring(){
  const host=document.getElementById('socialBody');if(!host)return;
  const c=currentClient(),st=stateFor(c),rows=periodRows(st.brand),sig=panelSignature('brand',rows,st);
  let panel=document.getElementById('blisBrandMentionTimeline');
  if(!panel){panel=document.createElement('section');panel.id='blisBrandMentionTimeline';panel.className='blis-ms blis-ms-monitoring';host.appendChild(panel)}
  if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;
  panel.innerHTML=`<div class="blis-ms-head"><div><h3>Хронология на споменаванията</h3><p>Всички потвърдени публични споменавания на наблюдавания бранд, подредени от най-новото към по-старото.</p></div>${statusHTML(st)}</div><div class="blis-ms-count"><b>${rows.length}</b> споменавания за последните ${periodDays()} дни</div><div class="blis-ms-timeline">${timelineHTML(rows)}</div>`;
}
function renderCompetition(){
  const host=document.getElementById('competitionBody');if(!host)return;
  const c=currentClient(),st=stateFor(c),rows=periodRows(st.competitor),sig=panelSignature('competitor',rows,st);
  let panel=document.getElementById('blisCompetitorMentionTimeline');
  if(!panel){panel=document.createElement('section');panel.id='blisCompetitorMentionTimeline';panel.className='blis-ms blis-ms-competition';host.appendChild(panel)}
  if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;
  panel.innerHTML=`<div class="blis-ms-head"><div><h3>Конкурентни споменавания</h3><p>Непрекъснат поток от потвърдени публикации за всички конфигурирани конкуренти на текущия бранд.</p></div>${statusHTML(st)}</div>${tickerHTML(rows)}<div class="blis-ms-count" style="padding-top:13px"><b>${rows.length}</b> конкурентни споменавания за последните ${periodDays()} дни</div><div class="blis-ms-timeline">${timelineHTML(rows,{competitor:true})}</div>`;
}
function renderStreams(){ensureCSS();renderMonitoring();renderCompetition()}
function scheduleRender(){clearTimeout(renderTimer);renderTimer=setTimeout(renderStreams,80)}

async function refresh(){
  if(busy||document.hidden||typeof load!=='function')return;
  busy=true;
  try{
    await load();
    document.body.dataset.blisLive='true';
    document.body.dataset.blisLiveUpdated=String(Date.now());
  }catch(e){console.warn('BLIS live refresh',e?.message||e)}finally{busy=false;scheduleRender()}
}
function resetForClient(){const c=currentClient();const st=stateFor(c);st.updated=0;scheduleRender();refreshMentions(true)}
function start(){
  ensureCSS();renderStreams();refreshMentions(true);
  clearInterval(timer);timer=setInterval(refresh,INTERVAL);
  clearInterval(mentionTimer);mentionTimer=setInterval(()=>refreshMentions(false),MENTION_INTERVAL);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){refresh();refreshMentions(true)}});
  window.addEventListener('focus',()=>{refresh();refreshMentions(true)});
  window.addEventListener('blis:clientdata',resetForClient);
  for(const ev of ['blis:routechange','blis:navigator-route','popstate'])window.addEventListener(ev,()=>{scheduleRender();refreshMentions(false)});
  observer=new MutationObserver(scheduleRender);observer.observe(document.body,{childList:true,subtree:true});
}
window.BLISLiveRefresh={refresh,refreshMentions,renderStreams,interval:INTERVAL,mentionInterval:MENTION_INTERVAL,version:'2.0-universal-mentions'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* BLIS KUB Monitoring Feed v4 — public read-only chronology.
   Uses the source-backed /api/public/mentions endpoint so the public KUB page
   never depends on the authenticated /api/signals route. */
(function(){
'use strict';
if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;
if(window.__KUB_LIVE_FEED_V4)return;window.__KUB_LIVE_FEED_V4=true;

const ACTIVE_POLL_MS=5000;
const HIDDEN_POLL_MS=15000;
const ENDPOINT='/api/public/mentions?client=kub&scope=brand&limit=300';

const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function parseTs(v){
 if(v==null||v==='')return 0;
 if(typeof v==='number')return v>1e12?v:v*1000;
 const s=String(v).trim();
 const native=Date.parse(s);if(Number.isFinite(native))return native;
 const m=s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:\D+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
 return m?new Date(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0),+(m[6]||0)).getTime():0;
}
function rowTime(r){
 const pub=r&&[r.published_at,r.publishedAt,r.published,r.pub_date,r.pubDate].find(v=>v!=null&&String(v).trim()!=='');
 const det=r&&[r.detected_at,r.detectedAt,r.detected,r.created_at,r.createdAt].find(v=>v!=null&&String(v).trim()!=='');
 const pt=parseTs(pub),dt=parseTs(det);return {display:pub||det||'',ts:pt||dt||0};
}
const fmt=v=>{const t=parseTs(v);if(!t)return 'LIVE';const d=new Date(t);return d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})+'<br>'+d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})};
const fmtCompact=v=>{const t=typeof v==='number'?v:parseTs(v);if(!t)return '—';const d=new Date(t);return d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})};
const fmtClock=v=>new Date(v||Date.now()).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
function sev(s){const v=String(s||'').toLowerCase();return v==='critical'?'КРИТИЧЕН':v==='high'?'ВИСОК':v==='medium'?'СРЕДЕН':'СИГНАЛ'}
function types(r){const t=(String(r.title||'')+' '+String(r.text||'')).toLowerCase(),a=['media'];if(/куб|корпорац|forest club|форест клуб/.test(t))a.push('kub');if(/съд|прокурат|парламент|община|данс|полици|министер|строителен контрол/.test(t))a.push('institution');if(/ток|електро|вод|вик|захран/.test(t))a.push('utilities');return [...new Set(a)].join(' ')}
function feed(){return document.getElementById('feed')}
function status(msg){const filters=document.querySelector('#monitoring .filters');if(!filters)return;let el=document.getElementById('kubFeedV4Status');if(!el){el=document.createElement('span');el.id='kubFeedV4Status';el.className='filter';el.style.marginLeft='auto';el.style.cursor='default';filters.appendChild(el)}el.textContent=msg;el.style.color='';el.style.borderColor='';el.style.background=''}
function canonicalKey(r){
 let u='';try{u=new URL(r.url||'',location.origin).href}catch(_){u=String(r.url||'')}
 return (u||r.fingerprint||((r.source||'')+'|'+(r.title||'')+'|'+rowTime(r).ts)).toLowerCase();
}
function canonicalRows(apiRows){
 const map=new Map();
 for(const r of Array.isArray(apiRows)?apiRows:[]){const k=canonicalKey(r);if(k)map.set(k,r)}
 return [...map.values()].sort((a,b)=>rowTime(b).ts-rowTime(a).ts);
}
let knownKeys=new Set();
function renderCanonical(rows){
 const f=feed();if(!f)return 0;
 const arr=Array.isArray(rows)?rows:[];if(!arr.length)return 0;
 let added=0;const nextKeys=new Set(arr.map(canonicalKey));
 for(const k of nextKeys)if(k&&!knownKeys.has(k))added++;
 const frag=document.createDocumentFragment();
 for(const r of arr){
  const title=clean(r.title);if(!title)continue;
  let href='';try{href=new URL(r.url||'',location.origin).href}catch(_){href=String(r.url||'')}
  const tm=rowTime(r);const a=document.createElement('article');a.className='item';a.dataset.type=types(r);a.dataset.text=clean(title+' '+(r.text||'')+' '+(r.source||''));a.dataset.published=String(tm.ts||0);a.dataset.kubFeedV4='1';
  a.innerHTML='<time>'+fmt(tm.display)+'</time><div><h3>'+esc(title)+'</h3><p>'+esc(clean(r.text||title)).slice(0,900)+'</p><div class="meta"><span>ПОТВЪРДЕН ТЕКУЩ СИГНАЛ</span><span>'+esc(r.source||'външен източник')+'</span><span>'+esc(sev(r.severity))+'</span></div></div>'+(href?'<a target="_blank" rel="noopener" href="'+esc(href)+'">ИЗТОЧНИК ↗</a>':'');
  frag.appendChild(a);
 }
 f.replaceChildren(frag);knownKeys=nextKeys;return added;
}
function newestPublication(rows){let best=0;for(const r of rows||[]){const v=rowTime(r).ts;if(v>best)best=v}return best}
function updateLivebar(newest,checkedAt){
 const bar=document.querySelector('.livebar .right');if(!bar)return;
 const b=bar.querySelector('b');if(b)b.textContent='Актуална база · последен сигнал: '+fmtCompact(newest);
 const v=document.getElementById('viewTime');if(v)v.textContent='Последна синхронизация: '+fmtClock(checkedAt);
}
function applyCurrentFilters(){
 const input=document.querySelector('#monitoring input[type="search"],#monitoring input[placeholder*="Търси"]');
 if(input)input.dispatchEvent(new Event('input',{bubbles:true}));
}
let firstSync=true,inFlight=false,failures=0,lastSuccess=0,timer=0;
function schedule(ms){clearTimeout(timer);timer=setTimeout(sync,ms==null?(document.hidden?HIDDEN_POLL_MS:ACTIVE_POLL_MS):ms)}
async function sync(immediate){
 if(inFlight){schedule(1000);return}
 inFlight=true;const checkedAt=Date.now();let controller=null,timeout=0;
 try{
  controller=new AbortController();timeout=setTimeout(()=>controller.abort(),8000);
  const r=await fetch(ENDPOINT+'&_='+checkedAt,{cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'},signal:controller.signal});
  if(!r.ok)throw new Error('HTTP '+r.status);const c=(r.headers.get('content-type')||'').toLowerCase();if(!c.includes('application/json'))throw new Error('non-json');
  const d=await r.json();if(String(d.client||'').toLowerCase()!=='kub')throw new Error('wrong client');
  const rows=canonicalRows(d.signals||[]);if(!rows.length)throw new Error('empty chronology');
  const added=renderCanonical(rows);const newest=newestPublication(rows);
  failures=0;lastSuccess=checkedAt;let msg='ПОСТОЯННО ОБНОВЯВАНЕ · '+fmtClock(checkedAt)+' · последен сигнал '+fmtCompact(newest);if(!firstSync&&added)msg+=' · нови '+added;
  status(msg);updateLivebar(newest,checkedAt);applyCurrentFilters();firstSync=false;
 }catch(e){
  failures++;if(lastSuccess)status('ОПИТ ЗА СВЪРЗВАНЕ · последна синхронизация '+fmtClock(lastSuccess));else status('ОПИТ ЗА СВЪРЗВАНЕ · автоматичен повторен опит');
  console.warn('KUB feed v4',e);
 }finally{clearTimeout(timeout);inFlight=false;schedule(immediate?1000:undefined)}
}
function forceSync(){clearTimeout(timer);sync(true)}
function boot(){
 status('ОПИТ ЗА СВЪРЗВАНЕ');
 const reload=document.getElementById('reloadBtn');if(reload)reload.onclick=e=>{e.preventDefault();forceSync()};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)forceSync();else schedule(HIDDEN_POLL_MS)});
 window.addEventListener('focus',forceSync);window.addEventListener('online',forceSync);
 sync(true);
}
window.BLISKUBLiveFeedV4={sync:forceSync,endpoint:ENDPOINT};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* BLIS KUB Monitoring Feed v3 — canonical client-side renderer.
   Keeps the newest source-level mentions on top and continuously refreshes the
   KUB signal API without full-page reloads. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
if(window.__KUB_LIVE_FEED_V3)return;window.__KUB_LIVE_FEED_V3=true;

const ACTIVE_POLL_MS=5000;
const HIDDEN_POLL_MS=15000;
const FAILURE_RED_AFTER=3;
const verified=[
 {published_at:'2026-09-02T15:16:00+03:00',source:'News.bg',title:'Съдът във Варна образува ново дело срещу спирането на тока и водата в „Баба Алино“',text:'News.bg отразява новото дело на „Форест Клуб Варна“ срещу спирането на тока и водата.',url:'https://news.bg/crime/sadat-vav-varna-obrazuva-novo-delo-sreshtu-spiraneto-na-toka-i-vodata-v-baba-alino.html',severity:'critical',relevance:95},
 {published_at:'2026-09-02T15:06:00+03:00',source:'Паралел 43',title:'Искат от съда незабавно възстановяване на захранването с ток и вода в „Баба Алино“',text:'Паралел 43 отразява административно дело №2733/2026 г. и искането на „Форест Клуб Варна“.',url:'https://parallel43.bg/iskat-ot-sada-nezabavno-vazstanovyavane-na-zahranvaneto-s-tok-i-voda-v-baba-alino',severity:'critical',relevance:94},
 {published_at:'2026-09-02T15:01:00+03:00',source:'Lupa.bg',title:'Съдът образува ново дело заради спирането на тока в „Баба Алино“',text:'Lupa.bg публикува отделно отразяване на новото дело и прекъсването на тока и водата.',url:'https://lupa.bg/news/sadat-obrazuva-novo-delo-zaradi-spiraneto-na-toka-v-bdquobaba-alinoldquo_423843news.html',severity:'critical',relevance:93},
 {published_at:'2026-09-02T14:58:00+03:00',source:'Dir.bg',title:'Ново дело за тока и водата в „Баба Алино“, кметът с нови заповеди за събаряне',text:'Dir.bg съчетава съдебното развитие с информацията за издадените общински заповеди за премахване.',url:'https://dnes.dir.bg/varna/novo-delo-za-toka-i-vodata-v-baba-alino-kmetat-s-novi-zapovedi-za-sabaryane',severity:'critical',relevance:98},
 {published_at:'2026-09-02T14:39:00+03:00',source:'Евроком',title:'Ново дело заради спирането на тока и водата в местността „Баба Алино“',text:'Евроком отразява искането за незабавно възстановяване на захранването и новото дело.',url:'https://eurocom.bg/2026/09/02/novo-delo-zaradi-spiraneto-na-toka-i-vodata-v-mestnostta-baba-alino/',severity:'critical',relevance:95},
 {published_at:'2026-09-02T14:34:00+03:00',source:'БНТ',title:'Съдът във Варна решава за спирането на тока и водата в „Баба Алино“',text:'БНТ отразява новото административно дело и искането на „Форест Клуб Варна“.',url:'https://bntnews.bg/news/sadat-vav-varna-reshava-za-spiraneto-na-toka-i-vodata-v-baba-alino-1410569news.html',severity:'critical',relevance:97},
 {published_at:'2026-09-02T14:33:00+03:00',source:'Darik',title:'Съдът образува ново дело за тока и водата в „Баба Алино“',text:'Darik публикува отделно отразяване на новото дело на „Форест клуб Варна“.',url:'https://darik.bg/sadat-obrazuva-novo-delo-za-toka-i-vodata-v-baba-alino~541693.html',severity:'critical',relevance:95},
 {published_at:'2026-09-02T14:21:00+03:00',source:'NOVA',title:'Съдът образува ново дело за тока и водата в „Баба Алино“',text:'NOVA отразява новото дело по искане на „Форест клуб Варна“.',url:'https://nova.bg/news/view/2026/09/02/549912/%D1%81%D1%8A%D0%B4%D1%8A%D1%82-%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%83%D0%B2%D0%B0-%D0%BD%D0%BE%D0%B2%D0%BE-%D0%B4%D0%B5%D0%BB%D0%BE-%D0%B7%D0%B0-%D1%82%D0%BE%D0%BA%D0%B0-%D0%B8-%D0%B2%D0%BE%D0%B4%D0%B0%D1%82%D0%B0-%D0%B2-%D0%B1%D0%B0%D0%B1%D0%B0-%D0%B0%D0%BB%D0%B8%D0%BD%D0%BE/',severity:'critical',relevance:95}
];

const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const ts=s=>{const d=new Date(s||0);return Number.isNaN(d.getTime())?0:d.getTime()};
const fmt=s=>{const d=new Date(s||0);if(Number.isNaN(d.getTime()))return 'LIVE';return d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})+'<br>'+d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})};
const fmtCompact=s=>{const d=new Date(s||0);if(Number.isNaN(d.getTime()))return '—';return d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})};
const fmtClock=s=>{const d=new Date(s||Date.now());return d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit',second:'2-digit'})};
function sev(s){const v=String(s||'').toLowerCase();return v==='critical'?'КРИТИЧЕН':v==='high'?'ВИСОК':v==='medium'?'СРЕДЕН':'СИГНАЛ'}
function types(r){const t=(String(r.title||'')+' '+String(r.text||'')).toLowerCase(),a=['media'];if(/куб|корпорац|forest club|форест клуб/.test(t))a.push('kub');if(/съд|прокурат|парламент|община|данс|полици|министер|строителен контрол/.test(t))a.push('institution');if(/ток|електро|вод|вик|захран/.test(t))a.push('utilities');return [...new Set(a)].join(' ')}
function feed(){return document.getElementById('feed')}
function status(msg,bad){const filters=document.querySelector('#monitoring .filters');if(!filters)return;let el=document.getElementById('kubFeedV3Status');if(!el){el=document.createElement('span');el.id='kubFeedV3Status';el.className='filter';el.style.marginLeft='auto';el.style.cursor='default';filters.appendChild(el)}el.textContent=msg;el.style.color=bad?'#a33':'';el.style.borderColor=bad?'#e0aaaa':'';el.style.background=bad?'#fff6f6':''}
function render(rows,label){const f=feed();if(!f||!Array.isArray(rows))return 0;const urls=new Set([...f.querySelectorAll('.item a[href]')].map(a=>{try{return new URL(a.href,location.origin).href}catch(_){return a.href}}));let n=0;for(const r of rows){const title=clean(r.title);if(!title)continue;let href='';try{href=new URL(r.url||'',location.origin).href}catch(_){href=String(r.url||'')}if(href&&urls.has(href))continue;if(href)urls.add(href);const pub=r.published_at||r.p||r.detected_at||'';const a=document.createElement('article');a.className='item';a.dataset.type=r.types||types(r);a.dataset.text=clean(title+' '+(r.text||'')+' '+(r.source||r.src||''));a.dataset.published=String(ts(pub));a.innerHTML='<time>'+fmt(pub)+'</time><div><h3>'+esc(title)+'</h3><p>'+esc(clean(r.text||title)).slice(0,900)+'</p><div class="meta"><span>'+esc(label)+'</span><span>'+esc(r.source||r.src||'външен източник')+'</span><span>'+esc(sev(r.severity||r.sev))+'</span></div></div>'+(href?'<a target="_blank" rel="noopener" href="'+esc(href)+'">ИЗТОЧНИК ↗</a>':'');f.appendChild(a);n++}sort();return n}
function itemTs(a){if(a.dataset.published)return Number(a.dataset.published)||0;const t=(a.querySelector('time')||{}).innerText||'';const m=t.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+|\n)?(\d{2}):(\d{2})/);return m?new Date(+m[3],+m[2]-1,+m[1],+m[4],+m[5]).getTime():0}
function sort(){const f=feed();if(!f)return;[...f.querySelectorAll('.item')].sort((a,b)=>itemTs(b)-itemTs(a)).forEach(x=>f.appendChild(x))}
function newestPublication(rows){let best=0;for(const r of rows||[]){const v=ts(r.published_at||r.p||r.detected_at||'');if(v>best)best=v}for(const r of verified){const v=ts(r.published_at);if(v>best)best=v}return best}
function updateLivebar(newest,checkedAt){
 const bar=document.querySelector('.livebar .right');if(!bar)return;
 const b=bar.querySelector('b');if(b)b.textContent='Актуална база · последен сигнал: '+fmtCompact(newest);
 const v=document.getElementById('viewTime');if(v)v.textContent='Последна синхронизация: '+fmtClock(checkedAt);
}
let firstSync=true,inFlight=false,failures=0,lastSuccess=0,timer=0;
function schedule(ms){clearTimeout(timer);timer=setTimeout(sync,ms==null?(document.hidden?HIDDEN_POLL_MS:ACTIVE_POLL_MS):ms)}
async function sync(immediate){
 if(inFlight){schedule(1000);return}
 inFlight=true;const checkedAt=Date.now();let controller=null,timeout=0;
 try{
  controller=new AbortController();timeout=setTimeout(()=>controller.abort(),8000);
  const r=await fetch('/api/signals?client=kub&limit=500&_='+checkedAt,{cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'},signal:controller.signal});
  if(!r.ok)throw new Error('HTTP '+r.status);const c=(r.headers.get('content-type')||'').toLowerCase();if(!c.includes('application/json'))throw new Error('non-json');
  const d=await r.json();const added=render(d.signals||[],'LIVE СИГНАЛ');sort();const newest=newestPublication(d.signals||[]);
  failures=0;lastSuccess=checkedAt;let msg='ПОСТОЯННО ОБНОВЯВАНЕ · '+fmtClock(checkedAt)+' · последен сигнал '+fmtCompact(newest);if(!firstSync&&added)msg+=' · нови '+added;
  status(msg,false);updateLivebar(newest,checkedAt);firstSync=false;
 }catch(e){
  failures++;if(failures>=FAILURE_RED_AFTER){status('ОПИТ ЗА СВЪРЗВАНЕ · автоматичен повторен опит',false)}
  else if(lastSuccess){status('ПОСТОЯННО ОБНОВЯВАНЕ · временна връзка · последна синхронизация '+fmtClock(lastSuccess),false)}
  else status('ОПИТ ЗА СВЪРЗВАНЕ',false);
  console.warn('KUB feed v3',e);
 }finally{clearTimeout(timeout);inFlight=false;schedule(immediate?1000:undefined)}
}
function forceSync(){clearTimeout(timer);sync(true)}
function boot(){
 render(verified,'ПОТВЪРДЕН СИГНАЛ');sort();status('ОПИТ ЗА СВЪРЗВАНЕ',false);
 const reload=document.getElementById('reloadBtn');if(reload)reload.onclick=e=>{e.preventDefault();forceSync()};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)forceSync();else schedule(HIDDEN_POLL_MS)});
 window.addEventListener('focus',forceSync);window.addEventListener('online',forceSync);
 sync(true);
}
window.BLISKUBLiveFeedV3={sync:forceSync};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

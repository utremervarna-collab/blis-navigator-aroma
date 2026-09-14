/* BLIS Navigator — Aroma mention chronology V1
   Source-backed timelines for the isolated Aroma profile only.
   Uses /api/public/mentions; no synthetic rows. */
(function(){
'use strict';
if(window.__BLIS_AROMA_MENTION_CHRONOLOGY_V1)return;
window.__BLIS_AROMA_MENTION_CHRONOLOGY_V1=true;

const A=v=>Array.isArray(v)?v:[];
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=s=>String(s??'').toLowerCase().trim();
const periodDays=()=>Math.max(1,Number(window.BLISPeriod?.days)||30);
function currentClient(){
  try{return N(window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.D?.slug||'aroma')}
  catch(_){return N(window.D?.slug||'aroma')}
}
function aromaOnly(){return currentClient()==='aroma'}
function ts(row){const t=Date.parse(row?.published_at||row?.detected_at||'');return Number.isFinite(t)?t:0}
function fp(row){return String(row?.fingerprint||row?.url||`${row?.brand||''}|${row?.title||''}|${row?.published_at||row?.detected_at||''}`)}
function fmt(t){return t?new Date(t).toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}
function valid(row,scope){return row&&N(row.client)==='aroma'&&N(row.scope)===(scope==='competitor'?'competitor':N(row.scope))&&/^https?:\/\//i.test(String(row.url||''))&&String(row.source||'').trim()&&String(row.title||'').trim()}
function filterPeriod(rows){const cut=Date.now()-periodDays()*864e5;return rows.filter(r=>{const t=ts(r);return !t||t>=cut})}
function unique(rows){const seen=new Set();return filterPeriod(rows).filter(r=>{const k=fp(r);if(!k||seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>ts(b)-ts(a))}

const cache={brand:{at:0,rows:[],ok:false},competitor:{at:0,rows:[],ok:false}};
async function load(scope,force=false){
  const c=cache[scope];
  if(!force&&Date.now()-c.at<55000)return c;
  try{
    const r=await fetch(`/api/public/mentions?client=aroma&scope=${scope}&limit=300&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error(String(r.status));
    const j=await r.json();
    c.rows=unique(A(j?.signals).filter(x=>valid(x,scope)));
    c.ok=true;c.at=Date.now();
  }catch(_){c.ok=false;c.at=Date.now()}
  return c;
}

function css(){
  if(document.getElementById('aromaChronologyV1CSS'))return;
  const s=document.createElement('style');s.id='aromaChronologyV1CSS';s.textContent=`
/* User-requested reactivation of the existing competition strip. Inline !important is also applied at runtime. */
#competition .cmpv9-bar{display:flex!important;visibility:visible!important;opacity:1!important}
.aroma-chronology{margin:18px 0 4px;border:1px solid #dce7ed;border-radius:18px;background:linear-gradient(155deg,#fff 0%,#fbfdff 100%);box-shadow:0 14px 36px rgba(32,65,92,.07);padding:20px 21px;position:relative;overflow:hidden}
.aroma-chronology:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#2368e8,#17a676)}
.aroma-chronology-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:8px}
.aroma-chronology-head h3,.aroma-chronology-head h4{margin:0;color:#18384e;font-size:17px;line-height:1.2;letter-spacing:-.02em}
.aroma-chronology-head p{margin:6px 0 0;color:#718492;font-size:10.5px;line-height:1.55;max-width:720px}
.aroma-chronology-status{flex:0 0 auto;border:1px solid #cfe3da;border-radius:999px;background:#f1fbf6;color:#167756;padding:6px 10px;font-size:9px;font-weight:800;white-space:nowrap}
.aroma-chronology-list{position:relative;margin-top:12px;padding-left:20px}
.aroma-chronology-list:before{content:"";position:absolute;left:5px;top:4px;bottom:8px;width:1px;background:#d7e3ea}
.aroma-chronology-item{position:relative;display:grid;grid-template-columns:132px minmax(0,1fr) auto;gap:14px;align-items:start;padding:13px 0;border-top:1px solid #edf1f4}
.aroma-chronology-item:first-child{border-top:0}
.aroma-chronology-item:before{content:"";position:absolute;left:-19px;top:19px;width:9px;height:9px;border-radius:50%;background:#2568e8;border:2px solid #fff;box-shadow:0 0 0 1px #b9cee3}
.aroma-chronology--competitor .aroma-chronology-item:before{background:#7b54d7}
.aroma-chronology-time{font-size:9.5px;color:#6e8391;font-weight:750;line-height:1.45}
.aroma-chronology-main strong{display:block;color:#21465f;font-size:12px;line-height:1.45}
.aroma-chronology-main p{margin:5px 0 0;color:#6b7f8d;font-size:10px;line-height:1.5}
.aroma-chronology-meta{display:flex;gap:7px;align-items:center;margin-top:6px;flex-wrap:wrap;color:#8193a0;font-size:9px}
.aroma-chronology-brand{display:inline-flex;padding:3px 7px;border-radius:999px;background:#f1edfb;color:#6b49b7;font-weight:800}
.aroma-chronology-source{font-weight:700;color:#587188}
.aroma-chronology-link{align-self:center;text-decoration:none;color:#2568a7;font-size:9px;font-weight:850;letter-spacing:.02em;white-space:nowrap}
.aroma-chronology-empty{margin:12px 0 0;padding:15px;border:1px dashed #d9e3e9;border-radius:11px;color:#6c8190;font-size:10.5px;line-height:1.5;background:#fbfdfe}
#social .aroma-chronology{margin:0 16px 14px}
@media(max-width:760px){.aroma-chronology{padding:16px}.aroma-chronology-head{flex-direction:column}.aroma-chronology-status{white-space:normal}.aroma-chronology-item{grid-template-columns:1fr;gap:5px}.aroma-chronology-link{align-self:start}.aroma-chronology-time{font-size:9px}#social .aroma-chronology{margin:0 10px 12px}}
`;
  document.head.appendChild(s);
}

function rowHTML(r,scope){
  const t=ts(r),brand=scope==='competitor'?String(r.brand||'Конкурент').trim():'';
  const summary=String(r.text||'').replace(/\s+/g,' ').trim();
  return `<article class="aroma-chronology-item"><time class="aroma-chronology-time" datetime="${E(r.published_at||r.detected_at||'')}">${E(fmt(t))}</time><div class="aroma-chronology-main"><strong>${E(r.title)}</strong>${summary&&summary!==r.title?`<p>${E(summary.slice(0,260))}${summary.length>260?'…':''}</p>`:''}<div class="aroma-chronology-meta">${brand?`<span class="aroma-chronology-brand">${E(brand)}</span>`:''}<span class="aroma-chronology-source">${E(r.source)}</span>${r.sentiment?`<span>${E(r.sentiment)}</span>`:''}</div></div><a class="aroma-chronology-link" href="${E(r.url)}" target="_blank" rel="noopener noreferrer">ИЗТОЧНИК ↗</a></article>`;
}
function panelHTML(scope,state){
  const competitor=scope==='competitor';
  const rows=state.rows.slice(0,18);
  const title=competitor?'Хронология на споменаванията на конкурентите':'Хронология на споменаванията на Aroma';
  const desc=competitor?'Проверени публикации за наблюдаваните конкуренти, подредени по дата на публикуване.':'Проверени публикации и сигнали за Aroma, подредени по дата на публикуване.';
  const status=state.ok?`${state.rows.length} проверени · последни ${periodDays()} дни`:'Потокът е временно недостъпен';
  return `<div class="aroma-chronology-head"><div><${competitor?'h3':'h4'}>${title}</${competitor?'h3':'h4'}><p>${desc} Всеки запис води към първоизточника.</p></div><span class="aroma-chronology-status">${E(status)}</span></div>${rows.length?`<div class="aroma-chronology-list">${rows.map(r=>rowHTML(r,scope)).join('')}</div>`:`<div class="aroma-chronology-empty">${state.ok?'Няма проверени споменавания за избрания период.':'Не може да се зареди потокът в момента; не се показват непроверени или синтетични записи.'}</div>`}`;
}

function activateCompetitionBar(){
  if(!aromaOnly())return;
  document.querySelectorAll('#competition .cmpv9-bar,#competitionBody .cmpv9-bar').forEach(bar=>{
    bar.style.setProperty('display','flex','important');
    bar.style.setProperty('visibility','visible','important');
    bar.style.setProperty('opacity','1','important');
    bar.removeAttribute('hidden');bar.setAttribute('aria-hidden','false');
  });
}
async function mountCompetition(force=false){
  if(!aromaOnly())return;
  activateCompetitionBar();
  const root=document.querySelector('#competitionBody>.cmpv5')||document.getElementById('competitionBody')||document.getElementById('competition');
  if(!root)return;
  let panel=root.querySelector('#aromaCompetitorChronology');
  if(!panel){panel=document.createElement('section');panel.id='aromaCompetitorChronology';panel.className='aroma-chronology aroma-chronology--competitor';panel.setAttribute('aria-label','Хронология на споменаванията на конкурентите');root.appendChild(panel)}
  const state=await load('competitor',force);if(panel.isConnected)panel.innerHTML=panelHTML('competitor',state);
}
async function mountMonitoring(force=false){
  if(!aromaOnly())return;
  const social=document.getElementById('social')||document.getElementById('socialBody');if(!social)return;
  let panel=social.querySelector('#aromaBrandChronology');
  if(!panel){panel=document.createElement('section');panel.id='aromaBrandChronology';panel.className='aroma-chronology aroma-chronology--brand';panel.setAttribute('aria-label','Хронология на споменаванията на Aroma');const anchor=social.querySelector('.mon5-mentions');if(anchor)anchor.insertAdjacentElement('afterend',panel);else social.appendChild(panel)}
  const state=await load('brand',force);if(panel.isConnected)panel.innerHTML=panelHTML('brand',state);
}

let timer=0;
function sync(force=false){
  css();
  if(!aromaOnly())return;
  activateCompetitionBar();
  if(document.getElementById('competition')||document.getElementById('competitionBody'))mountCompetition(force);
  if(document.getElementById('social')||document.getElementById('socialBody'))mountMonitoring(force);
}
function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>sync(force),70)}
function start(){
  css();sync();
  const mo=new MutationObserver(()=>schedule(false));mo.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="competition"],[data-page="social"],[data-page="monitoring"],.cmpv5-seg button'))setTimeout(()=>sync(false),120)},true);
  window.addEventListener('blis:clientdata',()=>schedule(true));
  window.addEventListener('blis:periodchange',()=>schedule(true));
  setInterval(()=>{if(aromaOnly())sync(true)},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.BLISAromaMentionChronologyV1={sync,mountCompetition,mountMonitoring};
})();
/* BLIS Navigator — data-only core v2. No navigation, no page rendering. */
(function(){
'use strict';
if(window.__BLIS_DATA_CORE_V2)return;window.__BLIS_DATA_CORE_V2=true;

var $=window.$=window.$||function(id){return document.getElementById(id)};
var esc=window.esc=window.esc||function(s){return String(s??'').replace(/[&<>"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])})};
var slug=window.slug=String(window.BLIS_INITIAL_CLIENT||document.body?.dataset?.client||'aroma');
var D=window.D=null,S=window.S=[],Q=window.Q={},A=window.A=[],H=window.H=[];

const CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox']);
function currentClient(){
  try{const q=new URLSearchParams(location.search).get('client');if(CLIENTS.has(q))return q}catch(_){}
  const b=document.body?.dataset?.client;if(CLIENTS.has(b))return b;
  const s=document.getElementById('clientSel')?.value;if(CLIENTS.has(s))return s;
  if(CLIENTS.has(window.BLIS_INITIAL_CLIENT))return window.BLIS_INITIAL_CLIENT;
  return 'aroma';
}
function syncGlobals(){window.slug=slug;window.D=D;window.S=S;window.Q=Q;window.A=A;window.H=H;try{globalThis.slug=slug}catch(_){} }
function idx(k){return (D?.indices||[]).find(function(x){return x.key===k})||null}
function score(k){const x=idx(k),n=x==null?NaN:Number(x.value);return Number.isFinite(n)?n:null}
function hist(k){return (H||[]).map(function(s){const p=s?.payload||{};if(k==='blis')return Number(p.blis_index);const x=(p.indices||[]).find(function(i){return i.key===k});return x?Number(x.value):NaN}).filter(Number.isFinite)}
function sourceName(k){const x=(S||[]).find(function(s){return (s.key||s.source_key)===k});return x?.label||x?.name||k||'Източник'}
function metricName(k){const m={followers:'Публична аудитория',visible_posts_90d:'Видими публикации за 90 дни',news_mentions_30d:'Новинарски споменавания за 30 дни',profile_active:'Публичен профил',website_active:'Официален сайт',category_count:'Продуктови категории',review_count:'Публични отзиви',rating:'Публична оценка',ecommerce_active:'Електронна търговия',pricing_visible:'Видими цени',cart_active:'Количка',product_details:'Продуктова информация',history_visible:'История на марката',language_count:'Езиково покритие',portfolio_items:'Портфолио'};return m[k]||String(k||'').replaceAll('_',' ')}
function activityValue(x){if(/_active$|profile_active|website_active|pricing_visible|product_details|history_visible/.test(String(x?.metric||'')))return Number(x?.value)>0?'Потвърдено':'Не е потвърдено';if(String(x?.metric||'').includes('rating')&&!String(x?.metric||'').includes('ratings')){const n=Number(x?.value);return Number.isFinite(n)?n.toFixed(1):'—'}return x?.value??'—'}
function dossier(){const name=String(D?.name||document.querySelector('.client-brand-name')?.textContent||'Клиент');return{mono:name.split(/\s+/).filter(Boolean).slice(0,2).map(function(x){return x[0]}).join('').toUpperCase(),descriptor:D?.sector||document.querySelector('.client-brand-type')?.textContent||''}}

window.idx=idx;window.score=score;window.hist=hist;window.sourceName=sourceName;window.metricName=metricName;window.activityValue=activityValue;window.dossier=dossier;

function setClient(key){if(!CLIENTS.has(key))key='aroma';slug=key;window.slug=key;window.BLIS_INITIAL_CLIENT=key;document.body.dataset.client=key;const sel=document.getElementById('clientSel');if(sel&&sel.value!==key)sel.value=key;try{localStorage.setItem('blis-client-ui',key)}catch(_){} }
function endpoint(name){return `/api/clients/${encodeURIComponent(slug)}/${name}`}
async function json(url,fallback){try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)return fallback;return await r.json()}catch(_){return fallback}}
async function load(key){
  setClient(CLIENTS.has(key)?key:currentClient());
  const b=Date.now();
  const out=await Promise.all([
    json(endpoint('dashboard')+'?_='+b,{}),
    json(endpoint('sources')+'?_='+b,[]),
    json(endpoint('data-quality')+'?_='+b,{}),
    json(endpoint('activity')+'?_='+b,[]),
    json(endpoint('history')+'?_='+b,[])
  ]);
  D=out[0]||{};S=Array.isArray(out[1])?out[1]:[];Q=out[2]||{};A=Array.isArray(out[3])?out[3]:[];H=Array.isArray(out[4])?out[4]:[];
  syncGlobals();
  const ls=document.getElementById('lastSync');if(ls)ls.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'няма синхронизация';
  window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:slug,slug:slug,data:D,sources:S,quality:Q,activity:A,history:H}}));
  requestAnimationFrame(function(){try{window.BLISCanonicalRenderActive?.()}catch(e){console.warn('BLIS canonical render',e)}});
  return D;
}
window.load=load;
window.refreshNow=async function(){try{await fetch(endpoint('refresh'),{method:'POST'});return await load(slug)}catch(e){console.error(e)}};
window.download=function(type,format){location.href=endpoint('generate')+`?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`};
window.closeModal=function(){document.getElementById('modal')?.classList.remove('open')};

async function init(){
  const sel=document.getElementById('clientSel');
  if(sel){sel.value=currentClient();sel.onchange=function(e){load(String(e.target.value||'aroma'))}}
  setClient(currentClient());
  await load(slug);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

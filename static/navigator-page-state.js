/* BLIS Navigator — canonical persistent page state v3. */
(function(){
'use strict';
if(window.__BLIS_PAGE_STATE_V3)return;window.__BLIS_PAGE_STATE_V3=true;
const PAGES=new Set(['overview','live','social','digital','reputation','market','competition','reports','history','profile','settings','help']);
const CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox']);
const KEY='blis.navigator.page.';
let internal=false;
function client(){
  try{const q=new URLSearchParams(location.search).get('client');if(CLIENTS.has(q))return q}catch(_){}
  const b=String(document.body?.dataset?.client||'');if(CLIENTS.has(b))return b;
  try{if(CLIENTS.has(window.slug))return window.slug}catch(_){}
  return 'aroma';
}
function active(){const p=document.querySelector('.page.active')?.id;return PAGES.has(p)?p:'overview'}
function stored(c=client()){try{const p=localStorage.getItem(KEY+c);return PAGES.has(p)?p:null}catch(_){return null}}
function wanted(){try{const p=new URLSearchParams(location.search).get('page');if(PAGES.has(p))return p}catch(_){}return stored()||'overview'}
function save(p,replace=true){if(!PAGES.has(p))return;const c=client();try{localStorage.setItem(KEY+c,p)}catch(_){};const u=new URL(location.href);u.searchParams.set('client',c);u.searchParams.set('page',p);const next=u.pathname+u.search+u.hash;if(replace)history.replaceState({client:c,page:p},'',next);else if(location.pathname+location.search+location.hash!==next)history.pushState({client:c,page:p},'',next)}
function go(p){if(!PAGES.has(p))p='overview';internal=true;try{if(typeof window.refGo==='function')return window.refGo(p);document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===p));document.querySelectorAll('#nav button[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p))}finally{setTimeout(()=>internal=false,0)}}
function wrap(){const fn=window.refGo;if(typeof fn!=='function'||fn.__blisStateV3)return;function w(p,...args){p=PAGES.has(String(p))?String(p):'overview';if(!internal)save(p,true);return fn.call(this,p,...args)}w.__blisStateV3=true;w.__base=fn;window.refGo=w}
function restore(){wrap();const p=wanted();if(active()!==p)go(p);save(p,true)}
document.addEventListener('click',e=>{const b=e.target.closest?.('#nav button[data-page]');if(b&&PAGES.has(b.dataset.page))save(b.dataset.page,true);const o=e.target.closest?.('.client-option[data-client-key]');if(o&&CLIENTS.has(o.dataset.clientKey)){try{localStorage.setItem(KEY+o.dataset.clientKey,active())}catch(_){}}},true);
window.addEventListener('popstate',()=>{const p=wanted();if(PAGES.has(p))go(p)});
window.addEventListener('blis:clientdata',()=>{wrap();save(active(),true)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
[80,240,600,1200].forEach(ms=>setTimeout(()=>{wrap();if(active()!==wanted())go(wanted())},ms));
})();

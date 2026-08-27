/* BLIS Navigator — canonical persistent page state v5. Event driven. */
(function(){
'use strict';
if(window.__BLIS_PAGE_STATE_V5)return;window.__BLIS_PAGE_STATE_V5=true;
const PAGES=new Set(['overview','live','social','digital','reputation','market','competition','reports','history','profile','settings','help','commerce']);
const ALIAS={signals:'social',sources:'profile',timeline:'history'};
const CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox','wirello']);
const KEY='blis.navigator.page.';
let internal=false;
const canonical=p=>{p=String(p||'');return ALIAS[p]||p};
function client(){try{const q=new URLSearchParams(location.search).get('client');if(CLIENTS.has(q))return q}catch(_){}const b=String(document.body?.dataset?.client||'');if(CLIENTS.has(b))return b;try{if(CLIENTS.has(window.slug))return window.slug}catch(_){}return'aroma'}
function active(){const p=canonical(document.querySelector('.page.active')?.id);return PAGES.has(p)?p:'overview'}
function stored(c=client()){try{const p=canonical(localStorage.getItem(KEY+c));return PAGES.has(p)?p:null}catch(_){return null}}
function wanted(){try{const p=canonical(new URLSearchParams(location.search).get('page'));if(PAGES.has(p))return p}catch(_){}return stored()||'overview'}
function save(p,replace=true){p=canonical(p);if(!PAGES.has(p))return;const c=client();try{localStorage.setItem(KEY+c,p)}catch(_){}const u=new URL(location.href);u.searchParams.set('client',c);u.searchParams.set('page',p);const next=u.pathname+u.search+u.hash;if(replace)history.replaceState({client:c,page:p},'',next);else if(location.pathname+location.search+location.hash!==next)history.pushState({client:c,page:p},'',next)}
function go(p){p=canonical(p);if(!PAGES.has(p))p='overview';internal=true;try{if(typeof window.refGo==='function')return window.refGo(p);document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===p));document.querySelectorAll('#nav button[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p))}finally{queueMicrotask(()=>{internal=false})}}
function wrap(){const fn=window.refGo;if(typeof fn!=='function'||fn.__blisStateV5)return;function w(p,...args){p=canonical(p);if(!PAGES.has(p))p='overview';if(!internal)save(p,true);return fn.call(this,p,...args)}w.__blisStateV5=true;w.__base=fn;window.refGo=w}
function restore(){wrap();const p=wanted();if(active()!==p)go(p);save(p,true)}
document.addEventListener('click',e=>{const b=e.target.closest?.('#nav button[data-page],[data-blis-commerce-open]');if(b){const p=b.matches?.('[data-blis-commerce-open]')?'commerce':canonical(b.dataset.page);if(PAGES.has(p))save(p,true)}const o=e.target.closest?.('.client-option[data-client-key]');if(o&&CLIENTS.has(o.dataset.clientKey)){try{localStorage.setItem(KEY+o.dataset.clientKey,active())}catch(_){}}},true);
window.addEventListener('popstate',()=>go(wanted()));
window.addEventListener('blis:clientdata',()=>{wrap();save(active(),true)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
window.BLISPageStateV5={canonical,wanted,active,save};
})();

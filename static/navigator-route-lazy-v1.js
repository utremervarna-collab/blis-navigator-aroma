/* BLIS Navigator — route lazy loader v1.
   Heavy enrichments load only when their page is opened. */
(function(){
'use strict';
if(window.__BLIS_ROUTE_LAZY_V1)return;window.__BLIS_ROUTE_LAZY_V1=true;
const loaded=new Map();
function script(src){if(loaded.has(src))return loaded.get(src);const p=new Promise(resolve=>{const old=document.querySelector('script[data-blis-lazy-src="'+src+'"]');if(old){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.dataset.blisLazySrc=src;s.onload=()=>resolve();s.onerror=()=>resolve();document.body.appendChild(s)});loaded.set(src,p);return p}
function page(){try{const raw=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';return window.BLISRouteAlias?.(raw)||raw}catch(_){return'overview'}}
async function competition(){
 await Promise.all([
  script('/navigator-competition-news-v1.js?v=20260926-lazy1'),
  script('/navigator-competitor-dossiers-data-v2.js?v=20260926-lazy1')
 ]);
 await script('/navigator-competitor-dossiers-tune-v1.js?v=20260926-lazy1');
 await script('/navigator-3-competitor-dossier-v2.js?v=20260926-lazy1');
}
async function monitoring(){await script('/navigator-monitoring-canonical-v5.js?v=20260926-lazy1')}
function loadCurrent(){const p=page();if(p==='competition')competition();else if(p==='social')monitoring()}
for(const ev of ['blis:routechange','blis:production-ready'])window.addEventListener(ev,()=>setTimeout(loadCurrent,0));
document.addEventListener('click',e=>{const b=e.target.closest?.('#nav [data-page],#nav [data-n3-page]');if(b)setTimeout(loadCurrent,0)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadCurrent,{once:true});else loadCurrent();
window.BLISRouteLazyV1={loadCurrent};
})();
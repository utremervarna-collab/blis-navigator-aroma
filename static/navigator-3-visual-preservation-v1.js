/* BLIS Navigator 3.0 — canonical visual preservation layer v2.
   Never draws replacement charts. It restores only the approved canonical visual owners
   after the 5+2 information architecture reorganizes page ownership. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_VISUAL_PRESERVATION_V1)return;
window.__BLIS_NAVIGATOR_3_VISUAL_PRESERVATION_V1=true;
let repairing=false,radarTimer=0;
const active=()=>window.BLISRouteAlias?.(document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview')||'overview';

function css(){
 if(document.getElementById('navigator3VisualPreservationV2Css'))return;
 const s=document.createElement('style');s.id='navigator3VisualPreservationV2Css';s.textContent=`
 html[data-navigator-version="3.0-preserved-visuals-5plus2"] #overview > #overviewBody{display:none!important}
 html[data-navigator-version="3.0-preserved-visuals-5plus2"] [data-blis-language-switch],
 html[data-navigator-version="3.0-preserved-visuals-5plus2"] .bch3-lang,
 html[data-navigator-version="3.0-preserved-visuals-5plus2"] #langToggle,
 html[data-navigator-version="3.0-preserved-visuals-5plus2"] .lang-toggle,
 html[data-navigator-version="3.0-preserved-visuals-5plus2"] .language-toggle{display:none!important}
 `;document.head.appendChild(s)
}
function forceBulgarian(){
 document.documentElement.lang='bg';document.documentElement.dataset.navigatorLanguage='bg-only';window.BLIS_LANGUAGE='bg';
 document.querySelectorAll('[data-blis-language-switch],.bch3-lang,#langToggle,.lang-toggle,.language-toggle').forEach(n=>n.remove());
 document.querySelectorAll('.topbar button,.topbar a').forEach(n=>{const t=(n.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();if(t==='EN'||t==='BG | EN'||t==='BG/EN')n.remove()});
}
function paintChrome(){
 forceBulgarian();
 try{window.BLISColorSystemV1?.decorate?.()}catch(_){}
 try{window.BLISOverviewMarkerFixV1?.align?.()}catch(_){}
 try{window.BLISNoPageNumbersV1?.clean?.()}catch(_){}
 try{window.BLISLanguageCleanupV1?.clean?.()}catch(_){}
}
function hasOverview(){return !!document.querySelector('#overview .ovh-gauge svg')}
function hasRadar(){return !!document.querySelector('#social #digitalBody .dv-radar-wrap .dv-radar-grid')}
function hasMarket(){return !!document.querySelector('#market .pm-stage,#market .pm-canvas')}
function hasCompetition(){return !!document.querySelector('#competition .vs-comp-axis')}
function hasHistory(){return !!document.querySelector('#history .vs-history-board')}
function mark(){
 const gauge=document.querySelector('#overview .ovh-gauge');
 const radar=document.querySelector('#social #digitalBody .dv-radar-wrap');
 const market=document.querySelector('#market .pm-stage,#market .pm-canvas');
 const comp=document.querySelector('#competition .vs-comp-axis');
 const history=document.querySelector('#history .vs-history-board');
 if(gauge)gauge.dataset.blisVisual='overview-index-canonical';
 if(radar)radar.dataset.blisVisual='signals-radar-canonical';
 if(market)market.dataset.blisVisual='market-network-canonical';
 if(comp)comp.dataset.blisVisual='competition-bar-canonical';
 if(history)history.dataset.blisVisual='history-canonical';
 document.documentElement.dataset.navigatorVisualOwner='canonical-preserved-v2';
}
function cleanOverview(){
 const legacy=document.getElementById('overviewBody');if(legacy)legacy.setAttribute('aria-hidden','true');
 const premium=document.getElementById('overviewPremium');if(premium&&hasOverview())premium.dataset.n3VisualOwner='overview-client-home-v1';
}
function socialHost(){return document.getElementById('socialBody')||document.getElementById('social')}
function ensureRadarMount(){
 const h=socialHost();if(!h)return null;
 const mount=h.querySelector('[data-n3-digital-mount]');if(!mount)return null;
 let body=document.getElementById('digitalBody');if(!body){body=document.createElement('div');body.id='digitalBody'}
 if(body.parentElement!==mount)mount.appendChild(body);
 return body;
}
function repairRadar(attempt=0){
 clearTimeout(radarTimer);if(active()!=='social')return;
 const body=ensureRadarMount();if(!body){if(attempt<10)radarTimer=setTimeout(()=>repairRadar(attempt+1),70);return}
 if(!body.querySelector('.dv-radar-wrap .dv-radar-grid'))try{window.BLISDigitalRadar?.render?.()}catch(e){console.error('Navigator 3 canonical Radar restore error',e)}
 if(body.querySelector('.dv-radar-wrap .dv-radar-grid')){
  body.dataset.n3VisualOwner='digital-radar';body.querySelector('.dv-radar-wrap')?.setAttribute('data-blis-visual','signals-observation');
  if(!body.dataset.n3ArchitectureReplay){body.dataset.n3ArchitectureReplay='1';setTimeout(()=>{if(active()==='social')try{window.BLISNavigator3ArchitectureV1?.render?.()}catch(e){console.error(e)}},25)}
  mark();return;
 }
 if(attempt<10)radarTimer=setTimeout(()=>repairRadar(attempt+1),90);else document.documentElement.dataset.navigatorRadarRepair='failed';
}
function repair(id=active()){
 if(repairing)return;repairing=true;
 try{
  css();paintChrome();
  if(id==='overview'){
   if(!hasOverview())window.BLISVisualSuiteV1?.render?.('overview');
   cleanOverview();
  }
  if(id==='social')repairRadar(0);
  if(id==='market'&&!hasMarket()){
   if(window.BLISMarketSystemV1?.mount)window.BLISMarketSystemV1.mount();else window.BLISPerceptionMap?.mount?.();
   setTimeout(()=>window.BLISPerceptionMap?.render?.(),40);
  }
  if(id==='competition'&&!hasCompetition())window.BLISVisualSuiteV1?.render?.('competition');
  if(id==='history'&&!hasHistory())window.BLISVisualSuiteV1?.render?.('history');
  mark();
 }catch(e){console.error('Navigator 3 canonical visual restore error',id,e)}finally{repairing=false}
}
function schedule(id=active()){[0,60,180,420].forEach(ms=>setTimeout(()=>repair(id),ms))}
for(const ev of ['blis:routechange','blis:navigator-route','blis:clientdata','blis:intelligence','blis:periodchange','blis:production-ready'])window.addEventListener(ev,e=>schedule(e?.detail?.page||active()));
window.addEventListener('popstate',()=>schedule(active()));
const observer=new MutationObserver(()=>{forceBulgarian();if(active()==='overview')cleanOverview()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{css();observer.observe(document.body,{childList:true,subtree:true});schedule()},{once:true});else{css();observer.observe(document.body,{childList:true,subtree:true});schedule()}
window.BLISNavigator3VisualPreservationV1={repair,schedule,mark,repairRadar,cleanOverview,forceBulgarian};
})();

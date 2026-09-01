/* BLIS Navigator 3.0 — canonical visual preservation layer.
   Never draws replacement charts. It only asks the already-approved canonical renderers
   to restore their own visuals when Navigator 3 reorganizes page ownership. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_VISUAL_PRESERVATION_V1)return;
window.__BLIS_NAVIGATOR_3_VISUAL_PRESERVATION_V1=true;
let repairing=false;
const active=()=>window.BLISRouteAlias?.(document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview')||'overview';
function paintChrome(){
 try{window.BLISColorSystemV1?.decorate?.()}catch(_){}
 try{window.BLISOverviewMarkerFixV1?.align?.()}catch(_){}
 try{window.BLISNoPageNumbersV1?.clean?.()}catch(_){}
 try{window.BLISLanguageCleanupV1?.clean?.()}catch(_){}
}
function hasOverview(){return !!document.querySelector('#overview .vs-gauge-card,#overview .vs-gauge-svg')}
function hasRadar(){return !!document.querySelector('#social .dv-radar-wrap')}
function hasMarket(){return !!document.querySelector('#market .pm-stage,#market .pm-canvas')}
function hasCompetition(){return !!document.querySelector('#competition .vs-comp-axis')}
function mark(){
 const gauge=document.querySelector('#overview .vs-gauge-card,#overview .vs-gauge-svg');
 const radar=document.querySelector('#social .dv-radar-wrap');
 const market=document.querySelector('#market .pm-stage,#market .pm-canvas');
 const comp=document.querySelector('#competition .vs-comp-axis');
 if(gauge)gauge.dataset.blisVisual='overview-index-canonical';
 if(radar)radar.dataset.blisVisual='signals-radar-canonical';
 if(market)market.dataset.blisVisual='market-network-canonical';
 if(comp)comp.dataset.blisVisual='competition-bar-canonical';
 document.documentElement.dataset.navigatorVisualOwner='canonical-preserved';
}
function repair(id=active()){
 if(repairing)return;
 repairing=true;
 try{
  if(id==='overview'&&!hasOverview()){
   window.BLISVisualSuiteV1?.render?.('overview');
  }
  if(id==='social'&&!hasRadar()){
   window.BLISDigitalRadar?.render?.();
   setTimeout(()=>window.BLISNavigator3ArchitectureV1?.render?.(),30);
  }
  if(id==='market'&&!hasMarket()){
   if(window.BLISMarketSystemV1?.mount)window.BLISMarketSystemV1.mount();
   else window.BLISPerceptionMap?.mount?.();
   setTimeout(()=>window.BLISPerceptionMap?.render?.(),40);
  }
  if(id==='competition'&&!hasCompetition()){
   window.BLISVisualSuiteV1?.render?.('competition');
  }
  paintChrome();
  mark();
 }catch(e){console.error('Navigator 3 canonical visual restore error',id,e)}
 finally{repairing=false}
}
function schedule(id=active()){
 [0,60,180,420].forEach(ms=>setTimeout(()=>repair(id),ms));
}
for(const ev of ['blis:routechange','blis:navigator-route','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,e=>schedule(e?.detail?.page||active()));
window.addEventListener('popstate',()=>schedule(active()));
window.BLISNavigator3VisualPreservationV1={repair,schedule,mark};
schedule();
})();

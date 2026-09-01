/* BLIS Navigator 3.0 — canonical production entrypoint.
   Bulgarian client interface with simplified 5+2 architecture on top of the approved canonical visuals. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V41)return;window.__BLIS_PRODUCTION_ENTRY_V41=true;
const VERSION='20260901-nav3-final-page-names-1';
function forceBulgarianEarly(){document.documentElement.lang='bg';document.documentElement.dataset.navigatorLanguage='bg-only';window.BLIS_LANGUAGE='bg';try{const u=new URL(location.href);if(u.searchParams.has('lang')){u.searchParams.delete('lang');history.replaceState(history.state,'',u.pathname+u.search+u.hash)}}catch(_){}}
forceBulgarianEarly();
function urlClient(){try{return new URLSearchParams(location.search).get('client')||''}catch(_){return''}}
const initialClient=urlClient()||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(document.body){document.body.dataset.client=initialClient;document.body.dataset.navigatorBuild=VERSION}window.BLIS_INITIAL_CLIENT=initialClient;window.slug=initialClient;
function reset(n){try{window[n]=false}catch(_){}}
['__BLIS_REFERENCE_V16','__BLIS_REFERENCE_V17','__BLIS_REFERENCE_V18','__BLIS_CLIENT_UI_V3','__BLIS_CLIENT_HEADER_V1','__BLIS_CLIENT_HEADER_V2','__BLIS_CLIENT_BRANDING_V3','__BLIS_CLIENT_BRANDING_V4','__BLIS_CLIENT_BRANDING_V5','__BLIS_DATA_LOADER_V1','__BLIS_INTELLIGENCE_STREAM_V3','__BLIS_CLIENT_PERSPECTIVE_CLASSIFIER_V1','__BLIS_RISK_PRIORITY_SYNC_V1','__BLIS_EXECUTIVE_DATA_V1','__BLIS_EXECUTIVE_REPORTS_V1','__BLIS_COLOR_SYSTEM_V1','__BLIS_VISUAL_SUITE_V1','__BLIS_VISUAL_SUITE_MOTION_V1','__BLIS_VISUAL_SPECIAL_V2','__BLIS_NO_PAGE_NUMBERS_V1','__BLIS_OVERVIEW_CLIENT_HOME_V1','__BLIS_OVERVIEW_MARKER_FIX_V1','__BLIS_LANGUAGE_CLEANUP_V1','__BLIS_SYSTEM_STRUCTURE_V3','__BLIS_SYSTEM_STRUCTURE_V4','__BLIS_SYSTEM_STRUCTURE_V5','__BLIS_NAVIGATOR_3_CLIENT_CLARITY_V1','__BLIS_NAVIGATOR_3_EVIDENCE_V1','__BLIS_NAVIGATOR_3_COMPETITOR_DOSSIER_V1','__BLIS_NAVIGATOR_3_CLIENT_PROOF_V1','__BLIS_NAVIGATOR_3_ARCHITECTURE_V1','__BLIS_NAVIGATOR_3_VISUAL_PRESERVATION_V1','__BLIS_NAVIGATOR_3_PAGE_CONTRACT_V1'].forEach(reset);
function loadStyle(src){return new Promise((resolve,reject)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=src+'?v='+VERSION;l.dataset.blisCanonicalStyle='1';l.onload=resolve;l.onerror=()=>reject(new Error('CSS: '+src));document.head.appendChild(l)})}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('JS: '+src));document.body.appendChild(s)})}
async function safeStyle(src){try{await loadStyle(src)}catch(e){console.error(e)}}async function safe(src){try{await loadScript(src)}catch(e){console.error(e)}}
function markCanonicalVisuals(){const radar=document.querySelector('#social .dv-radar-wrap,#digitalBody .dv-radar-wrap');if(radar){radar.setAttribute('data-digital-radar','1');radar.setAttribute('data-blis-visual','signals-observation')}const map=document.querySelector('#market .pm-stage,#market .pm-canvas');if(map)map.setAttribute('data-blis-visual','market-reputation-network');const comp=document.querySelector('#competition .vs-comp-axis');if(comp)comp.setAttribute('data-blis-visual','competition-bar');const gauge=document.querySelector('#overview .vs-gauge-card,#overview .vs-gauge-svg,#overview .ovh-gauge');if(gauge)gauge.setAttribute('data-blis-visual','overview-index')}
function scheduleVisualContract(){markCanonicalVisuals();window.BLISNavigator3VisualPreservationV1?.schedule?.();window.BLISNavigator3PageContractV1?.schedule?.();setTimeout(markCanonicalVisuals,70);setTimeout(markCanonicalVisuals,240)}
function activeRoute(){const raw=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';return window.BLISRouteAlias?.(raw)||({digital:'social',opportunities:'social',live:'social',reputation:'market',reports:'history',timeline:'history'}[raw]||raw)}
function canonicalVisualReady(){const id=activeRoute();if(id==='overview')return!!document.querySelector('#overview .ovh-gauge svg,#overview .vs-gauge-card svg,#overview .vs-gauge-svg');if(id==='social')return!!document.querySelector('#social #digitalBody .dv-radar-wrap .dv-radar-grid');if(id==='market')return!!document.querySelector('#market .pm-stage,#market .pm-canvas');if(id==='competition')return!!document.querySelector('#competition .vs-comp-axis');if(id==='history')return!!document.querySelector('#history .vs-history-board');if(id==='hub'||id==='calendar')return!!document.querySelector(`#${id} .n3-resource-card`);return!!document.querySelector('.page.active')}
function finalShellReady(){return document.documentElement.dataset.navigatorVersion==='3.0-preserved-visuals-5plus2'&&document.querySelectorAll('#nav [data-n3-page]').length===7&&!!document.querySelector('.bch3-context-title')&&!!document.querySelector('.page.active')&&canonicalVisualReady()}
let appRevealed=false;
function revealFinalApp(){if(appRevealed||!document.body)return;appRevealed=true;document.getElementById('blisPrepaintGuard')?.remove();document.body.classList.add('blis-app-ready');document.documentElement.dataset.navigatorPaint='ready';requestAnimationFrame(()=>requestAnimationFrame(()=>{const cover=document.getElementById('blisNavigatorBootScreen');if(cover)setTimeout(()=>cover.remove(),220)}))}
function waitForFinalPaint(started=Date.now()){
 forceBulgarianEarly();window.BLISNavigator3ArchitectureV1?.render?.();window.BLISNavigator3VisualPreservationV1?.schedule?.();window.BLISNavigator3PageContractV1?.schedule?.();markCanonicalVisuals();
 if(finalShellReady()){requestAnimationFrame(()=>requestAnimationFrame(revealFinalApp));return}
 const elapsed=Date.now()-started;if(elapsed>12000){const small=document.querySelector('#blisNavigatorBootScreen small');if(small)small.textContent='Финализиране на профила'}
 setTimeout(()=>waitForFinalPaint(started),70)
}
async function boot(){
 forceBulgarianEarly();
 for(const css of ['/navigator-reference.css','/navigator-shell-master.css','/navigator-client-ui.css','/navigator-digital-master.css','/navigator-perception-map.css','/navigator-executive-layout-fix-v2.css','/navigator-executive-pages-4-9.css','/navigator-visual-special-v2.css','/navigator-signal-current-marker-v1.css'])await safeStyle(css);
 await safe('/navigator-system-structure-v1.js');
 await safe('/navigator-perception-core-v8.js');await safe('/navigator-perception-map.js');await safe('/navigator-market-system-v1.js');
 await safe('/navigator-data-loader-v1.js');await window.BLISDataLoaderV1?.load?.(initialClient,true);
 await safe('/navigator-intelligence-stream-v2.js');await safe('/navigator-client-perspective-classifier-v1.js');await safe('/navigator-executive-data-v1.js');
 await safe('/navigator-digital-master.js');await safe('/navigator-client-ui.js');await safe('/navigator-client-branding-v3.js');await safe('/navigator-executive-reports-v1.js');
 await safe('/navigator-visual-suite-v1.js');await safe('/navigator-visual-suite-motion-v1.js');await safe('/navigator-visual-special-v2.js');await safe('/navigator-overview-client-home-v1.js');
 reset('__BLIS_REFERENCE_V18');await safe('/navigator-reference.js');
 await safe('/navigator-risk-priority-sync-v1.js');await safe('/navigator-overview-marker-fix-v1.js');await safe('/navigator-color-system-v1.js');await safe('/navigator-no-page-numbers-v1.js');await safe('/navigator-language-cleanup-v1.js');
 forceBulgarianEarly();
 await safe('/navigator-3-client-clarity-v1.js');await safe('/navigator-3-evidence-v1.js');await safe('/navigator-3-competitor-dossier-v1.js');await safe('/navigator-3-client-proof-v1.js');
 await safe('/navigator-3-architecture-v1.js');await safe('/navigator-3-visual-preservation-v1.js');await safe('/navigator-3-page-contract-v1.js');
 window.addEventListener('blis:intelligence',()=>{setTimeout(()=>window.BLISCanonicalRenderActive?.(),50);scheduleVisualContract()});for(const ev of ['blis:routechange','blis:navigator-route','blis:clientdata','popstate'])window.addEventListener(ev,scheduleVisualContract);
 document.documentElement.dataset.navigatorUi='navigator3-preserved-canonical-visuals';
 window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client:initialClient,page:activeRoute(),version:VERSION}}));
 setTimeout(()=>{forceBulgarianEarly();window.BLISClientPerspectiveClassifierV1?.repaint?.();window.BLISClientBrandingV5?.paint?.();window.BLISOverviewMarkerFixV1?.align?.();window.BLISColorSystemV1?.decorate?.();window.BLISNoPageNumbersV1?.clean?.();window.BLISLanguageCleanupV1?.clean?.();window.BLISNavigator3ClientClarity?.decorate?.();window.BLISNavigator3ClientProofV1?.decorate?.();window.BLISNavigator3ArchitectureV1?.render?.();window.BLISNavigator3VisualPreservationV1?.schedule?.();window.BLISNavigator3PageContractV1?.schedule?.();scheduleVisualContract();waitForFinalPaint()},120);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

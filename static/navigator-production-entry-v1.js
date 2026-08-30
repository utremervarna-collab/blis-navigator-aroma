/* BLIS Navigator — production entrypoint v28.
   Canonical data loader + fail-safe router owners + number-free page chrome + clear Signals current marker. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V28)return;window.__BLIS_PRODUCTION_ENTRY_V28=true;
const VERSION='20260830-signal-current-marker-1';
function urlClient(){try{return new URLSearchParams(location.search).get('client')||''}catch(_){return''}}
const initialClient=urlClient()||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(document.body){document.body.dataset.client=initialClient;document.body.dataset.navigatorBuild=VERSION}
window.BLIS_INITIAL_CLIENT=initialClient;window.slug=initialClient;
function reset(n){try{window[n]=false}catch(_){}}
['__BLIS_REFERENCE_V16','__BLIS_REFERENCE_V17','__BLIS_REFERENCE_V18','__BLIS_CLIENT_UI_V3','__BLIS_DATA_LOADER_V1','__BLIS_INTELLIGENCE_STREAM_V3','__BLIS_EXECUTIVE_DATA_V1','__BLIS_EXECUTIVE_REPORTS_V1','__BLIS_COLOR_SYSTEM_V1','__BLIS_VISUAL_SUITE_V1','__BLIS_VISUAL_SUITE_MOTION_V1','__BLIS_VISUAL_SPECIAL_V2','__BLIS_NO_PAGE_NUMBERS_V1'].forEach(reset);
function loadStyle(src){return new Promise((resolve,reject)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=src+'?v='+VERSION;l.dataset.blisCanonicalStyle='1';l.onload=resolve;l.onerror=()=>reject(new Error('CSS: '+src));document.head.appendChild(l)})}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('JS: '+src));document.body.appendChild(s)})}
async function safeStyle(src){try{await loadStyle(src)}catch(e){console.error(e)}}
async function safe(src){try{await loadScript(src)}catch(e){console.error(e)}}
async function boot(){
 for(const css of ['/navigator-reference.css','/navigator-shell-master.css','/navigator-client-ui.css','/navigator-digital-master.css','/navigator-perception-map.css','/navigator-executive-layout-fix-v2.css','/navigator-executive-pages-4-9.css','/navigator-visual-special-v2.css','/navigator-signal-current-marker-v1.css'])await safeStyle(css);
 await safe('/navigator-system-structure-v1.js');
 await safe('/navigator-perception-core-v8.js');await safe('/navigator-perception-map.js');await safe('/navigator-market-system-v1.js');
 await safe('/navigator-data-loader-v1.js');
 await window.BLISDataLoaderV1?.load?.(initialClient,true);
 await safe('/navigator-intelligence-stream-v2.js');await safe('/navigator-executive-data-v1.js');
 await safe('/navigator-digital-master.js');await safe('/navigator-client-ui.js');await safe('/navigator-executive-reports-v1.js');
 await safe('/navigator-visual-suite-v1.js');await safe('/navigator-visual-suite-motion-v1.js');await safe('/navigator-visual-special-v2.js');
 reset('__BLIS_REFERENCE_V18');await safe('/navigator-reference.js');
 await safe('/navigator-color-system-v1.js');
 await safe('/navigator-no-page-numbers-v1.js');
 window.addEventListener('blis:intelligence',()=>setTimeout(()=>window.BLISCanonicalRenderActive?.(),50));
 document.documentElement.dataset.navigatorUi='signal-current-marker-1';
 window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client:initialClient,page:new URLSearchParams(location.search).get('page')||'overview',version:VERSION}}));
 setTimeout(()=>{window.BLISColorSystemV1?.decorate?.();window.BLISNoPageNumbersV1?.clean?.()},100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
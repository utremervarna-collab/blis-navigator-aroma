/* BLIS Navigator — production entrypoint v21.
   One renderer owner per page. Visual-first owners are native, not overlays. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V21)return;window.__BLIS_PRODUCTION_ENTRY_V21=true;
const VERSION='20260829-visual-first-owners-1';
function urlClient(){try{return new URLSearchParams(location.search).get('client')||''}catch(_){return''}}
const initialClient=urlClient()||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(document.body){document.body.dataset.client=initialClient;document.body.dataset.navigatorBuild=VERSION}
window.BLIS_INITIAL_CLIENT=initialClient;try{window.slug=initialClient}catch(_){}
function reset(n){try{window[n]=false}catch(_){}}
['__BLIS_REFERENCE_V15','__BLIS_REFERENCE_V16','__BLIS_OVERVIEW_SYSTEM_V6','__BLIS_SIGNALS_SYSTEM_V3','__BLIS_REPUTATION_V47','__BLIS_CLIENT_UI_V3','__BLIS_INTELLIGENCE_STREAM_V3','__BLIS_EXECUTIVE_DATA_V1','__BLIS_EXECUTIVE_UI_V3','__BLIS_EXECUTIVE_REPORTS_V1','__BLIS_COLOR_SYSTEM_V1'].forEach(reset);
function sync(){try{if(typeof D!=='undefined')window.D=D}catch(_){}try{if(typeof S!=='undefined')window.S=S}catch(_){}try{if(typeof Q!=='undefined')window.Q=Q}catch(_){}try{if(typeof A!=='undefined')window.A=A}catch(_){}try{if(typeof H!=='undefined')window.H=H}catch(_){}}
function loadStyle(src){return new Promise((resolve,reject)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=src+'?v='+VERSION;l.dataset.blisCanonicalStyle='1';l.onload=resolve;l.onerror=()=>reject(new Error('CSS: '+src));document.head.appendChild(l)})}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('JS: '+src));document.body.appendChild(s)})}
async function safeStyle(src){try{await loadStyle(src)}catch(e){console.error(e)}}async function safe(src){try{await loadScript(src)}catch(e){console.error(e)}}
async function boot(){
 for(const css of ['/navigator-reference.css','/navigator-shell-master.css','/navigator-client-ui.css','/navigator-digital-master.css','/navigator-perception-map.css','/navigator-executive-layout-fix-v2.css','/navigator-executive-pages-4-9.css'])await safeStyle(css);
 await safe('/navigator-system-structure-v1.js');
 await safe('/navigator-overview-system-v6.js');if(window.BLISOverviewSystemV6)window.BLISOverviewSystemV4=window.BLISOverviewSystemV6;
 await safe('/navigator-signals-system-v3.js');if(window.BLISSignalsSystemV3)window.BLISSignalsSystemV1=window.BLISSignalsSystemV3;
 await safe('/navigator-perception-core-v8.js');await safe('/navigator-perception-map.js');await safe('/navigator-market-system-v1.js');
 sync();await safe('/navigator-intelligence-stream-v2.js');await safe('/navigator-executive-data-v1.js');
 await safe('/navigator-reputation-master-v47.js');await safe('/navigator-digital-master.js');await safe('/navigator-client-ui.js');
 await safe('/navigator-executive-ui-v3.js');await safe('/navigator-executive-reports-v1.js');
 reset('__BLIS_REFERENCE_V16');await safe('/navigator-reference.js');
 await safe('/navigator-color-system-v1.js');
 sync();
 window.addEventListener('blis:intelligence',()=>setTimeout(()=>window.BLISCanonicalRenderActive?.(),50));
 window.addEventListener('blis:production-ready',()=>sync());
 document.documentElement.dataset.navigatorUi='visual-first-owners-1';
 window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client:initialClient,page:new URLSearchParams(location.search).get('page')||'overview',version:VERSION}}));
 setTimeout(()=>window.BLISColorSystemV1?.decorate?.(),100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
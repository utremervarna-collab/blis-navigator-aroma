/* BLIS Navigator — production entrypoint v11.
   Един каноничен Executive UI; JS и CSS зависимостите се зареждат заедно. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V11)return;
window.__BLIS_PRODUCTION_ENTRY_V11=true;

const VERSION='20260829-executive-pages-5';
function urlClient(){try{return new URLSearchParams(location.search).get('client')||''}catch(_){return''}}
const initialClient=urlClient()||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(document.body){document.body.dataset.client=initialClient;document.body.dataset.navigatorBuild=VERSION;}
window.BLIS_INITIAL_CLIENT=initialClient;
try{window.slug=initialClient}catch(_){}

function currentClient(){
  try{const c=window.BLISClientUIV3?.current?.();if(c)return c}catch(_){}
  return urlClient()||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||initialClient;
}
function reset(name){try{window[name]=false}catch(_){}}
[
  '__BLIS_REFERENCE_V15',
  '__BLIS_COMPETITION_V6',
  '__BLIS_REPUTATION_V46',
  '__BLIS_CLIENT_UI_V3',
  '__BLIS_INTELLIGENCE_STREAM_V3',
  '__BLIS_EXECUTIVE_DATA_V1',
  '__BLIS_EXECUTIVE_UI_V1'
].forEach(reset);
function syncGlobals(){
  try{if(typeof D!=='undefined')window.D=D}catch(_){}
  try{if(typeof S!=='undefined')window.S=S}catch(_){}
  try{if(typeof Q!=='undefined')window.Q=Q}catch(_){}
  try{if(typeof A!=='undefined')window.A=A}catch(_){}
  try{if(typeof H!=='undefined')window.H=H}catch(_){}
}
function loadStyle(src){return new Promise((resolve,reject)=>{
  const l=document.createElement('link');
  l.rel='stylesheet';l.href=src+'?v='+VERSION;l.dataset.blisCanonicalStyle='1';
  l.onload=resolve;l.onerror=()=>reject(new Error('Неуспешно зареждане на стил: '+src));
  document.head.appendChild(l);
})}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Неуспешно зареждане: '+src));document.body.appendChild(s)})}
async function safeStyle(src){try{await loadStyle(src)}catch(e){console.error(e)}}
async function safe(src){try{await loadScript(src)}catch(e){console.error(e)}}
function activePage(){return new URLSearchParams(location.search).get('page')||document.querySelector('.page.active')?.id||'overview'}
function forceMarketMap(){
  if(activePage()!=='market'&&!document.getElementById('market')?.classList.contains('active'))return;
  syncGlobals();
  try{window.BLISPerceptionMap?.render?.()}catch(e){console.error('BLIS perception render:',e)}
  try{window.BLISMarketSystemV1?.decorate?.()}catch(e){console.error('BLIS market decorate:',e)}
  try{window.BLISExecutiveUIV1?.decorate?.('market')}catch(_){}
}

async function boot(){
  /* Canonical CSS manifest. The production UI no longer relies on stale links in dashboard.html. */
  for(const css of [
    '/navigator-reference.css',
    '/navigator-shell-master.css',
    '/navigator-client-ui.css',
    '/navigator-digital-master.css',
    '/navigator-perception-map.css',
    '/navigator-executive-layout-fix-v2.css'
  ]) await safeStyle(css);

  await safe('/navigator-system-structure-v1.js');
  await safe('/navigator-overview-system-v5.js');
  await safe('/navigator-signals-system-v2.js');
  if(window.BLISOverviewSystemV5)window.BLISOverviewSystemV4=window.BLISOverviewSystemV5;
  if(window.BLISSignalsSystemV2)window.BLISSignalsSystemV1=window.BLISSignalsSystemV2;

  /* The perception map is a permanent canonical component. */
  await safe('/navigator-perception-core-v8.js');
  await safe('/navigator-perception-map.js');
  await safe('/navigator-market-system-v1.js');

  /* Evidence stream used by Reputation, Competition, Risk/Opportunity and History. */
  syncGlobals();
  await safe('/navigator-intelligence-stream-v2.js');
  await safe('/navigator-executive-data-v1.js');

  /* Canonical analytical renderers. */
  await safe('/navigator-system-dynamics-v1.js');
  await safe('/navigator-competition-master-v5.js');
  await safe('/navigator-reputation-master.js');
  await safe('/navigator-digital-master.js');
  await safe('/navigator-client-ui.js');

  /* One client-facing composition layer. */
  await safe('/navigator-executive-ui-v1.js');

  reset('__BLIS_REFERENCE_V15');
  await safe('/navigator-reference.js');

  const firstPage=activePage();
  function renderCanonical(target=activePage()){
    syncGlobals();
    const client=currentClient();
    try{window.BLISClientUIV3?.paint?.(client)}catch(_){}
    try{window.refGo?.(target)}catch(e){console.error('BLIS canonical route:',e)}
    if(target==='market')setTimeout(forceMarketMap,30);
    [60,180,420].forEach(ms=>setTimeout(()=>{try{window.BLISExecutiveUIV1?.decorate?.(target)}catch(_){}},ms));
    document.documentElement.dataset.navigatorUi='executive-pages-5';
    document.documentElement.dataset.navigatorClient=client;
  }

  [0,180,420,850,1500,2600].forEach(ms=>setTimeout(()=>renderCanonical(firstPage),ms));
  window.addEventListener('blis:routechange',e=>{
    const target=e.detail?.page||activePage();
    if(target==='market')[40,180,520].forEach(ms=>setTimeout(forceMarketMap,ms));
    [60,220,520].forEach(ms=>setTimeout(()=>window.BLISExecutiveUIV1?.decorate?.(target),ms));
  });
  window.addEventListener('blis:intelligence',()=>setTimeout(()=>renderCanonical(activePage()),40));
  window.addEventListener('blis:executive-data',()=>setTimeout(()=>renderCanonical(activePage()),60));
  window.addEventListener('blis:clientdata',()=>setTimeout(()=>renderCanonical(activePage()),50));
  window.addEventListener('blis:periodchange',()=>setTimeout(()=>renderCanonical(activePage()),50));
  window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client:currentClient(),page:firstPage,version:VERSION}}));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
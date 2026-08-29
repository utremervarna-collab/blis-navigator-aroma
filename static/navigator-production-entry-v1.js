/* BLIS Navigator — production entrypoint v7.
   Един каноничен Executive UI; един ключов визуален елемент на страница. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V7)return;
window.__BLIS_PRODUCTION_ENTRY_V7=true;

const VERSION='20260829-executive-ui-1';
const q=new URLSearchParams(location.search);
const client=q.get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(document.body){document.body.dataset.client=client;document.body.dataset.navigatorBuild=VERSION;}
window.BLIS_INITIAL_CLIENT=client;
try{window.slug=client}catch(_){}

function reset(name){try{window[name]=false}catch(_){}}
['__BLIS_REFERENCE_V15','__BLIS_COMPETITION_V6','__BLIS_REPUTATION_V46','__BLIS_CLIENT_UI_V3'].forEach(reset);
function syncGlobals(){
  try{if(typeof D!=='undefined')window.D=D}catch(_){}
  try{if(typeof S!=='undefined')window.S=S}catch(_){}
  try{if(typeof Q!=='undefined')window.Q=Q}catch(_){}
  try{if(typeof A!=='undefined')window.A=A}catch(_){}
  try{if(typeof H!=='undefined')window.H=H}catch(_){}
}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Неуспешно зареждане: '+src));document.body.appendChild(s)})}
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
  await safe('/navigator-system-structure-v1.js');
  await safe('/navigator-overview-system-v5.js');
  await safe('/navigator-signals-system-v2.js');
  if(window.BLISOverviewSystemV5)window.BLISOverviewSystemV4=window.BLISOverviewSystemV5;
  if(window.BLISSignalsSystemV2)window.BLISSignalsSystemV1=window.BLISSignalsSystemV2;

  /* The perception map is a permanent canonical component. */
  await safe('/navigator-perception-core-v8.js');
  await safe('/navigator-perception-map.js');
  await safe('/navigator-market-system-v1.js');

  /* Canonical analytical renderers. */
  await safe('/navigator-system-dynamics-v1.js');
  await safe('/navigator-competition-master-v5.js');
  await safe('/navigator-reputation-master.js');
  await safe('/navigator-digital-master.js');
  await safe('/navigator-client-ui.js');

  /* One client-facing composition layer. No stacked clarity/polish overlays. */
  await safe('/navigator-executive-ui-v1.js');

  reset('__BLIS_REFERENCE_V15');
  await safe('/navigator-reference.js');

  const firstPage=activePage();
  function renderCanonical(target=activePage()){
    syncGlobals();
    try{window.BLISClientUIV3?.paint?.(client)}catch(_){}
    try{window.refGo?.(target)}catch(e){console.error('BLIS canonical route:',e)}
    if(target==='market')setTimeout(forceMarketMap,30);
    [60,180,420].forEach(ms=>setTimeout(()=>{try{window.BLISExecutiveUIV1?.decorate?.(target)}catch(_){}},ms));
    document.documentElement.dataset.navigatorUi='executive-v1';
  }

  [0,180,420,850,1500,2600].forEach(ms=>setTimeout(()=>renderCanonical(firstPage),ms));
  window.addEventListener('blis:routechange',e=>{
    const target=e.detail?.page||activePage();
    if(target==='market')[40,180,520].forEach(ms=>setTimeout(forceMarketMap,ms));
    [60,220,520].forEach(ms=>setTimeout(()=>window.BLISExecutiveUIV1?.decorate?.(target),ms));
  });
  window.addEventListener('blis:clientdata',()=>setTimeout(()=>renderCanonical(activePage()),50));
  window.addEventListener('blis:periodchange',()=>setTimeout(()=>renderCanonical(activePage()),50));
  window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client,page:firstPage,version:VERSION}}));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
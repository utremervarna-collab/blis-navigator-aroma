/* BLIS Navigator — production entrypoint v5.
   Един каноничен UI след legacy data bootstrap. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V5)return;
window.__BLIS_PRODUCTION_ENTRY_V5=true;

const VERSION='20260829-canonical-ui-1';
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

async function boot(){
  await safe('/navigator-system-structure-v1.js');
  await safe('/navigator-overview-system-v5.js');
  await safe('/navigator-signals-system-v2.js');
  if(window.BLISOverviewSystemV5)window.BLISOverviewSystemV4=window.BLISOverviewSystemV5;
  if(window.BLISSignalsSystemV2)window.BLISSignalsSystemV1=window.BLISSignalsSystemV2;
  await safe('/navigator-market-system-v1.js');
  await safe('/navigator-system-dynamics-v1.js');
  await safe('/navigator-competition-master-v5.js');
  await safe('/navigator-reputation-master.js');
  await safe('/navigator-digital-master.js');
  await safe('/navigator-clarity-flow-v1.js');
  await safe('/navigator-clarity-polish-v1.js');
  await safe('/navigator-unified-visual-system-v1.js');
  await safe('/navigator-client-ui.js');

  /* navigator-reference.js may already have been executed by the legacy HTML.
     Force the current canonical router to own refGo. */
  reset('__BLIS_REFERENCE_V15');
  await safe('/navigator-reference.js');

  const page=q.get('page')||document.querySelector('.page.active')?.id||'overview';
  function renderCanonical(){
    syncGlobals();
    try{window.BLISClientUIV3?.paint?.(client)}catch(_){}
    try{window.refGo?.(page)}catch(e){console.error('BLIS canonical route:',e)}
    try{window.BLISClarityFlowV1?.decorate?.(page)}catch(_){}
    try{window.BLISClarityPolishV1?.decorate?.(page)}catch(_){}
    try{window.BLISUnifiedVisualSystemV1?.decorate?.(page)}catch(_){}
    document.documentElement.dataset.navigatorUi='canonical-v5';
  }

  /* app.js loads data asynchronously and its legacy renderAll() can paint after us.
     Re-assert the canonical renderer after the data bootstrap has settled. */
  [0,180,420,850,1500,2600].forEach(ms=>setTimeout(renderCanonical,ms));
  window.addEventListener('blis:clientdata',()=>setTimeout(renderCanonical,40));
  window.addEventListener('blis:periodchange',()=>setTimeout(renderCanonical,40));
  window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client,page,version:VERSION}}));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
/* BLIS Navigator — production entrypoint v4.
   Единен аналитичен процес и единен визуален език. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V4)return;
window.__BLIS_PRODUCTION_ENTRY_V4=true;

const VERSION='20260829-unified-visual-1';
const q=new URLSearchParams(location.search);
const client=q.get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(document.body)document.body.dataset.client=client;
window.BLIS_INITIAL_CLIENT=client;
try{window.slug=client}catch(_){}

function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>resolve();s.onerror=()=>reject(new Error('Неуспешно зареждане: '+src));document.body.appendChild(s)})}
async function safe(src){try{await load(src+'?v='+VERSION)}catch(e){console.error(e)}}

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
  await safe('/navigator-reference.js');

  const page=(q.get('page')||document.querySelector('.page.active')?.id||'overview');
  requestAnimationFrame(()=>{
    try{window.BLISClientUIV3?.paint?.(client)}catch(_){}
    try{window.refGo?.(page)}catch(e){console.error('BLIS production route:',e)}
    setTimeout(()=>{try{window.BLISClarityFlowV1?.decorate?.(page);window.BLISClarityPolishV1?.decorate?.(page);window.BLISUnifiedVisualSystemV1?.decorate?.(page)}catch(_){}},220);
    window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client,page,version:VERSION}}));
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
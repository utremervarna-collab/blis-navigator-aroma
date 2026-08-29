/* BLIS Navigator — production entrypoint v1.
   Зарежда се последен от gateway-а и гарантира, че legacy client-specific
   скриптове не могат да останат собственик на навигацията или модулите. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_ENTRY_V1)return;
window.__BLIS_PRODUCTION_ENTRY_V1=true;

const VERSION='20260829-production-entry-1';
const q=new URLSearchParams(location.search);
const client=q.get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(document.body)document.body.dataset.client=client;
window.BLIS_INITIAL_CLIENT=client;
try{window.slug=client}catch(_){}

function reset(name){try{window[name]=false}catch(_){}}
function load(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error('Неуспешно зареждане: '+src));
    document.body.appendChild(s);
  });
}

async function boot(){
  /* Старият Varna Towers wrapper не трябва да остава последният refGo. */
  reset('__BLIS_REFERENCE_V12');
  reset('__BLIS_OVERVIEW_V3');
  reset('__BLIS_COMPETITION_V6');
  reset('__BLISReputationMasterLoaded');
  reset('__BLIS_CLIENT_UI_V3');

  try{await load('/navigator-overview-master.js?v='+VERSION)}catch(e){console.error(e)}
  try{await load('/navigator-competition-master-v5.js?v='+VERSION)}catch(e){console.error(e)}
  try{await load('/navigator-reputation-exact-art-v41.js?v='+VERSION)}catch(e){console.error(e)}
  try{await load('/navigator-digital-master.js?v='+VERSION)}catch(e){console.error(e)}
  try{await load('/navigator-client-ui.js?v='+VERSION)}catch(e){console.error(e)}
  try{await load('/navigator-reference.js?v='+VERSION)}catch(e){console.error(e)}

  const page=(q.get('page')||document.querySelector('.page.active')?.id||'overview');
  requestAnimationFrame(()=>{
    try{window.BLISClientUIV3?.paint?.(client)}catch(_){}
    try{window.refGo?.(page)}catch(e){console.error('BLIS production route:',e)}
    window.dispatchEvent(new CustomEvent('blis:production-ready',{detail:{client,page,version:VERSION}}));
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();

/* BLIS Navigator — frozen runtime v1.
   DATA + CLIENT SYNC ONLY.
   It intentionally does not render pages, rebuild navigation, load page owners,
   poll the DOM, or patch approved module visuals. */
(function(){
'use strict';
if(window.__BLIS_FROZEN_RUNTIME_V1)return;window.__BLIS_FROZEN_RUNTIME_V1=true;
const CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox']);
function initialClient(){
  try{const q=new URLSearchParams(location.search).get('client');if(CLIENTS.has(q))return q}catch(_){}
  try{if(CLIENTS.has(window.BLIS_INITIAL_CLIENT))return window.BLIS_INITIAL_CLIENT}catch(_){}
  try{if(CLIENTS.has(document.body?.dataset?.client))return document.body.dataset.client}catch(_){}
  return'aroma';
}
function syncGlobals(){
  try{window.D=D}catch(_){}try{window.S=S}catch(_){}try{window.Q=Q}catch(_){}try{window.A=A}catch(_){}try{window.H=H}catch(_){}try{window.BLIS_CURRENT_SLUG=slug}catch(_){}
}
function syncChrome(){
  syncGlobals();
  try{
    const c=typeof slug!=='undefined'?slug:initialClient();
    document.body.dataset.client=c;
    window.BLIS_INITIAL_CLIENT=c;
    const sel=document.getElementById('clientSel');if(sel&&sel.value!==c)sel.value=c;
    const sync=document.getElementById('lastSync');if(sync)sync.textContent=window.D?.data_updated?new Date(window.D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
  }catch(e){console.warn('BLIS frozen runtime sync:',e?.message||e)}
}
const legacyLoad=window.load;
if(typeof legacyLoad==='function'&&!legacyLoad.__blisFrozenRuntime){
  const wrapped=async function(){
    const wanted=initialClient();
    try{if(!CLIENTS.has(slug))slug=wanted}catch(_){}
    const sel=document.getElementById('clientSel');if(sel&&!CLIENTS.has(sel.value))sel.value=wanted;
    return legacyLoad.apply(this,arguments);
  };
  wrapped.__blisFrozenRuntime=true;window.load=wrapped;
}
// app.js calls renderAll after each client/data load. From this point onward that
// hook only publishes fresh data; page rendering belongs exclusively to the router.
window.renderAll=function(){
  syncChrome();
  let c=initialClient();try{if(CLIENTS.has(slug))c=slug}catch(_){}
  window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:c,slug:c}}));
};
function releasePrepaint(){requestAnimationFrame(()=>requestAnimationFrame(()=>{document.getElementById('blisPrepaintGuard')?.remove();const a=document.querySelector('.page.active');if(a){a.style.setProperty('visibility','visible','important');a.style.setProperty('opacity','1','important')}}))}
function boot(){syncChrome();releasePrepaint();window.addEventListener('blis:clientdata',syncChrome)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BLISFrozenRuntimeV1={syncGlobals,syncChrome};
})();

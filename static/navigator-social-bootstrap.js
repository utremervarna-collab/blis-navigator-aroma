/* BLIS Navigator — Social Signals reload/boot guard.
   Keeps the approved Social Signals UI intact; only guarantees the renderer runs after reload, page restore and async client data load. */
(function(){
  'use strict';
  if(window.__BLISSocialBootstrapV1)return;
  window.__BLISSocialBootstrapV1=true;

  const active=()=>document.getElementById('social')?.classList.contains('active');
  const ready=()=>typeof window.BLISSocialSignalsRender==='function';
  let lastFingerprint='';
  let rendering=false;

  function fingerprint(){
    try{
      const d=(typeof D!=='undefined'&&D)||{},s=(typeof S!=='undefined'&&S)||[],a=(typeof A!=='undefined'&&A)||[],h=(typeof H!=='undefined'&&H)||[];
      return [document.body?.dataset?.client||'',Array.isArray(s)?s.length:0,Array.isArray(a)?a.length:0,Array.isArray(h)?h.length:0,Array.isArray(d?.metrics)?d.metrics.length:0,Array.isArray(d?.indices)?d.indices.length:0].join('|');
    }catch(e){return''}
  }

  function bodyComplete(){
    const root=document.getElementById('socialBody');
    return !!(root&&root.querySelector('.sm-kpis')&&root.querySelector('.sm-channel-grid')&&root.querySelector('.sm-network-feeds'));
  }

  function renderNow(force=false){
    if(!active()||!ready()||rendering)return;
    const fp=fingerprint();
    if(!force&&bodyComplete()&&fp===lastFingerprint)return;
    rendering=true;
    Promise.resolve(window.BLISSocialSignalsRender()).catch(()=>{}).finally(()=>{
      rendering=false;
      lastFingerprint=fingerprint();
      setTimeout(()=>window.BLISSocialInteractivePatch?.(),40);
    });
  }

  function renderBurst(){
    [0,80,240,650,1200,2200,3800].forEach((ms,i)=>setTimeout(()=>renderNow(i===0),ms));
  }

  function wrapNavigation(name){
    const old=window[name];
    if(typeof old!=='function'||old.__socialBootstrapV1)return false;
    const wrapped=function(id){
      const r=old.apply(this,arguments);
      if(id==='social')renderBurst();
      return r;
    };
    wrapped.__socialBootstrapV1=true;
    wrapped.__previous=old;
    window[name]=wrapped;
    return true;
  }

  function wrapAll(){wrapNavigation('refGo');wrapNavigation('go')}

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#nav button[data-page="social"]'))renderBurst();
  },true);

  document.getElementById('clientSel')?.addEventListener('change',()=>{
    lastFingerprint='';
    if(active())renderBurst();
  });

  window.addEventListener('popstate',()=>setTimeout(()=>{if(active())renderBurst()},30));
  window.addEventListener('pageshow',()=>setTimeout(()=>{if(active())renderBurst()},30));

  function init(){
    wrapAll();
    if(active())renderBurst();

    /* Other Navigator startup modules replace refGo during the first seconds.
       Re-wrap them and re-render only when Social is the active page and the
       underlying data fingerprint has actually changed. */
    let ticks=0;
    const timer=setInterval(()=>{
      ticks++;
      wrapAll();
      if(active()){
        const fp=fingerprint();
        if(!bodyComplete()||fp!==lastFingerprint)renderNow();
      }
      if(ticks>=32)clearInterval(timer);
    },180);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

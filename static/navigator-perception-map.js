(() => {
  'use strict';

  let scheduled=0;
  const marketActive=()=>!!document.querySelector('#market.page.active');

  function refreshStable(delay=80){
    clearTimeout(scheduled);
    scheduled=setTimeout(()=>{
      if(!marketActive())return;
      window.BLISPerceptionStable?.refresh?.();
      window.BLISPerceptionGlobe?.apply?.();
    },delay);
  }

  function mount(){
    if(!marketActive()||!window.BLISPerceptionMap)return;
    window.BLISPerceptionMap.mount?.();
    refreshStable(90);
  }

  function wrapRoute(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__pmGlobeBridge)return;
    const wrapped=function(id){
      const result=fn.apply(this,arguments);
      if(id==='market')setTimeout(mount,0);
      return result;
    };
    wrapped.__pmGlobeBridge=true;
    window[name]=wrapped;
  }

  function install(){
    wrapRoute('refGo');
    wrapRoute('go');
    if(marketActive())mount();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="market"]'))setTimeout(mount,0);
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.id==='clientSel'&&marketActive())setTimeout(mount,140);
    if(e.target.matches?.('#market [data-pm-period]'))refreshStable(150);
  },true);
  window.addEventListener('blis:clientdata',()=>{if(marketActive())setTimeout(mount,130)});
  window.addEventListener('blis:periodchange',()=>refreshStable(120));

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>{if(marketActive())setTimeout(mount,80)},{once:true});
  window.BLISPerceptionBridge={mount,refresh:refreshStable};
})();

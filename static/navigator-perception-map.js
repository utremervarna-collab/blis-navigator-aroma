(() => {
  'use strict';

  const CORE_URL = '/navigator-perception-core.js?v=20260819-core4';
  let coreReady = false;

  function labelMarket(){
    const b=document.querySelector('#nav [data-page="market"]');
    if(!b)return;
    const label=b.querySelector('.navtxt')||b.querySelector('span:last-child');
    if(label)label.textContent='Карта на възприятията';
  }

  function mountMarket(){
    labelMarket();
    if(document.getElementById('market')?.classList.contains('active')){
      window.BLISPerceptionMap?.mount?.();
    }
  }

  function wrapRoute(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__pmBridge)return;
    const wrapped=function(id){
      const result=fn.apply(this,arguments);
      if(id==='market')requestAnimationFrame(mountMarket);
      else setTimeout(labelMarket,0);
      return result;
    };
    wrapped.__pmBridge=true;
    wrapped.__pmBase=fn;
    window[name]=wrapped;
  }

  function ensureBridge(){
    wrapRoute('refGo');
    wrapRoute('go');
    labelMarket();
    mountMarket();
  }

  document.addEventListener('click',e=>{
    if(!e.target.closest?.('#nav [data-page="market"]'))return;
    setTimeout(mountMarket,0);
  });

  import(CORE_URL).then(()=>{
    coreReady=true;
    [0,250,700,1200,2200,3500].forEach(ms=>setTimeout(ensureBridge,ms));
  }).catch(err=>console.error('BLIS Perception Map core failed',err));

  window.BLISPerceptionBridge={
    mount:()=>{if(coreReady)mountMarket();},
    refresh:ensureBridge
  };
})();
(() => {
  'use strict';
  const CORE_URL='/navigator-perception-core-v5.js?v=20260819-v5';
  let ready=false;

  function labelMarket(){
    const b=document.querySelector('#nav [data-page="market"]');
    if(!b)return;
    const label=b.querySelector('.navtxt')||b.querySelector('span:last-child');
    if(label&&label.textContent!=='Карта на възприятията')label.textContent='Карта на възприятията';
  }
  function mountMarket(){
    labelMarket();
    if(!ready)return;
    if(document.getElementById('market')?.classList.contains('active'))window.BLISPerceptionMap?.mount?.();
  }
  function wrapRoute(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__pmBridgeV5)return;
    const wrapped=function(id){
      const result=fn.apply(this,arguments);
      if(id==='market')requestAnimationFrame(mountMarket);
      else setTimeout(labelMarket,0);
      return result;
    };
    wrapped.__pmBridgeV5=true;
    wrapped.__pmBase=fn;
    window[name]=wrapped;
  }
  function ensure(){
    wrapRoute('refGo');
    wrapRoute('go');
    labelMarket();
    mountMarket();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="market"]'))setTimeout(mountMarket,0);
    if(e.target.closest?.('.client-option')&&document.getElementById('market')?.classList.contains('active'))setTimeout(mountMarket,120);
  });
  document.addEventListener('change',e=>{
    if(e.target?.id==='clientSel'&&document.getElementById('market')?.classList.contains('active'))setTimeout(mountMarket,80);
  });

  import(CORE_URL).then(()=>{
    ready=true;
    [0,180,500,900,1500,2600].forEach(ms=>setTimeout(ensure,ms));
  }).catch(err=>console.error('BLIS Perception Map v5 core failed',err));

  window.BLISPerceptionBridge={mount:mountMarket,refresh:ensure};
})();
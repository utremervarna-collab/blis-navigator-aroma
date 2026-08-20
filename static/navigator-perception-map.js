(() => {
  'use strict';

  function labelMarket(){
    const b=document.querySelector('#nav [data-page="market"]');
    if(!b)return;
    const label=b.querySelector('.navtxt')||b.querySelector('span:last-child');
    if(label&&label.textContent!=='Карта на възприятията')label.textContent='Карта на възприятията';
  }

  function mountMarket(){
    labelMarket();
    if(!window.BLISPerceptionMap)return;
    if(document.getElementById('market')?.classList.contains('active')){
      window.BLISPerceptionMap.mount?.();
      window.BLISPerceptionGlobe?.apply?.();
    }
  }

  function wrapRoute(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__pmBridgeV8)return;
    const wrapped=function(id){
      const result=fn.apply(this,arguments);
      if(id==='market')requestAnimationFrame(mountMarket);
      else setTimeout(labelMarket,0);
      return result;
    };
    wrapped.__pmBridgeV8=true;
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

  if(window.BLISPerceptionMap){
    window.dispatchEvent(new CustomEvent('blis:perception-core-ready'));
  } else {
    console.error('BLIS Perception core is not loaded before the route bridge');
  }

  [0,180,500,900,1500,2600].forEach(ms=>setTimeout(ensure,ms));
  window.BLISPerceptionBridge={mount:mountMarket,refresh:ensure};
})();
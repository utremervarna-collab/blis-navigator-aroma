/* BLIS Navigator — pre-app client bootstrap + isolated client runtimes. */
(function(){
  'use strict';

  const q=(()=>{try{return new URLSearchParams(location.search).get('client')||''}catch(e){return''}})();

  function parserScript(src){
    if(typeof document==='undefined')return;
    if(document.readyState==='loading'){
      document.write('<script src="'+src.replace(/"/g,'&quot;')+'"><\/script>');
      return;
    }
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    document.head.appendChild(s);
  }

  /* Wirello is a first-class Navigator demo client. Load it as normal scripts,
     not through eval, so CSP/browser security cannot drop the synthetic data layer. */
  parserScript('/wirello-client-list-runtime.js?v=20260820-datafix1');

  if(q==='wirello'){
    window.BLIS_INITIAL_CLIENT='wirello';
    if(document.body)document.body.dataset.client='wirello';
    parserScript('/wirello-navigator-runtime.js?v=20260820-datafix1');
    parserScript('/wirello-header-runtime.js?v=20260820-datafix1');

    /* Wirello must stay isolated from Varna Towers bootstrap/ticker overrides. */
    return;
  }

  /* Preserve the isolated Varna Towers data runtime for non-Wirello clients. */
  try{
    const xhr=new XMLHttpRequest();
    xhr.open('GET','/varna-towers-data-v18.js?v=20260819-1329',false);
    xhr.send(null);
    if(xhr.status>=200&&xhr.status<300){
      let src=xhr.responseText||'';
      const marker='  /* Home BLIS LIVE visual + real delta override. */';
      const cut=src.indexOf(marker);
      if(cut>=0)src=src.slice(0,cut)+'})();\n';
      (0,eval)(src);
    }
  }catch(e){console.warn('Varna Towers bootstrap:',e)}

  if(typeof document==='undefined')return;

  const s=document.createElement('script');
  s.src='/home-live-last-change-v20.js?v=20260819-1347';
  s.async=true;
  document.head.appendChild(s);
})();
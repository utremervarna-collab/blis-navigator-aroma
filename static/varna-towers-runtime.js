/* BLIS Navigator — Varna Towers bootstrap + BLIS LIVE v20 loader. */
(function(){
  'use strict';

  /* Preserve the isolated Varna Towers data runtime, but do not execute its obsolete ticker override. */
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

  /* One canonical delta resolver: last actual measured movement, skipping duplicate snapshots. */
  const s=document.createElement('script');
  s.src='/home-live-last-change-v20.js?v=20260819-1347';
  s.async=true;
  document.head.appendChild(s);
})();

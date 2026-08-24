/* BLIS Navigator — Varna Towers bootstrap + BLIS LIVE v22 loader. */
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

  /* Public Navigator home: Services & Payment is a public sales entry and must never resolve to a client profile. */
  const isHome=location.pathname==='/'||location.pathname==='/index.html';
  if(isHome){
    const style=document.createElement('style');
    style.id='blis-home-commerce-cta-v2';
    style.textContent=`
      .btn.services-cta{position:relative;overflow:hidden;min-height:54px;padding:0 25px;border:1px solid rgba(11,39,66,.14)!important;border-radius:13px!important;background:radial-gradient(circle at 82% 20%,rgba(57,218,181,.25),transparent 28%),linear-gradient(135deg,#0b2239,#123b60)!important;color:#fff!important;box-shadow:0 14px 32px rgba(10,37,62,.20),inset 0 1px 0 rgba(255,255,255,.12)!important;font-size:13px!important;font-weight:850!important;letter-spacing:.01em;transition:.22s ease!important}
      .btn.services-cta:before{content:"";position:absolute;left:-28%;top:-160%;width:42%;height:420%;transform:rotate(22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.20),transparent);transition:.45s ease}
      .btn.services-cta:after{content:"€";display:grid;place-items:center;width:25px;height:25px;border-radius:50%;margin-left:10px;background:rgba(255,255,255,.10);box-shadow:inset 0 0 0 1px rgba(255,255,255,.13);font-size:12px}
      .btn.services-cta:hover{transform:translateY(-2px)!important;box-shadow:0 18px 40px rgba(10,37,62,.27),0 0 28px rgba(57,218,181,.10)!important}
      .btn.services-cta:hover:before{left:112%}
      .heroBtns .services-cta{min-height:60px;padding:0 29px;font-size:14px!important}
      .actions .services-cta{min-width:190px}
      @media(max-width:720px){.actions .services-cta{display:none}.heroBtns .services-cta{display:inline-flex;width:100%;max-width:310px}.heroBtns{align-items:flex-start}.heroBtns .services-cta:after{margin-left:auto}}
    `;
    document.head.appendChild(style);
    const href='/services.html';
    document.querySelectorAll('a[href="/demo.html"],a.btn.demo,a.services-cta').forEach(a=>{
      a.href=href;
      a.classList.remove('demo');
      a.classList.add('services-cta');
      a.textContent='Услуги и плащане';
    });
  }
})();

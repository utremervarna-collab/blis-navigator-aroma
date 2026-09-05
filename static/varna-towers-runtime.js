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

  /* Public Navigator home: Order Analysis opens the existing services and payment content. */
  const isHome=location.pathname==='/'||location.pathname==='/index.html';
  if(isHome){
    const style=document.createElement('style');
    style.id='blis-home-commerce-cta-v4';
    style.textContent=`
      .btn.services-cta{position:relative;overflow:hidden;min-height:56px;padding:0 27px;border:1px solid rgba(255,255,255,.18)!important;border-radius:14px!important;background:radial-gradient(circle at 82% 18%,rgba(255,118,118,.38),transparent 27%),linear-gradient(135deg,#7a0d18 0%,#b9152d 44%,#e32636 72%,#8b0d1e 100%)!important;color:#fff!important;box-shadow:0 16px 34px rgba(150,11,29,.30),0 0 0 1px rgba(143,8,26,.12),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -10px 24px rgba(87,0,13,.18)!important;font-size:13px!important;font-weight:900!important;letter-spacing:.012em;text-shadow:0 1px 0 rgba(84,0,10,.28);transition:.22s ease!important;isolation:isolate}
      .btn.services-cta:before{content:"";position:absolute;z-index:-1;left:-34%;top:-165%;width:44%;height:430%;transform:rotate(22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.34),transparent);transition:.52s cubic-bezier(.2,.75,.2,1)}
      .btn.services-cta:after{content:"↗";display:grid;place-items:center;width:27px;height:27px;border-radius:50%;margin-left:11px;background:linear-gradient(145deg,rgba(255,255,255,.26),rgba(255,255,255,.10));box-shadow:inset 0 0 0 1px rgba(255,255,255,.22),0 4px 12px rgba(68,0,8,.20);font-size:12px;font-weight:900}
      .btn.services-cta:hover{transform:translateY(-3px) scale(1.015)!important;background:radial-gradient(circle at 82% 18%,rgba(255,148,148,.48),transparent 28%),linear-gradient(135deg,#8b0e1c 0%,#ca1731 45%,#f02b40 74%,#981023 100%)!important;box-shadow:0 22px 46px rgba(157,10,30,.38),0 0 30px rgba(234,40,58,.24),inset 0 1px 0 rgba(255,255,255,.28)!important}
      .btn.services-cta:hover:before{left:116%}
      .btn.services-cta:active{transform:translateY(-1px) scale(.995)!important}
      .heroBtns .services-cta{min-height:64px;padding:0 31px;font-size:15px!important;box-shadow:0 20px 46px rgba(157,10,30,.36),0 0 34px rgba(234,40,58,.18),inset 0 1px 0 rgba(255,255,255,.24)!important}
      .actions .services-cta{min-width:200px}
      @media(max-width:720px){.actions .services-cta{display:none}.heroBtns .services-cta{display:inline-flex;width:100%;max-width:330px;min-height:62px}.heroBtns{align-items:flex-start}.heroBtns .services-cta:after{margin-left:auto}}
    `;
    document.head.appendChild(style);
    const href='/services.html';
    document.querySelectorAll('a[href="/demo.html"],a.btn.demo,a.services-cta').forEach(a=>{
      a.href=href;
      a.classList.remove('demo');
      a.classList.add('services-cta');
      a.textContent='Поръчай Анализ';
    });
  }
})();

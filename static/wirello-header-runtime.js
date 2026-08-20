/* BLIS Navigator — Wirello Market final photographic header. */
(function(){
  'use strict';
  const q=new URLSearchParams(location.search).get('client');
  const scoped=window.BLIS_CLIENT_SCOPE||window.BLIS_INITIAL_CLIENT;
  if(q!=='wirello'&&scoped!=='wirello')return;

  let heroData='';
  function apply(){
    if(!heroData)return;
    const hero=document.querySelector('.topbar');
    if(!hero)return;
    hero.style.backgroundImage=`url("${heroData}")`;
    hero.style.backgroundRepeat='no-repeat';
    hero.style.backgroundSize='cover';
    hero.style.backgroundPosition='center center';
    hero.style.backgroundColor='#dce9e4';
    hero.dataset.wirelloFinalHero='1';
  }

  fetch('/wirello-header.b64?v=20260820-final2',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('header '+r.status);return r.text()})
    .then(raw=>{
      const b64=(raw||'').trim();
      if(!b64)return;
      heroData='data:image/webp;base64,'+b64;
      apply();
      [80,250,700,1400,2600].forEach(ms=>setTimeout(apply,ms));
    })
    .catch(e=>console.warn('Wirello final header:',e));

  const observer=new MutationObserver(()=>apply());
  if(document.documentElement)observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style','class','data-client']});
  setTimeout(()=>observer.disconnect(),5000);
})();

/* Varna Towers — block inherited AROMA photographic hero until the dedicated VT hero is installed. */
(function(){
  'use strict';
  function apply(){
    if(document.body.dataset.client!=='varna-towers')return;
    const bg=document.querySelector('.client-photo-bg');
    if(bg){
      bg.style.backgroundImage='none';
      bg.style.opacity='0';
      bg.dataset.varnaTowersHero='pending';
    }
  }
  function init(){
    apply();
    new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-client'))requestAnimationFrame(apply)}).observe(document.body,{attributes:true,attributeFilter:['data-client']});
    setTimeout(apply,150);
    setTimeout(apply,700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

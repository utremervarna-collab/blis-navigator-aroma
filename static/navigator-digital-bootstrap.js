/* BLIS Navigator — robust Digital Visibility radar boot controller */
(function(){
  'use strict';
  if(window.__BLISDigitalRadarBoot)return;
  window.__BLISDigitalRadarBoot=true;

  function loadTruthGuard(){
    if(document.querySelector('script[data-blis-digital-truth]'))return;
    const s=document.createElement('script');s.src='/navigator-digital-truth-fix.js?v=20260819-truth1';s.dataset.blisDigitalTruth='1';document.head.appendChild(s);
  }
  function loadInteractions(){
    if(document.querySelector('script[data-blis-digital-interactions]'))return;
    const s=document.createElement('script');s.src='/navigator-digital-interactions.js?v=20260819-interactions2';s.dataset.blisDigitalInteractions='1';document.head.appendChild(s);
  }
  function renderSoon(delay=60){setTimeout(()=>{try{if(document.getElementById('digital')?.classList.contains('active')){window.BLISDigitalRadar?.render?.();setTimeout(()=>window.BLISDigitalInteractionsPatch?.(),40)}}catch(e){}},delay)}
  function wrapRefGo(){
    const old=window.refGo;if(typeof old!=='function'||old.__digitalRadarBoot)return false;
    const wrapped=function(id){const r=old.apply(this,arguments);if(id==='digital'){renderSoon(40);renderSoon(220)}return r};
    wrapped.__digitalRadarBoot=true;wrapped.__previous=old;window.refGo=wrapped;return true;
  }
  document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="digital"]')){renderSoon(40);renderSoon(220)}},true);
  document.getElementById('clientSel')?.addEventListener('change',()=>renderSoon(180));
  function init(){
    loadTruthGuard();loadInteractions();wrapRefGo();if(document.getElementById('digital')?.classList.contains('active'))renderSoon(20);
    let n=0;const t=setInterval(()=>{n++;wrapRefGo();const page=document.getElementById('digital');if(page?.classList.contains('active')&&!document.getElementById('dvRadar'))renderSoon(20);if(page?.classList.contains('active'))window.BLISDigitalInteractionsPatch?.();if(n>30)clearInterval(t)},120);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

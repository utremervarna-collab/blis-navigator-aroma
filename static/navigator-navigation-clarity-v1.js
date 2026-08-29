/* BLIS Navigator — navigation clarity runtime v1.
   Keeps route changes immediate and active mobile navigation in view. */
(function(){
'use strict';
if(window.__BLIS_NAV_CLARITY_V1)return;window.__BLIS_NAV_CLARITY_V1=true;
function centerActive(){
  const nav=document.getElementById('nav'),active=nav?.querySelector('[data-page].active');
  if(!nav||!active)return;
  active.setAttribute('aria-current','page');
  nav.querySelectorAll('[data-page]:not(.active)').forEach(x=>x.removeAttribute('aria-current'));
  if(innerWidth<=800){
    const left=Math.max(0,active.offsetLeft-(nav.clientWidth-active.offsetWidth)/2);
    try{nav.scrollTo({left,behavior:'auto'})}catch(_){nav.scrollLeft=left}
  }
}
function cleanHistory(){
  const h=document.getElementById('historyBody');if(!h)return;
  const g=h.querySelector(':scope > .exec-glance');if(!g)return;
  const cards=[...g.children];
  if(cards[2])cards[2].style.display='none';
  g.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';
}
function polish(){centerActive();cleanHistory()}
function patch(){
  const original=window.refGo;
  if(typeof original!=='function'||original.__blisNavClarity)return false;
  function fastGo(id){
    const out=original(id);
    try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){window.scrollTo(0,0)}
    requestAnimationFrame(polish);
    setTimeout(polish,180);
    return out;
  }
  Object.assign(fastGo,original);
  fastGo.__blisNavClarity=true;
  window.refGo=fastGo;
  return true;
}
function boot(){
  if(!patch()){
    let n=0;const t=setInterval(()=>{n++;if(patch()||n>40)clearInterval(t)},50);
  }
  polish();
}
window.addEventListener('blis:routechange',()=>{requestAnimationFrame(polish);setTimeout(polish,220)});
window.addEventListener('blis:intelligence',()=>setTimeout(cleanHistory,120));
window.addEventListener('blis:clientdata',()=>setTimeout(cleanHistory,160));
window.addEventListener('resize',()=>requestAnimationFrame(centerActive));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

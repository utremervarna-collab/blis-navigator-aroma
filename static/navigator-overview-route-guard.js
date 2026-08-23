/* BLIS Navigator — keep the canonical client-aware Overview in control. */
(function(){
  'use strict';
  if(window.__BLISOverviewRouteGuard)return;
  window.__BLISOverviewRouteGuard=true;

  function activate(){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const page=document.getElementById('overview');
    if(page)page.classList.add('active');
    document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='overview'));
  }

  function canonicalOverview(){
    activate();
    try{
      if(window.BLISOverviewMaster&&typeof window.BLISOverviewMaster.render==='function'){
        window.BLISOverviewMaster.render();
        return true;
      }
      if(window.BLISOverviewMaster&&typeof window.BLISOverviewMaster.refresh==='function'){
        window.BLISOverviewMaster.refresh();
        return true;
      }
    }catch(_){ }
    return false;
  }

  function install(){
    const previous=window.refGo;
    if(typeof previous!=='function'||previous.__blisCanonicalOverviewGuard)return;
    const wrapped=function(id){
      if(id==='overview'){
        canonicalOverview();
        requestAnimationFrame(canonicalOverview);
        setTimeout(canonicalOverview,40);
        setTimeout(canonicalOverview,160);
        setTimeout(canonicalOverview,760);
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      return previous.apply(this,arguments);
    };
    wrapped.__blisCanonicalOverviewGuard=true;
    wrapped.__previous=previous;
    window.refGo=wrapped;
  }

  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.addEventListener('load',()=>{install();canonicalOverview()});
})();

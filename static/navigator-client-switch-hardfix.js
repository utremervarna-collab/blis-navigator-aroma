/* BLIS Navigator — authoritative client switch. Runs before legacy document handlers. */
(function(){
  'use strict';
  if(window.__BLISClientSwitchHardfix)return;
  window.__BLISClientSwitchHardfix=true;
  const allowed=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox']);

  async function switchInPlace(key){
    if(!allowed.has(key))return;
    try{localStorage.setItem('blis-client-ui',key)}catch(_){ }
    try{document.cookie=`blis_admin_client=${encodeURIComponent(key)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`}catch(_){ }
    window.BLIS_INITIAL_CLIENT=key;
    window.__BLIS_EXPECTED_CLIENT=key;

    const u=new URL(location.href);
    u.pathname='/dashboard.html';
    u.search='';
    u.searchParams.set('client',key);
    u.hash='';
    history.replaceState(null,'',u.pathname+u.search);

    const sel=document.getElementById('clientSel');
    if(sel)sel.value=key;
    if(document.body)document.body.dataset.client=key;

    try{if(typeof slug!=='undefined')slug=key}catch(_){ }

    try{
      if(typeof load==='function'){
        await Promise.resolve(load());
        try{window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:key}}))}catch(_){ }
        try{
          if(typeof window.refGo==='function')window.refGo('overview');
          else if(window.BLISOverviewMaster&&typeof window.BLISOverviewMaster.render==='function')window.BLISOverviewMaster.render();
        }catch(_){ }
        return;
      }
    }catch(err){
      console.error('BLIS client switch failed',err);
    }

    location.assign(u.toString());
  }

  window.BLISSwitchClientInPlace=switchInPlace;

  window.addEventListener('click',function(e){
    const target=e.target;
    if(!target||typeof target.closest!=='function')return;
    const option=target.closest('.client-option[data-client-key]');
    if(!option)return;
    const key=option.dataset.clientKey;
    if(!allowed.has(key))return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    switchInPlace(key);
  },true);
})();

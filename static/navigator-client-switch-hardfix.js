/* BLIS Navigator — authoritative client switch. Runs before legacy document handlers. */
(function(){
  'use strict';
  if(window.__BLISClientSwitchHardfix)return;
  window.__BLISClientSwitchHardfix=true;
  const allowed=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox']);
  window.addEventListener('click',function(e){
    const target=e.target;
    if(!target||typeof target.closest!=='function')return;
    const option=target.closest('.client-option[data-client-key]');
    if(!option)return;
    const key=option.dataset.clientKey;
    if(!allowed.has(key))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{localStorage.setItem('blis-client-ui',key)}catch(_){ }
    window.BLIS_INITIAL_CLIENT=key;
    const u=new URL(location.href);
    u.searchParams.set('client',key);
    u.searchParams.delete('page');
    u.hash='';
    location.assign(u.toString());
  },true);
})();

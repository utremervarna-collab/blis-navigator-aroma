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
    window.__BLIS_EXPECTED_CLIENT=key;
    const u=new URL('/dashboard.html',location.origin);
    u.searchParams.set('client',key);
    location.assign(u.toString());
  },true);
})();

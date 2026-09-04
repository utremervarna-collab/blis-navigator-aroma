/* KUB client-session isolation: once a tab enters the KUB client area, keep it out of shared client screens. */
(function(){
'use strict';
const K='blis.kub.client.only';
const path=location.pathname.toLowerCase();
const isKUB=path==='/kub-private'||path==='/kub-home.html'||path==='/kub-crisis.html';
try{
  if(isKUB){
    sessionStorage.setItem(K,'1');
    const lang=(new URLSearchParams(location.search).get('lang')||'').toLowerCase();
    if(lang)sessionStorage.setItem('blis.kub.lang',lang);
    return;
  }
  if(sessionStorage.getItem(K)==='1'){
    const lang=sessionStorage.getItem('blis.kub.lang')||'bg';
    location.replace('/kub-private?lang='+encodeURIComponent(lang));
  }
}catch(_){ }
})();

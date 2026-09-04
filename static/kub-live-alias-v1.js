/* KUB route bootstrap. Keep the canonical KUB runtime path active until all deferred scripts finish, then restore the requested client URL. */
(function(){
'use strict';
const path=location.pathname;
if(path!=='/kub-live'&&path!=='/kub-client')return;
const requested=path+location.search+location.hash;
try{
  history.replaceState(null,'','/kub-private'+location.search+location.hash);
  const restore=()=>setTimeout(()=>{try{history.replaceState(null,'',requested);}catch(_){ }},2200);
  if(document.readyState==='complete') restore();
  else window.addEventListener('load',restore,{once:true});
}catch(_){ }
})();

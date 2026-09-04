/* Fresh KUB entry route bootstrap. Keeps the same standalone KUB profile and runtime without redirecting through the shared Navigator. */
(function(){
'use strict';
const path=location.pathname;
if(path!=='/kub-live'&&path!=='/kub-client')return;
const requested=path+location.search+location.hash;
try{
  history.replaceState(null,'','/kub-private'+location.search+location.hash);
  if(path==='/kub-client') setTimeout(()=>{try{history.replaceState(null,'',requested);}catch(_){ }},0);
}catch(_){ }
})();

/* Fresh KUB entry route bootstrap. Keeps the same standalone KUB profile and runtime without redirecting through the shared Navigator. */
(function(){
'use strict';
if(location.pathname!=='/kub-live')return;
try{history.replaceState(null,'','/kub-private'+location.search+location.hash);}catch(_){ }
})();

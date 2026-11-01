/* BLIS Navigator: retire offline service workers until client-safe caching is proven.
   Old cached dashboard HTML could display Aroma for an Ariel Fish route. */
(function(){
  if (!('serviceWorker' in navigator)) return;
  function retireUnsafeCache(){
    navigator.serviceWorker.getRegistrations().then(function(regs){
      return Promise.all(regs.map(function(reg){return reg.unregister()}));
    }).catch(function(err){console.warn('BLIS worker cleanup:',err)});
    if ('caches' in window) {
      caches.keys().then(function(keys){
        return Promise.all(keys.filter(function(k){return k.indexOf('blis-navigator-pwa-')===0}).map(function(k){return caches.delete(k)}));
      }).catch(function(err){console.warn('BLIS cached dashboard cleanup:',err)});
    }
  }
  retireUnsafeCache();
  window.addEventListener('load',retireUnsafeCache,{once:true});
})();

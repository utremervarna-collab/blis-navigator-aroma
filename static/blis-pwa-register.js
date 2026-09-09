(function(){
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/blis-sw.js', { scope: '/' }).catch(function(err){
      console.warn('BLIS PWA service worker registration failed', err);
    });
  });
})();

/* BLIS Navigator — social data compatibility loader. */
(function(){
  'use strict';
  if(document.querySelector('script[data-blis-social-verified]'))return;
  const s=document.createElement('script');
  s.src='/navigator-social-verified-fallback.js?v=20260819-verified1';
  s.dataset.blisSocialVerified='1';
  document.head.appendChild(s);
})();

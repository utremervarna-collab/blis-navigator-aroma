/* BLIS Navigator — production bootstrap for page state, social and reputation.
   Global chart point mutation has been removed. Chart renderers own their own SVG. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_BOOTSTRAP_V2)return;window.__BLIS_PRODUCTION_BOOTSTRAP_V2=true;
function script(attr,src,onload){if(document.querySelector(`script[${attr}]`)){onload?.();return}const s=document.createElement('script');s.src=src;s.setAttribute(attr,'1');s.async=false;if(onload)s.onload=onload;document.head.appendChild(s)}
function style(attr,href){if(document.querySelector(`link[${attr}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(attr,'1');document.head.appendChild(l)}
script('data-blis-page-state','/navigator-page-state.js?v=20260824-state3');
script('data-blis-social-interactive','/navigator-social-interactive.js?v=20260819-socialinteractive7');
script('data-blis-social-bootstrap','/navigator-social-bootstrap.js?v=20260819-socialboot1');
style('data-blis-reputation-master','/navigator-reputation-master.css?v=20260819-reputation2');
script('data-blis-reputation-master','/navigator-reputation-master.js?v=20260824-reputation-master1',()=>{
  script('data-blis-reputation-bootstrap','/navigator-reputation-bootstrap.js?v=20260819-reputationboot42');
});
})();

/* BLIS Navigator — final module recovery stack v1.
   Restores the approved Social and Reputation modules and removes obsolete
   white-page paint ownership. Page state is loaded synchronously by dashboard. */
(function(){
'use strict';
if(window.__BLIS_RECOVERY_STACK_2322)return;window.__BLIS_RECOVERY_STACK_2322=true;

document.documentElement.classList.add('blis-final-booted');

function style(key,href){
  let l=document.querySelector(`link[data-blis-recovery="${key}"]`);
  if(l){l.href=href;return l}
  l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.blisRecovery=key;document.head.appendChild(l);return l;
}
function script(key,src,onload){
  let s=document.querySelector(`script[data-blis-recovery="${key}"]`);
  if(s){if(onload){if(s.dataset.loaded==='1')onload();else s.addEventListener('load',onload,{once:true})}return s}
  s=document.createElement('script');s.src=src;s.dataset.blisRecovery=key;
  s.addEventListener('load',()=>{s.dataset.loaded='1';onload?.()},{once:true});
  document.head.appendChild(s);return s;
}

function forcePaint(){
  document.documentElement.classList.add('blis-final-booted');
  ['reputationBody','marketBody','competitionBody'].forEach(id=>{
    const r=document.getElementById(id);if(!r)return;
    r.style.setProperty('visibility','visible','important');
    r.style.setProperty('opacity','1','important');
    r.style.setProperty('display','block','important');
  });
}

function loadSocial(){
  style('social-master-css','/navigator-social-master.css?v=20260821-2322');
  script('social-master-js','/navigator-social-master.js?v=20260821-2322',()=>{
    script('social-interactive','/navigator-social-interactive.js?v=20260821-2322',()=>{
      script('social-bootstrap','/navigator-social-bootstrap.js?v=20260821-2322');
    });
  });
}

function loadReputation(){
  style('reputation-master-css','/navigator-reputation-master.css?v=20260821-2322');
  script('reputation-master-js','/navigator-reputation-master.js?v=20260821-2322',()=>{
    script('reputation-bootstrap','/navigator-reputation-bootstrap.js?v=20260821-2322');
  });
}

loadSocial();loadReputation();forcePaint();

/* The final runtime and client switchers replace route functions during startup.
   Keep the paint contract applied without introducing another renderer. */
[0,40,120,300,700,1400,2600].forEach(ms=>setTimeout(forcePaint,ms));
window.addEventListener('blis:clientdata',()=>setTimeout(forcePaint,0));
window.addEventListener('pageshow',()=>setTimeout(forcePaint,0));
})();

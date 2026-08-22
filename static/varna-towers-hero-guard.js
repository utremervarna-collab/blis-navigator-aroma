/* Varna Towers — direct static hero. */
(function(){
  'use strict';
  function isVT(){return document.body.dataset.client==='varna-towers'}
  function apply(){
    if(!isVT())return;
    const bg=document.querySelector('.topbar .client-photo-bg');
    if(!bg)return;
    bg.style.setProperty('background-image','url("/varna-towers-profile-hero-header-v2.jpg?v=20260818-direct")','important');
    bg.style.setProperty('background-position','center center','important');
    bg.style.setProperty('background-size','cover','important');
    bg.style.setProperty('background-repeat','no-repeat','important');
    bg.style.setProperty('opacity','1','important');
    bg.style.setProperty('transform','none','important');
    bg.dataset.varnaTowersHero='ready-direct';
  }
  function run(){requestAnimationFrame(()=>{apply();setTimeout(apply,120);setTimeout(apply,420)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',run,{once:true});
  window.addEventListener('blis:clientdata',run);
})();

/* Global post-boot loader for the quiet client-value utility pages. */
(function(){
  'use strict';
  if(window.__BLISClientValuePagesLoader)return;window.__BLISClientValuePagesLoader=true;
  function load(){
    if(!document.querySelector('link[data-cvp]')){
      const l=document.createElement('link');l.rel='stylesheet';l.href='/navigator-client-value-pages-v1.css?v=20260822-cvp1';l.dataset.cvp='1';document.head.appendChild(l);
    }
    if(!document.querySelector('script[data-cvp]')){
      const s=document.createElement('script');s.src='/navigator-client-value-pages-v1.js?v=20260822-cvp1';s.async=false;s.dataset.cvp='1';document.body.appendChild(s);
    }
  }
  if(document.readyState==='complete')load();else window.addEventListener('load',load,{once:true});
})();

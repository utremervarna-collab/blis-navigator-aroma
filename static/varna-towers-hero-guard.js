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

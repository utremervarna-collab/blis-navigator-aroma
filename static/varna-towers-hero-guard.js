/* Varna Towers — final dedicated hero loader. */
(function(){
  'use strict';
  let data='';
  let loading=null;
  function isVT(){return document.body.dataset.client==='varna-towers'}
  function source(){
    if(data)return Promise.resolve(data);
    if(!loading){
      loading=fetch('/varna-towers-profile-hero-header-v7.js?v=20260818-vt-header8',{cache:'no-store'})
        .then(r=>{if(!r.ok)throw new Error('VT hero '+r.status);return r.text()})
        .then(t=>{data='data:image/jpeg;base64,'+t.trim();return data})
        .catch(()=>{loading=null;return''});
    }
    return loading;
  }
  function apply(){
    if(!isVT())return;
    const bg=document.querySelector('.topbar .client-photo-bg');
    if(!bg)return;
    source().then(src=>{
      if(!src||!isVT())return;
      bg.style.setProperty('background-image',`url("${src}")`,'important');
      bg.style.setProperty('background-position','center center','important');
      bg.style.setProperty('background-size','cover','important');
      bg.style.setProperty('background-repeat','no-repeat','important');
      bg.style.setProperty('opacity','1','important');
      bg.style.setProperty('transform','none','important');
      bg.dataset.varnaTowersHero='ready';
    });
  }
  function run(){requestAnimationFrame(()=>{apply();setTimeout(apply,120);setTimeout(apply,420);setTimeout(apply,900)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',run,{once:true});
  window.addEventListener('blis:clientdata',run);
})();

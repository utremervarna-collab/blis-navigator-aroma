(function(){
  'use strict';
  const ASSET='/bolyarka-profile-hero.webp?v=20260818-selected2';

  function isBolyarka(){
    return !!document.body && document.body.dataset.client==='bolyarka';
  }

  function ensureBg(){
    const top=document.querySelector('.topbar');
    if(!top)return null;
    top.querySelectorAll('.bolyarka-hard-hero,.bolyarka-hard-hero-shade').forEach(x=>x.remove());
    let bg=top.querySelector('.client-photo-bg');
    if(!bg){
      bg=document.createElement('div');
      bg.className='client-photo-bg';
      top.prepend(bg);
    }
    let veil=top.querySelector('.client-photo-veil');
    if(!veil){
      veil=document.createElement('div');
      veil.className='client-photo-veil';
      bg.after(veil);
    }
    return bg;
  }

  function apply(){
    if(!isBolyarka())return;
    const bg=ensureBg();
    if(!bg)return;
    bg.style.setProperty('inset','0','important');
    bg.style.setProperty('width','100%','important');
    bg.style.setProperty('height','100%','important');
    bg.style.setProperty('background-image','url("'+ASSET+'")','important');
    bg.style.setProperty('background-size','cover','important');
    bg.style.setProperty('background-position','center center','important');
    bg.style.setProperty('background-repeat','no-repeat','important');
    bg.style.setProperty('transform','none','important');
    bg.style.setProperty('filter','none','important');
    bg.style.setProperty('opacity','1','important');
    bg.dataset.bolyarkaHero='selected-middle-1600x400';
  }

  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('load',apply,{once:true});
  document.addEventListener('change',e=>{
    if(e.target&&e.target.id==='clientSel')setTimeout(apply,0);
  },true);
  setTimeout(apply,80);
  setTimeout(apply,350);
  setTimeout(apply,900);
})();

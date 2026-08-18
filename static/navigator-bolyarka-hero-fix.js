(function(){
  'use strict';
  const RAW='https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/main/static/hero-bolyarka-micro.txt';
  let source='';
  let loading=null;

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

  async function getSource(){
    if(source)return source;
    if(loading)return loading;
    loading=(async()=>{
      const r=await fetch(RAW+'?v=20260818-original-profile6',{cache:'no-store',mode:'cors'});
      if(!r.ok)throw new Error('Bolyarka profile hero HTTP '+r.status);
      const txt=(await r.text()).trim();
      if(!txt.startsWith('UklGR'))throw new Error('Bolyarka profile hero payload is not WebP');
      const src='data:image/webp;base64,'+txt;
      const probe=new Image();
      probe.src=src;
      if(probe.decode)await probe.decode();
      else await new Promise((ok,bad)=>{probe.onload=ok;probe.onerror=bad;});
      if(!probe.naturalWidth||!probe.naturalHeight)throw new Error('Bolyarka profile hero decoded with zero dimensions');
      source=src;
      return src;
    })().catch(e=>{
      console.error('BLIS Bolyarka profile hero validation failed',e);
      loading=null;
      return '';
    });
    return loading;
  }

  async function apply(){
    if(!isBolyarka())return;
    const bg=ensureBg();
    if(!bg)return;
    const src=await getSource();
    if(!src||!isBolyarka())return;
    bg.style.setProperty('background-image','url("'+src+'")','important');
    bg.style.setProperty('background-size','cover','important');
    bg.style.setProperty('background-position','34% 50%','important');
    bg.style.setProperty('background-repeat','no-repeat','important');
    bg.style.setProperty('opacity','1','important');
    bg.dataset.bolyarkaHero='original-profile6';
  }

  const observer=new MutationObserver(()=>{ if(isBolyarka())apply(); });
  observer.observe(document.body,{attributes:true,attributeFilter:['data-client']});
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('load',apply,{once:true});
  document.addEventListener('click',()=>setTimeout(apply,120),true);
  setTimeout(apply,80);
  setTimeout(apply,500);
  setTimeout(apply,1400);
  setTimeout(apply,2600);
})();

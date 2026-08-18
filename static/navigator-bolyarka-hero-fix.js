(function(){
  'use strict';
  const RAW='https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/6647e82b8c1e015bedb6d5ddd3b1a3d1569b5a13/static/hero-bolyarka-micro.txt';
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
      const r=await fetch(RAW+'?v=20260818-profile-800x200-7',{cache:'no-store',mode:'cors'});
      if(!r.ok)throw new Error('Bolyarka profile hero HTTP '+r.status);
      const txt=(await r.text()).trim();
      if(!txt.startsWith('UklGR'))throw new Error('Bolyarka profile hero payload is not WebP');
      const src='data:image/webp;base64,'+txt;
      const probe=new Image();
      probe.src=src;
      if(probe.decode)await probe.decode();
      else await new Promise((ok,bad)=>{probe.onload=ok;probe.onerror=bad;});
      if(probe.naturalWidth!==800||probe.naturalHeight!==200){
        throw new Error('Unexpected Bolyarka hero size '+probe.naturalWidth+'x'+probe.naturalHeight);
      }
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
    bg.style.setProperty('inset','0','important');
    bg.style.setProperty('width','100%','important');
    bg.style.setProperty('height','100%','important');
    bg.style.setProperty('background-image','url("'+src+'")','important');
    bg.style.setProperty('background-size','cover','important');
    bg.style.setProperty('background-position','center center','important');
    bg.style.setProperty('background-repeat','no-repeat','important');
    bg.style.setProperty('transform','none','important');
    bg.style.setProperty('opacity','1','important');
    bg.dataset.bolyarkaHero='profile-800x200-7';
  }

  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('load',apply,{once:true});
  document.addEventListener('change',e=>{
    if(e.target&&e.target.id==='clientSel')setTimeout(apply,0);
  },true);
  setTimeout(apply,80);
  setTimeout(apply,500);
  setTimeout(apply,1200);
})();

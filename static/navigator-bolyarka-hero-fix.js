(function(){
  'use strict';

  function activeClient(){
    return (document.body && document.body.dataset && document.body.dataset.client) || '';
  }

  function ensureStyle(){
    if(document.getElementById('bolyarkaHeroHardFixStyle')) return;
    const s=document.createElement('style');
    s.id='bolyarkaHeroHardFixStyle';
    s.textContent=`
      .topbar{position:relative!important;overflow:hidden!important;isolation:isolate!important;}
      .topbar .bolyarka-hard-hero{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 54%!important;display:block!important;opacity:.48!important;z-index:0!important;pointer-events:none!important;}
      .topbar .bolyarka-hard-hero-shade{position:absolute!important;inset:0!important;z-index:1!important;pointer-events:none!important;background:linear-gradient(90deg,rgba(248,246,241,.97) 0%,rgba(248,246,241,.84) 34%,rgba(248,246,241,.28) 66%,rgba(20,26,34,.08) 100%)!important;}
      .topbar>.title,.topbar>.toptools{position:relative!important;z-index:3!important;}
      body:not([data-client="bolyarka"]) .topbar .bolyarka-hard-hero,
      body:not([data-client="bolyarka"]) .topbar .bolyarka-hard-hero-shade{display:none!important;}
    `;
    document.head.appendChild(s);
  }

  function apply(){
    ensureStyle();
    const top=document.querySelector('.topbar');
    if(!top) return;

    let img=top.querySelector('.bolyarka-hard-hero');
    if(!img){
      img=document.createElement('img');
      img.className='bolyarka-hard-hero';
      img.alt='';
      img.setAttribute('aria-hidden','true');
      img.src='/home-bolyarka.svg?v=20260818-header-hardfix1';
      top.prepend(img);
    }

    let shade=top.querySelector('.bolyarka-hard-hero-shade');
    if(!shade){
      shade=document.createElement('div');
      shade.className='bolyarka-hard-hero-shade';
      img.after(shade);
    }

    const on=activeClient()==='bolyarka';
    img.style.display=on?'block':'none';
    shade.style.display=on?'block':'none';
  }

  const observer=new MutationObserver(apply);
  observer.observe(document.body,{attributes:true,attributeFilter:['data-client']});
  window.addEventListener('load',apply,{once:true});
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  document.addEventListener('click',()=>setTimeout(apply,50),true);
  setTimeout(apply,0);
  setTimeout(apply,250);
})();

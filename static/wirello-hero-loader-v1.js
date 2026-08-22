/* Wirello hero asset loader — one-shot, no timers, no DOM observer. */
(function(){
'use strict';
if(window.__WIRELLO_HERO_LOADER)return;window.__WIRELLO_HERO_LOADER=true;
const nativeFetch=window.fetch.bind(window);
async function apply(){
  try{
    const parts=await Promise.all([0,1,2,3,4,5,6].map(i=>nativeFetch('/wirello-hero-part-'+i+'.b64?v=20260822',{cache:'force-cache'}).then(r=>r.ok?r.text():'')));
    const b64=parts.join('').replace(/\s+/g,'');if(!b64)return;
    const top=document.querySelector('.topbar');if(!top)return;
    const bg='linear-gradient(90deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.90) 28%,rgba(255,255,255,.44) 52%,rgba(255,255,255,.02) 74%),url("data:image/webp;base64,'+b64+'")';
    top.style.setProperty('background-image',bg,'important');
    top.style.setProperty('background-size','cover','important');
    top.style.setProperty('background-position','center right','important');
    top.style.setProperty('background-repeat','no-repeat','important');
  }catch(e){console.warn('Wirello hero load failed',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();

/* KUB-only shell corrections. Runs before the KUB language layers. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
const lang=(new URLSearchParams(location.search).get('lang')||'bg').toLowerCase();
const homeLabel=lang==='ru'?'← На главную':lang==='en'?'← Back to home':'← Към началната страница';
function isPaymentsControl(text){
  const t=(text||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(!t)return false;
  return (t.includes('услуги')&&(t.includes('плащан')||t.includes('оплат')))||
         (t.includes('services')&&t.includes('payment'));
}
function apply(){
  const a=document.querySelector('.sidefoot a');
  if(a){a.setAttribute('href','/kub-home.html?lang='+encodeURIComponent(lang));a.textContent=homeLabel}
  document.querySelectorAll('a,button,[role="button"],.btn').forEach(el=>{
    if(isPaymentsControl(el.textContent)){
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
      el.setAttribute('tabindex','-1');
    }
  });
}
function boot(){apply();setTimeout(apply,180)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* KUB-only shell corrections. Runs before the KUB RU layer. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
const isRU=(new URLSearchParams(location.search).get('lang')||'').toLowerCase()==='ru';
function isPaymentsControl(text){
  const t=(text||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(!t)return false;
  return (t.includes('услуги')&&(t.includes('плащан')||t.includes('оплат')))||
         (t.includes('services')&&t.includes('payment'));
}
function apply(){
  const a=document.querySelector('.sidefoot a[href*="dashboard.html"]');
  if(a){a.setAttribute('href','/');a.textContent=isRU?'← На главную':'← Към началната страница'}
  document.querySelectorAll('a,button,[role="button"],.btn').forEach(el=>{
    if(isPaymentsControl(el.textContent)){
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
      el.setAttribute('tabindex','-1');
    }
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
const mo=new MutationObserver(()=>apply());mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();

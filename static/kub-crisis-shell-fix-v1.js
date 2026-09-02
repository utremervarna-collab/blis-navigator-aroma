/* KUB-only shell corrections. Runs before the KUB RU layer. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
const isRU=(new URLSearchParams(location.search).get('lang')||'').toLowerCase()==='ru';
function apply(){
  const a=document.querySelector('.sidefoot a[href*="dashboard.html"]');
  if(a){a.setAttribute('href','/');a.textContent=isRU?'← На главную':'← Към началната страница'}
  const re=/^(услуги\s*(и|&)\s*плащания|services\s*(and|&)\s*payments|услуги\s*(и|&)\s*оплата)$/i;
  document.querySelectorAll('a,button,[role="button"],.btn').forEach(el=>{const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(re.test(t)){el.style.display='none';el.setAttribute('aria-hidden','true')}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
const mo=new MutationObserver(()=>apply());mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
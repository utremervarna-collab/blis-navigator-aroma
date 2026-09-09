/* BLIS Navigator nav label fix v1
   Canonical Bulgarian label for the market/environment page is "Среда".
   This runtime repairs late-rendered/legacy navigation labels without changing routing.
*/
(function(){
'use strict';
if(window.__BLIS_NAV_LABEL_FIX_V1)return;window.__BLIS_NAV_LABEL_FIX_V1=true;

function setText(el){
  if(!el)return;
  const target=el.querySelector?.('.navtxt')||el;
  const txt=(target.textContent||'').trim();
  if(txt!=='Среда')target.textContent='Среда';
}

function fix(){
  const nav=document.getElementById('nav')||document.querySelector('nav')||document.querySelector('.nav');
  if(!nav)return;

  nav.querySelectorAll('[data-n3-page="market"],[data-page="market"],a[href*="page=market"],button[value="market"]').forEach(setText);

  nav.querySelectorAll('button,a,[role="button"],.nav-item,.navrow').forEach(el=>{
    const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(txt==='Ключови фактори'||txt.includes('Ключови фактори')) setText(el);
  });
}

function boot(){
  fix();
  setTimeout(fix,120);
  setTimeout(fix,500);
  setTimeout(fix,1400);
  const root=document.getElementById('nav')||document.body;
  if(!root)return;
  const mo=new MutationObserver(()=>queueMicrotask(fix));
  mo.observe(root,{childList:true,subtree:true,characterData:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

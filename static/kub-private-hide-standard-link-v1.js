/* Remove any link back to the shared Navigator from all isolated KUB routes. */
(function(){
'use strict';
const path=(location.pathname||'').toLowerCase();
if(!path.startsWith('/kub-')&&path!=='/kub'&&path!=='/kub/')return;

function installHardHide(){
  if(document.getElementById('kubNoSharedNavigatorCss'))return;
  const style=document.createElement('style');
  style.id='kubNoSharedNavigatorCss';
  style.textContent='.sidefoot a[href*="/dashboard.html"],.sidefoot a[href*="/navigator"],.sidefoot a[data-standard-navigator]{display:none!important}';
  (document.head||document.documentElement).appendChild(style);
}

function removeLink(){
  installHardHide();
  document.querySelectorAll('.sidefoot a').forEach(a=>{
    const t=(a.textContent||'').toLowerCase();
    const h=(a.getAttribute('href')||'').toLowerCase();
    if(t.includes('към стандартния navigator')||t.includes('към стандартният navigator')||t.includes('standard navigator')||h.includes('/dashboard.html')||h.includes('/navigator')) a.remove();
  });
  document.querySelectorAll('.sidefoot').forEach(el=>{
    el.innerHTML=el.innerHTML.replace(/<br\s*\/?>\s*$/i,'').trim();
  });
}

installHardHide();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeLink,{once:true});else removeLink();
new MutationObserver(removeLink).observe(document.documentElement,{childList:true,subtree:true});
})();

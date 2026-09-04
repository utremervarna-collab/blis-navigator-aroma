/* Hide standard Navigator link from isolated KUB profiles. */
(function(){
'use strict';
const path=location.pathname.toLowerCase();
if(path!=='/kub-private'&&path!=='/kub-live')return;
function removeLink(){
  document.querySelectorAll('.sidefoot a').forEach(a=>{
    const t=(a.textContent||'').toLowerCase();
    const h=(a.getAttribute('href')||'').toLowerCase();
    if(t.includes('стандартния navigator')||t.includes('стандартният navigator')||t.includes('standard navigator')||h.includes('/dashboard.html')) a.remove();
  });
  document.querySelectorAll('.sidefoot').forEach(el=>{
    el.innerHTML=el.innerHTML.replace(/<br\s*\/?>\s*$/i,'').trim();
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeLink,{once:true});else removeLink();
new MutationObserver(removeLink).observe(document.documentElement,{childList:true,subtree:true});
})();

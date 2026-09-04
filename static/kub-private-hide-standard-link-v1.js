/* Hide standard Navigator link from canonical private KUB profile. */
(function(){
'use strict';
if(location.pathname!=='/kub-private')return;
function removeLink(){
  document.querySelectorAll('.sidefoot a').forEach(a=>{
    const t=(a.textContent||'').toLowerCase();
    if(t.includes('стандартния navigator')||t.includes('стандартният navigator')||t.includes('standard navigator')) a.remove();
  });
  document.querySelectorAll('.sidefoot').forEach(el=>{
    el.innerHTML=el.innerHTML.replace(/<br\s*\/?>\s*$/i,'').trim();
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeLink,{once:true});else removeLink();
new MutationObserver(removeLink).observe(document.documentElement,{childList:true,subtree:true});
})();

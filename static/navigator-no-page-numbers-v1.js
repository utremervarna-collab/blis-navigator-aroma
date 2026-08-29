/* BLIS Navigator — page numbering cleanup v1.
   Presentation-only: removes visible page numbers without changing routing, data, or ownership. */
(function(){
'use strict';
if(window.__BLIS_NO_PAGE_NUMBERS_V1)return;window.__BLIS_NO_PAGE_NUMBERS_V1=true;
function stripText(el){
  if(!el)return;
  const t=String(el.textContent||'');
  const n=t.replace(/^\s*0?\d{1,2}\s*[\.\-–—:]\s*/,'');
  if(n!==t)el.textContent=n;
}
function clean(){
  document.documentElement.classList.add('blis-no-page-numbers');
  document.querySelectorAll('.page h1,.page h2,.page .sv2-head h2,.page .vs-head h2,.page .ref-title h2').forEach(stripText);
  document.querySelectorAll('.blis-stage-context-main span').forEach(el=>{
    const t=String(el.textContent||'');
    const n=t.replace(/Аналитична стъпка\s+0?\d{1,2}\s+от\s+0?\d{1,2}\s*[·•-]?\s*/i,'Аналитична стъпка · ');
    if(n!==t)el.textContent=n;
  });
}
function css(){
  if(document.getElementById('blisNoPageNumbersCss'))return;
  const s=document.createElement('style');s.id='blisNoPageNumbersCss';s.textContent=`
  .blis-no-page-numbers .vs-num{display:none!important}
  .blis-no-page-numbers .blis-system-step .num{display:none!important}
  .blis-no-page-numbers .blis-system-step{padding-left:9px!important;padding-right:9px!important}
  .blis-no-page-numbers .blis-system-step .txt{display:flex!important}
  @media(max-width:900px){.blis-no-page-numbers .blis-system-step .txt{display:flex!important}.blis-no-page-numbers .blis-system-step .txt b{font-size:7.5px!important}}
  `;document.head.appendChild(s);
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(clean))}
css();clean();
['blis:routechange','blis:clientdata','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(ev=>window.addEventListener(ev,schedule));
const root=document.querySelector('.shell')||document.body;if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.BLISNoPageNumbersV1={clean};
})();
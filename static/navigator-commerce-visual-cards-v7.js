/* BLIS Navigator — approved service artwork loader. Loads approved v11 family for every offer. */
(function(){
'use strict';
if(window.__BLIS_COMMERCE_VISUAL_CARDS_V7)return;window.__BLIS_COMMERCE_VISUAL_CARDS_V7=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
function catalog(){return window.BLISCommerceSafe?.catalog||{services:[],addons:[]}}
function addon(id){return catalog().addons?.find(x=>x.id===id)}
function loadApproved(){
  if(!document.querySelector('link[data-blis-approved-v11]')){
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href='/navigator-commerce-approved-all-v11.css?v=20260824-family11b';
    l.dataset.blisApprovedV11='1';
    document.head.appendChild(l);
  }
  if(!document.querySelector('script[data-blis-approved-v11]')){
    const s=document.createElement('script');
    s.src='/navigator-commerce-approved-all-v11.js?v=20260824-family11b';
    s.dataset.blisApprovedV11='1';
    s.onload=()=>window.BLISCommerceApprovedAllV11?.enhance?.();
    document.head.appendChild(s);
  }else{
    window.BLISCommerceApprovedAllV11?.enhance?.();
  }
}
function addonModal(id){const a=addon(id),m=document.getElementById('bc3Modal');if(!a||!m)return;const t=document.getElementById('bc3ModalTitle'),b=document.getElementById('bc3ModalBody');if(t)t.textContent=a.name;if(b)b.innerHTML=`<p>${esc(a.description)}</p><p><b>Цена:</b> ${Number(a.price||0).toLocaleString('bg-BG',{style:'currency',currency:'EUR',maximumFractionDigits:0})} / ${esc(a.cycle||'')}</p><p>Допълнението се активира към действащ клиентски профил след потвърждение на обхвата.</p>`;m.classList.add('open')}
function enhance(){
  document.querySelectorAll('#commerceBody .bc3-card').forEach(card=>{
    const rb=card.querySelector('[data-bc3-request]');
    if(rb){
      card.dataset.bc7='1';
      card.dataset.bc7Id=rb.dataset.bc3Request;
      card.classList.add('bc7-card');
      rb.textContent='Заяви';
      const more=card.querySelector('[data-bc3-detail]');
      if(more)more.textContent=card.querySelector('.bc3-detail')?'Скрий':'Виж повече';
      return;
    }
    const ab=card.querySelector('[data-bc3-addon-request]');
    if(ab){
      const a=addon(ab.dataset.bc3AddonRequest);
      if(a){
        card.dataset.bc7='1';card.dataset.bc7Id=a.id;card.classList.add('bc7-card','bc7-addon');ab.textContent='Заяви';
        const actions=card.querySelector('.bc3-actions');
        if(actions&&!actions.querySelector('[data-bc7-addon-more]'))actions.insertAdjacentHTML('beforeend',`<button class="bc3-btn ghost" data-bc7-addon-more="${esc(a.id)}">Виж повече</button>`);
      }
    }
  });
  loadApproved();
}
function queue(){requestAnimationFrame(()=>requestAnimationFrame(enhance))}
document.addEventListener('click',e=>{const more=e.target.closest?.('[data-bc7-addon-more]');if(more){e.preventDefault();addonModal(more.dataset.bc7AddonMore);return}if(e.target.closest?.('[data-bc3-tab],[data-bc3-detail],[data-bc3-request],[data-bc3-addon-request],[data-blis-commerce-open]'))queue()},false);
window.addEventListener('blis:clientdata',queue);
window.BLISCommerceVisualCardsV7={enhance};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(enhance,80);setTimeout(enhance,320)},{once:true});else{setTimeout(enhance,40);setTimeout(enhance,240)}
})();
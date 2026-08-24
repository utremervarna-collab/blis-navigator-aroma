/* BLIS Navigator — exact approved service card artwork v8. */
(function(){
'use strict';
if(window.__BLIS_COMMERCE_EXACT_CARDS_V8)return;window.__BLIS_COMMERCE_EXACT_CARDS_V8=true;
const MAP={corporate:'/service-cards/corporate.webp',full:'/service-cards/full.webp',analysis:'/service-cards/analysis.webp',monitor:'/service-cards/monitor.webp','reputation-audit':'/service-cards/reputation.webp','brand-scan':'/service-cards/brand-scan.webp'};
function idOf(card){return card?.dataset?.bc7Id||card?.querySelector?.('[data-bc3-request]')?.dataset?.bc3Request||''}
function apply(card){const id=idOf(card),src=MAP[id];if(!src)return;if(card.dataset.bc8==='1')return;const req=card.querySelector('[data-bc3-request]'),more=card.querySelector('[data-bc3-detail]');card.dataset.bc8='1';card.classList.add('bc8-exact-card');const poster=document.createElement('div');poster.className='bc8-poster';poster.innerHTML=`<img src="${src}?v=20260824-exact1" alt="${id}" loading="eager" decoding="async"><button type="button" class="bc8-hit bc8-hit-order" aria-label="Заяви"></button><button type="button" class="bc8-hit bc8-hit-more" aria-label="Виж повече"></button>`;poster.querySelector('.bc8-hit-order').onclick=e=>{e.preventDefault();e.stopPropagation();req?.click()};poster.querySelector('.bc8-hit-more').onclick=e=>{e.preventDefault();e.stopPropagation();more?.click()};card.prepend(poster)}
function enhance(){document.querySelectorAll('#commerceBody .bc3-card').forEach(apply)}
function queue(){requestAnimationFrame(()=>requestAnimationFrame(enhance))}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-bc3-tab],[data-bc3-detail],[data-bc3-request],[data-blis-commerce-open]'))queue()},false);
window.addEventListener('blis:clientdata',queue);
window.BLISCommerceExactCardsV8={enhance};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(enhance,120);setTimeout(enhance,420)},{once:true});else{setTimeout(enhance,80);setTimeout(enhance,320)}
})();
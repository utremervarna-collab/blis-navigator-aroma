/* BLIS Navigator public commerce — white sales interaction layer v5 */
(function(){
'use strict';
if(window.__BLIS_COMMERCE_SALES_V5)return;window.__BLIS_COMMERCE_SALES_V5=true;
function openAddonMore(card){
  const title=card.querySelector('h3')?.textContent?.trim()||'Допълнителна услуга';
  const desc=card.querySelector('.bc3-summary')?.textContent?.trim()||'';
  const price=card.querySelector('.bc3-price')?.textContent?.replace(/\s+/g,' ')?.trim()||'';
  const modal=document.getElementById('bc3Modal');
  const mt=document.getElementById('bc3ModalTitle');
  const mb=document.getElementById('bc3ModalBody');
  if(!modal||!mt||!mb)return;
  mt.textContent=title;
  mb.innerHTML='<div class="bc3-addon-more"><p>'+desc+'</p><h4>Какво добавя услугата</h4><p>Разширява активния BLIS Navigator профил с конкретната допълнителна функционалност, без да променя основния абонамент.</p><h4>Цена</h4><p><strong>'+price+'</strong></p><h4>Активиране</h4><p>След потвърждение на обхвата и съвместимостта с текущия клиентски профил.</p></div>';
  modal.classList.add('open');
}
function patch(){
  document.querySelectorAll('.bc3-addon').forEach(card=>{
    const actions=card.querySelector('.bc3-actions');
    if(!actions||actions.querySelector('[data-bc3-addon-more]'))return;
    const b=document.createElement('button');
    b.type='button';b.className='bc3-btn ghost';b.dataset.bc3AddonMore='1';b.textContent='Виж повече';
    actions.appendChild(b);
  });
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(patch))}
document.addEventListener('click',e=>{
  const more=e.target.closest?.('[data-bc3-addon-more]');
  if(more){e.preventDefault();openAddonMore(more.closest('.bc3-addon'));return}
  if(e.target.closest?.('[data-bc3-tab],[data-bc3-detail],[data-bc3-request],[data-bc3-addon-request],[data-blis-commerce-open]'))setTimeout(patch,0);
},true);
window.addEventListener('blis:clientdata',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,120),{once:true});else setTimeout(patch,120);
})();
/* BLIS Navigator — approved light service catalogue v10. Authoritative visual layer. */
(function(){
'use strict';
if(window.__BLIS_APPROVED_SERVICE_CARDS_V10)return;
window.__BLIS_APPROVED_SERVICE_CARDS_V10=true;

const MAP={
  monitor:'/service-cards/monitor.webp',
  analysis:'/service-cards/analysis.webp',
  full:'/service-cards/full.webp',
  corporate:'/service-cards/corporate.webp',
  'brand-scan':'/service-cards/brand-scan.webp',
  'reputation-audit':'/service-cards/reputation.webp',
  competitive:'/service-cards/competitive.webp',
  digital:'/service-cards/digital.webp',
  attitudes:'/service-cards/attitudes.webp',
  signals:'/service-cards/signals.webp',
  crisis:'/service-cards/crisis.webp',
  'comm-effect':'/service-cards/comm-effect.webp',
  'source-audit':'/service-cards/source-audit.webp',
  blis360:'/service-cards/blis360.webp'
};
const ADDON_STYLE={
  brand:['#12a99d','B'],competitor:['#f28a18','⇄'],market:['#159a72','◎'],language:['#367bd5','A'],
  weekly:['#7258c9','▤'],'crisis-watch':['#d54848','!'],api:['#2384c5','↔'],'white-label':['#c79632','W'],
  'deep-dive':['#9a55c9','⌕'],executive:['#b78323','★'],'sector-radar':['#159a72','⌁'],'regulatory-radar':['#566fd1','§']
};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const eur=n=>Number(n||0).toLocaleString('bg-BG',{style:'currency',currency:'EUR',maximumFractionDigits:0});
function catalog(){return window.BLISCommerceSafe?.catalog||{services:[],addons:[]}}
function addon(id){return catalog().addons?.find(x=>x.id===id)}
function serviceId(card){return card.querySelector('[data-bc3-request]')?.dataset?.bc3Request||card.dataset.bc7Id||''}
function addonId(card){return card.querySelector('[data-bc3-addon-request]')?.dataset?.bc3AddonRequest||''}

function showAddonDetail(a){
  if(!a)return;
  const modal=document.getElementById('bc3Modal');
  const title=document.getElementById('bc3ModalTitle');
  const body=document.getElementById('bc3ModalBody');
  if(modal&&title&&body){
    title.textContent=a.name;
    body.innerHTML=`<p>${esc(a.description)}</p><p><b>Цена:</b> ${eur(a.price)} / ${esc(a.cycle)}</p><p>Услугата се активира към действащ абонамент след потвърждение на обхвата и се управлява от същия клиентски профил в Navigator.</p>`;
    modal.classList.add('open');
    return;
  }
  const existing=document.querySelector(`[data-bc7-addon-more="${CSS.escape(a.id)}"]`);
  if(existing)existing.click();
}

function applyService(card,id,src){
  if(card.dataset.bc10===id&&card.querySelector('.bc10-poster'))return;
  const request=card.querySelector('[data-bc3-request]');
  const detail=card.querySelector('[data-bc3-detail]');
  card.dataset.bc10=id;
  card.dataset.bc8='1';
  card.classList.remove('bc8-exact-card');
  card.classList.add('bc10-card','bc10-exact-card');
  card.querySelectorAll('.bc8-poster,.bc10-poster,.bc10-addon-poster').forEach(x=>x.remove());
  const poster=document.createElement('div');
  poster.className='bc10-poster';
  poster.innerHTML=`<img src="${src}?v=20260824-final1" alt="${esc(id)}" loading="eager" decoding="async"><div class="bc10-actions"><button type="button" class="bc10-action bc10-order">Заяви</button><button type="button" class="bc10-action bc10-more">Виж повече</button></div>`;
  poster.querySelector('.bc10-order').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();request?.click()});
  poster.querySelector('.bc10-more').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();detail?.click()});
  card.prepend(poster);
}

function applyAddon(card,id){
  const a=addon(id);if(!a)return;
  if(card.dataset.bc10===`addon:${id}`&&card.querySelector('.bc10-addon-poster'))return;
  const request=card.querySelector('[data-bc3-addon-request]');
  const [accent,icon]=ADDON_STYLE[id]||['#c39431','✦'];
  card.dataset.bc10=`addon:${id}`;
  card.classList.add('bc10-card','bc10-addon-card');
  card.style.setProperty('--bc10-accent',accent);
  card.querySelectorAll('.bc10-addon-poster').forEach(x=>x.remove());
  const poster=document.createElement('div');
  poster.className='bc10-addon-poster';
  poster.innerHTML=`
    <div class="bc10-addon-top"><div><div class="bc10-brand"><b>BLIS</b> Navigator</div><div class="bc10-addon-type">Допълнителна услуга</div><h3>${esc(a.name)}</h3></div><div class="bc10-addon-orb"><span>${esc(icon)}</span></div></div>
    <div class="bc10-addon-price"><b>${eur(a.price)}</b><span>/ ${esc(a.cycle)}</span></div>
    <p class="bc10-addon-summary">${esc(a.description)}</p>
    <div class="bc10-addon-benefits"><strong>Ползи за клиента</strong><span>Разширява активния BLIS профил без отделна система</span><span>Работи с текущите данни, анализи и история</span><span>Активира се след ясно потвърден обхват</span></div>
    <div class="bc10-actions"><button type="button" class="bc10-action bc10-order">Заяви</button><button type="button" class="bc10-action bc10-more">Виж повече</button></div>`;
  poster.querySelector('.bc10-order').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();request?.click()});
  poster.querySelector('.bc10-more').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showAddonDetail(a)});
  card.prepend(poster);
}

function enhance(){
  document.querySelectorAll('#commerceBody .bc3-card').forEach(card=>{
    const sid=serviceId(card);
    if(sid&&MAP[sid]){applyService(card,sid,MAP[sid]);return}
    const aid=addonId(card);
    if(aid){applyAddon(card,aid)}
  });
}
let queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{queued=false;enhance()}))}
function watch(){
  const root=document.getElementById('commerceBody');
  if(root&&!root.dataset.bc10Watch){
    root.dataset.bc10Watch='1';
    new MutationObserver(queue).observe(root,{childList:true,subtree:true});
  }
}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-blis-commerce-open],[data-bc3-tab],[data-bc3-request],[data-bc3-addon-request],[data-bc3-detail]')){setTimeout(queue,0);setTimeout(queue,120)}},true);
window.addEventListener('blis:clientdata',()=>{setTimeout(queue,0);setTimeout(queue,180)});
window.BLISApprovedServiceCardsV10={enhance};
function start(){watch();enhance();setTimeout(enhance,120);setTimeout(enhance,420);setTimeout(enhance,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

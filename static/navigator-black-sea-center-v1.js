/* BLIS Navigator - Black Sea Center client shell support.
   Adds the real client to the visible selector and keeps its identity stable
   even when legacy client-shell renderers repaint after data refreshes. */
(function(){
'use strict';
if(window.__BLIS_BLACK_SEA_CENTER_V1)return;window.__BLIS_BLACK_SEA_CENTER_V1=true;
const KEY='black-sea-center';
const NAME='Black Sea Center';
const TYPE='Търговски и бизнес комплекс / офис площи';
const DESC='Офис площи, търговска среда, локационна видимост и пазарни сигнали';
const LOGO='/client-logos/black-sea-center.png';
let busy=false;
const current=()=>{try{return new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||''}catch(_){return document.body?.dataset?.client||''}};
const isBSC=()=>current()===KEY;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function activePage(){return document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview'}
function ensureOption(){
 const sel=document.getElementById('clientSel');if(!sel)return;
 let o=sel.querySelector(`option[value="${KEY}"]`);if(!o){o=document.createElement('option');o.value=KEY;sel.appendChild(o)}o.textContent=NAME;
 if(isBSC())sel.value=KEY;
}
function ensureMenu(){
 const menu=document.querySelector('.client-switch-menu');if(!menu)return;
 let b=menu.querySelector(`[data-client-key="${KEY}"]`);
 if(!b){
   b=document.createElement('button');b.type='button';b.className='client-option';b.dataset.clientKey=KEY;b.setAttribute('role','option');
   b.innerHTML=`<span><b>${esc(NAME)}</b><small>${esc(TYPE)}</small></span><span class="client-option-check" aria-hidden="true"></span>`;
   const anchor=menu.querySelector('[data-client-key="aroma"]');if(anchor)menu.insertBefore(b,anchor);else menu.appendChild(b);
 }
 const on=isBSC();b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');const ck=b.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':'';
}
function applyLogo(){
 document.querySelectorAll('.bch3-logo').forEach(slot=>{
   if(!isBSC())return;
   slot.dataset.clientKey=KEY;slot.style.setProperty('--bch-accent','#234f9d');
   let img=slot.querySelector('img[data-bsc-logo]');
   if(!img){slot.querySelectorAll('img').forEach(n=>n.remove());img=document.createElement('img');img.dataset.bscLogo='1';img.alt=NAME;img.src=LOGO+'?v=20260907-bsc1';slot.appendChild(img)}
   const mark=slot.querySelector('.bch3-mark');if(mark)mark.textContent='BSC';
 });
}
function paint(){
 if(busy)return;busy=true;
 try{
   ensureOption();ensureMenu();
   if(!isBSC())return;
   if(document.body)document.body.dataset.client=KEY;
   try{window.slug=KEY;window.BLIS_INITIAL_CLIENT=KEY}catch(_){}
   document.title=`BLIS Navigator - ${NAME}`;
   document.querySelectorAll('.client-brand-name,.bch3-name').forEach(n=>n.textContent=NAME);
   document.querySelectorAll('.client-brand-type').forEach(n=>n.textContent=TYPE);
   document.querySelectorAll('.bch3-desc').forEach(n=>n.textContent=DESC);
   document.querySelectorAll('.client-option[data-client-key]').forEach(n=>{const on=n.dataset.clientKey===KEY;n.classList.toggle('active',on);n.setAttribute('aria-selected',on?'true':'false');const ck=n.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':''});
   applyLogo();
 }finally{busy=false}
}
function choose(){
 const u=new URL(location.href);u.pathname='/dashboard.html';u.searchParams.set('client',KEY);u.searchParams.set('page',activePage());u.searchParams.delete('lang');location.href=u.pathname+u.search+u.hash;
}
document.addEventListener('click',e=>{const b=e.target.closest?.(`.client-option[data-client-key="${KEY}"]`);if(!b)return;e.preventDefault();e.stopImmediatePropagation();choose()},true);
function schedule(){paint();setTimeout(paint,80);setTimeout(paint,300);setTimeout(paint,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
['blis:production-ready','blis:clientdata','blis:intelligence','blis:routechange','blis:navigator-route','popstate'].forEach(ev=>window.addEventListener(ev,schedule));
const mo=new MutationObserver(()=>{if(busy)return;requestAnimationFrame(paint)});mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();

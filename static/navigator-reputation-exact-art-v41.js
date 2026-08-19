/* BLIS Navigator — exact Aroma reputation artwork v46. Local same-origin assets only. */
(function(){
'use strict';
if(window.__BLISReputationExactArtV46)return;window.__BLISReputationExactArtV46=true;
const PARTS=[1,2,3,4].map(n=>`/reputation-aroma-exact-v2-0${n}.js?v=20260819-exact46`);
let srcPromise=null,observer=null;
function client(){return String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||new URLSearchParams(location.search).get('client')||'aroma')}
async function source(){
 if(srcPromise)return srcPromise;
 srcPromise=Promise.all(PARTS.map(u=>fetch(u,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`art ${r.status} ${u}`);return r.text()})))
   .then(a=>'data:image/webp;base64,'+a.join('').replace(/\s+/g,''));
 return srcPromise;
}
async function apply(){
 const t=document.querySelector('#reputationBody .rp-totem');
 if(!t)return false;
 if(client()!=='aroma'){
   t.classList.remove('rp-exact-aroma');
   t.querySelector('.rp-exact-art')?.remove();
   return true;
 }
 t.classList.add('rp-exact-aroma');
 let img=t.querySelector('.rp-exact-art');
 if(!img){
   img=document.createElement('img');
   img.className='rp-exact-art';
   img.alt='Aroma Cosmetics';
   img.decoding='async';
   img.draggable=false;
   t.appendChild(img);
 }
 if(img.dataset.loaded==='1')return true;
 try{
   const src=await source();
   await new Promise((resolve,reject)=>{
     img.onload=()=>resolve();
     img.onerror=()=>reject(new Error('image decode failed'));
     img.src=src;
   });
   img.dataset.loaded='1';
   return true;
 }catch(e){
   console.error('BLIS exact reputation artwork:',e);
   img.removeAttribute('src');
   img.dataset.loaded='0';
   return false;
 }
}
function schedule(delay=0){setTimeout(()=>apply(),delay)}
function init(){
 schedule(0);schedule(120);schedule(420);schedule(1200);
 const root=document.getElementById('reputationBody');
 if(root&&!observer){
   observer=new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes.length))schedule(0)});
   observer.observe(root,{childList:true,subtree:true});
 }
 document.addEventListener('click',e=>{
   if(e.target?.closest?.('#nav button[data-page="reputation"]')){schedule(60);schedule(220);schedule(700)}
 },true);
 document.getElementById('clientSel')?.addEventListener('change',()=>{schedule(100);schedule(320);schedule(800)});
}
window.BLISReputationExactArtV41={apply};
window.BLISReputationExactArtV42={apply};
window.BLISReputationExactArtV44={apply};
window.BLISReputationExactArtV46={apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

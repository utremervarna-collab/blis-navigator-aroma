/* BLIS Navigator — Aroma reputation artwork, strictly scoped to Aroma only. */
(function(){
'use strict';
if(window.__BLISReputationExactArtV50)return;
window.__BLISReputationExactArtV50=true;

const PARTS=[1,2,3,4].map(n=>`/reputation-aroma-exact-v2-0${n}.js?v=20260819-exact47`);
let srcPromise=null,observer=null,applyPromise=null;

function activeClient(){
  try{const q=new URLSearchParams(location.search).get('client');if(q)return String(q)}catch(_){}
  try{if(window.BLIS_CLIENT_SCOPE)return String(window.BLIS_CLIENT_SCOPE)}catch(_){}
  try{if(window.BLIS_INITIAL_CLIENT)return String(window.BLIS_INITIAL_CLIENT)}catch(_){}
  return String(document.body?.dataset?.client||'');
}
function isAromaContext(){
  const path=String(location.pathname||'').toLowerCase();
  if(path.includes('mollox'))return false;
  return activeClient()==='aroma';
}
function cleanup(t){
  if(!t)return;
  t.classList.remove('rp-exact-aroma');
  t.removeAttribute('data-exact-client');
  t.querySelectorAll('.rp-exact-art,.rp-exact-label').forEach(x=>x.remove());
}
function cleanupAll(){
  document.querySelectorAll('#reputationBody .rp-totem').forEach(cleanup);
  document.querySelectorAll('#reputationBody .rp-exact-art,#reputationBody .rp-exact-label').forEach(x=>x.remove());
}
function source(){
  if(srcPromise)return srcPromise;
  srcPromise=Promise.all(PARTS.map(u=>fetch(u,{cache:'force-cache'}).then(r=>{
    if(!r.ok)throw new Error(`art ${r.status} ${u}`);
    return r.text();
  }))).then(a=>'data:image/webp;base64,'+a.join('').replace(/\s+/g,''));
  return srcPromise;
}
async function doApply(){
  if(!isAromaContext()){
    cleanupAll();
    return false;
  }
  const t=document.querySelector('#reputationBody .rp-totem');
  if(!t)return false;
  t.classList.add('rp-exact-aroma');
  t.dataset.exactClient='aroma';
  let label=t.querySelector('.rp-exact-label');
  if(!label){label=document.createElement('div');label.className='rp-exact-label';t.appendChild(label)}
  label.textContent='Aroma Cosmetics';label.dataset.client='aroma';
  let img=t.querySelector('.rp-exact-art');
  if(!img){img=document.createElement('img');img.className='rp-exact-art';img.decoding='async';img.loading='eager';img.draggable=false;t.appendChild(img)}
  img.alt='Aroma Cosmetics';
  if(img.dataset.loaded==='1')return true;
  try{
    const src=await source();
    if(img.src!==src)img.src=src;
    if(typeof img.decode==='function'){
      try{await img.decode()}catch(e){if(!img.complete)throw e}
    }else if(!img.complete){
      await new Promise((resolve,reject)=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',()=>reject(new Error('image decode failed')),{once:true});
      });
    }
    img.dataset.loaded='1';
    window.dispatchEvent(new CustomEvent('blis:reputationartready'));
    return true;
  }catch(e){
    console.error('BLIS exact reputation artwork:',e);
    img.dataset.loaded='0';
    return false;
  }
}
function apply(){
  if(applyPromise)return applyPromise;
  applyPromise=doApply().finally(()=>{applyPromise=null});
  return applyPromise;
}
function schedule(){requestAnimationFrame(()=>apply())}
function refresh(){if(isAromaContext())schedule();else cleanupAll()}
function init(){
  refresh();
  const root=document.getElementById('reputationBody');
  if(root&&!observer){
    observer=new MutationObserver(()=>refresh());
    observer.observe(root,{childList:true,subtree:true});
  }
  document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]'))refresh()},true);
  document.getElementById('clientSel')?.addEventListener('change',refresh);
  window.addEventListener('blis:clientdata',refresh);
}
const api={apply,cleanup:cleanupAll};
window.BLISReputationExactArtV50=api;
window.BLISReputationExactArtV49=api;
window.BLISReputationExactArtV48=api;
window.BLISReputationExactArtV47=api;
window.BLISReputationExactArtV46=api;
window.BLISReputationExactArtV44=api;
window.BLISReputationExactArtV42=api;
window.BLISReputationExactArtV41=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

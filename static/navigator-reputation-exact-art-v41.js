/* BLIS Navigator — Aroma-only reputation artwork. Never leaks Aroma visuals into other clients. */
(function(){
'use strict';
if(window.__BLISReputationExactArtV49)return;window.__BLISReputationExactArtV49=true;
const PARTS=[1,2,3,4].map(n=>`/reputation-aroma-exact-v2-0${n}.js?v=20260819-exact47`);
let srcPromise=null,observer=null,applyPromise=null;
function client(){
  try{const q=new URLSearchParams(location.search).get('client');if(q)return q}catch(_){ }
  return String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma');
}
function cleanup(t){
  if(!t)return;
  t.classList.remove('rp-exact-aroma');
  t.removeAttribute('data-exact-client');
  t.querySelector('.rp-exact-art')?.remove();
  t.querySelector('.rp-exact-label')?.remove();
}
function source(){
  if(srcPromise)return srcPromise;
  srcPromise=Promise.all(PARTS.map(u=>fetch(u,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`art ${r.status} ${u}`);return r.text()})))
    .then(a=>'data:image/webp;base64,'+a.join('').replace(/\s+/g,''));
  return srcPromise;
}
async function doApply(){
  const t=document.querySelector('#reputationBody .rp-totem');
  if(!t)return false;
  const c=client();
  if(c!=='aroma'){
    cleanup(t);
    return false;
  }
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
    const src=await source();if(img.src!==src)img.src=src;
    if(typeof img.decode==='function'){try{await img.decode()}catch(e){if(!img.complete)throw e}}
    else if(!img.complete){await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',()=>reject(new Error('image decode failed')),{once:true})})}
    img.dataset.loaded='1';window.dispatchEvent(new CustomEvent('blis:reputationartready'));return true;
  }catch(e){console.error('BLIS exact reputation artwork:',e);img.dataset.loaded='0';return false}
}
function apply(){if(applyPromise)return applyPromise;applyPromise=doApply().finally(()=>{applyPromise=null});return applyPromise}
function schedule(){requestAnimationFrame(()=>apply())}
function init(){
  schedule();
  const root=document.getElementById('reputationBody');
  if(root&&!observer){observer=new MutationObserver(()=>schedule());observer.observe(root,{childList:true,subtree:true})}
  document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]'))schedule()},true);
  document.getElementById('clientSel')?.addEventListener('change',schedule);
  window.addEventListener('blis:clientdata',schedule);
}
window.BLISReputationExactArtV49={apply};
window.BLISReputationExactArtV48={apply};
window.BLISReputationExactArtV47={apply};
window.BLISReputationExactArtV46={apply};
window.BLISReputationExactArtV44={apply};
window.BLISReputationExactArtV42={apply};
window.BLISReputationExactArtV41={apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

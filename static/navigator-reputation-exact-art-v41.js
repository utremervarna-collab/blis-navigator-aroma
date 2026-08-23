/* BLIS Navigator — canonical Reputation artwork for every client. */
(function(){
'use strict';
if(window.__BLISReputationExactArtV61)return;
window.__BLISReputationExactArtV61=true;

const PARTS=[1,2,3,4].map(n=>`/reputation-aroma-exact-v2-0${n}.js?v=20260819-exact47`);
const CLIENTS={
  'aroma':'Aroma Cosmetics',
  'mollox':'MOLLOX България',
  'bolyarka':'Болярка',
  'astor-garden':'Astor Garden',
  'varna-towers':'Varna Towers'
};
let srcPromise=null,observer=null,applyPromise=null;

function valid(v){v=String(v||'').trim();return CLIENTS[v]?v:''}
function activeClient(){
  // The live UI state is authoritative. URL query is only a fallback because
  // the Navigator can switch clients without rewriting the current URL.
  try{const v=valid(typeof slug!=='undefined'?slug:'');if(v)return v}catch(_){}
  try{const s=document.getElementById('clientSel');const v=valid(s?.value);if(v)return v}catch(_){}
  try{const current=document.querySelector('.client-option.active,[data-client-key].active');const v=valid(current?.dataset?.clientKey||current?.dataset?.client);if(v)return v}catch(_){}
  try{const v=valid(window.BLIS_CLIENT_SCOPE);if(v)return v}catch(_){}
  try{const v=valid(window.BLIS_INITIAL_CLIENT);if(v)return v}catch(_){}
  try{const v=valid(document.body?.dataset?.client);if(v)return v}catch(_){}
  try{const v=valid(new URLSearchParams(location.search).get('client'));if(v)return v}catch(_){}
  return 'aroma';
}
function cleanup(t){
  if(!t)return;
  t.classList.remove('rp-exact-aroma','rp-exact-template');
  t.removeAttribute('data-exact-client');
  t.querySelectorAll('.rp-exact-art,.rp-exact-label').forEach(x=>x.remove());
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
  const t=document.querySelector('#reputationBody .rp-totem');
  if(!t)return false;
  const c=activeClient();
  const labelText=CLIENTS[c]||c;
  t.classList.remove('rp-exact-aroma');
  t.classList.add('rp-exact-template');
  t.dataset.exactClient=c;

  let img=t.querySelector('.rp-exact-art');
  if(!img){
    img=document.createElement('img');
    img.className='rp-exact-art';
    img.decoding='async';
    img.loading='eager';
    img.draggable=false;
    t.appendChild(img);
  }
  img.alt=labelText;
  img.dataset.client=c;

  let label=t.querySelector('.rp-exact-label');
  if(!label){
    label=document.createElement('div');
    label.className='rp-exact-label';
    t.appendChild(label);
  }
  label.dataset.client=c;
  label.textContent=labelText;

  if(img.dataset.loaded!=='1'){
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
    }catch(e){
      console.error('BLIS reputation artwork:',e);
      img.dataset.loaded='0';
      return false;
    }
  }
  window.dispatchEvent(new CustomEvent('blis:reputationartready',{detail:{client:c}}));
  return true;
}
function apply(){
  if(applyPromise)return applyPromise;
  applyPromise=doApply().finally(()=>{applyPromise=null});
  return applyPromise;
}
function schedule(){requestAnimationFrame(()=>apply())}
function init(){
  schedule();
  const root=document.getElementById('reputationBody');
  if(root&&!observer){observer=new MutationObserver(()=>schedule());observer.observe(root,{childList:true,subtree:true})}
  document.addEventListener('click',e=>{if(e.target?.closest?.('#nav [data-page="reputation"],.client-option,[data-client-key]'))setTimeout(schedule,0)},true);
  document.getElementById('clientSel')?.addEventListener('change',()=>setTimeout(schedule,0));
  window.addEventListener('blis:clientdata',schedule);
}
const api={apply,activeClient};
window.BLISReputationExactArtV61=api;
window.BLISReputationExactArtV60=api;
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

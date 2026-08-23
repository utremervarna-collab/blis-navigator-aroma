/* BLIS Navigator — canonical Reputation artwork for every client. */
(function(){
'use strict';
if(window.__BLISReputationExactArtV62)return;
window.__BLISReputationExactArtV62=true;

const PARTS=[1,2,3,4].map(n=>`/reputation-aroma-exact-v2-0${n}.js?v=20260823-reputation62`);
const CLIENTS={
  'aroma':'Aroma Cosmetics',
  'mollox':'MOLLOX България',
  'bolyarka':'Болярка',
  'astor-garden':'Astor Garden',
  'varna-towers':'Varna Towers'
};
let srcPromise=null,observer=null,applyPromise=null,forcedClient='';

function valid(v){v=String(v||'').trim();return CLIENTS[v]?v:''}
function fromData(){
  try{const v=valid(window.D?.client||window.D?.slug);if(v)return v}catch(_){}
  try{const v=valid(typeof D!=='undefined'?(D?.client||D?.slug):'');if(v)return v}catch(_){}
  return '';
}
function activeClient(){
  // Explicit UI/client-data state wins. URL/initial values are fallbacks only.
  let v=valid(forcedClient);if(v)return v;
  try{const current=document.querySelector('.client-option.active,[data-client-key][aria-selected="true"]');v=valid(current?.dataset?.clientKey||current?.dataset?.client);if(v)return v}catch(_){}
  v=fromData();if(v)return v;
  try{const s=document.getElementById('clientSel');v=valid(s?.value);if(v)return v}catch(_){}
  try{v=valid(document.body?.dataset?.client);if(v)return v}catch(_){}
  try{v=valid(typeof slug!=='undefined'?slug:'');if(v)return v}catch(_){}
  try{v=valid(window.BLIS_CLIENT_SCOPE);if(v)return v}catch(_){}
  try{v=valid(window.BLIS_INITIAL_CLIENT);if(v)return v}catch(_){}
  try{v=valid(new URLSearchParams(location.search).get('client'));if(v)return v}catch(_){}
  return 'aroma';
}
function syncForcedFromUI(target){
  try{
    const o=target?.closest?.('[data-client-key]');
    const v=valid(o?.dataset?.clientKey);
    if(v){forcedClient=v;document.body.dataset.client=v;const s=document.getElementById('clientSel');if(s)s.value=v;return v}
  }catch(_){}
  return '';
}
function cleanup(t){
  if(!t)return;
  t.classList.remove('rp-exact-aroma','rp-exact-template');
  t.removeAttribute('data-exact-client');
  t.querySelectorAll('.rp-exact-art,.rp-exact-label,.rp-exact-mask').forEach(x=>x.remove());
}
function source(){
  if(srcPromise)return srcPromise;
  srcPromise=Promise.all(PARTS.map(u=>fetch(u,{cache:'no-store'}).then(r=>{
    if(!r.ok)throw new Error(`art ${r.status} ${u}`);
    return r.text();
  }))).then(a=>'data:image/webp;base64,'+a.join('').replace(/\s+/g,''));
  return srcPromise;
}
function ensureMask(t,c){
  let mask=t.querySelector('.rp-exact-mask');
  if(!mask){mask=document.createElement('div');mask.className='rp-exact-mask';t.appendChild(mask)}
  mask.dataset.client=c;
  return mask;
}
async function doApply(){
  const t=document.querySelector('#reputationBody .rp-totem');
  if(!t)return false;
  const c=activeClient();
  const labelText=CLIENTS[c]||c;
  t.classList.remove('rp-exact-aroma');
  t.classList.add('rp-exact-template');
  t.dataset.exactClient=c;
  document.body.dataset.client=c;

  let img=t.querySelector('.rp-exact-art');
  if(!img){
    img=document.createElement('img');
    img.className='rp-exact-art';
    img.decoding='async';img.loading='eager';img.draggable=false;t.appendChild(img);
  }
  img.alt=labelText;img.dataset.client=c;

  // Opaque mask sits above the source artwork's original badge text.
  // This guarantees that non-Aroma clients can never expose the Aroma label.
  ensureMask(t,c);

  let label=t.querySelector('.rp-exact-label');
  if(!label){label=document.createElement('div');label.className='rp-exact-label';t.appendChild(label)}
  label.dataset.client=c;label.textContent=labelText;

  if(img.dataset.loaded!=='1'){
    try{
      const src=await source();
      if(img.src!==src)img.src=src;
      if(typeof img.decode==='function'){try{await img.decode()}catch(e){if(!img.complete)throw e}}
      else if(!img.complete){await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',()=>reject(new Error('image decode failed')),{once:true})})}
      img.dataset.loaded='1';
    }catch(e){console.error('BLIS reputation artwork:',e);img.dataset.loaded='0';return false}
  }

  // Final hard guard: DOM text inside the reputation artwork must match active client.
  const finalClient=activeClient();
  if(finalClient!==c){forcedClient=finalClient;return doApply()}
  label.textContent=CLIENTS[finalClient]||finalClient;
  label.dataset.client=finalClient;
  t.dataset.exactClient=finalClient;
  img.dataset.client=finalClient;
  const mask=t.querySelector('.rp-exact-mask');if(mask)mask.dataset.client=finalClient;
  window.dispatchEvent(new CustomEvent('blis:reputationartready',{detail:{client:finalClient}}));
  return true;
}
function apply(){if(applyPromise)return applyPromise;applyPromise=doApply().finally(()=>{applyPromise=null});return applyPromise}
function schedule(delay=0){setTimeout(()=>requestAnimationFrame(()=>apply()),delay)}
function init(){
  try{forcedClient=valid(document.querySelector('.client-option.active,[data-client-key][aria-selected="true"]')?.dataset?.clientKey)||fromData()||valid(document.getElementById('clientSel')?.value)||valid(document.body?.dataset?.client)||''}catch(_){}
  schedule();
  const root=document.getElementById('reputationBody');
  if(root&&!observer){observer=new MutationObserver(()=>schedule(20));observer.observe(root,{childList:true,subtree:true})}
  document.addEventListener('click',e=>{
    const v=syncForcedFromUI(e.target);
    if(v)schedule(80);
    else if(e.target?.closest?.('#nav [data-page="reputation"]'))schedule(30);
  },true);
  document.getElementById('clientSel')?.addEventListener('change',e=>{const v=valid(e.target?.value);if(v){forcedClient=v;document.body.dataset.client=v}schedule(30)});
  window.addEventListener('blis:clientdata',e=>{
    const v=valid(e?.detail?.client||e?.detail?.slug)||fromData();
    if(v){forcedClient=v;document.body.dataset.client=v;const s=document.getElementById('clientSel');if(s)s.value=v}
    schedule(40);
  });
  // Reconcile after client switch/render cycles from legacy modules.
  setInterval(()=>{const v=fromData()||valid(document.querySelector('.client-option.active,[data-client-key][aria-selected="true"]')?.dataset?.clientKey);if(v&&v!==forcedClient){forcedClient=v;schedule(0)}},700);
}
const api={apply,activeClient};
window.BLISReputationExactArtV62=api;
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

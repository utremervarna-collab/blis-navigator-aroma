/* Wirello Market — canonical Navigator state hydrator.
   Runs after app.js and binds the demo dataset to the real D/S/Q/A/H state. */
(function(){
'use strict';
const q=new URLSearchParams(location.search);
if(q.get('client')!=='wirello' && window.BLIS_CLIENT_SCOPE!=='wirello' && window.BLIS_INITIAL_CLIENT!=='wirello')return;
if(window.__WIRELLO_STATE_FORCE__)return;window.__WIRELLO_STATE_FORCE__=true;

const get=p=>fetch(p,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(p+' '+r.status);return r.json()});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function forceIdentity(){
  window.BLIS_INITIAL_CLIENT='wirello';
  window.BLIS_CLIENT_SCOPE='wirello';
  document.body.dataset.client='wirello';
  try{slug='wirello'}catch(_){window.slug='wirello'}
  const sel=document.getElementById('clientSel');
  if(sel){
    if(!sel.querySelector('option[value="wirello"]')){
      const o=document.createElement('option');o.value='wirello';o.textContent='Wirello Market';sel.insertBefore(o,sel.firstChild);
    }
    sel.value='wirello';
  }
  const name=document.querySelector('.client-brand-name');if(name)name.textContent='Wirello Market';
  const type=document.querySelector('.client-brand-type');if(type)type.textContent='Омниканален ритейл / FMCG';
  const mark=document.querySelector('.client-brand-mark');if(mark)mark.textContent='WM';
  const status=document.querySelector('.client-brand-status');if(status)status.textContent='ДЕМО ПРОФИЛ • синтетични данни';
}

function bindState(d,s,q,a,h){
  try{D=d}catch(_){window.D=d}
  try{S=s}catch(_){window.S=s}
  try{Q=q}catch(_){window.Q=q}
  try{A=a}catch(_){window.A=a}
  try{H=h}catch(_){window.H=h}
  window.D=d;window.S=s;window.Q=q;window.A=a;window.H=h;
  forceIdentity();
}

function rerender(){
  try{window.renderAll?.()}catch(e){console.warn('Wirello renderAll',e)}
  try{window.BLISOverviewMaster?.render?.()}catch(_){}
  try{window.BLISSocialMaster?.render?.()}catch(_){}
  try{window.BLISDigitalMaster?.render?.()}catch(_){}
  try{window.BLISReputationMaster?.render?.()}catch(_){}
  try{window.BLISAttitudesMasterV2?.mount?.()}catch(_){}
  try{window.BLISCompetitionPageV12?.enhance?.()}catch(_){}
  const active=document.querySelector('.page.active')?.id||'overview';
  try{if(typeof window.refGo==='function')window.refGo(active)}catch(_){}
  window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:'wirello',forced:true}}));
}

async function hydrate(){
  forceIdentity();
  const [d,s,q,a,h]=await Promise.all([
    get('/api/clients/wirello/dashboard'),
    get('/api/clients/wirello/sources'),
    get('/api/clients/wirello/data-quality'),
    get('/api/clients/wirello/activity'),
    get('/api/clients/wirello/history')
  ]);
  if(!d || Number(d.blis_index||0)<=0)throw new Error('Wirello dashboard dataset is empty');
  if(!Array.isArray(s)||!s.length)throw new Error('Wirello sources are empty');
  if(!Array.isArray(a)||!a.length)throw new Error('Wirello activity is empty');
  if(!Array.isArray(h)||h.length<30)throw new Error('Wirello history is incomplete');
  bindState(d,s,q,a,h);
  rerender();
  // Some legacy boot code finishes a little later. Re-assert the same canonical
  // state briefly so it cannot replace Wirello with an empty/default client.
  for(const delay of [120,350,800,1500,2600]){
    await sleep(delay);
    bindState(d,s,q,a,h);
    rerender();
  }
  document.body.dataset.wirelloReady='1';
  window.__WIRELLO_DATA_READY__={blis:d.blis_index,sources:s.length,activity:a.length,history:h.length,competitors:(d.competitors||[]).length};
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>hydrate().catch(e=>console.error('Wirello state hydration failed',e)),{once:true});
else hydrate().catch(e=>console.error('Wirello state hydration failed',e));
})();

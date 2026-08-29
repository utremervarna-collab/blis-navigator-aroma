/* BLIS Navigator — canonical data loader v1.
   Data only. Never renders analytical page UI. */
(function(){
'use strict';
if(window.__BLIS_DATA_LOADER_V1)return;window.__BLIS_DATA_LOADER_V1=true;
const valid=new Set(['aroma','bolyarka','varna-towers','mollox','wirello','everbet','astor-garden']);
let seq=0,busy=null,current='';
function key(input){
  if(valid.has(input))return input;
  try{const q=new URLSearchParams(location.search).get('client');if(valid.has(q))return q}catch(_){}
  const b=document.body?.dataset?.client;if(valid.has(b))return b;
  const s=document.getElementById('clientSel')?.value;if(valid.has(s))return s;
  return 'aroma';
}
async function json(url,fallback){try{const r=await fetch(url,{cache:'no-store',credentials:'same-origin'});if(!r.ok)return fallback;return await r.json()}catch(_){return fallback}}
function publish(k,d,s,q,a,h){
  window.slug=k;window.D=d||{};window.S=Array.isArray(s)?s:[];window.Q=q||{};window.A=Array.isArray(a)?a:[];window.H=Array.isArray(h)?h:[];
  if(document.body)document.body.dataset.client=k;
  const sel=document.getElementById('clientSel');if(sel&&sel.value!==k)sel.value=k;
  const note=document.getElementById('clientNote');if(note)note.textContent=window.D?.note||'';
  const sync=document.getElementById('lastSync');if(sync){const raw=window.D?.data_updated||window.D?.updated_at||'';const dt=new Date(raw);sync.textContent=raw&&!Number.isNaN(dt.getTime())?dt.toLocaleString('bg-BG'):'—'}
  window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:k,dashboard:window.D,sources:window.S,quality:window.Q,activity:window.A,history:window.H,canonical:true}}));
}
async function load(input,force=false){
  const k=key(input);const my=++seq;
  if(!force&&busy&&current===k)return busy;current=k;
  busy=Promise.all([
    json(`/api/clients/${encodeURIComponent(k)}/dashboard`,{}),
    json(`/api/clients/${encodeURIComponent(k)}/sources`,[]),
    json(`/api/clients/${encodeURIComponent(k)}/data-quality`,{}),
    json(`/api/clients/${encodeURIComponent(k)}/activity`,[]),
    json(`/api/clients/${encodeURIComponent(k)}/history`,[])
  ]).then(([d,s,q,a,h])=>{if(my!==seq)return null;publish(k,d,s,q,a,h);busy=null;return{client:k,D:d,S:s,Q:q,A:a,H:h}}).catch(e=>{busy=null;console.error('BLIS canonical data load failed',e);return null});
  return busy;
}
function bind(){const sel=document.getElementById('clientSel');if(sel&&!sel.dataset.canonicalDataLoader){sel.dataset.canonicalDataLoader='1';sel.addEventListener('change',e=>load(e.target.value,true))}}
window.BLISDataLoaderV1={load,refresh:()=>load(key(),true),current:()=>key()};
window.load=()=>load(key(),true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

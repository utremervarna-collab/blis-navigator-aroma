/* BLIS Navigator — canonical data loader v1.
   Data only. Never renders analytical page UI. */
(function(){
'use strict';
if(window.__BLIS_DATA_LOADER_V1)return;window.__BLIS_DATA_LOADER_V1=true;
const valid=new Set(['aroma','bolyarka','varna-towers','delta-planet','black-sea-center','mollox','wirello','everbet','astor-garden']);
const CACHE_MS=30000;
let seq=0,busy=null,current='',lastPublishedSignature='';
const cache=new Map();
function key(input){
  if(valid.has(input))return input;
  try{const q=new URLSearchParams(location.search).get('client');if(valid.has(q))return q}catch(_){}
  const b=document.body?.dataset?.client;if(valid.has(b))return b;
  const s=document.getElementById('clientSel')?.value;if(valid.has(s))return s;
  return 'aroma';
}
async function json(url,fallback){try{const r=await fetch(url,{cache:'no-store',credentials:'same-origin'});if(!r.ok)return fallback;return await r.json()}catch(_){return fallback}}
function publish(k,d,s,q,a,h,emit=true){
  const signature=JSON.stringify([k,d,s,q,a,h]);
  const changed=signature!==lastPublishedSignature;
  window.slug=k;window.D=d||{};window.S=Array.isArray(s)?s:[];window.Q=q||{};window.A=Array.isArray(a)?a:[];window.H=Array.isArray(h)?h:[];
  if(document.body)document.body.dataset.client=k;
  const sel=document.getElementById('clientSel');if(sel&&sel.value!==k)sel.value=k;
  const note=document.getElementById('clientNote');if(note)note.textContent=window.D?.note||'';
  const sync=document.getElementById('lastSync');if(sync){const raw=window.D?.data_updated||window.D?.updated_at||'';const dt=new Date(raw);sync.textContent=raw&&!Number.isNaN(dt.getTime())?dt.toLocaleString('bg-BG'):'—'}
  if(changed&&emit){lastPublishedSignature=signature;window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:k,dashboard:window.D,sources:window.S,quality:window.Q,activity:window.A,history:window.H,canonical:true}}))}
  else if(changed){lastPublishedSignature=signature}
}
async function load(input,force=false){
  const k=key(input),now=Date.now();
  if(!force){
    const hit=cache.get(k);
    if(hit&&now-hit.at<CACHE_MS){const v=hit.value;publish(k,v.D,v.S,v.Q,v.A,v.H,true);return v}
    if(busy&&current===k)return busy;
  }
  const my=++seq;current=k;
  const enc=encodeURIComponent(k);
  const dashboardP=json(`/api/clients/${enc}/dashboard`,{});
  const sourcesP=json(`/api/clients/${enc}/sources`,[]);
  const qualityP=json(`/api/clients/${enc}/data-quality`,{});
  const activityP=json(`/api/clients/${enc}/activity`,[]);
  const historyP=json(`/api/clients/${enc}/history`,[]);
  busy=(async()=>{
    const d=await dashboardP;
    if(my!==seq)return null;
    const same=window.slug===k;
    publish(k,d,same?window.S:[],same?window.Q:{},same?window.A:[],same?window.H:[],true);
    const [s,q,a,h]=await Promise.all([sourcesP,qualityP,activityP,historyP]);
    if(my!==seq)return null;
    const value={client:k,D:d,S:s,Q:q,A:a,H:h};
    cache.set(k,{at:Date.now(),value});
    // Hydrate the auxiliary globals without firing a second canonical render.
    // Route renderers read these globals when opened, while the active page stays stable.
    publish(k,d,s,q,a,h,false);
    window.dispatchEvent(new CustomEvent('blis:clientaux',{detail:{client:k,sources:s,quality:q,activity:a,history:h,canonical:true}}));
    return value;
  })().catch(e=>{console.error('BLIS canonical data load failed',e);return null}).finally(()=>{if(my===seq)busy=null});
  return busy;
}
function bind(){const sel=document.getElementById('clientSel');if(sel&&!sel.dataset.canonicalDataLoader){sel.dataset.canonicalDataLoader='1';sel.addEventListener('change',e=>load(e.target.value,true))}}
window.BLISDataLoaderV1={load,refresh:()=>load(key(),true),current:()=>key()};
window.load=()=>load(key(),true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

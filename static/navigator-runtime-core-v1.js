/* BLIS Navigator — event-driven runtime core v6.
   Owns only client/data synchronization and one-time module loading.
   No polling, no recurring repaint loop, no chart mutation. */
(function(){
'use strict';
if(window.__BLIS_RUNTIME_CORE_V6)return;window.__BLIS_RUNTIME_CORE_V6=true;

const CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox','wirello']);
function initialClient(){
  try{const q=new URLSearchParams(location.search).get('client');if(CLIENTS.has(q))return q}catch(_){ }
  try{if(CLIENTS.has(window.BLIS_INITIAL_CLIENT))return window.BLIS_INITIAL_CLIENT}catch(_){ }
  try{if(CLIENTS.has(document.body?.dataset?.client))return document.body.dataset.client}catch(_){ }
  return 'aroma';
}
function syncGlobals(){try{window.D=D}catch(_){ }try{window.S=S}catch(_){ }try{window.Q=Q}catch(_){ }try{window.A=A}catch(_){ }try{window.H=H}catch(_){ }try{window.BLIS_CURRENT_SLUG=slug}catch(_){ }}
function syncChrome(){syncGlobals();try{const x=typeof dossier==='function'?dossier():null;if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);const note=document.getElementById('clientNote');if(note)note.textContent=window.D?.note||x?.descriptor||'';const sync=document.getElementById('lastSync');if(sync)sync.textContent=window.D?.data_updated?new Date(window.D.data_updated).toLocaleString('bg-BG'):'активна синхронизация'}catch(e){console.warn('BLIS runtime chrome sync:',e?.message||e)}}
const legacyLoad=window.load;
if(typeof legacyLoad==='function'&&!legacyLoad.__blisRuntimeCore){const wrapped=async function(){const wanted=initialClient();try{slug=wanted}catch(_){ }const sel=document.getElementById('clientSel');if(sel)sel.value=wanted;return legacyLoad.apply(this,arguments)};wrapped.__blisRuntimeCore=true;window.load=wrapped}
window.renderAll=function(){syncChrome();let c='';try{c=typeof slug!=='undefined'?slug:initialClient()}catch(_){c=initialClient()}window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:c,slug:c}}))};
function releasePrepaint(){requestAnimationFrame(()=>requestAnimationFrame(()=>{document.getElementById('blisPrepaintGuard')?.remove();const active=document.querySelector('.page.active');if(active){active.style.setProperty('visibility','visible','important');active.style.setProperty('opacity','1','important')}}))}
function boot(){syncChrome();releasePrepaint();window.addEventListener('blis:clientdata',()=>syncChrome())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* BLIS Navigator — event-driven runtime core v3.
   Owns only client/data synchronization and one-time module loading.
   No polling, no recurring repaint loop, no chart mutation. */
(function(){
'use strict';
if(window.__BLIS_RUNTIME_CORE_V3)return;window.__BLIS_RUNTIME_CORE_V3=true;

const CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox']);
function initialClient(){
  try{const q=new URLSearchParams(location.search).get('client');if(CLIENTS.has(q))return q}catch(_){ }
  try{if(CLIENTS.has(window.BLIS_INITIAL_CLIENT))return window.BLIS_INITIAL_CLIENT}catch(_){ }
  try{if(CLIENTS.has(document.body?.dataset?.client))return document.body.dataset.client}catch(_){ }
  return 'aroma';
}
function syncGlobals(){
  try{window.D=D}catch(_){ }
  try{window.S=S}catch(_){ }
  try{window.Q=Q}catch(_){ }
  try{window.A=A}catch(_){ }
  try{window.H=H}catch(_){ }
  try{window.BLIS_CURRENT_SLUG=slug}catch(_){ }
}
function syncChrome(){
  syncGlobals();
  try{
    const x=typeof dossier==='function'?dossier():null;
    if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
    if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
    const note=document.getElementById('clientNote');if(note)note.textContent=window.D?.note||x?.descriptor||'';
    const sync=document.getElementById('lastSync');if(sync)sync.textContent=window.D?.data_updated?new Date(window.D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
  }catch(e){console.error('BLIS runtime chrome sync failed',e)}
}
const legacyLoad=window.load;
if(typeof legacyLoad==='function'&&!legacyLoad.__blisRuntimeCore){
  const wrapped=async function(){
    const wanted=initialClient();
    try{slug=wanted}catch(_){ }
    const sel=document.getElementById('clientSel');if(sel)sel.value=wanted;
    return legacyLoad.apply(this,arguments);
  };
  wrapped.__blisRuntimeCore=true;window.load=wrapped;
}
window.renderAll=function(){
  syncChrome();
  let c='';try{c=typeof slug!=='undefined'?slug:initialClient()}catch(_){c=initialClient()}
  window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:c,slug:c}}));
};
function loadScript(id,src){
  if(document.getElementById(id)||[...document.scripts].some(s=>s.src&&s.src.includes(src.split('?')[0])))return;
  const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.head.appendChild(s);
}
function loadStyle(id,href){
  if(document.getElementById(id)||[...document.styleSheets].some(s=>{try{return s.href&&s.href.includes(href.split('?')[0])}catch(_){return false}}))return;
  const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l);
}
function loadOwners(){
  const v='20260824-core3';
  loadScript('blisGlobalLiveScript','/navigator-global-live.js?v='+v);
  loadScript('blisUITerminologyScript','/navigator-ui-terminology.js?v='+v);
  loadScript('blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v='+v);
  loadScript('blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v='+v);
  loadScript('blisCompetitionMotionV6Script','/navigator-competition-motion-fix-v6.js?v='+v);
  loadScript('blisCompetitionIntelligenceV9Script','/navigator-competition-intelligence-v9.js?v='+v);
  loadScript('blisCompetitionEnvironmentV10Script','/navigator-competition-environment-v10.js?v='+v);
  loadScript('blisCompetitionPageV11Script','/navigator-competition-page-v11.js?v='+v);
  loadScript('blisCompetitionPageV12Script','/navigator-competition-page-v12.js?v='+v);
  loadStyle('blisReputationMasterStyle','/navigator-reputation-master.css?v='+v);
  loadScript('blisPageStateScript','/navigator-page-state.js?v='+v);
  loadScript('blisSocialInteractiveScript','/navigator-social-interactive.js?v='+v);
  loadScript('blisSocialBootstrapScript','/navigator-social-bootstrap.js?v='+v);
  loadScript('blisReputationMasterScript','/navigator-reputation-master.js?v='+v);
  loadScript('blisReputationBootstrapScript','/navigator-reputation-bootstrap.js?v='+v);
  loadStyle('blisClientValueStyle','/navigator-client-value-pages-v1.css?v='+v);
  loadScript('blisClientValueScript','/navigator-client-value-pages-v1.js?v='+v);
}
function releasePrepaint(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.getElementById('blisPrepaintGuard')?.remove();
    const active=document.querySelector('.page.active');
    if(active){active.style.setProperty('visibility','visible','important');active.style.setProperty('opacity','1','important')}
  }));
}
function boot(){
  loadOwners();syncChrome();releasePrepaint();
  window.addEventListener('blis:clientdata',()=>syncChrome());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

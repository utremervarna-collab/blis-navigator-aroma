/* BLIS Navigator — lean runtime bridge. Data/API ownership only; no page hiding. */
(function(){
'use strict';
if(window.__BLIS_RUNTIME_BRIDGE_1800)return;window.__BLIS_RUNTIME_BRIDGE_1800=true;

const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
function initialClient(){try{const q=new URLSearchParams(location.search).get('client');if(q&&clients.has(q))return q}catch(_){}return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null}

const legacyLoad=window.load;
if(typeof legacyLoad==='function'){
  window.load=async function(){
    const wanted=initialClient();
    if(wanted){try{slug=wanted}catch(_){}const sel=document.getElementById('clientSel');if(sel)sel.value=wanted;document.body.dataset.client=wanted}
    return legacyLoad.apply(this,arguments);
  };
}

window.renderAll=function(){
  try{
    try{window.D=D;window.S=S;window.Q=Q;window.A=A;window.H=H}catch(_){}
    const x=typeof dossier==='function'?dossier():null;
    if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
    if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
    const note=document.getElementById('clientNote');if(note)note.textContent=window.D?.note||x?.descriptor||'';
    const sync=document.getElementById('lastSync');if(sync)sync.textContent=window.D?.data_updated?new Date(window.D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:typeof slug!=='undefined'?slug:null}}));
  }catch(e){console.error('BLIS bridge render state failed',e)}
};

function loadScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.head.appendChild(s)}
const v='20260821-1800';
loadScript('blisGlobalLiveScript','/navigator-global-live.js?v='+v);
loadScript('blisUITerminologyScript','/navigator-ui-terminology.js?v='+v);
loadScript('blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v='+v);
loadScript('blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v='+v);
loadScript('blisCompetitionMotionV6Script','/navigator-competition-motion-fix-v6.js?v='+v);
loadScript('blisCompetitionIntelligenceV9Script','/navigator-competition-intelligence-v9.js?v='+v);
loadScript('blisCompetitionEnvironmentV10Script','/navigator-competition-environment-v10.js?v='+v);
loadScript('blisCompetitionPageV11Script','/navigator-competition-page-v11.js?v='+v);
loadScript('blisCompetitionPageV12Script','/navigator-competition-page-v12.js?v='+v);
})();

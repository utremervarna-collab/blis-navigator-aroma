/* BLIS Navigator — deterministic production runtime bridge. */
(function(){
'use strict';

if(!document.getElementById('blisPrepaintGuard')){
  const guard=document.createElement('style');
  guard.id='blisPrepaintGuard';
  guard.textContent='.page{visibility:hidden!important}.page.active{min-height:560px!important}';
  document.head.appendChild(guard);
}

/* dashboard.html still contains a static navigator-final-v16.js include.
   Block that copy; a fresh cache-busted final layer is loaded only after all
   legacy scripts and the V15 owner have finished. */
window.__BLIS_FINAL_V16='deferred';

const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
const initialClient=()=>{
  try{const q=new URLSearchParams(location.search).get('client');if(q&&clients.has(q))return q}catch(_){}
  return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
};

const legacyLoad=window.load;
if(typeof legacyLoad==='function'){
  window.load=async function(){
    const wanted=initialClient();
    if(wanted){try{slug=wanted}catch(_){}const sel=document.getElementById('clientSel');if(sel)sel.value=wanted}
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

function loadScript(id,src){
  return new Promise((resolve,reject)=>{
    const old=document.getElementById(id);
    if(old){resolve(old);return}
    const s=document.createElement('script');s.id=id;s.src=src;s.async=false;
    s.onload=()=>resolve(s);s.onerror=()=>reject(new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
}

let started=false;
async function startFinalStack(){
  if(started)return;started=true;
  const v='20260821-1416';
  const files=[
    ['blisGlobalLiveScript','/navigator-global-live.js?v='+v],
    ['blisUITerminologyScript','/navigator-ui-terminology.js?v='+v],
    ['blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v='+v],
    ['blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v='+v],
    ['blisCompetitionMotionV6Script','/navigator-competition-motion-fix-v6.js?v='+v],
    ['blisCompetitionIntelligenceV9Script','/navigator-competition-intelligence-v9.js?v='+v],
    ['blisCompetitionEnvironmentV10Script','/navigator-competition-environment-v10.js?v='+v],
    ['blisCompetitionPageV11Script','/navigator-competition-page-v11.js?v='+v],
    ['blisCompetitionPageV12Script','/navigator-competition-page-v12.js?v='+v],
    ['blisArchitectureV15Script','/navigator-architecture-v15.js?v='+v]
  ];
  try{
    for(const [id,src] of files)await loadScript(id,src);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    if(window.__BLIS_FINAL_V16==='deferred')delete window.__BLIS_FINAL_V16;
    await loadScript('blisFinalV16Runtime','/navigator-final-v16.js?v='+v);
    window.dispatchEvent(new CustomEvent('blis:finalstackready'));
  }catch(e){
    console.error('BLIS final stack failed',e);
    document.body.classList.add('blis-final-load-error');
  }
}

/* Critical ordering fix: wait until all static legacy modules in dashboard.html
   have finished. They render only while the page is hidden, so they can no longer
   flash for 1–4 seconds before the final interface. */
if(document.readyState==='complete')setTimeout(startFinalStack,0);
else window.addEventListener('load',()=>setTimeout(startFinalStack,0),{once:true});
})();
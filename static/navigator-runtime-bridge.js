/* BLIS Navigator — runtime compatibility bridge.
   Keeps app.js as the data/API loader while preventing legacy renderers
   from becoming visible before the current Navigator is mounted. */
(function(){
  'use strict';

  /* Pre-paint guard: old page renderers may still initialise later in dashboard.html,
     but they are never painted before the current Navigator takes ownership. */
  const guard=document.createElement('style');
  guard.id='blisPrepaintGuard';
  guard.textContent='.page{visibility:hidden!important}.page.active{min-height:560px!important}';
  document.head.appendChild(guard);

  const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
  const initialClient=()=>{
    try{
      const q=new URLSearchParams(location.search).get('client');
      if(q&&clients.has(q))return q;
    }catch(e){}
    return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
  };

  const legacyLoad=window.load;
  if(typeof legacyLoad==='function'){
    window.load=async function(){
      const wanted=initialClient();
      if(wanted){
        try{slug=wanted}catch(e){}
        const sel=document.getElementById('clientSel');
        if(sel)sel.value=wanted;
      }
      return legacyLoad();
    };
  }

  window.renderAll=function(){
    try{
      /* app.js keeps these as top-level lexical variables. Expose the same live
         objects to the current modules so they read the real observations/history. */
      try{window.D=D;window.S=S;window.Q=Q;window.A=A;window.H=H}catch(e){}
      const x=typeof dossier==='function'?dossier():null;
      if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
      if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
      const note=document.getElementById('clientNote');
      if(note)note.textContent=D?.note||x?.descriptor||'';
      const sync=document.getElementById('lastSync');
      if(sync)sync.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
      window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:typeof slug!=='undefined'?slug:null}}));
    }catch(e){console.error('BLIS bridge render state failed',e)}
  };

  function loadScript(id,src){
    if(document.getElementById(id))return;
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.async=false;
    document.head.appendChild(s);
  }
  const v='20260821-1008';
  loadScript('blisGlobalLiveScript','/navigator-global-live.js?v='+v);
  loadScript('blisUITerminologyScript','/navigator-ui-terminology.js?v='+v);
  loadScript('blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v='+v);
  loadScript('blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v='+v);
  loadScript('blisCompetitionMotionV6Script','/navigator-competition-motion-fix-v6.js?v='+v);
  loadScript('blisCompetitionIntelligenceV9Script','/navigator-competition-intelligence-v9.js?v='+v);
  loadScript('blisCompetitionEnvironmentV10Script','/navigator-competition-environment-v10.js?v='+v);
  loadScript('blisCompetitionPageV11Script','/navigator-competition-page-v11.js?v='+v);
  loadScript('blisCompetitionPageV12Script','/navigator-competition-page-v12.js?v='+v);
  loadScript('blisArchitectureV15Script','/navigator-architecture-v15.js?v='+v);
})();
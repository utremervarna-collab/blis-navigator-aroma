/* BLIS Navigator — runtime compatibility bridge.
   Keeps app.js as the data/API loader while preventing its legacy renderer
   from writing into the current Navigator DOM. */
(function(){
  'use strict';
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
      const x=typeof dossier==='function'?dossier():null;
      if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
      if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
      const note=document.getElementById('clientNote');
      if(note)note.textContent=D?.note||x?.descriptor||'';
      const sync=document.getElementById('lastSync');
      if(sync)sync.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'няма синхронизация';
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
  loadScript('blisGlobalLiveScript','/navigator-global-live.js?v=20260820-2215');
  loadScript('blisUITerminologyScript','/navigator-ui-terminology.js?v=20260820-2215');
  loadScript('blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v=20260820-2215');
  loadScript('blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v=20260820-2215');
})();

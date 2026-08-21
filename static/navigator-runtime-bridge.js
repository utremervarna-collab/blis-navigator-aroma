/* BLIS Navigator — approved runtime bridge. Data owner only; page visuals stay in their approved master modules. */
(function(){
  'use strict';

  /* Stop the legacy routing layers before they boot. */
  window.__BLIS_ARCH_V15=true;
  window.__BLISDigitalRadarBoot=true;

  function inertMarker(attr){
    if(document.querySelector(`script[${attr}]`))return;
    const s=document.createElement('script');s.type='application/json';s.setAttribute(attr,'1');s.textContent='{}';document.head.appendChild(s);
  }
  inertMarker('data-blis-page-state');
  inertMarker('data-blis-social-bootstrap');
  inertMarker('data-blis-reputation-bootstrap');
  inertMarker('data-blis-reputation-boot');

  const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
  const initialClient=()=>{
    try{const q=new URLSearchParams(location.search).get('client');if(q&&clients.has(q))return q}catch(e){}
    return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
  };

  const legacyLoad=window.load;
  if(typeof legacyLoad==='function'){
    window.load=async function(){
      const wanted=initialClient();
      if(wanted){try{slug=wanted}catch(e){}const sel=document.getElementById('clientSel');if(sel)sel.value=wanted}
      return legacyLoad();
    };
  }

  window.renderAll=function(){
    try{
      try{window.D=D;window.S=S;window.Q=Q;window.A=A;window.H=H}catch(e){}
      const x=typeof dossier==='function'?dossier():null;
      if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
      if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
      const note=document.getElementById('clientNote');if(note)note.textContent=D?.note||x?.descriptor||'';
      const sync=document.getElementById('lastSync');if(sync)sync.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
      window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:typeof slug!=='undefined'?slug:null}}));
    }catch(e){console.error('BLIS approved bridge render state failed',e)}
  };

  function loadScript(id,src,attrs={}){
    if(document.getElementById(id))return document.getElementById(id);
    const s=document.createElement('script');s.id=id;s.src=src;s.async=false;Object.entries(attrs).forEach(([k,v])=>s.setAttribute(k,v));document.head.appendChild(s);return s;
  }
  function loadStyle(id,href,attrs={}){
    if(document.getElementById(id))return document.getElementById(id);
    const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;Object.entries(attrs).forEach(([k,v])=>l.setAttribute(k,v));document.head.appendChild(l);return l;
  }

  const v='20260821-approved1';
  loadScript('blisGlobalLiveScript','/navigator-global-live.js?v='+v);
  loadScript('blisUITerminologyScript','/navigator-ui-terminology.js?v='+v);
  loadScript('blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v='+v);
  loadScript('blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v='+v);
  loadScript('blisCompetitionMotionV6Script','/navigator-competition-motion-fix-v6.js?v='+v);
  loadScript('blisCompetitionIntelligenceV9Script','/navigator-competition-intelligence-v9.js?v='+v);
  loadScript('blisCompetitionEnvironmentV10Script','/navigator-competition-environment-v10.js?v='+v);
  loadScript('blisCompetitionPageV11Script','/navigator-competition-page-v11.js?v='+v);
  loadScript('blisCompetitionPageV12Script','/navigator-competition-page-v12.js?v='+v);

  loadStyle('blisReputationMasterCSS','/navigator-reputation-master.css?v='+v,{'data-blis-reputation-master':'1','data-blis-reputation-css':'1'});
  loadScript('blisReputationMasterScript','/navigator-reputation-master.js?v='+v,{'data-blis-reputation-master':'1'});
  loadScript('blisDigitalTruthScript','/navigator-digital-truth-fix.js?v='+v,{'data-blis-digital-truth':'1'});
  loadScript('blisDigitalInteractionsScript','/navigator-digital-interactions.js?v='+v,{'data-blis-digital-interactions':'1'});

  function loadRouter(){loadScript('blisApprovedRouterV1','/navigator-approved-router-v1.js?v='+v)}
  if(document.readyState==='complete')loadRouter();else window.addEventListener('load',loadRouter,{once:true});
})();
/* BLIS Navigator — runtime compatibility bridge.
   Keeps app.js as the data/API loader while preventing its legacy renderer
   from writing into the current Navigator DOM. */
(function(){
  'use strict';
  const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
  const pages=new Set(['overview','live','social','digital','reputation','market','competition','signals','reports','sources','history','timeline','profile','settings','help']);
  const initialClient=()=>{
    try{
      const q=new URLSearchParams(location.search).get('client');
      if(q&&clients.has(q))return q;
    }catch(e){}
    return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
  };
  const initialPage=()=>{
    try{
      const q=new URLSearchParams(location.search).get('page');
      if(q&&pages.has(q))return q;
    }catch(e){}
    return null;
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

  function openRequestedPage(attempt=0){
    const wanted=initialPage();
    if(!wanted||wanted==='overview')return;
    if(typeof window.refGo==='function'){
      window.refGo(wanted);
      return;
    }
    if(attempt<20)setTimeout(()=>openRequestedPage(attempt+1),100);
  }

  function ensurePerceptionSimpleLayer(){
    if(document.getElementById('blisPerceptionSimpleV1'))return;
    const s=document.createElement('script');
    s.id='blisPerceptionSimpleV1';
    s.src='/navigator-perception-simple-v1.js?v=20260820-simple1';
    s.defer=true;
    document.head.appendChild(s);
  }

  ensurePerceptionSimpleLayer();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(openRequestedPage,850),{once:true});
  else setTimeout(openRequestedPage,850);
})();

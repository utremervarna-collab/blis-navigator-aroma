/* BLIS Navigator — stable runtime compatibility bridge.
   app.js owns API loading; this bridge only publishes the loaded state and emits one data-ready event.
   No dynamic script injection, no visibility guards, no page renderer races. */
(function(){
'use strict';
if(window.__BLIS_RUNTIME_BRIDGE_STABLE)return;window.__BLIS_RUNTIME_BRIDGE_STABLE=true;

const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
function initialClient(){try{const q=new URLSearchParams(location.search).get('client');if(q&&clients.has(q))return q}catch(_){}return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null}

const legacyLoad=window.load;
if(typeof legacyLoad==='function'&&!legacyLoad.__blisStableBridge){
  const wrapped=async function(){
    const wanted=initialClient();
    if(wanted){try{slug=wanted}catch(_){}const sel=document.getElementById('clientSel');if(sel)sel.value=wanted;document.body.dataset.client=wanted}
    return legacyLoad.apply(this,arguments);
  };
  wrapped.__blisStableBridge=true;
  window.load=wrapped;
}

window.renderAll=function(){
  try{
    try{window.D=D}catch(_){}try{window.S=S}catch(_){}try{window.Q=Q}catch(_){}try{window.A=A}catch(_){}try{window.H=H}catch(_){}
    let x=null;try{x=typeof dossier==='function'?dossier():null}catch(_){}
    if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
    if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
    const note=document.getElementById('clientNote');if(note)note.textContent=window.D?.note||x?.descriptor||'';
    const sync=document.getElementById('lastSync');if(sync)sync.textContent=window.D?.data_updated?new Date(window.D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:typeof slug!=='undefined'?slug:initialClient()}}));
  }catch(e){
    console.error('BLIS stable bridge render state failed',e);
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:initialClient(),error:true}}));
  }
};
})();
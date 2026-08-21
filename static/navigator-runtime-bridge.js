/* BLIS Navigator — stable runtime compatibility bridge.
   app.js owns API loading. This bridge only publishes loaded state and keeps
   non-final support modules available. Final modules own their own rendering. */
(function(){
'use strict';
if(window.__BLIS_RUNTIME_BRIDGE_STABLE_2318)return;window.__BLIS_RUNTIME_BRIDGE_STABLE_2318=true;

const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);

function initialClient(){
  try{
    const q=new URLSearchParams(location.search).get('client');
    if(q&&clients.has(q))return q;
  }catch(_){}
  return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
}

const legacyLoad=window.load;
if(typeof legacyLoad==='function'&&!legacyLoad.__blisStableBridge){
  const wrapped=async function(){
    const wanted=initialClient();
    if(wanted){
      try{slug=wanted}catch(_){}
      const sel=document.getElementById('clientSel');
      if(sel)sel.value=wanted;
      document.body.dataset.client=wanted;
    }
    return legacyLoad.apply(this,arguments);
  };
  wrapped.__blisStableBridge=true;
  window.load=wrapped;
}

function publishState(){
  try{window.D=D}catch(_){}
  try{window.S=S}catch(_){}
  try{window.Q=Q}catch(_){}
  try{window.A=A}catch(_){}
  try{window.H=H}catch(_){}
}

function seedSupportModules(){
  const map={digital:'renderDigital',history:'renderHistory',profile:'renderProfile'};
  Object.entries(map).forEach(([id,name])=>{
    const body=document.getElementById(id+'Body');
    if(!body||body.children.length)return;
    const fn=window[name];
    if(typeof fn!=='function')return;
    try{fn()}catch(e){console.error('BLIS support module seed failed',id,e)}
  });
}

window.renderAll=function(){
  try{
    publishState();
    seedSupportModules();
    document.documentElement.classList.add('blis-final-booted');
    let x=null;
    try{x=typeof dossier==='function'?dossier():null}catch(_){}
    if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
    if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
    const note=document.getElementById('clientNote');
    if(note)note.textContent=window.D?.note||x?.descriptor||'';
    const sync=document.getElementById('lastSync');
    if(sync)sync.textContent=window.D?.data_updated?new Date(window.D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:typeof slug!=='undefined'?slug:initialClient()}}));
  }catch(e){
    console.error('BLIS stable bridge render state failed',e);
    document.documentElement.classList.add('blis-final-booted');
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:initialClient(),error:true}}));
  }
};
})();

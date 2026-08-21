/* BLIS Navigator — stable runtime compatibility bridge.
   app.js owns API loading. This bridge publishes loaded state, seeds safe legacy
   module renderers, and guarantees that routed modules never end as white pages. */
(function(){
'use strict';
if(window.__BLIS_RUNTIME_BRIDGE_STABLE_2308)return;window.__BLIS_RUNTIME_BRIDGE_STABLE_2308=true;

const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
const watchedPages=new Set(['social','reputation','market','competition']);

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

function bodyFor(id){
  return document.getElementById(id+'Body');
}

function hasMeaningfulContent(id){
  const body=bodyFor(id);
  if(!body)return false;
  return [...body.children].some(el=>!el.classList.contains('sf-route-cover')) ||
    String(body.textContent||'').replace(/\s+/g,' ').trim().length>24;
}

function legacyRenderer(id){
  return {
    social:'renderSocial',
    reputation:'renderReputation',
    market:'renderMarket',
    competition:'renderCompetition'
  }[id]||null;
}

function runLegacyRenderer(id){
  const name=legacyRenderer(id);
  const fn=name&&window[name];
  if(typeof fn!=='function')return false;
  try{
    const out=fn();
    if(out&&typeof out.catch==='function')out.catch(e=>console.error('BLIS '+id+' renderer failed',e));
    return true;
  }catch(e){
    console.error('BLIS '+id+' renderer failed',e);
    return false;
  }
}

function seedStaticModules(){
  ['social','digital','reputation','competition','history','profile'].forEach(id=>{
    const body=bodyFor(id);
    if(!body||hasMeaningfulContent(id))return;
    const name={
      social:'renderSocial',
      digital:'renderDigital',
      reputation:'renderReputation',
      competition:'renderCompetition',
      history:'renderHistory',
      profile:'renderProfile'
    }[id];
    const fn=name&&window[name];
    if(typeof fn!=='function')return;
    try{fn()}catch(e){console.error('BLIS base module seed failed',id,e)}
  });
}

function fallback(id){
  const body=bodyFor(id);
  if(!body||hasMeaningfulContent(id))return;
  const title={
    social:'Сигнали',
    reputation:'Репутация',
    market:'Нагласи',
    competition:'Конкуренти'
  }[id]||'BLIS модул';
  const d=window.D||{};
  const sources=Array.isArray(window.S)?window.S.length:0;
  const activity=Array.isArray(window.A)?window.A.length:0;
  body.innerHTML=
    '<div class="sf-competition-fallback" data-blis-route-fallback="'+id+'">'+
      '<h2>'+title+'</h2>'+
      '<p>Модулът е активен. Показваме наличната проверима база, докато специализираният изглед се възстанови.</p>'+
      '<div class="sf-competition-list">'+
        '<div><b>BLIS индекс</b><span>'+(Number.isFinite(Number(d.blis_index))?Number(d.blis_index).toLocaleString('bg-BG',{maximumFractionDigits:1})+'/100':'активен')+'</span></div>'+
        '<div><b>Наблюдавани източници</b><span>'+sources+'</span></div>'+
        '<div><b>Измервания</b><span>'+activity+'</span></div>'+
        '<div><b>Статус</b><span>LIVE</span></div>'+
      '</div>'+
    '</div>';
}

function repairPage(id){
  if(!watchedPages.has(id))return;
  if(!hasMeaningfulContent(id))runLegacyRenderer(id);
  setTimeout(()=>{if(!hasMeaningfulContent(id))runLegacyRenderer(id)},180);
  setTimeout(()=>{if(!hasMeaningfulContent(id))runLegacyRenderer(id)},950);
  setTimeout(()=>{if(!hasMeaningfulContent(id))fallback(id)},1650);
}

window.renderAll=function(){
  try{
    publishState();
    seedStaticModules();
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
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:initialClient(),error:true}}));
  }
};

function installRouteGuard(){
  const base=window.refGo;
  if(typeof base!=='function'||base.__blisWhitePageGuard)return;
  const guarded=function(id){
    const res=base.apply(this,arguments);
    if(watchedPages.has(id)){
      repairPage(id);
      setTimeout(()=>{
        try{window.dispatchEvent(new CustomEvent('blis:periodchange',{detail:{routeRepair:true,page:id}}))}catch(_){}
      },70);
    }
    return res;
  };
  guarded.__blisWhitePageGuard=true;
  guarded.__base=base;
  window.refGo=guarded;
}

function ready(){
  setTimeout(()=>{
    installRouteGuard();
    const active=document.querySelector('.page.active')?.id;
    if(active&&watchedPages.has(active))repairPage(active);
  },0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
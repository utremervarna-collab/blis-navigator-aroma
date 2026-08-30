/* BLIS Navigator — MOLLOX signal truth guard v1.
   MOLLOX baseline/profile facts are evidence, not current signals.
   This layer removes static client facts and owned static web pages from
   executive signal consumers while preserving real news, social, external,
   competitor and measured-change events. */
(function(){
'use strict';
if(window.__BLIS_MOLLOX_SIGNALS_TRUTH_V1)return;
window.__BLIS_MOLLOX_SIGNALS_TRUTH_V1=true;

const A=x=>Array.isArray(x)?x:[];
const slug=()=>String(
  document.body?.dataset?.client ||
  window.D?.client ||
  window.BLIS_INITIAL_CLIENT ||
  new URLSearchParams(location.search).get('client') || ''
).toLowerCase();

const baselineTitles=new Set([
  'пълна техническа документация',
  'private label е публично потвърдена услуга',
  'регионална дистрибуция'
]);

function isMolloxBaselineSignal(s){
  if(!s||typeof s!=='object')return false;
  const title=String(s.title||s.text||'').trim().toLowerCase();
  if(baselineTitles.has(title))return true;

  // An owned static web result is source/profile evidence, not a new event.
  if(String(s.scope||'').toLowerCase()==='owned' && String(s.source_type||'').toLowerCase()==='web')return true;

  // Legacy dashboard signals were anonymous client facts without event time or URL.
  const id=String(s.id||'');
  const hasEventTime=Boolean(s.published_at||s.detected_at||s.created_at||s.observed_at||s.timestamp||s.date);
  const hasURL=/^https?:\/\//i.test(String(s.url||''));
  if(id.startsWith('client-signal-')&&!hasEventTime&&!hasURL)return true;
  return false;
}

function filterRows(rows){
  if(slug()!=='mollox')return A(rows);
  return A(rows).filter(s=>!isMolloxBaselineSignal(s));
}

function cleanClientPayload(){
  if(slug()!=='mollox'||!window.D||!Array.isArray(window.D.signals))return false;
  const before=window.D.signals.length;
  window.D.signals=filterRows(window.D.signals);
  return window.D.signals.length!==before;
}

function wrapMethod(stream,name){
  if(!stream||typeof stream[name]!=='function')return false;
  const current=stream[name];
  if(current.__molloxTruthV1)return false;
  const base=current.bind(stream);
  const wrapped=function(){return filterRows(base(...arguments))};
  wrapped.__molloxTruthV1=true;
  wrapped.__molloxTruthBase=current;
  stream[name]=wrapped;
  return true;
}

function patch(){
  cleanClientPayload();
  const stream=window.BLISIntelligenceStreamV3;
  if(!stream)return false;
  const a=wrapMethod(stream,'getUsefulSignals');
  const b=wrapMethod(stream,'getExecutiveSignals');
  if((a||b)&&slug()==='mollox'&&document.querySelector('.page.active')?.id==='social'){
    setTimeout(()=>{try{window.BLISSignalsSystemV3?.render?.()}catch(_){}},0);
  }
  return a||b;
}

let ticks=0;
const timer=setInterval(()=>{
  ticks++;
  patch();
  if(ticks>240)clearInterval(timer);
},100);

for(const ev of ['blis:clientdata','blis:intelligence','blis:executive-data','blis:routechange','blis:navigator-route','popstate']){
  window.addEventListener(ev,()=>{setTimeout(patch,0);setTimeout(patch,80);setTimeout(patch,240)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();

window.BLISMolloxSignalTruthV1={filter:filterRows,isBaseline:isMolloxBaselineSignal,patch};
})();

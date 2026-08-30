/* BLIS Navigator — MOLLOX signal truth guard v3.
   Baseline/profile facts are evidence, not current signals.
   Owned static web pages are source evidence, not events.
   Current signals must fall inside the selected 30/60/90-day period.
   Historical rows remain in storage for historical analysis. */
(function(){
'use strict';
if(window.__BLIS_MOLLOX_SIGNALS_TRUTH_V3)return;
window.__BLIS_MOLLOX_SIGNALS_TRUTH_V3=true;
window.__BLIS_MOLLOX_SIGNALS_TRUTH_V2=true;
window.__BLIS_MOLLOX_SIGNALS_TRUTH_V1=true;

const A=x=>Array.isArray(x)?x:[];
const DAY=86400000;
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

function periodDays(){
  const live=Number(window.BLISPeriod?.days);
  if(Number.isFinite(live)&&live>0)return live;
  try{
    const stored=Number(localStorage.getItem('blis_period_days'));
    if(Number.isFinite(stored)&&stored>0)return stored;
  }catch(_){}
  return 30;
}

function parseTime(v){
  if(v==null||v==='')return null;
  const t=new Date(v).getTime();
  return Number.isFinite(t)&&t>0?t:null;
}

function eventTime(s){
  if(!s||typeof s!=='object')return null;
  const published=parseTime(s.published_at||s.publishedAt||s.pub_date||s.pubDate);
  if(published!=null)return published;
  return parseTime(
    s.detected_at||s.detectedAt||s.created_at||s.createdAt||
    s.observed_at||s.observedAt||s.timestamp||s.datetime||s.date||
    s.updated_at||s.updatedAt
  );
}

function isOutsideCurrentPeriod(s){
  const t=eventTime(s);
  if(t==null)return false;
  const cutoff=Date.now()-(periodDays()*DAY);
  return t < cutoff-(6*60*60*1000);
}

function isMolloxBaselineSignal(s){
  if(!s||typeof s!=='object')return false;
  const title=String(s.title||s.text||'').trim().toLowerCase();
  if(baselineTitles.has(title))return true;
  if(String(s.scope||'').toLowerCase()==='owned' && String(s.source_type||'').toLowerCase()==='web')return true;
  const id=String(s.id||'');
  const hasEventTime=eventTime(s)!=null;
  const hasURL=/^https?:\/\//i.test(String(s.url||''));
  if(id.startsWith('client-signal-')&&!hasEventTime&&!hasURL)return true;
  return false;
}

function isCrossClientSignal(s){
  if(!s||typeof s!=='object')return false;
  const owner=String(s.client||s.client_slug||s.clientSlug||'').trim().toLowerCase();
  return owner!==''&&owner!=='mollox';
}

function isCurrentMolloxSignal(s){
  return !isCrossClientSignal(s) && !isMolloxBaselineSignal(s) && !isOutsideCurrentPeriod(s);
}

function filterRows(rows){
  if(slug()!=='mollox')return A(rows);
  return A(rows).filter(isCurrentMolloxSignal);
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
  if(current.__molloxTruthV3)return false;
  const raw=current.__molloxTruthBase||current;
  const base=raw.bind(stream);
  const wrapped=function(){return filterRows(base(...arguments))};
  wrapped.__molloxTruthV1=true;
  wrapped.__molloxTruthV2=true;
  wrapped.__molloxTruthV3=true;
  wrapped.__molloxTruthBase=raw;
  stream[name]=wrapped;
  return true;
}

function rerenderCurrent(){
  if(slug()!=='mollox')return;
  const active=document.querySelector('.page.active')?.id||'';
  if(active==='social'){
    try{window.BLISSignalsSystemV3?.render?.()}catch(_){}
    try{window.BLISIntelligenceStreamV3?.renderSignals?.()}catch(_){}
  }
  if(active==='opportunities'){
    try{window.BLISIntelligenceStreamV3?.renderOpportunities?.()}catch(_){}
    try{window.BLISRiskPrioritySyncV1?.render?.()}catch(_){}
  }
}

function patch(){
  cleanClientPayload();
  const stream=window.BLISIntelligenceStreamV3;
  if(!stream)return false;
  const a=wrapMethod(stream,'getSignals');
  const b=wrapMethod(stream,'getUsefulSignals');
  const c=wrapMethod(stream,'getExecutiveSignals');
  if(a||b||c)setTimeout(rerenderCurrent,0);
  return a||b||c;
}

let ticks=0;
const timer=setInterval(()=>{
  ticks++;
  patch();
  if(ticks>240)clearInterval(timer);
},100);

for(const ev of [
  'blis:clientdata','blis:intelligence','blis:executive-data',
  'blis:routechange','blis:navigator-route','blis:periodchange','popstate'
]){
  window.addEventListener(ev,()=>{
    setTimeout(()=>{patch();rerenderCurrent()},0);
    setTimeout(()=>{patch();rerenderCurrent()},80);
    setTimeout(()=>{patch();rerenderCurrent()},240);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();

window.BLISMolloxSignalTruthV1=window.BLISMolloxSignalTruthV2=window.BLISMolloxSignalTruthV3={
  filter:filterRows,
  isBaseline:isMolloxBaselineSignal,
  isCrossClient:isCrossClientSignal,
  isOutsidePeriod:isOutsideCurrentPeriod,
  isCurrent:isCurrentMolloxSignal,
  eventTime,
  periodDays,
  patch
};
})();

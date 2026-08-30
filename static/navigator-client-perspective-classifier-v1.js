/* BLIS Navigator — client-perspective signal classifier v1.
   Raw source sentiment and client impact are different dimensions.
   A positive event for a competitor is NOT a positive signal for the current client. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_PERSPECTIVE_CLASSIFIER_V1)return;
window.__BLIS_CLIENT_PERSPECTIVE_CLASSIFIER_V1=true;

const COMPETITOR_KIND='конкурент';
const RISK_KIND='риск';
const OPPORTUNITY_KIND='възможност';

function isCompetitorSignal(s){
  if(!s)return false;
  return String(s.scope||'').toLowerCase()==='competitor' || String(s.topic||'').toLowerCase()==='competition';
}

function explicitClientEffect(s){
  const raw=String(s?.client_effect ?? s?.clientEffect ?? s?.impact_direction ?? s?.impactDirection ?? '').trim().toLowerCase();
  if(['risk','negative','threat','pressure','риск','негативен','заплаха','натиск'].includes(raw))return RISK_KIND;
  if(['opportunity','positive','benefit','възможност','положителен','полза'].includes(raw))return OPPORTUNITY_KIND;
  return '';
}

function fromClientPerspective(s){
  if(!s||typeof s!=='object')return s;
  if(!isCompetitorSignal(s))return s;

  // Preserve the sentiment of the source event as evidence metadata.
  // Do not reinterpret it as benefit/risk for the client unless a separate
  // client-effect field explicitly says so.
  const clientKind=explicitClientEffect(s)||COMPETITOR_KIND;
  return {
    ...s,
    source_sentiment:s.source_sentiment ?? s.sentiment ?? '',
    kind:clientKind,
    client_perspective_kind:clientKind
  };
}

function normalizeRows(rows){
  return Array.isArray(rows)?rows.map(fromClientPerspective):[];
}

function patch(){
  const api=window.BLISIntelligenceStreamV3;
  if(!api||api.__clientPerspectiveV1)return false;
  api.__clientPerspectiveV1=true;
  for(const name of ['getSignals','getUsefulSignals']){
    if(typeof api[name]!=='function')continue;
    const original=api[name].bind(api);
    api[name]=function(){return normalizeRows(original(...arguments))};
  }
  window.dispatchEvent(new CustomEvent('blis:client-perspective-ready'));
  return true;
}

function repaint(){
  patch();
  try{window.BLISCanonicalRenderActive?.()}catch(_){ }
  try{window.BLISVisualSuiteV1?.render?.(document.querySelector('.page.active')?.id)}catch(_){ }
}

let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(patch()||tries>200)clearInterval(timer);
},25);

for(const ev of ['blis:intelligence','blis:clientdata','blis:routechange','blis:navigator-route']){
  window.addEventListener(ev,()=>setTimeout(repaint,0));
}

window.BLISClientPerspectiveClassifierV1={isCompetitorSignal,fromClientPerspective,normalizeRows,patch,repaint};
patch();
})();

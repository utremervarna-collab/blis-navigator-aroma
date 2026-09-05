/* BLIS Navigator: stability compatibility preload v20.
   Keeps diagnostics compatibility and loads universal client-value analysis.
   Aroma retains its evidence repair layer while the universal layer applies to every client profile. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV20)return;window.__BLISStabilityPreloadV20=true;
window.BLISStabilityStats={
  mode:'event-driven',
  blockedIntervals:0,
  blockedTimeouts:0,
  blockedNavRebuilds:0,
  blockedNavLabelWrites:0,
  blockedMarketTextWrites:0,
  blockedCompetitionTimeouts:0,
  navRepairs:0,
  marketRepairs:0
};
document.documentElement.dataset.blisStability='event-driven';

const c=new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
if(c==='aroma'&&!document.querySelector('script[data-aroma-evidence-repair]')){
  const s=document.createElement('script');
  s.dataset.aromaEvidenceRepair='1';
  s.src='/navigator-aroma-evidence-repair-v1.js?v=20260905-evidence1';
  s.defer=true;
  document.head.appendChild(s);
}
if(!document.querySelector('script[data-client-value-universal]')){
  const s=document.createElement('script');
  s.dataset.clientValueUniversal='1';
  s.src='/navigator-client-value-universal-v2.js?v=20260905-clientvalue2';
  s.defer=true;
  document.head.appendChild(s);
}
})();

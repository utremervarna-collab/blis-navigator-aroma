/* BLIS Navigator — stability compatibility preload v19.
   Keeps diagnostics compatibility and loads the Aroma evidence repair layer.
   No global timer, DOM or router monkey patches. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV19)return;window.__BLISStabilityPreloadV19=true;
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
})();

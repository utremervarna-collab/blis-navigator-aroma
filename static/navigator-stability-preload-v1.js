/* BLIS Navigator — stability compatibility preload v18.
   Keeps diagnostics compatibility only. No global timer, DOM or router monkey patches. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV18)return;window.__BLISStabilityPreloadV18=true;
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
})();

/* BLIS Navigator: lean stability preload v30.\n   Only compatibility helpers that are not already owned by the canonical production entrypoint. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV30)return;window.__BLISStabilityPreloadV30=true;
window.BLISStabilityStats={mode:'event-driven',blockedIntervals:0,blockedTimeouts:0,blockedNavRebuilds:0,blockedNavLabelWrites:0,blockedMarketTextWrites:0,blockedCompetitionTimeouts:0,navRepairs:0,marketRepairs:0};
document.documentElement.dataset.blisStability='event-driven';
const c=new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
function add(attr,src){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.setAttribute(attr,'1');s.src=src;s.defer=true;document.head.appendChild(s)}
if(c==='aroma')add('data-aroma-evidence-repair','/navigator-aroma-evidence-repair-v1.js?v=20260905-evidence1');
if(c==='black-sea-center')add('data-bsc-key-factors-globe-v3','/navigator-bsc-key-factors-globe-v2.js?v=20260907-bscglobe3');
add('data-client-value-repair','/navigator-client-value-repair-v3.js?v=20260905-clientvalue3');
add('data-key-factors-title-lock','/navigator-key-factors-title-lock-v1.js?v=20260907-titlelock1');
})();
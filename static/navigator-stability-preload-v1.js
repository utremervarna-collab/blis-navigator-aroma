/* BLIS Navigator: stability compatibility preload v24.
   Loads legacy analytical helpers first, then one canonical client-intelligence owner.
   No post-render follower or empty-state overlays. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV24)return;window.__BLISStabilityPreloadV24=true;
window.BLISStabilityStats={mode:'event-driven',blockedIntervals:0,blockedTimeouts:0,blockedNavRebuilds:0,blockedNavLabelWrites:0,blockedMarketTextWrites:0,blockedCompetitionTimeouts:0,navRepairs:0,marketRepairs:0};
document.documentElement.dataset.blisStability='event-driven';
const c=new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
function add(attr,src){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.setAttribute(attr,'1');s.src=src;s.defer=true;document.head.appendChild(s)}
if(c==='aroma')add('data-aroma-evidence-repair','/navigator-aroma-evidence-repair-v1.js?v=20260905-evidence1');
add('data-client-value-universal','/navigator-client-value-universal-v2.js?v=20260905-clientvalue2');
add('data-client-value-repair','/navigator-client-value-repair-v3.js?v=20260905-clientvalue3');
add('data-canonical-intelligence-v5','/navigator-intelligence-canonical-v5.js?v=20260906-canonical5');
})();
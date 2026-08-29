/* BLIS Navigator — Visual Suite motion contract v1. Pure motion/polish; no page ownership. */
(function(){'use strict';if(window.__BLIS_VISUAL_SUITE_MOTION_V1)return;window.__BLIS_VISUAL_SUITE_MOTION_V1=true;const s=document.createElement('style');s.id='blisVisualSuiteMotionV1';s.textContent=`
@keyframes vsGlowOnly{0%,100%{opacity:.82;filter:brightness(1)}50%{opacity:1;filter:brightness(1.35)}}
@keyframes vsMarkerGlow{0%,100%{box-shadow:0 0 0 7px rgba(31,101,183,.10),0 0 12px rgba(31,101,183,.35)}50%{box-shadow:0 0 0 11px rgba(31,101,183,.04),0 0 24px rgba(31,101,183,.72)}}
@keyframes vsWheelBreath{0%,100%{filter:drop-shadow(0 0 4px rgba(31,101,183,.08))}50%{filter:drop-shadow(0 0 12px rgba(31,101,183,.22))}}
@keyframes vsNowScan{0%,100%{opacity:.62}50%{opacity:1}}
.vs-gauge-svg .score,.vs-node,.vs-hevent .icon,.vs-hnow{animation-name:vsGlowOnly!important;animation-timing-function:ease-in-out!important;animation-iteration-count:infinite!important}
.vs-gauge-svg .score{animation-duration:1.8s!important;transform:none!important;transform-origin:center!important}
.vs-node{animation-duration:2.1s!important;transform:translate(-50%,-50%)!important}
.vs-node:hover{filter:brightness(1.55)!important;z-index:10}
.vs-now{animation:vsNowScan 1.6s ease-in-out infinite}
.vs-comp-row.client .vs-track u{animation:vsMarkerGlow 2s ease-in-out infinite}
.vs-mnode{transform:translate(-50%,-50%)!important}
.vs-mnode:hover{filter:brightness(1.45);z-index:12}
.vs-hnow{animation-duration:1.8s!important}
.vs-wheel{animation:vsWheelBreath 4s ease-in-out infinite}
.vs-wheel .seg{transition:stroke-width .18s ease,filter .18s ease,opacity .18s ease}
.vs-wheel .seg:not(.active):hover{opacity:1}
@media(prefers-reduced-motion:reduce){.vs-gauge-svg .score,.vs-node,.vs-node:before,.vs-node:after,.vs-rep-svg .line,.vs-comp-row.client .vs-track u,.vs-mnode,.vs-hline,.vs-hevent .icon,.vs-hnow,.vs-wheel,.vs-now{animation:none!important;transition:none!important}}
`;document.head.appendChild(s);})();
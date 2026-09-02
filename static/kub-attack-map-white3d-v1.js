/* KUB pressure-map visual override: white background and colorful 3D nodes while preserving the full analytical page. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;

function addStyle(){
 if(document.getElementById('kubam-white3d-style'))return;
 const s=document.createElement('style');
 s.id='kubam-white3d-style';
 s.textContent=`
 #attackmap{padding-top:4px!important}
 #attackmap .kubam-hero,#attackmap .kubam-detail,#attackmap .kubam-lower,#attackmap #kubamlStrip{display:grid}
 #attackmap #kubamlStrip{display:flex!important}
 #attackmap .kubam-grid{display:grid!important;grid-template-columns:minmax(0,1.28fr) minmax(300px,.72fr)!important;gap:14px!important;align-items:stretch!important}
 #attackmap .kubam-map-card{width:auto!important;max-width:100%!important;min-width:0!important;padding:14px 14px 12px!important;border:1px solid #dfe8ef!important;border-radius:20px!important;background:linear-gradient(180deg,#ffffff 0%,#fbfdff 58%,#f5f9fc 100%)!important;box-shadow:0 14px 36px rgba(47,79,103,.10),0 2px 8px rgba(47,79,103,.04)!important;overflow:hidden!important}
 #attackmap .kubam-head{padding:0 2px 6px!important;margin-bottom:6px!important;align-items:center!important}
 #attackmap .kubam-head h3{font-size:15px!important;color:#19374e!important;letter-spacing:-.15px!important}
 #attackmap .kubam-head p{font-size:9px!important;color:#718392!important}
 #attackmap .kubam-filters{gap:6px!important}
 #attackmap .kubam-filter{background:#fff!important;border:1px solid #dbe5ec!important;color:#617789!important;box-shadow:0 2px 8px rgba(60,88,107,.05)!important;transition:.18s ease!important;padding:5px 8px!important;font-size:8.4px!important}
 #attackmap .kubam-filter:hover{transform:translateY(-1px)!important;box-shadow:0 6px 14px rgba(60,88,107,.09)!important}
 #attackmap .kubam-filter.active{background:linear-gradient(180deg,#eff7ff,#e7f2fb)!important;border-color:#a7c7df!important;color:#235a7e!important;box-shadow:inset 0 1px 0 #fff,0 5px 14px rgba(58,113,151,.12)!important}
 #attackmap .kubam-canvas{width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;aspect-ratio:670/470!important;border:1px solid #e2ebf1!important;border-radius:18px!important;background:
   radial-gradient(circle at 50% 48%,rgba(116,185,235,.16) 0,rgba(116,185,235,.05) 22%,transparent 44%),
   radial-gradient(circle at 17% 24%,rgba(239,82,82,.06),transparent 23%),
   radial-gradient(circle at 84% 76%,rgba(242,146,45,.06),transparent 24%),
   linear-gradient(180deg,#ffffff 0%,#fbfdff 100%)!important;
   box-shadow:inset 0 0 44px rgba(84,128,159,.04)!important;overflow:hidden!important;position:relative!important}
 #attackmap .kubam-canvas:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.58;background-image:radial-gradient(#bcd2e0 1px,transparent 1px);background-size:18px 18px;mask-image:radial-gradient(circle at center,#000 0,rgba(0,0,0,.52) 42%,transparent 78%)}
 #attackmap .kubam-canvas svg{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;max-height:100%!important;filter:drop-shadow(0 7px 16px rgba(54,84,105,.06));position:relative;z-index:1}
 #attackmap .kubam-link{stroke-width:2.1!important;stroke-dasharray:none!important;opacity:.56!important;filter:drop-shadow(0 0 3px rgba(70,130,170,.26))}
 #attackmap .kubam-link.hot{stroke-width:2.7!important;opacity:.76!important}
 #attackmap .kubam-node{transform-box:fill-box;transform-origin:center;transition:filter .2s ease,opacity .2s ease!important}
 #attackmap .kubam-node:hover{filter:drop-shadow(0 12px 10px rgba(46,74,94,.20))!important}
 #attackmap .kubam-node-circle{stroke-width:2.5!important;filter:url(#kubamSoftShadow)!important}
 #attackmap .kubam-ring{stroke-width:3!important;opacity:.34!important;filter:url(#kubamGlow)!important}
 #attackmap .kubam-node.active .kubam-ring{stroke-width:5!important;opacity:.56!important}
 #attackmap .kubam-node-title{font-size:10px!important;font-weight:900!important;fill:#fff!important;paint-order:stroke;stroke:rgba(25,55,78,.18);stroke-width:.6px}
 #attackmap .kubam-node-sub{font-size:7.7px!important;font-weight:700!important;fill:rgba(255,255,255,.92)!important}
 #attackmap .kubam-center-ring{fill:url(#kubamCenterRing)!important;stroke:#4e9ee0!important;stroke-width:3.2!important;filter:url(#kubamCenterShadow)!important}
 #attackmap .kubam-center-core{fill:url(#kubamCenterCore)!important;stroke:#88bfe7!important;stroke-width:2!important;filter:url(#kubamInnerGlow)!important}
 #attackmap .kubam-center-title{fill:#fff!important;font-size:18px!important;font-weight:950!important;paint-order:stroke;stroke:rgba(19,64,100,.25);stroke-width:1px}
 #attackmap .kubam-center-sub{fill:rgba(255,255,255,.93)!important;font-size:8.3px!important;font-weight:800!important}
 #attackmap .kubam-node[data-type="political"] .kubam-node-circle{fill:url(#kubamPolitical)!important;stroke:#e34a4a!important}
 #attackmap .kubam-node[data-type="political"] .kubam-ring{stroke:#f05a5a!important}
 #attackmap .kubam-node[data-type="institutional"] .kubam-node-circle{fill:url(#kubamInstitutional)!important;stroke:#338fd2!important}
 #attackmap .kubam-node[data-type="institutional"] .kubam-ring{stroke:#56ade6!important}
 #attackmap .kubam-node[data-type="media"] .kubam-node-circle{fill:url(#kubamMedia)!important;stroke:#ef912b!important}
 #attackmap .kubam-node[data-type="media"] .kubam-ring{stroke:#f7a84d!important}
 #attackmap .kubam-node[data-type="stakeholder"] .kubam-node-circle{fill:url(#kubamStakeholder)!important;stroke:#8a57d3!important}
 #attackmap .kubam-node[data-type="stakeholder"] .kubam-ring{stroke:#a572e7!important}
 #attackmap .kubam-legend{justify-content:center!important;gap:10px!important;margin:9px 0 0!important;font-size:8.5px!important;color:#6d7f8d!important}
 #attackmap .kubam-legend span{display:inline-flex;align-items:center;padding:4px 7px;border-radius:999px;background:#fff;border:1px solid #e2e9ee;box-shadow:0 2px 8px rgba(53,78,97,.04)}
 #attackmap .kubam-legend i{width:8px!important;height:8px!important;box-shadow:0 0 0 2px rgba(255,255,255,.8),0 2px 5px rgba(55,78,94,.16)}
 #attackmap .kubaml-badge{filter:drop-shadow(0 3px 4px rgba(72,59,59,.22))}
 #attackmap .kubam-detail{min-width:0!important}
 #attackmap .kubam-lower{display:grid!important}
 @media(max-width:1180px){#attackmap .kubam-grid{grid-template-columns:minmax(0,1.12fr) minmax(280px,.88fr)!important}#attackmap .kubam-head{display:block!important}#attackmap .kubam-filters{justify-content:flex-start!important;margin-top:7px!important}}
 @media(max-width:980px){#attackmap .kubam-grid{grid-template-columns:1fr!important}#attackmap .kubam-canvas{max-width:760px!important;margin:0 auto!important}#attackmap .kubam-detail{min-height:0!important}}
 @media(max-width:700px){#attackmap .kubam-map-card{padding:10px!important;border-radius:15px!important}#attackmap .kubam-canvas{aspect-ratio:670/500!important;border-radius:14px!important}#attackmap .kubam-node-title{font-size:9.3px!important}#attackmap .kubam-node-sub{font-size:7.2px!important}}
 `;
 document.head.appendChild(s);
}

function enhanceSvg(){
 const svg=document.querySelector('#attackmap .kubam-canvas svg');
 if(!svg)return false;
 if(svg.querySelector('#kubamWhite3dDefs'))return true;
 const ns='http://www.w3.org/2000/svg';
 const defs=document.createElementNS(ns,'defs'); defs.id='kubamWhite3dDefs';
 defs.innerHTML=`
 <radialGradient id="kubamPolitical" cx="35%" cy="26%" r="78%"><stop offset="0" stop-color="#ff7a7a"/><stop offset=".34" stop-color="#ee4e4e"/><stop offset=".75" stop-color="#c52f36"/><stop offset="1" stop-color="#9e2028"/></radialGradient>
 <radialGradient id="kubamInstitutional" cx="35%" cy="24%" r="80%"><stop offset="0" stop-color="#73c5ff"/><stop offset=".35" stop-color="#349be1"/><stop offset=".75" stop-color="#1972b5"/><stop offset="1" stop-color="#0f568d"/></radialGradient>
 <radialGradient id="kubamMedia" cx="35%" cy="24%" r="80%"><stop offset="0" stop-color="#ffc06a"/><stop offset=".34" stop-color="#f6a13c"/><stop offset=".75" stop-color="#df791b"/><stop offset="1" stop-color="#b85b0b"/></radialGradient>
 <radialGradient id="kubamStakeholder" cx="35%" cy="24%" r="80%"><stop offset="0" stop-color="#c293ff"/><stop offset=".34" stop-color="#9c67e5"/><stop offset=".75" stop-color="#7544bf"/><stop offset="1" stop-color="#582a9a"/></radialGradient>
 <radialGradient id="kubamCenterRing" cx="42%" cy="28%" r="78%"><stop offset="0" stop-color="#dff4ff"/><stop offset=".32" stop-color="#8bcbf6"/><stop offset=".7" stop-color="#378ecf"/><stop offset="1" stop-color="#1b659e"/></radialGradient>
 <radialGradient id="kubamCenterCore" cx="40%" cy="26%" r="78%"><stop offset="0" stop-color="#63b8f2"/><stop offset=".42" stop-color="#2587ca"/><stop offset="1" stop-color="#135c92"/></radialGradient>
 <filter id="kubamSoftShadow" x="-60%" y="-60%" width="220%" height="240%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#27445a" flood-opacity=".22"/><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#ffffff" flood-opacity=".42"/></filter>
 <filter id="kubamCenterShadow" x="-70%" y="-70%" width="240%" height="260%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#2c6288" flood-opacity=".24"/><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#64b8ef" flood-opacity=".32"/></filter>
 <filter id="kubamGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="kubamInnerGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.7" result="b"/><feComposite in="b" in2="SourceGraphic" operator="in" result="c"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="c"/></feMerge></filter>`;
 svg.insertBefore(defs,svg.firstChild);
 return true;
}

function recolorLinks(){
 const svg=document.querySelector('#attackmap .kubam-canvas svg');if(!svg)return;
 const colors={political:'#ea4c50',institutional:'#3d9ddc',media:'#f09a31',stakeholder:'#9564dd'};
 svg.querySelectorAll('.kubam-link').forEach(l=>{l.style.stroke=colors[l.dataset.type]||'#9eb8c9';});
}

function boot(){
 addStyle();
 const wait=()=>{
   if(document.getElementById('attackmap')&&enhanceSvg()){recolorLinks();return;}
   setTimeout(wait,90);
 };
 wait();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
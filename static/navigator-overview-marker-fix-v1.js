/* BLIS Navigator — Overview marker geometry fix v2.
   Keeps the current-value marker geometrically attached to the actual blue progress path.
   Marker motion is glow-only: no SVG transform can move it away from the curve. */
(function(){
'use strict';
if(window.__BLIS_OVERVIEW_MARKER_FIX_V1)return;window.__BLIS_OVERVIEW_MARKER_FIX_V1=true;
function css(){
  if(document.getElementById('blisOverviewMarkerLockCss'))return;
  const s=document.createElement('style');
  s.id='blisOverviewMarkerLockCss';
  s.textContent=`
    .ovh .ovh-marker{
      transform:none!important;
      transform-origin:unset!important;
      animation:ovhMarkerGlowLocked 2s ease-in-out infinite!important;
      will-change:filter,opacity;
    }
    @keyframes ovhMarkerGlowLocked{
      0%,100%{filter:drop-shadow(0 0 8px #39a0ff);opacity:.96}
      50%{filter:drop-shadow(0 0 20px #69bcff) drop-shadow(0 0 7px #fff);opacity:1}
    }
    @media(prefers-reduced-motion:reduce){.ovh .ovh-marker{animation:none!important}}
  `;
  document.head.appendChild(s);
}
function align(){
  css();
  const page=document.getElementById('overview');
  if(!page||!page.classList.contains('active'))return false;
  const path=page.querySelector('path.ovh-progress');
  const marker=page.querySelector('circle.ovh-marker');
  if(!path||!marker||typeof path.getTotalLength!=='function')return false;
  try{
    const len=path.getTotalLength();
    if(!Number.isFinite(len)||len<=0)return false;
    const p=path.getPointAtLength(len);
    marker.setAttribute('cx',String(p.x));
    marker.setAttribute('cy',String(p.y));
    marker.style.transform='none';
    marker.style.transformOrigin='unset';
    marker.dataset.lockedToProgress='1';
    return true;
  }catch(e){console.warn('BLIS Overview marker alignment',e);return false}
}
function schedule(){[0,30,90,180,420,900].forEach(ms=>setTimeout(align,ms))}
css();schedule();
['blis:routechange','blis:clientdata','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(ev=>window.addEventListener(ev,schedule));
window.addEventListener('resize',()=>requestAnimationFrame(align),{passive:true});
const root=document.getElementById('overview')||document.body;if(root)new MutationObserver(()=>{if(document.querySelector('.page.active')?.id==='overview')requestAnimationFrame(align)}).observe(root,{childList:true,subtree:true});
window.BLISOverviewMarkerFixV1={align,schedule};
})();

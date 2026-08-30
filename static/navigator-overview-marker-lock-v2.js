/* BLIS Navigator — Overview marker lock v2.
   Keeps the BLIS marker geometrically attached to the actual progress path.
   Motion is glow-only: no SVG transform is allowed on the marker. */
(function(){
'use strict';
if(window.__BLIS_OVERVIEW_MARKER_LOCK_V2)return;window.__BLIS_OVERVIEW_MARKER_LOCK_V2=true;
function css(){
  if(document.getElementById('blisOverviewMarkerLockV2Css'))return;
  const s=document.createElement('style');
  s.id='blisOverviewMarkerLockV2Css';
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
function lock(){
  css();
  const root=document.querySelector('#overview .ovh, #overviewBody .ovh, #overviewPremium .ovh');
  if(!root)return false;
  const path=root.querySelector('path.ovh-progress');
  const marker=root.querySelector('circle.ovh-marker');
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
  }catch(e){console.warn('BLIS overview marker lock',e);return false}
}
function schedule(){[0,30,90,180,420,900].forEach(ms=>setTimeout(lock,ms))}
css();schedule();
['blis:routechange','blis:clientdata','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(ev=>window.addEventListener(ev,schedule));
window.addEventListener('resize',()=>requestAnimationFrame(lock),{passive:true});
const target=document.querySelector('#overview')||document.querySelector('.shell')||document.body;
if(target)new MutationObserver(()=>{if(document.querySelector('.page.active')?.id==='overview')requestAnimationFrame(lock)}).observe(target,{childList:true,subtree:true});
window.BLISOverviewMarkerLockV2={lock,schedule};
})();

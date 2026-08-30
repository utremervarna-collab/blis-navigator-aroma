/* BLIS Navigator — Overview marker geometry fix v1.
   Anchors the current-value marker to the actual end point of the blue progress path. */
(function(){
'use strict';
if(window.__BLIS_OVERVIEW_MARKER_FIX_V1)return;window.__BLIS_OVERVIEW_MARKER_FIX_V1=true;
function align(){
  const page=document.getElementById('overview');
  if(!page||!page.classList.contains('active'))return;
  const path=page.querySelector('.ovh-progress');
  const marker=page.querySelector('.ovh-marker');
  if(!path||!marker||typeof path.getTotalLength!=='function')return;
  try{
    const len=path.getTotalLength();
    const p=path.getPointAtLength(len);
    marker.setAttribute('cx',p.x.toFixed(2));
    marker.setAttribute('cy',p.y.toFixed(2));
  }catch(e){console.warn('BLIS Overview marker alignment',e)}
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(align))}
['blis:routechange','blis:clientdata','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(ev=>window.addEventListener(ev,schedule));
const root=document.getElementById('overview')||document.body;if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
schedule();
window.BLISOverviewMarkerFixV1={align};
})();
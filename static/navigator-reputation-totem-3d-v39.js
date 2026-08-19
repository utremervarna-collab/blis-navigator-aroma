/* BLIS Navigator — Reputation 3D totem interaction v39. No render loop. */
(function(){
'use strict';
if(window.__BLISReputationTotem3DV39)return;window.__BLISReputationTotem3DV39=true;
let bound=null;
function mount(){
  const t=document.querySelector('#reputationBody .rp-totem');
  if(!t||t===bound)return;
  bound=t;t.classList.add('rp-3d-ready');
  const coarse=window.matchMedia?.('(pointer:coarse)')?.matches;
  if(coarse)return;
  const move=e=>{
    const r=t.getBoundingClientRect();if(!r.width||!r.height)return;
    const nx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
    const ny=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
    t.style.setProperty('--rp-ry',`${(nx*5.2).toFixed(2)}deg`);
    t.style.setProperty('--rp-rx',`${(-1.4-ny*2.3).toFixed(2)}deg`);
    t.style.setProperty('--rp-light-x',`${(50+nx*22).toFixed(0)}%`);
  };
  const reset=()=>{t.style.setProperty('--rp-ry','0deg');t.style.setProperty('--rp-rx','-1.5deg');t.style.setProperty('--rp-light-x','50%')};
  t.addEventListener('pointermove',move,{passive:true});
  t.addEventListener('pointerleave',reset,{passive:true});
}
function init(){
  mount();
  const root=document.getElementById('reputationBody');
  if(root)new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes.length))requestAnimationFrame(mount)}).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]'))setTimeout(mount,120)},true);
  document.getElementById('clientSel')?.addEventListener('change',()=>setTimeout(mount,220));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

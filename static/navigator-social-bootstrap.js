/* BLIS Navigator — Social Signals event-driven boot guard v2. */
(function(){
'use strict';
if(window.__BLISSocialBootstrapV2)return;window.__BLISSocialBootstrapV2=true;
const active=()=>document.getElementById('social')?.classList.contains('active');
let rendering=false,lastFingerprint='';
function fingerprint(){try{const d=window.D||{},s=window.S||[],a=window.A||[],h=window.H||[];return [document.body?.dataset?.client||'',Array.isArray(s)?s.length:0,Array.isArray(a)?a.length:0,Array.isArray(h)?h.length:0,Array.isArray(d?.metrics)?d.metrics.length:0,Array.isArray(d?.indices)?d.indices.length:0].join('|')}catch(_){return''}}
function bodyComplete(){const root=document.getElementById('socialBody');return !!(root&&root.querySelector('.sm-kpis')&&root.querySelector('.sm-channel-grid')&&root.querySelector('.sm-network-feeds'))}
function render(force=false){if(!active()||typeof window.BLISSocialSignalsRender!=='function'||rendering)return;const fp=fingerprint();if(!force&&bodyComplete()&&fp===lastFingerprint){requestAnimationFrame(()=>window.BLISSocialInteractivePatch?.());return}rendering=true;Promise.resolve(window.BLISSocialSignalsRender()).catch(e=>console.error('BLIS Social render failed',e)).finally(()=>{rendering=false;lastFingerprint=fingerprint();requestAnimationFrame(()=>window.BLISSocialInteractivePatch?.())})}
function schedule(force=false){requestAnimationFrame(()=>render(force))}
function init(){if(active())schedule(true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button[data-page="social"]'))setTimeout(()=>schedule(true),0)},true);
window.addEventListener('blis:clientdata',()=>{lastFingerprint='';schedule(true)});
window.addEventListener('blis:periodchange',()=>schedule(true));
window.addEventListener('pageshow',()=>{if(active())schedule(false)});
})();
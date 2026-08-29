/* BLIS Navigator — Репутация bootstrap v45. Само каноничният клиентски renderer. */
(function(){
'use strict';
if(window.__BLISReputationBootV45)return;window.__BLISReputationBootV45=true;
const active=()=>document.getElementById('reputation')?.classList.contains('active');
function run(force=false){if(!active())return;try{if(force&&window.BLISReputation?.refresh)return Promise.resolve(window.BLISReputation.refresh());return window.BLISReputation?.render?.()}catch(e){console.error('BLIS Reputation render failed',e)}}
function schedule(force=false){requestAnimationFrame(()=>run(force))}
function init(){if(active())schedule(false)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button[data-page="reputation"]'))setTimeout(()=>schedule(false),0);if(e.target.closest?.('#rpRefresh'))setTimeout(()=>schedule(true),0)},true);
window.addEventListener('blis:clientdata',()=>schedule(false));
window.addEventListener('blis:periodchange',()=>schedule(false));
window.addEventListener('blis:intelligence',()=>schedule(false));
})();

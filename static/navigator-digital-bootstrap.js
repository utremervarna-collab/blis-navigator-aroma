/* BLIS Navigator — Digital Visibility event-driven boot controller v3 */
(function(){
'use strict';
if(window.__BLISDigitalRadarBootV2)return;window.__BLISDigitalRadarBootV2=true;

function loadOnce(attr,src){if(document.querySelector(`script[${attr}]`)||[...document.scripts].some(s=>s.src&&s.src.includes(src)))return;const s=document.createElement('script');s.src=src;s.setAttribute(attr,'1');s.async=false;document.head.appendChild(s)}
function loadDependencies(){loadOnce('data-blis-digital-truth','/navigator-digital-truth-fix.js?v=20260824-digital2');loadOnce('data-blis-digital-interactions','/navigator-digital-interactions.js?v=20260824-digital2')}
function markVisibleRadar(){const shell=document.querySelector('#digitalBody .dv-shell');if(!shell)return; shell.classList.add('digital-radar');shell.setAttribute('data-digital-radar','true')}
function render(){if(!document.getElementById('digital')?.classList.contains('active'))return;try{window.BLISDigitalRadar?.render?.()}catch(e){console.error('BLIS Digital render failed',e)}requestAnimationFrame(()=>{markVisibleRadar();try{window.BLISDigitalInteractionsPatch?.()}catch(_){}})}
function schedule(){requestAnimationFrame(render)}
function init(){loadDependencies();if(document.getElementById('digital')?.classList.contains('active'))schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button[data-page="digital"]'))setTimeout(schedule,0)},true);
window.addEventListener('blis:clientdata',schedule);
window.addEventListener('blis:periodchange',schedule);
})();
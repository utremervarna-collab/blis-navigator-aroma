/* BLIS Navigator — Reputation bootstrap v44. Canonical master only; event driven. */
(function(){
'use strict';
if(window.__BLISReputationBootV44)return;window.__BLISReputationBootV44=true;
function style(attr,href){let l=document.querySelector(`link[${attr}]`);if(!l){l=document.createElement('link');l.rel='stylesheet';l.setAttribute(attr,'1');document.head.appendChild(l)}l.href=href}
function script(attr,src,onload){if(document.querySelector(`script[${attr}]`)||[...document.scripts].some(s=>s.src&&s.src.includes(src.split('?')[0]))){onload?.();return}const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(attr,'1');if(onload)s.onload=onload;document.head.appendChild(s)}
const active=()=>document.getElementById('reputation')?.classList.contains('active');
function afterRun(){try{window.BLISReputationOpinionV34?.apply?.()}catch(_){}try{window.BLISReputationSectionsV36?.apply?.(true)}catch(_){}try{window.BLISReputationExactArtV64?.apply?.()}catch(_){try{window.BLISReputationExactArtV42?.apply?.()}catch(__){}}}
function run(force=false){if(!active())return;try{if(force&&window.BLISReputation?.refresh){Promise.resolve(window.BLISReputation.refresh()).then(afterRun).catch(e=>console.error('BLIS Reputation refresh failed',e));return}window.BLISReputation?.render?.();requestAnimationFrame(afterRun)}catch(e){console.error('BLIS Reputation render failed',e)}}
function schedule(force=false){requestAnimationFrame(()=>run(force))}
function init(){
 const v='20260824-reputation44';
 style('data-blis-metric-inspector','/navigator-metric-inspector-v1.css?v='+v);
 script('data-blis-metric-inspector','/navigator-metric-inspector-v1.js?v='+v,()=>script('data-blis-metric-social','/navigator-metric-social-v2.js?v='+v));
 style('data-blis-reputation-polish','/navigator-reputation-polish.css?v='+v);
 style('data-blis-reputation-refine30','/navigator-reputation-refine-v30.css?v='+v);
 style('data-blis-reputation-sections36','/navigator-reputation-sections-v36.css?v='+v);
 style('data-blis-reputation-totem39','/navigator-reputation-totem-3d-v39.css?v='+v);
 style('data-blis-reputation-totem40','/navigator-reputation-totem-3d-v40.css?v='+v);
 style('data-blis-reputation-exact41','/navigator-reputation-exact-art-v41.css?v='+v);
 script('data-blis-reputation-sections36','/navigator-reputation-sections-v36.js?v='+v);
 script('data-blis-reputation-totem39','/navigator-reputation-totem-3d-v39.js?v='+v);
 script('data-blis-reputation-opinion34','/navigator-reputation-opinion-v34.js?v='+v,()=>{if(active())schedule(false)});
 if(active())schedule(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button[data-page="reputation"]'))setTimeout(()=>schedule(false),0);if(e.target.closest?.('#rpRefresh'))setTimeout(()=>schedule(true),0)},true);
window.addEventListener('blis:clientdata',()=>schedule(false));
window.addEventListener('blis:periodchange',()=>schedule(false));
})();
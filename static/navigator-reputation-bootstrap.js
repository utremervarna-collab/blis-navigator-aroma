/* BLIS Navigator — Reputation bootstrap v39. Stable + global metric inspector + 3D client totem. */
(function(){
'use strict';
if(window.__BLISReputationBoot)return;window.__BLISReputationBoot=true;
function style(attr,href){let l=document.querySelector(`link[${attr}]`);if(!l){l=document.createElement('link');l.rel='stylesheet';l.setAttribute(attr,'1');document.head.appendChild(l)}l.href=href}
function script(attr,src,onload){if(document.querySelector(`script[${attr}]`)){onload?.();return}const s=document.createElement('script');s.src=src;s.setAttribute(attr,'1');if(onload)s.onload=onload;document.head.appendChild(s)}
function active(){return document.getElementById('reputation')?.classList.contains('active')}
function afterRun(){try{window.BLISReputationOpinionV34?.apply?.()}catch(e){}try{window.BLISReputationSectionsV36?.apply?.(true)}catch(e){}}
function run(delay=80,force=false){setTimeout(()=>{if(!active())return;const p=window.BLISReputationStableV33?.run?.(force);Promise.resolve(p).then(afterRun)},delay)}
function wrapRefGo(){const old=window.refGo;if(typeof old!=='function'||old.__repStable39)return false;const wrapped=function(id){const r=old.apply(this,arguments);if(id==='reputation')run(90,false);return r};wrapped.__repStable39=true;window.refGo=wrapped;return true}
function init(){
 style('data-blis-metric-inspector','/navigator-metric-inspector-v1.css?v=20260819-metric1');
 script('data-blis-metric-inspector','/navigator-metric-inspector-v1.js?v=20260819-metric1',()=>script('data-blis-metric-social','/navigator-metric-social-v2.js?v=20260819-metric2'));
 style('data-blis-reputation-polish','/navigator-reputation-polish.css?v=20260819-reputation29');
 style('data-blis-reputation-refine30','/navigator-reputation-refine-v30.css?v=20260819-reputation34');
 style('data-blis-reputation-sections36','/navigator-reputation-sections-v36.css?v=20260819-reputation36');
 style('data-blis-reputation-totem39','/navigator-reputation-totem-3d-v39.css?v=20260819-reputation39');
 script('data-blis-reputation-sections36','/navigator-reputation-sections-v36.js?v=20260819-reputation36');
 script('data-blis-reputation-totem39','/navigator-reputation-totem-3d-v39.js?v=20260819-reputation39');
 script('data-blis-reputation-stable33','/navigator-reputation-stable-v33.js?v=20260819-reputation33',()=>{
   script('data-blis-reputation-opinion34','/navigator-reputation-opinion-v34.js?v=20260819-reputation34',()=>run(70,false));
 });
 wrapRefGo();
 let tries=0;const t=setInterval(()=>{tries++;if(wrapRefGo()||tries>20)clearInterval(t)},150);
 document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]'))run(90,false);if(e.target?.closest?.('#rpRefresh'))setTimeout(()=>window.BLISReputationSectionsV36?.apply?.(true),420)},true);
 document.getElementById('clientSel')?.addEventListener('change',()=>run(180,true));
 if(active())run(80,false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

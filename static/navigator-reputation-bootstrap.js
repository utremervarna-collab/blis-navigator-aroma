/* BLIS Navigator — robust Reputation boot controller, mirroring Digital Visibility architecture. */
(function(){
'use strict';
if(window.__BLISReputationBoot)return;window.__BLISReputationBoot=true;
function renderSoon(delay=40){setTimeout(()=>{try{if(document.getElementById('reputation')?.classList.contains('active')){window.BLISReputation?.render?.();if(!window.BLISReputation?._refreshed){window.BLISReputation._refreshed=true;setTimeout(()=>window.BLISReputation?.refresh?.(),80)}}}catch(e){console.error('BLIS Reputation render failed',e)}},delay)}
function wrapRefGo(){const old=window.refGo;if(typeof old!=='function'||old.__reputationBoot)return false;const wrapped=function(id){const r=old.apply(this,arguments);if(id==='reputation'){renderSoon(20);renderSoon(140);renderSoon(360)}return r};wrapped.__reputationBoot=true;wrapped.__previous=old;window.refGo=wrapped;return true}
function clientRefresh(){try{window.BLISReputation._refreshed=false;window.BLISReputation?.onClient?.();renderSoon(80);renderSoon(260)}catch(e){}}
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]')){renderSoon(20);renderSoon(160);renderSoon(420)}},true);
document.getElementById('clientSel')?.addEventListener('change',()=>setTimeout(clientRefresh,130));
function init(){wrapRefGo();if(document.getElementById('reputation')?.classList.contains('active'))renderSoon(10);let n=0;const t=setInterval(()=>{n++;wrapRefGo();const page=document.getElementById('reputation');if(page?.classList.contains('active')&&!page.querySelector('.rp-screen'))renderSoon(20);if(n>45)clearInterval(t)},120);const body=document.body;if(body)new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes'&&m.attributeName==='data-client'))clientRefresh()}).observe(body,{attributes:true,attributeFilter:['data-client']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
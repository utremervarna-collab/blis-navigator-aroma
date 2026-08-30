/* BLIS Navigator — resilient English healing for late production renders. */
(function(){'use strict';
const EN=()=>window.BLISI18N?.lang==='en'||document.documentElement.lang==='en';
const PASS=()=>{if(EN())try{window.BLISI18N?.apply?.(document)}catch(_){}};
const CHECK=()=>{if(!EN())return;try{const r=window.BLISI18N?.scanBulgarian?.()||[];if(r.length)PASS()}catch(_){}};
const delays=[0,80,180,350,650,1000,1500,2200,3200,4600,6500,9000,12000];
let burstSeq=0;
function burst(){const seq=++burstSeq;for(const ms of delays)setTimeout(()=>{if(seq!==burstSeq&&ms>2200)return;PASS();setTimeout(CHECK,70)},ms)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',burst,{once:true});else burst();
for(const ev of ['blis:clientdata','blis:periodchange','blis:routechange','blis:navigator-route','blis:rendered','blis:i18n-catalog'])window.addEventListener(ev,burst);
window.addEventListener('popstate',burst);
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav,[data-page],[data-client],a[href*="dashboard"]'))setTimeout(burst,0)},true);
setInterval(()=>{if(!EN()||document.hidden)return;CHECK()},1800);
})();

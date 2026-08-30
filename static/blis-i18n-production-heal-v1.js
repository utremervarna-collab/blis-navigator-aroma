/* BLIS Navigator — resilient English healing for late production renders. */
(function(){'use strict';
const EN=()=>window.BLISI18N?.lang==='en'||document.documentElement.lang==='en';
const PASS=()=>{if(EN())try{window.BLISI18N?.apply?.(document)}catch(_){}};
const CHECK=()=>{if(!EN())return;try{const r=window.BLISI18N?.scanBulgarian?.()||[];if(r.length)PASS()}catch(_){}};
let healUntil=Date.now()+15000;
function arm(ms=12000){healUntil=Math.max(healUntil,Date.now()+ms);PASS();setTimeout(PASS,80);setTimeout(PASS,240)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>arm(15000),{once:true});else arm(15000);
for(const ev of ['blis:clientdata','blis:periodchange','blis:routechange','blis:navigator-route','blis:rendered','blis:i18n-catalog'])window.addEventListener(ev,()=>arm(12000));
window.addEventListener('popstate',()=>arm(12000));
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav,[data-page],[data-client],a[href*="dashboard"]'))arm(12000)},true);
setInterval(()=>{if(!EN()||document.hidden)return;if(Date.now()<healUntil)PASS();else CHECK()},500);
})();

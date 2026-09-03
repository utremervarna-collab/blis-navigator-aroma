/* BLIS Navigator — legacy Client Intelligence V2 compatibility shim.
   V2 is retired. It used to re-render duplicated/low-value facts such as
   website availability, absolute follower counts and generic signal fillers.
   V3 owns client-facing analytical content now. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_INTELLIGENCE_CONTENT_V2_RETIRED)return;
window.__BLIS_CLIENT_INTELLIGENCE_CONTENT_V2_RETIRED=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const SEL='.civ2,#civ2-overview,#civ2-monitoring,#civ2-environment,#civ2-competition,#civ2-history';
function purge(){document.querySelectorAll(SEL).forEach(x=>x.remove())}
function schedule(){[0,60,180,450,900,1800,3200].forEach(ms=>setTimeout(purge,ms))}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,.datebox,[data-page],[data-n3-page]'))schedule()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('load',schedule,{once:true});
window.BLISClientIntelligenceContentV2={retired:true,purge,schedule};
})();

/* BLIS Navigator Metric Intelligence v3.4 — retired from client Overview.
   Raw metric telemetry remains available to the backend/internal analytical
   layer, but is no longer rendered as client-facing content. */
(function(){
'use strict';
if(window.__BLIS_METRIC33)return;
window.__BLIS_METRIC33=true;
function remove(){
  document.querySelectorAll('#overview .mi33').forEach(x=>x.remove());
  document.getElementById('mi33css')?.remove();
}
for(const ev of ['blis:routechange','blis:clientdata','blis:periodchange']){
  window.addEventListener(ev,remove);
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',remove,{once:true});
}else{
  remove();
}
window.BLISMetricIntelligenceV33={remove,retired:true};
})();

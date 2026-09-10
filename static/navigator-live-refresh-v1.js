/* BLIS Navigator — 24/7 visible-data refresh v1. */
(function(){
'use strict';
if(window.__BLIS_LIVE_REFRESH_V1)return;window.__BLIS_LIVE_REFRESH_V1=true;
const INTERVAL=15000;
let busy=false,timer=0;
const nativeFetch=window.fetch.bind(window);
window.fetch=function(input,init){
  try{
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    const u=new URL(raw,location.origin);
    if(/^\/api\/clients\/[^/]+\/(dashboard|sources|data-quality|activity|history|keywords|reports|exports)$/.test(u.pathname)){
      init=Object.assign({},init||{},{cache:'no-store'});
    }
  }catch(_){}
  return nativeFetch(input,init);
};
async function refresh(){
  if(busy||document.hidden||typeof load!=='function')return;
  busy=true;
  try{
    await load();
    document.body.dataset.blisLive='true';
    document.body.dataset.blisLiveUpdated=String(Date.now());
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:document.body.dataset.client||'',realtime:true,at:new Date().toISOString()}}));
    requestAnimationFrame(function(){try{window.BLISCanonicalRenderActive?.()}catch(_){}});
  }catch(e){console.warn('BLIS live refresh',e?.message||e)}finally{busy=false}
}
function start(){
  clearInterval(timer);timer=setInterval(refresh,INTERVAL);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh()});
  window.addEventListener('focus',refresh);
}
window.BLISLiveRefresh={refresh:refresh,interval:INTERVAL,version:'1.0-production-shell'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

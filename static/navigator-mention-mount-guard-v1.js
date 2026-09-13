/* BLIS Navigator — targeted mention mount guard.
   Watches only the two canonical page hosts so a renderer refresh cannot remove
   the visible mention chronology. No global DOM observation and no data reload. */
(function(){
'use strict';
if(window.__BLIS_MENTION_MOUNT_GUARD_V1)return;
window.__BLIS_MENTION_MOUNT_GUARD_V1=true;
const watched=new WeakSet();
let timer=0;
function schedule(){
  clearTimeout(timer);
  timer=setTimeout(()=>window.BLISLiveRefresh?.renderStreams?.(),60);
}
function watch(host){
  if(!host||watched.has(host))return;
  watched.add(host);
  new MutationObserver(records=>{
    const external=records.some(r=>{
      const t=r.target;
      return !(t instanceof Element)||!t.closest('.blis-ms');
    });
    if(external)schedule();
  }).observe(host,{childList:true,subtree:true});
}
function attach(){
  watch(document.getElementById('competitionBody'));
  watch(document.getElementById('n3SocialRoot'));
  schedule();
}
for(const ev of ['blis:production-ready','blis:routechange','blis:navigator-route','blis:clientdata'])window.addEventListener(ev,()=>setTimeout(attach,0));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
setTimeout(attach,300);setTimeout(attach,1000);
})();

/* TOP Rent A Car public Bulgarian presentation guard. */
(function(){
'use strict';
if(window.__TOP_RENT_BG_PUBLIC_CLEANUP_V1)return;
window.__TOP_RENT_BG_PUBLIC_CLEANUP_V1=true;
function isTop(){
  try{return (new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'')==='top-rent-a-car'}
  catch(_){return document.body?.dataset?.client==='top-rent-a-car'}
}
const replacements=[
  ['Market Command Center','Пазарен команден център'],
  ['Price Intelligence Radar','Ценова позиция'],
  ['Demand Forecast','Прогноза за търсенето'],
  ['Fleet Allocation Signal','Автопарк'],
  ['Scenario Matrix','Сценарии'],
  ['Economy / Compact','Икономичен / Компактен'],
  ['business travel','служебни пътувания'],
  ['business demand','служебно търсене'],
  ['city demand','градско търсене'],
  ['resort demand','курортно търсене'],
  ['cross-border traffic','трансграничен поток'],
  ['local demand','локално търсене'],
  ['pricing','цени'],
  ['events','събития'],
  ['expansion proof','развитие на пазара']
];
function clean(){
  if(!isTop())return;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const n of nodes){
    let v=n.nodeValue||'',o=v;
    for(const [a,b] of replacements)v=v.split(a).join(b);
    if(v!==o)n.nodeValue=v;
  }
  document.querySelectorAll('.trcc-sub,.trcc-opsub,.trcc-guard,.trcc-questions,.trcc-pills').forEach(n=>n.remove());
}
let t=0;const schedule=()=>{clearTimeout(t);t=setTimeout(clean,30)};
for(const e of ['blis:production-ready','blis:clientdata','blis:routechange','blis:navigator-route','popstate'])window.addEventListener(e,schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
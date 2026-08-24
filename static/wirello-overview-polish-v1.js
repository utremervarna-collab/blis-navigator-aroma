/* Wirello Market — overview visual cleanup v2.
   Wirello-only hard DOM correction. It runs after every Navigator repaint so
   V15 cannot restore the oversized summary gap or dense daily chart markers. */
(function(){
'use strict';
if(window.__WIRELLO_OVERVIEW_POLISH_V2)return;window.__WIRELLO_OVERVIEW_POLISH_V2=true;
const isWirello=()=>document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
let busy=false;
function important(el,prop,val){if(el)el.style.setProperty(prop,val,'important')}
function fix(){
 if(!isWirello()||busy)return;busy=true;
 try{
  const ov=document.getElementById('overview');
  if(!ov)return;

  const summary=ov.querySelector('.n15-summary');
  const grid=ov.querySelector('.n15-summarygrid');
  if(summary&&grid){
   important(summary,'display','flex');
   important(summary,'flex-direction','column');
   important(summary,'align-content','initial');
   important(summary,'align-items','stretch');
   important(grid,'display','grid');
   important(grid,'grid-template-columns','repeat(2,minmax(0,1fr))');
   important(grid,'grid-template-rows','repeat(2,minmax(0,1fr))');
   important(grid,'flex','1 1 auto');
   important(grid,'height','auto');
   important(grid,'min-height','0');
   important(grid,'align-items','stretch');
   grid.querySelectorAll('.n15-summaryitem').forEach(item=>{
    important(item,'display','flex');
    important(item,'flex-direction','column');
    important(item,'justify-content','center');
    important(item,'min-height','0');
    important(item,'height','auto');
   });
  }

  const curveArea=ov.querySelector('.n15-curvearea');
  if(curveArea){important(curveArea,'height','200px');important(curveArea,'overflow','hidden')}
  ov.querySelectorAll('.n15-chartdot').forEach(n=>n.remove());
  ov.querySelectorAll('.blis-curve-point').forEach(n=>n.remove());
  ov.querySelectorAll('.n15-smoothchart .curve').forEach(p=>important(p,'stroke-width','3.2'));
  ov.querySelectorAll('.n15-smoothchart,.wirello-stable-curve').forEach(svg=>{
   important(svg,'width','100%');important(svg,'height','100%');important(svg,'display','block');
  });
 }finally{busy=false}
}
function installStyle(){
 if(!isWirello()||document.getElementById('wirello-overview-polish-v2-style'))return;
 const s=document.createElement('style');s.id='wirello-overview-polish-v2-style';s.textContent=`
 body[data-client="wirello"] #overview .n15-summary{display:flex!important;flex-direction:column!important;align-items:stretch!important}
 body[data-client="wirello"] #overview .n15-summarygrid{flex:1 1 auto!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;align-items:stretch!important;min-height:0!important}
 body[data-client="wirello"] #overview .n15-summaryitem{display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:0!important}
 body[data-client="wirello"] #overview .n15-chartdot,body[data-client="wirello"] #overview .blis-curve-point{display:none!important}
 body[data-client="wirello"] #overview .n15-curvearea{height:200px!important;overflow:hidden!important}
 body[data-client="wirello"] #overview .n15-smoothchart .curve{stroke-width:3.2!important}
 `;document.head.appendChild(s);
}
function schedule(){[0,40,120,300,700,1400].forEach(ms=>setTimeout(fix,ms))}
function init(){if(!isWirello())return;installStyle();schedule();const ov=document.getElementById('overview');if(ov){new MutationObserver(()=>{if(!busy)requestAnimationFrame(fix)}).observe(ov,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="overview"]'))schedule()},true);
window.addEventListener('blis:clientdata',schedule);
window.addEventListener('popstate',schedule);
window.addEventListener('hashchange',schedule);
})();
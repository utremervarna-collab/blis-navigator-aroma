/* Wirello Market — overview visual cleanup v1.
   Wirello-only CSS: removes dense daily point markers and eliminates the
   unused empty area in the period summary card without touching canonical UI. */
(function(){
'use strict';
if(window.__WIRELLO_OVERVIEW_POLISH_V1)return;window.__WIRELLO_OVERVIEW_POLISH_V1=true;
const isWirello=()=>document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
function install(){
 if(!isWirello()||document.getElementById('wirello-overview-polish-v1-style'))return;
 const s=document.createElement('style');
 s.id='wirello-overview-polish-v1-style';
 s.textContent=`
 body[data-client="wirello"] #overview .n15-summary{
   grid-template-rows:auto auto minmax(0,1fr)!important;
   align-content:stretch!important;
 }
 body[data-client="wirello"] #overview .n15-summarygrid{
   height:100%!important;
   grid-template-rows:repeat(2,minmax(0,1fr))!important;
   align-items:stretch!important;
 }
 body[data-client="wirello"] #overview .n15-summaryitem{
   min-height:0!important;
   display:flex!important;
   flex-direction:column!important;
   justify-content:center!important;
 }
 body[data-client="wirello"] #overview .n15-curvebox{
   overflow:hidden!important;
 }
 body[data-client="wirello"] #overview .n15-curvearea{
   height:200px!important;
   overflow:hidden!important;
 }
 body[data-client="wirello"] #overview .n15-smoothchart{
   shape-rendering:geometricPrecision!important;
 }
 body[data-client="wirello"] #overview .n15-smoothchart .curve{
   stroke-width:3.2!important;
 }
 body[data-client="wirello"] #overview .n15-chartdot{
   display:none!important;
 }
 body[data-client="wirello"] .wirello-stable-curve .blis-curve-point{
   display:none!important;
 }
 body[data-client="wirello"] #overview .n15-curvebox .head span{
   white-space:nowrap;
 }
 `;
 document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('blis:clientdata',install);
})();

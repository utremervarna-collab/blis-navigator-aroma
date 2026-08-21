/* BLIS Navigator — Competition motion fix V6. */
(function(){
'use strict';
let raf=0;
function css(){if(document.getElementById('cmpMotionV6CSS'))return;const s=document.createElement('style');s.id='cmpMotionV6CSS';s.textContent=`
.cmpv5-pod{transition:transform .18s ease,filter .18s ease,box-shadow .18s ease!important}
.cmpv5-trail{transition:none!important}

/* Dynamics layout guard: label/value on top, chart full width below. */
html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  grid-template-areas:"label current" "viz viz"!important;
  grid-template-rows:auto auto!important;
  column-gap:18px!important;
  row-gap:12px!important;
  align-items:start!important;
  padding:16px 0 8px!important;
  min-width:0!important;
}
html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-label{
  grid-area:label!important;
  min-width:0!important;
  align-self:start!important;
}
html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current{
  grid-area:current!important;
  min-width:124px!important;
  max-width:150px!important;
  text-align:right!important;
  align-self:start!important;
  justify-self:end!important;
}
html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current b{
  display:block!important;
  font-size:23px!important;
  line-height:1.05!important;
  white-space:nowrap!important;
}
html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current small{
  display:block!important;
  margin-top:4px!important;
}
html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-viz{
  grid-area:viz!important;
  width:100%!important;
  min-width:0!important;
  max-width:none!important;
  height:170px!important;
  overflow:hidden!important;
  justify-self:stretch!important;
}
html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-viz svg{
  display:block!important;
  width:100%!important;
  height:100%!important;
  overflow:hidden!important;
}
@media(max-width:820px){
  html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){
    grid-template-columns:1fr!important;
    grid-template-areas:"label" "current" "viz"!important;
  }
  html body #competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current{
    justify-self:start!important;
    text-align:left!important;
  }
}
`;
document.head.appendChild(s)}
function frame(){const page=document.getElementById('competition');if(page?.classList.contains('active')){document.querySelectorAll('.cmpv5-pod[data-pod]').forEach(p=>{const n=parseFloat(p.style.getPropertyValue('--p')||getComputedStyle(p).getPropertyValue('--p'));if(Number.isFinite(n))p.style.left=Math.max(2.8,Math.min(96.5,n))+'%'});document.querySelectorAll('.cmpv5-trail[data-trail]').forEach(t=>{const n=parseFloat(t.style.getPropertyValue('--p')||getComputedStyle(t).getPropertyValue('--p'));if(Number.isFinite(n))t.style.width=Math.max(0,Math.min(96.5,n))+'%'})}raf=requestAnimationFrame(frame)}
function start(){css();if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.addEventListener('blis:clientdata',start);
})();
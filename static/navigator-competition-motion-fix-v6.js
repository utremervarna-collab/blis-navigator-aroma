/* BLIS Navigator — Competition motion fix V6. */
(function(){
'use strict';
let raf=0;
function css(){if(document.getElementById('cmpMotionV6CSS'))return;const s=document.createElement('style');s.id='cmpMotionV6CSS';s.textContent='.cmpv5-pod{transition:transform .18s ease,filter .18s ease,box-shadow .18s ease!important}.cmpv5-trail{transition:none!important}';document.head.appendChild(s)}
function frame(){const page=document.getElementById('competition');if(page?.classList.contains('active')){document.querySelectorAll('.cmpv5-pod[data-pod]').forEach(p=>{const n=parseFloat(p.style.getPropertyValue('--p')||getComputedStyle(p).getPropertyValue('--p'));if(Number.isFinite(n))p.style.left=Math.max(2.8,Math.min(96.5,n))+'%'});document.querySelectorAll('.cmpv5-trail[data-trail]').forEach(t=>{const n=parseFloat(t.style.getPropertyValue('--p')||getComputedStyle(t).getPropertyValue('--p'));if(Number.isFinite(n))t.style.width=Math.max(0,Math.min(96.5,n))+'%'})}raf=requestAnimationFrame(frame)}
function start(){css();if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.addEventListener('blis:clientdata',start);
})();
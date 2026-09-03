/* BLIS Navigator — Monitoring polish v3
   Finalizes Monitoring labels and gives the observation profile a restrained
   live radar motion without changing the underlying values. */
(function(){
'use strict';
if(window.__BLIS_MONITORING_POLISH_V3)return;
window.__BLIS_MONITORING_POLISH_V3=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;

const SVG='http://www.w3.org/2000/svg';
let queued=false,observer=null;

function rewriteText(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  for(const node of nodes){
    const old=node.nodeValue||'';
    let next=old
      .replace(/Интелигентен\s+радар/gi,'Радар')
      .replace(/Канално\s+присъствие(?:\s+в\s+радара)?/gi,'Източников обхват');
    if(next!==old)node.nodeValue=next;
  }
  root.querySelectorAll('[aria-label],[title]').forEach(el=>{
    for(const a of ['aria-label','title']){
      const old=el.getAttribute(a);if(!old)continue;
      const next=old.replace(/Интелигентен\s+радар/gi,'Радар').replace(/Канално\s+присъствие(?:\s+в\s+радара)?/gi,'Източников обхват');
      if(next!==old)el.setAttribute(a,next);
    }
  });
}

function css(){
  if(document.getElementById('monitoringPolishV3CSS'))return;
  const s=document.createElement('style');s.id='monitoringPolishV3CSS';s.textContent=`
#social .mon2-radar{overflow:visible}
#social .mon2-radar-area{transform-box:fill-box;transform-origin:center;animation:mon3AreaPulse 3.4s ease-in-out infinite;filter:drop-shadow(0 0 5px rgba(49,118,172,.18))}
#social .mon2-radar circle:not(.mon3-center):not(.mon3-pulse){transform-box:fill-box;transform-origin:center;animation:mon3DotPulse 2.4s ease-in-out infinite;filter:drop-shadow(0 0 3px rgba(49,118,172,.45))}
#social .mon2-radar .mon3-sweep{transform-box:view-box;transform-origin:180px 145px;animation:mon3Sweep 7.5s linear infinite;stroke:#5aa4d4;stroke-width:1.6;stroke-linecap:round;opacity:.42;filter:drop-shadow(0 0 4px rgba(49,118,172,.45))}
#social .mon2-radar .mon3-center{fill:#3176ac;stroke:#fff;stroke-width:2;filter:drop-shadow(0 0 6px rgba(49,118,172,.65))}
#social .mon2-radar .mon3-pulse{fill:none;stroke:#4c95c7;stroke-width:1.5;transform-box:fill-box;transform-origin:center;animation:mon3CenterPulse 2.15s ease-out infinite}
@keyframes mon3AreaPulse{0%,100%{opacity:.78;transform:scale(.995)}50%{opacity:1;transform:scale(1.018)}}
@keyframes mon3DotPulse{0%,100%{transform:scale(1);opacity:.82}50%{transform:scale(1.45);opacity:1}}
@keyframes mon3Sweep{to{transform:rotate(360deg)}}
@keyframes mon3CenterPulse{0%{transform:scale(.45);opacity:.75}80%,100%{transform:scale(2.4);opacity:0}}
@media (prefers-reduced-motion:reduce){#social .mon2-radar-area,#social .mon2-radar circle,#social .mon2-radar .mon3-sweep{animation:none!important}}
`;
  document.head.appendChild(s);
}

function animateProfile(root){
  root?.querySelectorAll('.mon2-radar').forEach(svg=>{
    svg.querySelectorAll('circle:not(.mon3-center):not(.mon3-pulse)').forEach((c,i)=>c.style.animationDelay=`${(i%6)*.22}s`);
    if(!svg.querySelector('.mon3-sweep')){
      const sweep=document.createElementNS(SVG,'line');
      sweep.setAttribute('class','mon3-sweep');sweep.setAttribute('x1','180');sweep.setAttribute('y1','145');sweep.setAttribute('x2','180');sweep.setAttribute('y2','40');
      svg.appendChild(sweep);
    }
    if(!svg.querySelector('.mon3-center')){
      const pulse=document.createElementNS(SVG,'circle');pulse.setAttribute('class','mon3-pulse');pulse.setAttribute('cx','180');pulse.setAttribute('cy','145');pulse.setAttribute('r','8');svg.appendChild(pulse);
      const center=document.createElementNS(SVG,'circle');center.setAttribute('class','mon3-center');center.setAttribute('cx','180');center.setAttribute('cy','145');center.setAttribute('r','4');svg.appendChild(center);
    }
  });
}

function apply(){queued=false;const root=document.getElementById('social');if(!root)return;css();rewriteText(root);animateProfile(root)}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(apply))}
function watch(){const root=document.getElementById('social');if(!root)return;if(observer)observer.disconnect();observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title']});schedule()}

for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,()=>setTimeout(watch,40));
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,[data-page],[data-n3-page]'))setTimeout(watch,80)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
window.addEventListener('load',()=>setTimeout(watch,120),{once:true});
})();

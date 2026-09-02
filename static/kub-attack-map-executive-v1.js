/* KUB executive intelligence map: compact, light, card-based network. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
const COLORS={political:'#c9474d',institutional:'#347fae',media:'#d38a2c',stakeholder:'#7856ae'};
const TINTS={political:'#fff4f4',institutional:'#f2f8fc',media:'#fff8ee',stakeholder:'#f7f3fc'};
function style(){
 if(document.getElementById('kub-exec-map-style'))return;
 const s=document.createElement('style');s.id='kub-exec-map-style';s.textContent=`
 #attackmap{padding-top:4px!important}
 #attackmap .kubam-grid{display:grid!important;grid-template-columns:minmax(0,1.22fr) minmax(300px,.78fr)!important;gap:14px!important;align-items:stretch!important}
 #attackmap .kubam-map-card{min-width:0!important;max-width:100%!important;padding:13px!important;border:1px solid #dfe7ed!important;border-radius:18px!important;background:#fff!important;box-shadow:0 10px 28px rgba(43,68,86,.08)!important;overflow:hidden!important}
 #attackmap .kubam-head{margin-bottom:7px!important;align-items:center!important}.kubam-head h3{font-size:15px!important;color:#1d3446!important}.kubam-head p{font-size:9px!important;color:#738493!important}
 #attackmap .kubam-filter{padding:5px 8px!important;font-size:8.3px!important;border:1px solid #dde6ec!important;background:#fff!important;color:#6e7d88!important;box-shadow:none!important}
 #attackmap .kubam-filter.active{background:#eef5fa!important;border-color:#b6cddd!important;color:#315f7e!important;font-weight:900!important}
 #attackmap .kubam-canvas{width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important;min-height:0!important;aspect-ratio:670/470!important;overflow:hidden!important;border:1px solid #e6edf2!important;border-radius:16px!important;background:linear-gradient(180deg,#fbfdfe,#f8fbfd)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.9)!important;position:relative!important}
 #attackmap .kubam-canvas:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(66,105,131,.025) 1px,transparent 1px),linear-gradient(rgba(66,105,131,.025) 1px,transparent 1px);background-size:28px 28px;mask-image:radial-gradient(circle at center,#000 20%,transparent 78%)}
 #attackmap .kubam-canvas svg{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;max-height:100%!important;position:relative;z-index:1}
 #attackmap .kubam-node-circle,#attackmap .kubam-ring,#attackmap .kubam-center-ring,#attackmap .kubam-center-core{display:none!important}
 #attackmap .kubam-link{opacity:.46!important;stroke-width:1.45!important;stroke-dasharray:0!important;filter:none!important}.kubam-link.hot{opacity:.72!important;stroke-width:1.9!important}
 #attackmap .kubam-node{cursor:pointer!important;transition:opacity .18s ease,filter .18s ease!important}.kubam-node:hover{filter:drop-shadow(0 8px 8px rgba(39,62,78,.15))!important}.kubam-node.active{filter:drop-shadow(0 7px 7px rgba(39,62,78,.13))!important}
 #attackmap .kubam-node-title{font-size:9.2px!important;font-weight:900!important;fill:#263f51!important;stroke:none!important;paint-order:normal!important}.kubam-node-sub{font-size:7.2px!important;font-weight:700!important;fill:#607482!important}.kubam-center-title{fill:#fff!important;font-size:18px!important;font-weight:950!important;stroke:none!important}.kubam-center-sub{fill:#d9ebf7!important;font-size:8.1px!important;font-weight:800!important}
 #attackmap .kubex-card{stroke-width:1.4}.kubex-card-shadow{fill:#263f51;opacity:.075}.kubex-accent{opacity:.95}.kubex-center-shadow{fill:#17384f;opacity:.13}.kubex-center{fill:url(#kubexCenterGrad);stroke:#6fa5c8;stroke-width:1.6}.kubex-orbit{fill:none;stroke:#dce8ef;stroke-width:1}.kubex-orbit2{fill:none;stroke:#edf3f6;stroke-width:1;stroke-dasharray:3 6}.kubex-dot{fill:#fff;stroke-width:1.4}
 #attackmap .kubam-legend{justify-content:center!important;gap:9px!important;margin:8px 0 0!important;font-size:8.2px!important;color:#70808d!important}.kubam-legend span{display:inline-flex!important;align-items:center!important;padding:4px 7px!important;background:#fff!important;border:1px solid #e4eaee!important;border-radius:999px!important}.kubam-legend i{width:7px!important;height:7px!important;box-shadow:none!important}
 #attackmap .kubaml-badge{filter:none!important}.kubaml-hot{filter:drop-shadow(0 7px 8px rgba(39,62,78,.13))!important}
 #attackmap .kubam-detail{min-width:0!important}.kubam-lower{display:grid!important}
 @media(max-width:1180px){#attackmap .kubam-grid{grid-template-columns:minmax(0,1.08fr) minmax(280px,.92fr)!important}#attackmap .kubam-head{display:block!important}#attackmap .kubam-filters{justify-content:flex-start!important;margin-top:7px!important}}
 @media(max-width:980px){#attackmap .kubam-grid{grid-template-columns:1fr!important}#attackmap .kubam-canvas{max-width:740px!important;margin:0 auto!important}.kubam-detail{min-height:0!important}}
 @media(max-width:700px){#attackmap .kubam-map-card{padding:10px!important}#attackmap .kubam-canvas{aspect-ratio:670/500!important}.kubam-node-title{font-size:8.7px!important}.kubam-node-sub{font-size:6.9px!important}}
 `;document.head.appendChild(s);
}
function el(ns,name,attrs){const x=document.createElementNS(ns,name);Object.entries(attrs||{}).forEach(([k,v])=>x.setAttribute(k,v));return x;}
function transformSvg(){
 const svg=document.querySelector('#attackmap .kubam-canvas svg');if(!svg)return false;if(svg.querySelector('#kubexDefs'))return true;
 const ns='http://www.w3.org/2000/svg';
 const defs=el(ns,'defs',{id:'kubexDefs'});defs.innerHTML='<linearGradient id="kubexCenterGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#397da8"/><stop offset="1" stop-color="#1f5679"/></linearGradient>';
 svg.insertBefore(defs,svg.firstChild);
 const first=svg.querySelector('g');
 const decor=el(ns,'g',{class:'kubex-decor'});
 decor.appendChild(el(ns,'ellipse',{cx:'335',cy:'225',rx:'184',ry:'129',class:'kubex-orbit'}));
 decor.appendChild(el(ns,'ellipse',{cx:'335',cy:'225',rx:'142',ry:'98',class:'kubex-orbit2'}));
 if(first)svg.insertBefore(decor,first);else svg.appendChild(decor);
 // Convert straight connector lines into clean, slightly curved paths.
 [...svg.querySelectorAll('.kubam-link')].forEach(line=>{
   const x1=+line.getAttribute('x1'),y1=+line.getAttribute('y1'),x2=+line.getAttribute('x2'),y2=+line.getAttribute('y2');
   const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.hypot(dx,dy));
   const bend=Math.min(18,len*.07),cx=mx-(dy/len)*bend,cy=my+(dx/len)*bend;
   const p=el(ns,'path',{d:`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,class:line.getAttribute('class')||'kubam-link','data-type':line.dataset.type||''});
   p.style.stroke=COLORS[line.dataset.type]||'#9eb0bc';p.style.fill='none';line.replaceWith(p);
 });
 // Replace circular nodes with compact executive cards.
 svg.querySelectorAll('.kubam-node').forEach(g=>{
   const type=g.dataset.type||'institutional',color=COLORS[type]||'#6d8798',tint=TINTS[type]||'#f5f8fa';
   const shadow=el(ns,'rect',{x:'-49',y:'-28',width:'98',height:'58',rx:'14',class:'kubex-card-shadow'});shadow.setAttribute('transform','translate(0 4)');
   const card=el(ns,'rect',{x:'-49',y:'-28',width:'98',height:'58',rx:'14',class:'kubex-card',fill:tint,stroke:color});
   const accent=el(ns,'rect',{x:'-49',y:'-28',width:'6',height:'58',rx:'3',class:'kubex-accent',fill:color});
   const dot=el(ns,'circle',{cx:'37',cy:'-17',r:'4.2',class:'kubex-dot',stroke:color});
   const firstGraphic=g.querySelector('.kubam-ring,.kubam-node-circle');g.insertBefore(shadow,firstGraphic||g.firstChild);g.insertBefore(card,firstGraphic||g.firstChild);g.insertBefore(accent,firstGraphic||g.firstChild);g.insertBefore(dot,firstGraphic||g.firstChild);
   const title=g.querySelector('.kubam-node-title'),sub=g.querySelector('.kubam-node-sub');if(title)title.setAttribute('y','-5');if(sub)sub.setAttribute('y','10');
   const texts=[...g.querySelectorAll('.kubam-node-sub')];if(texts.length>1)texts[texts.length-1].setAttribute('y','22');
 });
 // Central KUB hub becomes a compact anchor card.
 const cr=svg.querySelector('.kubam-center-ring'),cc=svg.querySelector('.kubam-center-core');
 const cs=el(ns,'rect',{x:'273',y:'187',width:'124',height:'82',rx:'23',class:'kubex-center-shadow'});cs.setAttribute('transform','translate(0 5)');
 const c=el(ns,'rect',{x:'273',y:'187',width:'124',height:'82',rx:'23',class:'kubex-center'});
 const anchor=cr||cc||svg.querySelector('.kubam-center-title');svg.insertBefore(cs,anchor);svg.insertBefore(c,anchor);
 const ct=svg.querySelector('.kubam-center-title');if(ct)ct.setAttribute('y','219');const subs=[...svg.querySelectorAll('.kubam-center-sub')];if(subs[0])subs[0].setAttribute('y','238');if(subs[1])subs[1].setAttribute('y','252');
 return true;
}
function boot(){style();const wait=()=>{if(document.getElementById('attackmap')&&transformSvg())return;setTimeout(wait,90);};wait();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
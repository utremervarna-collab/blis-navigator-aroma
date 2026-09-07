/* KUB pressure-map premium contrast/interaction override. */
(function(){
'use strict';
if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;

function addStyle(){
  if(document.getElementById('kub-attack-map-premium-style'))return;
  const s=document.createElement('style');
  s.id='kub-attack-map-premium-style';
  s.textContent=`
  #attackmap .kubam-canvas{
    background:
      radial-gradient(circle at 50% 48%,rgba(71,142,194,.12) 0,rgba(71,142,194,.035) 30%,transparent 52%),
      linear-gradient(180deg,#ffffff 0%,#f7fbfe 100%)!important;
    border-color:#d8e5ee!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 0 42px rgba(52,99,131,.045),0 10px 28px rgba(39,67,87,.07)!important;
  }
  #attackmap .kubam-link{
    stroke-width:2.2!important;
    opacity:.72!important;
    filter:drop-shadow(0 1px 1px rgba(36,64,84,.10))!important;
    transition:stroke-width .16s ease,opacity .16s ease,filter .16s ease!important;
  }
  #attackmap .kubam-link.hot{
    stroke-width:3!important;
    opacity:.92!important;
    filter:drop-shadow(0 2px 2px rgba(36,64,84,.15))!important;
  }
  #attackmap .kubam-node{
    cursor:pointer!important;
    outline:none!important;
  }
  #attackmap .kubex-card{
    stroke-width:2!important;
    filter:drop-shadow(0 8px 7px rgba(31,58,78,.16))!important;
    transition:filter .16s ease,stroke-width .16s ease,opacity .16s ease!important;
  }
  #attackmap .kubex-card-shadow{
    fill:#18384f!important;
    opacity:.14!important;
    transition:opacity .16s ease!important;
  }
  #attackmap .kubex-accent{opacity:1!important;filter:drop-shadow(1px 0 1px rgba(20,48,67,.12))!important}
  #attackmap .kubex-dot{
    fill:#fff!important;
    stroke-width:2!important;
    filter:drop-shadow(0 2px 2px rgba(25,53,72,.18))!important;
    transition:filter .16s ease,stroke-width .16s ease!important;
  }
  #attackmap .kubex-shine{pointer-events:none!important;opacity:.72!important}

  #attackmap .kubam-node-title{
    font-size:10.6px!important;
    font-weight:950!important;
    fill:#102a3c!important;
    stroke:none!important;
    paint-order:normal!important;
    letter-spacing:-.08px!important;
  }
  #attackmap .kubam-node-sub{
    font-size:8.15px!important;
    font-weight:800!important;
    fill:#355064!important;
    stroke:none!important;
    paint-order:normal!important;
  }
  #attackmap .kubam-center-title{fill:#fff!important;font-weight:950!important}
  #attackmap .kubam-center-sub{fill:#e7f4fc!important;font-weight:850!important}

  #attackmap .kubam-node[data-type="political"] .kubex-card{fill:url(#kubpremPolitical)!important;stroke:#d94850!important}
  #attackmap .kubam-node[data-type="institutional"] .kubex-card{fill:url(#kubpremInstitutional)!important;stroke:#2f86bf!important}
  #attackmap .kubam-node[data-type="media"] .kubex-card{fill:url(#kubpremMedia)!important;stroke:#dc8b20!important}
  #attackmap .kubam-node[data-type="stakeholder"] .kubex-card{fill:url(#kubpremStakeholder)!important;stroke:#7951bd!important}

  #attackmap .kubam-node:hover .kubex-card,
  #attackmap .kubam-node.active .kubex-card,
  #attackmap .kubam-node:focus-visible .kubex-card{
    stroke-width:2.9!important;
    filter:drop-shadow(0 13px 11px rgba(27,54,73,.24)) brightness(1.015)!important;
  }
  #attackmap .kubam-node:hover .kubex-card-shadow,
  #attackmap .kubam-node.active .kubex-card-shadow,
  #attackmap .kubam-node:focus-visible .kubex-card-shadow{opacity:.22!important}
  #attackmap .kubam-node:hover .kubex-dot,
  #attackmap .kubam-node.active .kubex-dot,
  #attackmap .kubam-node:focus-visible .kubex-dot{stroke-width:2.8!important;filter:drop-shadow(0 0 5px currentColor)!important}
  #attackmap .kubam-node.active .kubex-card{filter:drop-shadow(0 15px 13px rgba(24,51,70,.28)) brightness(1.025)!important}

  #attackmap .kubam-filter{font-weight:750!important;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important}
  #attackmap .kubam-filter:hover{transform:translateY(-1px)!important;box-shadow:0 5px 12px rgba(38,66,85,.10)!important;border-color:#bfd1dc!important}
  #attackmap .kubam-filter.active{box-shadow:inset 0 1px 0 #fff,0 4px 10px rgba(47,93,123,.10)!important}

  @media(max-width:700px){
    #attackmap .kubam-node-title{font-size:9.8px!important}
    #attackmap .kubam-node-sub{font-size:7.65px!important}
    #attackmap .kubam-link{stroke-width:2.35!important;opacity:.78!important}
    #attackmap .kubam-link.hot{stroke-width:3.1!important}
  }
  `;
  document.head.appendChild(s);
}

function makeDefs(svg){
  if(svg.querySelector('#kubpremDefs'))return;
  const ns='http://www.w3.org/2000/svg';
  const defs=document.createElementNS(ns,'defs');
  defs.id='kubpremDefs';
  defs.innerHTML=`
    <linearGradient id="kubpremPolitical" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".34" stop-color="#fff3f4"/><stop offset="1" stop-color="#ffdfe2"/></linearGradient>
    <linearGradient id="kubpremInstitutional" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".34" stop-color="#f0f8fe"/><stop offset="1" stop-color="#dceefb"/></linearGradient>
    <linearGradient id="kubpremMedia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".34" stop-color="#fff7eb"/><stop offset="1" stop-color="#ffe5bd"/></linearGradient>
    <linearGradient id="kubpremStakeholder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".34" stop-color="#f8f3ff"/><stop offset="1" stop-color="#e9ddfb"/></linearGradient>`;
  svg.insertBefore(defs,svg.firstChild);
}

function enhanceNodes(svg){
  const ns='http://www.w3.org/2000/svg';
  svg.querySelectorAll('.kubam-node').forEach(g=>{
    g.setAttribute('tabindex','0');
    g.setAttribute('role','button');
    g.setAttribute('aria-label','Натисни за детайли');
    if(!g.querySelector(':scope > title')){
      const t=document.createElementNS(ns,'title');
      const label=(g.querySelector('.kubam-node-title')?.textContent||'Възел').trim();
      t.textContent=label+' — натисни за детайли';
      g.insertBefore(t,g.firstChild);
    }
    if(!g.querySelector('.kubex-shine')){
      const shine=document.createElementNS(ns,'rect');
      shine.setAttribute('x','-45');
      shine.setAttribute('y','-24');
      shine.setAttribute('width','90');
      shine.setAttribute('height','17');
      shine.setAttribute('rx','10');
      shine.setAttribute('class','kubex-shine');
      shine.setAttribute('fill','rgba(255,255,255,.72)');
      const title=g.querySelector('.kubam-node-title');
      g.insertBefore(shine,title||g.firstChild);
    }
    if(!g.dataset.kubKeyboard){
      g.dataset.kubKeyboard='1';
      g.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();g.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
      });
    }
  });
}

function enhance(){
  addStyle();
  const svg=document.querySelector('#attackmap .kubam-canvas svg');
  if(!svg||!svg.querySelector('.kubex-card'))return false;
  makeDefs(svg);
  enhanceNodes(svg);
  document.getElementById('attackmap')?.setAttribute('data-kub-premium-map','1');
  return true;
}

function boot(){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(enhance()||tries>100)clearInterval(timer);
  },80);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

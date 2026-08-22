/* BLIS Navigator — current visual ownership guard.
   Keeps stable routing while making Signals / Visibility use their current V15 presentation.
   Legacy bodies remain off-canvas only for compatibility with older modules and diagnostics.
   Event-driven only; no polling. */
(function(){
'use strict';
if(window.__BLISCurrentOwnersV1)return;window.__BLISCurrentOwnersV1=true;

const MODERN={social:'n15Signals',digital:'n15Digital'};
const modernIds=new Set(Object.keys(MODERN));
const nativeText=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');

function parkLegacy(id){
  if(!modernIds.has(id))return;
  const host=document.getElementById(id+'Body');
  if(host){
    host.style.setProperty('display','block','important');
    host.style.setProperty('visibility','visible','important');
    host.style.setProperty('opacity','1','important');
    host.style.setProperty('position','absolute','important');
    host.style.setProperty('left','-100000px','important');
    host.style.setProperty('top','0','important');
    host.style.setProperty('width','1px','important');
    host.style.setProperty('height','100px','important');
    host.style.setProperty('min-height','100px','important');
    host.style.setProperty('overflow','hidden','important');
    host.style.setProperty('pointer-events','none','important');
    host.setAttribute('aria-hidden','true');
    host.dataset.blisLegacyParked='1';
  }
  const root=document.getElementById(MODERN[id]);
  if(root){
    root.style.setProperty('display','block','important');
    root.style.setProperty('visibility','visible','important');
    root.style.setProperty('opacity','1','important');
    root.style.removeProperty('position');
    root.removeAttribute('aria-hidden');
    root.dataset.blisCurrentVisual='1';
  }
}

function lockText(el,value){
  if(!el||!nativeText)return;
  const wanted=String(value);
  if(el.__blisCurrentTextLock===wanted)return;
  try{nativeText.set.call(el,wanted)}catch(_){el.textContent=wanted}
  try{
    Object.defineProperty(el,'textContent',{
      configurable:true,enumerable:false,
      get(){return nativeText.get.call(this)},
      set(v){if(nativeText.get.call(this)!==wanted)nativeText.set.call(this,wanted)}
    });
    el.__blisCurrentTextLock=wanted;
  }catch(_){ }
}

function lockCurrentCopy(id){
  if(id!=='social')return;
  const root=document.getElementById('n15Signals');if(!root)return;
  lockText(root.querySelector('.n15-title .n15-k'),'DIGITAL INTELLIGENCE');
  lockText(root.querySelector('.n15-title h2'),'Digital Intelligence');
  lockText(root.querySelector('.n15-title p'),'Проверими сигнали от марката и за марката в наблюдаваната дигитална среда.');
  const dirs=root.querySelectorAll('.n15-dir strong');
  lockText(dirs[0],'Сигнали от марката');
  lockText(dirs[1],'Сигнали за марката');
}

function settle(id){
  parkLegacy(id);lockCurrentCopy(id);
  requestAnimationFrame(()=>{parkLegacy(id);lockCurrentCopy(id)});
}

function installFreshPresentation(){
  if(!document.querySelector('link[data-blis-current-type]')){
    const l=document.createElement('link');
    l.rel='stylesheet';l.href='/navigator-typography-system-v1.css?v=20260822-visual3';
    l.dataset.blisCurrentType='1';document.head.appendChild(l);
  }
  let s=document.getElementById('blisCurrentOwnersVisualCSS');
  if(!s){s=document.createElement('style');s.id='blisCurrentOwnersVisualCSS';document.head.appendChild(s)}
  s.textContent=`
    #social #n15Signals>.n15-title>.n15-k,#social #n15Signals>.n15-title>p{display:none!important}
    #social #n15Signals>.n15-title{margin:2px 0 24px!important}
    #social #n15Signals>.n15-title>h2{margin:0!important;font-size:0!important;line-height:1!important;letter-spacing:0!important;color:#092346!important}
    #social #n15Signals>.n15-title>h2:after{content:'Digital Intelligence';display:block;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.05;font-weight:700;letter-spacing:-.025em;color:#092346}
    #social #n15Signals .n15-dir strong{display:block!important;width:100%!important;margin:0 0 14px!important;font-size:0!important;line-height:1!important;letter-spacing:0!important}
    #social #n15Signals .n15-dir strong:after{display:block;width:100%;font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:1.12;font-weight:700;letter-spacing:-.012em;color:#0f223e;text-align:left;text-align-last:auto}
    #social #n15Signals .n15-dir.from strong:after{content:'Сигнали от марката'}
    #social #n15Signals .n15-dir.about strong:after{content:'Сигнали за марката'}
    #social #n15Signals .n15-dir p{max-width:none!important;font-size:11px!important;line-height:1.65!important;text-align:justify!important;text-justify:inter-word!important}
    #social #n15Signals .n15-dir b{margin-top:18px!important;font-family:Georgia,'Times New Roman',serif!important;font-weight:600!important;font-size:42px!important;letter-spacing:-.025em!important}
    @media(max-width:1250px){#social #n15Signals>.n15-title>h2:after{font-size:34px}#social #n15Signals .n15-dir strong:after{font-size:26px}}
    @media(max-width:800px){#social #n15Signals>.n15-title>h2:after{font-size:30px}#social #n15Signals .n15-dir strong:after{font-size:24px}}
  `;
}

function renderModern(id){
  if(!modernIds.has(id))return;
  parkLegacy(id);
  let result;
  try{if(typeof window.refGo==='function')result=window.refGo(id);else if(typeof window.go==='function')result=window.go(id)}catch(_){ }
  requestAnimationFrame(()=>settle(id));
  return result;
}

function modernClick(e){
  e?.preventDefault?.();
  const id=this?.dataset?.page;
  if(!modernIds.has(id))return;
  return renderModern(id);
}
modernClick.__blisCanonicalNav=true;
modernClick.__blisCurrentOwner=true;

function bind(){
  const nav=document.getElementById('nav');if(!nav)return;
  modernIds.forEach(id=>{
    const b=nav.querySelector(`button[data-page="${id}"]`);if(b&&b.onclick!==modernClick)b.onclick=modernClick;
  });
}

function settleActive(){
  const id=document.querySelector('.page.active')?.id;
  if(modernIds.has(id))settle(id);
  bind();
}

function boot(){
  installFreshPresentation();
  modernIds.forEach(parkLegacy);
  bind();
  const nav=document.getElementById('nav');
  if(nav)new MutationObserver(()=>requestAnimationFrame(bind)).observe(nav,{childList:true,subtree:true});
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('#nav button[data-page]');
    if(!b||!modernIds.has(b.dataset.page))return;
    requestAnimationFrame(()=>settle(b.dataset.page));
  },true);
  window.addEventListener('blis:clientdata',()=>requestAnimationFrame(settleActive));
  window.addEventListener('blis:periodchange',()=>requestAnimationFrame(settleActive));
  requestAnimationFrame(()=>requestAnimationFrame(settleActive));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

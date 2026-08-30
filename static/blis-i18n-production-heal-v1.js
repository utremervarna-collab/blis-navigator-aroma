/* BLIS Navigator — synchronous English healing for late production renders. */
(function(){'use strict';
const ATTRS=['title','aria-label','placeholder','alt','value'];
const EN=()=>window.BLISI18N?.lang==='en'||document.documentElement.lang==='en';
let healing=false;
let observer=null;
function tr(){return window.BLISI18N?.t}
function translateText(n){
  if(!EN()||!n||n.nodeType!==3)return;
  const p=n.parentElement;if(!p||/SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TEXTAREA/.test(p.tagName))return;
  const fn=tr();if(typeof fn!=='function')return;
  const raw=n.nodeValue||'',next=fn(raw,p);if(next!==raw)n.nodeValue=next;
}
function translateAttrs(el){
  if(!EN()||!el||el.nodeType!==1)return;
  const fn=tr();if(typeof fn!=='function')return;
  for(const a of ATTRS){const raw=el.getAttribute?.(a);if(!raw)continue;const next=fn(raw,el);if(next!==raw)el.setAttribute(a,next)}
}
function translateRoot(root){
  if(!EN()||!root||healing)return;
  const fn=tr();if(typeof fn!=='function')return;
  healing=true;
  try{
    if(root.nodeType===3){translateText(root)}
    else if(root.nodeType===1||root.nodeType===9||root.nodeType===11){
      if(root.nodeType===1)translateAttrs(root);
      const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode(n){if(n.nodeType===1&&/SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TEXTAREA/.test(n.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
      let n;while((n=w.nextNode())){if(n.nodeType===3)translateText(n);else translateAttrs(n)}
    }
    if(root===document||root===document.documentElement||root===document.body){const next=fn(document.title,document.documentElement);if(next!==document.title)document.title=next}
  }catch(_){ }
  finally{healing=false;observer?.takeRecords?.()}
}
function fullPass(){translateRoot(document);try{window.BLISI18N?.apply?.(document)}catch(_){}}
function arm(){fullPass();setTimeout(fullPass,30);setTimeout(fullPass,100);setTimeout(fullPass,240);setTimeout(fullPass,600)}
function observe(){
  if(observer||!document.documentElement)return;
  observer=new MutationObserver(ms=>{
    if(!EN()||healing)return;
    for(const m of ms){
      if(m.type==='characterData')translateText(m.target);
      else if(m.type==='attributes')translateAttrs(m.target);
      else if(m.type==='childList')m.addedNodes?.forEach(translateRoot);
    }
    observer.takeRecords();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{observe();arm()},{once:true});else{observe();arm()}
for(const ev of ['blis:clientdata','blis:periodchange','blis:routechange','blis:navigator-route','blis:rendered','blis:i18n-catalog'])window.addEventListener(ev,arm);
window.addEventListener('popstate',arm);
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav,[data-page],[data-client],a[href*="dashboard"]'))arm()},true);
setInterval(()=>{if(EN())try{const r=window.BLISI18N?.scanBulgarian?.()||[];if(r.length)fullPass()}catch(_){ }},1200);
})();

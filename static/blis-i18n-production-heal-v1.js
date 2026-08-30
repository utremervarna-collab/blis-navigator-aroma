/* BLIS Navigator — resilient English healing for late production renders. */
(function(){'use strict';
const ATTRS=['title','aria-label','placeholder','alt','value'];
const EN=()=>window.BLISI18N?.lang==='en'||document.documentElement.lang==='en';
function directPass(){
  if(!EN())return;
  const tr=window.BLISI18N?.t;if(typeof tr!=='function')return;
  const root=document.body;
  try{
    if(root){
      const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;return !p||/SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TEXTAREA/.test(p.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
      while(w.nextNode()){
        const n=w.currentNode,p=n.parentElement,raw=n.nodeValue||'',next=tr(raw,p);
        if(next!==raw)n.nodeValue=next;
      }
      for(const el of root.querySelectorAll('[title],[aria-label],[placeholder],[alt],input[value],button[value]')){
        for(const a of ATTRS){const raw=el.getAttribute(a);if(!raw)continue;const next=tr(raw,el);if(next!==raw)el.setAttribute(a,next)}
      }
    }
    const title=tr(document.title,document.documentElement);if(title!==document.title)document.title=title;
    window.BLISI18N?.apply?.(document);
  }catch(_){ }
}
function check(){
  if(!EN())return;
  try{const r=window.BLISI18N?.scanBulgarian?.()||[];if(r.length)directPass()}catch(_){ }
}
let healUntil=Date.now()+16000;
function arm(ms=12000){healUntil=Math.max(healUntil,Date.now()+ms);directPass();setTimeout(directPass,40);setTimeout(directPass,120);setTimeout(directPass,260)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>arm(16000),{once:true});else arm(16000);
for(const ev of ['blis:clientdata','blis:periodchange','blis:routechange','blis:navigator-route','blis:rendered','blis:i18n-catalog'])window.addEventListener(ev,()=>arm(12000));
window.addEventListener('popstate',()=>arm(12000));
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav,[data-page],[data-client],a[href*="dashboard"]'))arm(12000)},true);
setInterval(()=>{if(!EN()||document.hidden)return;if(Date.now()<healUntil)directPass();else check()},180);
})();

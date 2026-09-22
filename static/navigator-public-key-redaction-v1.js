/* BLIS Navigator — public technical-key redaction.
   Internal backend identifiers must never be visible in the client UI. */
(function(){
'use strict';
if(window.__BLIS_PUBLIC_KEY_REDACTION_V1)return;
window.__BLIS_PUBLIC_KEY_REDACTION_V1=true;

const exact=/^(?:competitor_page_state|signal_event|runtime_|internal_|collector_|source_key|metric_key|cmp_(?:primary|secondary))[_a-z0-9-]*$/i;
const inlineInternal=/\b(?:signal_event|competitor_page_state|runtime|internal|collector|cmp_(?:primary|secondary))[_a-z0-9-]*\b/gi;
const generic=/\b[a-z][a-z0-9]*(?:_[a-z0-9]+){3,}\b/gi;
const protectedTags=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA','INPUT','SELECT','OPTION']);

function internal(v){
 const s=String(v||'').trim();
 if(!s)return false;
 if(exact.test(s))return true;
 return /^(?:competitor_page_state|signal_event|runtime_|internal_|collector_)/i.test(s);
}
function cleanText(v){
 const s=String(v||'');
 if(internal(s))return '';
 return s.replace(inlineInternal,'').replace(generic,m=>internal(m)?'':m).replace(/[ \t]{2,}/g,' ').replace(/„\s*“/g,'').trim();
}
function cleanElement(el){
 if(!el||el.nodeType!==1||protectedTags.has(el.tagName))return;
 for(const a of ['title','aria-label','data-label']){
   if(!el.hasAttribute(a))continue;
   const v=el.getAttribute(a)||'',n=cleanText(v);
   if(n!==v){if(n)el.setAttribute(a,n);else el.removeAttribute(a)}
 }
 for(const n of Array.from(el.childNodes)){
   if(n.nodeType!==3)continue;
   const before=n.nodeValue||'',after=cleanText(before);
   if(after!==before)n.nodeValue=after;
 }
 // If a leaf/control label contained only an internal key, remove its public footprint.
 if(!el.children.length && internal(el.textContent||'')){
   el.textContent='';
   el.setAttribute('aria-hidden','true');
 }
}
function scan(root=document){
 if(root.nodeType===1)cleanElement(root);
 root.querySelectorAll?.('*').forEach(cleanElement);
}
function init(){
 scan();
 const host=document.querySelector('.app')||document.body;
 new MutationObserver(ms=>{
   for(const m of ms){
     if(m.type==='characterData'){
       const p=m.target.parentElement;if(p)cleanElement(p);
     }
     m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);else if(n.nodeType===3&&n.parentElement)cleanElement(n.parentElement)});
   }
 }).observe(host,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
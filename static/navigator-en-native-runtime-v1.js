/* BLIS Navigator — synchronous English presentation runtime.
   In EN mode, visible Bulgarian UI strings are localized in the same DOM/canvas
   operation that creates them, before browser paint. No analytical ownership. */
(function(){
'use strict';
if(window.__BLIS_EN_NATIVE_RUNTIME_V1)return;window.__BLIS_EN_NATIVE_RUNTIME_V1=true;
const CYR=/[А-Яа-яЁёЀ-ӿ]/;
const SKIP=/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TEXTAREA)$/;
const VISIBLE_ATTRS=new Set(['title','aria-label','placeholder','alt','value']);
const TIP_ATTRS=new Set(['data-sv2-rep','data-sv2-risk','data-sv2-sig','data-m-tip','data-h-tip','data-router-risk','data-r-note']);
let busy=0;
function isEN(){
  if(String(window.BLIS_LANGUAGE||'').toLowerCase()==='en')return true;
  if(String(document.documentElement?.lang||'').toLowerCase().startsWith('en'))return true;
  try{return localStorage.getItem('blis.language.v1')==='en'}catch(_){return false}
}
const fallback={
  'Интерактивна карта на възприятията':'Interactive perception map',
  'В РЕАЛНО ВРЕМЕ':'LIVE',
  'фактори · източници · сигнали · зависимости':'factors · sources · signals · dependencies',
  'Репутационен пулс':'Reputation pulse',
  'Репутационното състояние изисква внимание.':'The reputation state requires attention.',
  'Отлична':'Excellent','Добра':'Good','Неутрална':'Neutral','Крехка':'Fragile','Рискова':'Risky',
  'Конкурентен компас':'Competitive compass','ОТГОВОРЪТ НАКРАТКО':'SHORT ANSWER','Отговорът накратко':'Short answer',
  'Брандът е лидер в текущия сравним набор.':'The brand is the leader in the current comparison set.',
  'Вашият бранд':'Your brand','0 спрямо предходния период':'0 vs previous period',
  'по-слаб резултат':'weaker result','по-силен резултат':'stronger result',
  'Изберете компания за кратък контекст.':'Select a company for quick context.',
  'Хронология на ключови събития':'Timeline of key events',
  'Историята показва само повратните точки и значимите събития, които обясняват текущото състояние.':'The history shows only turning points and significant events that explain the current state.',
  'Докладите използват реалното аналитично покритие на текущия клиент и наличните публикувани файлове.':'Reports use the current client’s real analytical coverage and available published files.',
  'Покритие на аналитичния пакет':'Analytical package coverage','Общо покритие':'Overall coverage','Добро':'Good',
  'Изберете сегмент за контекст. Експортът използва реалния API.':'Select a segment for context. Exports use the real API.',
  'Реална библиотека':'Real library','Публикувани доклади и експорти':'Published reports and exports',
  'Само файлове и записи, които действително съществуват за текущия клиент.':'Only real files and records that exist for the current client are shown.',
  'ТЕКУЩ МОМЕНТ':'CURRENT MOMENT'
};
function tr(raw,el){
  raw=String(raw??'');if(!isEN()||!raw||!CYR.test(raw))return raw;
  const lead=(raw.match(/^\s*/)||[''])[0],trail=(raw.match(/\s*$/)||[''])[0],t=raw.trim();
  let out='';
  try{out=window.BLISI18N?.t?.(t,el)||''}catch(_){ }
  if(!out||out===t||CYR.test(out))out=fallback[t]||out||t;
  if(out===t&&CYR.test(out)){
    // Safe dynamic UI forms not tied to analytical semantics.
    out=out
      .replace(/^(\d+)\s*дни$/i,'$1 days')
      .replace(/^(\d+)\s*събития$/i,'$1 events')
      .replace(/^(\d+)\s*публикувани$/i,'$1 published')
      .replace(/^(\d+)\s*доказателства$/i,'$1 evidence')
      .replace(/\s+спрямо предходния период$/i,' vs previous period');
  }
  return lead+out+trail;
}
function textNode(n){
  if(!n||n.nodeType!==3||!isEN())return;
  const p=n.parentElement;if(!p||SKIP.test(p.tagName))return;
  const v=n.nodeValue||'',z=tr(v,p);if(z!==v)n.nodeValue=z;
}
function attrs(el){
  if(!el||el.nodeType!==1||!isEN())return;
  for(const a of [...VISIBLE_ATTRS,...TIP_ATTRS]){
    const v=el.getAttribute?.(a);if(!v||!CYR.test(v))continue;
    const z=tr(v,el);if(z!==v)nativeSetAttribute.call(el,a,z);
  }
}
function walk(root){
  if(!root||!isEN()||busy)return;busy++;
  try{
    if(root.nodeType===3){textNode(root);return}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1){if(SKIP.test(root.tagName))return;attrs(root)}
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode(n){
      if(n.nodeType===1&&SKIP.test(n.tagName))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    let n;while((n=w.nextNode())){if(n.nodeType===3)textNode(n);else attrs(n)}
  }finally{busy--}
}
const ep=Element.prototype,np=Node.prototype;
const innerHTMLDesc=Object.getOwnPropertyDescriptor(ep,'innerHTML');
if(innerHTMLDesc?.set&&innerHTMLDesc?.get){
  Object.defineProperty(ep,'innerHTML',{configurable:innerHTMLDesc.configurable,enumerable:innerHTMLDesc.enumerable,
    get:innerHTMLDesc.get,set:function(v){innerHTMLDesc.set.call(this,v);if(isEN())walk(this)}});
}
const textContentDesc=Object.getOwnPropertyDescriptor(np,'textContent');
if(textContentDesc?.set&&textContentDesc?.get){
  Object.defineProperty(np,'textContent',{configurable:textContentDesc.configurable,enumerable:textContentDesc.enumerable,
    get:textContentDesc.get,set:function(v){
      if(isEN()&&this.nodeType===1&&!SKIP.test(this.tagName||'')&&typeof v==='string'&&CYR.test(v))v=tr(v,this);
      textContentDesc.set.call(this,v);if(isEN()&&this.nodeType===1)walk(this);
    }});
}
const innerTextDesc=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'innerText');
if(innerTextDesc?.set&&innerTextDesc?.get){
  Object.defineProperty(HTMLElement.prototype,'innerText',{configurable:innerTextDesc.configurable,enumerable:innerTextDesc.enumerable,
    get:innerTextDesc.get,set:function(v){if(isEN()&&typeof v==='string'&&CYR.test(v))v=tr(v,this);innerTextDesc.set.call(this,v)}});
}
const nativeSetAttribute=ep.setAttribute;
ep.setAttribute=function(name,value){
  const a=String(name||'').toLowerCase();
  if(isEN()&&(VISIBLE_ATTRS.has(a)||TIP_ATTRS.has(a))&&typeof value==='string'&&CYR.test(value))value=tr(value,this);
  return nativeSetAttribute.call(this,name,value);
};
const nativeInsertAdjacentHTML=ep.insertAdjacentHTML;
if(nativeInsertAdjacentHTML)ep.insertAdjacentHTML=function(pos,html){const r=nativeInsertAdjacentHTML.call(this,pos,html);if(isEN())walk(this);return r};
for(const m of ['append','prepend','replaceChildren']){
  const fn=ep[m];if(!fn)continue;ep[m]=function(){if(isEN())for(const x of arguments)if(x?.nodeType)walk(x);const r=fn.apply(this,arguments);if(isEN())walk(this);return r};
}
for(const m of ['appendChild','insertBefore','replaceChild']){
  const fn=np[m];if(!fn)continue;np[m]=function(){if(isEN()&&arguments[0]?.nodeType)walk(arguments[0]);const r=fn.apply(this,arguments);if(isEN()&&this.nodeType===1)walk(this);return r};
}
function patchCanvas(proto,name){
  if(!proto||typeof proto[name]!=='function'||proto[name].__blisEnNative)return;
  const fn=proto[name];function wrapped(text){if(isEN()&&typeof text==='string'&&CYR.test(text))arguments[0]=tr(text,null);return fn.apply(this,arguments)}
  wrapped.__blisEnNative=true;proto[name]=wrapped;
}
try{patchCanvas(CanvasRenderingContext2D.prototype,'fillText');patchCanvas(CanvasRenderingContext2D.prototype,'strokeText')}catch(_){ }
try{if(typeof OffscreenCanvasRenderingContext2D!=='undefined'){patchCanvas(OffscreenCanvasRenderingContext2D.prototype,'fillText');patchCanvas(OffscreenCanvasRenderingContext2D.prototype,'strokeText')}}catch(_){ }
function cssFix(){
  if(!isEN()||document.getElementById('blisEnNativeCss'))return;
  const s=document.createElement('style');s.id='blisEnNativeCss';
  s.textContent='html[lang="en"] .sv2-now::before,html[lang="en"] .signal-current-marker::before,html[lang="en"] [data-current-marker]::before{content:"CURRENT MOMENT" !important}';
  document.head?.appendChild(s);
}
function applyAll(){if(!isEN())return;walk(document);cssFix()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyAll,{once:true});else applyAll();
for(const ev of ['blis:routechange','blis:navigator-route','blis:clientdata','blis:periodchange','blis:rendered','blis:production-ready'])window.addEventListener(ev,applyAll);
window.BLISENNativeRuntimeV1={apply:applyAll,translate:tr};
})();

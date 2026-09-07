/* KUB-only DOM idempotency shim: prevents same-value writes from re-triggering localization observers. */
(function(){
'use strict';
if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;
if(window.__KUB_DOM_IDEMPOTENCY)return;
window.__KUB_DOM_IDEMPOTENCY=1;

try{
  const d=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
  if(d&&d.get&&d.set){
    Object.defineProperty(Node.prototype,'textContent',{
      configurable:d.configurable,
      enumerable:d.enumerable,
      get:d.get,
      set:function(v){
        const next=v==null?'':String(v);
        let current='';
        try{current=d.get.call(this)||''}catch(_){return d.set.call(this,v)}
        if(current===next)return;
        return d.set.call(this,v);
      }
    });
  }
}catch(_){ }

try{
  const orig=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(name,value){
    const n=String(name);
    const v=String(value);
    if((n==='aria-label'||n==='title'||n==='placeholder')&&this.getAttribute(n)===v)return;
    return orig.call(this,name,value);
  };
}catch(_){ }
})();

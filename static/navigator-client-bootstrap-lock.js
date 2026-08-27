/* BLIS Navigator — lock requested client through legacy app bootstrap. */
(function(){
  'use strict';
  const allowed=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox','wirello']);
  let key='';
  try{key=new URLSearchParams(location.search).get('client')||''}catch(_){ }
  if(!allowed.has(key)){
    try{const saved=localStorage.getItem('blis-client-ui')||'';if(allowed.has(saved))key=saved}catch(_){ }
  }
  if(!allowed.has(key))key='aroma';
  window.BLIS_INITIAL_CLIENT=key;
  window.__BLIS_EXPECTED_CLIENT=key;
  try{localStorage.setItem('blis-client-ui',key)}catch(_){ }
  const sel=document.getElementById('clientSel');
  if(!sel)return;
  const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(desc&&desc.get&&desc.set){
    try{
      Object.defineProperty(sel,'innerHTML',{
        configurable:true,
        enumerable:false,
        get(){return desc.get.call(this)},
        set(v){
          desc.set.call(this,v);
          try{if([...this.options].some(o=>o.value===key))this.value=key}catch(_){ }
        }
      });
    }catch(_){ }
  }
  try{if([...sel.options].some(o=>o.value===key))sel.value=key}catch(_){ }
})();

/* BLIS Navigator — canonical bilingual client bootstrap.
   Keeps ?client and ?lang authoritative across legacy routing and rendering. */
(function(){
  'use strict';
  if(window.__BLIS_BILINGUAL_CLIENT_LOCK__)return;
  window.__BLIS_BILINGUAL_CLIENT_LOCK__=true;
  const allowed=new Set(['aroma','bolyarka','astor-garden','varna-towers','delta-planet','mollox','wirello','everbet','black-sea-center']);
  const params=new URLSearchParams(location.search);
  const route=location.pathname.replace(/^\/+|\/+$/g,'').toLowerCase();
  const routeClient=allowed.has(route)?route:'';
  const requested=allowed.has(params.get('client'))?params.get('client'):(routeClient||'');
  const requestedLang=params.get('lang')==='en'?'en':'';
  if(requested){
    window.BLIS_INITIAL_CLIENT=requested;
    window.__BLIS_EXPECTED_CLIENT=requested;
    try{localStorage.setItem('blis-client-ui',requested)}catch(_){}
  }
  if(requestedLang){
    try{localStorage.setItem('blis-language','en')}catch(_){}
    document.documentElement.lang='en';
  }

  function canonicalURL(raw){
    try{
      const u=new URL(raw||location.href,location.href);
      if(u.origin!==location.origin)return raw;
      if(requested)u.searchParams.set('client',requested);
      if(requestedLang)u.searchParams.set('lang','en');
      return u.pathname+u.search+u.hash;
    }catch(_){return raw}
  }
  for(const method of ['replaceState','pushState']){
    const original=history[method];
    if(typeof original==='function')history[method]=function(state,title,url){
      return original.call(history,state,title,url==null?url:canonicalURL(url));
    };
  }

  let loadStarted=false;
  function lock(){
    if(!requested)return;
    window.BLIS_INITIAL_CLIENT=requested;
    window.__BLIS_EXPECTED_CLIENT=requested;
    try{window.slug=requested}catch(_){}
    if(document.body)document.body.dataset.client=requested;
    const select=document.getElementById('clientSel');
    if(select&&select.value!==requested)select.value=requested;
    document.querySelectorAll('.client-option[data-client-key]').forEach(function(el){
      const active=el.dataset.clientKey===requested;
      el.classList.toggle('active',active);
      el.setAttribute('aria-selected',active?'true':'false');
      const check=el.querySelector('.client-option-check');
      if(check)check.textContent=active?'✓':'';
    });
    const option=document.querySelector('.client-option[data-client-key="'+requested+'"]');
    const button=document.querySelector('.client-switch-button');
    if(option&&button){
      const mark=button.querySelector('.client-brand-mark');
      const name=button.querySelector('.client-brand-name');
      const type=button.querySelector('.client-brand-type');
      const sourceMark=option.querySelector('.client-option-mark');
      const sourceName=option.querySelector('b');
      const sourceType=option.querySelector('small');
      if(mark&&sourceMark)mark.textContent=sourceMark.textContent;
      if(name&&sourceName)name.textContent=sourceName.textContent;
      if(type&&sourceType)type.textContent=sourceType.textContent;
    }
    if(!loadStarted&&requested==='delta-planet'&&document.readyState!=='loading'){
      loadStarted=true;
      Promise.resolve().then(function(){
        if(window.BLISDataLoaderV1&&typeof window.BLISDataLoaderV1.load==='function')return window.BLISDataLoaderV1.load(requested,true);
        if(typeof window.BLISSwitchClientInPlace==='function')return window.BLISSwitchClientInPlace(requested);
        if(typeof window.load==='function')return window.load();
      }).finally(function(){
        setTimeout(function(){loadStarted=false;lock()},500);
      });
    }
    if(requestedLang&&window.BLISI18N&&typeof window.BLISI18N.apply==='function')window.BLISI18N.apply(document);
  }

  lock();
  document.addEventListener('DOMContentLoaded',lock,{once:true});
  window.addEventListener('load',lock,{once:true});
  ['blis:production-ready','blis:clientdata','blis:rendered','blis:i18n-catalog','blis:routechange'].forEach(function(ev){
    window.addEventListener(ev,function(){setTimeout(lock,0);setTimeout(lock,120)});
  });
  const observer=new MutationObserver(function(){lock()});
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-client']});
  [50,150,350,700,1200,2200,4000].forEach(function(ms){setTimeout(lock,ms)});
})();
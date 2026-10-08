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
    try{document.cookie='blis_admin_client='+encodeURIComponent(requested)+'; Path=/; Max-Age=2592000; SameSite=Lax; Secure'}catch(_){}
    try{if(typeof slug!=='undefined')slug=requested}catch(_){}
    try{window.slug=requested}catch(_){}
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

  let dataLoadRequested=false;
  function lock(){
    if(!requested)return;
    window.BLIS_INITIAL_CLIENT=requested;
    window.__BLIS_EXPECTED_CLIENT=requested;
    try{if(typeof slug!=='undefined'&&slug!==requested)slug=requested}catch(_){}
    try{if(window.slug!==requested)window.slug=requested}catch(_){}
    try{if(localStorage.getItem('blis-client-ui')!==requested)localStorage.setItem('blis-client-ui',requested)}catch(_){}
    try{document.cookie='blis_admin_client='+encodeURIComponent(requested)+'; Path=/; Max-Age=2592000; SameSite=Lax; Secure'}catch(_){}
    if(document.body&&document.body.dataset.client!==requested)document.body.dataset.client=requested;
    const select=document.getElementById('clientSel');
    if(select&&select.value!==requested)select.value=requested;
    document.querySelectorAll('.client-option[data-client-key]').forEach(function(el){
      const active=el.dataset.clientKey===requested;
      if(el.classList.contains('active')!==active)el.classList.toggle('active',active);
      if(el.getAttribute('aria-selected')!==(active?'true':'false'))el.setAttribute('aria-selected',active?'true':'false');
      const check=el.querySelector('.client-option-check');
      if(check&&check.textContent!==(active?'✓':''))check.textContent=active?'✓':'';
    });
    const option=document.querySelector('.client-option[data-client-key="'+requested+'"]');
    const button=document.querySelector('.client-switch-button');
    if(option&&button){
      const pairs=[
        [button.querySelector('.client-brand-mark'),option.querySelector('.client-option-mark')],
        [button.querySelector('.client-brand-name'),option.querySelector('b')],
        [button.querySelector('.client-brand-type'),option.querySelector('small')]
      ];
      pairs.forEach(function(pair){if(pair[0]&&pair[1]&&pair[0].textContent!==pair[1].textContent)pair[0].textContent=pair[1].textContent});
    }
    if(!dataLoadRequested&&requested==='delta-planet'&&document.readyState!=='loading'){
      dataLoadRequested=true;
      setTimeout(function(){
        try{
          if(window.BLISDataLoaderV1&&typeof window.BLISDataLoaderV1.load==='function')window.BLISDataLoaderV1.load(requested,true);
          else if(typeof window.load==='function')window.load();
        }catch(_){}
      },0);
    }
    // The shared language runtime already observes changed nodes. A full-document
    // translation on every client-lock mutation duplicates that work and feeds
    // the language-switch observer cycle during English bootstrap.
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;lock()});
  }
  lock();
  document.addEventListener('DOMContentLoaded',function(){
    lock();
    const observer=new MutationObserver(schedule);
    observer.observe(document.body||document.documentElement,{subtree:true,childList:true});
  },{once:true});
  window.addEventListener('load',lock,{once:true});
  ['blis:production-ready','blis:clientdata','blis:rendered','blis:i18n-catalog','blis:routechange'].forEach(function(ev){
    window.addEventListener(ev,schedule);
  });
  [50,150,350,700,1200,2200].forEach(function(ms){setTimeout(lock,ms)});
})();
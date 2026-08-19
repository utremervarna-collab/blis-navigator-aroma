/* BLIS Navigator — safe boot recovery guard.
   Perception Map runtime remains disabled until it is mounted by the core renderer.
   This file also prevents one failed/stalled API request from leaving Navigator blank forever. */
(function(){
  'use strict';

  window.BLIS_PERCEPTION_MAP_RUNTIME_DISABLED = true;

  const nativeFetch = window.fetch.bind(window);
  const BOOT_PARTS = new Set(['dashboard','sources','data-quality','activity','history']);

  function currentSlug(){
    try{
      const q = new URLSearchParams(location.search).get('client');
      const s = document.getElementById('clientSel');
      return (s && s.value) || window.BLIS_INITIAL_CLIENT || q || document.body.dataset.client || 'aroma';
    }catch(_){ return 'aroma'; }
  }

  function fallbackFor(url){
    const s = currentSlug();
    const names = {
      aroma:['Aroma','Козметика / бързооборотни стоки'],
      bolyarka:['Болярка ВТ АД','Пивоварна компания'],
      'astor-garden':['Astor Garden Hotel','Хотелиерство'],
      'varna-towers':['Varna Towers','Бизнес център / недвижими имоти']
    };
    if(url === '/api/clients' || /\/api\/clients(?:\?|$)/.test(url)){
      const x=names[s]||names.aroma;
      return [{slug:s,name:x[0],sector:x[1],note:'BLIS клиентски профил'}];
    }
    const m = url.match(/\/api\/clients\/[^/?]+\/([^?]+)/);
    const part = m && m[1];
    if(part === 'dashboard'){
      const x=names[s]||names.aroma;
      return {slug:s,name:x[0],sector:x[1],note:'BLIS наблюдение активно',blis_index:null,trend:0,indices:[],signals:[],competitors:[],data_updated:null};
    }
    if(part === 'sources' || part === 'activity' || part === 'history') return [];
    if(part === 'data-quality') return {coverage:0,sources_with_data:0,fresh_sources:0,total_sources:0};
    return {};
  }

  function isBootURL(input){
    const raw = typeof input === 'string' ? input : (input && input.url) || '';
    try{
      const u = new URL(raw, location.origin);
      if(u.origin !== location.origin) return false;
      if(u.pathname === '/api/clients') return true;
      const m=u.pathname.match(/^\/api\/clients\/[^/]+\/([^/]+)$/);
      return !!(m && BOOT_PARTS.has(m[1]));
    }catch(_){ return false; }
  }

  function localPath(input){
    const raw = typeof input === 'string' ? input : (input && input.url) || '';
    try{ const u=new URL(raw,location.origin); return u.pathname+u.search; }
    catch(_){ return String(raw||''); }
  }

  function fallbackResponse(input, why){
    const path=localPath(input);
    console.warn('[BLIS boot guard] fallback for',path,why||'request failure');
    return new Response(JSON.stringify(fallbackFor(path)),{
      status:200,
      headers:{'Content-Type':'application/json; charset=utf-8','X-BLIS-Boot-Fallback':'1','Cache-Control':'no-store'}
    });
  }

  /* Only BLIS bootstrap reads get a timeout/fallback. All other fetch calls are untouched. */
  window.fetch = function(input, init){
    if(!isBootURL(input)) return nativeFetch(input, init);

    const controller = new AbortController();
    const existingSignal = init && init.signal;
    let abortedByCaller=false;
    if(existingSignal){
      if(existingSignal.aborted){ abortedByCaller=true; controller.abort(); }
      else existingSignal.addEventListener('abort',()=>{abortedByCaller=true;controller.abort();},{once:true});
    }
    const timer=setTimeout(()=>controller.abort(),4500);
    const opts=Object.assign({},init||{},{signal:controller.signal,cache:'no-store'});

    return nativeFetch(input,opts).then(resp=>{
      clearTimeout(timer);
      if(resp && resp.ok) return resp;
      return fallbackResponse(input,'HTTP '+(resp?resp.status:'unknown'));
    }).catch(err=>{
      clearTimeout(timer);
      if(abortedByCaller) throw err;
      return fallbackResponse(input,err && err.name ? err.name : 'network error');
    });
  };

  function overviewReady(){
    const host=document.getElementById('overviewPremium');
    if(host && host.children.length && host.textContent.trim().length>10) return true;
    const active=document.querySelector('.page.active');
    return !!(active && active.textContent.trim().length>80);
  }

  function showRecoveryNote(){
    const sync=document.querySelector('.sync');
    if(!sync || document.getElementById('blisBootRecovery')) return;
    const n=document.createElement('div');
    n.id='blisBootRecovery';
    n.style.cssText='margin-top:4px;font-size:9px;color:#8a97a6';
    n.textContent='защитено зареждане активно';
    sync.appendChild(n);
  }

  let rescueRunning=false;
  async function rescue(){
    if(rescueRunning || overviewReady()) return;
    rescueRunning=true;
    console.warn('[BLIS boot guard] normal bootstrap did not finish; starting recovery');
    try{
      /* app.js exposes load() globally. By now all renderer scripts are loaded. */
      if(typeof window.load === 'function'){
        await Promise.race([
          Promise.resolve(window.load()),
          new Promise(resolve=>setTimeout(resolve,6500))
        ]);
      }
    }catch(err){
      console.error('[BLIS boot guard] recovery load error',err);
    }
    if(!overviewReady()){
      /* Last resort: call the installed overview renderer after safe data fallbacks. */
      try{
        if(typeof window.renderAll === 'function') window.renderAll();
      }catch(err){ console.error('[BLIS boot guard] render fallback error',err); }
    }
    if(overviewReady()) showRecoveryNote();
    rescueRunning=false;
  }

  /* Give the normal bootstrap a short head start, then recover if it is still blank. */
  setTimeout(rescue,1800);
  setTimeout(rescue,7000);
})();

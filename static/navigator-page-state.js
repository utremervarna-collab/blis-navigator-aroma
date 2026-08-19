/* BLIS Navigator — persistent page/navigation state v2. Stops boot() from forcing Overview. */
(function(){
  'use strict';

  const VALID_PAGES=new Set([
    'overview','live','social','digital','reputation','market','competition','signals',
    'reports','sources','history','timeline','profile','settings','help'
  ]);
  const VALID_CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
  const KEY_PREFIX='blis.navigator.page.';
  let applying=false;
  let initialized=false;

  const currentClient=()=>{
    const q=new URLSearchParams(location.search).get('client');
    if(q&&VALID_CLIENTS.has(q))return q;
    const b=String(document.body?.dataset?.client||'');
    if(VALID_CLIENTS.has(b))return b;
    const s=String(window.BLIS_INITIAL_CLIENT||window.slug||'');
    return VALID_CLIENTS.has(s)?s:'aroma';
  };

  const storedPage=(client=currentClient())=>{
    try{
      const v=localStorage.getItem(KEY_PREFIX+client);
      return VALID_PAGES.has(v)?v:null;
    }catch(e){return null}
  };

  const wantedPage=(client=currentClient())=>{
    const q=new URLSearchParams(location.search).get('page');
    if(VALID_PAGES.has(q))return q;
    return storedPage(client)||'overview';
  };

  const activePage=()=>{
    const active=document.querySelector('.page.active');
    if(active&&VALID_PAGES.has(active.id))return active.id;
    const nav=document.querySelector('#nav button.active[data-page]');
    return nav&&VALID_PAGES.has(nav.dataset.page)?nav.dataset.page:'overview';
  };

  function save(page,{replace=false,client=currentClient()}={}){
    if(!VALID_PAGES.has(page))return;
    try{localStorage.setItem(KEY_PREFIX+client,page)}catch(e){}
    const u=new URL(location.href);
    u.searchParams.set('client',client);
    u.searchParams.set('page',page);
    const next=u.pathname+u.search+u.hash;
    if(replace)history.replaceState({client,page},'',next);
    else if(location.pathname+location.search+location.hash!==next)history.pushState({client,page},'',next);
  }

  function directActivate(page){
    document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===page));
    document.querySelectorAll('#nav button[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
    return !!document.getElementById(page);
  }

  function callNavigator(page){
    if(!VALID_PAGES.has(page))return false;
    applying=true;
    try{
      if(typeof window.refGo==='function'){
        window.refGo(page);
        return true;
      }
      if(typeof window.go==='function'){
        window.go(page);
        return true;
      }
      return directActivate(page);
    }finally{
      setTimeout(()=>{applying=false},0);
    }
  }

  function restore({replace=true}={}){
    const client=currentClient(),page=wantedPage(client);
    if(callNavigator(page))save(page,{replace,client});
    initialized=true;
  }

  function wrapNavigation(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__blisPageStateV2)return;
    function wrapped(page,...args){
      let requested=String(page||'');
      if(!VALID_PAGES.has(requested))return fn.call(this,page,...args);

      if(!applying){
        const wanted=wantedPage(currentClient());
        /* navigator-reference boot() calls refGo('overview') on every render.
           If the URL/storage says another module is active, that call is a boot reset,
           not a user navigation, so keep the requested module instead. */
        if(requested==='overview'&&wanted!=='overview'){
          requested=wanted;
        }else{
          save(requested,{replace:false});
        }
      }
      return fn.call(this,requested,...args);
    }
    wrapped.__blisPageStateV2=true;
    wrapped.__blisOriginal=fn;
    window[name]=wrapped;
  }

  function wrapAll(){wrapNavigation('refGo');wrapNavigation('go')}

  /* Capture nav clicks BEFORE navigator-reference's onclick handler.
     This makes an explicit click on Overview valid: page=overview is stored first,
     then the wrapper allows Overview instead of treating it as a boot reset. */
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('#nav button[data-page]');
    if(!b)return;
    const page=String(b.dataset.page||'');
    if(VALID_PAGES.has(page))save(page,{replace:false});
  },true);

  document.addEventListener('click',e=>{
    const opt=e.target?.closest?.('.client-option[data-client-key]');
    if(!opt)return;
    const next=String(opt.dataset.clientKey||'');
    if(!VALID_CLIENTS.has(next))return;
    const page=activePage();
    try{localStorage.setItem(KEY_PREFIX+next,page)}catch(err){}
  },true);

  if(document.body)new MutationObserver(muts=>{
    if(!muts.some(m=>m.type==='attributes'&&m.attributeName==='data-client'))return;
    const client=currentClient();
    const page=VALID_PAGES.has(activePage())?activePage():wantedPage(client);
    save(page,{replace:true,client});
  }).observe(document.body,{attributes:true,attributeFilter:['data-client']});

  const nav=document.getElementById('nav');
  if(nav)new MutationObserver(()=>{
    wrapAll();
    if(!initialized)return;
    const wanted=wantedPage(currentClient());
    if(activePage()!==wanted)setTimeout(()=>callNavigator(wanted),0);
  }).observe(nav,{childList:true,subtree:true});

  window.addEventListener('popstate',()=>{
    const u=new URL(location.href),client=u.searchParams.get('client'),page=u.searchParams.get('page');
    if(client&&VALID_CLIENTS.has(client)&&client!==currentClient()){
      document.body.dataset.client=client;
      window.BLIS_INITIAL_CLIENT=client;
      try{window.slug=client}catch(e){}
      const sel=document.getElementById('clientSel');
      if(sel)sel.value=client;
      if(typeof window.load==='function')window.load();
    }
    if(page&&VALID_PAGES.has(page))callNavigator(page);
  });

  wrapAll();
  /* Re-wrap repeatedly during startup because other Navigator modules may replace refGo.
     Each pass also restores the URL-selected page after any async re-render. */
  [20,80,180,450,760,1200,2000].forEach(ms=>setTimeout(()=>{
    wrapAll();
    const wanted=wantedPage(currentClient());
    if(!initialized||activePage()!==wanted)restore({replace:true});
  },ms));
})();

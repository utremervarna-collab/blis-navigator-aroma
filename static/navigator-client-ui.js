/* BLIS Navigator — isolated client switcher controller + scoped client route guard. */
(function(){
  'use strict';
  const clients={
    aroma:{name:'Aroma Cosmetics',full:'Aroma Cosmetics',type:'Козметика',mark:'A',theme:'aroma',short:'AROMA'},
    bolyarka:{name:'Болярка',full:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ',theme:'bolyarka',short:'БОЛЯРКА'},
    'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG',theme:'astor-garden',short:'ASTOR GARDEN'},
    'varna-towers':{name:'Varna Towers',full:'Varna Towers',type:'Бизнес център / недвижими имоти',mark:'VT',theme:'varna-towers',short:'VARNA TOWERS'},
    mollox:{name:'MOLLOX',full:'MOLLOX България',type:'Професионална хигиена',mark:'MX',theme:'mollox',short:'MOLLOX'}
  };
  let correctionInFlight=false;
  const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Добро утро':h>=12&&h<18?'Добър ден':'Добър вечер'};
  function urlKey(){
    try{const q=new URLSearchParams(location.search).get('client');if(q&&clients[q])return q}catch(e){}
    return null;
  }
  function scopedKey(){
    try{const s=window.BLIS_CLIENT_SCOPE;if(s&&clients[s])return s}catch(e){}
    return null;
  }
  function currentKey(){
    const q=urlKey();
    if(q)return q;
    const scoped=scopedKey();
    if(scoped)return scoped;
    try{const i=window.BLIS_INITIAL_CLIENT;if(i&&clients[i])return i}catch(e){}
    try{const s=localStorage.getItem('blis-client-ui');if(s&&clients[s])return s}catch(e){}
    return 'aroma';
  }
  function dataMatches(key){
    try{
      const name=String(D?.name||'').toLowerCase();
      if(!name)return false;
      if(key==='mollox')return name.includes('mollox');
      if(key==='aroma')return name.includes('aroma');
      if(key==='bolyarka')return name.includes('боляр')||name.includes('bolyar')||name.includes('boliar');
      if(key==='astor-garden')return name.includes('astor');
      if(key==='varna-towers')return name.includes('varna towers');
    }catch(e){}
    return false;
  }
  function patchReferenceBrandCopy(key){
    const c=clients[key]||clients.aroma;
    const active=document.querySelector('.page.active');
    if(!active)return;
    try{
      const walker=document.createTreeWalker(active,NodeFilter.SHOW_TEXT);
      const nodes=[];let n;
      while((n=walker.nextNode()))nodes.push(n);
      nodes.forEach(t=>{
        const txt=String(t.nodeValue||'').trim();
        if(txt==='AROMA')t.nodeValue=t.nodeValue.replace('AROMA',c.short);
        if(key!=='aroma'&&txt==='Aroma Cosmetics')t.nodeValue=t.nodeValue.replace('Aroma Cosmetics',c.full);
      });
      if(key!=='aroma'){
        active.querySelectorAll('input').forEach(i=>{
          if(i.value==='AROMA'||i.value==='Aroma Cosmetics')i.value=c.short;
          if(/@aroma\.bg$/i.test(i.value))i.value='';
        });
      }
    }catch(e){}
  }
  function paintClient(key){
    const c=clients[key]||clients.aroma;
    document.body.dataset.client=c.theme;
    document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent=c.full);
    document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent=c.type);
    document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent=c.mark);
    document.querySelectorAll('.client-option').forEach(x=>{
      const optionKey=x.dataset.clientKey;
      const optionClient=clients[optionKey];
      if(optionClient){const b=x.querySelector('b');if(b)b.textContent=optionClient.full;const small=x.querySelector('small');if(small)small.textContent=optionClient.type;}
      const on=optionKey===key;
      x.classList.toggle('active',on);
      x.setAttribute('aria-selected',on?'true':'false');
      const ck=x.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':'';
    });
    const title=document.querySelector('.topbar .title h1');if(title)title.textContent=`${greeting()}, ${c.name}!`;
    document.body.classList.add('greeting-ready');
    document.title=`BLIS Navigator 2.0 — ${c.name}`;
    patchReferenceBrandCopy(key);
  }
  function activatePage(id){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const page=document.getElementById(id);if(page)page.classList.add('active');
    document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  }
  function renderCanonicalOverview(key){
    activatePage('overview');
    try{
      if(window.BLISOverviewMaster&&typeof window.BLISOverviewMaster.render==='function')window.BLISOverviewMaster.render();
      else if(window.BLISOverviewMaster&&typeof window.BLISOverviewMaster.refresh==='function')window.BLISOverviewMaster.refresh();
    }catch(e){}
    patchReferenceBrandCopy(key);
  }
  function rerenderActive(){
    const active=document.querySelector('.page.active')?.id;
    if(!active)return;
    if(active==='overview'){
      renderCanonicalOverview(currentKey());
      return;
    }
    if(active==='profile'&&typeof renderProfile==='function'){
      try{renderProfile();patchReferenceBrandCopy(currentKey())}catch(e){}
      return;
    }
    try{if(typeof window.refGo==='function')window.refGo(active)}catch(e){}
  }
  function syncLegacyAppClient(key){
    if(!clients[key])return;
    const sel=document.getElementById('clientSel');
    if(sel&&sel.value!==key)sel.value=key;
    window.BLIS_INITIAL_CLIENT=key;
    paintClient(key);
    try{localStorage.setItem('blis-client-ui',key)}catch(e){}
    try{
      let needsReload=false;
      if(typeof slug!=='undefined'&&slug!==key){slug=key;needsReload=true}
      else if(typeof slug!=='undefined')slug=key;
      if(typeof D!=='undefined'&&!dataMatches(key))needsReload=true;
      if(needsReload&&!correctionInFlight&&typeof load==='function'){
        correctionInFlight=true;
        Promise.resolve(load()).catch(()=>{}).finally(()=>{
          correctionInFlight=false;
          paintClient(key);
          rerenderActive();
        });
      }
    }catch(e){}
  }
  function installClientSelectionGuard(){
    const sel=document.getElementById('clientSel');
    if(!sel)return;
    const enforce=()=>{
      const key=currentKey();
      if(sel.value!==key)sel.value=key;
      syncLegacyAppClient(key);
    };
    const observer=new MutationObserver(enforce);
    observer.observe(sel,{childList:true});
    enforce();
    [80,300,800,1600,2600,4200,6500].forEach(ms=>setTimeout(enforce,ms));
    const started=Date.now();
    const timer=setInterval(()=>{
      enforce();
      if(Date.now()-started>8000)clearInterval(timer);
    },250);
    window.addEventListener('pageshow',()=>setTimeout(enforce,0));
    window.addEventListener('focus',()=>setTimeout(enforce,0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(enforce,0)});
  }
  function apply(key){
    const requested=urlKey();
    if(requested)key=requested;
    else {const scoped=scopedKey();if(scoped)key=scoped;}
    if(!clients[key])key='aroma';
    paintClient(key);
    const sel=document.getElementById('clientSel');if(sel)sel.value=key;
    syncLegacyAppClient(key);
    try{localStorage.setItem('blis-client-ui',key)}catch(e){}
  }
  function closeMenu(){
    const wrap=document.querySelector('.client-switch'),btn=document.querySelector('.client-switch-button');
    if(wrap)wrap.classList.remove('open');
    if(btn)btn.setAttribute('aria-expanded','false');
  }
  function toggleMenu(){
    if(scopedKey()&&!urlKey())return;
    const wrap=document.querySelector('.client-switch'),btn=document.querySelector('.client-switch-button');
    if(!wrap||!btn)return;
    const open=!wrap.classList.contains('open');
    wrap.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
  }
  function navigate(key){
    if(!clients[key])return;
    try{localStorage.setItem('blis-client-ui',key)}catch(e){}
    try{document.cookie=`blis_admin_client=${encodeURIComponent(key)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`}catch(e){}
    window.BLIS_INITIAL_CLIENT=key;
    const u=new URL('/dashboard.html',location.origin);
    u.searchParams.set('client',key);
    location.assign(u.toString());
  }
  function handleClick(e){
    const option=e.target.closest('.client-option[data-client-key]');
    if(option){
      e.preventDefault();e.stopPropagation();
      if(!scopedKey()||urlKey())navigate(option.dataset.clientKey);
      return;
    }
    const button=e.target.closest('.client-switch-button');
    if(button){e.preventDefault();e.stopPropagation();toggleMenu();return;}
    const wrap=document.querySelector('.client-switch');
    if(wrap&&!wrap.contains(e.target))closeMenu();
  }

  /* Retire legacy reference renderers for routes that have a current client-aware screen. */
  function installCurrentRoutes(){
    const old=window.refGo;
    if(typeof old!=='function'||old.__blisCurrentRoutes)return;
    const wrapped=function(id){
      const key=currentKey();
      if(!dataMatches(key))syncLegacyAppClient(key);
      if(id==='overview'){
        const u=new URL(location.href);
        u.searchParams.set('client',key);
        u.searchParams.delete('page');
        u.hash='';
        history.replaceState(null,'',u.pathname+u.search);
        renderCanonicalOverview(key);
        requestAnimationFrame(()=>renderCanonicalOverview(key));
        setTimeout(()=>renderCanonicalOverview(key),60);
        setTimeout(()=>renderCanonicalOverview(key),760);
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      if(id==='live'){
        activatePage('live');
        const u=new URL(location.href);
        u.searchParams.delete('page');
        u.searchParams.set('client',key);
        u.hash='';
        history.replaceState(null,'',u.pathname+u.search);
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          if(typeof window.BLISLiveMount==='function')window.BLISLiveMount();
          else old(id);
          patchReferenceBrandCopy(key);
        }));
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      if(id==='profile'){
        syncLegacyAppClient(key);
        activatePage('profile');
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          try{
            if(typeof renderProfile==='function')renderProfile();
            else old(id);
          }catch(e){old(id)}
          patchReferenceBrandCopy(key);
        }));
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      const out=old(id);
      requestAnimationFrame(()=>patchReferenceBrandCopy(key));
      return out;
    };
    wrapped.__blisCurrentRoutes=true;
    wrapped.__previous=old;
    window.refGo=wrapped;
  }

  function normalizeScopedEntry(){
    const requested=urlKey();
    const scoped=scopedKey();
    if(requested)return;
    if(!scoped)return;
    const u=new URL(location.href);
    const hadLegacyPage=u.searchParams.has('page');
    const wrongClient=u.searchParams.get('client')!==scoped;
    if(hadLegacyPage||wrongClient||u.hash){
      u.searchParams.set('client',scoped);
      u.searchParams.delete('page');
      u.hash='';
      history.replaceState(null,'',u.pathname+u.search);
    }
    if(hadLegacyPage){
      try{window.refGo&&window.refGo('overview')}catch(e){}
      setTimeout(()=>{try{window.refGo&&window.refGo('overview')}catch(e){}},850);
    }
  }

  function init(){
    installCurrentRoutes();
    normalizeScopedEntry();
    const key=currentKey();
    window.BLIS_INITIAL_CLIENT=key;
    apply(key);
    installClientSelectionGuard();
    document.addEventListener('click',handleClick,true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    const sel=document.getElementById('clientSel');
    if(sel)sel.addEventListener('change',e=>navigate(e.target.value));
    const wrap=document.querySelector('.client-switch');
    if(wrap){wrap.style.position='relative';wrap.style.zIndex='200';}
    const menu=document.querySelector('.client-switch-menu');if(menu)menu.style.zIndex='1000';
    setTimeout(installCurrentRoutes,950);
    window.addEventListener('load',()=>{syncLegacyAppClient(currentKey());setTimeout(rerenderActive,120)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
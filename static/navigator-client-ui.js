/* BLIS Navigator — isolated client switcher controller + scoped client route guard. */
(function(){
  'use strict';
  const clients={
    aroma:{name:'Aroma Cosmetics',full:'Aroma Cosmetics',type:'Козметика',mark:'A',theme:'aroma'},
    bolyarka:{name:'Болярка',full:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ',theme:'bolyarka'},
    'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG',theme:'astor-garden'},
    'varna-towers':{name:'Varna Towers',full:'Varna Towers',type:'Бизнес център / недвижими имоти',mark:'VT',theme:'varna-towers'},
    mollox:{name:'MOLLOX',full:'MOLLOX България',type:'Професионална хигиена',mark:'MX',theme:'mollox'}
  };
  const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Добро утро':h>=12&&h<18?'Добър ден':'Добър вечер'};
  function scopedKey(){
    try{const s=window.BLIS_CLIENT_SCOPE;if(s&&clients[s])return s}catch(e){}
    return null;
  }
  function currentKey(){
    const scoped=scopedKey();
    if(scoped)return scoped;
    const q=new URLSearchParams(location.search).get('client');
    if(q&&clients[q])return q;
    try{const s=localStorage.getItem('blis-client-ui');if(s&&clients[s])return s}catch(e){}
    return 'aroma';
  }
  function syncLegacyAppClient(key){
    if(!clients[key])return;
    const sel=document.getElementById('clientSel');
    if(sel&&sel.value!==key)sel.value=key;
    try{
      let needsReload=false;
      if(typeof slug!=='undefined'&&slug!==key){slug=key;needsReload=true}
      if(typeof D!=='undefined'&&D&&D.slug&&D.slug!==key)needsReload=true;
      if(needsReload&&typeof load==='function')load();
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
    [80,300,800,1600].forEach(ms=>setTimeout(enforce,ms));
  }
  function apply(key){
    const scoped=scopedKey();
    if(scoped)key=scoped;
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
    const sel=document.getElementById('clientSel');if(sel)sel.value=key;
    syncLegacyAppClient(key);
    const title=document.querySelector('.topbar .title h1');if(title)title.textContent=`${greeting()}, ${c.name}!`;
    document.body.classList.add('greeting-ready');
    document.title=`BLIS Navigator 2.0 — ${c.name}`;
    try{localStorage.setItem('blis-client-ui',key)}catch(e){}
  }
  function closeMenu(){
    const wrap=document.querySelector('.client-switch'),btn=document.querySelector('.client-switch-button');
    if(wrap)wrap.classList.remove('open');
    if(btn)btn.setAttribute('aria-expanded','false');
  }
  function toggleMenu(){
    if(scopedKey())return;
    const wrap=document.querySelector('.client-switch'),btn=document.querySelector('.client-switch-button');
    if(!wrap||!btn)return;
    const open=!wrap.classList.contains('open');
    wrap.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
  }
  function navigate(key){
    const scoped=scopedKey();
    if(scoped)key=scoped;
    if(!clients[key])return;
    apply(key);
    const u=new URL(location.href);
    u.searchParams.set('client',key);
    u.searchParams.delete('page');
    u.hash='overview';
    location.assign(u.toString());
  }
  function handleClick(e){
    const option=e.target.closest('.client-option[data-client-key]');
    if(option){
      e.preventDefault();e.stopPropagation();
      if(!scopedKey())navigate(option.dataset.clientKey);
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
      if(id==='live'){
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
        const live=document.getElementById('live');
        if(live)live.classList.add('active');
        document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='live'));
        const u=new URL(location.href);
        u.searchParams.delete('page');
        if(scopedKey())u.searchParams.set('client',scopedKey());
        u.hash='';
        history.replaceState(null,'',u.pathname+u.search);
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          if(typeof window.BLISLiveMount==='function')window.BLISLiveMount();
          else old(id);
        }));
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      if(id==='profile'){
        const key=currentKey();
        syncLegacyAppClient(key);
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
        const profile=document.getElementById('profile');
        if(profile)profile.classList.add('active');
        document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='profile'));
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          try{
            if(typeof renderProfile==='function')renderProfile();
            else old(id);
          }catch(e){old(id)}
        }));
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      return old(id);
    };
    wrapped.__blisCurrentRoutes=true;
    wrapped.__previous=old;
    window.refGo=wrapped;
  }

  /* Old emailed/bookmarked URLs may contain ?page=live. Protected client entry
     always starts on the current Overview screen and removes that legacy route. */
  function normalizeScopedEntry(){
    const scoped=scopedKey();
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
    apply(currentKey());
    installClientSelectionGuard();
    document.addEventListener('click',handleClick,true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    const sel=document.getElementById('clientSel');
    if(sel)sel.addEventListener('change',e=>navigate(e.target.value));
    const wrap=document.querySelector('.client-switch');
    if(wrap){wrap.style.position='relative';wrap.style.zIndex='200';}
    const menu=document.querySelector('.client-switch-menu');if(menu)menu.style.zIndex='1000';
    setTimeout(installCurrentRoutes,950);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
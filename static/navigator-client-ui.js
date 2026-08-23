/* BLIS Navigator — visual client switcher. app.js owns slug + data loading. */
(function(){
  'use strict';

  const clients={
    aroma:{name:'Aroma Cosmetics',full:'Aroma Cosmetics',type:'Козметика',mark:'A',theme:'aroma',short:'AROMA'},
    bolyarka:{name:'Болярка',full:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ',theme:'bolyarka',short:'БОЛЯРКА'},
    'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG',theme:'astor-garden',short:'ASTOR GARDEN'},
    'varna-towers':{name:'Varna Towers',full:'Varna Towers',type:'Бизнес център / недвижими имоти',mark:'VT',theme:'varna-towers',short:'VARNA TOWERS'},
    mollox:{name:'MOLLOX',full:'MOLLOX България',type:'Професионална хигиена',mark:'MX',theme:'mollox',short:'MOLLOX'}
  };

  const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Добро утро':h>=12&&h<18?'Добър ден':'Добър вечер'};
  const valid=k=>!!clients[k];

  function urlKey(){
    try{const k=new URLSearchParams(location.search).get('client');return valid(k)?k:null}catch(_){return null}
  }
  function scopeKey(){
    try{return valid(window.BLIS_CLIENT_SCOPE)?window.BLIS_CLIENT_SCOPE:null}catch(_){return null}
  }
  function appKey(){
    try{if(typeof slug!=='undefined'&&valid(slug))return slug}catch(_){ }
    return null;
  }
  function currentKey(){
    const q=urlKey(); if(q)return q;
    const a=appKey(); if(a)return a;
    const s=scopeKey(); if(s)return s;
    try{if(valid(window.BLIS_INITIAL_CLIENT))return window.BLIS_INITIAL_CLIENT}catch(_){ }
    try{const saved=localStorage.getItem('blis-client-ui');if(valid(saved))return saved}catch(_){ }
    return 'aroma';
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
      if(key!=='aroma')active.querySelectorAll('input').forEach(i=>{
        if(i.value==='AROMA'||i.value==='Aroma Cosmetics')i.value=c.short;
        if(/@aroma\.bg$/i.test(i.value))i.value='';
      });
    }catch(_){ }
  }

  function paint(key){
    if(!valid(key))key='aroma';
    const c=clients[key];
    document.body.dataset.client=c.theme;
    document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent=c.full);
    document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent=c.type);
    document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent=c.mark);
    document.querySelectorAll('.client-option[data-client-key]').forEach(x=>{
      const on=x.dataset.clientKey===key;
      x.classList.toggle('active',on);
      x.setAttribute('aria-selected',on?'true':'false');
      const ck=x.querySelector('.client-option-check'); if(ck)ck.textContent=on?'✓':'';
    });
    const title=document.querySelector('.topbar .title h1');
    if(title)title.textContent=`${greeting()}, ${c.name}!`;
    document.body.classList.add('greeting-ready');
    document.title=`BLIS Navigator 2.0 — ${c.name}`;
    patchReferenceBrandCopy(key);
  }

  function activatePage(id){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const page=document.getElementById(id); if(page)page.classList.add('active');
    document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  }

  function renderCanonicalOverview(){
    const key=currentKey();
    activatePage('overview');
    try{
      if(window.BLISOverviewMaster&&typeof window.BLISOverviewMaster.render==='function')window.BLISOverviewMaster.render();
      else if(window.BLISOverviewMaster&&typeof window.BLISOverviewMaster.refresh==='function')window.BLISOverviewMaster.refresh();
      else if(typeof renderOverview==='function')renderOverview();
    }catch(_){ }
    paint(key);
  }

  function installRoutes(){
    const previous=window.refGo;
    if(typeof previous!=='function'||previous.__blisClientAwareRoutes)return;
    const wrapped=function(id){
      const key=currentKey();
      if(id==='overview'){
        renderCanonicalOverview();
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      if(id==='profile'){
        activatePage('profile');
        try{if(typeof renderProfile==='function')renderProfile();else previous(id)}catch(_){previous(id)}
        paint(key);
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      if(id==='live'){
        activatePage('live');
        try{if(typeof window.BLISLiveMount==='function')window.BLISLiveMount();else previous(id)}catch(_){previous(id)}
        paint(key);
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      const out=previous.apply(this,arguments);
      paint(key);
      return out;
    };
    wrapped.__blisClientAwareRoutes=true;
    wrapped.__previous=previous;
    window.refGo=wrapped;
  }

  function closeMenu(){
    const wrap=document.querySelector('.client-switch');
    const btn=document.querySelector('.client-switch-button');
    if(wrap)wrap.classList.remove('open');
    if(btn)btn.setAttribute('aria-expanded','false');
  }
  function toggleMenu(){
    if(scopeKey()&&!urlKey())return;
    const wrap=document.querySelector('.client-switch');
    const btn=document.querySelector('.client-switch-button');
    if(!wrap||!btn)return;
    const open=!wrap.classList.contains('open');
    wrap.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
  }

  function selectClient(key){
    if(!valid(key))return;
    if(scopeKey()&&!urlKey())return;
    closeMenu();
    try{localStorage.setItem('blis-client-ui',key)}catch(_){ }
    try{document.cookie=`blis_admin_client=${encodeURIComponent(key)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`}catch(_){ }
    if(key==='mollox'){
      location.assign('/mollox.html?client=mollox');
      return;
    }
    window.BLIS_INITIAL_CLIENT=key;
    const u=new URL(location.href);
    u.pathname='/dashboard.html';
    u.search='';
    u.searchParams.set('client',key);
    u.hash='';
    history.replaceState(null,'',u.pathname+u.search);
    const sel=document.getElementById('clientSel');
    if(!sel)return;
    sel.value=key;
    paint(key);
    activatePage('overview');
    sel.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function handleClick(e){
    const option=e.target.closest('.client-option[data-client-key]');
    if(option){e.preventDefault();e.stopPropagation();selectClient(option.dataset.clientKey);return}
    const button=e.target.closest('.client-switch-button');
    if(button){e.preventDefault();e.stopPropagation();toggleMenu();return}
    const wrap=document.querySelector('.client-switch');
    if(wrap&&!wrap.contains(e.target))closeMenu();
  }

  function init(){
    const key=currentKey();
    if(key==='mollox'&&location.pathname!='/mollox.html'){
      location.replace('/mollox.html?client=mollox');
      return;
    }
    installRoutes();
    paint(key);
    const sel=document.getElementById('clientSel');
    if(sel&&valid(key))sel.value=key;
    document.addEventListener('click',handleClick,true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    const wrap=document.querySelector('.client-switch'); if(wrap){wrap.style.position='relative';wrap.style.zIndex='200'}
    const menu=document.querySelector('.client-switch-menu'); if(menu)menu.style.zIndex='1000';
    try{if(typeof D!=='undefined'&&D&&document.getElementById('overview')?.classList.contains('active'))renderCanonicalOverview()}catch(_){ }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

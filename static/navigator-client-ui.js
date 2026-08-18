/* BLIS Navigator — isolated client switcher controller. No dashboard rendering. */
(function(){
  'use strict';
  const clients={
    aroma:{name:'AROMA',full:'AROMA Cosmetics AD',type:'Козметика',mark:'A',theme:'aroma'},
    bolyarka:{name:'Болярка',full:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ',theme:'bolyarka'},
    'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG',theme:'astor-garden'}
  };
  const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Добро утро':h>=12&&h<18?'Добър ден':'Добър вечер'};
  function currentKey(){
    const q=new URLSearchParams(location.search).get('client');
    if(q&&clients[q])return q;
    try{const s=localStorage.getItem('blis-client-ui');if(s&&clients[s])return s}catch(e){}
    return 'aroma';
  }
  function apply(key){
    const c=clients[key]||clients.aroma;
    document.body.dataset.client=c.theme;
    document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent=c.full);
    document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent=c.type);
    document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent=c.mark);
    document.querySelectorAll('.client-option').forEach(x=>{
      const on=x.dataset.clientKey===key;
      x.classList.toggle('active',on);
      x.setAttribute('aria-selected',on?'true':'false');
      const ck=x.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':'';
    });
    const sel=document.getElementById('clientSel');if(sel)sel.value=key;
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
    const wrap=document.querySelector('.client-switch'),btn=document.querySelector('.client-switch-button');
    if(!wrap||!btn)return;
    const open=!wrap.classList.contains('open');
    wrap.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
  }
  function navigate(key){
    if(!clients[key])return;
    apply(key);
    const u=new URL(location.href);
    u.searchParams.set('client',key);
    u.hash='overview';
    location.assign(u.toString());
  }
  function handleClick(e){
    const option=e.target.closest('.client-option[data-client-key]');
    if(option){e.preventDefault();e.stopPropagation();navigate(option.dataset.clientKey);return;}
    const button=e.target.closest('.client-switch-button');
    if(button){e.preventDefault();e.stopPropagation();toggleMenu();return;}
    const wrap=document.querySelector('.client-switch');
    if(wrap&&!wrap.contains(e.target))closeMenu();
  }
  function init(){
    apply(currentKey());
    document.addEventListener('click',handleClick,true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    const sel=document.getElementById('clientSel');
    if(sel)sel.addEventListener('change',e=>navigate(e.target.value));
    const wrap=document.querySelector('.client-switch');
    if(wrap){wrap.style.position='relative';wrap.style.zIndex='200';}
    const menu=document.querySelector('.client-switch-menu');if(menu)menu.style.zIndex='1000';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

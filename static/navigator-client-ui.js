/* BLIS Navigator — stable interactive client switcher + canonical SVG icons */
(function(){
  const clients={
    aroma:{name:'AROMA',full:'AROMA Cosmetics AD',type:'Козметика',mark:'A',theme:'aroma'},
    bolyarka:{name:'Болярка',full:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ',theme:'bolyarka'},
    'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG',theme:'astor-garden'}
  };
  const svg={
    home:'<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
    live:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    social:'<path d="M4 20c.8-4 2.8-6 6-6s5.2 2 6 6"/><circle cx="10" cy="8" r="3"/><circle cx="18" cy="9" r="2"/><path d="M16 15c2.6.2 4.2 1.7 5 4"/>',
    digital:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9"/>',
    reputation:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3z"/><path d="m9 12 2 2 4-5"/>',
    market:'<path d="M3 13h4l2-6 4 11 2-6h6"/><path d="M4 20h16"/>',
    competition:'<path d="M5 20V10M10 20V5M15 20v-8M20 20V3"/><path d="M3 20h19"/>',
    signals:'<path d="M6 8a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M9 19c.7 1.3 1.7 2 3 2s2.3-.7 3-2"/>',
    reports:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    sources:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 2 4 3 8 3s8-1 8-3V5M4 12v7c0 2 4 3 8 3s8-1 8-3v-7"/>',
    history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    timeline:'<path d="M5 4v16M5 7h8M5 12h12M5 17h6"/><circle cx="5" cy="7" r="1.4"/><circle cx="5" cy="12" r="1.4"/><circle cx="5" cy="17" r="1.4"/>',
    profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 3-7 8-7s7 2 8 7"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3 14.5l2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 3.1h5l.4-3.1a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2.1-1.5c.1-.3.1-.7.1-1z"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.8 2c-1 .7-1.6 1.1-1.6 2.5M12 17h.01"/>',
    trend:'<path d="M4 17 10 11l4 4 6-8"/><path d="M15 7h5v5"/>',
    people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c.8-4 2.8-6 6-6s5.2 2 6 6M15 15c3 0 5 1.7 6 4.5"/>',
    eye:'<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.8"/>',
    shield:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3z"/><path d="m9 12 2 2 4-5"/>',
    heart:'<path d="M20 5c-2-2-5-2-7 0l-1 1-1-1c-2-2-5-2-7 0s-2 5 0 7l8 8 8-8c2-2 2-5 0-7z"/>',
    up:'<path d="M5 16 16 5"/><path d="M9 5h7v7"/>',
    down:'<path d="m5 8 11 11"/><path d="M9 19h7v-7"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'
  };
  const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${svg[name]||svg.target}</svg>`;
  const navMap={overview:'home',live:'live',social:'social',digital:'digital',reputation:'reputation',market:'market',competition:'competition',signals:'signals',reports:'reports',sources:'sources',history:'history',timeline:'timeline',profile:'profile',settings:'settings',help:'help'};

  function replaceNavIcons(){
    document.querySelectorAll('#nav button[data-page]').forEach(btn=>{
      const host=btn.querySelector('.navico'); if(!host)return;
      const kind=navMap[btn.dataset.page]||'target';
      if(host.dataset.canonicalIcon===kind)return;
      host.innerHTML=icon(kind); host.dataset.canonicalIcon=kind;
    });
  }
  function replaceOverviewIcons(){
    const kinds=['trend','people','eye','shield','heart'];
    document.querySelectorAll('#overview .ov-kpi .ov-ico').forEach((el,i)=>{
      const kind=kinds[i]||'target'; if(el.dataset.canonicalIcon===kind)return;
      el.innerHTML=icon(kind); el.dataset.canonicalIcon=kind;
    });
    document.querySelectorAll('#overview .ov-signal-ico').forEach((el,i)=>{
      const kind=i===1?'down':i===2?'target':'up'; if(el.dataset.canonicalIcon===kind)return;
      el.innerHTML=icon(kind); el.dataset.canonicalIcon=kind;
    });
  }
  function setClient(key){
    const c=clients[key]||clients.aroma;
    document.body.dataset.client=c.theme;
    try{localStorage.setItem('blis-client-ui',key)}catch(e){}
    document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent=c.full);
    document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent=c.type);
    document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent=c.mark);
    const legacy=document.getElementById('clientSel'); if(legacy)legacy.value=key;
    document.querySelectorAll('.client-option').forEach(x=>{
      const on=x.dataset.clientKey===key;x.classList.toggle('active',on);x.setAttribute('aria-selected',on?'true':'false');
      const ck=x.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':'';
    });
    const title=document.querySelector('.topbar .title h1');if(title)title.textContent=`Добро утро, екип ${c.name}!`;
    document.querySelectorAll('.topuser b,.sideuser b').forEach(x=>x.textContent=`Екип ${c.name}`);
    document.title=`BLIS Navigator 2.0 — ${c.name}`;
    const wrap=document.querySelector('.client-switch');if(wrap)wrap.classList.remove('open');
    const btn=document.querySelector('.client-switch-button');if(btn)btn.setAttribute('aria-expanded','false');
  }
  function bindSwitcher(){
    const wrap=document.querySelector('.client-switch'); const btn=document.querySelector('.client-switch-button');
    if(!wrap||!btn||btn.dataset.bound)return; btn.dataset.bound='1';
    btn.addEventListener('click',e=>{e.stopPropagation();wrap.classList.toggle('open');btn.setAttribute('aria-expanded',wrap.classList.contains('open')?'true':'false')});
    wrap.querySelectorAll('.client-option').forEach(x=>x.addEventListener('click',e=>{e.stopPropagation();setClient(x.dataset.clientKey)}));
    document.addEventListener('click',e=>{if(!wrap.contains(e.target)){wrap.classList.remove('open');btn.setAttribute('aria-expanded','false')}});
    let saved='aroma'; try{saved=localStorage.getItem('blis-client-ui')||document.body.dataset.client||'aroma'}catch(e){}
    setClient(saved);
  }
  function polish(){replaceNavIcons();replaceOverviewIcons();}
  function init(){
    bindSwitcher(); polish();
    [80,220,500,1000,1800].forEach(ms=>setTimeout(polish,ms));
    const nav=document.getElementById('nav'); if(nav)new MutationObserver(()=>requestAnimationFrame(polish)).observe(nav,{childList:true,subtree:false});
    const ov=document.getElementById('overviewPremium'); if(ov)new MutationObserver(()=>requestAnimationFrame(replaceOverviewIcons)).observe(ov,{childList:true,subtree:false});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

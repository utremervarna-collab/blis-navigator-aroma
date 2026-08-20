/* Varna Towers — direct static hero. */
(function(){
  'use strict';
  function isVT(){return document.body.dataset.client==='varna-towers'}
  function apply(){
    if(!isVT())return;
    const bg=document.querySelector('.topbar .client-photo-bg');
    if(!bg)return;
    bg.style.setProperty('background-image','url("/varna-towers-profile-hero-header-v2.jpg?v=20260818-direct")','important');
    bg.style.setProperty('background-position','center center','important');
    bg.style.setProperty('background-size','cover','important');
    bg.style.setProperty('background-repeat','no-repeat','important');
    bg.style.setProperty('opacity','1','important');
    bg.style.setProperty('transform','none','important');
    bg.dataset.varnaTowersHero='ready-direct';
  }
  function run(){requestAnimationFrame(()=>{apply();setTimeout(apply,120);setTimeout(apply,420)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',run,{once:true});
  window.addEventListener('blis:clientdata',run);
})();

/* BLIS Navigator — critical Perception route/header stabilizer.
   Keeps the legacy reference renderer out of the market route and restores
   the global Navigator header that the reference skin used to hide. */
(function(){
  'use strict';
  const FLAG='__BLISPerceptionRouteFixV1';
  if(window[FLAG])return;
  window[FLAG]=true;

  function marketActive(){return !!document.getElementById('market')?.classList.contains('active')}

  function restoreNavigatorHeader(){
    if(!marketActive())return;
    const top=document.querySelector('.topbar');
    const system=document.querySelector('.blis-system-bar');
    const sync=document.querySelector('.sync');
    const shell=document.querySelector('.shell');
    if(top)top.style.setProperty('display','flex','important');
    if(system)system.style.setProperty('display','grid','important');
    if(sync)sync.style.setProperty('display','block','important');
    if(shell)shell.style.setProperty('padding-top','22px','important');
  }

  function repairMapHead(){
    if(!marketActive())return;
    const heads=[...document.querySelectorAll('#market .pm-maphead')];
    if(!heads.length)return;
    const head=heads[0];
    heads.slice(1).forEach(x=>x.remove());

    let expand=head.querySelector('.pm-expand');
    if(expand)expand.remove();
    while(head.firstChild)head.removeChild(head.firstChild);

    const group=document.createElement('div');
    group.className='pm-head-primary';
    const title=document.createElement('b');
    title.textContent='Интерактивна карта на възприятието';
    const badge=document.createElement('small');
    badge.textContent='● В реално време';
    group.append(title,badge);
    head.appendChild(group);
    if(expand)head.appendChild(expand);
  }

  function repairHero(){
    if(!marketActive())return;
    const hero=document.querySelector('#market .pm-hero');
    if(!hero)return;
    const h=hero.querySelector('h2');
    const p=hero.querySelector('p');
    if(h)h.textContent='Карта на потребителското възприятие';
    if(p)p.textContent='Проследяване на потребителските сигнали и възприятия за бранда в реално време.';
  }

  function repair(){
    restoreNavigatorHeader();
    repairHero();
    repairMapHead();
  }

  function scheduleRepair(){
    [0,40,120,280,650,1200].forEach(ms=>setTimeout(repair,ms));
  }

  function activateMarket(){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const page=document.getElementById('market');
    if(!page)return;
    page.classList.add('active');
    document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='market'));

    const navLabel=document.querySelector('#nav [data-page="market"] span:last-child');
    if(navLabel)navLabel.textContent='Карта на възприятията';

    requestAnimationFrame(()=>{
      if(window.BLISPerceptionMap?.mount)window.BLISPerceptionMap.mount();
      else if(window.BLISPerceptionMap?.render)window.BLISPerceptionMap.render();
      if(window.BLISPerceptionGlobe?.apply)window.BLISPerceptionGlobe.apply();
      scheduleRepair();
    });
    try{window.scrollTo({top:0,behavior:'auto'})}catch(_){window.scrollTo(0,0)}
  }

  function installRoute(name){
    const current=window[name];
    if(typeof current!=='function'||current.__blisPerceptionRouteFix)return;
    const wrapped=function(id){
      if(id==='market'){
        activateMarket();
        return;
      }
      return current.apply(this,arguments);
    };
    wrapped.__blisPerceptionRouteFix=true;
    wrapped.__pmBridgeV12=true;
    wrapped.__previous=current;
    window[name]=wrapped;
  }

  function install(){
    installRoute('refGo');
    installRoute('go');
    if(marketActive()){
      if(window.BLISPerceptionMap?.mount)window.BLISPerceptionMap.mount();
      scheduleRepair();
    }
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="market"]')){
      setTimeout(()=>{install();activateMarket()},0);
      return;
    }
    if(marketActive()&&e.target.closest?.('#market .pm-node,#market [data-related],#market [data-theme],#market [data-kpi],#market .pm-zoom'))scheduleRepair();
  },true);

  document.addEventListener('change',e=>{
    if(marketActive()&&e.target.matches?.('#market [data-pm-period],#market [data-pm-type],#market [data-pm-source],#clientSel'))scheduleRepair();
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{[900,1700,2900,4200].forEach(ms=>setTimeout(install,ms))},{once:true});
  else [0,900,1700,2900,4200].forEach(ms=>setTimeout(install,ms));
  window.addEventListener('load',()=>setTimeout(install,400),{once:true});
})();
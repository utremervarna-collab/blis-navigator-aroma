/* BLIS Navigator — approved page router v1. One route owner, approved renderers only. */
(function(){
  'use strict';
  const VALID=new Set(['overview','live','social','digital','reputation','market','competition','reports','history','profile','settings','help']);
  const NAV=[
    ['overview','▦','Общ преглед'],['live','◉','Live Monitoring'],['social','⌁','Сигнали'],['digital','◎','Видимост'],
    ['reputation','◇','Репутация'],['market','◌','Нагласи'],['competition','⚑','Конкуренти'],['reports','▤','Месечни доклади'],
    ['history','◷','История'],['profile','♙','Клиентски профил'],['settings','⚙','Настройки'],['help','?','Помощ']
  ];
  const clientKey=()=>String(document.getElementById('clientSel')?.value||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma');
  const storageKey=()=>`blis.navigator.page.${clientKey()}`;
  function wantedPage(){
    try{const q=new URLSearchParams(location.search).get('page');if(VALID.has(q))return q}catch(e){}
    try{const p=localStorage.getItem(storageKey());if(VALID.has(p))return p}catch(e){}
    const active=document.querySelector('.page.active')?.id;return VALID.has(active)?active:'overview';
  }
  function remember(id){
    try{localStorage.setItem(storageKey(),id)}catch(e){}
    try{const u=new URL(location.href);u.searchParams.set('page',id);history.replaceState(null,'',u)}catch(e){}
  }
  function nav(){
    const root=document.getElementById('nav');if(!root)return;
    const active=document.querySelector('.page.active')?.id||'overview';
    root.innerHTML=NAV.map(([id,ico,label])=>`<button type="button" data-page="${id}" class="${id===active?'active':''}"><span class="navico" aria-hidden="true">${ico}</span><span class="navtxt">${label}</span></button>`).join('');
  }
  function systemCopy(id){
    const map={overview:['Общ преглед','Обобщаване на активните индекси и сигнали'],live:['Live Monitoring','Наблюдение на източници и активност в реално време'],social:['Сигнали','Социални и публични сигнали'],digital:['Видимост','Дигитална видимост и откриваемост'],reputation:['Репутация','Оценки, отзиви и репутационни сигнали'],market:['Нагласи','Проверими теми, връзки и динамика'],competition:['Конкуренти','Конкурентна позиция и движение'],reports:['Месечни доклади','Генерирани анализи и архив'],history:['История','Архив на измерванията'],profile:['Клиентски профил','Профил и информационно покритие'],settings:['Настройки','Настройки на Navigator'],help:['Помощ','Помощ и информация']};
    const [a,d]=map[id]||map.overview;const x=document.getElementById('blisActiveModule'),y=document.getElementById('blisSystemDetail');if(x)x.textContent=a;if(y)y.textContent=d;
  }
  function renderApproved(id){
    try{
      if(id==='live')window.BLISLiveMount?.();
      else if(id==='social')window.BLISSocialSignalsRender?.();
      else if(id==='digital'){window.BLISDigitalRadar?.render?.();setTimeout(()=>window.BLISDigitalInteractionsPatch?.(),30)}
      else if(id==='reputation')window.BLISReputation?.render?.();
      else if(id==='market'){window.BLISPerceptionBridge?.mount?.();window.BLISAttitudesMasterV2?.mount?.()}
      else if(id==='competition')window.BLISCompetitionMasterV5?.render?.();
      else if(id==='reports'&&typeof window.renderReports==='function')window.renderReports();
      else if(id==='history'&&typeof window.renderHistory==='function')window.renderHistory();
      else if(id==='profile'&&typeof window.renderProfile==='function')window.renderProfile();
    }catch(e){console.error('BLIS approved renderer failed',id,e)}
  }
  function route(id,opts={}){
    if(!VALID.has(id))id='overview';
    document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));
    document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
    if(opts.remember!==false)remember(id);
    systemCopy(id);
    renderApproved(id);
    setTimeout(()=>renderApproved(id),70);
    if(opts.scroll!==false)window.scrollTo({top:0,behavior:'smooth'});
    return id;
  }
  function install(){
    nav();
    window.go=route;window.refGo=route;window.BLISNavigatorRoute=route;
    const root=document.getElementById('nav');
    root?.addEventListener('click',e=>{const b=e.target.closest?.('button[data-page]');if(!b||!root.contains(b))return;e.preventDefault();route(b.dataset.page)});
    route(wantedPage(),{remember:false,scroll:false});
    setTimeout(()=>{nav();route(wantedPage(),{remember:false,scroll:false})},1250);
    window.addEventListener('blis:clientdata',()=>setTimeout(()=>{nav();route(wantedPage(),{remember:false,scroll:false})},40));
    window.addEventListener('blis:periodchange',()=>setTimeout(()=>renderApproved(document.querySelector('.page.active')?.id||'overview'),40));
    document.getElementById('clientSel')?.addEventListener('change',()=>setTimeout(()=>{nav();route(wantedPage(),{remember:false,scroll:false})},180));
    document.documentElement.classList.remove('blis-loading');
    document.body.classList.add('blis-approved-router-ready');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
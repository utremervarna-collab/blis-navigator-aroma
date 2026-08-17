/* BLIS Navigator — module-specific motion activation */
(function(){
  const cfg={
    overview:{title:'Общ преглед',motion:'orbit',copy:'Обобщаване на активните индекси и сигнали'},
    live:{title:'Live Monitoring',motion:'radar',copy:'Сканиране на активните източници в реално време'},
    social:{title:'Социални канали',motion:'wave',copy:'Проследяване на публикации, аудитория и ангажираност'},
    digital:{title:'Дигитална видимост',motion:'grid',copy:'Сканиране на видимостта в дигиталната среда'},
    reputation:{title:'Репутация',motion:'pulse',copy:'Анализ на оценки, тоналност и репутационни сигнали'},
    market:{title:'Пазарни сигнали',motion:'signal',copy:'Засичане на промени в интереса и темите'},
    competition:{title:'Конкуренти',motion:'compare',copy:'Сравнение на позиции и конкурентна динамика'},
    signals:{title:'Сигнали',motion:'signal',copy:'Приоритизиране на рискове, промени и възможности'},
    reports:{title:'Месечни доклади',motion:'document',copy:'Подготовка и архивиране на аналитични отчети'},
    sources:{title:'Източници на данни',motion:'packets',copy:'Събиране и валидиране на данни от активни източници'},
    history:{title:'История',motion:'timeline',copy:'Проследяване на измерванията във времето'},
    timeline:{title:'Intelligence Timeline',motion:'timeline',copy:'Подреждане на събития и промени по време'},
    profile:{title:'Клиентски профил',motion:'document',copy:'Активен аналитичен профил на клиента'},
    settings:{title:'Настройки',motion:'document',copy:'Системна конфигурация на Navigator'},
    help:{title:'Помощ',motion:'document',copy:'Навигация и помощ за работата със системата'}
  };

  function activePage(){return document.querySelector('.page.active')}
  function visualMarkup(type){
    if(type==='radar')return '<span class="motion-radar"></span><span class="motion-radar-dot"></span>';
    if(type==='wave')return '<span class="motion-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
    if(type==='grid')return '<span class="motion-grid"></span>';
    if(type==='pulse')return '<span class="motion-pulse-core"></span>';
    if(type==='signal')return '<span class="motion-signal"></span>';
    if(type==='compare')return '<span class="motion-compare"><i></i><i></i><i></i><i></i></span>';
    if(type==='packets')return '<span class="motion-packets"><i></i><i></i><i></i></span>';
    if(type==='timeline')return '<span class="motion-timeline"><i></i><i></i><i></i></span>';
    if(type==='document')return '<span class="motion-document"></span>';
    return '<span class="motion-orbit"></span><span class="motion-heart"></span>';
  }

  function updateSystemBar(){
    const page=activePage(); if(!page)return;
    const data=cfg[page.id]||cfg.overview;
    const bar=document.querySelector('.blis-system-bar');
    const visual=document.querySelector('#blisMotionVisual');
    const module=document.querySelector('#blisActiveModule');
    const detail=document.querySelector('#blisSystemDetail');
    if(bar)bar.dataset.motion=data.motion;
    if(visual){visual.className='blis-visual';visual.innerHTML=visualMarkup(data.motion)}
    if(module)module.textContent=data.title;
    let sourceCount=0,signalCount=0;
    try{sourceCount=Array.isArray(S)?S.length:0}catch{}
    try{signalCount=Array.isArray(D?.signals)?D.signals.length:0}catch{}
    const meta=[];if(sourceCount)meta.push(`${sourceCount} източника`);if(signalCount)meta.push(`${signalCount} сигнала`);
    if(detail)detail.textContent=meta.length?`${data.copy} · ${meta.join(' · ')}`:data.copy;
  }

  function animateCharts(page){
    if(!page)return;
    page.querySelectorAll('.ov-spark svg,.ov-trend svg,.ref-spark svg,.ref-trend svg,.dig-chart svg,.live-chart svg,svg.chart').forEach(el=>{el.classList.remove('blis-draw');void el.getBoundingClientRect();el.classList.add('blis-draw')});
  }

  function addScanSurfaces(page){
    if(!page)return;
    page.querySelectorAll(':scope .blis-scan-line').forEach(x=>x.remove());
    const data=cfg[page.id]||cfg.overview;
    const allow=['grid','signal','radar','packets'].includes(data.motion);
    if(!allow)return;
    const cards=[...page.querySelectorAll('.ov-card,.ref-card,.live-card,.dig-card')].filter(card=>!card.classList.contains('ov-kpi')&&!card.classList.contains('ref-kpi'));
    cards.slice(0,2).forEach(card=>{card.classList.add('blis-scan-surface');const line=document.createElement('span');line.className='blis-scan-line';line.setAttribute('aria-hidden','true');card.prepend(line)});
  }

  function activate(){const page=activePage();updateSystemBar();addScanSurfaces(page);animateCharts(page)}

  function init(){
    activate();
    document.querySelectorAll('.page').forEach(page=>new MutationObserver(m=>{if(m.some(x=>x.attributeName==='class')&&page.classList.contains('active'))requestAnimationFrame(activate)}).observe(page,{attributes:true,attributeFilter:['class']}));
    document.addEventListener('click',e=>{if(e.target.closest('#nav button,[onclick*="refGo"],[onclick*="go("]'))setTimeout(activate,50)});
    const sync=document.getElementById('lastSync');if(sync)new MutationObserver(updateSystemBar).observe(sync,{childList:true,characterData:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

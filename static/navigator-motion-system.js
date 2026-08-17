/* BLIS Navigator — global motion activation */
(function(){
  const titles={overview:'Общ преглед',live:'Live Monitoring',social:'Социални канали',digital:'Дигитална видимост',reputation:'Репутация',market:'Пазарни сигнали',competition:'Конкуренти',signals:'Сигнали',reports:'Месечни доклади',sources:'Източници на данни',history:'История',timeline:'Intelligence Timeline',profile:'Клиентски профил',settings:'Настройки',help:'Помощ'};

  function activePage(){return document.querySelector('.page.active')}
  function pageName(page){return titles[page?.id]||'BLIS Navigator'}

  function updateSystemBar(){
    const page=activePage();
    const module=document.querySelector('#blisActiveModule');
    const detail=document.querySelector('#blisSystemDetail');
    if(module) module.textContent=pageName(page);
    if(detail){
      let sourceCount=0,signalCount=0;
      try{sourceCount=Array.isArray(S)?S.length:0}catch{}
      try{signalCount=Array.isArray(D?.signals)?D.signals.length:0}catch{}
      const bits=[];
      if(sourceCount)bits.push(`${sourceCount} активни източника`);
      if(signalCount)bits.push(`${signalCount} сигнала`);
      detail.textContent=bits.length?`Наблюдение в реално време · ${bits.join(' · ')}`:'Наблюдение и анализ на активния клиентски профил';
    }
  }

  function animateCharts(page){
    if(!page)return;
    page.querySelectorAll('.ov-spark svg,.ov-trend svg,.ref-spark svg,.ref-trend svg,.dig-chart svg,.live-chart svg,svg.chart,canvas').forEach(el=>{
      if(el.tagName==='SVG'){
        el.classList.remove('blis-draw');
        void el.getBoundingClientRect();
        el.classList.add('blis-draw');
      }
    });
  }

  function addScanSurfaces(page){
    if(!page)return;
    const cards=[...page.querySelectorAll('.ov-card,.ref-card,.live-card,.dig-card')]
      .filter(card=>!card.classList.contains('ov-kpi')&&!card.classList.contains('ref-kpi'));
    cards.slice(0,3).forEach(card=>{
      card.classList.add('blis-scan-surface');
      if(!card.querySelector(':scope > .blis-scan-line')){
        const line=document.createElement('span');line.className='blis-scan-line';line.setAttribute('aria-hidden','true');card.prepend(line);
      }
    });
  }

  function activate(){
    const page=activePage();
    updateSystemBar();
    addScanSurfaces(page);
    animateCharts(page);
  }

  function init(){
    activate();
    document.querySelectorAll('.page').forEach(page=>{
      new MutationObserver(muts=>{if(muts.some(m=>m.attributeName==='class')&&page.classList.contains('active'))requestAnimationFrame(activate)})
        .observe(page,{attributes:true,attributeFilter:['class']});
    });
    document.addEventListener('click',e=>{
      if(e.target.closest('#nav button,[onclick*="refGo"],[onclick*="go("]'))setTimeout(activate,40);
    });
    const dataObserver=new MutationObserver(()=>updateSystemBar());
    const sync=document.getElementById('lastSync');if(sync)dataObserver.observe(sync,{childList:true,characterData:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

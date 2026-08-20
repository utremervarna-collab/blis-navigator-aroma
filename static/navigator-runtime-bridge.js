/* BLIS Navigator — runtime compatibility bridge.
   Keeps app.js as the data/API loader while preventing its legacy renderer
   from writing into the current Navigator DOM. */
(function(){
  'use strict';
  const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
  const pages=new Set(['overview','live','social','digital','reputation','market','competition','signals','reports','sources','history','timeline','profile','settings','help']);
  const initialClient=()=>{
    try{
      const q=new URLSearchParams(location.search).get('client');
      if(q&&clients.has(q))return q;
    }catch(e){}
    return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
  };
  const initialPage=()=>{
    try{
      const q=new URLSearchParams(location.search).get('page');
      if(q&&pages.has(q))return q;
    }catch(e){}
    return null;
  };

  const legacyLoad=window.load;
  if(typeof legacyLoad==='function'){
    window.load=async function(){
      const wanted=initialClient();
      if(wanted){
        try{slug=wanted}catch(e){}
        const sel=document.getElementById('clientSel');
        if(sel)sel.value=wanted;
      }
      return legacyLoad();
    };
  }

  window.renderAll=function(){
    try{
      const x=typeof dossier==='function'?dossier():null;
      if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
      if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
      const note=document.getElementById('clientNote');
      if(note)note.textContent=D?.note||x?.descriptor||'';
      const sync=document.getElementById('lastSync');
      if(sync)sync.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'няма синхронизация';
    }catch(e){console.error('BLIS bridge render state failed',e)}
  };

  function openRequestedPage(attempt=0){
    const wanted=initialPage();
    if(!wanted||wanted==='overview')return;
    if(typeof window.refGo==='function'){
      window.refGo(wanted);
      return;
    }
    if(attempt<20)setTimeout(()=>openRequestedPage(attempt+1),100);
  }

  function ensurePerceptionSimpleLayer(){
    if(document.getElementById('blisPerceptionSimpleV1'))return;
    const s=document.createElement('script');
    s.id='blisPerceptionSimpleV1';
    s.src='/navigator-perception-simple-v1.js?v=20260820-live3';
    s.defer=true;
    document.head.appendChild(s);
  }

  function ensurePerceptionReadableCSS(){
    if(document.getElementById('blisPerceptionReadableCSS'))return;
    const l=document.createElement('link');
    l.id='blisPerceptionReadableCSS';
    l.rel='stylesheet';
    l.href='/navigator-perception-readable.css?v=20260820-readable1';
    document.head.appendChild(l);
  }

  let perceptionCopyTimer=0;
  const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value};
  function optimizePerceptionContent(){
    const root=document.getElementById('market');
    if(!root)return;

    setText(root.querySelector('.pm-hero h2'),'Карта на възприятието');
    setText(root.querySelector('.pm-hero p'),'Показва кои теми и източници оформят възприятието за бранда и как се променят през избрания период. Избери сигнал за подробности.');

    const active=document.getElementById('blisActiveModule');
    const detail=document.getElementById('blisSystemDetail');
    if(root.classList.contains('active')){
      setText(active,'Пазарни сигнали');
      setText(detail,'Проследяване на промени във възприятието, темите и източниците.');
    }

    const kpiCopy={
      perception:['Общо възприятие','Обобщена оценка от наличните сигнали'],
      trend:['Промяна за периода','Разлика спрямо предходното сравнимо измерване'],
      signals:['Активни сигнали','Теми с измерима активност в избрания период'],
      rating:['Средна оценка','От наличните публични оценки'],
      sources:['Активни източници','Източници с данни за избрания период']
    };
    root.querySelectorAll('.pms-kpi[data-pms-action]').forEach(card=>{
      const copy=kpiCopy[card.dataset.pmsAction];
      if(!copy)return;
      setText(card.querySelector('.pms-kpi-label'),copy[0]);
      setText(card.querySelector('.pms-kpi-foot'),copy[1]);
    });

    const panel=root.querySelector('.pms-live-panel');
    if(panel){
      setText(panel.querySelector('.pms-live-head b'),'Какво показва сигналът');
      const chip=panel.querySelector('.pms-live-chip');
      if(chip&&chip.textContent.trim()!=='АКТУАЛНО')chip.innerHTML='<i></i>АКТУАЛНО';
      setText(panel.querySelector('.pms-value-label'),'Текуща стойност');
      const facts=panel.querySelectorAll('.pms-fact span');
      if(facts[0])setText(facts[0],'Свързани теми');
      if(facts[1])setText(facts[1],'Източници');
      if(facts[2])setText(facts[2],'Обновено');
      panel.querySelectorAll('.pms-section h4').forEach(h=>{
        if(h.textContent.trim()==='Какво се случва')setText(h,'Какво означава');
        else if(h.textContent.trim()==='Къде го виждаме')setText(h,'Източници');
      });
      const placeholder=[...panel.querySelectorAll('.pms-section')].find(s=>/Проверим сигнал от текущата информационна среда/i.test(s.textContent||''));
      if(placeholder)placeholder.style.display='none';
      setText(panel.querySelector('[data-pms-module]'),'Отвори анализа');
      const category=panel.querySelector('.pms-signal-top small');
      if(category){
        const map={'Социални сигнали':'Социални канали','Търсене':'Търсене и интерес','Поведение':'Потребителско поведение'};
        if(map[category.textContent.trim()])setText(category,map[category.textContent.trim()]);
      }
    }

    const cards=root.querySelectorAll('.pms-bottom-card');
    if(cards[0]){
      setText(cards[0].querySelector('h3'),'Как се променя възприятието');
      setText(cards[0].querySelector('.pms-bottom-head p'),'Общата оценка във времето за избрания период');
      const chip=cards[0].querySelector('.pms-bottom-live');
      if(chip&&chip.textContent.trim()!=='АКТУАЛНО')chip.innerHTML='<i></i>АКТУАЛНО';
    }
    if(cards[1]){
      setText(cards[1].querySelector('h3'),'Нови измервания');
      setText(cards[1].querySelector('.pms-bottom-head p'),'Последните значими данни от наблюдаваните източници');
      const chip=cards[1].querySelector('.pms-bottom-live');
      if(chip&&chip.textContent.trim()!=='НОВИ ДАННИ')chip.innerHTML='<i></i>НОВИ ДАННИ';

      const rename={
        'Positive keyword hits':'Позитивни сигнали',
        'Negative keyword hits':'Негативни сигнали',
        'News sources 30d':'Медийни източници',
        'Latest news title':'Последна публикация',
        'Recent industry events':'Индустриална активност',
        'Brand visible':'Видимост на марката',
        'Ecommerce signal':'E-commerce активност',
        'Pricing signal':'Ценова видимост',
        'Social links':'Социални канали',
        'Category signal count':'Продуктови категории',
        'Sitemap collections':'Продуктови секции',
        'Blog events':'Новини и събития',
        'Ratings':'Брой оценки'
      };
      const technical=/^(Response ms|Page words|Page title|Search url|Reachable|Relevant term hits|Aroma mentions|Email visible|Contact terms|Price markers|Brand mentions on result|Term signal count)$/i;
      let visible=0;
      cards[1].querySelectorAll('.pms-stream-row').forEach(row=>{
        const label=row.querySelector('.pms-stream-copy b');
        const key=label?.textContent?.trim()||'';
        const hide=technical.test(key);
        row.style.display=hide?'none':'';
        if(!hide){
          visible++;
          if(rename[key])setText(label,rename[key]);
        }
      });
      const foot=cards[1].querySelector('.pms-stream-foot');
      if(foot){
        const spans=foot.querySelectorAll('span');
        if(spans[0])setText(spans[0],visible?`${visible} значими измервания`:'Няма нови значими измервания');
        if(spans[1]){
          const n=(spans[1].textContent.match(/\d+/)||[])[0];
          if(n)setText(spans[1],`${n} източника с нови данни`);
        }
      }
    }
  }
  function schedulePerceptionContent(delay=0){
    clearTimeout(perceptionCopyTimer);
    perceptionCopyTimer=setTimeout(()=>requestAnimationFrame(optimizePerceptionContent),delay);
  }
  function installPerceptionContent(){
    const root=document.getElementById('market');
    if(!root)return;
    schedulePerceptionContent(0);
    new MutationObserver(()=>schedulePerceptionContent(30)).observe(root,{childList:true,subtree:true,characterData:true});
    document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page="market"],#market .pm-node'))schedulePerceptionContent(90)},true);
    document.addEventListener('change',e=>{if(e.target.matches?.('#market select,#clientSel'))schedulePerceptionContent(120)},true);
    window.addEventListener('blis:clientdata',()=>schedulePerceptionContent(140));
    window.addEventListener('blis:periodchange',()=>schedulePerceptionContent(100));
  }

  ensurePerceptionSimpleLayer();
  ensurePerceptionReadableCSS();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      setTimeout(openRequestedPage,850);
      setTimeout(installPerceptionContent,250);
    },{once:true});
  }else{
    setTimeout(openRequestedPage,850);
    setTimeout(installPerceptionContent,250);
  }
})();

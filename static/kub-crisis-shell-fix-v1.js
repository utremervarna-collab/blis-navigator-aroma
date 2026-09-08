/* KUB-only shell corrections. Runs before the KUB language layers. */
(function(){
'use strict';
if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;
const requested=(new URLSearchParams(location.search).get('lang')||'').toLowerCase();
let saved='';try{saved=(localStorage.getItem('blis.language.v1')||'').toLowerCase()}catch(_){}
const lang=['bg','en','ru'].includes(requested)?requested:(['bg','en','ru'].includes(saved)?saved:'bg');
const homeLabel=lang==='ru'?'← На главную':lang==='en'?'← Back to home':'← Към началната страница';

/* The dynamic KUB map owns its own click-localization. Ignore mutations produced
   inside that map in generic MutationObservers so translated detail HTML cannot
   recursively trigger itself and freeze EN/RU navigation. */
if((lang==='en'||lang==='ru')&&!window.__KUB_SAFE_MUTATION_OBSERVER){
  window.__KUB_SAFE_MUTATION_OBSERVER=1;
  const NativeMO=window.MutationObserver;
  if(NativeMO){
    window.MutationObserver=function(cb){
      return new NativeMO(function(records,observer){
        const kept=records.filter(r=>{
          const t=r.target&&r.target.nodeType===1?r.target:r.target&&r.target.parentElement;
          return !(t&&t.closest&&t.closest('#attackmap'));
        });
        if(kept.length)cb(kept,observer);
      });
    };
    window.MutationObserver.prototype=NativeMO.prototype;
  }
}

function isPaymentsControl(text){
  const t=(text||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(!t)return false;
  return (t.includes('услуги')&&(t.includes('плащан')||t.includes('оплат')))||
         (t.includes('services')&&t.includes('payment'));
}

function installLanguageSwitch(){
  if(!document.body)return;
  if(!document.getElementById('kub-language-switch-style')){
    const st=document.createElement('style');
    st.id='kub-language-switch-style';
    st.textContent=`
      #kubLanguageSwitch{display:inline-flex;align-items:center;gap:3px;padding:3px;border:1px solid #d9e2e9;border-radius:10px;background:#fff;box-shadow:0 3px 10px rgba(50,76,96,.05)}
      #kubLanguageSwitch button{min-width:36px;border:0;border-radius:7px;padding:7px 8px;background:transparent;color:#657887;font-size:10px;font-weight:850;line-height:1;cursor:pointer;letter-spacing:.35px}
      #kubLanguageSwitch button:hover{background:#f2f6f9;color:#24384d}
      #kubLanguageSwitch button.active{background:#315b79;color:#fff;box-shadow:0 2px 7px rgba(49,91,121,.22)}
      #kubLanguageSwitch button:focus-visible{outline:2px solid #bd8733;outline-offset:2px}
      @media(max-width:700px){#kubLanguageSwitch{order:-1}#kubLanguageSwitch button{min-width:34px;padding:7px 6px}}
    `;
    document.head.appendChild(st);
  }
  const tools=document.querySelector('.tools');
  if(!tools)return;
  let box=document.getElementById('kubLanguageSwitch');
  if(!box){
    box=document.createElement('div');
    box.id='kubLanguageSwitch';
    box.setAttribute('role','group');
    box.setAttribute('aria-label','Language / Език / Язык');
    box.innerHTML='<button type="button" data-kub-lang="bg">BG</button><button type="button" data-kub-lang="en">EN</button><button type="button" data-kub-lang="ru">RU</button>';
    box.addEventListener('click',function(ev){
      const btn=ev.target.closest('button[data-kub-lang]');
      if(!btn)return;
      const next=btn.dataset.kubLang;
      if(!['bg','en','ru'].includes(next))return;
      try{localStorage.setItem('blis.language.v1',next)}catch(_){}
      const u=new URL(location.href);
      if(next==='bg')u.searchParams.delete('lang');else u.searchParams.set('lang',next);
      u.searchParams.delete('strict');
      const q=u.searchParams.toString();
      location.assign(u.pathname+(q?'?'+q:'')+u.hash);
    });
    tools.insertBefore(box,tools.firstChild);
  }
  box.querySelectorAll('button[data-kub-lang]').forEach(btn=>{
    const on=btn.dataset.kubLang===lang;
    btn.classList.toggle('active',on);
    btn.setAttribute('aria-pressed',on?'true':'false');
  });
}

function apply(){
  const a=document.querySelector('.sidefoot a');
  if(a){a.setAttribute('href','/kub-home.html?lang='+encodeURIComponent(lang));a.textContent=homeLabel}
  installLanguageSwitch();
  document.querySelectorAll('a,button,[role="button"],.btn').forEach(el=>{
    if(isPaymentsControl(el.textContent)){
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
      el.setAttribute('tabindex','-1');
    }
  });
}

const RES_EN={
'MEDIA RADAR · ТЕКУЩО СЪСТОЯНИЕ':'MEDIA RADAR · CURRENT STATUS','ТЕКУЩО СЪСТОЯНИЕ':'CURRENT STATUS','КРИЗИСНО НИВО':'CRISIS LEVEL','МЕДИЕН ОДИТ · БАЗА 24 МАТЕРИАЛА':'MEDIA AUDIT · BASE OF 24 ITEMS','ПОКРИТИЕ НА ПОЗИЦИЯТА · ЦЕЛ':'POSITION COVERAGE · TARGET','ДРУГИ ПРОЕКТИ':'OTHER PROJECTS','МЕЖДУНАРОДЕН ОБРАЗ':'INTERNATIONAL IMAGE','КРИТЕРИЙ':'CRITERION','ДИАГНОЗА':'DIAGNOSIS','ПОКАЗАТЕЛ':'INDICATOR','ЧЕСТОТА':'FREQUENCY','ЦЕЛ':'TARGET','ТЕМА':'TOPIC','КАКВО Е УСТАНОВЕНО ПУБЛИЧНО':'WHAT IS PUBLICLY ESTABLISHED','КАКВО ОЗНАЧАВА ЗА НАБЛЮДЕНИЕТО':'WHAT IT MEANS FOR MONITORING','кратък проверим отговор с документ или':'a concise verifiable response with a document or','еднакъв фактологичен стандарт независимо от':'the same factual standard regardless of',
'Режим: откриване → source → фактологичен статус → риск → значение за клиента.':'Mode: detection → source → factual status → risk → client impact.','Актуална работна база':'Current working base','обновено:':'updated:',
'Къде е текущият':'Where the current','Радарът':'The radar','Как да се чете':'How to read','Какво е ново':'What is new','Показват се':'Only shown are','Защо е важно':'Why it matters','Следят се':'We monitor','ПОСЛЕДНИ ПОТВЪРДЕНИ':'LATEST VERIFIED','ИЗТОЧНИК ↗':'SOURCE ↗','Корпорация КУБ търси':'KUB Corporation seeks','Конкуриращи се наративи':'Competing narratives','Карта на натиска':'Pressure map','Картата показва':'The map shows','СХОДЯЩ СЕ НАТИСК':'CONVERGENT PRESSURE','Мрежа: произход':'Network: origin','Натисни върху възел':'Click a node','Доказателствена граница':'Evidence boundary','Основен политически':'Primary political','ОСНОВЕН МОТИВ':'PRIMARY MOTIVE','ОСНОВНИ НАРАТИВИ':'MAIN NARRATIVES','Следващи тригери':'Next triggers','Кризисен риск-регистър':'Crisis risk register','Информационна нужда':'Information need','Какво следим:':'What we monitor:','Заповеди за премахване':'Removal orders','Хронология на кризата':'Crisis timeline','Нов съдебен етап':'New judicial stage','Кризисен ситуационен обзор':'Crisis situation overview','Какво реално се е променило':'What has actually changed','Кои теми нарастват':'Which topics are growing','Актуален статус по обект':'Current status by property','Източници и канали':'Sources and channels','Покритие: новини':'Coverage: news','Текущ цикъл на наблюдение':'Current monitoring cycle','Какво се класифицира':'What is classified','Граница на покритието':'Coverage boundary','Оперативен принцип':'Operating principle','Развитие / Доклади':'Development / Reports','Настройки на наблюдението':'Monitoring settings'
};
const RES_RU={
'MEDIA RADAR · ТЕКУЩО СЪСТОЯНИЕ':'МЕДИА-РАДАР · ТЕКУЩЕЕ СОСТОЯНИЕ','ТЕКУЩО СЪСТОЯНИЕ':'ТЕКУЩЕЕ СОСТОЯНИЕ','КРИЗИСНО НИВО':'УРОВЕНЬ КРИЗИСА','МЕДИЕН ОДИТ · БАЗА 24 МАТЕРИАЛА':'МЕДИА-АУДИТ · БАЗА 24 МАТЕРИАЛОВ','ПОКРИТИЕ НА ПОЗИЦИЯТА · ЦЕЛ':'ОХВАТ ПОЗИЦИИ · ЦЕЛЬ','ДРУГИ ПРОЕКТИ':'ДРУГИЕ ПРОЕКТЫ','МЕЖДУНАРОДЕН ОБРАЗ':'МЕЖДУНАРОДНЫЙ ОБРАЗ','КРИТЕРИЙ':'КРИТЕРИЙ','ДИАГНОЗА':'ДИАГНОЗ','ПОКАЗАТЕЛ':'ПОКАЗАТЕЛЬ','ЧЕСТОТА':'ЧАСТОТА','ЦЕЛ':'ЦЕЛЬ','ТЕМА':'ТЕМА','КАКВО Е УСТАНОВЕНО ПУБЛИЧНО':'ЧТО ПУБЛИЧНО УСТАНОВЛЕНО','КАКВО ОЗНАЧАВА ЗА НАБЛЮДЕНИЕТО':'ЧТО ЭТО ОЗНАЧАЕТ ДЛЯ МОНИТОРИНГА','кратък проверим отговор с документ или':'краткий проверяемый ответ с документом или','еднакъв фактологичен стандарт независимо от':'единый фактологический стандарт независимо от',
'Режим: откриване → source → фактологичен статус → риск → значение за клиента.':'Режим: выявление → источник → фактологический статус → риск → значение для клиента.','Актуална работна база':'Актуальная рабочая база','обновено:':'обновлено:',
'Къде е текущият':'Где сейчас','Радарът':'Радар','Как да се чете':'Как читать','Какво е ново':'Что нового','Показват се':'Показываются','Защо е важно':'Почему это важно','Следят се':'Отслеживаются','ПОСЛЕДНИ ПОТВЪРДЕНИ':'ПОСЛЕДНИЕ ПОДТВЕРЖДЁННЫЕ','ИЗТОЧНИК ↗':'ИСТОЧНИК ↗','Корпорация КУБ търси':'Корпорация КУБ ищет','Конкуриращи се наративи':'Конкурирующие нарративы','Карта на натиска':'Карта давления','Картата показва':'Карта показывает','СХОДЯЩ СЕ НАТИСК':'СХОДЯЩЕЕСЯ ДАВЛЕНИЕ','Мрежа: произход':'Сеть: источник','Натисни върху възел':'Нажмите на узел','Доказателствена граница':'Граница доказательности','Основен политически':'Основной политический','ОСНОВЕН МОТИВ':'ОСНОВНОЙ МОТИВ','ОСНОВНИ НАРАТИВИ':'ОСНОВНЫЕ НАРРАТИВЫ','Следващи тригери':'Следующие триггеры','Кризисен риск-регистър':'Реестр кризисных рисков','Информационна нужда':'Информационная потребность','Какво следим:':'Что отслеживаем:','Заповеди за премахване':'Распоряжения о сносе','Хронология на кризата':'Хронология кризиса','Нов съдебен етап':'Новый судебный этап','Кризисен ситуационен обзор':'Кризисный ситуационный обзор','Какво реално се е променило':'Что реально изменилось','Кои теми нарастват':'Какие темы растут','Актуален статус по обект':'Актуальный статус по объекту','Източници и канали':'Источники и каналы','Покритие: новини':'Охват: новости','Текущ цикъл на наблюдение':'Текущий цикл мониторинга','Какво се класифицира':'Что классифицируется','Граница на покритието':'Граница охвата','Оперативен принцип':'Операционный принцип','Развитие / Доклади':'Развитие / Отчёты','Настройки на наблюдението':'Настройки мониторинга'
};
const residues=lang==='en'?RES_EN:lang==='ru'?RES_RU:null;
function sanitize(){
  if(!residues||!document.body)return;
  const entries=Object.entries(residues).sort((a,b)=>b[0].length-a[0].length);
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){
    const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(p.tagName))continue;
    let v=n.nodeValue||'',x=v;
    for(const [from,to] of entries)if(x.includes(from))x=x.split(from).join(to);
    if(x!==v)n.nodeValue=x;
  }
}
function boot(){apply();sanitize();setTimeout(()=>{apply();sanitize()},180);setTimeout(()=>{apply();sanitize()},700);setTimeout(()=>{apply();sanitize()},1600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
if(residues){document.addEventListener('click',()=>{setTimeout(sanitize,60);setTimeout(sanitize,420)},true);setInterval(()=>{apply();sanitize()},1200)}else setInterval(apply,1800);
})();

/* BLIS Navigator — synchronous EN render-localization for canonical visual owners.
   Reputation/Risks are owned by VisualSpecialV2; History/Reports by VisualSuiteV1.
   The original renderer runs and is localized in the same call stack, before browser paint. */
(function(){
'use strict';
if(window.__BLIS_VISUAL_OWNERS_EN_NATIVE_V1)return;window.__BLIS_VISUAL_OWNERS_EN_NATIVE_V1=true;
const CYR=/[А-Яа-яЁёЀ-ӿ]/;
const isEN=()=>{
  if(String(window.BLIS_LANGUAGE||'').toLowerCase()==='en')return true;
  if(String(document.documentElement.lang||'').toLowerCase().startsWith('en'))return true;
  try{return localStorage.getItem('blis.language.v1')==='en'}catch(_){return false}
};
const tr=s=>{
  s=String(s??'');
  if(!CYR.test(s))return s;
  try{const x=window.BLISI18N?.t?.(s);if(x&&x!==s)return x}catch(_){ }
  return s;
};
const set=(el,text)=>{if(el)el.textContent=text};
const host=id=>document.getElementById(id+'Body')||document.getElementById(id);
const replaceText=(root,map)=>{
  if(!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.parentElement&& !/SCRIPT|STYLE|NOSCRIPT|TEMPLATE/.test(n.parentElement.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  while(w.nextNode()){
    const n=w.currentNode,raw=n.nodeValue||'',trim=raw.trim();if(!trim)continue;
    let out=map[trim];if(out==null&&CYR.test(trim))out=tr(trim);
    if(out!=null&&out!==trim)n.nodeValue=raw.replace(trim,out);
  }
};
const common={
  'Ключова визуализация':'Key visualization','Интерактивно':'Interactive','Отговорът накратко':'Short answer',
  'Изберете светеща точка за контекст.':'Select a glowing point for context.',
  'Няма нов потвърден елемент.':'No new confirmed item.'
};
function localizeRep(){
  const h=host('reputation');if(!h||!isEN())return;
  const map={...common,
    'Репутация':'Reputation','Репутационен пулс':'Reputation pulse',
    'Няма достатъчно база за надеждна репутационна оценка.':'There is not enough data for a reliable reputation assessment.',
    'Репутационното състояние е силно.':'Reputation is strong.',
    'Репутационното състояние е стабилно, но има фактори за наблюдение.':'Reputation is stable, with factors that still require monitoring.',
    'Репутационното състояние изисква внимание.':'Reputation requires attention.',
    'Отлична':'Excellent','Добра':'Good','Неутрална':'Neutral','Крехка':'Fragile','Рискова':'At risk',
    'Текущ индекс':'Current index','Промяна':'Change','Положителен тон':'Positive tone','Положителни теми':'Positive themes','Рискови теми':'Risk themes',
    'Изберете събитие под кривата за контекст.':'Select an event below the curve for context.',
    'Няма нов репутационен сигнал над прага.':'No new reputation signal above the threshold.',
    'Показани са само значими репутационни промени.':'Only significant reputation changes are shown.',
    'Няма нови значими репутационни сигнали.':'No new significant reputation signals.',
    'по-рано':'earlier','текущо':'current'
  };
  replaceText(h,map);
  h.querySelectorAll('.sv2-head em,.vs-period').forEach(x=>{const m=(x.textContent||'').match(/\d+/);if(m)set(x,`${m[0]} days`)});
  h.querySelectorAll('[data-sv2-rep]').forEach(x=>{const v=x.getAttribute('data-sv2-rep')||'';x.setAttribute('data-sv2-rep',tr(v))});
  h.querySelectorAll('.sv2-repevent').forEach(x=>replaceText(x,{}));
}
function localizeRisk(){
  const h=host('opportunities');if(!h||!isEN())return;
  const map={...common,
    'Риск и възможности':'Risks & Opportunities','Карта за стратегически решения':'Decision map','Карта на стратегическите решения':'Decision map',
    'Има потвърдени рискови теми; най-важните са отделени от възможностите и наблюдението.':'There are confirmed risk themes; the most important are separated from opportunities and monitoring items.',
    'Няма водещ потвърден риск; има възможности за проследяване.':'There is no leading confirmed risk; there are opportunities to track.',
    'Няма нов риск или възможност над прага.':'There is no new risk or opportunity above the threshold.',
    'Няма нов риск или възможност над прага за значимост.':'There is no new risk or opportunity above the significance threshold.',
    'Възможности':'Opportunities','Стратегически приоритети':'Strategic priorities','Нисък приоритет':'Low priority','Рискове':'Risks',
    'Приоритети':'Priorities','Общо':'Total','Общо елементи':'Total items',
    'по-малко доказателства':'less evidence','повече доказателства':'more evidence','по-ниска значимост':'lower significance','по-висока значимост':'higher significance'
  };
  replaceText(h,map);
  h.querySelectorAll('.sv2-head em,.vs-period').forEach(x=>{const m=(x.textContent||'').match(/\d+/);if(m)set(x,`${m[0]} days`)});
  h.querySelectorAll('[data-sv2-risk],[data-m-tip],[data-router-risk]').forEach(x=>{
    for(const a of ['data-sv2-risk','data-m-tip','data-router-risk']){const v=x.getAttribute(a);if(!v)continue;let z=tr(v).replace(/(\d+)\s+доказателства/g,'$1 evidence');x.setAttribute(a,z)}
  });
}
function monthEN(t){
  const m={'ян':'Jan','яну':'Jan','фев':'Feb','мар':'Mar','апр':'Apr','май':'May','юни':'Jun','юли':'Jul','авг':'Aug','сеп':'Sep','окт':'Oct','ное':'Nov','дек':'Dec','ДНЕС':'TODAY'};
  const s=String(t||'').trim();return m[s]||tr(s);
}
function localizeHistory(){
  const h=host('history');if(!h||!isEN())return;
  const map={...common,
    'История':'History','Хронология на ключови събития':'Timeline of key events',
    'Историята показва само повратните точки и значимите събития, които обясняват текущото състояние.':'The history shows only turning points and significant events that explain the current state.',
    'Няма достатъчно значими събития за причинна хронология.':'There are not enough significant events for a causal timeline.',
    'Историята се натрупва':'History is building','Изберете събитие за кратък контекст.':'Select an event for brief context.',
    'Първата значима промяна ще се появи тук автоматично.':'The first significant change will appear here automatically.'
  };
  replaceText(h,map);
  h.querySelectorAll('.vs-vhead em').forEach(x=>{const m=(x.textContent||'').match(/\d+/);if(m)set(x,`${m[0]} events`)});
  h.querySelectorAll('.vs-hevent time').forEach(x=>set(x,monthEN(x.textContent)));
  h.querySelectorAll('[data-h-tip]').forEach(x=>{const v=x.getAttribute('data-h-tip')||'';x.setAttribute('data-h-tip',tr(v));replaceText(x,{})});
}
const reportLabel={overview:'Overview',social:'Important Signals',market:'Market & Sentiment',digital:'Digital Visibility',reputation:'Reputation',competition:'Competition',opportunities:'Risks & Opportunities',history:'History'};
function localizeReports(){
  const h=host('reports');if(!h||!isEN())return;
  const map={...common,
    'Доклади':'Reports','Покритие и статус на доклади':'Report coverage and status','Покритие на аналитичния пакет':'Analytical package coverage',
    'Докладите използват реалното аналитично покритие на текущия клиент и наличните публикувани файлове.':'Reports use the current client’s real analytical coverage and available published files.',
    'Общо покритие':'Total coverage','Добро':'Good','Частично':'Partial','Недостатъчно':'Insufficient',
    'Общ преглед':'Overview','Важни сигнали':'Important Signals','Пазар и нагласи':'Market & Sentiment','Дигитална видимост':'Digital Visibility',
    'Репутация':'Reputation','Конкуренция':'Competition','Риск и възможности':'Risks & Opportunities','История':'History',
    'Изберете сегмент за контекст. Експортът използва реалния API.':'Select a segment for context. Export uses the real API.',
    'Реална библиотека':'Live library','Публикувани доклади и експорти':'Published reports and exports',
    'Само файлове и записи, които действително съществуват за текущия клиент.':'Only files and records that actually exist for the current client.',
    'Доклади':'Reports','Последни експорти':'Recent exports',
    'Няма публикуван доклад в API за текущия профил. Navigator не създава фиктивни файлове.':'There is no published report in the API for the current profile. Navigator does not create fictitious files.',
    'Все още няма генерирани експорти за този профил.':'No exports have been generated for this profile yet.',
    'Текущ период':'Current period','публикуван':'published','Експорт':'Export'
  };
  replaceText(h,map);
  h.querySelectorAll('[data-ritem],[data-rseg]').forEach(x=>{
    const key=x.getAttribute('data-ritem')||x.getAttribute('data-rseg');
    const label=x.querySelector('span');if(label&&reportLabel[key])set(label,reportLabel[key]);
  });
  const note=h.querySelector('[data-r-note]');if(note&&CYR.test(note.textContent||'')){
    const m=(note.textContent||'').match(/^(.*?)\s*·\s*аналитично покритие\s*(\d+)%\.?$/i);if(m)set(note,`${tr(m[1])} · analytical coverage ${m[2]}%.`)
  }
  h.querySelectorAll('[data-exec-library]').forEach(x=>replaceText(x,map));
  h.querySelectorAll('.exec-library-head em').forEach(x=>{const m=(x.textContent||'').match(/\d+/);if(m)set(x,`${m[0]} published`)});
}
function patchSpecial(){
  const s=window.BLISVisualSpecialV2;if(!s||typeof s.render!=='function'||s.__enNativeOwnersV1)return false;
  s.__enNativeOwnersV1=true;const orig=s.render.bind(s);
  s.render=function(id){const r=orig(id);if(isEN()){if(id==='reputation')localizeRep();else if(id==='opportunities')localizeRisk()}return r};
  return true;
}
function patchSuite(){
  const s=window.BLISVisualSuiteV1;if(!s||typeof s.render!=='function'||s.__enNativeOwnersV1)return false;
  s.__enNativeOwnersV1=true;const orig=s.render.bind(s);
  s.render=function(id){const r=orig(id);if(isEN()){if(id==='history')localizeHistory();else if(id==='reports')localizeReports()}return r};
  return true;
}
function patchReportsEnhancer(){
  const r=window.BLISExecutiveReportsV1;if(!r||typeof r.enhance!=='function'||r.__enNativeOwnersV1)return false;
  r.__enNativeOwnersV1=true;const orig=r.enhance.bind(r);
  r.enhance=async function(){const out=await orig(...arguments);if(isEN())localizeReports();return out};
  if(typeof r.refresh==='function')r.refresh=()=>r.enhance(true);
  return true;
}
function localizeActive(){if(!isEN())return;const id=document.querySelector('.page.active')?.id;if(id==='reputation')localizeRep();else if(id==='opportunities')localizeRisk();else if(id==='history')localizeHistory();else if(id==='reports')localizeReports()}
let tries=0;const timer=setInterval(()=>{tries++;const a=patchSpecial(),b=patchSuite();patchReportsEnhancer();if((a||window.BLISVisualSpecialV2?.__enNativeOwnersV1)&&(b||window.BLISVisualSuiteV1?.__enNativeOwnersV1)&&tries>10)clearInterval(timer)},25);
for(const ev of ['blis:routechange','blis:clientdata','blis:periodchange','blis:rendered'])window.addEventListener(ev,()=>{requestAnimationFrame(localizeActive);setTimeout(localizeActive,120);setTimeout(localizeActive,450)});
document.addEventListener('click',e=>{
  if(!isEN())return;
  if(e.target.closest?.('[data-h-tip],[data-ritem],[data-rseg],[data-sv2-rep],[data-sv2-risk],[data-m-tip]'))setTimeout(localizeActive,0);
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{patchSpecial();patchSuite();patchReportsEnhancer();localizeActive()},{once:true});else{patchSpecial();patchSuite();patchReportsEnhancer();localizeActive()}
})();

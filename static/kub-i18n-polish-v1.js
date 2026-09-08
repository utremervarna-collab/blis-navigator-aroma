/* KUB EN/RU final localization polish. Idempotent, dynamic-content safe. */
(function(){
'use strict';
if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;
const q=new URLSearchParams(location.search);
let saved='';try{saved=(localStorage.getItem('blis.language.v1')||'').toLowerCase()}catch(_){}
const req=(q.get('lang')||'').toLowerCase();
const lang=['bg','en','ru'].includes(req)?req:(['bg','en','ru'].includes(saved)?saved:'bg');
if(lang==='bg')return;
window.__KUB_I18N_POLISH=lang;

const EN={
'MEDIA RADAR · ТЕКУЩО СЪСТОЯНИЕ':'MEDIA RADAR · CURRENT STATUS','ТЕКУЩО СЪСТОЯНИЕ':'CURRENT STATUS','КРИЗИСНО НИВО':'CRISIS LEVEL','МЕДИЕН ОДИТ · БАЗА 24 МАТЕРИАЛА':'MEDIA AUDIT · BASE OF 24 ITEMS','ПОКРИТИЕ НА ПОЗИЦИЯТА · ЦЕЛ':'POSITION COVERAGE · TARGET',
'ДРУГИ ПРОЕКТИ':'OTHER PROJECTS','МЕЖДУНАРОДЕН ОБРАЗ':'INTERNATIONAL IMAGE','КРИТЕРИЙ':'CRITERION','ДИАГНОЗА':'DIAGNOSIS','ПОКАЗАТЕЛ':'INDICATOR','ЧЕСТОТА':'FREQUENCY','ЦЕЛ':'TARGET','ТЕМА':'TOPIC','КАКВО Е УСТАНОВЕНО ПУБЛИЧНО':'WHAT IS PUBLICLY ESTABLISHED','КАКВО ОЗНАЧАВА ЗА НАБЛЮДЕНИЕТО':'WHAT IT MEANS FOR MONITORING',
'реални оплаквания, прекъсване на услуги, договорни рискове и публични свидетелства.':'real complaints, service interruptions, contractual risks and public testimonies.',
'нови заповеди, изпълнителни действия, ограничения на достъпа и официални позиции.':'new orders, enforcement actions, access restrictions and official positions.',
'процесуални действия, проверки, официални съобщения и нови производства.':'procedural actions, inspections, official statements and new proceedings.',
'нови факти, заглавни рамки, разпространение и присъствие/липса на позицията на КУБ.':'new facts, headline frames, distribution and presence/absence of KUB’s position.',
'нови факти, заглавни рамки, разпространение и присъствие/липса на позицията на KUB.':'new facts, headline frames, distribution and presence/absence of KUB’s position.',
'доказуемо преливане на риска към други проекти, договорни отношения или финансиране.':'demonstrable risk spillover to other projects, contractual relations or financing.',
'вътрешни противоречия, публични изказвания и оперативни промени.':'internal inconsistencies, public statements and operational changes.',
'достъп, инфраструктура, публични сигнали, организирани действия и локални медийни теми.':'access, infrastructure, public signals, organized actions and local media topics.',
'нови декларации, парламентарни въпроси и твърдения, които усилват националната видимост на казуса.':'new declarations, parliamentary questions and claims that increase the case’s national visibility.',
'и нова медийна вълна':'and a new media wave','днес':'today',
'26–29 май':'26–29 May','19–23 юни':'19–23 June','5–17 август':'5–17 August','25–28 август':'25–28 August','26-29 май':'26–29 May','19-23 юни':'19–23 June','5-17 авг.':'5–17 Aug','25-28 авг.':'25–28 Aug',
'до 24 ч.':'within 24 h','под заповед/дело':'under order/case','60 мин / 1 работен ден':'60 min / 1 business day',
'Информационна нужда:':'Information need:','Какво следим:':'What we monitor:','Покритие: новини':'Coverage: news','Покритие:':'Coverage:','Оперативен принцип:':'Operating principle:',
'индивидуална, проверима информация и ясен канал за актуализации.':'individual, verifiable information and a clear update channel.',
'документална проследимост по конкретен обект и формален комуникационен канал.':'documentary traceability for the specific property and a formal communication channel.',
'единна доказателствена база и ясно разграничаване между факт, твърдение и висяща процедура.':'a single evidence base and a clear distinction between fact, claim and pending procedure.',
'кратък проверим отговор с документ или компетентен източник.':'a concise verifiable response backed by a document or competent source.',
'фактологичен статус, план за ограничаване на риска и доказуема проследимост.':'factual status, a risk-limitation plan and demonstrable traceability.',
'единен вътрешен протокол и актуална фактическа версия.':'a single internal protocol and an up-to-date factual version.',
'проверими данни и конкретни отговори по засегнатите въпроси.':'verifiable data and specific answers to the affected issues.',
'еднакъв фактологичен стандарт независимо от политическия източник.':'the same factual standard regardless of the political source.',
'новини и публично индексирано web съдържание се събират автоматично.':'news and publicly indexed web content are collected automatically.',
'Закрити групи, непублични профили и съдържание, което не се индексира от търсачки, не се представят като пълно покритие без директен API или лицензиран доставчик.':'Closed groups, non-public profiles and content not indexed by search engines are not presented as complete coverage without a direct API or licensed provider.',
'Navigator не показва технически health-метрики на клиента.':'Navigator does not show technical health metrics to the client.',
'Показва новите факти, техния източник, значението им за казуса и дали наблюдението е актуално.':'It shows new facts, their source, their significance for the case and whether monitoring is current.',
'КУБ Корпорация':'KUB Corporation','Корпорация КУБ':'KUB Corporation','Форест Клуб Варна ООД':'Forest Club Varna Ltd','Венедикт 02 ЕООД':'Venedikt 02 Ltd','Форест Клуб':'Forest Club','Баба Алино':'Baba Alino','Олег Невзоров':'Oleg Nevzorov','Адм. съд – Варна':'Administrative Court – Varna','Народно събрание':'National Assembly','Прокуратура':'Prosecution','Адв. Михаил Томов':'Attorney Mihail Tomov','Радио Варна':'Radio Varna','Нова Варна':'Nova Varna','Труд news':'Trud News','Евроком':'Eurocom','Таралеж':'Taralezh','БНТ':'BNT','БТА':'BTA','БНР':'BNR'
};
const RU={
'MEDIA RADAR · ТЕКУЩО СЪСТОЯНИЕ':'МЕДИА-РАДАР · ТЕКУЩЕЕ СОСТОЯНИЕ','ТЕКУЩО СЪСТОЯНИЕ':'ТЕКУЩЕЕ СОСТОЯНИЕ','КРИЗИСНО НИВО':'УРОВЕНЬ КРИЗИСА','МЕДИЕН ОДИТ · БАЗА 24 МАТЕРИАЛА':'МЕДИА-АУДИТ · БАЗА 24 МАТЕРИАЛОВ','ПОКРИТИЕ НА ПОЗИЦИЯТА · ЦЕЛ':'ОХВАТ ПОЗИЦИИ · ЦЕЛЬ',
'ДРУГИ ПРОЕКТИ':'ДРУГИЕ ПРОЕКТЫ','МЕЖДУНАРОДЕН ОБРАЗ':'МЕЖДУНАРОДНЫЙ ОБРАЗ','КРИТЕРИЙ':'КРИТЕРИЙ','ДИАГНОЗА':'ДИАГНОЗ','ПОКАЗАТЕЛ':'ПОКАЗАТЕЛЬ','ЧЕСТОТА':'ЧАСТОТА','ЦЕЛ':'ЦЕЛЬ','ТЕМА':'ТЕМА','КАКВО Е УСТАНОВЕНО ПУБЛИЧНО':'ЧТО ПУБЛИЧНО УСТАНОВЛЕНО','КАКВО ОЗНАЧАВА ЗА НАБЛЮДЕНИЕТО':'ЧТО ЭТО ОЗНАЧАЕТ ДЛЯ МОНИТОРИНГА',
'реални оплаквания, прекъсване на услуги, договорни рискове и публични свидетелства.':'реальные жалобы, перебои услуг, договорные риски и публичные свидетельства.',
'нови заповеди, изпълнителни действия, ограничения на достъпа и официални позиции.':'новые распоряжения, исполнительные действия, ограничения доступа и официальные позиции.',
'процесуални действия, проверки, официални съобщения и нови производства.':'процессуальные действия, проверки, официальные сообщения и новые производства.',
'нови факти, заглавни рамки, разпространение и присъствие/липса на позицията на КУБ.':'новые факты, заголовочные рамки, распространение и присутствие/отсутствие позиции КУБ.',
'нови факти, заглавни рамки, разпространение и присъствие/липса на позицията на KUB.':'новые факты, заголовочные рамки, распространение и присутствие/отсутствие позиции КУБ.',
'доказуемо преливане на риска към други проекти, договорни отношения или финансиране.':'доказуемое распространение риска на другие проекты, договорные отношения или финансирование.',
'вътрешни противоречия, публични изказвания и оперативни промени.':'внутренние противоречия, публичные заявления и операционные изменения.',
'достъп, инфраструктура, публични сигнали, организирани действия и локални медийни теми.':'доступ, инфраструктура, публичные сигналы, организованные действия и локальные медийные темы.',
'нови декларации, парламентарни въпроси и твърдения, които усилват националната видимост на казуса.':'новые заявления, парламентские вопросы и утверждения, усиливающие национальную видимость кейса.',
'и нова медийна вълна':'и новая медийная волна','днес':'сегодня',
'26–29 май':'26–29 мая','19–23 юни':'19–23 июня','5–17 август':'5–17 августа','25–28 август':'25–28 августа','26-29 май':'26–29 мая','19-23 юни':'19–23 июня','5-17 авг.':'5–17 авг.','25-28 авг.':'25–28 авг.',
'до 24 ч.':'в течение 24 ч.','под заповед/дело':'по распоряжению/делу','60 мин / 1 работен ден':'60 мин / 1 рабочий день',
'Информационна нужда:':'Информационная потребность:','Какво следим:':'Что отслеживаем:','Покритие: новини':'Охват: новости','Покритие:':'Охват:','Оперативен принцип:':'Операционный принцип:',
'индивидуална, проверима информация и ясен канал за актуализации.':'индивидуальная, проверяемая информация и понятный канал обновлений.','документална проследимост по конкретен обект и формален комуникационен канал.':'документальная прослеживаемость по конкретному объекту и формальный коммуникационный канал.','единна доказателствена база и ясно разграничаване между факт, твърдение и висяща процедура.':'единая доказательная база и чёткое разграничение между фактом, утверждением и незавершённой процедурой.','кратък проверим отговор с документ или компетентен източник.':'краткий проверяемый ответ с документом или компетентным источником.','фактологичен статус, план за ограничаване на риска и доказуема проследимост.':'фактологический статус, план ограничения риска и доказуемая прослеживаемость.','единен вътрешен протокол и актуална фактическа версия.':'единый внутренний протокол и актуальная фактическая версия.','проверими данни и конкретни отговори по засегнатите въпроси.':'проверяемые данные и конкретные ответы по затронутым вопросам.','еднакъв фактологичен стандарт независимо от политическия източник.':'единый фактологический стандарт независимо от политического источника.',
'новини и публично индексирано web съдържание се събират автоматично.':'новости и публично индексируемый web-контент собираются автоматически.','Закрити групи, непублични профили и съдържание, което не се индексира от търсачки, не се представят като пълно покритие без директен API или лицензиран доставчик.':'Закрытые группы, непубличные профили и контент, не индексируемый поисковыми системами, не представляются как полный охват без прямого API или лицензированного поставщика.','Navigator не показва технически health-метрики на клиента.':'Navigator не показывает клиенту технические health-метрики.','Показва новите факти, техния източник, значението им за казуса и дали наблюдението е актуално.':'Он показывает новые факты, их источник, значение для кейса и актуальность мониторинга.'
};
const D=lang==='en'?EN:RU;
const K=Object.keys(D).sort((a,b)=>b.length-a.length);
function tr(v){let x=String(v||'');for(const k of K)if(x.includes(k))x=x.split(k).join(D[k]);return x}
let writing=false;
function apply(root){
 if(writing||!root)return;writing=true;
 try{
  if(root.nodeType===3){const x=tr(root.nodeValue);if(x!==root.nodeValue)root.nodeValue=x;return}
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;return p&&!/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(p.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),nodes=[];
  while(w.nextNode())nodes.push(w.currentNode);
  for(const n of nodes){const x=tr(n.nodeValue);if(x!==n.nodeValue)n.nodeValue=x}
  if(root.querySelectorAll)root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(e=>['aria-label','title','placeholder'].forEach(a=>{const v=e.getAttribute(a);if(v){const x=tr(v);if(x!==v)e.setAttribute(a,x)}}));
 }finally{writing=false}
}
function run(){apply(document.body)}
function boot(){
 run();[80,250,600,1200,2200,3500].forEach(ms=>setTimeout(run,ms));
 document.addEventListener('click',()=>{[20,120,350,800].forEach(ms=>setTimeout(run,ms))},true);
 let ticks=0;const timer=setInterval(()=>{run();if(++ticks>=60)clearInterval(timer)},500);
 const mo=new MutationObserver(records=>{if(writing)return;let needed=false;for(const m of records){if(m.type==='characterData'){const v=m.target.nodeValue||'';if(K.some(k=>v.includes(k))){needed=true;break}}else if(m.addedNodes&&m.addedNodes.length){needed=true;break}}if(needed)setTimeout(run,20)});
 mo.observe(document.body,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

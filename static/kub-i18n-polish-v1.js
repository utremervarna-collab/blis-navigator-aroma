/* Final KUB-only EN/RU localization polish for split and dynamically re-rendered text nodes. */
(function(){
'use strict';
if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;
const qs=new URLSearchParams(location.search);
const requested=(qs.get('lang')||'').toLowerCase();
let saved='';try{saved=(localStorage.getItem('blis.language.v1')||'').toLowerCase()}catch(_){ }
const lang=['bg','en','ru'].includes(requested)?requested:(['bg','en','ru'].includes(saved)?saved:'bg');
if(lang==='bg')return;
window.__KUB_I18N_POLISH=lang;

const EN={
'MEDIA RADAR · ТЕКУЩО СЪСТОЯНИЕ':'MEDIA RADAR · CURRENT STATUS',
'КРИЗИСНО НИВО':'CRISIS LEVEL',
'МЕДИЕН ОДИТ · БАЗА 24 МАТЕРИАЛА':'MEDIA AUDIT · BASE OF 24 ITEMS',
'ПОКРИТИЕ НА ПОЗИЦИЯТА · ЦЕЛ':'POSITION COVERAGE · TARGET',
'ДРУГИ ПРОЕКТИ':'OTHER PROJECTS','МЕЖДУНАРОДЕН ОБРАЗ':'INTERNATIONAL IMAGE',
'КРИТЕРИЙ':'CRITERION','ДИАГНОЗА':'DIAGNOSIS','ПОКАЗАТЕЛ':'INDICATOR','ЧЕСТОТА':'FREQUENCY','ЦЕЛ':'TARGET',
'ТЕМА':'TOPIC','КАКВО Е УСТАНОВЕНО ПУБЛИЧНО':'WHAT IS PUBLICLY ESTABLISHED','КАКВО ОЗНАЧАВА ЗА НАБЛЮДЕНИЕТО':'WHAT IT MEANS FOR MONITORING',
'26–29 май':'26–29 May','19–23 юни':'19–23 June','5–17 август':'5–17 August','25–28 август':'25–28 August',
'26-29 май':'26–29 May','19-23 юни':'19–23 June','5-17 авг.':'5–17 August','25-28 авг.':'25–28 August',
'до 24 ч.':'within 24 h','под заповед/дело':'under order/case','60 мин / 1 работен ден':'60 min / 1 business day',
'Информационна нужда: индивидуална, проверима информация и ясен канал за актуализации.':'Information need: individual, verifiable information and a clear update channel.',
'Информационна нужда: документална проследимост по конкретен обект и формален комуникационен канал.':'Information need: documentary traceability for the specific property and a formal communication channel.',
'Информационна нужда: единна доказателствена база и ясно разграничаване между факт, твърдение и висяща процедура.':'Information need: a single evidence base and a clear distinction between fact, claim and pending procedure.',
'Информационна нужда: кратък проверим отговор с документ или компетентен източник.':'Information need: a concise verifiable response backed by a document or competent source.',
'Информационна нужда: фактологичен статус, план за ограничаване на риска и доказуема проследимост.':'Information need: factual status, a risk-limitation plan and demonstrable traceability.',
'Информационна нужда: единен вътрешен протокол и актуална фактическа версия.':'Information need: a single internal protocol and an up-to-date factual version.',
'Информационна нужда: проверими данни и конкретни отговори по засегнатите въпроси.':'Information need: verifiable data and specific answers to the affected issues.',
'Информационна нужда: еднакъв фактологичен стандарт независимо от политическия източник.':'Information need: the same factual standard regardless of the political source.',
'Информационна нужда:':'Information need:',
'индивидуална, проверима информация и ясен канал за актуализации.':'individual, verifiable information and a clear update channel.',
'документална проследимост по конкретен обект и формален комуникационен канал.':'documentary traceability for the specific property and a formal communication channel.',
'единна доказателствена база и ясно разграничаване между факт, твърдение и висяща процедура.':'a single evidence base and a clear distinction between fact, claim and pending procedure.',
'кратък проверим отговор с документ или компетентен източник.':'a concise verifiable response backed by a document or competent source.',
'фактологичен статус, план за ограничаване на риска и доказуема проследимост.':'factual status, a risk-limitation plan and demonstrable traceability.',
'единен вътрешен протокол и актуална фактическа версия.':'a single internal protocol and an up-to-date factual version.',
'проверими данни и конкретни отговори по засегнатите въпроси.':'verifiable data and specific answers to the affected issues.',
'еднакъв фактологичен стандарт независимо от политическия източник.':'the same factual standard regardless of the political source.',
'компетентен source':'competent source','politicalя source':'political source',
'Покритие: новини и публично индексирано web съдържание се събират автоматично. Закрити групи, непублични профили и съдържание, което не се индексира от търсачки, не се представят като пълно покритие без директен API или лицензиран доставчик.':'Coverage: news and publicly indexed web content are collected automatically. Closed groups, non-public profiles and content not indexed by search engines are not presented as complete coverage without a direct API or licensed provider.',
'Оперативен принцип: Navigator не показва технически health-метрики на клиента. Показва новите факти, техния източник, значението им за казуса и дали наблюдението е актуално.':'Operating principle: Navigator does not show technical health metrics to the client. It shows new facts, their source, their significance for the case and whether monitoring is current.',
'Оперативен принцип: Navigator не показва технически health-метрики на клиента. Показва новите факти, техния source, значението им за казуса и дали наблюдението е актуално.':'Operating principle: Navigator does not show technical health metrics to the client. It shows new facts, their source, their significance for the case and whether monitoring is current.',
'при всеки нов материал Navigator трябва да записва:':'for every new item Navigator must record:',
'КУБ Корпорация':'KUB Corporation','Корпорация КУБ':'KUB Corporation','Форест Клуб Варна ООД':'Forest Club Varna Ltd','Венедикт 02 ЕООД':'Venedikt 02 Ltd','Форест Клуб':'Forest Club','Баба Алино':'Baba Alino','Олег Невзоров':'Oleg Nevzorov',
'Адм. съд – Варна':'Administrative Court – Varna','Народно събрание':'National Assembly','Прокуратура':'Prosecution','Адв. Михаил Томов':'Attorney Mihail Tomov',
'Радио Варна':'Radio Varna','Нова Варна':'Nova Varna','Труд news':'Trud News','Евроком':'Eurocom','Таралеж':'Taralezh','БНТ':'BNT','БТА':'BTA','БНР':'BNR','Портних':'Portnih',
'КУБ':'KUB'
};

const RU={
'MEDIA RADAR · ТЕКУЩО СЪСТОЯНИЕ':'МЕДИА-РАДАР · ТЕКУЩЕЕ СОСТОЯНИЕ',
'КРИЗИСНО НИВО':'УРОВЕНЬ КРИЗИСА','МЕДИЕН ОДИТ · БАЗА 24 МАТЕРИАЛА':'МЕДИА-АУДИТ · БАЗА 24 МАТЕРИАЛОВ','ПОКРИТИЕ НА ПОЗИЦИЯТА · ЦЕЛ':'ОХВАТ ПОЗИЦИИ · ЦЕЛЬ',
'ДРУГИ ПРОЕКТИ':'ДРУГИЕ ПРОЕКТЫ','МЕЖДУНАРОДЕН ОБРАЗ':'МЕЖДУНАРОДНЫЙ ОБРАЗ','КРИТЕРИЙ':'КРИТЕРИЙ','ДИАГНОЗА':'ДИАГНОЗ','ПОКАЗАТЕЛ':'ПОКАЗАТЕЛЬ','ЧЕСТОТА':'ЧАСТОТА','ЦЕЛ':'ЦЕЛЬ',
'ТЕМА':'ТЕМА','КАКВО Е УСТАНОВЕНО ПУБЛИЧНО':'ЧТО ПУБЛИЧНО УСТАНОВЛЕНО','КАКВО ОЗНАЧАВА ЗА НАБЛЮДЕНИЕТО':'ЧТО ЭТО ОЗНАЧАЕТ ДЛЯ МОНИТОРИНГА',
'26–29 май':'26–29 мая','19–23 юни':'19–23 июня','5–17 август':'5–17 августа','25–28 август':'25–28 августа','26-29 май':'26–29 мая','19-23 юни':'19–23 июня','5-17 авг.':'5–17 августа','25-28 авг.':'25–28 августа',
'до 24 ч.':'в течение 24 ч.','под заповед/дело':'по распоряжению/делу','60 мин / 1 работен ден':'60 мин / 1 рабочий день',
'Информационна нужда: индивидуална, проверима информация и ясен канал за актуализации.':'Информационная потребность: индивидуальная, проверяемая информация и понятный канал обновлений.',
'Информационна нужда: документална проследимост по конкретен обект и формален комуникационен канал.':'Информационная потребность: документальная прослеживаемость по конкретному объекту и формальный коммуникационный канал.',
'Информационна нужда: единна доказателствена база и ясно разграничаване между факт, твърдение и висяща процедура.':'Информационная потребность: единая доказательная база и чёткое разграничение между фактом, утверждением и незавершённой процедурой.',
'Информационна нужда: кратък проверим отговор с документ или компетентен източник.':'Информационная потребность: краткий проверяемый ответ с документом или компетентным источником.',
'Информационна нужда: фактологичен статус, план за ограничаване на риска и доказуема проследимост.':'Информационная потребность: фактологический статус, план ограничения риска и доказуемая прослеживаемость.',
'Информационна нужда: единен вътрешен протокол и актуална фактическа версия.':'Информационная потребность: единый внутренний протокол и актуальная фактическая версия.',
'Информационна нужда: проверими данни и конкретни отговори по засегнатите въпроси.':'Информационная потребность: проверяемые данные и конкретные ответы по затронутым вопросам.',
'Информационна нужда: еднакъв фактологичен стандарт независимо от политическия източник.':'Информационная потребность: единый фактологический стандарт независимо от политического источника.',
'Информационна нужда:':'Информационная потребность:',
'индивидуална, проверима информация и ясен канал за актуализации.':'индивидуальная, проверяемая информация и понятный канал обновлений.','документална проследимост по конкретен обект и формален комуникационен канал.':'документальная прослеживаемость по конкретному объекту и формальный коммуникационный канал.','единна доказателствена база и ясно разграничаване между факт, твърдение и висяща процедура.':'единая доказательная база и чёткое разграничение между фактом, утверждением и незавершённой процедурой.','кратък проверим отговор с документ или компетентен източник.':'краткий проверяемый ответ с документом или компетентным источником.','фактологичен статус, план за ограничаване на риска и доказуема проследимост.':'фактологический статус, план ограничения риска и доказуемая прослеживаемость.','единен вътрешен протокол и актуална фактическа версия.':'единый внутренний протокол и актуальная фактическая версия.','проверими данни и конкретни отговори по засегнатите въпроси.':'проверяемые данные и конкретные ответы по затронутым вопросам.','еднакъв фактологичен стандарт независимо от политическия източник.':'единый фактологический стандарт независимо от политического источника.',
'Покритие: новини и публично индексирано web съдържание се събират автоматично. Закрити групи, непублични профили и съдържание, което не се индексира от търсачки, не се представят като пълно покритие без директен API или лицензиран доставчик.':'Охват: новости и публично индексируемый web-контент собираются автоматически. Закрытые группы, непубличные профили и контент, не индексируемый поисковыми системами, не представляются как полный охват без прямого API или лицензированного поставщика.',
'Оперативен принцип: Navigator не показва технически health-метрики на клиента. Показва новите факти, техния източник, значението им за казуса и дали наблюдението е актуално.':'Оперативный принцип: Navigator не показывает клиенту технические health-метрики. Он показывает новые факты, их источник, значение для кейса и актуальность мониторинга.',
'Оперативен принцип: Navigator не показва технически health-метрики на клиента. Показва новите факти, техния source, значението им за казуса и дали наблюдението е актуално.':'Оперативный принцип: Navigator не показывает клиенту технические health-метрики. Он показывает новые факты, их источник, значение для кейса и актуальность мониторинга.',
'при всеки нов материал Navigator трябва да записва:':'для каждого нового материала Navigator должен фиксировать:'
};

const dict=lang==='en'?EN:RU;
const keys=Object.keys(dict).sort((a,b)=>b.length-a.length);
function tr(value){
 if(!value)return value;
 let out=String(value);
 for(const k of keys){if(out.includes(k))out=out.split(k).join(dict[k]);}
 return out;
}
function translateTree(root){
 if(!root)return;
 if(root.nodeType===3){const n=tr(root.nodeValue||'');if(n!==root.nodeValue)root.nodeValue=n;return;}
 if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
 const el=root.nodeType===1?root:null;
 if(el&&/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(el.tagName))return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;return p&&!/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(p.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
 const list=[];while(walker.nextNode())list.push(walker.currentNode);
 for(const n of list){const v=tr(n.nodeValue||'');if(v!==n.nodeValue)n.nodeValue=v;}
 if(root.querySelectorAll)root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(e=>['aria-label','title','placeholder'].forEach(a=>{const v=e.getAttribute(a);if(v){const nv=tr(v);if(nv!==v)e.setAttribute(a,nv);}}));
}
let busy=false,timer=0;
function apply(root){if(busy)return;busy=true;try{translateTree(root||document.body)}finally{busy=false}}
function schedule(root){clearTimeout(timer);timer=setTimeout(()=>apply(root&&root.isConnected?root:document.body),80)}
function boot(){
 apply(document.body);
 [120,400,1000,2200].forEach(ms=>setTimeout(()=>apply(document.body),ms));
 const mo=new MutationObserver(ms=>{if(busy)return;let root=null;for(const m of ms){if(m.type==='characterData'){root=m.target.parentElement;break}if(m.addedNodes&&m.addedNodes.length){root=m.target;break}}if(root)schedule(root)});
 mo.observe(document.body,{subtree:true,childList:true,characterData:true});
 document.addEventListener('click',e=>{if(e.target.closest('#nav,.kubam-node,.kubam-filter'))[30,180,600].forEach(ms=>setTimeout(()=>apply(document.body),ms));},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* BLIS Navigator 3.0 — simplified analytical journey registry v6.1.
   Five client questions form the core journey. Intelligence HUB and Calendar are resources.
   Labels are shared with the canonical client header owner. */
(function(){
'use strict';
if(window.__BLIS_SYSTEM_STRUCTURE_V6)return;
window.__BLIS_SYSTEM_STRUCTURE_V3=true;
window.__BLIS_SYSTEM_STRUCTURE_V4=true;
window.__BLIS_SYSTEM_STRUCTURE_V5=true;
window.__BLIS_SYSTEM_STRUCTURE_V6=true;
const STAGES=[
 {id:'overview',step:'01',short:'Състояние',label:'Общ изглед',question:'Как е брандът ми сега?'},
 {id:'social',step:'02',short:'Сега',label:'Мониторинг',question:'Какво се случва в момента?'},
 {id:'market',step:'03',short:'Среда',label:'Среда',question:'Какво се случва около бранда и как се възприема?'},
 {id:'competition',step:'04',short:'Сравнение',label:'Конкуренти',question:'Как се движим спрямо останалите?'},
 {id:'history',step:'05',short:'Развитие',label:'Развитие/Доклади',question:'Как се развива картината във времето?'}
];
const ALIAS={signals:'social',live:'social',digital:'social',opportunities:'social',reputation:'market',reports:'history',timeline:'history',development:'history'};
const canonical=id=>ALIAS[String(id||'')]||String(id||'');
function stage(id){id=canonical(id);return STAGES.find(x=>x.id===id)||STAGES[0]}
function indexOf(id){id=canonical(id);const i=STAGES.findIndex(x=>x.id===id);return i<0?0:i}
function previous(id){const i=indexOf(id);return i>0?STAGES[i-1]:null}
function following(id){const i=indexOf(id);return i<STAGES.length-1?STAGES[i+1]:null}
function rail(){return''}
function context(){return''}
function next(){return''}
function decorate(){}
function bind(){}
window.BLISSystemStructure={stages:STAGES,stage,previous,following,indexOf,canonical,rail,context,next,decorate,bind,version:'3.0-short-label-five-page-journey-v2'};
})();

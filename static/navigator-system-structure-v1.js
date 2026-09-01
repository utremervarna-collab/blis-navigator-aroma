/* BLIS Navigator 3.0 — canonical analytical journey registry v4.
   Single responsibility: define the nine connected analytical stages.
   Visible journey, client questions and metric explanations are owned by navigator-3-client-clarity-v1.js. */
(function(){
'use strict';
if(window.__BLIS_SYSTEM_STRUCTURE_V4)return;
window.__BLIS_SYSTEM_STRUCTURE_V3=true;
window.__BLIS_SYSTEM_STRUCTURE_V4=true;

const STAGES=[
 {id:'overview',step:'01',short:'Състояние',label:'Общ преглед',question:'Какво е текущото състояние на марката?'},
 {id:'social',step:'02',short:'Промяна',label:'Важни сигнали',question:'Какво се промени?'},
 {id:'market',step:'03',short:'Контекст',label:'Пазар и нагласи',question:'Какъв контекст обяснява промяната?'},
 {id:'digital',step:'04',short:'Проява',label:'Дигитална видимост',question:'Къде се вижда ефектът онлайн?'},
 {id:'reputation',step:'05',short:'Доверие',label:'Репутация',question:'Как това влияе върху доверието?'},
 {id:'competition',step:'06',short:'Сравнение',label:'Конкуренция',question:'Как се променя позицията спрямо конкурентите?'},
 {id:'opportunities',step:'07',short:'Решение',label:'Риск и възможности',question:'Какво означава това за решенията?'},
 {id:'history',step:'08',short:'История',label:'История',question:'Как стигнахме до текущото състояние?'},
 {id:'reports',step:'09',short:'Резултат',label:'Доклади',question:'Какво излиза като клиентски резултат?'}
];

function stage(id){return STAGES.find(x=>x.id===id)||STAGES[0]}
function indexOf(id){const i=STAGES.findIndex(x=>x.id===id);return i<0?0:i}
function previous(id){const i=indexOf(id);return i>0?STAGES[i-1]:null}
function following(id){const i=indexOf(id);return i<STAGES.length-1?STAGES[i+1]:null}

/* Compatibility functions intentionally return no markup.
   Older canonical renderers call these methods, but Navigator 3 has one visible journey owner. */
function rail(){return''}
function context(){return''}
function next(){return''}
function decorate(){}
function bind(){}

window.BLISSystemStructure={
 stages:STAGES,
 stage,
 previous,
 following,
 indexOf,
 rail,
 context,
 next,
 decorate,
 bind,
 version:'3.0-bg-client-journey'
};
})();

/* BLIS Navigator — canonical universal terminology. */
(function(){
'use strict';
const pairs=[['Потребителски интерес','Нагласи'],['Пазарни сигнали','Нагласи'],['Карта на възприятията','Нагласи'],['Карта на потребителското възприятие','Нагласи'],['3D мрежа на възприятията','Нагласи'],['3D мрежа на нагласите','Нагласи'],['Индекс на възприятието','Индекс на нагласите'],['Общо възприятие','Общи нагласи'],['Движение на възприятието','Динамика на нагласите'],['Конкурентна позиция','Конкуренти']];
const labels={social:'Сигнали',digital:'Видимост',market:'Нагласи',competition:'Конкуренти'};
let scheduled=false;
function enforceLabels(){
 const nav=document.getElementById('nav');
 if(nav){Object.entries(labels).forEach(([id,label])=>{const t=nav.querySelector(`[data-page="${id}"] .navtxt`);if(t&&t.textContent!==label)t.textContent=label})}
 const signalTitle=document.querySelector('#social .n15-title h2');
 if(signalTitle&&signalTitle.textContent!=='Сигнали')signalTitle.textContent='Сигнали';
 const signalKicker=document.querySelector('#social .n15-title .n15-k');
 if(signalKicker)signalKicker.textContent='DIGITAL INTELLIGENCE';
 const digitalTitle=document.querySelector('#digital .n15-title h2');
 if(digitalTitle&&digitalTitle.textContent!=='Дигитална видимост')digitalTitle.textContent='Дигитална видимост';
}
function apply(root=document.body){
 if(!root)return;
 enforceLabels();
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||/SCRIPT|STYLE|TEXTAREA|INPUT|OPTION/.test(p.tagName))return NodeFilter.FILTER_REJECT;return pairs.some(([a])=>(n.nodeValue||'').includes(a))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{let t=n.nodeValue||'';pairs.forEach(([a,b])=>t=t.split(a).join(b));n.nodeValue=t});
 enforceLabels();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply(document.body)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0),true);
window.addEventListener('blis:clientdata',schedule);
window.addEventListener('blis:periodchange',schedule);
const startObserver=()=>{if(!document.body)return;new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startObserver,{once:true});else startObserver();
setInterval(enforceLabels,500);
window.BLISUITerminology={apply,enforceLabels};
})();
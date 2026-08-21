/* BLIS Navigator — canonical universal terminology. */
(function(){
'use strict';
const pairs=[['Потребителски интерес','Нагласи'],['Пазарни сигнали','Нагласи'],['Карта на възприятията','Нагласи'],['Карта на потребителското възприятие','Нагласи'],['3D мрежа на възприятията','Нагласи'],['3D мрежа на нагласите','Нагласи'],['Индекс на възприятието','Индекс на нагласите'],['Общо възприятие','Общи нагласи'],['Движение на възприятието','Динамика на нагласите'],['Конкурентна позиция','Конкуренти']];
function apply(root=document.body){
 if(!root)return;
 const labels={social:'Сигнали',digital:'Видимост',market:'Нагласи',competition:'Конкуренти'};
 Object.entries(labels).forEach(([id,label])=>{const t=document.querySelector(`#nav [data-page="${id}"] .navtxt`);if(t)t.textContent=label});
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||/SCRIPT|STYLE|TEXTAREA|INPUT|OPTION/.test(p.tagName))return NodeFilter.FILTER_REJECT;return pairs.some(([a])=>(n.nodeValue||'').includes(a))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{let t=n.nodeValue||'';pairs.forEach(([a,b])=>t=t.split(a).join(b));n.nodeValue=t});
}
function schedule(){requestAnimationFrame(()=>apply(document.body))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,20),true);
window.addEventListener('blis:clientdata',schedule);
window.BLISUITerminology={apply};
})();
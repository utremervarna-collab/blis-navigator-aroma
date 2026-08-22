/* BLIS Navigator — canonical universal terminology + Digital Intelligence presentation. */
(function(){
'use strict';
const pairs=[['Потребителски интерес','Мрежа на нагласите'],['Пазарни сигнали','Мрежа на нагласите'],['Карта на възприятията','Мрежа на нагласите'],['Карта на потребителското възприятие','Мрежа на нагласите'],['3D мрежа на възприятията','3D мрежа на нагласите'],['Индекс на възприятието','Индекс на нагласите'],['Общо възприятие','Общи нагласи'],['Движение на възприятието','Динамика на нагласите'],['Конкурентна позиция','Конкуренти']];

function installDigitalIntelligenceUI(){
  if(document.getElementById('blisDigitalIntelligenceUI'))return;
  const s=document.createElement('style');
  s.id='blisDigitalIntelligenceUI';
  s.textContent=`
    /* Digital Intelligence — one clear page title only. */
    #social #n15Signals > .n15-title > .n15-k,
    #social #n15Signals > .n15-title > p{display:none!important}
    #social #n15Signals > .n15-title{margin:2px 0 24px!important}
    #social #n15Signals > .n15-title > h2{
      margin:0!important;
      font-size:0!important;
      line-height:1!important;
      letter-spacing:0!important;
      color:#0b1f3a!important;
    }
    #social #n15Signals > .n15-title > h2:after{
      content:'Digital Intelligence';
      display:block;
      font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;
      font-size:44px;
      line-height:1.05;
      font-weight:850;
      letter-spacing:-.04em;
      color:#0b1f3a;
    }

    /* Larger side headings, without artificial letter stretching. */
    #social #n15Signals .n15-dir strong{
      display:block!important;
      width:100%!important;
      margin:0 0 14px!important;
      font-size:0!important;
      line-height:1!important;
      letter-spacing:0!important;
    }
    #social #n15Signals .n15-dir strong:after{
      display:block;
      width:100%;
      font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;
      font-size:29px;
      line-height:1.12;
      font-weight:850;
      letter-spacing:-.012em;
      color:#0f223e;
      text-align:left;
    }
    #social #n15Signals .n15-dir.from strong:after{content:'Сигнали от марката'}
    #social #n15Signals .n15-dir.about strong:after{content:'Сигнали за марката'}
    #social #n15Signals .n15-dir p{
      max-width:none!important;
      font-size:11px!important;
      line-height:1.65!important;
      text-align:justify!important;
      text-justify:inter-word!important;
    }
    #social #n15Signals .n15-dir b{
      margin-top:18px!important;
      font-family:Georgia,serif!important;
      font-weight:600!important;
      font-size:42px!important;
      letter-spacing:-.025em!important;
    }
    @media(max-width:1100px){
      #social #n15Signals > .n15-title > h2:after{font-size:38px}
      #social #n15Signals .n15-dir strong:after{font-size:26px}
    }
    @media(max-width:720px){
      #social #n15Signals > .n15-title > h2:after{font-size:34px}
      #social #n15Signals .n15-dir strong:after{font-size:24px}
    }
  `;
  document.head.appendChild(s);
}

function apply(root=document.body){
  if(!root)return;
  installDigitalIntelligenceUI();
  const market=document.querySelector('#nav [data-page="market"] .navtxt');if(market)market.textContent='Мрежа на нагласите';
  const comp=document.querySelector('#nav [data-page="competition"] .navtxt');if(comp)comp.textContent='Конкуренти';
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

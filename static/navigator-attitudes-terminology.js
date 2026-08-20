/* BLIS Navigator — canonical terminology for the market/attitudes module. */
(function(){
  'use strict';

  const replacements=new Map([
    ['Потребителски интерес','Мрежа на нагласите'],
    ['Карта на възприятията','Мрежа на нагласите'],
    ['Карта на потребителското възприятие','Мрежа на нагласите'],
    ['3D мрежа на възприятията','3D мрежа на нагласите'],
    ['Индекс на възприятието','Индекс на нагласите'],
    ['Общо възприятие','Общи нагласи'],
    ['Движение на възприятието','Динамика на нагласите'],
    ['Как се променя възприятието','Как се променят нагласите'],
    ['възприятия за бранда','нагласи към бранда'],
    ['възприятие за бранда','нагласа към бранда'],
    ['текущото възприятие','текущите нагласи'],
    ['потребителското възприятие','потребителските нагласи']
  ]);

  function replaceText(text){
    let out=String(text||'');
    replacements.forEach((to,from)=>{out=out.split(from).join(to)});
    return out;
  }

  function apply(root=document){
    if(!root)return;
    const nav=document.querySelector('#nav [data-page="market"]');
    const navLabel=nav?.querySelector('.navtxt')||nav?.querySelector('span:last-child');
    if(navLabel)navLabel.textContent='Мрежа на нагласите';

    const active=document.getElementById('blisActiveModule');
    if(document.getElementById('market')?.classList.contains('active')&&active)active.textContent='Мрежа на нагласите';

    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const p=node.parentElement;
      if(!p||/SCRIPT|STYLE|TEXTAREA|INPUT|OPTION/.test(p.tagName))return NodeFilter.FILTER_REJECT;
      const t=node.nodeValue||'';
      for(const key of replacements.keys())if(t.includes(key))return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{n.nodeValue=replaceText(n.nodeValue)});
  }

  function schedule(){requestAnimationFrame(()=>apply(document.body))}

  const wrap=name=>{
    const fn=window[name];
    if(typeof fn!=='function'||fn.__attitudesTerminology)return;
    const w=function(){const r=fn.apply(this,arguments);schedule();setTimeout(schedule,80);return r};
    w.__attitudesTerminology=true;w.__base=fn;window[name]=w;
  };

  function loadScript(id,src){
    if(document.getElementById(id))return;
    const s=document.createElement('script');
    s.id=id;s.src=src;s.async=false;document.head.appendChild(s);
  }
  function loadEnhancements(){
    loadScript('blisAttitudesLiveScript','/navigator-attitudes-live.js?v=20260820-live1');
    loadScript('blisGlobalLiveScript','/navigator-global-live.js?v=20260820-global1');
  }

  function install(){
    wrap('refGo');wrap('go');wrap('renderAll');
    apply(document.body);
    loadEnhancements();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('blis:clientdata',schedule);
  document.addEventListener('change',e=>{if(e.target?.id==='clientSel'||e.target?.closest?.('#market'))setTimeout(schedule,30)},true);
  document.addEventListener('click',e=>{if(e.target?.closest?.('#nav,[data-page="market"],#market'))setTimeout(schedule,30)},true);
  window.BLISAttitudesTerminology={apply};
})();
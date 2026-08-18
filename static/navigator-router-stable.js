/* BLIS Navigator — independent fail-safe router. Keeps navigation alive even if a module renderer fails. */
(function(){
  'use strict';
  const NAV=[
    ['overview','⌂','Общ изглед'],['live','◉','Live Monitoring'],['social','✣','Социални канали'],
    ['digital','◎','Дигитална видимост'],['reputation','◇','Репутация'],['market','◉','Пазарни сигнали'],
    ['competition','⚑','Конкуренти'],['signals','♧','Сигнали'],['reports','▤','Месечни доклади'],
    ['sources','▥','Източници на данни'],['history','◷','История'],['timeline','◫','Intelligence Timeline'],
    ['profile','♙','Клиентски профил'],['settings','⚙','Настройки'],['help','?','Помощ']
  ];
  const labelOf=id=>(NAV.find(x=>x[0]===id)||[])[2]||id;

  function ensurePages(){
    const shell=document.querySelector('.shell');
    if(!shell)return;
    NAV.forEach(([id])=>{
      if(document.getElementById(id))return;
      const s=document.createElement('section');
      s.id=id;s.className='page';s.innerHTML=`<div id="${id}Body"></div>`;shell.appendChild(s);
    });
  }

  function ensureNav(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    const ids=[...nav.querySelectorAll('button[data-page]')].map(b=>b.dataset.page);
    const complete=NAV.every(([id])=>ids.includes(id));
    if(!complete){
      nav.innerHTML=NAV.map(([id,ico,label],i)=>`<button type="button" data-page="${id}" class="${i===0?'active':''}"><span class="navico">${ico}</span><span class="navtxt">${label}</span></button>`).join('');
    }
  }

  function directShow(id){
    ensurePages();ensureNav();
    const page=document.getElementById(id);
    if(!page)return false;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    page.classList.add('active');
    document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
    const active=document.getElementById('blisActiveModule');if(active)active.textContent=labelOf(id);
    try{history.replaceState(null,'','#'+id)}catch(e){}
    try{window.scrollTo({top:0,behavior:'auto'})}catch(e){}
    return true;
  }

  function renderThenShow(id){
    let rendered=false;
    try{
      if(typeof window.refGo==='function' && window.refGo!==window.BLISStableGo){
        window.refGo(id);rendered=true;
      }
    }catch(e){console.error('[BLIS router] renderer failed for',id,e)}
    if(!document.getElementById(id)?.classList.contains('active')) directShow(id);
    return rendered;
  }

  window.BLISStableGo=function(id){ return renderThenShow(id); };

  function bind(){
    ensurePages();ensureNav();
    const nav=document.getElementById('nav');
    if(nav && !nav.dataset.stableRouter){
      nav.dataset.stableRouter='1';
      nav.addEventListener('click',function(e){
        const b=e.target.closest('button[data-page]');if(!b)return;
        e.preventDefault();e.stopPropagation();renderThenShow(b.dataset.page);
      },true);
    }
    document.addEventListener('click',function(e){
      const el=e.target.closest('[onclick*="refGo(\'"]');
      if(!el)return;
      const m=(el.getAttribute('onclick')||'').match(/refGo\(['\"]([^'\"]+)/);
      if(m){e.preventDefault();renderThenShow(m[1]);}
    },true);
    const hash=location.hash.replace('#','');
    const initial=NAV.some(x=>x[0]===hash)?hash:'overview';
    directShow(initial);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,250);setTimeout(bind,900);
})();

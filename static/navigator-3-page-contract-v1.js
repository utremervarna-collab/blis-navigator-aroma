/* BLIS Navigator 3 — single page hierarchy contract.
   The universal shell owns the page title/context. Page bodies own only visual/data labels.
   This prevents duplicated titles and descriptions across the 5+2 client journey. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_PAGE_CONTRACT_V1)return;
window.__BLIS_NAVIGATOR_3_PAGE_CONTRACT_V1=true;

const COPY={
  overview:{title:'Общ изглед',sub:'Обобщена картина на състоянието, движението и най-важните промени.'},
  social:{title:'Мониторинг',sub:'Значими сигнали, видимост, рискове и възможности в текущата информационна среда.'},
  market:{title:'Среда',sub:'Пазарни фактори, теми и промени във възприятието за бранда.'},
  competition:{title:'Конкуренти',sub:'Позиция, движение и значими промени спрямо конкурентите.'},
  history:{title:'Развитие/Доклади',sub:'Динамика във времето, ключови събития и налични доклади.'},
  hub:{title:'Intelligence HUB',sub:'Аналитични материали, знания и съдържание на едно място.'},
  calendar:{title:'Календар',sub:'Събития, срокове и важни дати за наблюдение.'}
};
const CORE=new Set(['overview','social','market','competition','history']);
const ALIAS={digital:'social',opportunities:'social',live:'social',signals:'social',reputation:'market',reports:'history',timeline:'history'};
let timer=0;

function route(){
  const raw=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';
  return ALIAS[raw]||raw;
}
function text(el,value){if(el&&el.textContent!==value)el.textContent=value}
function hide(el){if(!el)return;el.setAttribute('aria-hidden','true');if(el.style.display!=='none')el.style.setProperty('display','none','important')}
function show(el){if(!el)return;el.removeAttribute('aria-hidden');if(el.style.display==='none')el.style.removeProperty('display')}

function installCss(){
  if(document.getElementById('navigator3PageContractV1Css'))return;
  const s=document.createElement('style');
  s.id='navigator3PageContractV1Css';
  s.textContent=`
  /* One page title only: the shell context bar. */
  .blis-system-bar{display:none!important}
  #overview .n3-page-head,#social .n3-page-head,#market .n3-page-head,#competition .n3-page-head,#history .n3-page-head,#hub .n3-page-head,#calendar .n3-page-head{display:none!important}
  [data-n3-duplicate-route-title],[data-n3-duplicate-route-copy]{display:none!important}

  /* Canonical owners that still render an old route-level header. */
  #overview .vs-head,#competition .vs-head,#history .vs-head{display:none!important}
  #overview .ref-title,#market .ref-title,#competition .ref-title,#history .ref-title{display:none!important}
  #market .pm-hero{display:none!important}

  /* Radar: keep the visual title, remove a second page description and repeated summary sentence. */
  #social .dv-title p,#social .dv-summary{display:none!important}
  #social .dv-title{margin-bottom:8px!important}

  /* Tighten the first content block after removing redundant headers. */
  #overview .vs-page,#competition .vs-page,#history .vs-page{padding-top:0!important}
  #market .pm-wrap{padding-top:0!important}
  #overview .vs-answer,#competition .vs-answer,#history .vs-answer{margin-top:0!important}
  `;
  document.head.appendChild(s);
}

function syncShell(id){
  const c=COPY[id];if(!c)return;
  text(document.querySelector('.bch3-context-title'),c.title);
  text(document.querySelector('.bch3-context-sub'),c.sub);
}

function normalizeVisualCopy(id){
  if(id==='overview'){
    text(document.querySelector('#overview .vs-vhead b'),'BLIS индекс');
  }else if(id==='social'){
    text(document.querySelector('#social .dv-title h2'),'Интелигентен радар');
    document.querySelectorAll('#social .n3-live-strip-head span').forEach(el=>text(el,'Текущо наблюдение'));
    document.querySelectorAll('#social .n3-live-strip-head b').forEach(el=>text(el,'Какво се случва сега'));
  }else if(id==='market'){
    text(document.querySelector('#market .pm-maphead b'),'Мрежа на пазарни и репутационни фактори');
  }else if(id==='competition'){
    text(document.querySelector('#competition .vs-vhead b'),'Сравнение с конкурентите');
  }else if(id==='history'){
    text(document.querySelector('#history .vs-vhead b'),'Динамика във времето');
  }

  document.querySelectorAll('.page.active .vs-vhead em').forEach(el=>{
    if(/^LIVE$/i.test(el.textContent.trim()))text(el,'ТЕКУЩО');
  });
  document.querySelectorAll('.page.active .pm-client-badge i').forEach(el=>{
    if(/\bLIVE\b/i.test(el.textContent))text(el,'● АКТИВНО');
  });
}

function suppressExactRouteTitle(id){
  if(!CORE.has(id))return;
  const root=document.getElementById(id),c=COPY[id];if(!root||!c)return;
  root.querySelectorAll('h1,h2,h3').forEach(h=>{
    if(h.textContent.trim()!==c.title)return;
    const known=h.closest('.n3-page-head,.vs-head,.ref-title,.pm-hero');
    if(known){hide(known);return}
    h.dataset.n3DuplicateRouteTitle='1';hide(h);
    const parent=h.parentElement;
    const p=(h.nextElementSibling?.matches?.('p')?h.nextElementSibling:parent?.querySelector?.(':scope > p'))||null;
    if(p){p.dataset.n3DuplicateRouteCopy='1';hide(p)}
  });
}

function removeDuplicateBodyTitles(id){
  document.querySelectorAll('.blis-system-bar').forEach(hide);
  document.querySelectorAll(`#${id} .n3-page-head`).forEach(hide);
  if(['overview','market','competition','history'].includes(id))document.querySelectorAll(`#${id} .ref-title`).forEach(hide);
  if(['overview','competition','history'].includes(id))document.querySelectorAll(`#${id} .vs-head`).forEach(hide);
  if(id==='market')document.querySelectorAll('#market .pm-hero').forEach(hide);
  if(id==='social'){
    document.querySelectorAll('#social .dv-title p,#social .dv-summary').forEach(hide);
    const title=document.querySelector('#social .dv-title');if(title)show(title);
  }
  suppressExactRouteTitle(id);
}

function apply(){
  installCss();
  const id=route();
  if(!COPY[id])return;
  document.documentElement.dataset.navigatorPageContract='single-shell-title';
  syncShell(id);
  removeDuplicateBodyTitles(id);
  normalizeVisualCopy(id);
  suppressExactRouteTitle(id);
}

function schedule(){
  clearTimeout(timer);
  apply();
  [70,180,360,720].forEach(ms=>setTimeout(apply,ms));
  timer=setTimeout(apply,1100);
}

['blis:clientdata','blis:periodchange','blis:routechange','popstate'].forEach(ev=>window.addEventListener(ev,schedule));
document.addEventListener('click',e=>{
  if(e.target.closest?.('#nav,[data-n3-page],[data-page]'))setTimeout(schedule,0);
},true);
document.addEventListener('change',e=>{
  if(e.target?.id==='clientSel')setTimeout(schedule,0);
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('load',schedule,{once:true});
window.BLISNavigator3PageContractV1={apply,schedule,copy:COPY};
})();

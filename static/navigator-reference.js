/* BLIS Navigator — canonical client-aware route system. No client-specific legacy templates. */
(function(){
'use strict';

const NAV=[
  ['overview','⌂','Общ преглед'],['live','◉','Live Monitoring'],['social','✣','Социални сигнали'],
  ['digital','◎','Дигитална видимост'],['reputation','◇','Репутация'],['market','◉','Нагласи'],
  ['competition','⚑','Конкуренти'],['signals','♧','Сигнали'],['reports','▤','Месечни доклади'],
  ['sources','▥','Източници на данни'],['history','◷','История'],['timeline','◫','Intelligence Timeline'],
  ['profile','♙','Клиентски профил'],['settings','⚙','Настройки'],['help','?','Помощ']
];
const ICONS={overview:'▦',live:'◉',social:'⌁',digital:'◎',reputation:'◇',market:'◌',competition:'⚑',signals:'♧',reports:'▤',sources:'▥',history:'◷',timeline:'◫',profile:'♙',settings:'⚙',help:'?'};
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const arr=x=>Array.isArray(x)?x:[];
const clientName=()=>{try{return D?.name||document.querySelector('.client-brand-name')?.textContent||'Клиент'}catch(_){return'Клиент'}};
const clientSector=()=>{try{return D?.sector||document.querySelector('.client-brand-type')?.textContent||'Аналитичен профил'}catch(_){return'Аналитичен профил'}};
const sources=()=>{try{return arr(S)}catch(_){return[]}};
const activity=()=>{try{return arr(A)}catch(_){return[]}};
const signals=()=>{try{return arr(D?.signals)}catch(_){return[]}};
const escVal=v=>v===null||v===undefined||v===''?'—':E(v);

function ensurePages(){
  const shell=document.querySelector('.shell');if(!shell)return;
  NAV.forEach(([id])=>{if(document.getElementById(id))return;const s=document.createElement('section');s.id=id;s.className='page';s.innerHTML=`<div id="${id}Body"></div>`;shell.appendChild(s)});
}
function nav(){
  const n=document.getElementById('nav');if(!n)return;
  const active=document.querySelector('.page.active')?.id||'overview';
  n.innerHTML=NAV.map(([id,,label])=>`<button data-page="${id}" class="${id===active?'active':''}"><span class="navico">${ICONS[id]||'•'}</span><span class="navtxt">${E(label)}</span></button>`).join('');
  n.querySelectorAll('button[data-page]').forEach(b=>b.onclick=()=>window.refGo(b.dataset.page));
}
function activate(id){
  ensurePages();
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page=document.getElementById(id);if(page)page.classList.add('active');
  document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  try{const u=new URL(location.href);u.searchParams.set('client',new URLSearchParams(location.search).get('client')||window.BLIS_INITIAL_CLIENT||'aroma');u.searchParams.delete('page');u.hash='';history.replaceState(null,'',u.pathname+u.search)}catch(_){ }
}
function host(id){return document.getElementById(id+'Body')||document.getElementById(id)};
function head(title,sub){return `<div class="ref-title"><h2>${E(title)}</h2><p>${E(sub)}</p></div>`}
function row(icon,title,text,badge=''){return `<div class="ref-row"><span class="ref-miniicon">${E(icon)}</span><div><b>${E(title)}</b><p>${E(text)}</p></div>${badge?`<span class="ref-badge">${E(badge)}</span>`:''}</div>`}
function empty(text){return `<div class="scan">${E(text)}</div>`}

function renderSignalsPage(){
  const h=host('signals');if(!h)return;const ss=signals();
  h.innerHTML=head('Сигнали',`Потвърдени наблюдения и промени за ${clientName()}.`)+`<div class="ref-card">${ss.length?ss.map((s,i)=>row(i===0?'!':'•',s.title||s.label||'Сигнал',s.description||s.detail||'Потвърдена промяна от наблюдаван източник.',s.priority||s.level||'Наблюдение')).join(''):empty('Няма нов потвърден сигнал за текущия период.')}</div>`;
}
function renderTimeline(){
  const h=host('timeline');if(!h)return;const ev=[];
  signals().forEach(s=>ev.push({t:s.time||s.created_at||'',title:s.title||s.label||'Сигнал',text:s.description||s.detail||''}));
  activity().forEach(a=>ev.push({t:a.time||a.observed_at||'',title:(typeof metricName==='function'?metricName(a.metric||a.metric_key):a.metric||a.metric_key||'Измерване'),text:(typeof sourceName==='function'?sourceName(a.source||a.source_key):a.source||a.source_key||'Източник')}));
  ev.sort((a,b)=>new Date(b.t||0)-new Date(a.t||0));
  h.innerHTML=head('Intelligence Timeline',`Хронология на наблюдаваните промени за ${clientName()}.`)+`<div class="ref-card">${ev.length?ev.slice(0,30).map(x=>row('↗',x.title,`${x.t?new Date(x.t).toLocaleString('bg-BG')+' · ':''}${x.text}`)).join(''):empty('Историята на събитията се натрупва.')}</div>`;
}
function officialSite(){
  const s=sources().find(x=>String(x.key||'').toLowerCase()==='official_site')||sources().find(x=>/официал|official|website|site/i.test(`${x.label||''} ${x.method||''}`));
  return s?.url||'';
}
function renderSettingsPage(){
  const h=host('settings');if(!h)return;const site=officialSite();
  h.innerHTML=head('Настройки',`Клиентски настройки за ${clientName()}.`)+`<div class="ref-settings-grid"><div class="ref-card"><div class="ref-head"><h3>ОСНОВНИ НАСТРОЙКИ</h3></div>${row('♙','Клиент',clientName(),'Активен')}${row('◎','Сектор',clientSector())}${row('◷','Часова зона','(UTC+03:00) София')}${row('€','Валута','EUR (€)')}</div><div class="ref-card"><div class="ref-head"><h3>НАБЛЮДЕНИЕ</h3></div>${row('▥','Конфигурирани източници',String(sources().length),'Активно')}${row('◉','Измервания',String(activity().length),'Текуща база')}${site?row('⌂','Официален сайт',site,'Публичен'):''}${row('↻','Опресняване','Автоматично според активните източници')}</div></div>`;
}
function renderHelp(){
  const h=host('help');if(!h)return;
  h.innerHTML=head('Помощ','Насоки за работа с BLIS Navigator.')+`<div class="ref-grid3">${[['Общ преглед','Индекси, тенденции и ключови сигнали.'],['Източници','Проверяемост и информационно покритие.'],['Клиентски профил','Досие и обхват на активния клиент.']].map(x=>`<div class="ref-card"><h3>${E(x[0])}</h3><p class="ref-callout">${E(x[1])}</p></div>`).join('')}</div>`;
}
function renderFallback(id){
  const h=host(id);if(!h)return;
  h.innerHTML=head(NAV.find(x=>x[0]===id)?.[2]||'BLIS Navigator',`${clientName()} · ${clientSector()}`)+empty('Модулът се подготвя от текущите клиентски данни.');
}

function renderRoute(id){
  try{
    switch(id){
      case 'overview':
        if(window.BLISOverviewMaster?.render)return window.BLISOverviewMaster.render();
        if(typeof renderOverview==='function')return renderOverview();
        break;
      case 'live':
        if(typeof window.BLISLiveMount==='function')return window.BLISLiveMount();
        break;
      case 'social':
        if(typeof window.BLISSocialSignalsRender==='function')return window.BLISSocialSignalsRender();
        if(typeof renderSocial==='function')return renderSocial();
        break;
      case 'digital':
        if(window.BLISDigitalRadar?.render)return window.BLISDigitalRadar.render();
        if(typeof renderDigital==='function')return renderDigital();
        break;
      case 'reputation': if(typeof renderReputation==='function')return renderReputation(); break;
      case 'market': if(typeof renderMarket==='function')return renderMarket(); break;
      case 'competition': if(typeof renderCompetition==='function')return renderCompetition(); break;
      case 'reports': if(typeof renderReports==='function')return renderReports(); break;
      case 'sources': if(typeof renderSources==='function')return renderSources(); break;
      case 'history': if(typeof renderHistory==='function')return renderHistory(); break;
      case 'profile': if(typeof renderProfile==='function')return renderProfile(); break;
      case 'signals': return renderSignalsPage();
      case 'timeline': return renderTimeline();
      case 'settings': return renderSettingsPage();
      case 'help': return renderHelp();
    }
  }catch(e){console.error('BLIS canonical route failed',id,e)}
  renderFallback(id);
}

window.refGo=function(id){
  if(!NAV.some(x=>x[0]===id))id='overview';
  activate(id);
  const out=renderRoute(id);
  window.scrollTo({top:0,behavior:'smooth'});
  return out;
};
window.refGo.__blisCanonicalClientRouter=true;
window.BLISCanonicalRenderActive=function(){const id=document.querySelector('.page.active')?.id||'overview';renderRoute(id)};

function boot(){
  ensurePages();nav();
  const id=document.querySelector('.page.active')?.id||'overview';
  renderRoute(id);
  window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{nav();window.BLISCanonicalRenderActive()}));
  window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>window.BLISCanonicalRenderActive()));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* BLIS Navigator — клиентска аналитична навигация v12. */
(function(){
'use strict';
if(window.__BLIS_REFERENCE_V12)return;window.__BLIS_REFERENCE_V12=true;
const NAV=[
  ['overview','▦','Общ преглед'],
  ['social','!','Важни сигнали'],
  ['reputation','◇','Репутация'],
  ['competition','⚑','Конкуренция'],
  ['digital','◎','Дигитална видимост'],
  ['market','◌','Пазар и нагласи'],
  ['opportunities','↗','Риск и възможности'],
  ['history','◷','История'],
  ['reports','▤','Доклади']
];
const UTILITY=['profile','settings','help','commerce'];
const IDS=new Set([...NAV.map(x=>x[0]),...UTILITY]);
const ALIAS={signals:'social',sources:'profile',timeline:'history',live:'overview'};
const canonical=id=>ALIAS[String(id||'')]||String(id||'');
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clientName=()=>window.D?.name||document.querySelector('.client-brand-name')?.textContent||'Клиент';
const clientSector=()=>window.D?.sector||document.querySelector('.client-brand-type')?.textContent||'Аналитичен профил';
function currentClient(){try{const q=new URLSearchParams(location.search).get('client');if(q)return q}catch(_){}return window.BLIS_INITIAL_CLIENT||document.body?.dataset?.client||'aroma'}
function ensurePages(){const shell=document.querySelector('.shell');if(!shell)return;[...IDS].forEach(id=>{if(document.getElementById(id))return;const s=document.createElement('section');s.id=id;s.className='page';s.innerHTML=`<div id="${id}Body"></div>`;shell.appendChild(s)})}
function nav(){const n=document.getElementById('nav');if(!n)return;const active=document.querySelector('.page.active')?.id||'overview',sig=NAV.map(([id,icon,label])=>`${id}|${icon}|${label}|${id===active?'1':'0'}|${currentClient()}`).join(';');if(n.dataset.refv12Sig===sig)return;n.innerHTML=NAV.map(([id,icon,label])=>`<button type="button" data-page="${id}" class="${id===active?'active':''}"><span class="navico">${icon}</span><span class="navtxt">${E(label)}</span></button>`).join('');n.dataset.refv12Sig=sig}
function activate(id,historyMode='replace'){id=canonical(id);ensurePages();if(!IDS.has(id))id='overview';document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('#nav [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));if(historyMode)try{const u=new URL(location.href);u.searchParams.set('client',currentClient());u.searchParams.set('page',id);u.hash='';history[historyMode+'State']({page:id},'',u.pathname+u.search)}catch(_){}return id}
function host(id){return id==='overview'?document.getElementById('overviewPremium'):(document.getElementById(id+'Body')||document.getElementById(id))}
function fallback(id,text='Модулът се зарежда.'){const h=host(id);if(!h)return;const label=NAV.find(x=>x[0]===id)?.[2]||({profile:'Клиентски профил',settings:'Настройки',help:'Помощ',commerce:'Услуги и плащане'}[id]||'BLIS Navigator');if((h.innerText||'').trim().length>20)return;h.innerHTML=`<div class="ref-title"><h2>${E(label)}</h2><p>${E(clientName())} · ${E(clientSector())}</p></div><div class="scan">${E(text)}</div>`}
function renderUtility(id){if(window.BLISUtilityPages?.owns?.(id))return window.BLISUtilityPages.mount(id);return fallback(id)}
function renderRoute(id){id=canonical(id);try{
  if(id==='commerce'){if(window.BLISCommerceSafe?.render)return window.BLISCommerceSafe.render();return fallback(id)}
  if(id==='overview'){if(window.BLISOverviewMaster?.render)return window.BLISOverviewMaster.render();return fallback(id,'Обобщението се подготвя.')}
  if(id==='social'){
    if(window.BLISIntelligenceStreamV3?.renderSignals)return window.BLISIntelligenceStreamV3.renderSignals();
    if(window.BLISArchitectureV15?.render)return window.BLISArchitectureV15.render(id);
    return fallback(id,'Важните сигнали се подготвят.');
  }
  if(id==='digital'){if(window.BLISArchitectureV15?.render)return window.BLISArchitectureV15.render(id);return fallback(id)}
  if(id==='reputation'){if(window.BLISReputation?.render)return window.BLISReputation.render();return fallback(id)}
  if(id==='market'){if(window.BLISPerceptionMap?.mount)return window.BLISPerceptionMap.mount();return fallback(id)}
  if(id==='competition'){if(window.BLISCompetitionMasterV5?.render){const r=window.BLISCompetitionMasterV5.render();try{window.BLISCompetitionIntelligenceV9?.enhance?.()}catch(_){}try{window.BLISCompetitionEnvironmentV10?.render?.()}catch(_){}try{window.BLISCompetitionPageV11?.apply?.()}catch(_){}try{window.BLISCompetitionPageV12?.enhance?.()}catch(_){}document.body.classList.add('blis-competition-ready');return r}return fallback(id)}
  if(id==='opportunities'){
    if(window.BLISIntelligenceStreamV3?.renderOpportunities)return window.BLISIntelligenceStreamV3.renderOpportunities();
    return fallback(id,'Анализът на рисковете и възможностите се подготвя.');
  }
  if(['reports','history','profile','settings','help'].includes(id))return renderUtility(id);
}catch(e){console.warn('BLIS route fallback',id,e?.message||e);return fallback(id,'Модулът се възстановява.')}
return fallback(id)}
window.refGo=function(id){id=canonical(id);id=IDS.has(id)?id:'overview';const current=canonical(document.querySelector('.page.active')?.id||'');activate(id,current===id?'replace':'push');nav();const out=renderRoute(id);window.dispatchEvent(new CustomEvent('blis:routechange',{detail:{page:id}}));window.scrollTo({top:0,behavior:'smooth'});return out};window.refGo.__blisCanonicalClientRouter=true;window.BLISRouteAlias=canonical;
window.BLISCanonicalRenderActive=function(){const id=canonical(document.querySelector('.page.active')?.id||'overview');return renderRoute(IDS.has(id)?id:'overview')};
function syncGlobals(){try{window.D=D}catch(_){}try{window.S=S}catch(_){}try{window.Q=Q}catch(_){}try{window.A=A}catch(_){}try{window.H=H}catch(_){}}
function bindStableNav(){if(window.__BLIS_NAV_STABLE_V2)return;window.__BLIS_NAV_STABLE_V2=true;document.addEventListener('click',function(e){const b=e.target.closest?.('#nav button[data-page]');if(!b||typeof window.refGo!=='function')return;e.preventDefault();e.stopPropagation();window.refGo(b.dataset.page)},true)}
function boot(){ensurePages();syncGlobals();nav();bindStableNav();const q=canonical(new URLSearchParams(location.search).get('page')),active=canonical(document.querySelector('.page.active')?.id),id=IDS.has(q)?q:(IDS.has(active)?active:'overview');activate(id,'replace');nav();renderRoute(id);window.addEventListener('popstate',()=>{const next=canonical(new URLSearchParams(location.search).get('page'));const target=IDS.has(next)?next:'overview';activate(target,false);nav();renderRoute(target);window.dispatchEvent(new CustomEvent('blis:routechange',{detail:{page:target}}))});window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{syncGlobals();nav();window.BLISCanonicalRenderActive()}));window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>window.BLISCanonicalRenderActive()))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

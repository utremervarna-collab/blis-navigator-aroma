/* BLIS Navigator — frozen router v1.
   SINGLE OWNER for route activation and approved module mounting.
   No aliases rewrite approved page bodies; no polling; no mutation observers. */
(function(){
'use strict';
if(window.__BLIS_FROZEN_ROUTER_V1)return;window.__BLIS_FROZEN_ROUTER_V1=true;
const NAV=[['overview','▦','Общ преглед'],['live','◉','Live Monitoring'],['social','⌁','Сигнали'],['digital','◎','Дигитална видимост'],['reputation','◇','Репутация'],['market','◌','Нагласи'],['competition','⚑','Конкуренти'],['reports','▤','Месечни доклади'],['history','◷','История'],['profile','♙','Клиентски профил'],['settings','⚙','Настройки'],['help','?','Помощ']];
const IDS=new Set(NAV.map(x=>x[0]));
const ALIAS={signals:'social',sources:'profile',timeline:'history'};
const COPY={
 overview:['Общ изглед','Обобщаване на активните индекси и сигнали'],
 live:['Live Monitoring','Наблюдение на активните източници и системния статус'],
 social:['Сигнали','Проверими сигнали от наблюдаваната дигитална среда'],
 digital:['Дигитална видимост','Сайт, търсене, външна видимост и дигитални точки на контакт'],
 reputation:['Репутация','Публично възприятие, оценки, мнения и репутационни рискове'],
 market:['Нагласи','Проверими теми, връзки, динамика и източници'],
 competition:['Конкуренти','Съпоставка на конкурентната среда и активните движения'],
 reports:['Месечни доклади','Аналитични изходи и експорти за текущия профил'],
 history:['История','Архив на сравними измервания и промени'],
 profile:['Клиентски профил','Обхват, контекст и аналитична конфигурация'],
 settings:['Настройки','Настройки на профила и интерфейса'],
 help:['Помощ','Информация за работа с Navigator']
};
const canonical=id=>ALIAS[String(id||'')]||String(id||'');
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensurePages(){const shell=document.querySelector('.shell');if(!shell)return;NAV.forEach(([id])=>{if(document.getElementById(id))return;const s=document.createElement('section');s.id=id;s.className='page';s.innerHTML=`<div id="${id}Body"></div>`;shell.appendChild(s)})}
function nav(){const n=document.getElementById('nav');if(!n)return;const active=canonical(document.querySelector('.page.active')?.id)||'overview';n.innerHTML=NAV.map(([id,icon,label])=>`<button type="button" data-page="${id}" class="${id===active?'active':''}"><span class="navico">${icon}</span><span class="navtxt">${E(label)}</span></button>`).join('');n.querySelectorAll('button[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page))}
function updateSystem(id){const c=COPY[id]||COPY.overview,a=document.getElementById('blisActiveModule'),d=document.getElementById('blisSystemDetail');if(a)a.textContent=c[0];if(d)d.textContent=c[1]}
function activate(id){id=canonical(id);if(!IDS.has(id))id='overview';ensurePages();document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));updateSystem(id);try{const u=new URL(location.href);u.searchParams.set('client',document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma');u.searchParams.set('page',id);u.hash='';history.replaceState({page:id},'',u.pathname+u.search)}catch(_){}return id}
function host(id){return id==='overview'?document.getElementById('overviewPremium'):(document.getElementById(id+'Body')||document.getElementById(id))}
function fallback(id,msg='Модулът се зарежда.'){const h=host(id);if(!h)return;if((h.innerText||'').trim().length>20)return;const label=NAV.find(x=>x[0]===id)?.[2]||'BLIS Navigator';h.innerHTML=`<div class="ref-title"><h2>${E(label)}</h2></div><div class="scan">${E(msg)}</div>`}
function utility(id){if(window.BLISUtilityPages?.owns?.(id))return window.BLISUtilityPages.mount(id);return fallback(id)}
function render(id){id=canonical(id);try{
 if(id==='overview'){if(window.BLISOverviewMaster?.render)return window.BLISOverviewMaster.render();return fallback(id,'Общият преглед се инициализира.')}
 if(id==='live'){if(typeof window.BLISLiveMount==='function')return window.BLISLiveMount();return fallback(id)}
 if(id==='social'){if(typeof window.BLISSocialSignalsRender==='function')return window.BLISSocialSignalsRender();return fallback(id)}
 if(id==='digital'){if(window.BLISDigitalRadar?.render)return window.BLISDigitalRadar.render();return fallback(id)}
 if(id==='reputation'){if(window.BLISReputation?.render){const r=window.BLISReputation.render();requestAnimationFrame(()=>{try{window.BLISReputationTotem3DV39?.mount?.()}catch(_){}});return r}return fallback(id)}
 if(id==='market'){if(window.BLISPerceptionMap?.mount)return window.BLISPerceptionMap.mount();return fallback(id)}
 if(id==='competition'){if(window.BLISCompetitionMasterV5?.render){const r=window.BLISCompetitionMasterV5.render();try{window.BLISCompetitionIntelligenceV9?.enhance?.()}catch(_){}try{window.BLISCompetitionEnvironmentV10?.render?.()}catch(_){}try{window.BLISCompetitionPageV11?.apply?.()}catch(_){}try{window.BLISCompetitionPageV12?.enhance?.()}catch(_){}document.body.classList.add('blis-competition-ready');return r}return fallback(id)}
 if(['reports','history','profile','settings','help'].includes(id))return utility(id);
 }catch(e){console.warn('BLIS frozen route',id,e?.message||e);return fallback(id,'Модулът се възстановява.')}
}
function go(id){id=activate(id);nav();const out=render(id);window.dispatchEvent(new CustomEvent('blis:routechange',{detail:{page:id}}));window.scrollTo({top:0,behavior:'smooth'});return out}
window.refGo=go;window.refGo.__blisFrozenRouter=true;window.BLISRouteAlias=canonical;window.BLISCanonicalRenderActive=function(){const id=canonical(document.querySelector('.page.active')?.id||'overview');return render(IDS.has(id)?id:'overview')};
function boot(){ensurePages();nav();const q=canonical(new URLSearchParams(location.search).get('page')),active=canonical(document.querySelector('.page.active')?.id),id=IDS.has(q)?q:(IDS.has(active)?active:'overview');go(id);window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{nav();render(canonical(document.querySelector('.page.active')?.id||'overview'));updateSystem(canonical(document.querySelector('.page.active')?.id||'overview'))}));window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>render(canonical(document.querySelector('.page.active')?.id||'overview'))))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BLISFrozenRouterV1={go,render,nav,canonical};
})();

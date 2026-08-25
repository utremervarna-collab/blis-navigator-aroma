/* BLIS Navigator — canonical production router v7. Native links are the fail-safe route owner. */
(function(){
'use strict';
if(window.__BLIS_REFERENCE_V7)return;window.__BLIS_REFERENCE_V7=true;
const NAV=[['overview','▦','Общ преглед'],['live','◉','Live Monitoring'],['social','⌁','Сигнали'],['digital','◎','Дигитална видимост'],['reputation','◇','Репутация'],['market','◌','Нагласи'],['competition','⚑','Конкуренти'],['reports','▤','Месечни доклади'],['history','◷','История'],['profile','♙','Клиентски профил'],['settings','⚙','Настройки'],['help','?','Помощ']];
const IDS=new Set([...NAV.map(x=>x[0]),'commerce']);
const ALIAS={signals:'social',sources:'profile',timeline:'history'};
const canonical=id=>ALIAS[String(id||'')]||String(id||'');
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clientName=()=>window.D?.name||document.querySelector('.client-brand-name')?.textContent||'Клиент';
const clientSector=()=>window.D?.sector||document.querySelector('.client-brand-type')?.textContent||'Аналитичен профил';
function currentClient(){try{const q=new URLSearchParams(location.search).get('client');if(q)return q}catch(_){}return window.BLIS_INITIAL_CLIENT||document.body?.dataset?.client||'aroma'}
function routeHref(id){const u=new URL(location.href);u.searchParams.set('client',currentClient());u.searchParams.set('page',id);u.hash='';return u.pathname+u.search}
function ensurePages(){const shell=document.querySelector('.shell');if(!shell)return;[...NAV.map(x=>x[0]),'commerce'].forEach(id=>{if(document.getElementById(id))return;const s=document.createElement('section');s.id=id;s.className='page';s.innerHTML=`<div id="${id}Body"></div>`;shell.appendChild(s)})}
function nav(){const n=document.getElementById('nav');if(!n)return;const active=document.querySelector('.page.active')?.id||'overview',sig=NAV.map(([id,icon,label])=>`${id}|${icon}|${label}|${id===active?'1':'0'}|${currentClient()}`).join(';');if(n.dataset.refv7Sig===sig)return;n.innerHTML=NAV.map(([id,icon,label])=>`<a href="${E(routeHref(id))}" data-page="${id}" class="${id===active?'active':''}"><span class="navico">${icon}</span><span class="navtxt">${E(label)}</span></a>`).join('');n.dataset.refv7Sig=sig}
function activate(id){id=canonical(id);ensurePages();if(!IDS.has(id))id='overview';document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('#nav [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));try{const u=new URL(location.href);u.searchParams.set('client',currentClient());u.searchParams.set('page',id);u.hash='';history.replaceState({page:id},'',u.pathname+u.search)}catch(_){}return id}
function host(id){return id==='overview'?document.getElementById('overviewPremium'):(document.getElementById(id+'Body')||document.getElementById(id))}
function fallback(id,text='Модулът се зарежда.'){const h=host(id);if(!h)return;const label=id==='commerce'?'Услуги и плащане':(NAV.find(x=>x[0]===id)?.[2]||'BLIS Navigator');if((h.innerText||'').trim().length>20)return;h.innerHTML=`<div class="ref-title"><h2>${E(label)}</h2><p>${E(clientName())} · ${E(clientSector())}</p></div><div class="scan">${E(text)}</div>`}
function renderUtility(id){if(window.BLISUtilityPages?.owns?.(id))return window.BLISUtilityPages.mount(id);return fallback(id)}
function renderRoute(id){id=canonical(id);try{
 if(id==='commerce'){if(window.BLISCommerceSafe?.render)return window.BLISCommerceSafe.render();return fallback(id)}
 if(id==='overview'){if(window.BLISOverviewMaster?.render)return window.BLISOverviewMaster.render();return fallback(id,'Общият преглед се инициализира.')}
 if(id==='live'){if(typeof window.BLISLiveMount==='function')return window.BLISLiveMount();return fallback(id)}
 if(id==='social'){if(typeof window.BLISSocialSignalsRender==='function')return window.BLISSocialSignalsRender();return fallback(id)}
 if(id==='digital'){if(window.BLISDigitalRadar?.render)return window.BLISDigitalRadar.render();return fallback(id)}
 if(id==='reputation'){if(window.BLISReputation?.render)return window.BLISReputation.render();return fallback(id)}
 if(id==='market'){if(window.BLISPerceptionMap?.mount)return window.BLISPerceptionMap.mount();return fallback(id)}
 if(id==='competition'){if(window.BLISCompetitionMasterV5?.render){const r=window.BLISCompetitionMasterV5.render();try{window.BLISCompetitionIntelligenceV9?.enhance?.()}catch(_){}try{window.BLISCompetitionEnvironmentV10?.render?.()}catch(_){}try{window.BLISCompetitionPageV11?.apply?.()}catch(_){}try{window.BLISCompetitionPageV12?.enhance?.()}catch(_){}document.body.classList.add('blis-competition-ready');return r}return fallback(id)}
 if(['reports','history','profile','settings','help'].includes(id))return renderUtility(id);
 }catch(e){console.warn('BLIS route fallback',id,e?.message||e);return fallback(id,'Модулът се възстановява.')}
 return fallback(id)}
window.refGo=function(id){id=canonical(id);id=IDS.has(id)?id:'overview';activate(id);nav();const out=renderRoute(id);window.dispatchEvent(new CustomEvent('blis:routechange',{detail:{page:id}}));window.scrollTo({top:0,behavior:'smooth'});return out};window.refGo.__blisCanonicalClientRouter=true;window.BLISRouteAlias=canonical;
window.BLISCanonicalRenderActive=function(){const id=canonical(document.querySelector('.page.active')?.id||'overview');return renderRoute(IDS.has(id)?id:'overview')};
function syncGlobals(){try{window.D=D}catch(_){}try{window.S=S}catch(_){}try{window.Q=Q}catch(_){}try{window.A=A}catch(_){}try{window.H=H}catch(_){}}
function boot(){ensurePages();syncGlobals();nav();const q=canonical(new URLSearchParams(location.search).get('page')),active=canonical(document.querySelector('.page.active')?.id),id=IDS.has(q)?q:(IDS.has(active)?active:'overview');activate(id);nav();renderRoute(id);window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{syncGlobals();nav();window.BLISCanonicalRenderActive()}));window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>window.BLISCanonicalRenderActive()))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
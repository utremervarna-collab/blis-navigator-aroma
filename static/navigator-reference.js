/* BLIS Navigator — canonical router v17.
   One route, one owner. Signals, Reputation and Risk use Visual Special v2. */
(function(){
'use strict';
if(window.__BLIS_REFERENCE_V17)return;window.__BLIS_REFERENCE_V17=true;
const NAV=[
 ['overview','▦','Общ преглед'],['social','!','Важни сигнали'],['market','◌','Пазар и нагласи'],
 ['digital','◎','Дигитална видимост'],['reputation','◇','Репутация'],['competition','⚑','Конкуренция'],
 ['opportunities','↗','Риск и възможности'],['history','◷','История'],['reports','▤','Доклади']
];
const IDS=new Set(NAV.map(x=>x[0]));
const ALIAS={signals:'social',timeline:'history',live:'overview'};
const canonical=id=>ALIAS[String(id||'')]||String(id||'');
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const currentClient=()=>{try{return window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma'}catch(_){return document.body?.dataset?.client||'aroma'}};
function ensurePages(){const shell=document.querySelector('.shell');if(!shell)return;NAV.forEach(([id])=>{if(document.getElementById(id))return;const s=document.createElement('section');s.id=id;s.className='page';s.innerHTML=`<div id="${id}Body"></div>`;shell.appendChild(s)})}
function nav(){const n=document.getElementById('nav');if(!n)return;const active=document.querySelector('.page.active')?.id||'overview';n.innerHTML=NAV.map(([id,icon,label])=>`<button type="button" data-page="${id}" class="${id===active?'active':''}"><span class="navico">${icon}</span><span class="navtxt">${E(label)}</span></button>`).join('')}
function activate(id,mode='replace'){id=canonical(id);if(!IDS.has(id))id='overview';ensurePages();document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('#nav [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));if(mode)try{const u=new URL(location.href);u.searchParams.set('client',currentClient());u.searchParams.set('page',id);u.hash='';history[mode+'State']({page:id},'',u.pathname+u.search)}catch(_){}return id}
function host(id){return id==='overview'?document.getElementById('overviewPremium'):(document.getElementById(id+'Body')||document.getElementById(id))}
function fallback(id,msg='Модулът се зарежда.'){const h=host(id);if(!h)return;if((h.innerText||'').trim().length>20)return;const label=NAV.find(x=>x[0]===id)?.[2]||'BLIS Navigator';h.innerHTML=`<div class="ref-title"><h2>${E(label)}</h2></div><div class="scan">${E(msg)}</div>`}
function renderOwned(id){try{
 if(['social','reputation','opportunities'].includes(id)){if(window.BLISVisualSpecialV2?.render)return window.BLISVisualSpecialV2.render(id);return fallback(id,'Интерактивната визуализация се подготвя.');}
 if(id==='overview'){if(window.BLISOverviewSystemV4?.render)return window.BLISOverviewSystemV4.render();return fallback(id,'Обобщението се подготвя.');}
 if(id==='market'){if(window.BLISMarketSystemV1?.mount)return window.BLISMarketSystemV1.mount();if(window.BLISPerceptionMap?.mount)return window.BLISPerceptionMap.mount();return fallback(id,'Пазарният контекст се подготвя.');}
 if(id==='digital'){if(window.BLISDigitalRadar?.render)return window.BLISDigitalRadar.render();return fallback(id,'Дигиталната видимост се подготвя.');}
 if(['competition','history','reports'].includes(id)){if(window.BLISExecutiveUIV2?.render)return window.BLISExecutiveUIV2.render(id);return fallback(id,'Executive модулът се подготвя.');}
 }catch(e){console.error('BLIS route owner error',id,e);fallback(id,'Модулът се възстановява.')}}
function after(id){if(id==='market')[80,260].forEach(ms=>setTimeout(()=>{try{window.BLISPerceptionMap?.render?.()}catch(_){}},ms));if(id==='reports')[140,420].forEach(ms=>setTimeout(()=>{try{window.BLISExecutiveReportsV1?.enhance?.()}catch(_){}},ms));setTimeout(()=>window.BLISSystemStructure?.decorate?.(id),90)}
function go(id,mode){id=canonical(id);if(!IDS.has(id))id='overview';const current=canonical(document.querySelector('.page.active')?.id||'');activate(id,mode||(current===id?'replace':'push'));nav();renderOwned(id);after(id);window.dispatchEvent(new CustomEvent('blis:routechange',{detail:{page:id}}));window.scrollTo({top:0,behavior:'auto'});return id}
window.refGo=id=>go(id);window.refGo.__blisCanonicalClientRouter=true;window.BLISCanonicalRenderActive=()=>{const id=canonical(document.querySelector('.page.active')?.id||'overview');renderOwned(IDS.has(id)?id:'overview');after(id)};window.BLISRouteAlias=canonical;
function bind(){if(window.__BLIS_NAV_STABLE_V7)return;window.__BLIS_NAV_STABLE_V7=true;document.addEventListener('click',e=>{const b=e.target.closest?.('#nav button[data-page]');if(!b)return;e.preventDefault();e.stopPropagation();go(b.dataset.page)},true)}
function boot(){ensurePages();nav();bind();const q=canonical(new URLSearchParams(location.search).get('page'));go(IDS.has(q)?q:'overview','replace');window.addEventListener('popstate',()=>{const q=canonical(new URLSearchParams(location.search).get('page'));go(IDS.has(q)?q:'overview',false)});window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>window.BLISCanonicalRenderActive()));window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>window.BLISCanonicalRenderActive()));window.addEventListener('blis:executive-data',()=>{const id=document.querySelector('.page.active')?.id;if(['competition','opportunities','history'].includes(id))requestAnimationFrame(()=>window.BLISCanonicalRenderActive())})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
/* Wirello Market — page/render stability v2.
   Fills Navigator V15 routes that have no active renderer branch and keeps
   chart containers stable without globally rewriting SVG content. */
(function(){
'use strict';
if(window.__WIRELLO_PAGE_STABILITY_V2)return;window.__WIRELLO_PAGE_STABILITY_V2=true;

const isWirello=()=>document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const activeId=()=>document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';
const data=()=>window.__WIRELLO_DATA||{};

function style(){
 if(document.getElementById('wirello-page-stability-v2-style'))return;
 const s=document.createElement('style');s.id='wirello-page-stability-v2-style';s.textContent=`
 body[data-client="wirello"] .page.active{visibility:visible!important;min-height:560px}
 body[data-client="wirello"] #competitionBody{visibility:visible!important}
 body[data-client="wirello"] .n15-smoothchart,body[data-client="wirello"] .wirello-stable-curve{display:block!important;width:100%!important;height:100%!important;min-height:0!important;max-width:100%;overflow:visible}
 body[data-client="wirello"] .n15-curvearea,body[data-client="wirello"] .n15-digchart,body[data-client="wirello"] .chart{min-height:170px;overflow:hidden}
 body[data-client="wirello"] .wfix-page{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#142033}
 body[data-client="wirello"] .wfix-head{margin:4px 0 18px}.wfix-head small{display:block;font-size:8px;font-weight:850;letter-spacing:.12em;color:#8490a1;text-transform:uppercase}.wfix-head h2{margin:5px 0 0;font-size:30px;letter-spacing:-.045em;color:#0c1830}.wfix-head p{margin:7px 0 0;max-width:820px;color:#768396;font-size:11px;line-height:1.55}
 body[data-client="wirello"] .wfix-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.wfix-card{border:1px solid #e4eaf1;border-radius:18px;background:#fff;box-shadow:0 14px 36px rgba(21,38,67,.055);padding:20px}.wfix-card h3{margin:0 0 8px;font-size:15px;color:#17324c}.wfix-card p{margin:0;color:#6f8094;font-size:10.5px;line-height:1.6}.wfix-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.wfix-kpi{padding:14px;border-radius:13px;background:#f7f9fc;border:1px solid #e7edf3}.wfix-kpi strong{display:block;font:600 25px Georgia,serif;color:#173b63}.wfix-kpi span{display:block;margin-top:5px;font-size:9px;color:#7d8b9d}.wfix-list{display:grid;gap:8px;margin-top:10px}.wfix-row{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid #edf1f4;font-size:10px}.wfix-row:last-child{border-bottom:0}.wfix-row b{color:#2b4055}.wfix-row span{color:#7b8998;text-align:right}
 @media(max-width:820px){body[data-client="wirello"] .wfix-grid{grid-template-columns:1fr}.wfix-kpis{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}

function clearOldChartOverlay(){
 document.getElementById('wirello-chart-upgrade-style')?.remove();
 document.querySelectorAll('.wirello-analytical-grid,.wirello-chart-source').forEach(x=>x.remove());
 document.querySelectorAll('.wirello-bars-upgraded').forEach(x=>x.classList.remove('wirello-bars-upgraded'));
}

function reveal(){
 document.getElementById('blisPrepaintGuard')?.remove();
 const p=document.querySelector('.page.active');if(p)p.style.visibility='visible';
 if(activeId()==='competition')document.body.classList.add('blis-competition-ready');
 const c=document.getElementById('competitionBody');if(c&&activeId()==='competition')c.style.visibility='visible';
}

function call(name,...args){
 try{
  const fn=window[name];if(typeof fn!=='function')return false;
  const out=fn(...args);if(out&&typeof out.catch==='function')out.catch(e=>console.warn('Wirello '+name,e));
  return true;
 }catch(e){console.warn('Wirello '+name,e);return false}
}

function fallbackReputation(){
 const host=document.getElementById('reputationBody');if(!host||host.textContent.trim().length>80)return;
 const d=data().dashboard||window.D||{},idx=(d.indices||[]).find(x=>x.key==='reputation')?.value??79.6;
 host.innerHTML=`<div class="wfix-page"><div class="wfix-head"><small>REPUTATION INTELLIGENCE</small><h2>Репутация</h2><p>Публични оценки, мнения, повтарящи се теми и репутационни сигнали за Wirello Market.</p></div><div class="wfix-grid"><div class="wfix-card"><h3>Текуща репутационна оценка</h3><div class="wfix-kpis"><div class="wfix-kpi"><strong>${esc(idx)}</strong><span>Репутационен индекс</span></div><div class="wfix-kpi"><strong>4.42</strong><span>Демонстрационен рейтинг</span></div><div class="wfix-kpi"><strong>93%</strong><span>Увереност на водещия риск</span></div></div></div><div class="wfix-card"><h3>Водещ сигнал</h3><p>Нарастват оплакванията за чакане на касите. Сигналът е потвърден в четири магазина и има 37 доказателства в демонстрационния набор.</p></div></div></div>`;
}

function renderReputationPage(){
 const host=document.getElementById('reputationBody');if(!host)return;
 let rendered=false;
 try{
  if(typeof window.BLISReputation?.render==='function'){
   window.BLISReputation.render();rendered=true;
  }else if(typeof window.BLISReputationMaster?.render==='function'){
   window.BLISReputationMaster.render();rendered=true;
  }
 }catch(e){console.warn('Wirello reputation current renderer',e)}
 if(!rendered&&host.textContent.trim().length<80)call('renderReputation');
 setTimeout(()=>{
  try{window.BLISReputationExactArtV47?.apply?.()}catch(e){console.warn('Wirello reputation artwork',e)}
  fallbackReputation();
 },60);
}

async function renderReportsPage(){
 const host=document.getElementById('reportsBody');if(!host)return;
 call('renderReports');
 setTimeout(()=>{
  if(host.textContent.trim().length>80)return;
  const rows=data().reports||[];
  host.innerHTML=`<div class="wfix-page"><div class="wfix-head"><small>ANALYTICAL OUTPUTS</small><h2>Месечни доклади</h2><p>Периодични аналитични продукти от наблюдението на Wirello Market.</p></div><div class="wfix-grid">${(rows.length?rows:[{title:'Wirello Market — месечно аналитично обобщение',period:'Последните 30 дни'},{title:'Конкурентен snapshot',period:'Текущ период'}]).map(x=>`<div class="wfix-card"><h3>${esc(x.title||'Аналитичен доклад')}</h3><p>${esc(x.period||'Текущ период')}</p></div>`).join('')}</div></div>`;
 },120);
}

function renderProfilePage(){
 const host=document.getElementById('profileBody');if(!host)return;
 call('renderProfile');
 setTimeout(()=>{
  if(host.textContent.trim().length>100)return;
  const d=data(),src=d.sources||window.S||[],act=d.activity||window.A||[],hist=d.history||window.H||[];
  host.innerHTML=`<div class="wfix-page"><div class="wfix-head"><small>CLIENT PROFILE</small><h2>Wirello Market</h2><p>MASTER DEMO профил за омниканален ритейл / FMCG със синтетични демонстрационни данни.</p></div><div class="wfix-grid"><div class="wfix-card"><h3>Аналитичен профил</h3><div class="wfix-kpis"><div class="wfix-kpi"><strong>${src.length||24}</strong><span>Източници</span></div><div class="wfix-kpi"><strong>${act.length||'—'}</strong><span>Измервания</span></div><div class="wfix-kpi"><strong>${hist.length||180}</strong><span>Исторически точки</span></div></div></div><div class="wfix-card"><h3>Обхват на демото</h3><div class="wfix-list"><div class="wfix-row"><b>Сектор</b><span>Омниканален ритейл / FMCG</span></div><div class="wfix-row"><b>Профил</b><span>Синтетичен MASTER DEMO</span></div><div class="wfix-row"><b>Конкуренти</b><span>VestaMart, Nordela, UrbanBasket, Fresco Point</span></div></div></div></div></div>`;
 },40);
}

function renderSettings(){
 const host=document.getElementById('settingsBody');if(!host||host.dataset.wfix==='1')return;host.dataset.wfix='1';
 host.innerHTML=`<div class="wfix-page"><div class="wfix-head"><small>SYSTEM SETTINGS</small><h2>Настройки</h2><p>Текущи параметри на демонстрационния профил. Тук не се променят източници или клиентски данни.</p></div><div class="wfix-grid"><div class="wfix-card"><h3>Профил</h3><div class="wfix-list"><div class="wfix-row"><b>Клиент</b><span>Wirello Market</span></div><div class="wfix-row"><b>Период</b><span>Последните 30 дни</span></div><div class="wfix-row"><b>Тип данни</b><span>Синтетични демонстрационни</span></div></div></div><div class="wfix-card"><h3>Режим на Navigator</h3><p>Автоматично обновяване на визуализациите, активен historical baseline и Wirello-only защитен клиентски обхват.</p></div></div></div>`;
}

function renderHelp(){
 const host=document.getElementById('helpBody');if(!host||host.dataset.wfix==='1')return;host.dataset.wfix='1';
 host.innerHTML=`<div class="wfix-page"><div class="wfix-head"><small>NAVIGATOR HELP</small><h2>Помощ</h2><p>Кратки насоки за демонстрационния Navigator.</p></div><div class="wfix-grid"><div class="wfix-card"><h3>Как да четеш индексите</h3><p>Стойностите са на скала 0–100 и се разглеждат заедно с тенденцията и историческата база. В Wirello всички стойности са демонстрационни.</p></div><div class="wfix-card"><h3>Как да четеш сигналите</h3><p>Сигналите показват промяна, посока, източник и увереност. Те не са автоматично препоръка, а вход за аналитична интерпретация.</p></div><div class="wfix-card"><h3>Конкуренти</h3><p>Съпоставката използва еднаква демонстрационна логика за всички наблюдавани компании.</p></div><div class="wfix-card"><h3>История</h3><p>Историческата база показва устойчивостта на тенденциите и различава еднократните колебания от трайни движения.</p></div></div></div>`;
}

function normalizeCharts(){
 clearOldChartOverlay();
 document.querySelectorAll('.n15-smoothchart,.wirello-stable-curve').forEach(svg=>{svg.style.width='100%';svg.style.height='100%';svg.style.minHeight='0';svg.style.display='block'});
}

function ensure(id=activeId()){
 if(!isWirello())return;style();reveal();
 if(id==='reputation')renderReputationPage();
 else if(id==='reports')renderReportsPage();
 else if(id==='profile')renderProfilePage();
 else if(id==='settings')renderSettings();
 else if(id==='help')renderHelp();
 normalizeCharts();
}

function schedule(){[0,60,180,420,900].forEach(ms=>setTimeout(()=>ensure(),ms))}
function init(){if(!isWirello())return;style();renderSettings();renderHelp();schedule();setTimeout(()=>{renderReputationPage();renderProfilePage();renderReportsPage()},120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page]'))schedule()},true);
window.addEventListener('popstate',schedule);window.addEventListener('hashchange',schedule);
window.addEventListener('blis:clientdata',()=>setTimeout(schedule,20));
})();
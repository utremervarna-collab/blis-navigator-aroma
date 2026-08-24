/* BLIS Navigator — canonical production router v3. */
(function(){
'use strict';
if(window.__BLIS_REFERENCE_V3)return;window.__BLIS_REFERENCE_V3=true;

const NAV=[
  ['overview','▦','Общ преглед'],['live','◉','Live Monitoring'],['social','⌁','Сигнали'],
  ['digital','◎','Дигитална видимост'],['reputation','◇','Репутация'],['market','◌','Нагласи'],
  ['competition','⚑','Конкуренти'],['reports','▤','Месечни доклади'],['history','◷','История'],
  ['profile','♙','Клиентски профил'],['settings','⚙','Настройки'],['help','?','Помощ']
];
const IDS=new Set([...NAV.map(x=>x[0]),'commerce']);
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const arr=x=>Array.isArray(x)?x:[];
const clientName=()=>{try{return window.D?.name||D?.name||document.querySelector('.client-brand-name')?.textContent||'Клиент'}catch(_){return document.querySelector('.client-brand-name')?.textContent||'Клиент'}};
const clientSector=()=>{try{return window.D?.sector||D?.sector||document.querySelector('.client-brand-type')?.textContent||'Аналитичен профил'}catch(_){return document.querySelector('.client-brand-type')?.textContent||'Аналитичен профил'}};

function ensurePages(){
  const shell=document.querySelector('.shell');if(!shell)return;
  [...NAV.map(x=>x[0]),'commerce'].forEach(id=>{if(document.getElementById(id))return;const s=document.createElement('section');s.id=id;s.className='page';s.innerHTML=`<div id="${id}Body"></div>`;shell.appendChild(s)});
}
function nav(){
  const n=document.getElementById('nav');if(!n)return;
  const active=document.querySelector('.page.active')?.id||'overview';
  const sig=NAV.map(([id,icon,label])=>`${id}|${icon}|${label}|${id===active?'1':'0'}`).join(';');
  if(n.dataset.refv3Sig===sig)return;
  n.innerHTML=NAV.map(([id,icon,label])=>`<button data-page="${id}" class="${id===active?'active':''}"><span class="navico">${icon}</span><span class="navtxt">${E(label)}</span></button>`).join('');
  n.dataset.refv3Sig=sig;
  n.querySelectorAll('button[data-page]').forEach(b=>b.onclick=()=>window.refGo(b.dataset.page));
}
function activate(id){
  ensurePages();if(!IDS.has(id))id='overview';
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  try{const u=new URL(location.href);u.searchParams.set('client',new URLSearchParams(location.search).get('client')||window.BLIS_INITIAL_CLIENT||document.body?.dataset?.client||'aroma');u.searchParams.set('page',id);u.hash='';history.replaceState({page:id},'',u.pathname+u.search)}catch(_){}
}
function host(id){return id==='overview'?document.getElementById('overviewPremium'):(document.getElementById(id+'Body')||document.getElementById(id))}
function head(title,sub){return `<div class="ref-title"><h2>${E(title)}</h2><p>${E(sub)}</p></div>`}
function empty(text){return `<div class="scan">${E(text)}</div>`}
function fallback(id){const h=host(id);if(!h)return;const label=id==='commerce'?'Услуги и плащане':(NAV.find(x=>x[0]===id)?.[2]||'BLIS Navigator');h.innerHTML=head(label,`${clientName()} · ${clientSector()}`)+empty('Модулът не е готов за визуализация.')}
function renderUtility(id){
  if(window.BLISUtilityPages?.owns?.(id))return window.BLISUtilityPages.mount(id);
  if(id==='reports'&&typeof window.renderReports==='function')return window.renderReports();
  if(id==='history'&&typeof window.renderHistory==='function')return window.renderHistory();
  if(id==='profile'&&typeof window.renderProfile==='function')return window.renderProfile();
  if(id==='settings'&&typeof window.renderSettings==='function')return window.renderSettings();
  if(id==='help'&&typeof window.renderHelp==='function')return window.renderHelp();
  fallback(id);
}
function renderRoute(id){
  try{
    if(id==='commerce'){
      if(window.BLISCommerceSafe?.render)return window.BLISCommerceSafe.render();
      return fallback(id);
    }
    if(id==='overview'){
      if(window.BLISOverviewMaster?.render)return window.BLISOverviewMaster.render();
      if(typeof window.renderOverview==='function')return window.renderOverview();
    }
    if(id==='live'){
      if(typeof window.BLISLiveMount==='function')return window.BLISLiveMount();
      if(typeof window.renderLive==='function')return window.renderLive();
    }
    if(id==='social'){
      if(typeof window.BLISSocialSignalsRender==='function')return window.BLISSocialSignalsRender();
      if(typeof window.renderSocial==='function')return window.renderSocial();
    }
    if(id==='digital'){
      if(window.BLISDigitalRadar?.render)return window.BLISDigitalRadar.render();
      if(typeof window.renderDigital==='function')return window.renderDigital();
    }
    if(id==='reputation'){
      if(window.BLISReputation?.render)return window.BLISReputation.render();
      if(window.BLISReputationStableV33?.run)return window.BLISReputationStableV33.run(true);
      if(typeof window.renderReputation==='function')return window.renderReputation();
    }
    if(id==='market'){
      if(window.BLISPerceptionMap?.mount)return window.BLISPerceptionMap.mount();
      if(typeof window.renderMarket==='function')return window.renderMarket();
    }
    if(id==='competition'){
      if(window.BLISCompetitionMasterV5?.render){
        const r=window.BLISCompetitionMasterV5.render();
        try{window.BLISCompetitionIntelligenceV9?.enhance?.()}catch(_){}
        try{window.BLISCompetitionEnvironmentV10?.render?.()}catch(_){}
        try{window.BLISCompetitionPageV11?.apply?.()}catch(_){}
        try{window.BLISCompetitionPageV12?.enhance?.()}catch(_){}
        document.body.classList.add('blis-competition-ready');
        return r;
      }
      if(typeof window.renderCompetition==='function')return window.renderCompetition();
    }
    if(['reports','history','profile','settings','help'].includes(id))return renderUtility(id);
  }catch(e){console.error('BLIS route failed',id,e)}
  fallback(id);
}
window.refGo=function(id){id=IDS.has(id)?id:'overview';activate(id);nav();const out=renderRoute(id);window.scrollTo({top:0,behavior:'smooth'});return out};
window.refGo.__blisCanonicalClientRouter=true;
window.BLISCanonicalRenderActive=function(){const id=document.querySelector('.page.active')?.id||'overview';return renderRoute(IDS.has(id)?id:'overview')};
function syncGlobals(){try{window.D=D}catch(_){}try{window.S=S}catch(_){}try{window.Q=Q}catch(_){}try{window.A=A}catch(_){}try{window.H=H}catch(_){}}
function boot(){ensurePages();syncGlobals();nav();const q=new URLSearchParams(location.search).get('page');const active=document.querySelector('.page.active')?.id;const id=IDS.has(q)?q:(IDS.has(active)?active:'overview');activate(id);renderRoute(id);window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{syncGlobals();nav();window.BLISCanonicalRenderActive()}));window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>window.BLISCanonicalRenderActive()))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

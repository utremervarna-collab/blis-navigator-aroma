/* BLIS Navigator — stability preload v14. Stable routes, labels and single-pass page paint. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV14)return;window.__BLISStabilityPreloadV14=true;

const stats=window.BLISStabilityStats={
  blockedIntervals:0,blockedTimeouts:0,blockedNavRebuilds:0,blockedNavLabelWrites:0,
  navRepairs:0,marketRepairs:0
};
const nativeSetInterval=window.setInterval.bind(window);
const nativeSetTimeout=window.setTimeout.bind(window);
const nativeInnerHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
const nativeTextContent=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
const fnText=fn=>{try{return typeof fn==='function'?Function.prototype.toString.call(fn):String(fn||'')}catch(_){return''}};

function isLegacyRepaintInterval(fn,delay){
  const d=Number(delay)||0,name=typeof fn==='function'?(fn.name||''):'',src=fnText(fn);
  if(d===120&&(name==='tick'||/copy\(\);\s*rep\(\);\s*market\(\);\s*competition\(\)/.test(src)))return true;
  if(d===120&&/wrapRefGo\(\)/.test(src)&&/BLISDigitalInteractionsPatch/.test(src))return true;
  if(d===140&&/n\+\+/.test(src)&&/patch\(\)/.test(src)&&/n>35/.test(src))return true;
  if(d===160&&/n\+\+/.test(src)&&/patch\(\)/.test(src)&&/n>25/.test(src))return true;
  if(d===180&&/wrapAll\(\)/.test(src)&&/ticks\+\+/.test(src)&&/bodyComplete\(\)/.test(src))return true;
  if(d===700&&(name==='patchAll'||/patchOverview\(\).*patchLive\(\).*patchCompetition\(\)/s.test(src)))return true;
  if(d===1000&&/marketInsights\(\)/.test(src)&&/installRouter\(\)/.test(src))return true;
  if(d===1000&&name==='tick'&&/mount\(\)/.test(src)&&/att-v2-clock/.test(src))return true;
  if(d===1200&&/enhance\(\)/.test(src))return true;
  return false;
}
window.setInterval=function(fn,delay,...args){
  if(isLegacyRepaintInterval(fn,delay)){stats.blockedIntervals++;return 0}
  return nativeSetInterval(fn,delay,...args);
};
window.setTimeout=function(fn,delay,...args){
  const d=Number(delay)||0,name=typeof fn==='function'?(fn.name||''):'',src=fnText(fn);
  if((d===90||d===240)&&name==='renderActive'){stats.blockedTimeouts++;return 0}
  if(d===90&&name==='competitionTune'){stats.blockedTimeouts++;return 0}
  if(d===700&&name==='boot'&&/ensurePages\(\)/.test(src)&&/refGo\('overview'\)/.test(src)){stats.blockedTimeouts++;return 0}
  if(d===1000&&/getElementById\(['"]social['"]\)/.test(src)&&/classList\.contains\(['"]active['"]\)/.test(src)&&/render\(\)/.test(src)){stats.blockedTimeouts++;return 0}
  if([120,650,3000,900,1800,4500].includes(d)&&name==='patch'&&/makeKpisInteractive\(root\)/.test(src)&&/restorePriorCurve\(root\)/.test(src)){stats.blockedTimeouts++;return 0}
  if([0,80,240,650,1200,2200,3800].includes(d)&&/renderNow\(i===0\)/.test(src)){stats.blockedTimeouts++;return 0}
  if([20,40,180,220].includes(d)&&name==='render'&&/digitalBody/.test(src)&&/dv-shell/.test(src)){stats.blockedTimeouts++;return 0}
  if([20,40,180,220].includes(d)&&/BLISDigitalRadar/.test(src)&&/BLISDigitalInteractionsPatch/.test(src)){stats.blockedTimeouts++;return 0}
  if(d===40&&/BLISDigitalInteractionsPatch/.test(src)){stats.blockedTimeouts++;return 0}
  return nativeSetTimeout(fn,delay,...args);
};

const FINAL_NAV=[
  ['overview','Общ преглед'],['live','Live Monitoring'],['social','Сигнали'],['digital','Видимост'],
  ['reputation','Репутация'],['market','Нагласи'],['competition','Конкуренти'],['reports','Месечни доклади'],
  ['history','История'],['profile','Клиентски профил'],['settings','Настройки'],['help','Помощ']
];
const finalIds=new Set(FINAL_NAV.map(x=>x[0]));
const finalLabel=new Map(FINAL_NAV);
let navObserver=null,navBusy=false,marketObserver=null,marketBusy=false;

function ensureBodyVisible(id){
  const host=document.getElementById(id+'Body');if(!host)return;
  host.style.setProperty('display','block','important');
  host.style.setProperty('width','100%','important');
  host.style.setProperty('min-width','0','important');
  host.style.setProperty('visibility','visible','important');
  host.style.setProperty('opacity','1','important');
}
const ensureLiveVisible=()=>ensureBodyVisible('live');
const ensureSocialVisible=()=>ensureBodyVisible('social');
const ensureDigitalVisible=()=>ensureBodyVisible('digital');
function activatePage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
}
function mountLive(){
  ensureLiveVisible();
  try{if(typeof window.BLISLiveMount==='function')window.BLISLiveMount()}catch(_){ }
  ensureLiveVisible();
}
function mountSocial(){
  ensureSocialVisible();
  if(typeof window.BLISSocialSignalsRender!=='function')return null;
  try{return window.BLISSocialSignalsRender()}catch(_){return null}
}
function finalizeSocial(){
  ensureSocialVisible();
  try{if(typeof window.BLISSocialInteractivePatch==='function')window.BLISSocialInteractivePatch()}catch(_){ }
  ensureSocialVisible();
  activatePage('social');
  window.scrollTo({top:0,behavior:'smooth'});
}
function mountDigital(){
  ensureDigitalVisible();
  try{window.BLISDigitalRadar?.render?.()}catch(_){ }
  try{window.BLISDigitalInteractionsPatch?.()}catch(_){ }
  ensureDigitalVisible();
  activatePage('digital');
  window.scrollTo({top:0,behavior:'smooth'});
}
function canonicalAfterRoute(id){
  if(id==='live')nativeSetTimeout(mountLive,0);
}
function canonicalNavHandler(e){
  e?.preventDefault?.();
  const id=this?.dataset?.page;if(!id)return;
  if(id==='social'&&typeof window.BLISSocialSignalsRender==='function'){
    const result=mountSocial();
    if(result&&typeof result.then==='function'){
      return result.then(()=>{finalizeSocial();return result}).catch(()=>{ensureSocialVisible();activatePage('social')});
    }
    finalizeSocial();return result;
  }
  if(id==='digital'&&window.BLISDigitalRadar?.render){mountDigital();return}
  if(id==='live')ensureLiveVisible();
  let result;
  if(typeof window.refGo==='function')result=window.refGo(id);
  else if(typeof window.go==='function')result=window.go(id);
  canonicalAfterRoute(id);
  return result;
}
canonicalNavHandler.__blisCanonicalNav=true;
function bindNavRoutes(nav){
  nav?.querySelectorAll('button[data-page]').forEach(b=>{
    if(b.onclick?.__blisCanonicalNav)return;
    b.onclick=canonicalNavHandler;
  });
}

function normalizeNavHTML(html){
  const box=document.createElement('div');nativeInnerHTML.set.call(box,String(html??''));
  const buttons=[...box.querySelectorAll('button[data-page]')];if(!buttons.length)return String(html??'');
  let changed=false;
  buttons.forEach(b=>{if(!finalIds.has(b.dataset.page)){b.remove();changed=true}});
  const map=new Map([...box.querySelectorAll('button[data-page]')].map(b=>[b.dataset.page,b]));
  FINAL_NAV.forEach(([id,label])=>{const b=map.get(id);if(!b)return;const t=b.querySelector('.navtxt')||b.querySelector('span:last-child');if(t&&t.textContent!==label){t.textContent=label;changed=true}});
  if(changed)stats.blockedNavRebuilds++;
  return nativeInnerHTML.get.call(box);
}
function protectNavLabelWrites(nav){
  if(!nav||!nativeTextContent)return;
  nav.querySelectorAll('button[data-page]').forEach(b=>{
    const label=finalLabel.get(b.dataset.page);if(!label)return;
    const t=b.querySelector('.navtxt')||b.querySelector('span:last-child');if(!t||t.__blisLabelProtected)return;
    Object.defineProperty(t,'textContent',{
      configurable:true,enumerable:false,
      get(){return nativeTextContent.get.call(this)},
      set(v){
        const current=nativeTextContent.get.call(this),requested=String(v??'');
        if(requested!==label)stats.blockedNavLabelWrites++;
        if(current===label)return;
        nativeTextContent.set.call(this,label);
      }
    });
    t.__blisLabelProtected=true;
    if(nativeTextContent.get.call(t)!==label)nativeTextContent.set.call(t,label);
  });
}
function protectNavWrites(){
  const nav=document.getElementById('nav');if(!nav)return;
  if(!nav.__blisWriteProtected){
    nav.__blisWriteProtected=true;
    Object.defineProperty(nav,'innerHTML',{
      configurable:true,enumerable:false,
      get(){return nativeInnerHTML.get.call(nav)},
      set(v){nativeInnerHTML.set.call(nav,normalizeNavHTML(v));protectNavLabelWrites(nav);bindNavRoutes(nav)}
    });
  }
  protectNavLabelWrites(nav);bindNavRoutes(nav);
}
function stabilizeNav(){
  const nav=document.getElementById('nav');if(!nav||navBusy)return;
  navBusy=true;let changed=false;
  try{
    nav.querySelectorAll('button[data-page]').forEach(b=>{if(!finalIds.has(b.dataset.page)){b.remove();changed=true}});
    const byId=new Map([...nav.querySelectorAll('button[data-page]')].map(b=>[b.dataset.page,b]));
    FINAL_NAV.forEach(([id,label])=>{
      const b=byId.get(id);if(!b)return;
      const t=b.querySelector('.navtxt')||b.querySelector('span:last-child');
      if(t&&nativeTextContent.get.call(t)!==label){nativeTextContent.set.call(t,label);changed=true}
    });
    protectNavLabelWrites(nav);bindNavRoutes(nav);
    const order=[...nav.querySelectorAll('button[data-page]')].map(b=>b.dataset.page);
    nav.dataset.blisStable=order.length===FINAL_NAV.length&&FINAL_NAV.every((x,i)=>order[i]===x[0])?'1':'0';
  }finally{navBusy=false;if(changed)stats.navRepairs++}
}
function watchNav(){
  const nav=document.getElementById('nav');if(!nav)return;
  protectNavWrites();stabilizeNav();
  if(navObserver)return;
  navObserver=new MutationObserver(()=>{protectNavWrites();stabilizeNav()});
  navObserver.observe(nav,{childList:true,subtree:true,characterData:true});
}

function stabilizeMarketTerminology(){
  const root=document.getElementById('marketBody');if(!root||marketBusy)return;
  marketBusy=true;let changed=false;
  try{
    const h=root.querySelector('.pm-hero h2');if(h&&h.textContent!=='Нагласи'){h.textContent='Нагласи';changed=true}
    const p=root.querySelector('.pm-hero p');if(p&&/възприяти/i.test(p.textContent||'')){p.textContent='Проверими теми, сигнали и връзки, които оформят нагласите към марката.';changed=true}
    const mh=root.querySelector('.pm-maphead b');if(mh&&mh.textContent!=='НАГЛАСИ В РЕАЛНО ВРЕМЕ'){mh.textContent='НАГЛАСИ В РЕАЛНО ВРЕМЕ';changed=true}
    const a=document.getElementById('blisActiveModule');if(document.getElementById('market')?.classList.contains('active')&&a&&a.textContent!=='Нагласи'){a.textContent='Нагласи';changed=true}
    const d=document.getElementById('blisSystemDetail');if(document.getElementById('market')?.classList.contains('active')&&d&&/възприят/i.test(d.textContent||'')){d.textContent='Проверими теми, връзки, динамика и източници';changed=true}
  }finally{marketBusy=false;if(changed)stats.marketRepairs++}
}
function watchMarket(){
  const root=document.getElementById('marketBody');if(!root)return;
  stabilizeMarketTerminology();
  if(marketObserver)return;
  marketObserver=new MutationObserver(stabilizeMarketTerminology);
  marketObserver.observe(root,{childList:true,subtree:true});
}
function keepBodiesPainted(){
  ['reputationBody','marketBody','competitionBody'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    el.style.setProperty('visibility','visible','important');
    el.style.setProperty('opacity','1','important');
  });
}
function boot(){
  const st=document.createElement('style');st.id='blisStabilityPreloadCSS';st.textContent='#nav[data-blis-stable="0"]{opacity:0!important}#nav[data-blis-stable="1"]{opacity:1!important}#nav{transition:none!important}#live.page.active #liveBody,#social.page.active #socialBody,#digital.page.active #digitalBody{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;min-width:0!important}';document.head.appendChild(st);
  ensureLiveVisible();ensureSocialVisible();ensureDigitalVisible();protectNavWrites();watchNav();watchMarket();keepBodiesPainted();
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#nav [data-page]');if(!b)return;
    if(b.dataset.page==='live')ensureLiveVisible();
    if(b.dataset.page==='social')ensureSocialVisible();
    if(b.dataset.page==='digital')ensureDigitalVisible();
    requestAnimationFrame(()=>{protectNavWrites();stabilizeNav();stabilizeMarketTerminology();keepBodiesPainted();if(b.dataset.page==='live')ensureLiveVisible();if(b.dataset.page==='social')ensureSocialVisible();if(b.dataset.page==='digital')ensureDigitalVisible()});
  },true);
  window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{protectNavWrites();stabilizeNav();stabilizeMarketTerminology();keepBodiesPainted();ensureLiveVisible();ensureSocialVisible();ensureDigitalVisible()}));
  window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>{stabilizeMarketTerminology();keepBodiesPainted()}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

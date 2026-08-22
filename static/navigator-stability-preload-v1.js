/* BLIS Navigator — stability preload v7 (canonical nav routing + pre-paint protection). */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV7)return;window.__BLISStabilityPreloadV7=true;

const stats=window.BLISStabilityStats={
  blockedIntervals:0,blockedTimeouts:0,blockedNavRebuilds:0,blockedNavLabelWrites:0,
  navRepairs:0,marketRepairs:0,overviewMutationTargets:{}
};
const nativeSetInterval=window.setInterval.bind(window);
const nativeSetTimeout=window.setTimeout.bind(window);
const nativeInnerHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
const nativeTextContent=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
const fnText=fn=>{try{return typeof fn==='function'?Function.prototype.toString.call(fn):String(fn||'')}catch(_){return''}};

function isLegacyRepaintInterval(fn,delay){
  const d=Number(delay)||0,name=typeof fn==='function'?(fn.name||''):'',src=fnText(fn);
  if(d===120&&(name==='tick'||/copy\(\);\s*rep\(\);\s*market\(\);\s*competition\(\)/.test(src)))return true;
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

function canonicalNavHandler(e){
  e?.preventDefault?.();
  const id=this?.dataset?.page;if(!id)return;
  if(typeof window.refGo==='function')return window.refGo(id);
  if(typeof window.go==='function')return window.go(id);
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
function targetKey(n){let el=n?.nodeType===3?n.parentElement:n;if(!el||el.nodeType!==1)return String(n?.nodeName||'unknown');const id=el.id?`#${el.id}`:'';const cls=[...el.classList||[]].slice(0,3).map(x=>'.'+x).join('');return `${el.tagName.toLowerCase()}${id}${cls}`}
function traceOverview(){const root=document.getElementById('overview');if(!root)return;new MutationObserver(ms=>{for(const m of ms){const k=`${m.type}:${targetKey(m.target)}`;stats.overviewMutationTargets[k]=(stats.overviewMutationTargets[k]||0)+1}}).observe(root,{childList:true,subtree:true,characterData:true,attributes:true})}

function boot(){
  const st=document.createElement('style');st.id='blisStabilityPreloadCSS';st.textContent='#nav[data-blis-stable="0"]{opacity:0!important}#nav[data-blis-stable="1"]{opacity:1!important}#nav{transition:none!important}';document.head.appendChild(st);
  protectNavWrites();watchNav();watchMarket();keepBodiesPainted();traceOverview();
  document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page]'))requestAnimationFrame(()=>{protectNavWrites();stabilizeNav();stabilizeMarketTerminology();keepBodiesPainted()})},true);
  window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{protectNavWrites();stabilizeNav();stabilizeMarketTerminology();keepBodiesPainted()}));
  window.addEventListener('blis:periodchange',()=>requestAnimationFrame(()=>{stabilizeMarketTerminology();keepBodiesPainted()}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

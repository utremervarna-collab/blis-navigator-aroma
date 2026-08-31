/* BLIS Navigator — canonical universal client header v6.
   ONE shell-owned header for every client and every dashboard route.
   Fixed geometry, verified local logo assets where available, monogram fallback otherwise.
   Compatible with existing Navigator QA selectors (.bch3-name/.bch3-logo) and branding owner contract. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_BRANDING_V5)return;
window.__BLIS_CLIENT_BRANDING_V3=true;
window.__BLIS_CLIENT_BRANDING_V4=true;
window.__BLIS_CLIENT_BRANDING_V5=true;

const P={
  aroma:{bg:'Aroma Cosmetics',en:'Aroma Cosmetics',typeBg:'Козметика',typeEn:'Beauty & personal care',descBg:'Козметика, грижа за кожата и лична грижа',descEn:'Beauty, skincare & personal care solutions',mark:'A',accent:'#d73578',logo:'/client-logos/aroma.svg'},
  bolyarka:{bg:'Болярка ВТ АД',en:'BOLYARKA',typeBg:'Пивоварна компания',typeEn:'Brewery',descBg:'Пивоварна индустрия, напитки и потребителско търсене',descEn:'Brewery, beverages & consumer demand intelligence',mark:'Б',accent:'#c88918',logo:'/client-logos/bolyarka.png'},
  'astor-garden':{bg:'Astor Garden Hotel',en:'Astor Garden Hotel',typeBg:'Хотелиерство',typeEn:'Hospitality',descBg:'Хотелиерство, гостоприемство и репутация',descEn:'Hospitality, guest experience & reputation intelligence',mark:'A',accent:'#17664f',logo:''},
  'varna-towers':{bg:'Varna Towers',en:'Varna Towers',typeBg:'Недвижими имоти',typeEn:'Real estate',descBg:'Недвижими имоти, локационна среда и проектна видимост',descEn:'Real estate, location perception & project visibility',mark:'V',accent:'#0f6278',logo:''},
  mollox:{bg:'MOLLOX България',en:'MOLLOX Bulgaria',typeBg:'Професионална хигиена',typeEn:'Professional hygiene',descBg:'Професионална хигиена и индустриални решения',descEn:'Professional Hygiene & Industrial Solutions',mark:'M',accent:'#17664f',logo:'/client-logos/mollox.png'},
  wirello:{bg:'Wirello Market',en:'Wirello Market',typeBg:'Модерен ритейл',typeEn:'Retail',descBg:'Ритейл, потребителско поведение и категории',descEn:'Retail, shopper behavior & category intelligence',mark:'W',accent:'#2a68d4',logo:''},
  everbet:{bg:'Everbet',en:'Everbet',typeBg:'Онлайн игри и спортни залози',typeEn:'Online gaming',descBg:'Онлайн игри и спортни залози',descEn:'Online gaming & sports betting intelligence',mark:'E',accent:'#173e35',logo:'/client-logos/everbet.svg'}
};
const CONTEXT={
  overview:{bg:['Общ преглед','Обобщен поглед върху позицията, сигналите и ключовите промени.'],en:['Client Overview','A consolidated view of performance, market position and key insights.']},
  social:{bg:['Социални сигнали','Публични разговори, теми и динамика в социалната среда.'],en:['Social Intelligence','Public conversations, themes and social dynamics.']},
  market:{bg:['Пазарна среда','Пазарни сигнали, търсене и промени в категорията.'],en:['Market Intelligence','Market signals, demand and category changes.']},
  digital:{bg:['Дигитална среда','Видимост, търсене и представяне в дигиталните канали.'],en:['Digital Intelligence','Visibility, search and performance across digital channels.']},
  reputation:{bg:['Репутация','Публично възприятие, доверие и възникващи репутационни рискове.'],en:['Reputation Intelligence','Public perception, trust and emerging reputation risks.']},
  competition:{bg:['Конкурентна среда','Конкурентна позиция, активност и натиск в категорията.'],en:['Competitive Intelligence','Competitive position, activity and market pressure.']},
  opportunities:{bg:['Възможности','Идентифицирани пазарни възможности, потенциал и следващи действия.'],en:['Opportunities','Identified market opportunities, potential and next actions.']},
  history:{bg:['История','Историческа динамика на индексите, сигналите и ключовите промени.'],en:['History','Historical movement of indices, signals and key changes.']},
  reports:{bg:['Доклади','Аналитични обобщения, експорти и периодични материали.'],en:['Reports','Analytical summaries, exports and recurring deliverables.']}
};
const ALIASES={signals:'social',timeline:'history',live:'overview'};
let rendering=false,scheduled=false,observer=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function isEnglish(){
  try{if(new URLSearchParams(location.search).get('lang')==='en')return true}catch(_){}
  return String(document.documentElement.lang||'').toLowerCase().startsWith('en');
}
function current(){
  try{const q=new URLSearchParams(location.search).get('client');if(P[q])return q}catch(_){}
  const b=document.body?.dataset?.client;if(P[b])return b;
  try{if(P[window.slug])return window.slug}catch(_){}
  const s=document.getElementById('clientSel')?.value;if(P[s])return s;
  return P[window.BLIS_INITIAL_CLIENT]?window.BLIS_INITIAL_CLIENT:'aroma';
}
function route(){
  const r=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';
  return ALIASES[r]||r;
}
function period(){const d=Number(window.BLISPeriod?.days);return Number.isFinite(d)&&d>0?Math.round(d):30}
function lastSync(){const t=document.getElementById('lastSync')?.textContent?.trim();return t&&t!=='—'?t:'—'}
function clientName(p,en){return en?p.en:p.bg}
function clientType(p,en){return en?p.typeEn:p.typeBg}
function clientDesc(p,en){return en?p.descEn:p.descBg}

function css(){
  if(document.getElementById('blisUniversalClientHeaderV6Css'))return;
  const s=document.createElement('style');s.id='blisUniversalClientHeaderV6Css';s.textContent=`
  .topbar.blis-client-header.blis-universal-client-header{box-sizing:border-box!important;width:100%!important;max-width:100%!important;height:78px!important;min-height:78px!important;max-height:78px!important;margin:0!important;padding:10px 14px!important;border:1px solid #dce6ee!important;border-radius:16px 16px 0 0!important;background:rgba(255,255,255,.985)!important;box-shadow:0 5px 18px rgba(24,54,82,.045)!important;display:grid!important;grid-template-columns:minmax(270px,1fr) auto!important;align-items:center!important;gap:16px!important;overflow:hidden!important}
  .topbar.blis-client-header.blis-universal-client-header .title{margin:0!important;min-width:0!important;padding:0!important}.bch3-brand{display:flex!important;align-items:center!important;gap:12px!important;min-width:0!important;height:56px!important}.bch3-logo{position:relative!important;box-sizing:border-box!important;width:50px!important;height:50px!important;min-width:50px!important;max-width:50px!important;flex:0 0 50px!important;border-radius:11px!important;background:var(--bch-accent,#17664f)!important;display:grid!important;place-items:center!important;overflow:hidden!important;border:1px solid rgba(18,48,70,.08)!important;box-shadow:0 2px 8px rgba(20,50,72,.07)!important;padding:0!important}.bch3-mark{font-size:23px!important;font-weight:850!important;color:#fff!important;line-height:1!important;letter-spacing:-.04em!important}.bch3-logo img{position:absolute!important;inset:4px!important;width:calc(100% - 8px)!important;height:calc(100% - 8px)!important;max-width:none!important;max-height:none!important;object-fit:contain!important;object-position:center!important;background:#fff!important;border-radius:7px!important;padding:2px!important;box-sizing:border-box!important;filter:none!important;transform:none!important}.bch3-logo img.failed{display:none!important}.bch3-copy{min-width:0!important}.bch3-kicker{font-size:7px!important;font-weight:850!important;letter-spacing:.09em!important;text-transform:uppercase!important;color:#8a9cab!important;margin-bottom:3px!important;line-height:1!important}.bch3-name{font-size:20px!important;line-height:1.08!important;font-weight:850!important;letter-spacing:-.025em!important;color:#152f49!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:620px!important}.bch3-desc{margin-top:5px!important;font-size:10px!important;line-height:1.2!important;color:#6d8295!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:620px!important}
  .topbar.blis-client-header.blis-universal-client-header .toptools{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:7px!important;margin:0!important;padding:0!important;min-width:0!important;overflow:visible!important}.bch3-chip,.topbar.blis-client-header.blis-universal-client-header .datebox{box-sizing:border-box!important;height:36px!important;min-height:36px!important;max-height:36px!important;padding:0 10px!important;border:1px solid #dbe5ed!important;border-radius:10px!important;background:#fff!important;color:#3f5d75!important;font:800 9px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;box-shadow:none!important;white-space:nowrap!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important}.bch3-live-dot{width:7px!important;height:7px!important;border-radius:50%!important;background:#2eaa68!important;box-shadow:0 0 0 3px rgba(46,170,104,.10)!important;flex:0 0 7px!important}.bch3-lang{cursor:pointer!important}.bch3-sync{color:#6f8597!important}.bch3-sync b{color:#2f5069!important;font-weight:850!important}.sync,.bch5-health,.bch5-update,.bch4-health,.bch4-update,.bch-health,.bch-update{display:none!important}
  .bch3-context{box-sizing:border-box!important;width:100%!important;max-width:100%!important;height:62px!important;min-height:62px!important;max-height:62px!important;padding:10px 16px!important;border:1px solid #dce6ee!important;border-top:0!important;border-radius:0 0 16px 16px!important;background:linear-gradient(180deg,#fff 0%,#fbfdff 100%)!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;margin:0 0 12px!important;box-shadow:0 7px 20px rgba(24,54,82,.035)!important;overflow:hidden!important}.bch3-context-copy{min-width:0!important}.bch3-context-title{font-size:18px!important;line-height:1.08!important;font-weight:850!important;letter-spacing:-.02em!important;color:#17354f!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.bch3-context-sub{margin-top:5px!important;font-size:9px!important;line-height:1.25!important;color:#76899a!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:900px!important}.bch3-context-rule{width:34px!important;height:3px!important;border-radius:99px!important;background:var(--bch-accent,#17664f)!important;opacity:.9!important;flex:0 0 34px!important}
  .client-option{grid-template-columns:1fr auto!important}.client-option>span:first-child{min-width:0!important}.client-option b{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.client-option small{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.client-brand-mark,.client-option-mark{display:none!important}
  @media(max-width:1020px){.topbar.blis-client-header.blis-universal-client-header{grid-template-columns:minmax(220px,1fr) auto!important}.bch3-monitor{display:none!important}.bch3-desc,.bch3-name{max-width:390px!important}.bch3-context-sub{max-width:650px!important}}
  @media(max-width:760px){.topbar.blis-client-header.blis-universal-client-header{height:auto!important;min-height:76px!important;max-height:none!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;padding:9px 10px!important;overflow:visible!important}.bch3-brand{height:50px!important}.bch3-logo{width:46px!important;height:46px!important;min-width:46px!important;max-width:46px!important;flex-basis:46px!important}.bch3-kicker{display:none!important}.bch3-name{font-size:18px!important;max-width:72vw!important}.bch3-desc{font-size:9px!important;max-width:72vw!important}.topbar.blis-client-header.blis-universal-client-header .toptools{justify-content:flex-start!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;padding-bottom:2px!important;scrollbar-width:none!important}.topbar.blis-client-header.blis-universal-client-header .toptools::-webkit-scrollbar{display:none!important}.bch3-sync{display:none!important}.bch3-context{height:auto!important;min-height:58px!important;max-height:none!important;padding:10px 12px!important;margin-bottom:10px!important}.bch3-context-title{font-size:17px!important}.bch3-context-sub{white-space:normal!important;line-height:1.3!important;max-width:none!important}.bch3-context-rule{display:none!important}}
  `;document.head.appendChild(s);
}

function removeLegacy(){
  document.querySelectorAll('.bch5-health,.bch5-update,.bch4-health,.bch4-update,.bch-health,.bch-update').forEach(n=>n.remove());
  document.querySelectorAll('.bch3-chip').forEach(n=>n.remove());
  document.querySelectorAll('.bch5-brand,.bch4-brand,.bch-brand').forEach(n=>{if(!n.closest('.bch3-brand'))n.remove()});
}
function logoHTML(p,name){
  const img=p.logo?`<img src="${esc(p.logo)}" alt="${esc(name)}" onerror="this.classList.add('failed')">`:'';
  return `<span class="bch3-logo" style="--bch-accent:${p.accent}" aria-hidden="true"><span class="bch3-mark">${esc(p.mark)}</span>${img}</span>`;
}
function contextPair(r,en){const c=CONTEXT[r]||CONTEXT.overview;return en?c.en:c.bg}
function render(){
  if(rendering)return;rendering=true;
  try{
    css();removeLegacy();
    const key=current(),p=P[key]||P.aroma,en=isEnglish(),name=clientName(p,en),r=route(),ctx=contextPair(r,en);
    const bar=document.querySelector('.topbar');if(!bar)return;
    bar.classList.add('blis-client-header','blis-universal-client-header');bar.style.setProperty('--bch-accent',p.accent);
    let title=bar.querySelector('.title');if(!title){title=document.createElement('div');title.className='title';bar.prepend(title)}
    title.innerHTML=`<div class="bch3-brand" data-client-key="${esc(key)}">${logoHTML(p,name)}<div class="bch3-copy"><div class="bch3-kicker">${en?'Client profile':'Клиентски профил'}</div><div class="bch3-name">${esc(name)}</div><div class="bch3-desc">${esc(clientDesc(p,en))}</div></div></div>`;
    let tools=bar.querySelector('.toptools');if(!tools){tools=document.createElement('div');tools.className='toptools';bar.appendChild(tools)}
    tools.querySelectorAll('.bch3-chip').forEach(n=>n.remove());
    const date=tools.querySelector('.datebox');if(date)date.textContent=en?`${period()} days ⌄`:`Последните ${period()} дни ⌄`;
    const monitor=document.createElement('span');monitor.className='bch3-chip bch3-monitor';monitor.innerHTML=`<i class="bch3-live-dot"></i>${en?'Active monitoring':'Активно наблюдение'}`;tools.insertBefore(monitor,date||tools.firstChild);
    const lang=document.createElement('button');lang.type='button';lang.className='bch3-chip bch3-lang';lang.setAttribute('data-blis-language-switch','');lang.setAttribute('aria-label',en?'Switch language':'Смени езика');lang.textContent='BG | EN';lang.addEventListener('click',()=>{const u=new URL(location.href);u.searchParams.set('lang',en?'bg':'en');location.assign(u.pathname+u.search+u.hash)});tools.appendChild(lang);
    const sync=document.createElement('span');sync.className='bch3-chip bch3-sync';sync.innerHTML=`${en?'Last sync':'Последно обновяване'} <b>${esc(lastSync())}</b>`;tools.appendChild(sync);
    let cbar=document.getElementById('blisUniversalClientContext');if(!cbar){cbar=document.createElement('section');cbar.id='blisUniversalClientContext';cbar.className='bch3-context';bar.insertAdjacentElement('afterend',cbar)}
    cbar.dataset.client=key;cbar.dataset.route=r;cbar.dataset.lang=en?'en':'bg';cbar.style.setProperty('--bch-accent',p.accent);cbar.innerHTML=`<div class="bch3-context-copy"><div class="bch3-context-title">${esc(ctx[0])}</div><div class="bch3-context-sub">${esc(ctx[1])}</div></div><span class="bch3-context-rule" aria-hidden="true"></span>`;
    document.documentElement.dataset.clientBranding='local-real-v3-1';
    document.documentElement.dataset.clientHeader='universal-v6';
  } finally {rendering=false}
}
function needsRepair(){
  const bar=document.querySelector('.topbar.blis-client-header.blis-universal-client-header');if(!bar)return true;
  const key=current(),p=P[key]||P.aroma,en=isEnglish(),name=clientName(p,en),r=route();
  if((bar.querySelector('.bch3-name')?.textContent||'').trim()!==name)return true;
  const c=document.getElementById('blisUniversalClientContext');if(!c||c.dataset.client!==key||c.dataset.route!==r||c.dataset.lang!==(en?'en':'bg'))return true;
  return document.documentElement.dataset.clientBranding!=='local-real-v3-1';
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{scheduled=false;if(needsRepair())render()}))}
function observe(){
  if(observer||window.__BLIS_CLIENT_HEADER_OBSERVER_V6)return;const shell=document.querySelector('.shell');if(!shell)return;
  window.__BLIS_CLIENT_HEADER_OBSERVER_V6=true;observer=new MutationObserver(()=>{if(!rendering&&needsRepair())schedule()});observer.observe(shell,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}
function init(){render();observe()}
if(!window.__BLIS_CLIENT_BRANDING_EVENTS_V6){
  window.__BLIS_CLIENT_BRANDING_EVENTS_V6=true;
  ['blis:clientdata','blis:routechange','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(e=>window.addEventListener(e,()=>{render();observe()}));
  window.addEventListener('popstate',()=>{render();observe()});
}
const api={paint:render,render,profiles:P};
window.BLISClientBrandingV3=api;window.BLISClientBrandingV4=api;window.BLISClientBrandingV5=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

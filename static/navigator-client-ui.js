/* BLIS Navigator — canonical client UI + universal profile header v4.
   One shell-owned header for every client and every dashboard route.
   Everbet remains addressable directly but is intentionally hidden from the client switcher. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_UI_V4)return;window.__BLIS_CLIENT_UI_V4=true;window.__BLIS_CLIENT_UI_V3=true;

const clients={
  aroma:{name:'Aroma Cosmetics',full:'Aroma Cosmetics',typeBg:'Козметика',typeEn:'Beauty & personal care',descBg:'Козметика, грижа за кожата и лична грижа',descEn:'Beauty, skincare & personal care solutions',mark:'A',accent:'#d73578',logo:'/client-logos/aroma.svg'},
  bolyarka:{name:'Болярка',full:'Болярка ВТ АД',typeBg:'Пивоварна компания',typeEn:'Brewery',descBg:'Пивоварна индустрия, напитки и потребителско търсене',descEn:'Brewery, beverages & consumer demand intelligence',mark:'Б',accent:'#c88918',logo:'/client-logos/bolyarka.png'},
  'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',typeBg:'Хотелиерство',typeEn:'Hospitality',descBg:'Хотелиерство, гостоприемство и репутация',descEn:'Hospitality, guest experience & reputation intelligence',mark:'A',accent:'#17664f',logo:''},
  'varna-towers':{name:'Varna Towers',full:'Varna Towers',typeBg:'Недвижими имоти',typeEn:'Real estate',descBg:'Недвижими имоти, локационна среда и проектна видимост',descEn:'Real estate, location perception & project visibility',mark:'V',accent:'#0f6278',logo:''},
  mollox:{name:'MOLLOX',full:'MOLLOX България',typeBg:'Професионална хигиена',typeEn:'Professional hygiene',descBg:'Професионална хигиена и индустриални решения',descEn:'Professional Hygiene & Industrial Solutions',mark:'M',accent:'#17664f',logo:'/client-logos/mollox.png'},
  wirello:{name:'Wirello Market',full:'Wirello Market',typeBg:'Модерен ритейл',typeEn:'Retail',descBg:'Ритейл, потребителско поведение и категории',descEn:'Retail, shopper behavior & category intelligence',mark:'W',accent:'#2a68d4',logo:''},
  everbet:{name:'Everbet',full:'Everbet',typeBg:'Онлайн игри и спортни залози',typeEn:'Online gaming',descBg:'Онлайн игри и спортни залози',descEn:'Online gaming & sports betting intelligence',mark:'E',accent:'#173e35',logo:'/client-logos/everbet.svg'}
};
const visibleOrder=['mollox','aroma','bolyarka','wirello','varna-towers','astor-garden'];
const valid=k=>!!clients[k];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let renderQueued=false,rendering=false,observer=null;

function isEnglish(){
  try{if(new URLSearchParams(location.search).get('lang')==='en')return true}catch(_){}
  return String(document.documentElement.lang||'').toLowerCase().startsWith('en');
}
function current(){
  try{const q=new URLSearchParams(location.search).get('client');if(valid(q))return q}catch(_){}
  try{if(valid(window.slug))return window.slug}catch(_){}
  const b=document.body?.dataset?.client;if(valid(b))return b;
  const s=document.getElementById('clientSel')?.value;if(valid(s))return s;
  if(valid(window.BLIS_INITIAL_CLIENT))return window.BLIS_INITIAL_CLIENT;
  return 'aroma';
}
function currentRoute(){return document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview'}
function lastSync(){const t=document.getElementById('lastSync')?.textContent?.trim();return t&&t!=='—'?t:'—'}
function periodDays(){return Number(window.BLISPeriod?.days)||30}

const contexts={
 overview:{bg:['Общ преглед','Обобщен поглед върху позицията, сигналите и ключовите промени.'],en:['Client Overview','A consolidated view of performance, market position and key insights.']},
 live:{bg:['Наблюдение в реално време','Текущ поток от публични данни, източници и промени.'],en:['Live Monitoring','Current flow of public data, sources and changes.']},
 social:{bg:['Социални сигнали','Публични разговори, теми и динамика в социалната среда.'],en:['Social Intelligence','Public conversations, themes and social dynamics.']},
 digital:{bg:['Дигитална среда','Видимост, търсене и представяне в дигиталните канали.'],en:['Digital Intelligence','Visibility, search and performance across digital channels.']},
 reputation:{bg:['Репутация','Публично възприятие, доверие и възникващи репутационни рискове.'],en:['Reputation Intelligence','Public perception, trust and emerging reputation risks.']},
 market:{bg:['Пазарна среда','Пазарни сигнали, търсене и промени в категорията.'],en:['Market Intelligence','Market signals, demand and category changes.']},
 competition:{bg:['Конкурентна среда','Конкурентна позиция, активност и натиск в категорията.'],en:['Competitive Intelligence','Competitive position, activity and market pressure.']},
 signals:{bg:['Сигнали','Приоритетни промени, рискове и възможности за внимание.'],en:['Signals','Priority changes, risks and opportunities requiring attention.']},
 reports:{bg:['Доклади','Аналитични обобщения, експорти и периодични материали.'],en:['Reports','Analytical summaries, exports and recurring deliverables.']},
 sources:{bg:['Доказателства и източници','Проследими публични източници и доказателства зад показателите.'],en:['Evidence & Sources','Traceable public sources and evidence behind the metrics.']},
 history:{bg:['История','Историческа динамика на индексите, сигналите и ключовите промени.'],en:['History','Historical movement of indices, signals and key changes.']},
 timeline:{bg:['Времева линия','Хронология на наблюдаваните събития и промени.'],en:['Timeline','Chronology of observed events and changes.']},
 profile:{bg:['Клиентски профил','Обхват, източници и настройки на наблюдавания клиент.'],en:['Client Profile','Scope, sources and settings for the monitored client.']},
 settings:{bg:['Настройки','Настройки на работната среда и предпочитанията.'],en:['Settings','Workspace settings and preferences.']},
 help:{bg:['Помощ','Информация за работа с Navigator и основните модули.'],en:['Help','Guidance for Navigator and its core modules.']}
};

function injectCSS(){
 if(document.getElementById('blisUniversalClientHeaderV4Css'))return;
 const s=document.createElement('style');s.id='blisUniversalClientHeaderV4Css';s.textContent=`
 .topbar.blis-universal-client-header{box-sizing:border-box!important;height:78px!important;min-height:78px!important;max-height:78px!important;margin:0 0 0!important;padding:10px 16px!important;border:1px solid #dce6ee!important;border-radius:16px 16px 0 0!important;background:rgba(255,255,255,.98)!important;box-shadow:0 5px 18px rgba(24,54,82,.045)!important;display:grid!important;grid-template-columns:minmax(280px,1fr) auto!important;align-items:center!important;gap:18px!important;overflow:hidden!important}
 .topbar.blis-universal-client-header .title{margin:0!important;min-width:0!important}.uch-identity{display:flex;align-items:center;gap:12px;min-width:0;height:56px}.uch-logo{position:relative;width:50px;height:50px;flex:0 0 50px;border-radius:11px;background:var(--uch-accent,#17664f);display:grid;place-items:center;overflow:hidden;border:1px solid rgba(18,48,70,.08);box-shadow:0 2px 8px rgba(20,50,72,.07)}.uch-mark{font-size:24px;font-weight:850;color:#fff;line-height:1;letter-spacing:-.04em}.uch-logo img{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px);object-fit:contain;background:#fff;border-radius:8px}.uch-logo img.failed{display:none}.uch-copy{min-width:0}.uch-name{font-size:20px;line-height:1.08;font-weight:850;letter-spacing:-.025em;color:#152f49;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.uch-desc{margin-top:5px;font-size:10px;line-height:1.2;color:#6d8295;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:620px}
 .topbar.blis-universal-client-header .toptools{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;margin:0!important;min-width:0}.uch-chip,.topbar.blis-universal-client-header .datebox{box-sizing:border-box!important;height:36px!important;min-height:36px!important;padding:0 11px!important;border:1px solid #dbe5ed!important;border-radius:10px!important;background:#fff!important;color:#3f5d75!important;font:800 9px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;box-shadow:none!important;white-space:nowrap!important;display:inline-flex!important;align-items:center!important;gap:7px!important}.uch-live-dot{width:7px;height:7px;border-radius:50%;background:#2eaa68;box-shadow:0 0 0 3px rgba(46,170,104,.10)}.uch-lang{cursor:pointer}.uch-sync{color:#6f8597!important}.uch-sync b{color:#2f5069;font-weight:850}.sync{display:none!important}
 .uch-context{box-sizing:border-box;height:62px;min-height:62px;max-height:62px;padding:10px 17px;border:1px solid #dce6ee;border-top:0;border-radius:0 0 16px 16px;background:linear-gradient(180deg,#fff 0%,#fbfdff 100%);display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 12px;box-shadow:0 7px 20px rgba(24,54,82,.035)}.uch-context-copy{min-width:0}.uch-context-title{font-size:18px;line-height:1.08;font-weight:850;letter-spacing:-.02em;color:#17354f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.uch-context-sub{margin-top:5px;font-size:9px;color:#76899a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:900px}.uch-context-rule{width:34px;height:3px;border-radius:99px;background:var(--uch-accent,#17664f);opacity:.9;flex:0 0 auto}
 @media(max-width:980px){.topbar.blis-universal-client-header{grid-template-columns:minmax(220px,1fr) auto!important}.uch-monitor{display:none!important}.uch-desc{max-width:360px}.uch-context-sub{max-width:650px}}
 @media(max-width:760px){.topbar.blis-universal-client-header{height:auto!important;min-height:76px!important;max-height:none!important;grid-template-columns:1fr!important;gap:8px!important;padding:9px 11px!important}.uch-identity{height:50px}.uch-logo{width:46px;height:46px;flex-basis:46px}.uch-name{font-size:18px}.uch-desc{max-width:70vw}.topbar.blis-universal-client-header .toptools{justify-content:flex-start!important;overflow-x:auto!important;padding-bottom:2px}.uch-sync{display:none!important}.uch-context{height:auto;min-height:58px;max-height:none;padding:10px 12px}.uch-context-title{font-size:17px}.uch-context-sub{white-space:normal;line-height:1.3}.uch-context-rule{display:none}}
 `;document.head.appendChild(s);
}

function ensureSwitcher(){
 const sel=document.getElementById('clientSel');
 if(sel){
   const wanted=[...visibleOrder,'everbet'];
   const labels={mollox:'MOLLOX България',aroma:'Aroma Cosmetics',bolyarka:'Болярка',wirello:'Wirello Market','varna-towers':'Varna Towers','astor-garden':'Astor Garden Hotel',everbet:'Everbet'};
   wanted.forEach(k=>{if(!sel.querySelector(`option[value="${k}"]`)){const o=document.createElement('option');o.value=k;o.textContent=labels[k];sel.appendChild(o)}});
 }
 const menu=document.querySelector('.client-switch-menu');if(!menu)return;
 const active=current();
 menu.innerHTML=visibleOrder.map(k=>{const c=clients[k],on=k===active;return `<button type="button" class="client-option${on?' active':''}" data-client-key="${k}" role="option" aria-selected="${on?'true':'false'}"><span class="client-option-mark" style="background:${c.accent}">${esc(c.mark)}</span><span><b>${esc(c.full)}</b><small>${esc(isEnglish()?c.typeEn:c.typeBg)}</small></span><span class="client-option-check">${on?'✓':''}</span></button>`}).join('');
}

function sidebarPaint(key){
 if(!valid(key))key='aroma';const c=clients[key],en=isEnglish();
 document.body.dataset.client=key;window.BLIS_INITIAL_CLIENT=key;
 document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent=c.full);
 document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent=en?c.typeEn:c.typeBg);
 document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent=c.mark);
 document.querySelectorAll('.client-option[data-client-key]').forEach(x=>{const on=x.dataset.clientKey===key;x.classList.toggle('active',on);x.setAttribute('aria-selected',on?'true':'false');const ck=x.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':''});
 document.title=`BLIS Navigator — ${c.name}`;
}

function logoHTML(c){return `<span class="uch-logo" style="--uch-accent:${c.accent}"><span class="uch-mark">${esc(c.mark)}</span>${c.logo?`<img src="${esc(c.logo)}" alt="${esc(c.name)}" onerror="this.classList.add('failed')">`:''}</span>`}
function renderHeader(){
 if(rendering)return;rendering=true;
 try{
   injectCSS();const key=current(),c=clients[key]||clients.aroma,en=isEnglish();
   const bar=document.querySelector('.topbar');if(!bar)return;
   bar.classList.add('blis-universal-client-header');bar.style.setProperty('--uch-accent',c.accent);
   let title=bar.querySelector('.title');if(!title){title=document.createElement('div');title.className='title';bar.prepend(title)}
   title.innerHTML=`<div class="uch-identity" data-client-key="${key}">${logoHTML(c)}<div class="uch-copy"><div class="uch-name">${esc(c.full)}</div><div class="uch-desc">${esc(en?c.descEn:c.descBg)}</div></div></div>`;
   let tools=bar.querySelector('.toptools');if(!tools){tools=document.createElement('div');tools.className='toptools';bar.appendChild(tools)}
   tools.querySelectorAll('.uch-chip').forEach(x=>x.remove());
   const date=tools.querySelector('.datebox');if(date){date.textContent=en?`${periodDays()} days ⌄`:`${periodDays()} дни ⌄`}
   const monitor=document.createElement('span');monitor.className='uch-chip uch-monitor';monitor.innerHTML=`<i class="uch-live-dot"></i>${en?'Active monitoring':'Активно наблюдение'}`;tools.insertBefore(monitor,date||tools.firstChild);
   const lang=document.createElement('button');lang.type='button';lang.className='uch-chip uch-lang';lang.setAttribute('data-blis-language-switch','');lang.textContent='BG | EN';lang.title=en?'Switch to Bulgarian':'Превключи на английски';lang.addEventListener('click',()=>{const u=new URL(location.href);u.searchParams.set('lang',en?'bg':'en');location.assign(u.pathname+u.search+u.hash)});tools.appendChild(lang);
   const sync=document.createElement('span');sync.className='uch-chip uch-sync';sync.innerHTML=`${en?'Last sync':'Последно обновяване'} <b>${esc(lastSync())}</b>`;tools.appendChild(sync);
   const r=currentRoute(),ctx=contexts[r]||contexts.overview,pair=en?ctx.en:ctx.bg;
   let context=document.querySelector('.uch-context');if(!context){context=document.createElement('section');context.className='uch-context';bar.insertAdjacentElement('afterend',context)}
   context.dataset.route=r;context.dataset.client=key;context.style.setProperty('--uch-accent',c.accent);context.innerHTML=`<div class="uch-context-copy"><div class="uch-context-title">${esc(pair[0])}</div><div class="uch-context-sub">${esc(pair[1])}</div></div><span class="uch-context-rule" aria-hidden="true"></span>`;
   document.documentElement.dataset.clientHeader='universal-v4';
 } finally {rendering=false}
}
function schedule(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{renderQueued=false;sidebarPaint(current());renderHeader()}))}

function close(){const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');w?.classList.remove('open');b?.setAttribute('aria-expanded','false')}
function toggle(){const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');if(!w||!b)return;const on=!w.classList.contains('open');w.classList.toggle('open',on);b.setAttribute('aria-expanded',on?'true':'false')}
function select(key){
 if(!valid(key))return;close();
 try{localStorage.setItem('blis-client-ui',key)}catch(_){}
 try{document.cookie=`blis_admin_client=${encodeURIComponent(key)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`}catch(_){}
 const page=document.querySelector('.page.active')?.id||'overview';const u=new URL(location.href);u.pathname='/dashboard.html';u.search='';u.searchParams.set('client',key);u.searchParams.set('page',page);if(isEnglish())u.searchParams.set('lang','en');history.replaceState({client:key,page},'',u.pathname+u.search);
 window.BLIS_INITIAL_CLIENT=key;try{window.slug=key}catch(_){}const sel=document.getElementById('clientSel');if(sel)sel.value=key;sidebarPaint(key);renderHeader();if(sel)sel.dispatchEvent(new Event('change',{bubbles:true}));else if(typeof window.load==='function')window.load();
}
function click(e){const o=e.target.closest?.('.client-option[data-client-key]');if(o){e.preventDefault();e.stopPropagation();select(o.dataset.clientKey);return}const b=e.target.closest?.('.client-switch-button');if(b){e.preventDefault();e.stopPropagation();toggle();return}const w=document.querySelector('.client-switch');if(w&&!w.contains(e.target))close()}
function observe(){const shell=document.querySelector('.shell');if(!shell||observer)return;observer=new MutationObserver(()=>{if(rendering)return;const id=document.querySelector('.uch-identity'),ctx=document.querySelector('.uch-context');if(!id||id.dataset.clientKey!==current()||!ctx||ctx.dataset.route!==currentRoute())schedule()});observer.observe(shell,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
function init(){ensureSwitcher();const k=current(),sel=document.getElementById('clientSel');if(sel)sel.value=k;sidebarPaint(k);renderHeader();document.addEventListener('click',click,true);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});['blis:clientdata','blis:routechange','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(ev=>window.addEventListener(ev,schedule));window.addEventListener('popstate',schedule);const w=document.querySelector('.client-switch');if(w){w.style.position='relative';w.style.zIndex='200'}const m=document.querySelector('.client-switch-menu');if(m)m.style.zIndex='1000';observe()}
window.BLISClientUIV4={select,paint:sidebarPaint,current,renderHeader,visibleClients:[...visibleOrder]};window.BLISClientUIV3=window.BLISClientUIV4;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

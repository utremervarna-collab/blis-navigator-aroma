/* BLIS Navigator 3.0 — client clarity owner v5.
   Bulgarian-only, source-localized analytical renderers without duplicate page-story panels. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_CLIENT_CLARITY_V1)return;
window.__BLIS_NAVIGATOR_3_CLIENT_CLARITY_V1=true;

const STORY={
 overview:{label:'Общ изглед',question:'Как е брандът ми сега?',copy:'Виждате общото състояние, последната посока и факторите, които най-силно движат картината.'},
 social:{label:'Мониторинг',question:'Какво се случва в момента?',copy:'Радарът събира значимите сигнали, видимостта, рисковете и възможностите и показва къде се проявява всяка промяна.'},
 market:{label:'Среда',question:'Какво се случва около бранда и как се възприема?',copy:'Пазарните теми и публичното възприятие се четат заедно, за да се вижда връзката между средата и репутационния ефект.'},
 competition:{label:'Конкуренти',question:'Как се движим спрямо останалите?',copy:'Сравнението показва текущата позиция, движението на конкурентите и конкретните сигнали зад промяната.'},
 history:{label:'Развитие/Доклади',question:'Как се развива картината във времето?',copy:'Траекторията на BLIS индекса се свързва с ключовите събития и с реално публикуваните клиентски доклади.'},
 hub:{label:'Intelligence HUB',question:'Какво публикуваме и кога?',copy:'Редакционно и аналитично съдържание.'},
 calendar:{label:'Календар',question:'Какво предстои?',copy:'Събития и ключови дати.'}
};
const ALIAS={signals:'social',live:'social',digital:'social',opportunities:'social',reputation:'market',reports:'history',timeline:'history',development:'history'};
const current=()=>{const id=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';return ALIAS[id]||id};
const BG_REPLACEMENTS=[
 [/\bAnalytical Intelligence\b/g,'Аналитична картина'],
 [/\bDeep Analytics\b/g,'Разширен анализ'],
 [/\bEarly Warning\b/g,'Ранни сигнали'],
 [/\bNarrative Intelligence\b/g,'Тематична динамика'],
 [/\bMetric Intelligence\b/g,'Измерими промени'],
 [/\bShare of Voice\b/g,'Дял от публичното присъствие'],
 [/\bMomentum\b/g,'Динамика'],
 [/\bOpportunity\b/g,'Възможности'],
 [/\bConfidence\b/g,'Надеждност'],
 [/\bLive monitoring\b/gi,'Текущо наблюдение'],
 [/\bLIVE\b/g,'В РЕАЛНО ВРЕМЕ']
];

function setText(el,text){if(el&&el.textContent.trim()!==text)el.textContent=text}
function installBulgarianLockCss(){
  if(document.getElementById('navigator3BulgarianLockCss'))return;
  const style=document.createElement('style');
  style.id='navigator3BulgarianLockCss';
  style.textContent=`
  .bch3-lang,[data-blis-language-switch],.n3-language-switch-disabled{display:none!important}
  .n3-radar-legend{width:min(760px,100%);box-sizing:border-box;margin:9px auto 3px;padding:9px 11px;border:1px solid #dfe7ef;border-radius:11px;background:#fff;box-shadow:0 6px 18px rgba(20,47,80,.045)}
  .n3-radar-legend-title{margin-bottom:7px;color:#46617a;font-size:8px;font-weight:900;letter-spacing:.02em}
  .n3-radar-legend-items{display:flex;align-items:center;justify-content:center;gap:10px 14px;flex-wrap:wrap}
  .n3-radar-legend-item{display:inline-flex;align-items:center;gap:5px;color:#5e7387;font-size:8px;white-space:nowrap}
  .n3-radar-legend-item i{width:9px;height:9px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px rgba(31,67,97,.12);background:var(--legend-color);flex:0 0 9px}
  .n3-radar-legend-item b{min-width:12px;color:#344f68;font-size:8px;font-variant-numeric:tabular-nums}
  .n3-radar-legend-note{display:block;margin-top:7px;padding-top:6px;border-top:1px solid #edf1f5;color:#8191a0;font-size:7.5px;line-height:1.45;text-align:center}
  @media(max-width:760px){.n3-radar-legend-items{justify-content:flex-start}.n3-radar-legend{padding:9px}}
  `;
  document.head.appendChild(style);
}
function disableLanguageSwitches(root=document){
  const scope=root&&root.querySelectorAll?root:document;
  scope.querySelectorAll('.bch3-lang,[data-blis-language-switch]').forEach(el=>{
    el.classList.remove('bch3-lang');
    el.classList.add('n3-language-switch-disabled');
    el.removeAttribute('data-blis-language-switch');
    el.hidden=true;
    el.disabled=true;
    el.setAttribute('aria-hidden','true');
    el.tabIndex=-1;
  });
}
function normalizeBulgarianCopy(root=document){
  const scope=root&&root.nodeType?root:document;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,{acceptNode(node){
    const p=node.parentElement;if(!p||p.closest('script,style,noscript'))return NodeFilter.FILTER_REJECT;
    return /[A-Za-z]/.test(node.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){let text=node.nodeValue;for(const [re,to] of BG_REPLACEMENTS)text=text.replace(re,to);if(text!==node.nodeValue)node.nodeValue=text}
}
function normalizeRouteLabels(){
  for(const [id,m] of Object.entries(STORY))setText(document.querySelector(`#nav [data-n3-page="${id}"] .navtxt`),m.label);
  const id=current(),m=STORY[id];if(!m)return;
  setText(document.querySelector('.bch3-context-title'),m.label);
  const sub=document.querySelector('.bch3-context-sub');if(sub){const copy=id==='overview'?'Обобщена картина на състоянието и ключовите промени.':id==='social'?'Текущо наблюдение на сигнали, рискове, възможности и видимост.':id==='market'?'Пазарни теми, публично възприятие и връзките между тях.':id==='competition'?'Позиция, движение и активност на конкурентите.':id==='history'?'Историческа динамика, ключови събития и публикувани доклади.':m.copy;setText(sub,copy)}
  const page=document.getElementById(id);if(!page)return;
  if(id==='overview')page.querySelectorAll('.ref-title h2,.vs-head h2,.vs-vhead h2').forEach(x=>setText(x,m.label));
  if(id==='social')setText(page.querySelector('.n3-page-head h2'),m.label);
  if(id==='market'){page.querySelectorAll('.pm-hero h2,.ref-title h2,.market1-head h2').forEach(x=>setText(x,m.label));const p=page.querySelector('.pm-hero p,.ref-title p,.market1-head p');if(p)setText(p,'Пазарни теми, публично възприятие и връзките между тях.')}
  if(id==='competition')page.querySelectorAll('.ref-title h2,.vs-head h2,.vs-vhead h2').forEach(x=>setText(x,m.label));
  if(id==='history')page.querySelectorAll('.ref-title h2,.vs-head h2,.vs-vhead h2').forEach(x=>setText(x,m.label));
}
function radarCounts(){const root=document.querySelector('#social .dv-radar-grid');return{
 source:root?.querySelectorAll('.dv-blip').length||0,
 risk:root?.querySelectorAll('.n3-live-blip.risk').length||0,
 good:root?.querySelectorAll('.n3-live-blip.good').length||0,
 comp:root?.querySelectorAll('.n3-live-blip.comp').length||0,
 market:root?.querySelectorAll('.n3-live-blip.market').length||0,
 info:root?.querySelectorAll('.n3-live-blip.info').length||0
}}
function ensureRadarLegend(){
  const col=document.querySelector('#social .dv-radar-column'),radar=col?.querySelector('.dv-radar-wrap');if(!col||!radar)return;
  let legend=col.querySelector('[data-n3-radar-legend]');
  if(!legend){legend=document.createElement('div');legend.className='n3-radar-legend';legend.dataset.n3RadarLegend='1';legend.innerHTML=`<div class="n3-radar-legend-title">Как се четат точките на радара</div><div class="n3-radar-legend-items"><span class="n3-radar-legend-item" data-legend="source" style="--legend-color:#69fff3"><i></i>Наблюдаван източник <b></b></span><span class="n3-radar-legend-item" data-legend="risk" style="--legend-color:#d45c55"><i></i>Риск <b></b></span><span class="n3-radar-legend-item" data-legend="good" style="--legend-color:#35a873"><i></i>Възможност / позитивна промяна <b></b></span><span class="n3-radar-legend-item" data-legend="comp" style="--legend-color:#8061cc"><i></i>Конкурент <b></b></span><span class="n3-radar-legend-item" data-legend="market" style="--legend-color:#d39a32"><i></i>Пазарна промяна <b></b></span><span class="n3-radar-legend-item" data-legend="info" style="--legend-color:#4a86ba"><i></i>Друг значим сигнал <b></b></span></div><small class="n3-radar-legend-note">По-голяма точка = по-висока значимост · Пулсираща точка = нов сигнал</small>`;radar.insertAdjacentElement('afterend',legend)}
  const counts=radarCounts();for(const [k,v] of Object.entries(counts))setText(legend.querySelector(`[data-legend="${k}"] b`),String(v));
}
let normalizeTimer=0,uiTimer=0,copyObserver=null;
function scheduleNormalization(delay=25){clearTimeout(normalizeTimer);normalizeTimer=setTimeout(()=>normalizeBulgarianCopy(document.querySelector('.page.active')||document),delay)}
function scheduleClientUI(delay=28){clearTimeout(uiTimer);uiTimer=setTimeout(()=>{normalizeRouteLabels();ensureRadarLegend()},delay)}
function watchLateRenders(){
  if(copyObserver)return;
  const root=document.querySelector('.shell')||document.body;if(!root)return;
  copyObserver=new MutationObserver(mutations=>{
    const changed=mutations.some(m=>m.type==='characterData'||m.addedNodes?.length||m.type==='attributes');
    if(!changed)return;
    disableLanguageSwitches(root);
    scheduleNormalization(12);
    scheduleClientUI(18);
  });
  copyObserver.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','data-blis-language-switch']});
}
function forceBulgarian(){
  installBulgarianLockCss();
  document.documentElement.lang='bg';
  document.documentElement.dataset.navigatorLanguage='bg-only';
  window.BLIS_LANGUAGE='bg';
  disableLanguageSwitches(document);
  const sub=document.querySelector('.brandsub');if(sub)sub.textContent='Система за бизнес анализ и наблюдение';
  normalizeBulgarianCopy(document);
}
function decorate(){
  forceBulgarian();watchLateRenders();
  document.querySelectorAll('.nv3-story').forEach(n=>n.remove());
  const id=current(),page=document.getElementById(id);
  if(page)normalizeBulgarianCopy(page);
  normalizeRouteLabels();ensureRadarLegend();
  scheduleNormalization(90);scheduleNormalization(260);scheduleClientUI(110);scheduleClientUI(280);
  document.documentElement.dataset.navigatorClarity='simplified-client-clarity-v5-short-labels-radar-legend';
  document.documentElement.dataset.navigatorCopyOwner='source-localized-v5';
}
let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(decorate,35)}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISNavigator3ClientClarity={decorate,schedule,story:STORY,normalizeBulgarianCopy,normalizeRouteLabels,ensureRadarLegend,scheduleNormalization,disableLanguageSwitches};
})();

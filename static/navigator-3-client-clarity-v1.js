/* BLIS Navigator 3.0 — client clarity owner v4.
   Bulgarian-only, source-localized analytical renderers without duplicate page-story panels. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_CLIENT_CLARITY_V1)return;
window.__BLIS_NAVIGATOR_3_CLIENT_CLARITY_V1=true;
const STORY={
 overview:{label:'Общ преглед',question:'Как е брандът ми сега?',copy:'Виждате общото състояние, последната посока и факторите, които най-силно движат картината.'},
 social:{label:'Сигнали и наблюдение',question:'Какво се случва в момента?',copy:'Радарът събира значимите сигнали, видимостта, рисковете и възможностите и показва къде се проявява всяка промяна.'},
 market:{label:'Пазар и репутация',question:'Какво се случва около бранда и как се възприема?',copy:'Пазарните теми и публичното възприятие се четат заедно, за да се вижда връзката между средата и репутационния ефект.'},
 competition:{label:'Конкуренция',question:'Как се движим спрямо останалите?',copy:'Сравнението показва текущата позиция, движението на конкурентите и конкретните сигнали зад промяната.'},
 history:{label:'Развитие и доклади',question:'Как се развива картината във времето?',copy:'Траекторията на BLIS индекса се свързва с ключовите събития и с реално публикуваните клиентски доклади.'}
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
function installBulgarianLockCss(){
  if(document.getElementById('navigator3BulgarianLockCss'))return;
  const style=document.createElement('style');
  style.id='navigator3BulgarianLockCss';
  style.textContent='.bch3-lang,[data-blis-language-switch],.n3-language-switch-disabled{display:none!important}';
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
let normalizeTimer=0,copyObserver=null;
function scheduleNormalization(delay=25){clearTimeout(normalizeTimer);normalizeTimer=setTimeout(()=>normalizeBulgarianCopy(document.querySelector('.page.active')||document),delay)}
function watchLateRenders(){
  if(copyObserver)return;
  const root=document.querySelector('.shell')||document.body;if(!root)return;
  copyObserver=new MutationObserver(mutations=>{
    const changed=mutations.some(m=>m.type==='characterData'||m.addedNodes?.length||m.type==='attributes');
    if(!changed)return;
    disableLanguageSwitches(root);
    scheduleNormalization(12);
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
  scheduleNormalization(90);scheduleNormalization(260);
  document.documentElement.dataset.navigatorClarity='simplified-client-clarity-v4-no-story';
  document.documentElement.dataset.navigatorCopyOwner='source-localized-v4';
}
let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(decorate,35)}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISNavigator3ClientClarity={decorate,schedule,story:STORY,normalizeBulgarianCopy,scheduleNormalization,disableLanguageSwitches};
})();

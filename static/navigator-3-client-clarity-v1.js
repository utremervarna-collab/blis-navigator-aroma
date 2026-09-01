/* BLIS Navigator 3.0 — client clarity owner v2.
   One business question per analytical page. Bulgarian-only, no methodology noise. */
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
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
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
    if(!mutations.some(m=>m.type==='characterData'||m.addedNodes?.length))return;
    scheduleNormalization(12);
  });
  copyObserver.observe(root,{subtree:true,childList:true,characterData:true});
}
function css(){if(document.getElementById('navigator3ClarityV2Css'))return;const s=document.createElement('style');s.id='navigator3ClarityV2Css';s.textContent=`.nv3-story{margin:0 0 11px;border:1px solid #dce6ef;border-left:4px solid #2f78b7;border-radius:0 13px 13px 0;background:linear-gradient(90deg,#f4f9fd,#fff);padding:10px 13px;display:flex;justify-content:space-between;gap:14px;align-items:center}.nv3-story span{display:block;color:#8295a7;font-size:7px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.nv3-story h3{margin:4px 0 0;color:#274965;font-size:13px}.nv3-story p{margin:4px 0 0;color:#6f8498;font-size:8.5px;line-height:1.45}.nv3-story-actions{display:flex;gap:6px;align-items:center;flex:0 0 auto}.nv3-next{border:1px solid #d8e4ee;border-radius:8px;background:#fff;color:#28639a;padding:6px 8px;font-size:7.5px;font-weight:850;cursor:pointer}@media(max-width:760px){.nv3-story{align-items:flex-start;flex-direction:column}.nv3-story-actions{width:100%;flex-wrap:wrap}}`;document.head.appendChild(s)}
function forceBulgarian(){document.documentElement.lang='bg';document.documentElement.dataset.navigatorLanguage='bg-only';window.BLIS_LANGUAGE='bg';document.querySelectorAll('.bch3-lang').forEach(x=>x.remove());const sub=document.querySelector('.brandsub');if(sub)sub.textContent='Система за бизнес анализ и наблюдение';normalizeBulgarianCopy(document)}
function decorate(){css();forceBulgarian();watchLateRenders();const id=current(),meta=STORY[id];if(!meta)return;const page=document.getElementById(id);if(!page||!page.classList.contains('active'))return;const host=id==='overview'?(document.getElementById('overviewPremium')||document.getElementById('overviewBody')||page):(document.getElementById(id+'Body')||page);if(!host)return;let box=host.querySelector(':scope > .nv3-story');if(!box){box=document.createElement('section');box.className='nv3-story';host.prepend(box)}const next=window.BLISSystemStructure?.following?.(id);box.innerHTML=`<div><span>Въпросът на тази страница</span><h3>${E(meta.question)}</h3><p>${E(meta.copy)}</p></div><div class="nv3-story-actions">${next?`<button type="button" class="nv3-next" data-nv3-next="${next.id}">Следва: ${E(next.label)} →</button>`:''}</div>`;normalizeBulgarianCopy(page);scheduleNormalization(90);scheduleNormalization(260);document.documentElement.dataset.navigatorClarity='simplified-client-clarity-v2'}
let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(decorate,35)}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-nv3-next]');if(!b)return;e.preventDefault();window.refGo?.(b.dataset.nv3Next)},true);for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();window.BLISNavigator3ClientClarity={decorate,schedule,story:STORY,normalizeBulgarianCopy,scheduleNormalization};
})();

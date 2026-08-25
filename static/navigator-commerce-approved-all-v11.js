/* BLIS Navigator — approved light product-card family, stable renderer. */
(function(){
'use strict';
if(window.__BLIS_COMMERCE_APPROVED_STABLE_20260825)return;
window.__BLIS_COMMERCE_APPROVED_STABLE_20260825=true;

const EXACT={
  corporate:'/service-cards/corporate.webp',
  full:'/service-cards/full.webp',
  analysis:'/service-cards/analysis.webp',
  monitor:'/service-cards/monitor.webp',
  'reputation-audit':'/service-cards/reputation.webp',
  'brand-scan':'/service-cards/brand-scan.webp'
};
const STYLE={
  monitor:['#16a86f','#eaf8f1','Наблюдение','◎'],analysis:['#f28a18','#fff2df','Анализ','⌕'],full:['#10aa8d','#e9faf6','Аналитично обслужване','◆'],corporate:['#7b4cc6','#f2edff','Корпоративна услуга','★'],
  'brand-scan':['#16a8dc','#eaf8ff','Бранд сканиране','⌕'],'reputation-audit':['#c83cbf','#fff0fb','Репутационен анализ','✓'],competitive:['#e48d17','#fff2df','Конкурентен анализ','♟'],digital:['#197ed0','#eaf5ff','Дигитална видимост','⌕'],attitudes:['#10a7a8','#eafafa','Потребителски нагласи','◉'],signals:['#148e59','#eaf8ef','Пазарни сигнали','⌁'],crisis:['#cc4747','#fff0ed','Crisis / Issue','!'],'comm-effect':['#5363c7','#eef0ff','Комуникационен ефект','↗'],'source-audit':['#687789','#f0f3f6','Източници и данни','▤'],blis360:['#b78927','#fff7dc','BLIS 360°','360°'],
  brand:['#109a7a','#eaf8f3','Допълнителна марка','B'],competitor:['#dc8617','#fff2df','Допълнителен конкурент','⇄'],market:['#138d63','#eaf8f2','Допълнителен пазар','◎'],language:['#3b70bf','#edf4ff','Допълнителен език','A'],weekly:['#7454bf','#f2edff','Седмичен brief','▤'],'crisis-watch':['#cc4747','#fff0ed','Crisis Watch','!'],api:['#2477af','#eaf6ff','API / Export','↔'],'white-label':['#b98b2a','#fff6df','White-label','W'],'deep-dive':['#9550bd','#f7efff','Deep-dive','⌕'],executive:['#a97f27','#fff5dd','Executive presentation','★'],'sector-radar':['#168d72','#eaf8f3','Секторен радар','⌁'],'regulatory-radar':['#5e70c1','#eef1ff','Регулаторен радар','§']
};
const ADDON_BENEFITS={
  brand:['Разширява обхвата без отделен профил','Сравнява повече марки в една среда','Запазва общата история и методология','Подходящо за портфолио от марки'],
  competitor:['Добавя още една конкурентна референция','Разширява сравнителната картина','Следи промени и тактики','Подпомага по-точно позициониране'],
  market:['Добавя нов географски контекст','Сравнява пазари в една среда','Открива локални различия','Подходящо при разширяване'],
  language:['Разширява наблюдението на още един език','Намалява пропуските в международна среда','Добавя локален комуникационен контекст','Подходящо за мултипазарни марки'],
  weekly:['Четири кратки експертни обзора месечно','По-кратък цикъл между сигнал и решение','Фокус върху най-важните промени','Подходящо за динамични категории'],
  'crisis-watch':['Приоритетно следене на рискова тема','Ранна ескалация при значима промяна','Фокус върху конкретен казус','Подходящо при репутационно напрежение'],
  api:['Автоматизиран export към външна система','Намалява ръчната работа с данни','Подходящо за BI интеграция','Поддържа регулярни exports'],
  'white-label':['Доклади с брандинг на клиента или партньора','Подходящо за вътрешни и партньорски екипи','Запазва аналитичното съдържание','Единен професионален формат'],
  'deep-dive':['Разширен анализ на конкретна тема','По-дълбока проверка на причините','Допълва текущия абонамент','Ясни изводи и приоритети'],
  executive:['Подготовка на ключовите изводи за представяне','Фокус върху решения и приоритети','Структурирана аналитична среща','Подходящо за executive формат'],
  'sector-radar':['Следи секторни теми и ранни сигнали','Добавя контекст извън конкретната марка','Открива промени по-рано','Подпомага планирането'],
  'regulatory-radar':['Следи релевантни регулаторни промени','Събира институционални сигнали','Маркира потенциално въздействие','Подпомага навременна подготовка']
};
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const EUR=n=>Number(n||0).toLocaleString('bg-BG',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const catalog=()=>window.BLISCommerceSafe?.catalog||{services:[],addons:[]};
const service=id=>catalog().services?.find(x=>x.id===id)||null;
const addon=id=>catalog().addons?.find(x=>x.id===id)||null;
function idOf(card){return card?.querySelector?.('[data-bc3-request]')?.dataset?.bc3Request||card?.querySelector?.('[data-bc3-addon-request]')?.dataset?.bc3AddonRequest||card?.dataset?.bc7Id||''}
function dataOf(id){const s=service(id);if(s)return {...s,_kind:'service'};const a=addon(id);if(a)return {...a,_kind:'addon'};return null}
function styleOf(d){return STYLE[d.id]||[d.accent||'#1795ad','#edf9fa',d._kind==='addon'?'Допълнителна услуга':d.kind==='subscription'?'Абонаментна услуга':'Индивидуална услуга','✦']}
function typeOf(d){if(d._kind==='addon')return 'Допълнителна услуга';return d.kind==='subscription'?'Абонаментна услуга':'Индивидуална услуга'}
function cadenceOf(d){if(d._kind==='addon')return d.cycle==='месец'?'/ месец':'/ еднократно';return d.kind==='subscription'?'/ месец':'/ еднократно'}
function benefitsOf(d){if(d._kind==='addon')return ADDON_BENEFITS[d.id]||[d.description,'Ясен допълнителен обхват','Интегрира се към активния профил','Активира се след потвърждение'];const src=[...(d.benefits||[]),...(d.scope||[])].filter(Boolean);return [...new Set(src)].slice(0,4)}
function priceOf(d){return `${d.from?'от ':''}${EUR(d.price)}<small>${E(cadenceOf(d))}</small>`}
function metaOf(d){if(d.setup)return `<span>Първоначална настройка</span><b>${EUR(d.setup)}</b>`;return `<span>${d._kind==='addon'?'Активиране':'Срок за реализация'}</span><b>${E(d.duration||'След потвърждение')}</b>`}
function artKind(id){if(['competitive'].includes(id))return 'bars';if(['digital','source-audit','deep-dive','brand-scan'].includes(id))return 'lens';if(['attitudes','brand','language','reputation-audit'].includes(id))return 'people';if(['signals','crisis','crisis-watch','sector-radar','regulatory-radar','market','monitor'].includes(id))return 'radar';if(['comm-effect','weekly','executive','analysis','full'].includes(id))return 'chart';if(id==='blis360'||id==='corporate')return 'globe';return 'badge'}
function posterHTML(d,withActions=true){const [accent,soft,label,icon]=styleOf(d),benefits=benefitsOf(d),rows=benefits.map((x,i)=>`<div class="bc12-benefit"><i>${['✦','◎','✓','↗'][i]||'•'}</i><span>${E(x)}</span></div>`).join(''),summary=d.summary||d.description||'';return `<div class="bc12-poster" style="--bc12-accent:${accent};--bc12-soft:${soft}">
  <div class="bc12-brand"><strong>BLIS</strong><span>Navigator</span></div>
  <div class="bc12-rule"><i></i><b>✦</b><i></i></div>
  <div class="bc12-type">${E(label||typeOf(d))}</div>
  <h3>${E(d.name)}</h3>
  <div class="bc12-art bc12-art-${artKind(d.id)}"><div class="bc12-orbit"></div><div class="bc12-disc"></div><div class="bc12-core">${E(icon)}</div><span class="bc12-mini m1"></span><span class="bc12-mini m2"></span><span class="bc12-mini m3"></span></div>
  <div class="bc12-price"><em>★</em><strong>${d.from?'от ':''}${EUR(d.price)}</strong><small>${E(cadenceOf(d))}</small></div>
  <p class="bc12-summary">${E(summary)}</p>
  <section class="bc12-benefits"><h4>Ползи за клиента</h4>${rows}</section>
  <div class="bc12-meta">${metaOf(d)}</div>
  ${withActions?`<div class="bc12-poster-actions"><button type="button" data-bc12-order>Заяви</button><button type="button" data-bc12-more>Виж повече</button></div>`:''}
  <footer>Всички цени са ориентировъчни и са без ДДС.</footer>
</div>`}
function showAddonMore(d){const m=document.getElementById('bc3Modal'),t=document.getElementById('bc3ModalTitle'),b=document.getElementById('bc3ModalBody');if(!m||!t||!b)return;t.textContent=d.name;b.innerHTML=`<p>${E(d.description||'')}</p><p><b>Цена:</b> ${EUR(d.price)} / ${E(d.cycle||'')}</p><h4>Ползи за клиента</h4><ul>${benefitsOf(d).map(x=>`<li>${E(x)}</li>`).join('')}</ul><p>Допълнението се активира към действащ клиентски профил след потвърждение на обхвата.</p>`;m.classList.add('open')}
function fireOrder(card){card.querySelector('[data-bc3-request],[data-bc3-addon-request]')?.click()}
function fireMore(card,d){const original=card.querySelector('[data-bc3-detail]');if(original){original.click();return}if(d._kind==='addon'){showAddonMore(d);return}fireOrder(card)}
function bindActions(root,card,d){root.querySelectorAll('[data-bc12-order]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();fireOrder(card)});root.querySelectorAll('[data-bc12-more]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();fireMore(card,d)})}
function clearOld(card){card.querySelectorAll(':scope > .bc8-poster,:scope > .bc11-poster,:scope > .bc11-exact-poster,:scope > .bc11-actions,:scope > .bc12-shell,:scope > .bc12-poster').forEach(n=>n.remove());card.classList.remove('bc8-exact-card','bc11-exact','bc11-generated','bc11-card','bc12-ready','bc12-exact','bc12-generated');delete card.dataset.bc8;delete card.dataset.bc11;delete card.dataset.bc12}
function exactShell(card,d,src){const shell=document.createElement('div');shell.className='bc12-shell bc12-shell-exact';shell.innerHTML=`<div class="bc12-fallback">${posterHTML(d,true)}</div><img class="bc12-approved-img" src="${src}?v=20260825-stable2" alt="${E(d.name)}" loading="eager" decoding="async"><button type="button" class="bc12-hit bc12-hit-order" data-bc12-order aria-label="Заяви ${E(d.name)}"></button><button type="button" class="bc12-hit bc12-hit-more" data-bc12-more aria-label="Виж повече за ${E(d.name)}"></button>`;const img=shell.querySelector('.bc12-approved-img');const loaded=()=>{if(img&&img.naturalWidth>20)shell.classList.add('bc12-image-loaded')};const failed=()=>{shell.classList.add('bc12-image-failed');img?.remove()};img?.addEventListener('load',loaded,{once:true});img?.addEventListener('error',failed,{once:true});requestAnimationFrame(()=>{if(img?.complete){if(img.naturalWidth>20)loaded();else failed()}});bindActions(shell,card,d);return shell}
function generatedShell(card,d){const shell=document.createElement('div');shell.className='bc12-shell bc12-shell-generated';shell.innerHTML=posterHTML(d,true);bindActions(shell,card,d);return shell}
function apply(card){const id=idOf(card),d=dataOf(id);if(!id||!d)return;if(card.dataset.bc12==='1'&&card.querySelector(':scope > .bc12-shell'))return;clearOld(card);card.dataset.bc12='1';card.classList.add('bc12-ready');const src=EXACT[id];const shell=src?exactShell(card,d,src):generatedShell(card,d);card.prepend(shell);card.classList.add(src?'bc12-exact':'bc12-generated')}
function enhance(){document.querySelectorAll('#commerceBody .bc3-card').forEach(apply)}
function reset(){document.querySelectorAll('#commerceBody .bc3-card').forEach(c=>{delete c.dataset.bc12;apply(c)})}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{queued=false;enhance()}))}
function observe(){const target=document.getElementById('commerceBody');if(!target||target.dataset.bc12Observed==='1')return;target.dataset.bc12Observed='1';new MutationObserver(queue).observe(target,{childList:true,subtree:true})}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-bc3-tab],[data-bc3-detail],[data-bc3-request],[data-bc3-addon-request],[data-blis-commerce-open]'))setTimeout(queue,0)},false);
window.addEventListener('blis:clientdata',()=>setTimeout(reset,0));
window.BLISCommerceApprovedAllV11={enhance,reset};
window.BLISCommerceExactCardsV8={enhance,reset};
function init(){observe();enhance();setTimeout(enhance,100);setTimeout(enhance,350);setTimeout(enhance,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
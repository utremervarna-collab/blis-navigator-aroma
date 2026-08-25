/* BLIS Navigator — approved light product-card family v13. Sharp HTML + inline vector renderer. */
(function(){
'use strict';
if(window.__BLIS_COMMERCE_APPROVED_V13)return;
window.__BLIS_COMMERCE_APPROVED_V13=true;

const STYLE={
 monitor:['#18a86f','#eaf8f1','Абонаментна услуга','radar'],
 analysis:['#ef8618','#fff1dd','Абонаментна услуга','analysis'],
 full:['#13a98c','#e9faf5','Абонаментна услуга','team'],
 corporate:['#7447bf','#f2edff','Корпоративна услуга','corporate'],
 'brand-scan':['#169fd3','#eaf7ff','Индивидуална услуга','lens'],
 'reputation-audit':['#c83dbd','#fff0fb','Индивидуална услуга','shield'],
 competitive:['#df8917','#fff2df','Конкурентен анализ','competitive'],
 digital:['#197bc8','#eaf5ff','Дигитална видимост','lens'],
 attitudes:['#119f9e','#eafafa','Потребителски нагласи','people'],
 signals:['#148d59','#eaf8ef','Пазарни сигнали','radar'],
 crisis:['#cb4747','#fff0ed','Crisis / Issue','alert'],
 'comm-effect':['#5362c5','#eef0ff','Комуникационен ефект','chart'],
 'source-audit':['#687789','#f0f3f6','Източници и данни','document'],
 blis360:['#b78927','#fff7dc','BLIS 360°','globe'],
 brand:['#109a7a','#eaf8f3','Допълнителна марка','brand'],
 competitor:['#dc8617','#fff2df','Допълнителен конкурент','competitive'],
 market:['#138d63','#eaf8f2','Допълнителен пазар','radar'],
 language:['#3b70bf','#edf4ff','Допълнителен език','language'],
 weekly:['#7454bf','#f2edff','Седмичен brief','document'],
 'crisis-watch':['#cb4747','#fff0ed','Crisis Watch','alert'],
 api:['#2477af','#eaf6ff','API / Export','api'],
 'white-label':['#b98b2a','#fff6df','White-label','document'],
 'deep-dive':['#9550bd','#f7efff','Deep-dive','lens'],
 executive:['#a97f27','#fff5dd','Executive presentation','chart'],
 'sector-radar':['#168d72','#eaf8f3','Секторен радар','radar'],
 'regulatory-radar':['#5e70c1','#eef1ff','Регулаторен радар','document']
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
function styleOf(d){return STYLE[d.id]||[d.accent||'#1795ad','#edf9fa',d._kind==='addon'?'Допълнителна услуга':d.kind==='subscription'?'Абонаментна услуга':'Индивидуална услуга','badge']}
function cadence(d){if(d._kind==='addon')return d.cycle==='месец'?'/ месец':'/ еднократно';return d.kind==='subscription'?'/ месец':'/ еднократно'}
function benefits(d){if(d._kind==='addon')return ADDON_BENEFITS[d.id]||[d.description,'Ясен допълнителен обхват','Интегрира се към активния профил','Активира се след потвърждение'];const src=[...(d.benefits||[]),...(d.scope||[])].filter(Boolean);return [...new Set(src)].slice(0,4)}
function titleClass(name){const n=String(name||'').length;return n>35?'bc13-title-xlong':n>24?'bc13-title-long':''}
function meta(d){if(d.setup)return `<span>Първоначална настройка</span><b>${EUR(d.setup)}</b>`;return `<span>${d._kind==='addon'?'Активиране':'Срок за реализация'}</span><b>${E(d.duration||'След потвърждение')}</b>`}
function uid(id){return 'bc13'+String(id||'x').replace(/[^a-z0-9]/gi,'')}
function artSVG(d){const [accent,soft,,kind]=styleOf(d),u=uid(d.id);const defs=`<defs><linearGradient id="${u}a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".48" stop-color="${soft}"/><stop offset="1" stop-color="${accent}"/></linearGradient><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff6bf"/><stop offset=".55" stop-color="#e2ad3d"/><stop offset="1" stop-color="#9c6819"/></linearGradient><filter id="${u}s" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="11" stdDeviation="8" flood-color="#173653" flood-opacity=".22"/></filter></defs>`;
 const base=`<ellipse cx="180" cy="225" rx="112" ry="25" fill="#fff9e9" stroke="url(#${u}g)" stroke-width="4"/><ellipse cx="180" cy="221" rx="82" ry="14" fill="${accent}" opacity=".12"/>`;
 let body='';
 if(kind==='radar'){body=`${base}<circle cx="180" cy="123" r="81" fill="url(#${u}a)" stroke="url(#${u}g)" stroke-width="6"/><circle cx="180" cy="123" r="57" fill="none" stroke="${accent}" stroke-opacity=".35"/><circle cx="180" cy="123" r="31" fill="none" stroke="${accent}" stroke-opacity=".28"/><path d="M180 123L244 77A81 81 0 0 1 257 149Z" fill="${accent}" opacity=".32"/><path d="M180 42v162M99 123h162M123 66l114 114M237 66L123 180" stroke="#7f98ad" stroke-opacity=".34"/><circle cx="225" cy="91" r="7" fill="${accent}"/><circle cx="139" cy="146" r="6" fill="#eab13a"/><circle cx="205" cy="168" r="6" fill="#6c8fae"/>`}
 else if(kind==='lens'){body=`${base}<rect x="76" y="48" width="204" height="138" rx="20" fill="#fff" stroke="url(#${u}g)" stroke-width="5"/><path d="M99 157l27-28 27 14 34-40 29 14 38-50" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/><rect x="105" y="153" width="14" height="20" fill="#9bc3df"/><rect x="129" y="141" width="14" height="32" fill="#6ba9d7"/><rect x="153" y="126" width="14" height="47" fill="${accent}"/><circle cx="204" cy="141" r="51" fill="rgba(255,255,255,.88)" stroke="url(#${u}g)" stroke-width="7"/><circle cx="204" cy="141" r="27" fill="${soft}" stroke="${accent}" stroke-width="4"/><path d="M241 180l43 43" stroke="#153d61" stroke-width="15" stroke-linecap="round"/>`}
 else if(kind==='competitive'){body=`${base}<rect x="82" y="135" width="38" height="67" rx="7" fill="#c7d0d7"/><rect x="137" y="91" width="38" height="111" rx="7" fill="#efb43d"/><rect x="192" y="113" width="38" height="89" rx="7" fill="#c97e2f"/><circle cx="101" cy="118" r="17" fill="#bfc8cf"/><circle cx="156" cy="73" r="17" fill="#f3c856"/><circle cx="211" cy="96" r="17" fill="#d48a39"/><circle cx="223" cy="160" r="50" fill="rgba(255,255,255,.88)" stroke="url(#${u}g)" stroke-width="7"/><path d="M195 177l16-19 14 7 23-28" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`}
 else if(kind==='shield'){body=`${base}<path d="M180 47l68 25v57c0 47-28 75-68 94-40-19-68-47-68-94V72Z" fill="url(#${u}a)" stroke="url(#${u}g)" stroke-width="7"/><path d="M144 130l24 24 49-57" fill="none" stroke="${accent}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><rect x="227" y="50" width="70" height="42" rx="11" fill="#fff" stroke="${accent}" stroke-width="3"/><text x="262" y="79" text-anchor="middle" font-family="Arial" font-size="22" fill="#e6ad35">★★★★★</text>`}
 else if(kind==='team'||kind==='people'){body=`${base}<circle cx="180" cy="111" r="72" fill="#fff" stroke="url(#${u}g)" stroke-width="6"/><circle cx="180" cy="91" r="20" fill="${accent}"/><circle cx="142" cy="111" r="14" fill="#8aabc4"/><circle cx="218" cy="111" r="14" fill="#93c9a8"/><path d="M147 158q11-27 31-21q18 4 25 27M112 155q10-22 27-17q12 4 16 19M203 158q12-26 30-20q13 4 18 20" fill="${soft}" stroke="${accent}" stroke-width="4"/>`}
 else if(kind==='chart'||kind==='analysis'){body=`${base}<rect x="71" y="50" width="215" height="143" rx="21" fill="#fff" stroke="url(#${u}g)" stroke-width="6"/><rect x="101" y="143" width="18" height="28" rx="4" fill="#78aed8"/><rect x="132" y="126" width="18" height="45" rx="4" fill="#52a0d8"/><rect x="163" y="105" width="18" height="66" rx="4" fill="${accent}"/><rect x="194" y="86" width="18" height="85" rx="4" fill="#f0bb43"/><rect x="225" y="68" width="18" height="103" rx="4" fill="#d9952f"/><path d="M92 138l35-31 31 16 33-40 29 15 39-42" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`}
 else if(kind==='corporate'||kind==='globe'){body=`${base}<circle cx="180" cy="121" r="77" fill="url(#${u}a)" stroke="url(#${u}g)" stroke-width="7"/><ellipse cx="180" cy="121" rx="77" ry="33" fill="none" stroke="${accent}" stroke-width="3"/><ellipse cx="180" cy="121" rx="33" ry="77" fill="none" stroke="#d3a03c" stroke-width="3"/><path d="M108 92h144M108 150h144" stroke="#8aa3b6" stroke-opacity=".55" stroke-width="2"/><circle cx="229" cy="83" r="7" fill="#e3ad39"/><circle cx="142" cy="143" r="6" fill="${accent}"/><circle cx="213" cy="165" r="6" fill="#6d91ad"/>`}
 else if(kind==='language'){body=`${base}<rect x="94" y="60" width="172" height="126" rx="24" fill="#fff" stroke="url(#${u}g)" stroke-width="6"/><text x="143" y="127" text-anchor="middle" font-family="Arial" font-size="57" font-weight="900" fill="${accent}">A</text><text x="216" y="133" text-anchor="middle" font-family="Arial" font-size="52" font-weight="900" fill="#c6902b">文</text><path d="M126 155h108" stroke="#9db1c0" stroke-width="4" stroke-linecap="round"/>`}
 else if(kind==='document'||kind==='api'){body=`${base}<rect x="105" y="46" width="150" height="159" rx="19" fill="#fff" stroke="url(#${u}g)" stroke-width="6"/><rect x="128" y="77" width="90" height="10" rx="5" fill="${accent}" opacity=".85"/><rect x="128" y="101" width="102" height="8" rx="4" fill="#9eb2c2"/><rect x="128" y="121" width="87" height="8" rx="4" fill="#b3c2cd"/><rect x="128" y="141" width="96" height="8" rx="4" fill="#9eb2c2"/><circle cx="215" cy="174" r="22" fill="${soft}" stroke="${accent}" stroke-width="4"/><path d="M203 174h24M215 162v24" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`}
 else if(kind==='alert'){body=`${base}<circle cx="180" cy="121" r="73" fill="url(#${u}a)" stroke="url(#${u}g)" stroke-width="7"/><path d="M180 72l55 95H125Z" fill="#fff" stroke="${accent}" stroke-width="6" stroke-linejoin="round"/><path d="M180 101v33" stroke="${accent}" stroke-width="9" stroke-linecap="round"/><circle cx="180" cy="151" r="6" fill="${accent}"/>`}
 else if(kind==='brand'){body=`${base}<circle cx="180" cy="120" r="73" fill="url(#${u}a)" stroke="url(#${u}g)" stroke-width="7"/><text x="180" y="148" text-anchor="middle" font-family="Arial" font-size="77" font-weight="900" fill="${accent}">B</text><circle cx="238" cy="72" r="24" fill="#fff" stroke="${accent}" stroke-width="4"/><text x="238" y="80" text-anchor="middle" font-family="Arial" font-size="21" fill="#d8a13a">★</text>`}
 else body=`${base}<circle cx="180" cy="121" r="73" fill="url(#${u}a)" stroke="url(#${u}g)" stroke-width="7"/><text x="180" y="136" text-anchor="middle" font-family="Arial" font-size="37" font-weight="900" fill="${accent}">BLIS</text>`;
 return `<svg viewBox="0 0 360 260" aria-hidden="true">${defs}<g filter="url(#${u}s)">${body}</g></svg>`;
}
function markup(d){const [accent,soft,label]=styleOf(d),rows=benefits(d).map((x,i)=>`<div class="bc13-benefit"><i>${['✦','◎','✓','↗'][i]||'•'}</i><span>${E(x)}</span></div>`).join('');const summary=d.summary||d.description||'';return `<div class="bc13-poster ${titleClass(d.name)}" style="--bc13-accent:${accent};--bc13-soft:${soft}">
 <div class="bc13-brand"><strong>BLIS</strong><span>Navigator</span></div>
 <div class="bc13-rule"><i></i><b>✦</b><i></i></div>
 <div class="bc13-type">${E(label)}</div>
 <h3>${E(d.name)}</h3>
 <div class="bc13-art">${artSVG(d)}</div>
 <div class="bc13-price"><em>★</em><strong>${d.from?'от ':''}${EUR(d.price)}</strong><small>${E(cadence(d))}</small></div>
 <p class="bc13-summary">${E(summary)}</p>
 <section class="bc13-benefits"><h4>Ползи за клиента</h4>${rows}</section>
 <div class="bc13-meta">${meta(d)}</div>
 <div class="bc13-actions"><button type="button" data-bc13-order>Заяви</button><button type="button" data-bc13-more>Виж повече</button></div>
 <footer>Всички цени са ориентировъчни и са без ДДС.</footer>
 </div>`}
function addonMore(d){const m=document.getElementById('bc3Modal'),t=document.getElementById('bc3ModalTitle'),b=document.getElementById('bc3ModalBody');if(!m||!t||!b)return;t.textContent=d.name;b.innerHTML=`<p>${E(d.description||'')}</p><p><b>Цена:</b> ${EUR(d.price)} / ${E(d.cycle||'')}</p><h4>Ползи за клиента</h4><ul>${benefits(d).map(x=>`<li>${E(x)}</li>`).join('')}</ul><p>Допълнението се активира към действащ клиентски профил след потвърждение на обхвата.</p>`;m.classList.add('open')}
function order(card){card.querySelector('[data-bc3-request],[data-bc3-addon-request]')?.click()}
function more(card,d){const b=card.querySelector('[data-bc3-detail]');if(b){b.click();return}if(d._kind==='addon'){addonMore(d);return}order(card)}
function clearLegacy(card){card.querySelectorAll(':scope > .bc8-poster,:scope > .bc11-poster,:scope > .bc11-exact-poster,:scope > .bc11-actions,:scope > .bc12-shell,:scope > .bc12-poster,:scope > .bc13-shell').forEach(n=>n.remove());['bc8-exact-card','bc11-exact','bc11-generated','bc11-card','bc12-ready','bc12-exact','bc12-generated','bc13-ready'].forEach(c=>card.classList.remove(c));delete card.dataset.bc8;delete card.dataset.bc11;delete card.dataset.bc12;delete card.dataset.bc13;delete card.dataset.bc13Id}
function render(card){const id=idOf(card),d=dataOf(id);if(!id||!d){card.classList.remove('bc13-ready');return false}if(card.dataset.bc13Id===id&&card.querySelector(':scope > .bc13-shell'))return true;clearLegacy(card);const shell=document.createElement('div');shell.className='bc13-shell';shell.innerHTML=markup(d);shell.querySelector('[data-bc13-order]').onclick=e=>{e.preventDefault();e.stopPropagation();order(card)};shell.querySelector('[data-bc13-more]').onclick=e=>{e.preventDefault();e.stopPropagation();more(card,d)};card.prepend(shell);card.dataset.bc13='1';card.dataset.bc13Id=id;card.classList.add('bc13-ready');return true}
function renderAll(){document.querySelectorAll('#commerceBody .bc3-card').forEach(render)}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{queued=false;renderAll()}))}
let observer=null;function observe(){const root=document.getElementById('commerceBody');if(!root||observer)return;observer=new MutationObserver(queue);observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-bc7-id']})}
function reset(){document.querySelectorAll('#commerceBody .bc3-card').forEach(c=>{delete c.dataset.bc13Id;render(c)});observe()}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-bc3-tab],[data-bc3-detail],[data-bc3-request],[data-bc3-addon-request],[data-blis-commerce-open]')){setTimeout(queue,0);setTimeout(queue,120)}},true);
window.addEventListener('blis:clientdata',()=>{setTimeout(reset,0);setTimeout(reset,220)});
window.BLISCommerceApprovedAllV11={enhance:renderAll,reset};
function boot(){renderAll();observe();[60,180,420,900,1600].forEach(ms=>setTimeout(renderAll,ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
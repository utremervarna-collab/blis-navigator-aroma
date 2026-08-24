/* Wirello Market — module analytical visuals v1
   Owns only Wirello reputation, market, competition and signals diagrams.
   Uses HTML/CSS instead of SVG to avoid legacy renderer distortion. */
(function(){
'use strict';
if(window.__WIRELLO_MODULE_VISUALS_V1)return;window.__WIRELLO_MODULE_VISUALS_V1=true;
const isWirello=()=>document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const pct=v=>Math.max(0,Math.min(100,Number(v)||0));
const fmt=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});

function style(){
 if(document.getElementById('wm-module-visuals-style'))return;
 const s=document.createElement('style');s.id='wm-module-visuals-style';s.textContent=`
 body[data-client="wirello"] .wmv{font-family:Aptos,"Segoe UI",Arial,sans-serif;color:#20364d;padding:4px 0 26px}
 body[data-client="wirello"] .wmv *{box-sizing:border-box}
 body[data-client="wirello"] .wmv-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin:4px 0 22px}
 body[data-client="wirello"] .wmv-head h2{margin:0 0 7px;font-size:24px;line-height:1.15;color:#16324e;letter-spacing:-.02em}
 body[data-client="wirello"] .wmv-head p{margin:0;max-width:760px;font-size:13px;line-height:1.55;color:#687a8d}
 body[data-client="wirello"] .wmv-badge{white-space:nowrap;border:1px solid #dfe7ee;border-radius:999px;padding:7px 10px;background:#f8fafc;font-size:10px;font-weight:700;color:#627487}
 body[data-client="wirello"] .wmv-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:16px;margin-bottom:16px}
 body[data-client="wirello"] .wmv-grid.equal{grid-template-columns:1fr 1fr}
 body[data-client="wirello"] .wmv-card{background:#fff;border:1px solid #dfe6ed;border-radius:14px;padding:20px;box-shadow:0 6px 20px rgba(31,54,77,.035)}
 body[data-client="wirello"] .wmv-card h3{margin:0 0 5px;font-size:16px;color:#17324c}
 body[data-client="wirello"] .wmv-sub{margin:0 0 18px;font-size:11px;line-height:1.45;color:#7a8998}
 body[data-client="wirello"] .wmv-axis{display:grid;grid-template-columns:170px 1fr 58px;gap:12px;margin:0 0 4px;align-items:end}
 body[data-client="wirello"] .wmv-axis>div:nth-child(2){display:flex;justify-content:space-between;font-size:9px;color:#93a0ad;padding:0 1px}
 body[data-client="wirello"] .wmv-row{display:grid;grid-template-columns:170px 1fr 58px;gap:12px;align-items:center;margin:13px 0}
 body[data-client="wirello"] .wmv-label{font-size:12px;color:#41566b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 body[data-client="wirello"] .wmv-label b{color:#17324c}
 body[data-client="wirello"] .wmv-track{height:18px;position:relative;border-radius:4px;overflow:hidden;background-color:#eef2f5;background-image:linear-gradient(to right,rgba(153,169,187,.28) 1px,transparent 1px);background-size:25% 100%}
 body[data-client="wirello"] .wmv-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#2a70d6,#4d8de6)}
 body[data-client="wirello"] .wmv-fill.client{background:linear-gradient(90deg,#173f74,#2b69b2)}
 body[data-client="wirello"] .wmv-fill.good{background:linear-gradient(90deg,#21835d,#3fa279)}
 body[data-client="wirello"] .wmv-fill.warn{background:linear-gradient(90deg,#b36d22,#d28a36)}
 body[data-client="wirello"] .wmv-fill.risk{background:linear-gradient(90deg,#b94c52,#d7686d)}
 body[data-client="wirello"] .wmv-val{text-align:right;font-size:13px;font-weight:800;color:#17324c;font-variant-numeric:tabular-nums}
 body[data-client="wirello"] .wmv-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
 body[data-client="wirello"] .wmv-kpi{border:1px solid #e3e9ee;border-radius:11px;padding:15px;background:#fafbfd}
 body[data-client="wirello"] .wmv-kpi strong{display:block;font-size:27px;line-height:1;color:#17324c;letter-spacing:-.03em}
 body[data-client="wirello"] .wmv-kpi span{display:block;margin-top:7px;font-size:10px;line-height:1.4;color:#718194}
 body[data-client="wirello"] .wmv-insight{margin-top:14px;border-left:3px solid #2b69b2;padding:11px 13px;background:#f5f8fc;border-radius:0 9px 9px 0;font-size:11.5px;line-height:1.55;color:#465c72}
 body[data-client="wirello"] .wmv-list{display:grid;gap:9px}
 body[data-client="wirello"] .wmv-signal{display:grid;grid-template-columns:8px 1fr auto;gap:11px;align-items:center;border-bottom:1px solid #edf1f4;padding:9px 0}
 body[data-client="wirello"] .wmv-signal:last-child{border-bottom:0}
 body[data-client="wirello"] .wmv-dot{width:8px;height:8px;border-radius:50%;background:#2a70d6}
 body[data-client="wirello"] .wmv-dot.high{background:#c85258}.wmv-dot.medium{background:#cb842c}.wmv-dot.low{background:#2f956d}
 body[data-client="wirello"] .wmv-signal b{display:block;font-size:11.5px;color:#263d54}.wmv-signal small{display:block;margin-top:2px;font-size:9.5px;color:#81909f}
 body[data-client="wirello"] .wmv-tag{font-size:9px;font-weight:700;padding:5px 7px;border-radius:999px;background:#eef3f8;color:#5d7185}
 body[data-client="wirello"] .wmv-donut{width:154px;height:154px;margin:4px auto 16px;border-radius:50%;position:relative;background:conic-gradient(#c85258 0 16.67%,#cb842c 16.67% 66.67%,#2f956d 66.67% 100%)}
 body[data-client="wirello"] .wmv-donut:after{content:"12\Aсигнала";white-space:pre;display:grid;place-items:center;text-align:center;position:absolute;inset:26px;border-radius:50%;background:#fff;color:#17324c;font-size:14px;font-weight:800;line-height:1.2}
 body[data-client="wirello"] .wmv-legend{display:grid;gap:8px;font-size:10.5px;color:#617386}.wmv-legend span{display:flex;align-items:center;justify-content:space-between;gap:10px}.wmv-legend i{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:7px}
 body[data-client="wirello"] .wmv-source{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:17px;padding-top:10px;border-top:1px solid #e6ebef;font-size:9.5px;color:#8493a2}.wmv-source b{color:#617386}
 body[data-client="wirello"] .wmv-stepgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}.wmv-step{border:1px solid #e2e8ed;border-radius:11px;padding:13px;background:#fff}.wmv-step strong{display:block;font-size:21px;color:#17324c}.wmv-step b{display:block;margin-top:5px;font-size:11px;color:#334a60}.wmv-step span{display:block;margin-top:4px;font-size:9.5px;line-height:1.4;color:#7b8998}
 @media(max-width:900px){body[data-client="wirello"] .wmv-grid,body[data-client="wirello"] .wmv-grid.equal{grid-template-columns:1fr}body[data-client="wirello"] .wmv-axis,body[data-client="wirello"] .wmv-row{grid-template-columns:130px 1fr 48px}body[data-client="wirello"] .wmv-stepgrid{grid-template-columns:1fr 1fr}}
 @media(max-width:560px){body[data-client="wirello"] .wmv-head{display:block}body[data-client="wirello"] .wmv-badge{display:inline-block;margin-top:10px}body[data-client="wirello"] .wmv-axis{display:none}body[data-client="wirello"] .wmv-row{grid-template-columns:1fr 46px}.wmv-row .wmv-track{grid-column:1/-1;grid-row:2}.wmv-kpis,.wmv-stepgrid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}

const axis=()=>`<div class="wmv-axis"><span></span><div><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div><span></span></div>`;
const bar=(label,value,cls='')=>`<div class="wmv-row"><div class="wmv-label">${label}</div><div class="wmv-track"><div class="wmv-fill ${cls}" style="width:${pct(value)}%"></div></div><div class="wmv-val">${fmt(value)}</div></div>`;
const source=()=>`<div class="wmv-source"><span>Източник: BLIS demo dataset · Wirello Market</span><b>Демонстрационни данни</b></div>`;

function reputation(){
 const host=document.getElementById('reputationBody');if(!host||host.dataset.wmvOwned==='1')return;
 host.dataset.wmvOwned='1';
 host.innerHTML=`<div class="wmv"><div class="wmv-head"><div><h2>Репутационна среда</h2><p>Оценка на публичното доверие, потребителските мнения, медийната видимост и натиска от негативни сигнали. Показателите са разделени, за да не се скрива рискът зад една средна оценка.</p></div><span class="wmv-badge">Wirello Market · 30 дни</span></div><div class="wmv-grid"><div class="wmv-card"><h3>Репутационни показатели</h3><p class="wmv-sub">Единна скала 0–100. По-високата стойност е положителна, освен при „Репутационен натиск“.</p>${axis()}${bar('<b>Репутационен индекс</b>',79.6,'good')}${bar('Потребителски мнения',75.8,'good')}${bar('Медийна видимост',72.4)}${bar('Репутационен натиск',28.3,'risk')}<div class="wmv-insight"><b>Интерпретация:</b> общата репутация е стабилна, но повтарящите се оплаквания за чакане на касите преминават прага за наблюдение. Натискът е ограничен, но вече има потвърждение в повече от един обект.</div>${source()}</div><div class="wmv-card"><h3>Как се формира рискът</h3><p class="wmv-sub">Сигналът става значим, когато има повторяемост и независими доказателства.</p><div class="wmv-stepgrid" style="grid-template-columns:1fr 1fr"><div class="wmv-step"><strong>37</strong><b>доказателства</b><span>за темата „чакане на касите“</span></div><div class="wmv-step"><strong>4</strong><b>магазина</b><span>с повторяем сходен сигнал</span></div><div class="wmv-step"><strong>93%</strong><b>увереност</b><span>на регистрирания сигнал</span></div><div class="wmv-step"><strong>28.3</strong><b>натиск</b><span>текуща стойност от 100</span></div></div><div class="wmv-insight">BLIS отделя обема на оплакванията от общата оценка, за да се вижда ранно кога локален проблем започва да се превръща в системен.</div></div></div></div>`;
}

function competition(){
 const host=document.getElementById('competitionBody');if(!host||host.dataset.wmvOwned==='1')return;
 host.dataset.wmvOwned='1';
 host.innerHTML=`<div class="wmv"><div class="wmv-head"><div><h2>Конкурентна позиция</h2><p>Съпоставка по еднакъв набор от демонстрационни публични показатели. Wirello е маркиран отделно, за да се вижда реалната дистанция до водещия конкурент.</p></div><span class="wmv-badge">5 наблюдавани компании</span></div><div class="wmv-grid"><div class="wmv-card"><h3>Обща конкурентна оценка</h3><p class="wmv-sub">Скала 0–100. Подреждането е по текущата обща оценка.</p>${axis()}${bar('<b>VestaMart</b>',78.2)}${bar('<b>Wirello Market</b>',74.9,'client')}${bar('Nordela Market',72.7)}${bar('UrbanBasket',69.8)}${bar('Fresco Point',67.4)}<div class="wmv-insight"><b>Позиция:</b> Wirello е на 3.3 пункта зад VestaMart и на 2.2 пункта пред Nordela. Най-важният текущ конкурентен сигнал е безплатната доставка на VestaMart над 45 €.</div>${source()}</div><div class="wmv-card"><h3>Динамика на конкурентите</h3><p class="wmv-sub">Промяна спрямо собствената база за наблюдавания период.</p><div class="wmv-kpis"><div class="wmv-kpi"><strong>+3.8</strong><span>UrbanBasket · най-бърза положителна динамика</span></div><div class="wmv-kpi"><strong>+2.8</strong><span>Wirello Market · текуща динамика</span></div><div class="wmv-kpi"><strong>+2.5</strong><span>Fresco Point · засилено fresh/healthy позициониране</span></div><div class="wmv-kpi"><strong>+1.9</strong><span>VestaMart · лидер по обща оценка</span></div></div><div class="wmv-insight">Лидерът по обща оценка не е непременно най-бързо растящият конкурент. BLIS следи и двете измерения отделно.</div></div></div></div>`;
}

function market(){
 const host=document.getElementById('marketBody');if(!host||host.dataset.wmvOwned==='1')return;
 host.dataset.wmvOwned='1';
 host.innerHTML=`<div class="wmv"><div class="wmv-head"><div><h2>Пазарни сигнали</h2><p>Текущите промени са групирани по бизнес тема и тежест, вместо да се показват като несвързан поток от отделни събития.</p></div><span class="wmv-badge">12 активни сигнала</span></div><div class="wmv-grid"><div class="wmv-card"><h3>Разпределение по тема</h3><p class="wmv-sub">Брой регистрирани сигнали в текущия демонстрационен период.</p>${axis()}${bar('<b>Пазар / потребител</b>',60,'client')}${bar('Социални канали',60)}${bar('Репутация',40)}${bar('Конкуренти',40)}${bar('Дигитална среда',40)}<div class="wmv-sub" style="margin-top:12px">Скалата е нормализирана спрямо максимума от 3 сигнала в категория: 3 = 100% от локалния максимум.</div><div class="wmv-insight"><b>Водеща тема:</b> „цена / стойност“ увеличава дела си в потребителските дискусии, докато Wirello Select отчита +31% положителни продуктови споменавания.</div>${source()}</div><div class="wmv-card"><h3>Тежест на сигналите</h3><p class="wmv-sub">Реален брой по приоритет в демонстрационния набор.</p><div class="wmv-donut"></div><div class="wmv-legend"><span><span><i style="background:#c85258"></i>Висок приоритет</span><b>2</b></span><span><span><i style="background:#cb842c"></i>Среден приоритет</span><b>6</b></span><span><span><i style="background:#2f956d"></i>Нисък приоритет</span><b>4</b></span></div><div class="wmv-insight">Двата високоприоритетни сигнала са оперативният репутационен проблем с чакането на касите и конкурентната оферта за безплатна доставка на VestaMart.</div></div></div></div>`;
}

function signals(){
 const host=document.getElementById('signalsBody');if(!host||host.dataset.wmvOwned==='1')return;
 host.dataset.wmvOwned='1';
 host.innerHTML=`<div class="wmv"><div class="wmv-head"><div><h2>Сигнали и потребителски нагласи</h2><p>Подбрани промени с най-висока практическа стойност. Всеки ред показва посоката, доказателствената база и текущия приоритет.</p></div><span class="wmv-badge">BLIS Signal Center</span></div><div class="wmv-grid equal"><div class="wmv-card"><h3>Сигнали за действие</h3><p class="wmv-sub">Подредени по тежест и увереност.</p><div class="wmv-list"><div class="wmv-signal"><span class="wmv-dot high"></span><div><b>Нарастват оплакванията за чакане на касите</b><small>37 доказателства · 93% увереност · 4 магазина</small></div><span class="wmv-tag">Висок</span></div><div class="wmv-signal"><span class="wmv-dot high"></span><div><b>VestaMart активира безплатна доставка над 45 €</b><small>14 доказателства · 97% увереност</small></div><span class="wmv-tag">Висок</span></div><div class="wmv-signal"><span class="wmv-dot medium"></span><div><b>„Цена / стойност“ става водеща потребителска тема</b><small>31 доказателства · 89% увереност</small></div><span class="wmv-tag">Среден</span></div><div class="wmv-signal"><span class="wmv-dot medium"></span><div><b>Брандовите търсения нарастват с 18.4%</b><small>21 доказателства · 92% увереност</small></div><span class="wmv-tag">Среден</span></div></div>${source()}</div><div class="wmv-card"><h3>Нагласи и възприятие</h3><p class="wmv-sub">Сравнение на основните измерения, които влияят върху избора и публичното възприятие.</p>${axis()}${bar('Дигитална видимост',82.1,'good')}${bar('Репутация',79.6,'good')}${bar('Социално присъствие',78.4)}${bar('Потребителски мнения',75.8)}${bar('Конкурентна позиция',74.9,'client')}<div class="wmv-insight">Най-силният актив е дигиталната видимост. Най-голямата относителна слабост остава конкурентната позиция, а „цена / стойност“ е темата, която трябва да се следи най-внимателно.</div>${source()}</div></div></div>`;
}

function apply(){if(!isWirello())return;style();reputation();competition();market();signals()}
function schedule(){[0,80,260,700,1400].forEach(ms=>setTimeout(apply,ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button,[data-page]'))schedule()});
window.addEventListener('hashchange',schedule);
const root=document.querySelector('.main')||document.body;
let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,90)}).observe(root,{subtree:true,childList:true});
})();
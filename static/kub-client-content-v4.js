/* BLIS KUB Client Content v4
   Keeps the approved page architecture and replaces stale/technical copy with
   client-facing intelligence derived from the live KUB signal feed. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
if(window.__KUB_CLIENT_CONTENT_V4)return;window.__KUB_CLIENT_CONTENT_V4=true;

const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const ts=s=>{const d=new Date(s||0);return Number.isNaN(d.getTime())?0:d.getTime()};
const now=()=>Date.now();
const low=r=>(String(r.title||'')+' '+String(r.text||'')+' '+String(r.source||'')).toLowerCase();
const src=r=>clean(r.source||r.src||'външен източник');
const pub=r=>r.published_at||r.p||r.detected_at||'';
const fmtTime=s=>{const d=new Date(s||0);return Number.isNaN(d.getTime())?'—':d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})};
const fmtDate=s=>{const d=new Date(s||0);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})};
function isWithin(r,h){const t=ts(pub(r));return t>0&&t>=now()-h*3600000;}
function isInstitution(r){return /съд|прокурат|парламент|народното събрание|община|данс|полици|министер|строителен контрол|административ/.test(low(r));}
function isUtilities(r){return /ток|електро|електрозахран|вода|водоснабд|вик|захран/.test(low(r));}
function isRemoval(r){return /премах|събар|заповед|запечат|достъп/.test(low(r));}
function isPolitical(r){return /възраждане|депутат|парламент|политичес|чадър|данс/.test(low(r));}
function isBuyer(r){return /купувач|собственик|жител|договор|плащан|имот/.test(low(r));}
function isKUBPosition(r){return /kybcorp|куб заяв|позици.*куб|корпоративен канал|forestclub\.bg/.test(low(r))||String(r.scope||'').toLowerCase()==='owned';}
function critical(r){return String(r.severity||'').toLowerCase()==='critical'||Number(r.risk_score||0)>=80;}
function uniq(rows,fn){return new Set(rows.map(fn).filter(Boolean)).size;}
function sortRows(rows){return rows.slice().sort((a,b)=>ts(pub(b))-ts(pub(a)));}
function safeURL(r){try{const u=new URL(r.url||'',location.origin);return /^https?:$/.test(u.protocol)?u.href:''}catch(_){return ''}}
function metric(card,label,value,sub){if(!card)return;const l=card.querySelector('.label'),v=card.querySelector('.value'),s=card.querySelector('.sub');if(l)l.textContent=label;if(v)v.textContent=value;if(s)s.textContent=sub;}

function cleanupLegacyMonitoring(){
  ['kubReliableLiveStatus','kubMonitoringHealthV1','kubLiveStatus'].forEach(id=>{const e=document.getElementById(id);if(e)e.remove();});
  document.querySelectorAll('#monitoring .filter').forEach(e=>{if(e.id==='kubFeedV3Status')return;const t=(e.textContent||'').toUpperCase();if(/НЯМА ВРЪЗКА|ПРОБЛЕМ СЪС СИНХРОНИЗАЦИЯТА|СИНХРОНИЗИРАНЕ/.test(t)&&!e.dataset.filter)e.remove();});
  const f=document.querySelector('#monitoring .footnote');
  if(f)f.textContent='Всеки открит публично индексиран сигнал се показва като отделен запис с час, източник и директен линк. Повтарящите се публикации се запазват, когато показват разпространението на една и съща тема.';
}

function rewriteStaticCopy(){
  const live=document.querySelector('.livebar > span:nth-of-type(2)');
  if(live)live.textContent='Режим: откриване → източник → фактологичен статус → риск → значение за клиента.';
  const validated=document.querySelector('.livebar .right b');
  if(validated)validated.textContent='Актуална работна база';

  // Overview language: preserve radar and card layout, remove obsolete fixed-base claims.
  const rh=document.querySelector('#overview .radarHead h2');if(rh)rh.textContent='Къде е текущият информационен натиск около „Баба Алино“';
  const rp=document.querySelector('#overview .radarHead p');if(rp)rp.textContent='Радарът обобщава активните линии в наблюдението: институции и съд, медии, услуги и позиция на КУБ. Числата до него се обновяват от текущия сигнален поток.';
  const rn=document.querySelector('#overview .radarNote');if(rn)rn.textContent='Радарът е ориентационна карта на активните линии. Текущите стойности се изчисляват от наличните сигнали, а не от предварително зададена демонстрационна база.';
  const rs=document.querySelector('.radarState');if(rs)rs.textContent='АКТИВЕН КРИЗИСЕН WATCH';
  const crit=document.querySelector('#overview .card.third');if(crit)crit.innerHTML='<h3 class="sectionTitle">Как да се чете този преглед</h3><div class="narrative"><b>1. Какво е ново</b><p>Показват се само съществени промени, нови събития и ново медийно разпространение.</p></div><div class="narrative"><b>2. Защо е важно</b><p>Всеки приоритет е свързан с конкретен правен, институционален, клиентски или репутационен ефект.</p></div><div class="narrative"><b>3. Какво следва</b><p>Следят се следващите решения, действия и сигнали, които могат да променят риска.</p></div>';

  // Stakeholders: replace assumed emotions with decision-relevant information needs.
  const stakeData={
   'Купувачи и жители':['Какво трябва да знаят: конкретен статус на имота/обекта, услуги, дело, срок и следваща стъпка.','Нужно: индивидуална, проверима информация и ясен канал за актуализации.'],
   'Община Варна':['Какво следим: нови заповеди, изпълнителни действия, ограничения на достъпа и официални позиции.','Нужно: документална проследимост по конкретен обект и формален комуникационен канал.'],
   'Прокуратура / контролни органи':['Какво следим: процесуални действия, проверки, официални съобщения и нови производства.','Нужно: единна доказателствена база и ясно разграничаване между факт, твърдение и висяща процедура.'],
   'Медии':['Какво следим: нови факти, заглавни рамки, разпространение и присъствие/липса на позицията на КУБ.','Нужно: кратък проверим отговор с документ или компетентен източник.'],
   'Партньори и банки':['Какво следим: доказуемо преливане на риска към други проекти, договорни отношения или финансиране.','Нужно: фактологичен статус, план за ограничаване на риска и доказуема проследимост.'],
   'Служители':['Какво следим: вътрешни противоречия, публични изказвания и оперативни промени.','Нужно: единен вътрешен протокол и актуална фактическа версия.'],
   'Местна общност':['Какво следим: достъп, инфраструктура, публични сигнали, организирани действия и локални медийни теми.','Нужно: проверими данни и конкретни отговори по засегнатите въпроси.'],
   'Политически участници':['Какво следим: нови декларации, парламентарни въпроси и твърдения, които усилват националната видимост на казуса.','Нужно: еднакъв фактологичен стандарт независимо от политическия източник.']
  };
  document.querySelectorAll('#stakeholders .stake').forEach(c=>{const h=clean((c.querySelector('h3')||{}).textContent);const d=stakeData[h];if(!d)return;const q=c.querySelector('.question'),p=c.querySelector('.proof');if(q)q.textContent=d[0];if(p)p.innerHTML='<b>Информационна нужда:</b> '+esc(d[1].replace(/^Нужно:\s*/i,''));});

  // Evidence: current publicly supported facts; no legal conclusion beyond source statements.
  const et=document.querySelector('#evidence .table');
  if(et)et.innerHTML='<tr><th>Тема</th><th>Какво е установено публично</th><th>Какво означава за наблюдението</th><th>Източник</th></tr>'+
   '<tr><td><b>Заповеди за премахване</b></td><td>Към 2 септември публичните материали съобщават за 19 издадени заповеди и още 4 подготвяни.</td><td>Не се обобщава като окончателно премахване на 23 обекта; следи се статутът на всяка заповед и евентуалното ѝ оспорване.</td><td><a target="_blank" rel="noopener" href="https://dnes.dir.bg/varna/novo-delo-za-toka-i-vodata-v-baba-alino-kmetat-s-novi-zapovedi-za-sabaryane">Dir.bg ↗</a></td></tr>'+
   '<tr><td><b>Ток и вода</b></td><td>На 2 септември е образувано ново административно дело по искане на „Форест Клуб Варна“ за незабавно възстановяване на захранването.</td><td>Това е нов процесуален етап; не е окончателно решение по спора.</td><td><a target="_blank" rel="noopener" href="https://bntnews.bg/news/sadat-vav-varna-reshava-za-spiraneto-na-toka-i-vodata-v-baba-alino-1410569news.html">БНТ ↗</a></td></tr>'+
   '<tr><td><b>Предходно искане</b></td><td>На 1 септември съдът е отхвърлил искане за незабавно възстановяване на електрозахранването за имоти на дружеството.</td><td>Новото дело от 2 септември трябва да се разглежда отделно от предходното производство.</td><td><a target="_blank" rel="noopener" href="https://www.bta.bg/bg/news/bulgaria/regional-news/varna/1195969-administrativniyat-sad-vav-varna-othvarli-iskaneto-za-nezabavno-vazstanovyavane-">БТА ↗</a></td></tr>'+
   '<tr><td><b>Политическо говорене</b></td><td>Казусът е поставен отново на парламентарно ниво с твърдения и въпроси от политическа партия.</td><td>Тези формулировки се маркират като твърдения на политически източник, а не като установени факти.</td><td><a target="_blank" rel="noopener" href="https://dariknews.bg/novini/bylgariia/vyzrazhdane-pita-ima-li-politicheski-chadyr-nad-ukrainskata-grupirovka-kub-i-oleg-nevzorov-2465416">DarikNews ↗</a></td></tr>';

  // Timeline: append the latest verified stage once.
  const tl=document.querySelector('#timeline .timeline');
  if(tl&&!tl.querySelector('[data-kub-v4-current]')){
    const d=document.createElement('div');d.className='t';d.dataset.kubV4Current='1';d.innerHTML='<time>02.09.2026</time><h3>Нов съдебен етап и нова медийна вълна</h3><p>Образувано е ново дело за тока и водата; паралелно се разпространява информация за 19 издадени и още 4 подготвяни заповеди за премахване. Казусът остава активен едновременно в съдебната, институционалната и медийната среда.</p>';tl.appendChild(d);
  }

  // Sources: clarify what is actually covered today.
  const sh=document.querySelector('#sources .sectionTitle');if(sh)sh.textContent='Източници и канали в активното наблюдение';
  const sc=document.querySelector('#sources .card.wide');if(sc&&!sc.querySelector('[data-kub-source-note]')){const n=document.createElement('div');n.className='callout';n.dataset.kubSourceNote='1';n.style.marginTop='14px';n.innerHTML='<b>Покритие:</b> новини и публично индексирано web съдържание се събират автоматично. Закрити групи, непублични профили и съдържание, което не се индексира от търсачки, не се представят като пълно покритие без директен API или лицензиран доставчик.';sc.appendChild(n);}

  // Settings: reflect the actual operating cadence instead of desired/demo cadences.
  const cfg=document.querySelector('#settings .config');
  if(cfg)cfg.innerHTML='<div class="configBlock"><h3>Текущ цикъл на наблюдение</h3><ul><li>КУБ news collector: проверка на всеки 60 секунди.</li><li>Широко open-web припомняне: на по-бавен резервен цикъл.</li><li>Клиентският Monitoring feed: синхронизация на всеки 30 секунди.</li><li>Всеки запис пази източника и директния линк.</li></ul></div><div class="configBlock"><h3>Critical trigger</h3><ul><li>ново съдебно решение или дело;</li><li>нова заповед или принудително действие;</li><li>промяна в ток/вода/достъп;</li><li>обвинение или официално процесуално действие;</li><li>нов национален политически или институционален импулс.</li></ul></div><div class="configBlock"><h3>Какво се класифицира</h3><ul><li>факт / твърдение / процедура / анализ;</li><li>съдебен, институционален, клиентски или репутационен риск;</li><li>нова тема срещу повторно медийно разпространение;</li><li>необходимост от реакция и следващ проверим тригер.</li></ul></div><div class="configBlock"><h3>Граница на покритието</h3><ul><li>публично индексираните медии и web източници са автоматизирани;</li><li>затворени социални пространства не се представят като пълно наблюдавани;</li><li>пълно social coverage изисква API/лицензиран provider;</li><li>при прекъсване на collector-а интерфейсът трябва да показва проблем, а не фиктивен LIVE статус.</li></ul></div>';
  const call=document.querySelector('#settings .callout');if(call)call.innerHTML='<b>Оперативен принцип:</b> Navigator не показва технически health-метрики на клиента. Показва новите факти, техния източник, значението им за казуса и дали наблюдението е актуално.';

  // Reports: keep cards, make descriptions outcome-oriented.
  const reportCopy=[
   ['Кризисен ситуационен обзор','Какво реално се е променило за последните 24 часа: нови събития, нови източници, нови институционални действия и приоритети.'],
   ['Медиен и наративен анализ','Кои теми нарастват, кои източници ги разпространяват и дали позицията на КУБ присъства в наблюдаваната среда.'],
   ['Риск и заинтересовани страни','Как новите събития променят риска за купувачи, институции, партньори, служители и местна общност.'],
   ['Документална и съдебна карта','Актуален статус по обект, документ, заповед, жалба и дело — без смесване на различни производства.'],
   ['План за стабилизиране и възстановяване','Какво остава нерешено, какво е подобрено и кои три действия имат най-висок приоритет през следващия период.'],
   ['Rapid Response Brief','При нов критичен сигнал: факт, източник, статус, засегнати страни, риск и препоръчан комуникационен отговор.']
  ];
  document.querySelectorAll('#reports .reportCard').forEach((c,i)=>{const d=reportCopy[i];if(!d)return;const h=c.querySelector('h3'),p=c.querySelector('p');if(h)h.textContent=d[0];if(p)p.textContent=d[1];});
}

function renderChart(rows){
  const card=document.querySelector('#overview .card.twoThird');if(!card)return;
  const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);days.push(d)}
  const counts=days.map((d,i)=>{const e=new Date(d);e.setDate(e.getDate()+1);return rows.filter(r=>{const t=ts(pub(r));return t>=d.getTime()&&t<e.getTime()}).length});
  const max=Math.max(1,...counts),w=680,h=150,base=130,step=w/Math.max(1,counts.length-1);
  const pts=counts.map((c,i)=>[20+i*step,base-(c/max)*105]);
  const poly=pts.map(p=>p.join(',')).join(' ');
  const labels=days.map((d,i)=>'<text x="'+(16+i*step)+'" y="148" fill="#677789" font-size="9">'+String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'</text>').join('');
  card.innerHTML='<h3 class="sectionTitle">Динамика на публикациите · последни 7 дни</h3><div class="legend"><span>Брой наблюдавани source-level публикации по дата на публикуване.</span><span>Последните 24 ч.: <b>'+rows.filter(r=>isWithin(r,24)).length+'</b></span></div><div class="chartWrap"><svg viewBox="0 0 720 160" preserveAspectRatio="none"><line class="chartGrid" x1="20" x2="700" y1="130" y2="130"/><line class="chartGrid" x1="20" x2="700" y1="78" y2="78"/><line class="chartGrid" x1="20" x2="700" y1="25" y2="25"/><polyline class="chartLine" points="'+poly+'"/>'+labels+'</svg></div>';
}

function renderEnvironment(rows){
  const recent=rows.filter(r=>isWithin(r,24*30));
  const defs=[
   ['Съдебни процедури',r=>/съд|дело|жалба/.test(low(r)),'Дела, определения, жалби и процесуални действия.'],
   ['Заповеди / премахване / достъп',isRemoval,'Заповеди, премахване, запечатване и физически достъп до обектите.'],
   ['Ток / вода / услуги',isUtilities,'Електрозахранване, водоснабдяване и свързани съдебни или административни действия.'],
   ['Политическо и институционално говорене',isPolitical,'Парламентарни, партийни и институционални твърдения, които увеличават националната видимост.'],
   ['Купувачи / собственици / засегнати лица',isBuyer,'Публични сигнали за ефекта върху собственици, жители и договорни отношения.']
  ];
  const counts=defs.map(d=>recent.filter(d[1]).length),mx=Math.max(1,...counts);
  document.querySelectorAll('#environment .narrative').forEach((n,i)=>{const d=defs[i];if(!d)return;const h=n.querySelector('h3'),p=n.querySelector('p'),sev=n.querySelector('.sev'),bar=n.querySelector('.bar span');if(h)h.textContent=d[0];if(p)p.textContent=d[2]+' Наблюдавани сигнали за 30 дни: '+counts[i]+'.';if(sev){sev.textContent=counts[i]===mx&&counts[i]>0?'ВОДЕЩА ТЕМА':'АКТИВНА ТЕМА';sev.className='sev '+(counts[i]===mx&&counts[i]>0?'red':'amber');}if(bar)bar.style.width=Math.max(6,Math.round(counts[i]/mx*100))+'%';});
  const note=document.querySelector('#environment .note');if(note)note.textContent='Лентите показват относителната честота в текущата наблюдавана база за последните 30 дни, не пазарен share-of-voice.';
  const cloud=document.querySelector('#environment .markerCloud');if(cloud){const markers=['незаконен град','град в града','украинска групировка','политически чадър','схема','фалшиви документи','събаряне','ток','вода','ДАНС'];const present=markers.filter(m=>recent.some(r=>low(r).includes(m.toLowerCase())));cloud.innerHTML=(present.length?present:['Няма нов доминиращ езиков маркер извън текущите теми']).map(m=>'<span>'+esc(m)+'</span>').join('');}
  const ms=document.querySelectorAll('#environment .matrix .m');const d24=rows.filter(r=>isWithin(r,24)),sources=uniq(d24,src),inst=d24.filter(isInstitution).length,pos=d24.filter(isKUBPosition).length;const vals=[['Публикации · 24 ч.',d24.length+' наблюдавани source-level записа'],['Уникални източници · 24 ч.',sources+' източника'],['Институционален компонент · 24 ч.',inst+' сигнала'],['Позиция на КУБ · 24 ч.',pos+' сигнала в текущата база']];ms.forEach((m,i)=>{const v=vals[i];if(!v)return;m.innerHTML='<b>'+esc(v[0])+'</b><p>'+esc(v[1])+'</p>';});
}

function renderOverview(rows){
  const ordered=sortRows(rows),d24=ordered.filter(r=>isWithin(r,24)),sources=uniq(d24,src),inst=d24.filter(isInstitution).length,util=d24.filter(isUtilities).length,crit=d24.filter(critical).length,last=ordered[0];
  const stats=document.querySelectorAll('#overview .radarStat');const vals=[[d24.length,'публикации / сигнали за последните 24 часа'],[sources,'уникални източници за последните 24 часа'],[inst,'с институционален или съдебен компонент'],[util,'свързани с ток, вода или достъп до услуги']];stats.forEach((s,i)=>{const v=vals[i];if(!v)return;const b=s.querySelector('b'),sp=s.querySelector('span');if(b)b.textContent=v[0];if(sp)sp.textContent=v[1];});
  const cards=document.querySelectorAll('#overview .metric');metric(cards[0],'Критични сигнали · 24 ч.',String(crit),crit?'Най-високият текущ приоритет е свързан с новите съдебни и институционални развития.':'Няма критичен сигнал в текущия 24-часов прозорец.');metric(cards[1],'Нови публикации · 24 ч.',String(d24.length),'Всяка публикация се пази отделно, когато показва разпространение по различен източник.');metric(cards[2],'Уникални източници · 24 ч.',String(sources),'Показва ширината на медийното разпространение в наблюдаваната публична база.');metric(cards[3],'Последен открит сигнал',last?fmtTime(pub(last)):'—',last?(src(last)+' · '+fmtDate(pub(last))):'Няма наличен сигнал.');
  const att=document.querySelector('#overview .attention');if(att){const top=ordered.slice(0,3);att.innerHTML='<h3 class="sectionTitle">Какво изисква внимание сега</h3>'+top.map((r,i)=>{const u=safeURL(r);const meaning=isUtilities(r)?'Влияе върху текущия спор за услуги и непосредствения риск за засегнатите обекти.':isRemoval(r)?'Променя административния риск и изисква проследяване по конкретна заповед/обект.':isPolitical(r)?'Увеличава политическата и националната видимост; твърденията трябва да се приписват на източника.':'Ново развитие, което може да промени публичната рамка на казуса.';return '<div class="alert"><span class="sev '+(i===0?'red':'amber')+'">'+(i===0?'НАЙ-НОВО':'СЛЕДИ')+'</span><b>'+esc(clean(r.title))+'</b><p>'+esc(meaning)+' '+(u?'<a target="_blank" rel="noopener" href="'+esc(u)+'">'+esc(src(r))+' ↗</a>':'')+'</p></div>'}).join('');}
  renderChart(ordered);
}

function renderReputation(rows){
  const d24=rows.filter(r=>isWithin(r,24)),neg=d24.filter(r=>String(r.sentiment||'').toLowerCase()==='negative'||critical(r)).length,sources=uniq(d24,src),inst=d24.filter(isInstitution).length,pos=d24.filter(isKUBPosition).length;
  const cards=document.querySelectorAll('#reputation .metric');metric(cards[0],'Негативни / критични сигнали · 24 ч.',String(neg),'Показва текущия натиск в наблюдавания публичен поток, не общото обществено мнение.');metric(cards[1],'Медийно разпространение · 24 ч.',String(sources)+' изт.','Брой различни източници, публикували по казуса през последните 24 часа.');metric(cards[2],'Институционални сигнали · 24 ч.',String(inst),'Съд, община, парламент и други институционални компоненти в текущата база.');metric(cards[3],'Позиция на КУБ · 24 ч.',String(pos),'Брой сигнали, в които текущият collector разпознава собствена/корпоративна позиция.');
  const tables=document.querySelectorAll('#reputation .table');if(tables[0])tables[0].innerHTML='<tr><th>Наблюдение</th><th>Текущ извод</th><th>Какво следим</th></tr><tr><td><b>Съдебна линия</b></td><td>Активна и с висока медийна видимост.</td><td>Нови определения, решения, заседания и точния предмет на всяко дело.</td></tr><tr><td><b>Услуги</b></td><td>Токът и водата остават силен човешки и репутационен фокус.</td><td>Фактически статус по обекти и официални действия на оператори/община/съд.</td></tr><tr><td><b>Политизация</b></td><td>Казусът е върнат на национално политическо ниво.</td><td>Нови твърдения се приписват на конкретния политически източник и се отделят от установените факти.</td></tr><tr><td><b>Позиция на КУБ</b></td><td>'+pos+' разпознати сигнала за 24 ч. в текущата база.</td><td>Дали позицията присъства в значимите нови публикации и дали отговаря на конкретния факт.</td></tr>';
  if(tables[1])tables[1].innerHTML='<tr><th>Показател</th><th>Защо е важен</th><th>Цел</th></tr><tr><td>Значими публикации с позиция на КУБ</td><td>Намалява едностранното представяне на фактите.</td><td>&gt;70%</td></tr><tr><td>Проверими неточности без отговор</td><td>Ограничава натрупването на некоригирани твърдения.</td><td>&lt;10% до 24 ч.</td></tr><tr><td>Засегнати купувачи с индивидуален статус</td><td>Премества комуникацията от общи послания към конкретна защита.</td><td>100%</td></tr><tr><td>Спорни обекти с документална карта</td><td>Предотвратява смесване на различни имоти, дружества и производства.</td><td>100%</td></tr><tr><td>Първоначален медиен отговор</td><td>Ограничава информационния вакуум при критичен сигнал.</td><td>до 60 мин</td></tr>';
}

function renderRisks(rows){
  const d24=rows.filter(r=>isWithin(r,24));const groups=[['Съдебен / правен',r=>/съд|дело|жалба/.test(low(r)),'Нови дела, решения, определения или процесуални промени.'],['Заповеди / премахване / достъп',isRemoval,'Нова заповед, изпълнение, запечатване или ограничаване на достъпа.'],['Ток / вода / услуги',isUtilities,'Промяна в фактическия статус или ново съдебно/административно действие.'],['Политически / институционален натиск',isPolitical,'Нова декларация, парламентарен въпрос или институционално твърдение.'],['Купувачи / засегнати лица',isBuyer,'Нов проверим сигнал за конкретен договорен, имотен или ежедневен ефект.']];
  const host=document.querySelector('#risks .card.twoThird');if(host){host.innerHTML='<h3 class="sectionTitle">Кризисен риск-регистър · текущи 24 часа</h3>'+groups.map(g=>{const n=d24.filter(g[1]).length;const level=n>=5?'Критично':n>0?'Високо':'Наблюдение';return '<div class="risk"><b>'+esc(g[0])+'</b><span class="status '+(n>=5?'red':n>0?'amber':'green')+'">'+level+'</span><span>'+n+' сигнала</span><span>'+esc(g[2])+'</span></div>'}).join('');}
}

function renderReports(rows){const grid=document.querySelector('#reports .grid');if(!grid)return;let box=grid.querySelector('[data-kub-v4-summary]');if(!box){box=document.createElement('div');box.className='card wide';box.dataset.kubV4Summary='1';grid.prepend(box);}const d24=rows.filter(r=>isWithin(r,24)),last=sortRows(rows)[0];box.innerHTML='<h3 class="sectionTitle">Какво се промени за последните 24 часа</h3><div class="matrix"><div class="m"><b>'+d24.length+' публикации / сигнала</b><p>Наблюдавани source-level записи.</p></div><div class="m"><b>'+uniq(d24,src)+' източника</b><p>Ширина на публичното разпространение.</p></div><div class="m"><b>'+d24.filter(isInstitution).length+' институционални</b><p>Съд, община, парламент и други институционални компоненти.</p></div><div class="m"><b>'+(last?fmtTime(pub(last)):'—')+' последен сигнал</b><p>'+(last?esc(src(last)+' · '+clean(last.title)):'Няма наличен сигнал.')+'</p></div></div>';}

async function load(){
  cleanupLegacyMonitoring();rewriteStaticCopy();
  try{const r=await fetch('/api/signals?client=kub&limit=500&_='+Date.now(),{cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();const rows=Array.isArray(d.signals)?d.signals:[];if(rows.length){renderOverview(rows);renderEnvironment(rows);renderReputation(rows);renderRisks(rows);renderReports(rows);}cleanupLegacyMonitoring();}
  catch(e){console.warn('KUB client content v4',e);cleanupLegacyMonitoring();}
}
function boot(){rewriteStaticCopy();cleanupLegacyMonitoring();setTimeout(load,900);setInterval(load,30000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

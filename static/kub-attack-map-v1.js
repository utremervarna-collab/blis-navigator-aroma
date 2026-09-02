/* KUB-only Attack & Narrative Network. Evidence-aware operational map. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;

const ACTORS=[
 {id:'vazrazhdane',label:'„Възраждане“ / Коста Стоянов',short:'Възраждане',type:'political',intensity:'КРИТИЧЕН',risk:96,x:140,y:105,
  role:'Основен политически инициатор и усилвател на негативните рамки около КУБ.',
  motive:'Антикорупционна и суверенитетна политическа линия; използване на „Баба Алино“ като национален политически казус и, към 1–2 септември, като тема в президентската кампания.',
  triggers:'Нови институционални действия, парламентарни изяви, действия на ДАНС/прокуратурата, съдебни решения, изпълнение на заповеди и публични прояви на Олег Невзоров.',
  narratives:['„украинска групировка КУБ“','„най-голямата корупционна схема“','„институционален/политически чадър“','държавата знае, но не действа'],
  evidence:'Потвърдени са публичните изявления, сигнали и парламентарни инициативи. Квалификации като „групировка“, „престъпна“ и „чадър“ са политически твърдения, а не съдебно установени факти.',
  amplifiers:'Парламентарна трибуна, партийните канали, БТА, БНТ, местни медии и вторично препубликуване.',
  confirmation:'Има официално потвърден административен и прокурорски казус; той не потвърждава автоматично всички политически квалификации.',
  counter:'Отговор само по проверими факти; всяка политическа квалификация да се отделя визуално от официалния акт/съдебния статус; без персонална ескалация.',
  sources:[['БНТ · 02.09.2026','https://bntnews.bg/news/kosta-stoyanov-za-nai-golyamata-korupcionna-shema-baba-alino-darzhavata-znae-vaprosat-e-zashto-ne-deistva-1410513news.html'],['Народно събрание · 29.07.2026','https://www.parliament.bg/bg/plenaryst/ns/55/ID/11157'],['БТА · 13.05.2026','https://www.bta.bg/bg/news/1124917?download=1']]},
 {id:'varna',label:'Община Варна / Благомир Коцев',short:'Община Варна',type:'institutional',intensity:'КРИТИЧЕН',risk:94,x:510,y:92,
  role:'Активен институционален център на административния натиск и публичната контра-позиция срещу тезите на КУБ.',
  motive:'Прилагане на строителния контрол плюс политическа защита на сегашното управление и спор за това кога и при чия отговорност е възникнал проблемът.',
  triggers:'Нови заповеди за премахване, запечатване/ограничаване на достъпа, действия по ток/вода, съдебни решения и публични твърдения, които Общината смята за неверни.',
  narratives:['липса на ПУП и разрешения за строеж за Forest Club','опасни/подвеждащи внушения от КУБ','отговорност на предходното управление за част от документите','необходимост от премахване и ограничаване на достъпа'],
  evidence:'Официалните актове и позициите на Общината са проверими. Политическите интерпретации за мотиви, вина и персонални зависимости остават позиции на страна.',
  amplifiers:'Официален сайт на Община Варна, национални и местни медии, социални профили на кмета, политически дебат.',
  confirmation:'Към 2 септември са обявени общо 19 подписани заповеди за премахване и подготовка на още 4; отделните актове подлежат на съдебен контрол.',
  counter:'Документална реакция по конкретен имот/акт; да не се отговаря с общи твърдения „всичко е законно“, ако статутите на обектите са различни.',
  sources:[['Община Варна · 18.06.2026','https://live.varna.bg/bg/news/pozitsiya_obshtina_varna.html'],['БНТ · 01.09.2026','https://bntnews.bg/bg/c/bulgaria']]},
 {id:'institutions',label:'Прокуратура / МРРБ / съд',short:'Институции / съд',type:'institutional',intensity:'КРИТИЧЕН',risk:98,x:335,y:42,
  role:'Не е „атакуващ център“. Това е институционалният гръбнак на кризата, който придава фактическа тежест на част от негативните наративи.',
  motive:'Разследване, строителен контрол, административно изпълнение и съдебен контрол.',
  triggers:'Нови обвинения или прекратявания, експертизи, решения по заповедите за премахване, действия по електрозахранването и изпълнение на административни актове.',
  narratives:['установено незаконно строителство в официални съобщения','шест досъдебни производства','оспорване на заповеди и предписания','токът остава спрян по текущото съдебно производство'],
  evidence:'Най-високо доказателствено ниво в картата: официални прокурорски съобщения, министерски позиции и съдебни актове. Всяко производство обаче има собствен предмет и не означава автоматично вина на КУБ или конкретно лице.',
  amplifiers:'Всички национални медии и политически актьори, които цитират официалните актове.',
  confirmation:'Прокуратурата съобщава за шест досъдебни производства; МРРБ определя строителството като незаконно; Административният съд – Варна на 01.09 отхвърля искането за незабавно възстановяване на тока.',
  counter:'Приоритет е съдебно и документално действие, не реторичен спор. Комуникацията трябва точно да казва кой акт е окончателен, кой е оспорен и какво НЕ е решено.',
  sources:[['Прокуратура · 23.06.2026','https://prb.bg/apvarna/bg/news/pressobsheniya/78755-shest-dosadebni-proizvodstva-rakovodi-prokuraturata-vav-varna-vav-vrazka-s-ustan'],['МРРБ/БТА · 17.08.2026','https://www.bta.bg/bg/news/bulgaria/oficial-messages/1186776-ministar-ivan-shishkov-stroitelstvoto-v-m-baba-alino-bezsporno-e-nezakonno-po'],['Адм. съд – Варна · 01.09.2026','https://varna-adms.justice.bg/bg/news1/39385']]},
 {id:'gerb',label:'ГЕРБ – Варна / Иван Портних',short:'ГЕРБ / Портних',type:'political',intensity:'ВИСОК',risk:78,x:100,y:265,
  role:'Косвен политически натиск: използва казуса основно в спор с Благомир Коцев за отговорността и времевата линия.',
  motive:'Прехвърляне на политическата отговорност към сегашното управление и защита срещу твърдения, че проблемът е породен от предходната администрация.',
  triggers:'Нови обвинения от Коцев/Общината към предходното управление; документи за търпимост, разрешения, дати на строителство и контролни действия.',
  narratives:['Коцев е знаел за строителството','строителството е започнало/разраснало се при сегашния мандат','удостоверенията за търпимост не разрешават ново строителство'],
  evidence:'Публични политически твърдения, част от които се позовават на документи. Оценката за отговорността е спор между политически страни и трябва да се проверява по документ и дата.',
  amplifiers:'БНР, NOVA, местни медии, общинският политически дебат.',
  confirmation:'Официалният спор за документите и контрола е реален; политическата вина не е единно установен факт.',
  counter:'КУБ да не влиза в ролята на арбитър между Коцев и Портних. Да публикува собствена проверима хронология на документите и действията.',
  sources:[['БНР · 28.05.2026','https://bnrnews.bg/varna/post/476595/portnih-za-baba-alino-dokumentalnite-sledi-che-kotsev-e-znael-sa-mnogo'],['NOVA · 04.06.2026','https://nova.bg/news/view/2026/06/04/539515/']]},
 {id:'bird',label:'BIRD / разследващи медии',short:'BIRD / разследващи',type:'media',intensity:'ВИСОК',risk:82,x:570,y:245,
  role:'Разследващ натиск и производство на мрежови хипотези за връзки между КУБ, служби, общински служители и свидетели.',
  motive:'Журналистическо разследване на предполагаеми зависимости, институционално бездействие, сделки и мрежи около казуса.',
  triggers:'Нови документи, свидетели, нотариални сделки, данни за ДАНС, прокуратурата, общински служители и Невзоров.',
  narratives:['връзки около строителния контрол','Невзоров и делото срещу Коцев','институционална слепота/зависимости','нотариални и корпоративни връзки'],
  evidence:'Журналистически публикации с различна степен на документална опора. Те не трябва да се третират като съдебно установени факти, освен когато цитират официален документ, който е проверен отделно.',
  amplifiers:'Други медии, социални мрежи и политически актьори, които препредават разследванията.',
  confirmation:'Част от институционалния контекст е официално потвърден; твърденията за конкретни зависимости трябва да се валидират поотделно.',
  counter:'Не атакувай медията. Направи claim-by-claim response matrix: твърдение → документ → статус → корекция/без реакция.',
  sources:[['BIRD · 03.06.2026','https://bird.bg/kub-alino-dragnev/']]},
 {id:'buyers',label:'Купувачи / адвокати / жители',short:'Купувачи / жители',type:'stakeholder',intensity:'ВИСОК',risk:88,x:200,y:390,
  role:'Заинтересована страна с потенциал да се превърне в най-силния човешки и репутационен фронт.',
  motive:'Защита на вложените средства, ползването на имотите и основни услуги; търсене на договорна и правна защита.',
  triggers:'Събаряне/запечатване, прекъсване на ток/вода, нови съдебни решения, невъзможност за ползване или прехвърляне, колективни искове и протести.',
  narratives:['„пострадали купувачи/семейства“','договорна несигурност','липса на ток/вода','човешката цена на административния конфликт'],
  evidence:'Съществуват публични изказвания на адвокати и жители; конкретните договорни права и вреди са индивидуални и трябва да се проверяват по договор/имот.',
  amplifiers:'Телевизии, местни медии, социални групи, адвокати и лични истории.',
  confirmation:'Съдът и БТА потвърждават спора за електрозахранването; публично са описани засегнати жители. Това не доказва автоматично кой носи договорна отговорност.',
  counter:'Това е първа комуникационна аудитория. Индивидуален статус на всеки купувач, реалистични срокове, правна помощ и една контактна точка; без обещания, които не могат да бъдат изпълнени.',
  sources:[['Адм. съд – Варна · 01.09.2026','https://varna-adms.justice.bg/bg/news1/39385'],['БТА · 28.08.2026','https://www.bta.bg/bg/news/bulgaria/regional-news/varna/1194281-administrativniyat-sad-vav-varna-obrazuva-delo-za-nezabavno-vazstanovyavane-na-t'],['Адв. Михаил Томов · 16.06.2026','https://silnavarna.bg/2026/06/16/%D0%B0%D0%B4%D0%B2%D0%BE%D0%BA%D0%B0%D1%82%D1%8A%D1%82-%D0%BD%D0%B0-%D0%B7%D0%B0%D0%BA%D1%83%D0%BF%D0%B8%D0%BB%D0%B8%D1%82%D0%B5-%D0%B8%D0%BC%D0%BE%D1%82-%D0%B2-%D0%B1%D0%B0%D0%B1%D0%B0-%D0%B0%D0%BB%D0%B8%D0%BD%D0%BE-%D0%B2-%D1%81%D0%BF%D0%BE%D1%80%D0%B0%D0%B7%D1%83%D0%BC%D0%B5%D0%BD%D0%B8%D1%8F%D1%82%D0%B0-%D0%BB%D0%B8%D0%BF%D1%81%D0%B2%D0%B0-%D1%83%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%BA%D0%B0-%D1%81%D1%8A%D0%B3%D0%BB%D0%B0%D1%81%D0%BD%D0%BE-%D0%BA%D0%BE%D1%8F%D1%82%D0%BE-%D1%81%D1%82%D1%80%D0%BE%D0%B8%D1%82%D0%B5%D0%BB%D1%8F%D1%82-%D1%81%D0%B5-%D0%B7%D0%B0%D0%B4%D1%8A%D0%BB%D0%B6%D0%B0%D0%B2%D0%B0-%D0%B4%D0%B0-%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B4%D0%B5-%D0%BD%D0%B0-%D0%BA%D1%83%D0%BF%D1%83%D0%B2%D0%B0%D1%87%D0%B0-%D0%BF%D0%BE%D1%81%D0%BE%D1%87%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B8%D0%BC%D0%BE%D1%82/']]},
 {id:'media',label:'Национални и местни медии',short:'Медийни усилватели',type:'media',intensity:'ВИСОК',risk:84,x:475,y:390,
  role:'Основен усилвател и рамкиращ посредник; рядко първоизточник на самия административен казус.',
  motive:'Висок обществен интерес, силен визуален сюжет, политически конфликт, институции, купувачи и ясни конфликтни персонажи.',
  triggers:'Събаряне/запечатване, ток и вода, парламентарна ескалация, нови прокурорски действия, протести, инциденти и съдебни решения.',
  narratives:['„незаконният град“','„аферата Баба Алино“','конфликт КУБ–Община','семейства без услуги','политически и институционален скандал'],
  evidence:'Медиите смесват официални факти, цитирани страни и редакционни рамки. Всеки материал трябва да се класифицира по първоизточник и доказателствен статус.',
  amplifiers:'Телевизионни емисии, сайтове, агрегатори, социални мрежи, повторно цитиране без връзка към първоизточника.',
  confirmation:'Потвърждението идва от първичния източник, не от броя препубликации.',
  counter:'Rapid response към топ медии; корекция на фактически грешки; собствен evidence hub с линкове към първични документи.',
  sources:[['БНТ · текущ тематичен поток','https://bntnews.bg/'],['NOVA · 27.05.2026','https://nova.bg/news/view/2026/05/27/538651/']]}
];

const NARRATIVES=[
 {name:'„Незаконният град / незаконно строителство“',origin:'Контролни институции + медийно рамкиране',flow:'Институции → национални медии → политика → масово препубликуване',status:'Има официални актове и производства; конкретният статут трябва да се следи обект по обект.',risk:98},
 {name:'„Украинска групировка КУБ“',origin:'Политическа рамка – „Възраждане“',flow:'Партийни канали / парламент → БТА и медии → вторични публикации',status:'Политическа квалификация; не е правен статут на компанията.',risk:94},
 {name:'„Институционален / политически чадър“',origin:'Политически и разследващ дискурс',flow:'Политически твърдения + разследвания → медии → социални мрежи',status:'Хипотеза/твърдение; изисква отделно доказване за всеки конкретен актьор и действие.',risk:87},
 {name:'„Кой е виновен – Коцев или Портних?“',origin:'Местен политически конфликт',flow:'Община ↔ ГЕРБ → местни/национални медии → общински дебат',status:'Конфликт на политически позиции; проверката е по документ, дата и компетентност.',risk:79},
 {name:'„Пострадали семейства / купувачи“',origin:'Купувачи, жители и адвокати',flow:'Лични случаи → медии → обществен натиск → институции',status:'Реален заинтересован интерес; конкретната вреда и отговорност са индивидуални.',risk:92},
 {name:'„Невзоров – ДАНС – Коцев“',origin:'Политически твърдения + разследващи публикации',flow:'Разследвания/политика → парламент и медии → репутационна асоциация с КУБ',status:'Смесена доказателствена база; всяко твърдение трябва да се разделя на официално потвърдено и непотвърдено.',risk:90}
];

const COLORS={political:'#b94b4b',institutional:'#4b789f',media:'#aa741c',stakeholder:'#6e5a9e'};
const LABELS={political:'Политически актьор',institutional:'Институция / контрол',media:'Медия / усилвател',stakeholder:'Заинтересована страна'};

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function riskClass(v){return v>=93?'critical':v>=82?'high':'watch';}
function sourceHtml(a){return a.sources.map(s=>'<a class="kubam-source" target="_blank" rel="noopener" href="'+esc(s[1])+'">'+esc(s[0])+' ↗</a>').join('');}

function style(){
 const css=`
 #attackmap{--am-red:#b94b4b;--am-blue:#4b789f;--am-amber:#aa741c;--am-purple:#6e5a9e}
 .kubam-hero{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,.55fr);gap:14px;margin-bottom:14px}
 .kubam-hero .card{min-height:160px}.kubam-eyebrow{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#a66f22;font-weight:900}.kubam-hero h2{font-size:24px;margin:7px 0 7px}.kubam-hero p{font-size:10.5px;line-height:1.6;color:var(--muted);margin:0}.kubam-model{display:flex;align-items:center;gap:9px;margin-top:14px;flex-wrap:wrap}.kubam-pill{padding:6px 9px;border-radius:999px;font-size:8.5px;font-weight:900;letter-spacing:.4px;border:1px solid var(--line);background:#fff}.kubam-pill.critical{background:var(--redbg);color:var(--red);border-color:#f0caca}.kubam-proof{padding:11px 12px;border-radius:12px;background:#f4f8fb;border:1px solid #dbe7ef;font-size:10px;line-height:1.55;color:#4c667a}.kubam-proof b{color:#2f536f}.kubam-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.kubam-kpi{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px}.kubam-kpi b{font-size:20px;display:block;color:#355d7b}.kubam-kpi span{font-size:8.8px;color:var(--muted);line-height:1.35}
 .kubam-grid{display:grid;grid-template-columns:minmax(520px,1.35fr) minmax(300px,.65fr);gap:14px;align-items:stretch}.kubam-map-card{overflow:hidden}.kubam-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:9px}.kubam-head h3{margin:0;font-size:15px}.kubam-head p{margin:4px 0 0;font-size:9.5px;line-height:1.45;color:var(--muted)}.kubam-filters{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.kubam-filter{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 9px;font-size:8.8px;cursor:pointer}.kubam-filter.active{background:#e8f0f6;border-color:#bdd0df;color:#315b79;font-weight:800}
 .kubam-canvas{position:relative;min-height:500px;border:1px solid #e3e9ee;border-radius:16px;background:radial-gradient(circle at 50% 49%,#fff 0,#fbfdfe 38%,#f4f8fa 100%);overflow:auto}.kubam-canvas svg{display:block;width:100%;min-width:650px;height:auto}.kubam-link{stroke:#cbd7df;stroke-width:1.2;stroke-dasharray:4 4;opacity:.8}.kubam-link.hot{stroke:#d6a0a0;stroke-width:1.6}.kubam-node{cursor:pointer;transition:.18s}.kubam-node:hover{filter:drop-shadow(0 5px 5px rgba(42,62,79,.14))}.kubam-node.dim{opacity:.13;pointer-events:none}.kubam-node.active .kubam-ring{stroke-width:4;opacity:.75}.kubam-node text{pointer-events:none}.kubam-center-ring{fill:#fff;stroke:#bd8733;stroke-width:3}.kubam-center-core{fill:#f9f2e5;stroke:#e4c487;stroke-width:1}.kubam-node-circle{fill:#fff;stroke-width:2.5}.kubam-ring{fill:none;stroke-width:2;opacity:.25}.kubam-node-title{font-size:10px;font-weight:800;fill:#334b5e}.kubam-node-sub{font-size:7.8px;fill:#738392}.kubam-center-title{font-size:15px;font-weight:900;fill:#2f4b61}.kubam-center-sub{font-size:8px;fill:#8a7653}.kubam-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:9px;font-size:8.5px;color:var(--muted)}.kubam-legend i{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:4px}
 .kubam-detail{display:flex;flex-direction:column;min-height:500px}.kubam-detail-top{display:flex;justify-content:space-between;gap:10px}.kubam-detail h3{font-size:16px;margin:0}.kubam-tag{font-size:8px;padding:5px 7px;border-radius:999px;font-weight:900;white-space:nowrap}.kubam-tag.critical{background:var(--redbg);color:var(--red)}.kubam-tag.high{background:var(--amberbg);color:var(--amber)}.kubam-tag.watch{background:#edf3f7;color:#4b789f}.kubam-role{font-size:10.5px;line-height:1.55;color:#465d70;margin:8px 0 9px}.kubam-field{padding:9px 0;border-top:1px solid var(--line)}.kubam-field b{display:block;font-size:8.5px;text-transform:uppercase;letter-spacing:.55px;color:#7b8a96;margin-bottom:4px}.kubam-field p{font-size:9.8px;line-height:1.5;margin:0;color:#536676}.kubam-chips{display:flex;gap:5px;flex-wrap:wrap}.kubam-chip{font-size:8.5px;line-height:1.35;border-radius:9px;padding:5px 7px;background:#f4f6f8;border:1px solid #e3e9ee;color:#4f6373}.kubam-riskline{display:flex;align-items:center;gap:8px;margin-top:4px}.kubam-riskline strong{font-size:17px}.kubam-riskbar{height:7px;flex:1;border-radius:99px;background:#edf1f4;overflow:hidden}.kubam-riskbar span{height:100%;display:block;background:linear-gradient(90deg,#d8b56f,#b94b4b)}.kubam-sources{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:10px}.kubam-source{font-size:8.5px;text-decoration:none;color:#97661b;font-weight:800;border:1px solid #eadcc2;background:#fffaf2;border-radius:8px;padding:6px 7px}
 .kubam-lower{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;margin-top:14px}.kubam-narrative{display:grid;grid-template-columns:minmax(170px,1.05fr) minmax(220px,1.35fr) 70px;gap:10px;align-items:center;padding:11px 0;border-top:1px solid var(--line)}.kubam-narrative:first-of-type{border-top:0}.kubam-narrative h4{font-size:10.5px;margin:0 0 4px}.kubam-narrative p{font-size:9px;line-height:1.45;color:var(--muted);margin:0}.kubam-score{text-align:right}.kubam-score b{font-size:17px;display:block}.kubam-score span{font-size:7.5px;color:var(--muted)}.kubam-status{margin-top:5px;font-size:8.5px!important;color:#526777!important}.kubam-evidence-row{display:grid;grid-template-columns:16px 1fr;gap:8px;padding:9px 0;border-top:1px solid var(--line)}.kubam-evidence-row:first-of-type{border-top:0}.kubam-evidence-dot{width:9px;height:9px;border-radius:50%;margin-top:3px}.kubam-evidence-row b{display:block;font-size:9.5px}.kubam-evidence-row p{margin:3px 0 0;font-size:8.8px;line-height:1.45;color:var(--muted)}.kubam-trigger{padding:9px 0;border-top:1px solid var(--line)}.kubam-trigger:first-of-type{border-top:0}.kubam-trigger b{font-size:9.8px}.kubam-trigger p{font-size:8.8px;line-height:1.45;color:var(--muted);margin:3px 0 0}.kubam-note{margin-top:10px;padding:10px;border-radius:10px;background:#fff8e9;border:1px solid #f0ddb8;font-size:9px;line-height:1.5;color:#6b551f}
 @media(max-width:1050px){.kubam-hero,.kubam-grid,.kubam-lower{grid-template-columns:1fr}.kubam-detail{min-height:0}.kubam-canvas{min-height:450px}}
 @media(max-width:700px){.kubam-hero h2{font-size:20px}.kubam-kpis{grid-template-columns:1fr 1fr}.kubam-head{display:block}.kubam-filters{justify-content:flex-start;margin-top:8px}.kubam-narrative{grid-template-columns:1fr 55px}.kubam-narrative>div:nth-child(2){grid-column:1/-1;grid-row:2}.kubam-canvas{min-height:410px}}
 `;
 const s=document.createElement('style');s.id='kub-attack-map-style';s.textContent=css;document.head.appendChild(s);
}

function pageHtml(){
 const lines=ACTORS.map(a=>'<line class="kubam-link '+(a.risk>=93?'hot':'')+'" data-type="'+a.type+'" x1="335" y1="225" x2="'+a.x+'" y2="'+a.y+'"/>').join('');
 const nodes=ACTORS.map(a=>{
   const c=COLORS[a.type], r=a.risk>=93?36:32;
   const words=a.short.split(' '); const title=words.slice(0,2).join(' '), sub=words.slice(2).join(' ');
   return '<g class="kubam-node" data-id="'+a.id+'" data-type="'+a.type+'" transform="translate('+a.x+' '+a.y+')">'+
     '<circle class="kubam-ring" r="'+(r+8)+'" stroke="'+c+'"/><circle class="kubam-node-circle" r="'+r+'" stroke="'+c+'"/>'+
     '<text text-anchor="middle" class="kubam-node-title" y="-2">'+esc(title)+'</text>'+(sub?'<text text-anchor="middle" class="kubam-node-sub" y="12">'+esc(sub)+'</text>':'')+
     '<text text-anchor="middle" class="kubam-node-sub" y="'+(sub?25:14)+'">'+a.risk+'/100</text></g>';
 }).join('');
 const narrativeHtml=NARRATIVES.map(n=>'<div class="kubam-narrative"><div><h4>'+esc(n.name)+'</h4><p><b>Произход:</b> '+esc(n.origin)+'</p></div><div><p>'+esc(n.flow)+'</p><p class="kubam-status">'+esc(n.status)+'</p></div><div class="kubam-score"><b>'+n.risk+'</b><span>RISK / 100</span></div></div>').join('');
 return `
 <section class="page" id="attackmap"><div class="kubam-hero">
  <div class="card"><div class="kubam-eyebrow">Attack & Narrative Network · валидирано 02.09.2026</div><h2>Карта на натиска и наративите срещу КУБ</h2><p>Картата показва <b>кой генерира, кой институционално потвърждава и кой усилва</b> отделните линии около „Баба Алино“. Моделът не приема предварително, че всички участници са част от една организирана операция.</p><div class="kubam-model"><span class="kubam-pill critical">СХОДЯЩ СЕ НАТИСК · CONVERGENT PRESSURE</span><span class="kubam-pill">7 активни центъра/групи</span><span class="kubam-pill">6 доминиращи наратива</span></div></div>
  <div class="card"><div class="kubam-proof"><b>Доказателствена граница</b><br>Към момента няма публично доказателство за единен координационен център зад всички действия срещу КУБ. Затова картата отделя политическите атаки от институционалния контрол, журналистическите разследвания, медиите и засегнатите купувачи.</div><div class="kubam-kpis"><div class="kubam-kpi"><b>3</b><span>критични центъра на текущ натиск</span></div><div class="kubam-kpi"><b>98</b><span>най-висок риск: институционален/съдебен</span></div><div class="kubam-kpi"><b>94</b><span>риск на политическата рамка</span></div><div class="kubam-kpi"><b>92</b><span>риск от „пострадали семейства“</span></div></div></div>
 </div>
 <div class="kubam-grid">
  <div class="card kubam-map-card"><div class="kubam-head"><div><h3>Мрежа: произход → усилване → натиск</h3><p>Натисни върху възел. Рискът е оперативна BLIS оценка, не правна квалификация.</p></div><div class="kubam-filters"><button class="kubam-filter active" data-filter="all">Всички</button><button class="kubam-filter" data-filter="political">Политически</button><button class="kubam-filter" data-filter="institutional">Институции</button><button class="kubam-filter" data-filter="media">Медии</button><button class="kubam-filter" data-filter="stakeholder">Купувачи</button></div></div>
   <div class="kubam-canvas"><svg viewBox="0 0 670 470" role="img" aria-label="Карта на натиска и наративите около Корпорация КУБ"><g>${lines}</g><circle cx="335" cy="225" r="68" class="kubam-center-ring"/><circle cx="335" cy="225" r="56" class="kubam-center-core"/><text x="335" y="218" text-anchor="middle" class="kubam-center-title">КУБ</text><text x="335" y="234" text-anchor="middle" class="kubam-center-sub">БАБА АЛИНО</text><text x="335" y="247" text-anchor="middle" class="kubam-center-sub">CRISIS CORE</text>${nodes}</svg></div>
   <div class="kubam-legend"><span><i style="background:${COLORS.political}"></i>политически</span><span><i style="background:${COLORS.institutional}"></i>институции / съд</span><span><i style="background:${COLORS.media}"></i>медии / разследвания</span><span><i style="background:${COLORS.stakeholder}"></i>купувачи / жители</span></div>
  </div>
  <div class="card kubam-detail" id="kubamDetail"></div>
 </div>
 <div class="kubam-lower">
  <div class="card"><h3 class="sectionTitle">Наративна верига</h3>${narrativeHtml}</div>
  <div><div class="card"><h3 class="sectionTitle">Доказателствен статус</h3>
   <div class="kubam-evidence-row"><span class="kubam-evidence-dot" style="background:#367a60"></span><div><b>Официално потвърден факт / акт</b><p>Съд, прокуратура, администрация или първичен документ.</p></div></div>
   <div class="kubam-evidence-row"><span class="kubam-evidence-dot" style="background:#4b789f"></span><div><b>Официална позиция на страна</b><p>Проверимо е, че е заявена; съдържанието може да е оспорено.</p></div></div>
   <div class="kubam-evidence-row"><span class="kubam-evidence-dot" style="background:#aa741c"></span><div><b>Журналистическо разследване</b><p>Валидира се твърдение по твърдение и по първичните му документи.</p></div></div>
   <div class="kubam-evidence-row"><span class="kubam-evidence-dot" style="background:#b94b4b"></span><div><b>Политическо твърдение / квалификация</b><p>Не се представя като установен правен факт.</p></div></div>
   <div class="kubam-evidence-row"><span class="kubam-evidence-dot" style="background:#8a95a0"></span><div><b>Аналитична хипотеза</b><p>Работен модел за наблюдение; изисква допълнителни доказателства.</p></div></div>
  </div>
  <div class="card" style="margin-top:14px"><h3 class="sectionTitle">Следващи тригери</h3><div class="kubam-trigger"><b>Съдебни решения и изпълнение на заповедите</b><p>Най-висока вероятност за нов национален медиен пик.</p></div><div class="kubam-trigger"><b>Физическо ограничаване на достъпа / услуги</b><p>Може да премести историята от правен към силно човешки сюжет.</p></div><div class="kubam-trigger"><b>Нова парламентарна ескалация</b><p>„Баба Алино“ вече е свързано с президентската кампания.</p></div><div class="kubam-trigger"><b>Колективни действия на купувачи</b><p>Най-опасната потенциална промяна в моралната рамка на кризата.</p></div><div class="kubam-note"><b>Оперативно правило:</b> при всеки нов материал Navigator трябва да записва: Origin → Actor → Trigger → Narrative → Evidence → Amplifier → Institutional confirmation → Required response.</div></div></div>
 </div></section>`;
}

function renderDetail(id){
 const a=ACTORS.find(x=>x.id===id)||ACTORS[0], el=document.getElementById('kubamDetail'); if(!el)return;
 document.querySelectorAll('.kubam-node').forEach(n=>n.classList.toggle('active',n.dataset.id===a.id));
 el.innerHTML='<div class="kubam-detail-top"><div><div class="kubam-eyebrow">'+esc(LABELS[a.type])+'</div><h3>'+esc(a.label)+'</h3></div><span class="kubam-tag '+riskClass(a.risk)+'">'+esc(a.intensity)+'</span></div>'+
  '<p class="kubam-role">'+esc(a.role)+'</p>'+
  '<div class="kubam-riskline"><strong>'+a.risk+'</strong><div class="kubam-riskbar"><span style="width:'+a.risk+'%"></span></div><span style="font-size:8px;color:var(--muted)">ESCALATION</span></div>'+
  '<div class="kubam-field"><b>Основен мотив / функция</b><p>'+esc(a.motive)+'</p></div>'+
  '<div class="kubam-field"><b>Тригери</b><p>'+esc(a.triggers)+'</p></div>'+
  '<div class="kubam-field"><b>Основни наративи</b><div class="kubam-chips">'+a.narratives.map(n=>'<span class="kubam-chip">'+esc(n)+'</span>').join('')+'</div></div>'+
  '<div class="kubam-field"><b>Доказателствен статус</b><p>'+esc(a.evidence)+'</p></div>'+
  '<div class="kubam-field"><b>Усилватели</b><p>'+esc(a.amplifiers)+'</p></div>'+
  '<div class="kubam-field"><b>Институционално потвърждение</b><p>'+esc(a.confirmation)+'</p></div>'+
  '<div class="kubam-field"><b>Контранаратив / действие</b><p>'+esc(a.counter)+'</p></div>'+
  '<div class="kubam-sources">'+sourceHtml(a)+'</div>';
}

function activate(){
 document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='attackmap'));
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='attackmap'));
 const t=document.getElementById('pageTitle');if(t)t.textContent='Карта на натиска и наративите';
 const u=new URL(location.href);u.searchParams.set('page','attackmap');history.replaceState(null,'',u);window.scrollTo({top:0,behavior:'smooth'});
}
function boot(){
 if(document.getElementById('attackmap'))return;
 style();
 const nav=document.getElementById('nav'); if(!nav)return;
 const btn=document.createElement('button');btn.dataset.page='attackmap';btn.textContent='Карта на натиска';btn.setAttribute('aria-label','Карта на натиска и наративите');
 const before=nav.querySelector('[data-page="reputation"]')||nav.querySelector('[data-page="settings"]');nav.insertBefore(btn,before);
 const pages=[...document.querySelectorAll('.page')];if(!pages.length)return;pages[pages.length-1].insertAdjacentHTML('afterend',pageHtml());
 btn.addEventListener('click',activate);
 document.querySelectorAll('.kubam-node').forEach(n=>n.addEventListener('click',()=>renderDetail(n.dataset.id)));
 document.querySelectorAll('.kubam-filter').forEach(f=>f.addEventListener('click',()=>{document.querySelectorAll('.kubam-filter').forEach(x=>x.classList.remove('active'));f.classList.add('active');const v=f.dataset.filter;document.querySelectorAll('.kubam-node').forEach(n=>n.classList.toggle('dim',v!=='all'&&n.dataset.type!==v));document.querySelectorAll('.kubam-link').forEach(l=>l.style.opacity=(v==='all'||l.dataset.type===v)?'0.8':'0.1');}));
 renderDetail('vazrazhdane');
 if(new URLSearchParams(location.search).get('page')==='attackmap')setTimeout(activate,0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
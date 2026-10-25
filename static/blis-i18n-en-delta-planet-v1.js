/* Publish Delta BG / EN switch visibility: 20261008-switch3. */
/* Delta Planet Mall — English profile catalog, release 20261008-en7. Loaded after the shared BLIS runtime. */
(function(){'use strict';
if(!/delta-planet/i.test(location.pathname+location.search) && !document.documentElement.innerHTML.includes('Delta Planet Mall')) return;
const M={
"Няма потвърдено ново конкурентно движение над прага за значимост.":"No confirmed new competitor development exceeds the significance threshold.",
"Black Sea Center Offices – Модерни офиси и бизнес пространство в сърцето на град Варна":"Black Sea Center Offices – Modern offices and business space in central Varna",
"iSTYLE поддържа първия си специализиран магазин във Варна в Grand Black Sea Center":"iSTYLE operates its first dedicated store in Varna at Grand Black Sea Center",
"Няма потвърдено ново конкурентно действие за периода. Абсолютни follower броеве не се показват без сравнителна промяна.":"No new competitor action is confirmed for this period. Absolute follower counts are not shown without a comparative change.",
"„Мол Варна“ с нов собственик, вече ще се казва Black Sea Center - Будна Варна":"Mall Varna has a new owner and will be renamed Black Sea Center - Budna Varna",
"конкурентни споменавания през последните 3 месеца":"competitor mentions in the past three months",
"Black Sea Center Offices – Модерни офиси и бизнес пространство в сърцето на град Варна Skip to content Свържете се с нас: 0889 88 55 98 Home Офиси Контакти СВОБОДНИ ОФИСИ СВОБОДНИ ОФИСИ Home Офиси Контакти Не купувате просто офис.":"Black Sea Center Offices – Modern offices and business space in central Varna. Contact: 0889 88 55 98. Offices, contacts and available offices. You are buying more than an office.",
"Публичният календар за 12–18 октомври 2026 показва ежедневни групови занимания, а клубът предлага активни платени":"The public calendar for 12–18 October 2026 lists daily group classes, and the club offers paid activities",
"Актуалният профил на iSTYLE посочва магазин на партер в Grand Black Sea Center с работно време 10:00–21:00 ч.; обектът е първата специализирана iSTYLE локация във":"The current iSTYLE listing places the store on the ground floor of Grand Black Sea Center, open 10:00–21:00; it is the first dedicated iSTYLE location in",
"„Мол Варна“ с нов собственик, вече ще се казва Black Sea Center Будна":"Mall Varna has a new owner and will be renamed Black Sea Center - Budna",
"Георги Самуилов купи \"Мол Варна\", който вече ще се казва Black Sea":"Georgi Samuilov acquired Mall Varna, which will be renamed Black Sea",

"Подарък за ЦВЕТНИЦА - Тениски Варна - Делта Планет Мол - YouTube":"Palm Sunday gift - T-shirts Varna - Delta Planet Mall - YouTube",
"Радио Варна":"Radio Varna",
"открито":"detected",
"School Expo 2026 в Delta Planet Mall Варна събира в един уикенд знания, творчество, спорт и нови възможности - СайтЪТ":"School Expo 2026 at Delta Planet Mall Varna brings learning, creativity, sport and new opportunities together over one weekend - Saytat",
"School Expo 2026 в Delta Planet Mall Варна събира в един уикенд знания, творчество, спорт и нови възможности":"School Expo 2026 at Delta Planet Mall Varna brings learning, creativity, sport and new opportunities together over one weekend",
"На 31 октомври от 15:00 ч. търговският център планира игри, загадки и мисии за деца, с лакомства и награда Kodak":"On 31 October at 15:00, the shopping centre plans games, riddles and missions for children, with treats and a Kodak prize",
"Актуалната програма показва специални прожекции в Cinema City Delta Planet Mall от 23 до 31 октомври 2026":"The current programme lists special screenings at Cinema City Delta Planet Mall from 23 to 31 October 2026",
"Асоциацията на студентите медици във Варна и SCORA провеждат информационна и благотворителна кампания в Delta Planet Mall на 17 и 18 октомври от 12:00 до 15:00":"The Association of Medical Students in Varna and SCORA are holding an information and charity campaign at Delta Planet Mall on 17 and 18 October, from 12:00 to 15:00",

'Ключов измерен показател се промени':'A key measured indicator changed',
'Търговски център / retailtainment / развлечения':'Shopping centre / retailtainment / entertainment',
'Пълен публичен профил · live monitoring · конкурентни досиета':'Full public profile · live monitoring · competitor dossiers',
'Общ изглед':'Overview','Мониторинг':'Monitoring','Среда':'Environment','Конкуренти':'Competitors','Развитие/Доклади':'Development / Reports',
'Публично присъствие':'Public presence','Репутация':'Reputation','Дигитална видимост':'Digital visibility','Конкурентна среда':'Competitive environment',
'Наблюдавани източници':'Monitored sources','Покритие на източниците':'Source coverage','Споменавания · 90 дни':'Mentions · 90 days','Наблюдения · 90 дни':'Observations · 90 days',
'Позитивни · 90 дни':'Positive · 90 days','Негативни · 90 дни':'Negative · 90 days','Позитивни сигнали · 90 дни':'Positive signals · 90 days','Негативни сигнали · 90 дни':'Negative signals · 90 days',
'Общо класифицирани сигнали':'Total classified signals','Свежест · 48 часа':'Freshness · 48 hours','Delta споменавания · 90 дни':'Delta mentions · 90 days',
'Конкурентни сигнали · 90 дни':'Competitor signals · 90 days','Наблюдавани конкурентни формати':'Monitored competitor formats',
'РЗП':'Gross built area','Търговски площи':'Retail space','GLA · RetailMap':'GLA · RetailMap','Паркоместа · RetailMap':'Parking spaces · RetailMap','Марки':'Brands','Развлечения':'Entertainment',
'12 зали · 4DX':'12 screens · 4DX','Публично посочена заетост · Visit Varna':'Publicly reported occupancy · Visit Varna','Адрес':'Address','Контакт':'Contact','Реклама и събития':'Advertising and events',
'над 120 000 m²':'over 120,000 m²','над 40 000 m²':'over 40,000 m²','40 000 m²':'40,000 m²','1 300':'1,300','над 140':'over 140','над 4 000 m²':'over 4,000 m²',
'бул. „Сливница“ 185, Варна':'185 Slivnitsa Blvd., Varna',
'Tenant mix':'Tenant mix','140+ марки':'140+ brands','40 000+ m²':'40,000+ m²','Потвърдено':'Verified','Потвърдено':'Verified','публикации':'posts',
'Споменавания за Delta Planet Mall':'Mentions of Delta Planet Mall','Конкурентни споменавания':'Competitor mentions',
'пряк конкурент':'direct competitor','втори конкурентен кръг':'secondary competitor set','конкурентен формат':'competing format',
'традиционен shopping mall':'traditional shopping mall','търговски + офис площи':'retail + office space','retail park':'retail park',
'около 50 500 m²':'approximately 50,500 m²','13 523.85 m² търговски площи по официалния профил':'13,523.85 m² of retail space according to the official profile','13 000 m²':'13,000 m²',
'около 1 700 места (исторически официално публикувана стойност)':'approximately 1,700 spaces (historically published official figure)','277 места':'277 spaces','500 места':'500 spaces',
'мода, техника, хипермаркет, Cineland/IMAX, Playground, Retro Museum':'fashion, electronics, hypermarket, Cineland/IMAX, Playground, Retro Museum',
'офиси, свободни площи, спорт/развлечения и услуги':'offices, available space, sport/entertainment and services',
'Decathlon, JYSK, Zora, Design Center, Мебели Виденов':'Decathlon, JYSK, Zora, Design Center, Mebeli Videnov',
'Няма достатъчно съпоставими данни за собствен индекс':'Insufficient comparable data for an individual index',
'Измерено от live evidence':'Measured from live evidence',
'Delta Planet Mall · официален сайт':'Delta Planet Mall · official website','Delta Planet Mall · За нас':'Delta Planet Mall · About us','Delta Planet Mall · Магазини':'Delta Planet Mall · Stores',
'Delta Planet Mall · Заведения':'Delta Planet Mall · Food and drink','Delta Planet Mall · План на нивата':'Delta Planet Mall · Floor plan','Delta Planet Mall · Контакти':'Delta Planet Mall · Contacts',
'Google News · Delta Planet Mall':'Google News · Delta Planet Mall','Google Maps · Delta Planet Mall':'Google Maps · Delta Planet Mall','локална видимост, оценки и отзиви':'local visibility, ratings and reviews',
'външни медийни споменавания':'external media mentions','официални новини, събития, кампании и позициониране':'official news, events, campaigns and positioning',
'официални площи, tenant mix и развлекателна концепция':'official floor area, tenant mix and entertainment concept','tenant mix и промени в търговските обекти':'tenant mix and store changes',
'F&B mix и промени':'F&B mix and changes','обекти по нива и пространствен tenant mix':'units by floor and spatial tenant mix','официални контакти и рекламни/събитийни функции':'official contacts and advertising/event functions',
'публични туристически оценки и тематични отзиви':'public tourist ratings and thematic reviews','GLA, паркиране, ключови наематели и формат':'GLA, parking, key tenants and format',
'локален туристически профил и публични факти':'local tourist profile and public facts',
'пряк конкурент · магазини, заведения, кино, развлечения, промоции и събития':'direct competitor · stores, dining, cinema, entertainment, promotions and events',
'пряк конкурент · tenant mix, нови обекти и промоции':'direct competitor · tenant mix, new openings and promotions',
'втори конкурентен кръг · търговски/офис площи и свободни помещения':'secondary competitor set · retail/office space and available units',
'втори конкурентен кръг · площи, функции и собственост':'secondary competitor set · floor area, functions and ownership',
'конкурентен формат · home/sport/tech retail, GLA и parking':'competing format · home/sport/tech retail, GLA and parking',
'Всички ваучери от кампанията „Палитра от намаления“ са изчерпани':'All vouchers from the “Palette of Discounts” campaign are sold out',
'VR Varna е активен на ниво 1 и ниво -3 в Delta Planet Mall':'VR Varna is active on Level 1 and Level -3 at Delta Planet Mall',
'GABINA е представена като нов магазин на ниво 1':'GABINA is presented as a new store on Level 1',
'Costa Coffee комуникира нови Refresher напитки в Delta Planet Mall':'Costa Coffee promotes new Refresher drinks at Delta Planet Mall',
'School Expo 2026 в Delta Planet Mall':'School Expo 2026 at Delta Planet Mall','VR Varna поддържа активна локация в Delta Planet Mall':'VR Varna maintains an active location at Delta Planet Mall',
'Всички ваучери от кампанията „Палитра от намаления“ са изчерпани!':'All vouchers from the “Palette of Discounts” campaign are sold out!',
'Програма на Cinema City в Delta Planet Mall':'Cinema City programme at Delta Planet Mall','Потребителски отзив за Delta Planet Mall':'Customer review of Delta Planet Mall',
'Юли е месецът на ваканцията':'July is holiday month',
'Black Sea Center: нов собственик и нова концепция':'Black Sea Center: new owner and new concept','Black Sea Center влиза в нов етап на развитие':'Black Sea Center enters a new stage of development',
'Black Sea Center като ново поколение градско пространство':'Black Sea Center as a new-generation urban space'
};
Object.assign(M,{
"Продукт и категория":"Product and category",
"Сигналът се потвърждава в 2 различни източника и е достатъчно значим за проследяване.":"The signal is confirmed by 2 different sources and is significant enough to monitor.",
"2 източника / потвърждения":"2 sources / confirmations"
});
Object.assign(M,{
"Как се променя средата":"How the environment is changing",
"Конкретни теми и измерими движения. Ако няма именуема тема, Navigator не измисля такава.":"Specific themes and measurable movements. If there is no identifiable theme, Navigator does not invent one.",
"Активни теми":"Active themes",
"18.10, 02:20 · за проследяване":"18 Oct, 02:20 · monitor",
"Промяна във възприятието и средата":"Change in perception and environment",
"Няма измерима промяна в репутационната или пазарната среда над прага за значимост.":"No measurable change in the reputation or market environment exceeds the significance threshold.",
"Какво да наблюдаваме":"What to monitor"
});
Object.assign(M,{
"Празнично работно време на Delta Planet Mall - boulevardbulgaria.bg":"Holiday opening hours at Delta Planet Mall - boulevardbulgaria.bg",
"Празнично работно време на Delta Planet Mall":"Holiday opening hours at Delta Planet Mall",
"Празничното работно време на Delta Planet Mall по време на коледните и новогодишните празници през 2025 г.":"Delta Planet Mall holiday opening hours during the 2025 Christmas and New Year period."
});
Object.assign(M,{
"Няма достатъчно силна нова възможност. Това е валиден резултат — слабите сигнали не се показват.":"There is no sufficiently strong new opportunity. This is a valid result — weak signals are not shown."
});
Object.assign(M,{
"Историческа база":"Historical baseline",
"Важни промени":"Key developments",
"потвърдени споменавания през последните 3 месеца":"verified mentions in the past 3 months",
"На 19–20 септември 2026 Delta Planet Mall е домакин на School Expo „Уча, творя, спортувам“ с образователни, спортни и творчески":"On 19–20 September 2026, Delta Planet Mall hosts the School Expo “Learn, Create, Play Sports”, with educational, sports and creative activities"
});
Object.assign(M,{"Спрямо предходното измерване":"Compared with the previous measurement"});
Object.assign(M,{
"Радио Варна · Delta Planet Mall":"Radio Varna · Delta Planet Mall",
"Варна Онлайн · Delta Planet Mall":"Varna Online · Delta Planet Mall",
"CineCity Guide · Cinema City Delta Planet Mall":"CineCity Guide · Cinema City Delta Planet Mall",
"актуални локални медийни споменавания и обществени инициативи":"current local media mentions and community initiatives",
"локални новини и събитийни споменавания":"local news and event mentions",
"актуална кино програма и предстоящи специални прожекции":"current cinema programme and upcoming special screenings",
"втори конкурентен кръг · актуална концепция с офиси, търговия, услуги, спорт и развлечения":"secondary competitor set · current concept combining offices, retail, services, sports and entertainment",
"втори конкурентен кръг · офисни площи, паркинг, бъдещи функции и инвестиционно позициониране":"secondary competitor set · office space, parking, planned functions and investment positioning",
"Томбола за IKEA ваучер 500€ · активна 1–30 октомври 2026":"IKEA €500 voucher raffle · active 1–30 October 2026",
"Ден на мистериите · 31 октомври 2026 · от 15:00 ч.":"Mystery Day · 31 October 2026 · from 15:00",
"Информационна и благотворителна кампания за профилактика на рака на гърдата · 17–18 октомври · 12:00–15:00":"Breast cancer awareness and charity campaign · 17–18 October · 12:00–15:00",
"Cinema City Delta Planet Mall е включен в програмата на CineLibri 2026 с прожекции 23–31 октомври":"Cinema City Delta Planet Mall is included in the CineLibri 2026 programme with screenings from 23–31 October",
"Кампания за профилактика на рака на гърдата в Delta Planet Mall на 17–18 октомври":"Breast cancer awareness campaign at Delta Planet Mall on 17–18 October",
"Асоциацията на студентите медици във Варна и SCORA провеждат информационна и благотворителна кампания в Delta Planet Mall на 17 и 18 октомври от 12:00 до 15:00 ч.":"The Association of Medical Students in Varna and SCORA are holding an information and charity campaign at Delta Planet Mall on 17 and 18 October from 12:00 to 15:00.",
"Delta Planet Mall провежда томбола за IKEA ваучер на стойност 500€":"Delta Planet Mall is running a raffle for a €500 IKEA voucher",
"Кампанията е активна от 1 до 30 октомври 2026 г. и добавя промоционална причина за повторно посещение през целия месец.":"The campaign runs from 1 to 30 October 2026, adding a promotional reason for repeat visits throughout the month.",
"Cinema City в Delta Planet Mall влиза в програмата на CineLibri 2026":"Cinema City at Delta Planet Mall joins the CineLibri 2026 programme",
"Актуалната програма показва специални прожекции в Cinema City Delta Planet Mall от 23 до 31 октомври 2026 г.":"The current programme lists special screenings at Cinema City Delta Planet Mall from 23 to 31 October 2026.",
"Delta Planet Mall подготвя „Ден на мистериите“ за Хелоуин":"Delta Planet Mall prepares a Halloween “Mystery Day”",
"На 31 октомври от 15:00 ч. търговският център планира игри, загадки и мисии за деца, с лакомства и награда Kodak PIXPRO.":"On 31 October from 15:00, the shopping centre plans games, riddles and missions for children, with treats and a Kodak PIXPRO prize.",
"Black Sea Center развива нова лайфстайл концепция с офиси, услуги, спорт и развлечения":"Black Sea Center is developing a new lifestyle concept combining offices, services, sports and entertainment",
"Официалният профил описва офиси на етажи 3–4, над 600 паркоместа, Pulse Fitness & Spa 5 000 m², падел, детски център 2 500 m², ресторанти, premium café, банки и retail.":"The official profile describes offices on floors 3–4, more than 600 parking spaces, a 5,000 m² Pulse Fitness & Spa, padel, a 2,500 m² children's centre, restaurants, a premium café, banking and retail.",
"iSTYLE поддържа първия си специализиран магазин във Варна в Grand Mall Varna":"iSTYLE operates its first dedicated Varna store at Grand Mall Varna",
"Актуалният профил на iSTYLE посочва магазин на партер в Grand Mall Varna с работно време 10:00–21:00 ч.; обектът е първата специализирана iSTYLE локация във Варна.":"The current iSTYLE profile lists a ground-floor store at Grand Mall Varna, open 10:00–21:00; it is iSTYLE's first dedicated location in Varna.",
"Next Level Retail Park Varna поддържа активна фитнес програма през октомври":"Next Level Retail Park Varna maintains an active fitness programme in October",
"Публичният календар за 12–18 октомври 2026 г. показва ежедневни групови занимания, а клубът предлага активни платени абонаменти.":"The public calendar for 12–18 October 2026 shows daily group classes, while the club offers active paid memberships.",
"офиси + търговия + услуги + спорт + развлечения":"offices + retail + services + sports + entertainment",
"официалният сайт посочва над 65 000 m² Prime Real Estate; не е публикувано като единен retail GLA":"the official site states more than 65,000 m² of Prime Real Estate; it is not published as a single retail GLA figure",
"над 600 места за посетители и наематели":"more than 600 spaces for visitors and tenants",
"офиси на етажи 3–4; Pulse Fitness & Spa 5 000 m²; падел; детски център 2 500 m²; 3 ресторанта; premium café; банки и retail":"offices on floors 3–4; 5,000 m² Pulse Fitness & Spa; padel; 2,500 m² children's centre; 3 restaurants; premium café; banking and retail",
"офисни продажби/наеми; реконструкция; нови оператори; търговски и F&B микс; спорт/развлечения; паркинг; връзка с Kaufland":"office sales/leasing; reconstruction; new operators; retail and F&B mix; sports/entertainment; parking; connection to Kaufland",
"мода, техника, хипермаркет, Cineland/IMAX, Playground, Retro Museum, iSTYLE":"fashion, electronics, hypermarket, Cineland/IMAX, Playground, Retro Museum, iSTYLE",
"Decathlon, JYSK, Zora, Design Center, Мебели Виденов, Ralica, Next Level":"Decathlon, JYSK, Zora, Design Center, Mebeli Videnov, Ralica, Next Level",
"нови наематели; категории home/sport/tech; фитнес и услуги; промоции; разширения; трафик и удобство":"new tenants; home/sport/tech categories; fitness and services; promotions; expansion; traffic and convenience"
});
const R=[
[/^На 19–20 септември 2026(?: г\.)? Delta Planet Mall е домакин на School Expo „Уча, творя, спортувам“ с образователни, спортни и творчески(?: участници)?\.?$/,'On 19–20 September 2026, Delta Planet Mall hosts the School Expo “Learn, Create, Play Sports”, featuring educational, sports and creative participants.'],
[/^(\d+) публикации$/,'$1 posts'],
[/^На 19–20 септември 2026 г\. Delta Planet Mall е домакин на School Expo „Уча, творя, спортувам“ с образователни, спортни и творчески участници\.$/,'On 19–20 September 2026, Delta Planet Mall hosts the School Expo “Learn, Create, Play Sports”, featuring educational, sports and creative participants.'],
[/^VR Varna публикува актуално работно време и потвърждава присъствие на ниво 1 и ниво -3 в Delta Planet Mall\.$/,'VR Varna publishes current opening hours and confirms its presence on Level 1 and Level -3 at Delta Planet Mall.'],
[/^Delta Planet Mall съобщава за изчерпани ваучери от кампанията „Палитра от намаления“ след силен интерес\.$/,'Delta Planet Mall reports that vouchers for the “Palette of Discounts” campaign sold out following strong interest.'],
[/^Публична кино програма за Cinema City в Delta Planet Mall, Варна\.$/,'Public cinema programme for Cinema City at Delta Planet Mall, Varna.'],
[/^Публикуван е потребителски отзив за посещение в Delta Planet Mall през юли 2026 г\.$/,'A customer review of a visit to Delta Planet Mall was published in July 2026.'],
[/^Delta Planet Mall публикува лятна комуникация за юли и активностите в търговския център\.$/,'Delta Planet Mall publishes summer communication for July and activities at the shopping centre.']
];
Object.assign(M,{"МОЯТ БРАНД":"MY BRAND","РЕСУРСИ":"RESOURCES","✦ Попитай Navigator":"✦ Ask Navigator","Попитай Navigator":"Ask Navigator","Попитай →":"Ask →","Попитай":"Ask","Търсене в профила на":"Search the profile of","Актуално състояние на бранда, посока и най-важни промени.":"Current brand status, direction and key changes.","Значими сигнали, видимост, рискове и възможности в текущата информационна среда.":"Significant signals, visibility, risks and opportunities in the current information environment.","Пазарни промени, теми и отражението им върху възприятието за бранда.":"Market developments, topics and their effect on brand perception.","Пазарни теми, публично възприятие и връзките между тях.":"Market topics, public perception and the connections between them.","Позиция, движение и значими промени при наблюдаваните конкуренти.":"Position, trends and significant changes among monitored competitors.","Развитие във времето, ключови събития и налични аналитични материали.":"Development over time, key events and available analytical materials.","без сравнение":"no comparison","нормално":"normal","Внимание":"Attention","Посока":"Direction","Най-важното за текущия период":"Key developments this period","Кратък преглед на последните значими промени за Delta Planet Mall. Това е входът към останалите страници на анализа.":"A brief review of the latest significant changes for Delta Planet Mall, with links to the other analysis pages.","Всички важни сигнали →":"All important signals →","Защо се промени?":"Why did it change?","Няма съществена измерена промяна":"No significant measured change","Най-важното за клиента сега":"What matters to the client now","Кратко обобщение само на потвърдените промени. Без повторение на всички показатели.":"A brief summary of confirmed changes.","Текущите данни не показват достатъчно силно движение, което да изисква отделно обяснение.":"Current data does not show a large enough change to require a separate explanation.","Пазарно движение":"Market developments","Пазарна възможност":"Market opportunity","Има потвърдена тема, която може да създаде благоприятен контекст за бранда. Сигналът е силен, но все още е с ограничено източниково покритие.":"A confirmed topic may create a favourable context for the brand. The signal is strong, but source coverage remains limited.","Фактология и източници":"Facts and sources","Попитай за текущия клиент":"Ask about this client","Отговорите използват наличните данни, сигнали и доказателства в Navigator. Ако база липсва, това се казва изрично.":"Answers use the data, signals and evidence available in Navigator. Missing data is stated explicitly.","Какво се промени?":"What changed?","Какво правят конкурентите?":"What are competitors doing?","Има ли нова възможност?":"Is there a new opportunity?","Кои сигнали заслужават внимание?":"Which signals need attention?","Избери въпрос или напиши свой.":"Choose a question or write your own.","Какво се случва в момента":"What is happening now","Само уникални промени с контекст, значение, потенциално влияние и доказателства.":"Distinct developments with context, significance, potential impact and evidence.","уникални приоритетни теми":"distinct priority topics","Повторните публикации за едно и също развитие са обединени. Броят източници е доказателствен контекст, а не отделен сигнал.":"Repeated coverage of the same development is grouped together. The number of sources provides evidence context.","ЗНАЧИМ СИГНАЛ":"MATERIAL SIGNAL","Защо има значение":"Why it matters","Сигналът е релевантен към текущото наблюдение; ефектът още не е потвърден.":"The signal is relevant to current monitoring; its impact is not yet confirmed.","Влияние":"Impact","Информационна среда":"Information environment","Следващо наблюдение":"What to monitor next","Следете за второ независимо потвърждение или измерим ефект преди по-силен извод.":"Watch for independent corroboration or a measurable impact before drawing a stronger conclusion.","Доказателство ↗":"Evidence ↗","Доверие и репутация":"Trust and reputation","Радар":"Radar","Легенда на точките":"Radar legend","Наблюдаван източник":"Monitored source","Възможност / позитивна промяна":"Opportunity / positive change","Пазарна промяна":"Market change","Друг значим сигнал":"Other significant signal","По-голяма точка = по-висока значимост · Пулсираща точка = нов сигнал":"Larger dot = greater significance · Pulsing dot = new signal","Натрупване на измерима база":"Building a measurable baseline","Хронология на споменаванията":"Mention timeline","Потвърдени публични споменавания с дата от последните 3 месеца, подредени от най-новото към по-старото.":"Verified public mentions from the past three months, listed from newest to oldest.","Свързване с потока…":"Connecting to the feed…","Няма открити споменавания на клиента в последните 3 месеца.":"No client mentions found in the past three months.","Няма открити публични споменавания в последните 3 месеца. Потокът остава активен.":"No public mentions found in the past three months. Monitoring remains active.","Marmaris Restaurant публикува обедно меню от Delta Planet Mall":"Marmaris Restaurant publishes a lunch menu from Delta Planet Mall","VR Varna посочва Delta Planet Mall като локация на обекта си":"VR Varna lists Delta Planet Mall as its venue location","публикувано":"published","ИЗТОЧНИК ↗":"SOURCE ↗","МОНИТОРИНГ · ДОПЪЛНИТЕЛЕН КОНТЕКСТ":"MONITORING · ADDITIONAL CONTEXT","Пулс на наблюдението":"Monitoring pulse","Значими сигнали за марката, източници, теми и области за внимание.":"Significant brand signals, sources, topics and areas requiring attention.","след филтъра за полезност":"after relevance filtering","За внимание":"Needs attention","Външни":"External","различими публични източници":"distinct public sources","Последен сигнал":"Latest signal","Водеща тема":"Leading topic","Споменавания на марката":"Brand mentions","Публикации и сигнали за текущия клиент през избрания период. Всеки запис води към първоизточника.":"Publications and signals for this client in the selected period. Each entry links to its original source.","Публични източници · обновяване на 60 сек.":"Public sources · refreshed every 60 seconds","Активност във времето":"Activity over time","Реален брой значими сигнали в шест последователни части на избрания период.":"Measured significant signals across six consecutive parts of the selected period.","Източници на сигналите":"Signal sources","Кои публични източници стоят зад значимата информация.":"Public sources supporting the significant information.","Профил на наблюдението":"Monitoring profile","Дял на значимите сигнали по шест клиентски важни направления. Това е втори аналитичен профил, различен от основния Радар.":"The share of significant signals across six areas relevant to the client, providing an additional analytical view alongside the main radar.","Комуникации":"Communications","Продукти":"Products","Сигнали за внимание":"Signals requiring attention","Външни публикации":"External publications","Пазарни промени":"Market developments","Комуникационна активност":"Communication activity","Продуктови развития":"Product developments","Какво показва наблюдението":"What monitoring shows","Автоматично обобщение само от наличните значими сигнали.":"An automatic summary based on the available significant signals.","Потвърдени възможности":"Confirmed opportunities","Само теми с достатъчна доказателствена база — не всеки положителен сигнал.":"Topics supported by sufficient evidence.","Как AI платформите представят бранда":"How AI platforms represent the brand","Няма достатъчно директни измервания от AI платформи. Navigator не показва фиктивен AI индекс.":"There are not enough direct measurements from AI platforms to report an AI index.","БЕЗ ИЗМЕРВАНЕ":"NOT MEASURED","няма данни":"no data","Показва се резултат само при директно или надеждно регистрирано измерване. Navigator не изчислява фиктивен AI индекс.":"A result is shown only when supported by a direct or reliably recorded measurement.","Интерактивна карта на възприятията":"Interactive perception map","● В РЕАЛНО ВРЕМЕ":"● LIVE","BLIS сигнал":"BLIS signal","Мрежа · центърът показва най-свързаните фактори":"Network · the centre shows the most connected factors","Споменавания на конкурентите":"Competitor mentions","Проверими публикации за конфигурираните конкуренти през избрания период. Всеки запис води към източника; споменаването само по себе си не означава действие на конкурента.":"Verifiable publications about the monitored competitors in the selected period. Each entry links to its source; a mention alone does not establish a competitor action.","Активност по конкуренти":"Activity by competitor","Брой налични конкурентни сигнали за избрания период. Това не е пазарен дял.":"Available competitor signals in the selected period. These counts do not measure market share.","без нов потвърден сигнал":"no new confirmed signal","Последни споменавания":"Latest mentions","Публикации за конкурентите с посочен източник и време на откриване или публикуване.":"Competitor publications with their source and publication or detection time.","Какво реално променят конкурентите":"What competitors are changing","Групирани движения вместо поредица от отделни споменавания.":"Related developments grouped together.","Публична активност":"Public activity","Цена / оферта":"Price / offer","Кампания":"Campaign","Какво реално се променя при конкурентите":"What is changing among competitors","Действия, движение и относителна позиция — не каталог от абсолютни броячи.":"Actions, trends and relative position.","Относителна позиция":"Relative position","Сравнение с конкурентите":"Competitor comparison","Подробно досие":"Detailed profile","Отвори досие":"Open profile","Позиция":"Position","Лидер":"Leader","Дистанция до лидер":"Gap to leader","ДИСТАНЦИЯ ДО ЛИДЕР":"GAP TO LEADER","Хронология на конкурентните споменавания":"Competitor mention timeline","Публични споменавания, публикувани или открити от мониторинга през последните 3 месеца. Когато източникът не дава дата на публикация, се показва датата на откриване.":"Public mentions published or detected in the past three months. When the source provides no publication date, the detection date is shown.","Няма открити конкурентни споменавания в последните 3 месеца.":"No competitor mentions found in the past three months.","Grand Mall Varna / публична социална публикация":"Grand Mall Varna / public social post","Next Level Retail Park Varna с активен график на 16 септември":"Next Level Retail Park Varna has an active schedule on 16 September","Next Level Retail Park Varna публикува седмичен график за 14–20 септември":"Next Level Retail Park Varna publishes its weekly schedule for 14–20 September","Next Level Retail Park Varna с програма през 20–26 юли":"Next Level Retail Park Varna has a programme for 20–26 July","Pandora с предложение „Вземи 3, плати 2“ в Grand Mall Varna":"Pandora offers “Take 3, pay for 2” at Grand Mall Varna","Pandora с предложение „Вземи 3, плати 2“ в Grand Black Sea Center":"Pandora offers “Take 3, pay for 2” at Grand Black Sea Center","Playground Grand Mall промотира награди и активности":"Playground Grand Mall promotes prizes and activities","JULIANY Back to School в Grand Mall Varna":"JULIANY Back to School at Grand Mall Varna","Как се развива картината във времето":"How the situation develops over time","Събитие → промяна → обяснение. Историята на бизнеса, а не историята на базата данни.":"Event → change → explanation. A timeline of business developments.","СЪБИТИЕ":"EVENT","Измерима промяна за сравнимия период":"Measured change over the comparable period","Динамика във времето":"Change over time","зареждане":"loading","Зареждат се реалните публикувани доклади.":"Loading published reports.","СайтЪТ":"Saytat","Будна Варна":"Budna Varna","Капитал":"Capital","Капитал ↗":"Capital ↗","Regal / Капитал":"Regal / Capital","Будна Варна ↗":"Budna Varna ↗","КРИБ / в. Марица":"KRIB / Maritsa","Търговски център / retailtainment":"Shopping centre / retailtainment","Бизнес и офис комплекс":"Business and office complex","Конкурентна позиция":"Competitive position"});
for(const [bg,en] of Object.entries(M)){if(/[А-Яа-я]/.test(bg)&&!M[bg.toUpperCase()])M[bg.toUpperCase()]=en.toUpperCase()}

R.push(
 [/^(\d+) доказателства$/,'$1 evidence items'],
 [/^(\d+) източника$/,'$1 sources'],
 [/^(\d+) налично потвърждение$/,'$1 available confirmation'],
 [/^(\d+) уникални приоритетни теми$/,'$1 distinct priority topics'],
 [/^(\d+) сигнал(?:а)?(?: · (\d+)%)?$/,'$1 signals · $2%'],
 [/^(\d+)% от значимите сигнали$/,'$1% of significant signals'],
 [/^(\d+)% от текущия поток$/,'$1% of the current feed'],
 [/^(\d+) (потвърдени|конкурентни) споменавания през последните 3 месеца$/,(_,n,k)=>n+' '+(k==='конкурентни'?'competitor':'verified')+' mentions in the past three months'],
 [/^(\d+) споменавания · проверка на (\d+) сек\.$/,'$1 mentions · checked every $2 seconds'],
 [/^На живо · проверка на (\d+) сек\. · (.+)$/,(_,n,d)=>'Live · checked every '+n+' seconds · '+d.replace(/\s*г\./g,'')],
 [/^(.*) · Открито (.*)$/,(_,s,d)=>(M[s]||s)+' · Detected '+d],
 [/^(.*) · Published (.*)$/,(_,s,d)=>(M[s]||s)+' · Published '+d],
 [/^(.*) · Публикувано (.*)$/,(_,s,d)=>(M[s]||s)+' · Published '+d],
 [/^(.*) · (Пазарно движение|Публична активност|Цена \/ оферта|Кампания)$/,(_,s,k)=>s+' · '+(M[k]||k)],
 [/^Има (\d+) свързани сигнала за пазарно движение\.$/,'There are $1 related signals of market developments.'],
 [/^Потвърдено движение при (.+)\.$/,'Confirmed developments at $1.'],
 [/^(.*?) се (влошава|подобрява) с ([\d,.]+) т\. спрямо сравнимия период\.$/,(_,s,k,n)=>(M[s]||window.BLISI18N?.t?.(s)||s)+' '+(k==='влошава'?'declines':'improves')+' by '+n.replace(',','.')+' points versus the comparable period.'],
 [/^Водещата тема е „(.+)“ с (\d+) сигнал\.$/,'The leading topic is “$1”, with $2 signal.'],
 [/^Втората половина на периода съдържа (\d+) значими сигнала спрямо (\d+) в първата\.$/,'The second half of the period contains $1 significant signals versus $2 in the first half.'],
 [/^сигнала \/ публикации · последно (.+)$/,'signals / publications · latest $1'],
 [/^(\d{1,2}) (януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември) (\d{4}) г\.$/,(_,d,m,y)=>d+' '+({'януари':'January','февруари':'February','март':'March','април':'April','май':'May','юни':'June','юли':'July','август':'August','септември':'September','октомври':'October','ноември':'November','декември':'December'}[m])+' '+y],
 [/^(.+?\d{4}) г\.(.*)$/,'$1$2'],
 [/^VR Varna публикува актуално работно време и потвърждава присъствие.*$/,'VR Varna publishes current opening hours and confirms its presence on Levels 1 and -3 at Delta Planet Mall.'],
 [/^На 19–20 септември 2026 г\. Delta Planet Mall е домакин.*$/,'On 19–20 September 2026, Delta Planet Mall hosts School Expo with educational, sports and creative participants.'],
 [/^Delta Planet Mall съобщава за изчерпани ваучери.*$/,'Delta Planet Mall reports that campaign vouchers sold out following strong interest.'],
 [/^Публична кино програма за Cinema City в Delta Planet Mall.*$/,'Public cinema programme for Cinema City at Delta Planet Mall, Varna.'],
 [/^Публикация на ресторант Marmaris кани посетители.*$/,'A Marmaris Restaurant publication invites visitors to its venue at Delta Planet Mall.'],
 [/^Публикуван е потребителски отзив за посещение в Delta Planet Mall.*$/,'A customer review of a visit to Delta Planet Mall was published in July 2026.'],
 [/^Актуализираната публична информация на VR Varna посочва.*$/,'Updated public information from VR Varna lists its venues on Levels 1 and -3 at Delta Planet Mall.'],
 [/^School Expo 2026 “Уча\. Творя\. Спортувам\.” продължава:.*$/,'School Expo 2026 “Learn. Create. Play Sports.” continues, with schools and clubs welcoming children and parents at Delta Planet Mall.'],
 [/^Публичният календар показва групови занимания.*$/,'The public calendar lists group classes at the Retail Park Varna club.'],
 [/^Regal публикува материал на Капитал за придобиването.*$/,'Regal publishes a Capital article about the acquisition and transformation of the former Mall Varna into Black Sea Center.'],
 [/^Публичният график показва ежедневна активност.*$/,'The public schedule shows daily fitness-club activity at Retail Park Varna during the week of 14–20 September.'],
 [/^Публикация за новите собственици, ребрандирането.*$/,'A publication covers the new owners, rebranding and the retail, office, sports and entertainment concept.'],
 [/^Георги Самуилов купи "Мол Варна", който вече ще се казва Black Sea Center.*$/,'Georgi Samuilov acquired Mall Varna, which will be renamed Black Sea Center.'],
 [/^Публична публикация за сезонна промоция на Pandora.*$/,'A public post covers a seasonal Pandora promotion at Grand Black Sea Center.'],
 [/^Black Sea Center - ново поколение градско пространство в центъра на Варна.*$/,'Black Sea Center: a new generation of urban space in central Varna.'],
 [/^Медиен преглед отразява позиционирането на Black Sea Center.*$/,'A media review covers Black Sea Center’s positioning as a complex with offices, retail, restaurants, sports and services.'],
 [/^Публикация за развлекателни активности в Playground Grand Black Sea Center.*$/,'A publication covers entertainment activities at Playground Grand Black Sea Center.'],
 [/^Публичният календар показва активна седмична програма.*$/,'The public calendar shows an active weekly programme, including functional training.']
);

Object.assign(M,{'Мониторинг':'Monitoring','Развитие/Доклади':'Development / Reports','Ограничено покритие':'Limited coverage','Наблюдението продължава.':'Monitoring continues.','Няма нови сигнали над прага за клиентска значимост. Това не означава липса на наблюдение, а липса на достатъчно силна нова промяна.':'No new signals exceed the client significance threshold. Monitoring continues, with no sufficiently strong new change.'});
window.BLIS_EN_TRANSLATIONS=Object.assign(window.BLIS_EN_TRANSLATIONS||{},M);
window.BLIS_EN_RULES=(window.BLIS_EN_RULES||[]).concat(R);
window.dispatchEvent(new CustomEvent('blis:i18n-catalog',{detail:{catalog:'delta-planet-en'}}));
if(window.BLISI18N&&window.BLISI18N.apply)window.BLISI18N.apply(document);
Object.assign(M,{'Мрежа на пазарни и репутационни фактори':'Network of market and reputation factors','Какво се случва на пазара':'What is happening in the market','Как се отразява върху възприятието':'How it affects perception','репутационно състояние':'reputation status','Какво се промени при конкурентите':'What changed among competitors','Няма нов отделен конкурентен сигнал над прага за значимост.':'No new distinct competitor signal exceeds the significance threshold.','tenant_activity':'Tenant activity','event':'Event','campaign':'Campaign','entertainment':'Entertainment'});
R.push([/^(.*) ([-+]?\\d+(?:[.,]\\d+)?) т\\.$/,'$1 $2 pts']);
Object.assign(M,{"Какво трябва да знаете сега":"What you need to know now","Delta Planet Mall · състояние, причина, риск и възможност без повторение на техническа телеметрия.":"Delta Planet Mall · status, drivers, risks and opportunities.","Общо състояние":"Overall status","Извод за клиента":"Client takeaway","Какво движи картината":"What drives the situation","Положително развитие":"Positive development","ВЪЗМОЖНОСТ":"OPPORTUNITY","Налице е положителна промяна, която може да подобри позицията на Delta Planet Mall.":"A positive development may improve Delta Planet Mall’s position.","Следете дали положителното развитие се задържа и се превръща в измеримо подобрение.":"Monitor whether the positive development continues and leads to a measurable improvement.","Moreto.net - Варна":"Moreto.net - Varna","Retail Park Varna · Дигитално движение":"Retail Park Varna · Digital developments","Grand Mall Varna / публична социална публикация ↗":"Grand Mall Varna / public social post ↗","Проверка на конкурентния поток · 3 конкурента":"Checking the competitor feed · 3 competitors","Няма нова потвърдена конкурентна публикация в наличния поток за избрания период.":"No new verified competitor publication is available for the selected period.","Няма проверено конкурентно споменаване, публикувано през избрания период. Архивните публикации не се броят като нови.":"No verified competitor mention was published in the selected period. Archived publications are not counted as new."});
for(const[bg,en]of Object.entries(M)){if(/[А-Яа-я]/.test(bg)&&!M[bg.toUpperCase()])M[bg.toUpperCase()]=en.toUpperCase()}
R.push([/^([↓↑→]) ([\d.,+-]+) т\. за периода$/,'$1 $2 pts over the period'],[/^BLIS Index се влошава с ([\d.,]+) т\. спрямо сравнимия период\. Конкурентна позиция се влошава с ([\d.,]+) т\. спрямо сравнимия период\. Най-силното положително развитие е „Търговска активност“\.$/,'BLIS Index declined by $1 points and competitive position declined by $2 points versus the comparable period. The strongest positive development is commercial activity.']);
Object.assign(M,{"Аномалия в информационната активност":"Unusual information activity","Най-важното":"Most important","НАЙ-ВАЖНОТО":"MOST IMPORTANT","Обемът на новите сигнали за последните 24 часа е значително над предходния сравним период.":"The volume of new signals in the past 24 hours is significantly higher than in the previous comparable period.","Обемът на новите сигнали за последните 24 часа е значително над предходния сравним период. Рязката промяна в обема често е по-информативна от абсолютния брой споменавания и може да маркира нова тема, кампания, инцидент или конкурентно движение.":"The volume of new signals in the past 24 hours is significantly higher than in the previous comparable period. A sharp change in volume can be more informative than the total mention count and may indicate a new topic, campaign, incident or competitor development."});
Object.assign(M,{'Добро покритие':'Good coverage'});
// Keep the client catalog authoritative even when a legacy renderer captured Bulgarian.
function deltaEnglish(){return new URLSearchParams(location.search).get('lang')==='en'}
function translateDelta(raw){
 if(!raw)return raw;
 if(!/[А-Яа-я]/.test(raw)&&!Object.prototype.hasOwnProperty.call(M,raw.trim()))return raw;
 const s=raw.trim();let next=M[s]??(window.BLIS_EN_TRANSLATIONS||{})[s];
 if(next===undefined){for(const [re,repl]of [...R,...(window.BLIS_EN_RULES||[])]){re.lastIndex=0;if(re.test(s)){re.lastIndex=0;next=s.replace(re,repl);break}}}
 if(next===undefined)return raw;
 return raw.slice(0,raw.indexOf(s))+next+raw.slice(raw.indexOf(s)+s.length);
}
let applying=false;
function applyDelta(){
 if(applying||!deltaEnglish())return;
 applying=true;
 try{
  if(document.documentElement.lang!=='en')document.documentElement.lang='en';
  const walker=document.createTreeWalker(document.body||document.documentElement,NodeFilter.SHOW_TEXT);
  let n;while((n=walker.nextNode())){
   if(n.parentElement&&/SCRIPT|STYLE|NOSCRIPT|TEXTAREA/.test(n.parentElement.tagName))continue;
   const next=translateDelta(n.nodeValue);if(next!==n.nodeValue)n.nodeValue=next;
  }
  for(const el of document.querySelectorAll('[title],[aria-label],[placeholder],[alt]')){
   for(const a of ['title','aria-label','placeholder','alt']){const v=el.getAttribute(a),next=translateDelta(v);if(next!==v)el.setAttribute(a,next)}
  }
  document.documentElement.dataset.deltaEnglishCatalog='20261018-current';
 }finally{applying=false}
}
function scheduleDelta(){applyDelta()}
function startDelta(){
 applyDelta();
 new MutationObserver(()=>{if(!applying)applyDelta()}).observe(document.body||document.documentElement,{subtree:true,childList:true,characterData:true});
 new MutationObserver(()=>{
  if(deltaEnglish()&&document.documentElement.lang!=='en')applyDelta();
 }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startDelta,{once:true});else startDelta();
})();
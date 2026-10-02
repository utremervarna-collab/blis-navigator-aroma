/* Delta Planet Mall — English profile catalog. Loaded after the shared BLIS runtime. */
(function(){'use strict';
if(!/delta-planet/i.test(location.pathname+location.search) && !document.documentElement.innerHTML.includes('Delta Planet Mall')) return;
const M={
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
const R=[
[/^(\d+) публикации$/,'$1 posts'],
[/^На 19–20 септември 2026 г\. Delta Planet Mall е домакин на School Expo „Уча, творя, спортувам“ с образователни, спортни и творчески участници\.$/,'On 19–20 September 2026, Delta Planet Mall hosts the School Expo “Learn, Create, Play Sports”, featuring educational, sports and creative participants.'],
[/^VR Varna публикува актуално работно време и потвърждава присъствие на ниво 1 и ниво -3 в Delta Planet Mall\.$/,'VR Varna publishes current opening hours and confirms its presence on Level 1 and Level -3 at Delta Planet Mall.'],
[/^Delta Planet Mall съобщава за изчерпани ваучери от кампанията „Палитра от намаления“ след силен интерес\.$/,'Delta Planet Mall reports that vouchers for the “Palette of Discounts” campaign sold out following strong interest.'],
[/^Публична кино програма за Cinema City в Delta Planet Mall, Варна\.$/,'Public cinema programme for Cinema City at Delta Planet Mall, Varna.'],
[/^Публикуван е потребителски отзив за посещение в Delta Planet Mall през юли 2026 г\.$/,'A customer review of a visit to Delta Planet Mall was published in July 2026.'],
[/^Delta Planet Mall публикува лятна комуникация за юли и активностите в търговския център\.$/,'Delta Planet Mall publishes summer communication for July and activities at the shopping centre.']
];
window.BLIS_EN_TRANSLATIONS=Object.assign(window.BLIS_EN_TRANSLATIONS||{},M);
window.BLIS_EN_RULES=(window.BLIS_EN_RULES||[]).concat(R);
window.dispatchEvent(new CustomEvent('blis:i18n-catalog',{detail:{catalog:'delta-planet-en'}}));
if(window.BLISI18N&&window.BLISI18N.apply)window.BLISI18N.apply(document);
})();
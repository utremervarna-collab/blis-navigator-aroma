/* BLIS Navigator — final Dashboard English tail coverage. */
(function(){'use strict';
const T={
'Търговска верига / модерен ритейл · BLIS наблюдение активно':'Retail chain / modern retail · BLIS monitoring active',
'Радар за нови теми, промени, рискове и възможности в медийната, потребителската, секторната и конкурентната среда.':'Radar for new topics, changes, risks and opportunities across the media, consumer, sector and competitive environments.',
'⇩ Експорт':'⇩ Export',
'Наблюдението е активно':'Monitoring is active',
'Новите публични наблюдения се сравняват с предходни периоди. Пазарен сигнал се извежда само когато има потвърдена промяна, източник и контекст.':'New public observations are compared with previous periods. A market signal is generated only when there is a confirmed change, source and context.',
'Рекламна активност':'Advertising activity',
'Нови сигнали през периода':'New signals during the period',
'Липсата на нов сигнал не означава липса на наблюдение. BLIS продължава да сканира активните източници.':'The absence of a new signal does not mean monitoring has stopped. BLIS continues to scan active sources.',
'Наблюдавани сигнали':'Monitored signals',
'Публикации за Aroma през последните 30 дни.':'Publications about Aroma over the last 30 days.',
'Публично видими публикации в наблюдавания фирмен профил за 90 дни.':'Publicly visible posts in the monitored company profile over 90 days.',
'Какво се следи':'What is monitored',
'Медийни и публични проявления':'Media and public presence',
'Нови публикации, интервюта, новини и други публични споменавания на марката, продуктите, сектора и конкурентите. Следят се честотата, контекстът и промяната между периодите.':'New publications, interviews, news and other public mentions of the brand, products, sector and competitors. Frequency, context and change between periods are monitored.',
'Динамика на интереса':'Interest dynamics',
'Промени в търсенията, откриваемостта и публичния интерес. При натрупана история се маркират устойчиви тенденции и отклонения.':'Changes in searches, discoverability and public interest. Once sufficient history is available, sustained trends and deviations are flagged.',
'Продуктови и комуникационни промени':'Product and communication changes',
'Нови продукти, промоции, кампании, събития, партньорства и видими промени в публичните активи.':'New products, promotions, campaigns, events, partnerships and visible changes in public assets.',
'Потребителски и репутационни сигнали':'Consumer and reputation signals',
'Промяна в оценки, отзиви, оплаквания, повтарящи се теми и други сигнали за възприятието.':'Changes in ratings, reviews, complaints, recurring topics and other perception signals.',
'Рекламна и конкурентна активност':'Advertising and competitive activity',
'Публични реклами, промяна в интензитета на комуникацията и действия на конкурентите с потенциално пазарно значение.':'Public advertising, changes in communication intensity and competitor actions with potential market significance.',
'Секторни и регулаторни промени':'Sector and regulatory changes',
'Браншови данни, регулаторни решения, секторни събития и външни фактори, които могат да създадат риск или възможност.':'Industry data, regulatory decisions, sector events and external factors that may create risk or opportunity.',
'Дигитално покритие':'Digital coverage',
'Виж разбивка':'View breakdown',
'Виж дневната история':'View daily history',
'Виж промяната':'View change',
'Виж източниците':'View sources',
'Българска козметична компания с история от 1924 г. · BLIS наблюдение активно':'Bulgarian cosmetics company with a history dating back to 1924 · BLIS monitoring active',
'Аналитични изходи, базирани на наличните измервания за текущия профил.':'Analytical outputs based on the available measurements for the current profile.',
'＋ Нов доклад':'＋ New report',
'Аналитичен доклад':'Analytical report',
'Все още няма генерирани експорти за текущата сесия.':'No exports have been generated for the current session yet.',
'Професионални решения за чистота и хигиена за бизнес среда. · BLIS наблюдение активно':'Professional cleaning and hygiene solutions for business environments · BLIS monitoring active'
};
window.BLIS_EN_TRANSLATIONS=Object.assign({},window.BLIS_EN_TRANSLATIONS||{},T);
function rescan(){try{window.BLISI18N?.apply(document)}catch(_){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{[100,400,900,1800,3200,5200].forEach(ms=>setTimeout(rescan,ms))},{once:true});else [100,400,900,1800,3200,5200].forEach(ms=>setTimeout(rescan,ms));
window.addEventListener('blis:rendered',rescan);window.addEventListener('blis:routechange',rescan);
})();
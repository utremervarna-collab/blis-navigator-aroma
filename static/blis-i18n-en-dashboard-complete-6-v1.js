/* BLIS Navigator — final market/source + Varna Towers report English tail. */
(function(){'use strict';
window.BLIS_EN_TRANSLATIONS=Object.assign({},window.BLIS_EN_TRANSLATIONS||{},
{
'Няма извлечено валидно измерване':'No valid measurement has been extracted',
'Търговски регистър':'Commercial Register',
'НСИ':'National Statistical Institute',
'Съюз на пивоварите в България':'Union of Brewers in Bulgaria',
'Facebook – Болярка':'Facebook – Bolyarka',
'Instagram – Болярка':'Instagram – Bolyarka',
'Публикации, открити за марката през последните 30 дни.':'Publications identified for the brand over the last 30 days.',
'Нови или променени продуктови сигнали на официалния сайт.':'New or changed product signals on the official website.',
'Публични оценки за „Болярка Светло“':'Public ratings for “Bolyarka Light”',
'Брой видими потребителски оценки в публичната продуктова страница.':'Number of visible consumer ratings on the public product page.',
'Текущата публично видима средна оценка за „Болярка Светло“.':'The current publicly visible average rating for “Bolyarka Light”.',
'Недвижими имоти / Бизнес център / Смесен комплекс · BLIS наблюдение активно':'Real estate / Business center / Mixed-use complex · BLIS monitoring active'
});
function rescan(){try{window.BLISI18N?.apply(document)}catch(_){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{[100,350,800,1500,2600,4200,6500].forEach(ms=>setTimeout(rescan,ms))},{once:true});else [100,350,800,1500,2600,4200,6500].forEach(ms=>setTimeout(rescan,ms));
for(const ev of ['blis:rendered','blis:routechange','blis:clientdata'])window.addEventListener(ev,rescan);
})();

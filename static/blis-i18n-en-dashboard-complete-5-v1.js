/* BLIS Navigator — Varna Towers social + Astor market English tail. */
(function(){'use strict';
const T={
'Как се променят социалното присъствие, активността и публичните реакции към марката':'How the brand’s social presence, activity and public reactions are changing',
'Социален индекс':'Social Index',
'Текуща обща оценка':'Current overall score',
'Социална динамика':'Social dynamics',
'Нужни са две реални измервания':'Two real measurements are required',
'Публична аудитория':'Public audience',
'Няма извлечено валидно публично измерване':'No valid public measurement has been extracted',
'Видими реакции':'Visible reactions',
'Публично измерими споменавания в наблюдаваните канали':'Publicly measurable mentions in the monitored channels',
'СОЦИАЛНА ДИНАМИКА':'SOCIAL DYNAMICS',
'Само реално натрупаната история на социалния индекс':'Only the actual accumulated history of the Social Index',
'НАТРУПВАНЕ НА ИСТОРИЯ':'BUILDING HISTORY',
'Натрупва се измерена история за социалния индекс.':'Measured history is being accumulated for the Social Index.',
'Графика ще се покаже след поне две реални измервания.':'A chart will be shown after at least two real measurements.',
'реални измервания':'real measurements',
'публикации в периода':'posts in the period',
'споменавания':'mentions',
'СОЦИАЛНИ ПРЕДУПРЕЖДЕНИЯ':'SOCIAL WARNINGS',
'Достъпност и отклонения в наблюдаваните канали':'Availability and deviations in monitored channels',
'Ограничен публичен достъп до 2 канала':'Limited public access to 2 channels',
'Каналът остава наблюдаван, но не се представя като активен, докато няма достъпен профил или съдържание.':'The channel remains monitored but is not shown as active until an accessible profile or content is available.',
'КАНАЛИ И ПРИНОС':'CHANNELS AND CONTRIBUTION',
'Една карта за всеки реално наблюдаван социален профил':'One card for each actively monitored social profile',
'1 активни · 3 наблюдавани':'1 active · 3 monitored',
'АКТИВЕН':'ACTIVE',
'Достъпност':'Availability',
'Публикации (период)':'Posts (period)',
'последна проверка: 18.08.2026 г.':'last checked: 18.08.2026',
'ОГРАНИЧЕН ДОСТЪП':'LIMITED ACCESS',
'последна проверка: 1.01.1970 г.':'last checked: 1.01.1970',
'ПОСЛЕДНИ ПУБЛИКАЦИИ ПО КАНАЛИ':'LATEST POSTS BY CHANNEL',
'До три последно достъпни публични публикации от всеки наблюдаван профил':'Up to three latest publicly available posts from each monitored profile',
'ПУБЛИЧНИ ИЗТОЧНИЦИ':'PUBLIC SOURCES',
'няма измерен брой':'no measured count',
'При последната проверка не е открит публично достъпен текст на публикация.':'No publicly accessible post text was found during the latest check.',
'Отвори профила ↗':'Open profile ↗',
'Метод:':'Method:',
'аудиторията и реакциите използват последните валидни положителни публични измервания; блокиран или непълен цикъл не занулява предишно валидно наблюдение. Публикация се визуализира само при чист текст и валиден публичен източник.':'audience and reactions use the latest valid positive public measurements; a blocked or incomplete cycle does not reset a previously valid observation. A post is displayed only when clean text and a valid public source are available.',
'Публикации за хотела през последните 30 дни.':'Publications about the hotel over the last 30 days.'
};
window.BLIS_EN_TRANSLATIONS=Object.assign({},window.BLIS_EN_TRANSLATIONS||{},T);
const R=[
[/^Ограничен публичен достъп до (\d+) канала?$/,'Limited public access to $1 channels'],
[/^(\d+) активни · (\d+) наблюдавани$/,'$1 active · $2 monitored'],
[/^последна проверка: (\d{1,2}\.\d{1,2}\.\d{4}) г\.$/,'last checked: $1']
];
window.BLIS_EN_RULES=(window.BLIS_EN_RULES||[]).concat(R);
function rescan(){try{window.BLISI18N?.apply(document)}catch(_){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{[100,350,800,1500,2600,4200,6500].forEach(ms=>setTimeout(rescan,ms))},{once:true});else [100,350,800,1500,2600,4200,6500].forEach(ms=>setTimeout(rescan,ms));
for(const ev of ['blis:rendered','blis:routechange','blis:clientdata'])window.addEventListener(ev,rescan);
})();

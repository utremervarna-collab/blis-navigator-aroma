/* BLIS Navigator — live History English tail and variable metric rules. */
(function(){'use strict';
const T={
'Ранни предупреждения':'Early warnings',
'Няма активирано ранно предупреждение.':'No early warning has been triggered.',
'Наративи и ускорение':'Narratives and acceleration',
'Конкуренция':'Competition',
'Капитал':'Capital',
'Търговско-промишлена палата – Стара Загора':'Chamber of Commerce and Industry – Stara Zagora',
'Бранд присъствие':'Brand presence',
'Продукт':'Product',
'ТопПреса':'Top Presa',
'ШУМ.БГ':'SHUM.BG',
'Труд':'Trud',
'Вестник Борба':'Borba Newspaper',
'Влияние на източниците':'Source influence',
'Под Тепето':'Pod Tepeto',
'Качество на доказателствата: 100/100':'Evidence quality: 100/100',
'Metric Intelligence · измерени промени по клиента':'Metric Intelligence · measured changes for the client',
'Смесена динамика по измерените показатели':'Mixed dynamics across measured indicators',
'Значими промени':'Significant changes',
'Подобрения':'Improvements',
'Влошавания':'Deteriorations',
'Исторически snapshots':'Historical snapshots',
'Болярка ВТ АД':'Bolyarka VT AD',
'Пивоварна компания':'Brewery company',
'Стабилна позиция':'Stable position',
'Client profile · MOLLOX България':'Client profile · MOLLOX Bulgaria',
'Стабилни измерени показатели':'Stable measured indicators',
'Няма значима измерена промяна между последните две наблюдения.':'There is no significant measured change between the last two observations.'
};
window.BLIS_EN_TRANSLATIONS=Object.assign({},window.BLIS_EN_TRANSLATIONS||{},T);
const R=[
[/^(\d+) сигнала · velocity ([+\-]?\d+)%$/,'$1 signals · velocity $2%'],
[/^24 ч\. (\d+) · предходни (\d+) · (\d+) източника · avg risk ([\d.,]+) · confidence ([\d.,]+)$/,'24h $1 · previous $2 · $3 sources · avg risk $4 · confidence $5'],
[/^Концентрация в топ източника ([\d.,]+)% · времева покриваемост ([\d.,]+)%\.$/,'Top-source concentration $1% · temporal coverage $2%.'],
[/^([^:]+): измереният индекс\/score се подобрява \((.+)\)\.$/,'$1: measured index/score improves ($2).'],
[/^([^:]+): измереният индекс\/score се влошава \((.+)\)\.$/,'$1: measured index/score deteriorates ($2).'],
[/^([^:]+): обемът на споменаванията се подобрява \((.+)\)\.$/,'$1: mention volume improves ($2).'],
[/^([^:]+): обемът на споменаванията се влошава \((.+)\)\.$/,'$1: mention volume deteriorates ($2).'],
[/^([^:]+): ([A-Za-z0-9_]+) се подобрява \((.+)\)\.$/,'$1: $2 improves ($3).'],
[/^([^:]+): ([A-Za-z0-9_]+) се влошава \((.+)\)\.$/,'$1: $2 deteriorates ($3).']
];
window.BLIS_EN_RULES=(window.BLIS_EN_RULES||[]).concat(R);
})();

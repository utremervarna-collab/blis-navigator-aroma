/* BLIS Navigator — dynamic English presentation rules. */
(function(){'use strict';
const R=[
[/^(\d{2}\.\d{2}\.\d{4}) г\.,\s*(\d{2}:\d{2}:\d{2}) ч\.$/,'$1, $2'],
[/^(\d{2}\.\d{2}\.\d{4}) г\. · Наблюдение$/,'$1 · Watch'],
[/^(\d{2}\.\d{2}\.\d{4}) г\. · Конкуренти$/,'$1 · Competitors'],
[/^(\d{2}\.\d{2}\.\d{4}) г\. · Репутация$/,'$1 · Reputation'],
[/^(\d{2}\.\d{2}\.\d{4}) г\. · Видимост$/,'$1 · Visibility'],
[/^(\d{2}\.\d{2}\.\d{4}) г\.$/,'$1'],
[/^Добър вечер,\s*Болярка!$/,'Good evening, Bolyarka!'],
[/^Добър ден,\s*Болярка!$/,'Good afternoon, Bolyarka!'],
[/^Добро утро,\s*Болярка!$/,'Good morning, Bolyarka!'],
[/^Добър вечер,\s*(.+)!$/,'Good evening, $1!'],
[/^Добър ден,\s*(.+)!$/,'Good afternoon, $1!'],
[/^Добро утро,\s*(.+)!$/,'Good morning, $1!'],
[/^(.+) има много висока обща дигитална видимост \(([\d.,]+)\/100\)\. Радарът показва къде марката се открива най-ясно и къде има дефицит на измерими сигнали\.$/,'$1 has very high overall digital visibility ($2/100). The radar shows where the brand is most clearly discoverable and where measurable signals are lacking.'],
[/^(.+) има висока обща дигитална видимост \(([\d.,]+)\/100\)\. Радарът показва къде марката се открива най-ясно и къде има дефицит на измерими сигнали\.$/,'$1 has high overall digital visibility ($2/100). The radar shows where the brand is most clearly discoverable and where measurable signals are lacking.'],
[/^(.+) има умерена обща дигитална видимост \(([\d.,]+)\/100\)\. Радарът показва къде марката се открива най-ясно и къде има дефицит на измерими сигнали\.$/,'$1 has moderate overall digital visibility ($2/100). The radar shows where the brand is most clearly discoverable and where measurable signals are lacking.'],
[/^(.+) има ограничена обща дигитална видимост \(([\d.,]+)\/100\)\. Радарът показва къде марката се открива най-ясно и къде има дефицит на измерими сигнали\.$/,'$1 has limited overall digital visibility ($2/100). The radar shows where the brand is most clearly discoverable and where measurable signals are lacking.'],
[/^(.+) има ниска обща дигитална видимост \(([\d.,]+)\/100\)\. Радарът показва къде марката се открива най-ясно и къде има дефицит на измерими сигнали\.$/,'$1 has low overall digital visibility ($2/100). The radar shows where the brand is most clearly discoverable and where measurable signals are lacking.'],
[/^от\s*([\d.,]+)\s*€$/,'from €$1'],
[/^([+\-]?\d+(?:[.,]\d+)?)\s*т\.$/,'$1 pts'],
[/^→\s*([+\-]?\d+(?:[.,]\d+)?)\s*т\.\s*спрямо предходния ден$/,'→ $1 pts versus the previous day'],
[/^↑\s*([+\-]?\d+(?:[.,]\d+)?)\s*т\.\s*спрямо предходния ден$/,'↑ $1 pts versus the previous day'],
[/^(\d+)\s*дни$/,'$1 days'],
[/^(\d+)\s*минути$/,'$1 minutes'],
[/^(\d+)\s*мин\.$/,'$1 min.'],
[/^(\d+)\s*показани$/,'$1 shown'],
[/^(\d+)\s*активни източници$/,'$1 active sources'],
[/^последен сигнал\s+(.+)$/,'last signal $1']
];
window.BLIS_EN_RULES=(window.BLIS_EN_RULES||[]).concat(R);
})();

package main

import "strings"

func init() {
	const clientVisualCSS = `<style id="blis-home-client-visuals">
#clients .clientGrid{align-items:stretch}
#clients .clientCard{min-height:350px;padding:0!important;display:flex;flex-direction:column;justify-content:flex-end;background:#142840!important;border:1px solid rgba(19,47,77,.08);box-shadow:0 14px 34px rgba(20,40,64,.10);transition:transform .22s ease,box-shadow .22s ease}
#clients .clientCard:hover{transform:translateY(-4px);box-shadow:0 20px 42px rgba(20,40,64,.15)}
#clients .clientCard:before{z-index:1!important;background:linear-gradient(180deg,rgba(10,24,43,.02) 20%,rgba(10,24,43,.18) 47%,rgba(10,24,43,.94) 100%)!important}
#clients .clientCardImage{position:absolute!important;inset:0;width:100%;height:100%;object-fit:cover;z-index:0!important;transition:transform .45s ease;filter:saturate(.96) contrast(1.02)}
#clients .clientCard:hover .clientCardImage{transform:scale(1.025)}
#clients .clientCardContent{position:relative!important;z-index:2!important;padding:25px 27px 27px;text-shadow:0 1px 2px rgba(0,0,0,.2)}
#clients .clientCard h3{font-size:28px;margin:0 0 5px;color:#fff}
#clients .clientCard .sector{font-size:11px;margin-bottom:11px;color:rgba(255,255,255,.84)}
#clients .clientCard p{font-size:10.5px;line-height:1.58;color:rgba(255,255,255,.91);max-width:95%}
#clients .c1 .clientCardImage{object-position:54% center}
#clients .c2 .clientCardImage{object-position:38% center}
#clients .c3 .clientCardImage{object-position:center center}
@media(max-width:1100px){#clients .clientCard{min-height:330px}}
@media(max-width:720px){#clients .clientCard{min-height:310px}#clients .clientCardContent{padding:22px}#clients .clientCard h3{font-size:25px}}
</style>`
	indexHTML = strings.Replace(indexHTML, "</head>", clientVisualCSS+"</head>", 1)

	indexHTML = strings.Replace(indexHTML,
		`<article class="clientCard c1"><h3>Bolyarka</h3><div class="sector">Потребителски бранд и дистрибуция</div><p>Наблюдение на публично присъствие, потребителски теми, репутационни сигнали, конкурентна активност, съдържание и промени в категорията.</p></article>`,
		`<article class="clientCard c1"><img class="clientCardImage" src="/home-bolyarka.svg?v=20260817-fixed2" alt="BLIS визуализация за Болярка"><div class="clientCardContent"><h3>Bolyarka</h3><div class="sector">Потребителски бранд и дистрибуция</div><p>Наблюдение на публично присъствие, потребителски теми, репутационни сигнали, конкурентна активност, съдържание и промени в категорията.</p></div></article>`, 1)

	indexHTML = strings.Replace(indexHTML,
		`<article class="clientCard c2"><h3>Aroma</h3><div class="sector">Козметика и потребителски продукти</div><p>Анализ на продуктова и дигитална среда, публична видимост, съдържание, репутационни сигнали и конкурентни движения.</p></article>`,
		`<article class="clientCard c2"><img class="clientCardImage" src="/home-aroma.svg?v=20260817-fixed2" alt="BLIS визуализация за Aroma"><div class="clientCardContent"><h3>Aroma</h3><div class="sector">Козметика и потребителски продукти</div><p>Анализ на продуктова и дигитална среда, публична видимост, съдържание, репутационни сигнали и конкурентни движения.</p></div></article>`, 1)

	indexHTML = strings.Replace(indexHTML,
		`<article class="clientCard c3"><h3>Astor Garden</h3><div class="sector">Хотелиерство и туризъм</div><p>Проследяване на онлайн репутация, оценки, потребителско преживяване, международни платформи, сезонност и конкурентен контекст.</p></article>`,
		`<article class="clientCard c3"><img class="clientCardImage" src="/home-astor.svg?v=20260817-fixed2" alt="BLIS визуализация за Astor Garden"><div class="clientCardContent"><h3>Astor Garden</h3><div class="sector">Хотелиерство и туризъм</div><p>Проследяване на онлайн репутация, оценки, потребителско преживяване, международни платформи, сезонност и конкурентен контекст.</p></div></article>`, 1)
}

package main

import "strings"

func embeddedBase64Data(path, mime string) string {
	b, err := staticFS.ReadFile(path)
	if err != nil {
		return ""
	}
	data := strings.Join(strings.Fields(string(b)), "")
	if data == "" {
		return ""
	}
	return "data:" + mime + ";base64," + data
}

func replaceHomeClientGrid(html string, replacement string) string {
	startMarker := `<div class="clientGrid">`
	endMarker := `<div class="clientNote">`
	start := strings.Index(html, startMarker)
	if start < 0 {
		return html
	}
	endRel := strings.Index(html[start:], endMarker)
	if endRel < 0 {
		return html
	}
	end := start + endRel
	return html[:start] + replacement + html[end:]
}

func init() {
	const clientVisualCSS = `<style id="blis-home-client-visuals">
#clients .clientGrid{align-items:stretch}
#clients .clientCard{min-height:350px;padding:0!important;display:flex;flex-direction:column;justify-content:flex-end;background:#142840!important;border:1px solid rgba(19,47,77,.08);box-shadow:0 14px 34px rgba(20,40,64,.10);transition:transform .22s ease,box-shadow .22s ease;overflow:hidden;text-decoration:none;position:relative}
#clients .clientCard:hover{transform:translateY(-4px);box-shadow:0 20px 42px rgba(20,40,64,.15)}
#clients .clientCard:before{content:"";position:absolute;inset:0;z-index:1!important;background:linear-gradient(180deg,rgba(8,23,42,.00) 12%,rgba(8,23,42,.08) 45%,rgba(8,23,42,.92) 100%)!important}
#clients .clientCardImage{position:absolute!important;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;z-index:0!important;display:block;transition:transform .45s ease;filter:saturate(.96) contrast(1.02)}
#clients .clientCard:hover .clientCardImage{transform:scale(1.018)}
#clients .clientCardContent{position:relative!important;z-index:2!important;padding:24px 27px 27px;text-shadow:0 1px 2px rgba(0,0,0,.22)}
#clients .clientCard h3{font-size:28px;margin:0 0 5px;color:#fff}
#clients .clientCard .sector{font-size:11px;margin-bottom:10px;color:rgba(255,255,255,.84)}
#clients .clientCard p{font-size:10.5px;line-height:1.55;color:rgba(255,255,255,.92);max-width:96%}
#clients .c1 .clientCardImage,#clients .c2 .clientCardImage,#clients .c4 .clientCardImage{object-position:center center}
#clients .c3{background:radial-gradient(circle at 82% 14%,rgba(196,133,34,.38),transparent 34%),linear-gradient(140deg,#152c48,#0f2035 72%)!important}
#clients .c3:after{content:"CRISIS WATCH";position:absolute;top:25px;left:26px;z-index:2;padding:6px 9px;border:1px solid rgba(255,255,255,.22);border-radius:999px;color:#f1cf88;font-size:9px;font-weight:850;letter-spacing:.9px}
#clients .c3:before{background:linear-gradient(180deg,rgba(8,23,42,.02) 8%,rgba(8,23,42,.18) 45%,rgba(8,23,42,.95) 100%)!important}
#clients .c4:before{background:linear-gradient(180deg,rgba(68,5,24,.02) 8%,rgba(68,5,24,.12) 45%,rgba(68,5,24,.94) 100%)!important}
@media(max-width:1100px){#clients .clientCard{min-height:330px}}
@media(max-width:720px){#clients .clientCard{min-height:305px}#clients .clientCardContent{padding:21px}#clients .clientCard h3{font-size:25px}}
</style>`
	indexHTML = strings.Replace(indexHTML, "</head>", clientVisualCSS+"</head>", 1)

	aroma := embeddedBase64Data("static/hero-aroma-micro.txt", "image/webp")
	bolyarka := embeddedBase64Data("static/home-bolyarka.b64", "image/webp")
	mollox := "https://mollox.bg/assets/img/home/mollox_start_2.jpg.png"

	grid := `<!-- home-client-profile-hero-images-v9 --><div class="clientGrid">` +
		`<article class="clientCard c1"><img class="clientCardImage" src="` + bolyarka + `" alt="Профилна визия Болярка"><div class="clientCardContent"><h3>Болярка</h3><div class="sector">Потребителски бранд и дистрибуция</div><p>Наблюдение на публично присъствие, потребителски теми, репутационни сигнали, конкурентна активност, съдържание и промени в категорията.</p></div></article>` +
		`<article class="clientCard c2"><img class="clientCardImage" src="` + aroma + `" alt="Профилна визия Aroma"><div class="clientCardContent"><h3>Aroma</h3><div class="sector">Козметика и потребителски продукти</div><p>Анализ на продуктова и дигитална среда, публична видимост, съдържание, репутационни сигнали и конкурентни движения.</p></div></article>` +
		`<a class="clientCard c3" href="/kub-crisis.html"><div class="clientCardContent"><h3>Корпорация КУБ</h3><div class="sector">Кризисен мониторинг · „Баба Алино“</div><p>Приоритетно наблюдение на медии, институции, съдебни развития, услуги, купувачи, наративи и репутационна ескалация. Профилът използва отделни кризисни критерии.</p></div></a>` +
		`<article class="clientCard c4"><img class="clientCardImage" src="` + mollox + `" alt="Профилна визия MOLLOX"><div class="clientCardContent"><h3>MOLLOX</h3><div class="sector">Професионална хигиена и B2B решения</div><p>Наблюдение на продуктово и секторно присъствие, дигитална видимост, репутационни сигнали, дистрибуция и конкурентна среда в България.</p></div></article>` +
		`</div>`

	indexHTML = replaceHomeClientGrid(indexHTML, grid)
}

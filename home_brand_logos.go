package main

import "strings"

func init() {
	const logoCSS = `<style id="blis-home-brandmarks">
.trust{padding:18px 0!important}
.trustRow{grid-template-columns:230px repeat(5,1fr)!important;gap:18px!important;align-items:center!important}
.trustBrand{min-height:54px;display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;color:#142840;opacity:.92;transition:transform .2s ease,opacity .2s ease}
.trustBrand:hover{transform:translateY(-2px);opacity:1}
.trustBrand img{width:36px;height:36px;object-fit:contain;display:block;filter:saturate(.82) contrast(1.04)}
.trustBrand .wordmark{display:block;font-family:Georgia,serif;font-size:18px;font-weight:600;letter-spacing:.025em;line-height:1.05;white-space:nowrap;color:#223b59}
.trustBrand .wordmark small{display:block;margin-top:3px;font:700 7px/1.1 Inter,Segoe UI,Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#c58a24}
.trustBrand.bolyarka .wordmark{font-size:18px;text-transform:uppercase}
.trustBrand.aroma .wordmark{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:19px;letter-spacing:.12em}
.trustBrand.astor .wordmark{font-size:18px}
.trustBrand.transins .wordmark{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:17px;font-weight:800;letter-spacing:.03em;text-transform:uppercase}
.trustBrand.delta .wordmark{font-size:16px;text-align:left}
@media(max-width:1100px){.trustRow{grid-template-columns:1fr repeat(5,1fr)!important}.trustBrand{gap:6px}.trustBrand img{width:28px;height:28px}.trustBrand .wordmark{font-size:14px!important}.trustBrand .wordmark small{display:none}}
@media(max-width:760px){.trustRow{grid-template-columns:1fr 1fr!important;gap:10px 14px!important}.trustLabel{grid-column:1/-1}.trustBrand{justify-content:flex-start;min-height:42px}.trustBrand img{width:30px;height:30px}.trustBrand.delta{grid-column:1/-1}}
</style>`

	const oldTrust = `<section class="trust"><div class="container trustRow"><div class="trustLabel">Приложение в различни бизнес среди</div><div class="brandLogo">BOLYARKA</div><div class="brandLogo">AROMA</div><div class="brandLogo">ASTOR</div><div class="brandLogo">VIERE</div><div class="brandLogo">TRANSINS</div></div></section>`
	const newTrust = `<section class="trust"><div class="container trustRow"><div class="trustLabel">Приложение в различни бизнес среди</div>` +
		`<a class="trustBrand bolyarka" href="#clients" aria-label="Болярка"><img src="https://www.google.com/s2/favicons?sz=128&domain_url=https://boliarka.bg" alt=""><span class="wordmark">БОЛЯРКА</span></a>` +
		`<a class="trustBrand aroma" href="#clients" aria-label="AROMA"><img src="https://www.google.com/s2/favicons?sz=128&domain_url=https://aroma.bg" alt=""><span class="wordmark">AROMA<small>cosmetics</small></span></a>` +
		`<a class="trustBrand astor" href="#clients" aria-label="Astor Garden"><img src="https://www.google.com/s2/favicons?sz=128&domain_url=https://astorgardenhotel.com" alt=""><span class="wordmark">Astor Garden<small>Hotel</small></span></a>` +
		`<a class="trustBrand delta" href="#clients" aria-label="Delta Planet Mall"><img src="https://www.google.com/s2/favicons?sz=128&domain_url=https://deltaplanet.bg" alt=""><span class="wordmark">Delta Planet Mall<small>Varna</small></span></a>` +
		`<a class="trustBrand transins" href="#clients" aria-label="Трансинс"><img src="https://www.google.com/s2/favicons?sz=128&domain_url=https://transins.bg" alt=""><span class="wordmark">Трансинс</span></a>` +
		`</div></section>`

	indexHTML = strings.Replace(indexHTML, "</head>", logoCSS+"</head>", 1)
	indexHTML = strings.Replace(indexHTML, oldTrust, newTrust, 1)
}

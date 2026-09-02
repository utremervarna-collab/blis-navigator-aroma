package main

import (
	"bytes"
	"net/http"
	"strings"
)

var blisI18NScripts = []byte(`<script src="/kub-crisis-ru-v1.js?v=20260902-ru1"></script><script src="/blis-i18n-en-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-base"></script><script src="/blis-i18n-en-mutable-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-mutable"></script><script src="/blis-i18n-en-public-core-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-public"></script><script src="/blis-i18n-en-legal-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-legal"></script><script src="/blis-i18n-en-public-extra-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-public-extra"></script><script src="/blis-i18n-en-dashboard-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-dashboard"></script><script src="/blis-i18n-en-residual-dashboard-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-dashboard"></script><script src="/blis-i18n-en-residual-public-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-public"></script><script src="/blis-i18n-en-residual-ai-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai1"></script><script src="/blis-i18n-en-residual-ai-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai2"></script><script src="/blis-i18n-en-residual-ai-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai3"></script><script src="/blis-i18n-en-residual-ai-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai4"></script><script src="/blis-i18n-en-residual-reputation-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation1"></script><script src="/blis-i18n-en-residual-reputation-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation2"></script><script src="/blis-i18n-en-residual-reputation-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation3"></script><script src="/blis-i18n-en-residual-reputation-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation4"></script><script src="/blis-i18n-en-residual-retail-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail1"></script><script src="/blis-i18n-en-residual-retail-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail2"></script><script src="/blis-i18n-en-residual-retail-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail3"></script><script src="/blis-i18n-en-residual-retail-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail4"></script><script src="/blis-i18n-en-residual-retail-5-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail5"></script><script src="/blis-i18n-en-residual-calendar-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar1"></script><script src="/blis-i18n-en-residual-calendar-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar2"></script><script src="/blis-i18n-en-residual-calendar-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar3"></script><script src="/blis-i18n-en-residual-calendar-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar4"></script><script src="/blis-i18n-en-dynamic-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-dynamic"></script><script src="/blis-i18n-en-dashboard-complete-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-dashboard-complete"></script><script src="/blis-i18n-en-final-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-final"></script><script src="/blis-i18n-v1.js?v=20260830-en9" data-blis-i18n-runtime="1"></script>`)

var kubReadableTypeCSS = []byte(`<style id="kub-readable-type">
/* KUB readability pass: larger working text without changing the grid geometry. */
.client .kicker{font-size:10.5px}.client strong{font-size:20px}.client span{font-size:11.5px;line-height:1.5}
.nav button{font-size:13.5px}.sidefoot{font-size:10.5px;line-height:1.6}
.title h1{font-size:31px}.title p{font-size:13.5px;line-height:1.5}.btn{font-size:12px}
.livebar b{font-size:12px}.livebar span{font-size:11px}
.metric .label{font-size:10px}.metric .value{font-size:32px;line-height:1.05;overflow-wrap:anywhere}.metric .sub{font-size:12px;line-height:1.55}
.sectionTitle{font-size:18px}.alert b{font-size:12.5px}.alert p{font-size:11.5px;line-height:1.55}.sev{font-size:9px}
.legend{font-size:10px}.table th,.table td{font-size:11.5px;line-height:1.5}.table th{font-size:10px}
.search{font-size:12px}.filter{font-size:10.5px}.item time{font-size:10px}.item h3{font-size:13.5px;line-height:1.35}.item p{font-size:11.5px;line-height:1.6}.item .meta span{font-size:9.5px}.item a{font-size:10px}
.narrative h3{font-size:13.5px}.narrative p{font-size:11.5px;line-height:1.58}.markerCloud span{font-size:11px}
.risk{font-size:11.5px;line-height:1.45}.scenario h3{font-size:12.5px}.scenario p{font-size:11px;line-height:1.55}
.stake h3{font-size:14.5px}.stake .question{font-size:11.5px;line-height:1.55}.stake .proof{font-size:10.5px;line-height:1.5}
.matrix b{font-size:11.5px}.matrix p{font-size:10.5px;line-height:1.5}.t time{font-size:10px}.t h3{font-size:13.5px}.t p{font-size:11.5px;line-height:1.6}
.reportCard h3{font-size:14.5px}.reportCard p{font-size:11.5px;line-height:1.6}.source{font-size:11px;line-height:1.45}
.configBlock h3{font-size:12.5px}.configBlock p,.configBlock li{font-size:11.5px;line-height:1.6}.callout{font-size:11.5px;line-height:1.6}
.modalbox p,.modalbox li{font-size:12px}.note{font-size:10px;line-height:1.6}.footnote{font-size:10px;line-height:1.6}
.radarHeader p{font-size:11.5px}.radarBadge{font-size:10px}.radarLabel{font-size:9.5px}.ping:after{font-size:9.5px}.radarStat b{font-size:11.5px}.radarStat p{font-size:10.5px;line-height:1.5}.radarLegend span{font-size:9.5px}.radarFoot{font-size:9.5px;line-height:1.55}.radarTitle{font-size:19px}
@media(max-width:680px){.title h1{font-size:27px}.title p{font-size:12.5px}.sectionTitle{font-size:17px}.metric .value{font-size:29px}.radarTitle{font-size:17px}.nav button{font-size:13px}}
</style>`)

func injectKUBReadableType(body []byte) []byte {
	if len(body) == 0 || bytes.Contains(body, []byte(`id="kub-readable-type"`)) {
		return body
	}
	if !bytes.Contains(body, []byte("Корпорация КУБ")) || !bytes.Contains(body, []byte("Баба Алино")) {
		return body
	}
	if i := bytes.Index(bytes.ToLower(body), []byte("</head>")); i >= 0 {
		out := make([]byte, 0, len(body)+len(kubReadableTypeCSS))
		out = append(out, body[:i]...)
		out = append(out, kubReadableTypeCSS...)
		out = append(out, body[i:]...)
		return out
	}
	return body
}

// injectBLISI18N adds the single presentation-language layer to HTML served by
// the existing Navigator. It does not own routing or analytical rendering.
func injectBLISI18N(body []byte) []byte {
	body = injectKUBReadableType(body)
	if len(body) == 0 || bytes.Contains(body, []byte(`data-blis-i18n-runtime="1"`)) {
		return body
	}
	if i := bytes.Index(bytes.ToLower(body), []byte("</head>")); i >= 0 {
		out := make([]byte, 0, len(body)+len(blisI18NScripts))
		out = append(out, body[:i]...)
		out = append(out, blisI18NScripts...)
		out = append(out, body[i:]...)
		return out
	}
	if i := bytes.Index(bytes.ToLower(body), []byte("</body>")); i >= 0 {
		out := make([]byte, 0, len(body)+len(blisI18NScripts))
		out = append(out, body[:i]...)
		out = append(out, blisI18NScripts...)
		out = append(out, body[i:]...)
		return out
	}
	return append(body, blisI18NScripts...)
}

func blisEnglishRequest(r *http.Request) bool {
	if r == nil {
		return false
	}
	return strings.EqualFold(strings.TrimSpace(r.URL.Query().Get("lang")), "en")
}

func blisLocalized(r *http.Request, bg, en string) string {
	if blisEnglishRequest(r) {
		return en
	}
	return bg
}

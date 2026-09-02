package main

import (
	"bytes"
	"net/http"
	"strings"
)

var blisI18NScripts = []byte(`<script src="/kub-crisis-ru-v1.js?v=20260902-ru1"></script><script src="/blis-i18n-en-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-base"></script><script src="/blis-i18n-en-mutable-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-mutable"></script><script src="/blis-i18n-en-public-core-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-public"></script><script src="/blis-i18n-en-legal-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-legal"></script><script src="/blis-i18n-en-public-extra-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-public-extra"></script><script src="/blis-i18n-en-dashboard-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-dashboard"></script><script src="/blis-i18n-en-residual-dashboard-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-dashboard"></script><script src="/blis-i18n-en-residual-public-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-public"></script><script src="/blis-i18n-en-residual-ai-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai1"></script><script src="/blis-i18n-en-residual-ai-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai2"></script><script src="/blis-i18n-en-residual-ai-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai3"></script><script src="/blis-i18n-en-residual-ai-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-ai4"></script><script src="/blis-i18n-en-residual-reputation-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation1"></script><script src="/blis-i18n-en-residual-reputation-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation2"></script><script src="/blis-i18n-en-residual-reputation-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation3"></script><script src="/blis-i18n-en-residual-reputation-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-reputation4"></script><script src="/blis-i18n-en-residual-retail-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail1"></script><script src="/blis-i18n-en-residual-retail-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail2"></script><script src="/blis-i18n-en-residual-retail-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail3"></script><script src="/blis-i18n-en-residual-retail-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail4"></script><script src="/blis-i18n-en-residual-retail-5-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-retail5"></script><script src="/blis-i18n-en-residual-calendar-1-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar1"></script><script src="/blis-i18n-en-residual-calendar-2-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar2"></script><script src="/blis-i18n-en-residual-calendar-3-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar3"></script><script src="/blis-i18n-en-residual-calendar-4-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-residual-calendar4"></script><script src="/blis-i18n-en-dynamic-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-dynamic"></script><script src="/blis-i18n-en-dashboard-complete-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-dashboard-complete"></script><script src="/blis-i18n-en-final-v1.js?v=20260830-en9" data-blis-i18n-catalog="en-final"></script><script src="/blis-i18n-v1.js?v=20260830-en9" data-blis-i18n-runtime="1"></script>`)

var kubReadableTypeCSS = []byte(`<style id="kub-readable-type">
/* KUB readability model: 12px is the absolute minimum for UI/supporting text.
   Body copy targets 13–14px, navigation 14–15px and headings scale with clamp().
   No zoom or geometry transforms are used, so cards may grow vertically instead of breaking. */
:root{--kub-min:12px;--kub-small:clamp(12px,.78vw,13px);--kub-body:clamp(13px,.86vw,14px);--kub-nav:clamp(14px,.92vw,15px);--kub-subtitle:clamp(14px,1vw,16px);--kub-section:clamp(20px,1.35vw,22px);--kub-h1:clamp(32px,2.25vw,37px)}
.client .kicker{font-size:var(--kub-min)}.client strong{font-size:22px}.client span{font-size:var(--kub-body);line-height:1.55}
.nav button{font-size:var(--kub-nav);line-height:1.35}.sidefoot{font-size:var(--kub-small);line-height:1.65}
.title h1{font-size:var(--kub-h1);line-height:1.1}.title p{font-size:var(--kub-subtitle);line-height:1.55}.btn{font-size:var(--kub-body)}
.livebar b{font-size:var(--kub-body)}.livebar span{font-size:var(--kub-small);line-height:1.45}
.metric .label{font-size:var(--kub-min)}.metric .value{font-size:clamp(34px,2.5vw,40px);line-height:1.05;overflow-wrap:anywhere}.metric .sub{font-size:var(--kub-body);line-height:1.6}
.sectionTitle{font-size:var(--kub-section);line-height:1.25}.alert b{font-size:var(--kub-body)}.alert p{font-size:var(--kub-body);line-height:1.6}.sev{font-size:var(--kub-min)}
.legend{font-size:var(--kub-small);line-height:1.5}.table th,.table td{font-size:var(--kub-body);line-height:1.55}.table th{font-size:var(--kub-min)}
.search{font-size:var(--kub-body)}.filter{font-size:var(--kub-small)}.item time{font-size:var(--kub-small);line-height:1.5}.item h3{font-size:clamp(15px,1vw,17px);line-height:1.4}.item p{font-size:var(--kub-body);line-height:1.65}.item .meta span{font-size:var(--kub-min)}.item a{font-size:var(--kub-small)}
.narrative h3{font-size:clamp(15px,1vw,17px)}.narrative p{font-size:var(--kub-body);line-height:1.65}.markerCloud span{font-size:var(--kub-body)}
.risk{font-size:var(--kub-body);line-height:1.55}.scenario h3{font-size:var(--kub-subtitle)}.scenario p{font-size:var(--kub-body);line-height:1.6}
.stake h3{font-size:clamp(16px,1.05vw,18px)}.stake .question{font-size:var(--kub-body);line-height:1.6}.stake .proof{font-size:var(--kub-small);line-height:1.55}
.matrix b{font-size:var(--kub-body)}.matrix p{font-size:var(--kub-small);line-height:1.55}.t time{font-size:var(--kub-small)}.t h3{font-size:clamp(15px,1vw,17px)}.t p{font-size:var(--kub-body);line-height:1.65}
.reportCard h3{font-size:clamp(16px,1.05vw,18px)}.reportCard p{font-size:var(--kub-body);line-height:1.65}.source{font-size:var(--kub-body);line-height:1.55}
.configBlock h3{font-size:var(--kub-subtitle)}.configBlock p,.configBlock li{font-size:var(--kub-body);line-height:1.65}.callout{font-size:var(--kub-body);line-height:1.65}
.modalbox p,.modalbox li{font-size:var(--kub-body);line-height:1.65}.note{font-size:var(--kub-small);line-height:1.65}.footnote{font-size:var(--kub-small);line-height:1.65}
.radarHead .eyebrow{font-size:var(--kub-min)}.radarHead h2,.radarTitle{font-size:clamp(21px,1.5vw,25px);line-height:1.25}.radarHead p,.radarHeader p{font-size:var(--kub-body);line-height:1.6}.radarState,.radarBadge{font-size:var(--kub-min)}.radarLabel{font-size:11.5px}.ping:after{font-size:var(--kub-min)}.radarStat b{font-size:clamp(20px,1.4vw,23px)}.radarStat span,.radarStat p{font-size:var(--kub-small);line-height:1.55}.radarLegend,.radarLegend span{font-size:var(--kub-min)}.radarNote,.radarFoot{font-size:var(--kub-min);line-height:1.6}
/* Fallback floor for miscellaneous supporting text. Component rules above remain authoritative. */
.page small,.page .note,.page .footnote,.page .sev,.page .meta span{font-size:var(--kub-min)!important}
@media(max-width:680px){:root{--kub-small:12px;--kub-body:13px;--kub-nav:14px;--kub-subtitle:14px;--kub-section:20px;--kub-h1:32px}.metric .value{font-size:34px}.radarHead h2,.radarTitle{font-size:21px}}
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

package main

import (
	"bytes"
	"net/http"
	"strings"
)

var blisI18NScripts = []byte(`<script src="/blis-i18n-en-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-base"></script><script src="/blis-i18n-en-public-core-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-public"></script><script src="/blis-i18n-en-legal-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-legal"></script><script src="/blis-i18n-en-public-extra-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-public-extra"></script><script src="/blis-i18n-en-dashboard-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-dashboard"></script><script src="/blis-i18n-en-articles-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-articles"></script><script src="/blis-i18n-en-residual-dashboard-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-dashboard"></script><script src="/blis-i18n-en-residual-public-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-public"></script><script src="/blis-i18n-en-residual-ai-1-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-ai1"></script><script src="/blis-i18n-en-residual-ai-2-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-ai2"></script><script src="/blis-i18n-en-residual-ai-3-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-ai3"></script><script src="/blis-i18n-en-residual-ai-4-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-ai4"></script><script src="/blis-i18n-en-residual-reputation-1-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-reputation1"></script><script src="/blis-i18n-en-residual-reputation-2-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-reputation2"></script><script src="/blis-i18n-en-residual-reputation-3-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-reputation3"></script><script src="/blis-i18n-en-residual-reputation-4-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-reputation4"></script><script src="/blis-i18n-en-residual-retail-1-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-retail1"></script><script src="/blis-i18n-en-residual-retail-2-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-retail2"></script><script src="/blis-i18n-en-residual-retail-3-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-retail3"></script><script src="/blis-i18n-en-residual-retail-4-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-retail4"></script><script src="/blis-i18n-en-residual-retail-5-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-retail5"></script><script src="/blis-i18n-en-residual-calendar-1-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-calendar1"></script><script src="/blis-i18n-en-residual-calendar-2-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-calendar2"></script><script src="/blis-i18n-en-residual-calendar-3-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-calendar3"></script><script src="/blis-i18n-en-residual-calendar-4-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-residual-calendar4"></script><script src="/blis-i18n-en-dynamic-v1.js?v=20260830-en6" data-blis-i18n-catalog="en-dynamic"></script><script src="/blis-i18n-v1.js?v=20260830-en6" data-blis-i18n-runtime="1"></script>`)

// injectBLISI18N adds the single presentation-language layer to HTML served by
// the existing Navigator. It does not own routing or analytical rendering.
func injectBLISI18N(body []byte) []byte {
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

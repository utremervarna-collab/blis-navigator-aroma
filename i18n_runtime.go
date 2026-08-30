package main

import (
	"bytes"
	"net/http"
	"strings"
)

var blisI18NScripts = []byte(`<script src="/blis-i18n-en-v1.js?v=20260830-en3" data-blis-i18n-catalog="en-base"></script><script src="/blis-i18n-en-public-core-v1.js?v=20260830-en3" data-blis-i18n-catalog="en-public"></script><script src="/blis-i18n-en-legal-v1.js?v=20260830-en3" data-blis-i18n-catalog="en-legal"></script><script src="/blis-i18n-en-public-extra-v1.js?v=20260830-en3" data-blis-i18n-catalog="en-public-extra"></script><script src="/blis-i18n-en-dashboard-v1.js?v=20260830-en3" data-blis-i18n-catalog="en-dashboard"></script><script src="/blis-i18n-en-articles-v1.js?v=20260830-en3" data-blis-i18n-catalog="en-articles"></script><script src="/blis-i18n-v1.js?v=20260830-en3" data-blis-i18n-runtime="1"></script>`)

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

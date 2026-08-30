package main

import "bytes"

// Extend the bilingual presentation layer with the final Dashboard tail catalogs
// without changing route ownership or analytical renderers.
func init() {
	blisI18NScripts = bytes.ReplaceAll(blisI18NScripts, []byte("20260830-en9"), []byte("20260830-en22"))
	marker := []byte(`<script src="/blis-i18n-en-final-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-final"></script>`)
	extra := []byte(`<script src="/blis-i18n-en-dashboard-complete-2-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-dashboard-complete-2"></script><script src="/blis-i18n-en-dashboard-complete-3-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-dashboard-complete-3"></script><script src="/blis-i18n-en-dashboard-complete-4-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-dashboard-complete-4"></script><script src="/blis-i18n-en-dashboard-complete-5-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-dashboard-complete-5"></script><script src="/blis-i18n-en-dashboard-complete-6-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-dashboard-complete-6"></script><script src="/blis-i18n-en-production-tail-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-production-tail"></script><script src="/blis-i18n-en-history-tail-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-history-tail"></script><script src="/blis-i18n-en-real-user-tail-v1.js?v=20260830-en22" data-blis-i18n-catalog="en-real-user-tail"></script>`)
	replacement := append(append([]byte{}, extra...), marker...)
	blisI18NScripts = bytes.Replace(blisI18NScripts, marker, replacement, 1)
	runtime := []byte(`<script src="/blis-i18n-v1.js?v=20260830-en22" data-blis-i18n-runtime="1"></script>`)
	healer := []byte(`<script src="/blis-i18n-production-heal-v1.js?v=20260830-en22" data-blis-i18n-healer="1"></script>`)
	blisI18NScripts = bytes.Replace(blisI18NScripts, runtime, append(append([]byte{}, runtime...), healer...), 1)
}

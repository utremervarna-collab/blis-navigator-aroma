package main

import "bytes"

// Extend the bilingual presentation layer with the final Dashboard tail catalog
// without changing route ownership or analytical renderers.
func init() {
	blisI18NScripts = bytes.ReplaceAll(blisI18NScripts, []byte("20260830-en9"), []byte("20260830-en10"))
	marker := []byte(`<script src="/blis-i18n-en-final-v1.js?v=20260830-en10" data-blis-i18n-catalog="en-final"></script>`)
	extra := []byte(`<script src="/blis-i18n-en-dashboard-complete-2-v1.js?v=20260830-en10" data-blis-i18n-catalog="en-dashboard-complete-2"></script>`)
	replacement := append(append([]byte{}, extra...), marker...)
	blisI18NScripts = bytes.Replace(blisI18NScripts, marker, replacement, 1)
}

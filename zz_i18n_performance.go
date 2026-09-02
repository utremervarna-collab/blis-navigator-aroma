package main

import "bytes"

// Keep the security/isolation guards synchronous, but let the large translation
// catalogs download without blocking the first HTML render. Deferred scripts
// preserve their document order, so the existing i18n catalog/runtime contract
// remains unchanged.
func init() {
	blisI18NScripts = bytes.ReplaceAll(blisI18NScripts, []byte(`<script src="/blis-i18n`), []byte(`<script defer src="/blis-i18n`))
	blisI18NScripts = bytes.ReplaceAll(blisI18NScripts, []byte(`<script src="/kub-crisis-ru-v1.js`), []byte(`<script defer src="/kub-crisis-ru-v1.js`))
}

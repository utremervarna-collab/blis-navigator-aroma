package main

import "bytes"

// Load the Delta Planet Mall English catalog after the shared runtime.
// The catalog is route-scoped and triggers a fresh translation pass.
func init() {
	const tag = `<script defer src="/blis-i18n-en-delta-planet-v1.js?v=20261002-delta-en1" data-blis-i18n-catalog="delta-planet"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("blis-i18n-en-delta-planet-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(tag)...)
	}
}

package main

import "bytes"

// Load the canonical client/language lock and the Delta Planet Mall English catalog.
// The lock runs before the legacy dashboard bootstrap so query parameters remain
// authoritative; the catalog then translates current and dynamically rendered UI.
func init() {
	const lockTag = `<script src="/blis-i18n-client-lock-v1.js?v=20261008-client-lock2" data-blis-client-language-lock="1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("blis-i18n-client-lock-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(lockTag)...)
	}
	const deltaTag = `<script defer src="/blis-i18n-en-delta-planet-v1.js?v=20261008-delta-en6" data-blis-i18n-catalog="delta-planet"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("blis-i18n-en-delta-planet-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(deltaTag)...)
	}
}

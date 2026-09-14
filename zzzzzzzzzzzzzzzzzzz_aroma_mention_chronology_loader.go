package main

import "bytes"

func init() {
	const chronologyScript = `<script defer src="/aroma-mention-chronology-v1.js?v=20260914-2"></script>`
	const activationScript = `<script defer src="/aroma-competition-activation-v1.js?v=20260914-1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("aroma-mention-chronology-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(chronologyScript)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("aroma-competition-activation-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(activationScript)...)
	}
}

package main

import "bytes"

func init() {
	const kubAttackMapScript = `<script src="/kub-attack-map-v1.js?v=20260902-attack1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-attack-map-v1.js")) {
		blisI18NScripts = append([]byte(kubAttackMapScript), blisI18NScripts...)
	}

	const kubShellScript = `<script src="/kub-crisis-shell-fix-v1.js?v=20260902-shell5"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-crisis-shell-fix-v1.js")) {
		blisI18NScripts = append([]byte(kubShellScript), blisI18NScripts...)
	}
}
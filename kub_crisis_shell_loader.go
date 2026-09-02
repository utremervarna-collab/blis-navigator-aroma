package main

import "bytes"

func init() {
	const kubShellScript = `<script src="/kub-crisis-shell-fix-v1.js?v=20260902-shell4"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-crisis-shell-fix-v1.js")) {
		blisI18NScripts = append([]byte(kubShellScript), blisI18NScripts...)
	}
}

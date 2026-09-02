package main

import "bytes"

func init() {
	const kubGuardScript = `<script src="/kub-access-guard-v1.js?v=20260902-guard1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-access-guard-v1.js")) {
		blisI18NScripts = append([]byte(kubGuardScript), blisI18NScripts...)
	}
}

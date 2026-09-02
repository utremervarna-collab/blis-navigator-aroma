package main

import "bytes"

func init() {
	const tag = `<script defer src="/kub-client-content-v4.js?v=20260902-content4"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-client-content-v4.js")) {
		blisI18NScripts = append([]byte(tag), blisI18NScripts...)
	}
}

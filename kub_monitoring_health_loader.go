package main

import "bytes"

func init() {
	const tag = `<script defer src="/kub-monitoring-health-v1.js?v=20260902-health1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-monitoring-health-v1.js")) {
		blisI18NScripts = append([]byte(tag), blisI18NScripts...)
	}
}

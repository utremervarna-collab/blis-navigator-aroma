package main

import "bytes"

func init() {
	const kubLiveSignalsScript = `<script defer src="/kub-live-signals-v1.js?v=20260902-live1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-live-signals-v1.js")) {
		blisI18NScripts = append([]byte(kubLiveSignalsScript), blisI18NScripts...)
	}
}

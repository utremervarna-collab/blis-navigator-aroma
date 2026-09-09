package main

import "bytes"

func init() {
	const script = `<script defer src="/navigator-nav-label-fix-v1.js?v=20260909-env1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("navigator-nav-label-fix-v1.js")) {
		blisI18NScripts = append([]byte(script), blisI18NScripts...)
	}
}

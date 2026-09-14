package main

import "bytes"

func init() {
	const script = `<script defer src="/aroma-mention-chronology-v1.js?v=20260914-1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("aroma-mention-chronology-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(script)...)
	}
}

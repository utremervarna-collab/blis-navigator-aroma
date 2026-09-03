package main

import "bytes"

func init() {
	const tag = `<script defer src="/kub-live-feed-v3.js?v=20260903-live6"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-live-feed-v3.js")) {
		// Append so v3 executes after the older KUB feed helpers and becomes the
		// final sorter/renderer without changing the approved page geometry.
		blisI18NScripts = append(blisI18NScripts, []byte(tag)...)
	}
}

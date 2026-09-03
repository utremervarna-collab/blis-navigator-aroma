package main

import "bytes"

func init() {
	const feedTag = `<script defer src="/kub-live-feed-v3.js?v=20260903-live7"></script>`
	const dynamicsTag = `<script defer src="/kub-crisis-dynamics-v1.js?v=20260903-dynamics1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-live-feed-v3.js")) {
		// Append so v3 executes after the older KUB feed helpers and becomes the
		// final sorter/renderer without changing the approved page geometry.
		blisI18NScripts = append(blisI18NScripts, []byte(feedTag)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("kub-crisis-dynamics-v1.js")) {
		// Live crisis curve + clickable peaks + current-signal visual accents.
		blisI18NScripts = append(blisI18NScripts, []byte(dynamicsTag)...)
	}
}

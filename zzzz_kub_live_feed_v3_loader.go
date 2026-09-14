package main

import "bytes"

func init() {
	const feedTag = `<script defer src="/kub-live-feed-v4.js?v=20260914-chronology3"></script>`
	const dynamicsTag = `<script defer src="/kub-crisis-dynamics-v1.js?v=20260903-dynamics1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-live-feed-v4.js")) {
		// The public KUB chronology uses the read-only public mentions endpoint.
		// It executes after the older helpers and becomes the canonical renderer
		// without exposing the authenticated /api/signals route.
		blisI18NScripts = append(blisI18NScripts, []byte(feedTag)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("kub-crisis-dynamics-v1.js")) {
		// Live crisis curve + clickable peaks + current-signal visual accents.
		blisI18NScripts = append(blisI18NScripts, []byte(dynamicsTag)...)
	}
}

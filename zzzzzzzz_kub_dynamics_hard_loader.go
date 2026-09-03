package main

import "bytes"

// KUB pages can already contain the i18n runtime marker before late loader init
// mutations are considered. Attach the crisis-dynamics script to the KUB-only
// readable-type payload so it is present even when later shared loaders return early.
func init() {
	const tag = `<script defer src="/kub-crisis-dynamics-v1.js?v=20260903-dynamics5"></script>`
	if !bytes.Contains(kubReadableTypeCSS, []byte("kub-crisis-dynamics-v1.js")) {
		kubReadableTypeCSS = append(kubReadableTypeCSS, []byte(tag)...)
	}
}

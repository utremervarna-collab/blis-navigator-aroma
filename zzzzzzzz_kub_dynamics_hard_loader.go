package main

import "bytes"

// KUB pages can already contain the i18n runtime marker before late loader init
// mutations are considered. The readable-type payload is injected before that
// early-return check, so attach the crisis-dynamics script there as a guaranteed
// KUB-only head payload. This does not affect the shared dashboard.
func init() {
	const tag = `<script defer src="/kub-crisis-dynamics-v1.js?v=20260903-dynamics2"></script>`
	if !bytes.Contains(kubReadableTypeCSS, []byte("kub-crisis-dynamics-v1.js")) {
		kubReadableTypeCSS = append(kubReadableTypeCSS, []byte(tag)...)
	}
}

package main

import "strings"

func init() {
	const marker = `/home-hub-dropdown.js?v=20260901-click-menu3`
	if strings.Contains(indexHTML, marker) {
		return
	}
	indexHTML = strings.Replace(indexHTML, `</body>`, `<script src="/home-hub-dropdown.js?v=20260901-click-menu3"></script></body>`, 1)
}

package main

import "strings"

func init() {
	const marker = `/home-hub-dropdown.js?v=20260901-click-menu1`
	if strings.Contains(indexHTML, marker) {
		return
	}
	indexHTML = strings.Replace(indexHTML, `</body>`, `<script src="`+marker+`"></script></body>`, 1)
}

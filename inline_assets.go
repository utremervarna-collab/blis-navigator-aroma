package main

import (
	"embed"
	"regexp"
	"strings"
)

// Inline the Navigator JavaScript into the embedded index page. The server uses
// http.HandlerFunc(handler) directly, so DefaultServeMux routes registered in
// other init functions are bypassed. Inlining guarantees that the application
// code executes regardless of static .js routing or browser cache behavior.

//go:embed static/app.js static/portal-unified.js
var inlineNavigatorAssets embed.FS

func init() {
	app, err1 := inlineNavigatorAssets.ReadFile("static/app.js")
	unified, err2 := inlineNavigatorAssets.ReadFile("static/portal-unified.js")
	if err1 != nil || err2 != nil {
		return
	}

	// Remove any external Navigator script tags, including cache-busting query strings.
	reApp := regexp.MustCompile(`<script\s+src=["']/app\.js(?:\?[^"']*)?["']\s*></script>`)
	reUnified := regexp.MustCompile(`<script\s+src=["']/portal-unified\.js(?:\?[^"']*)?["']\s*></script>`)
	indexHTML = reApp.ReplaceAllString(indexHTML, "")
	indexHTML = reUnified.ReplaceAllString(indexHTML, "")

	inline := "<script>" + string(app) + "</script><script>" + string(unified) + "</script>"
	if strings.Contains(indexHTML, "</body>") {
		indexHTML = strings.Replace(indexHTML, "</body>", inline+"</body>", 1)
	} else {
		indexHTML += inline
	}
}

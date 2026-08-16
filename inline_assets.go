package main

import (
	"embed"
	"regexp"
	"strings"
)

// Inline all Navigator JavaScript assets into the embedded dashboard page.
// The application server uses its own handler and may bypass DefaultServeMux,
// so inlining guarantees that every dashboard layer executes after deploy.

//go:embed static/app.js static/portal-unified.js static/dashboard-extensions.js static/dashboard-premium.js static/dashboard-modules-premium.js static/dashboard-final-premium.js
var inlineNavigatorAssets embed.FS

func init() {
	files := []string{
		"static/app.js",
		"static/portal-unified.js",
		"static/dashboard-extensions.js",
		"static/dashboard-premium.js",
		"static/dashboard-modules-premium.js",
		"static/dashboard-final-premium.js",
	}

	parts := make([]string, 0, len(files))
	for _, f := range files {
		b, err := inlineNavigatorAssets.ReadFile(f)
		if err != nil {
			return
		}
		parts = append(parts, "<script>"+string(b)+"</script>")
	}

	// Remove external script tags for all Navigator layers, with optional cache-busting query strings.
	names := []string{
		"app.js",
		"portal-unified.js",
		"dashboard-extensions.js",
		"dashboard-premium.js",
		"dashboard-modules-premium.js",
		"dashboard-final-premium.js",
	}
	for _, name := range names {
		re := regexp.MustCompile(`<script\s+src=["']/` + regexp.QuoteMeta(name) + `(?:\?[^"']*)?["']\s*></script>`)
		indexHTML = re.ReplaceAllString(indexHTML, "")
	}

	inline := strings.Join(parts, "")
	if strings.Contains(indexHTML, "</body>") {
		indexHTML = strings.Replace(indexHTML, "</body>", inline+"</body>", 1)
	} else {
		indexHTML += inline
	}
}

package main

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

// The legacy static handler intentionally does not serve arbitrary JavaScript.
// Keep the language layer explicit and isolated: only BLIS i18n assets are
// embedded here, and they never own routing or analytical rendering.
//
//go:embed static/blis-i18n*.js
var blisI18NAssets embed.FS

func init() {
	files, err := fs.Glob(blisI18NAssets, "static/blis-i18n*.js")
	if err != nil {
		return
	}
	for _, file := range files {
		payload, readErr := blisI18NAssets.ReadFile(file)
		if readErr != nil {
			continue
		}
		route := "/" + strings.TrimPrefix(file, "static/")
		body := append([]byte(nil), payload...)
		http.HandleFunc(route, func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
			w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
			_, _ = w.Write(body)
		})
	}
}

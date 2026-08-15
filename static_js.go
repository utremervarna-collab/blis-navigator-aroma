package main

import (
	"embed"
	"net/http"
)

// JavaScript assets are served on explicit routes because the legacy static
// handler only whitelists html/css/images. Exact routes take precedence over
// the catch-all "/" handler on http.DefaultServeMux.

//go:embed static/app.js static/portal-unified.js
var navigatorJS embed.FS

func init() {
	http.HandleFunc("/app.js", func(w http.ResponseWriter, r *http.Request) {
		b, err := navigatorJS.ReadFile("static/app.js")
		if err != nil {
			http.Error(w, "app.js not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Write(b)
	})

	http.HandleFunc("/portal-unified.js", func(w http.ResponseWriter, r *http.Request) {
		b, err := navigatorJS.ReadFile("static/portal-unified.js")
		if err != nil {
			http.Error(w, "portal-unified.js not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Write(b)
	})
}

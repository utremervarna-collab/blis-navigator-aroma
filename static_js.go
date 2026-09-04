package main

import (
	"embed"
	"net/http"
)

// JavaScript assets are served on explicit routes because the legacy static
// handler only whitelists html/css/images. Exact routes take precedence when
// DefaultServeMux is used; inline_assets.go remains the fallback for the custom handler.

//go:embed static/app.js static/portal-unified.js static/dashboard-extensions.js static/dashboard-premium.js static/dashboard-modules-premium.js static/dashboard-final-premium.js static/navigator-stability-preload-v1.js static/kub-access-guard-v1.js static/kub-attack-map-v1.js static/kub-attack-map-live-v1.js static/kub-attack-map-executive-v1.js static/kub-attack-map-white3d-v1.js static/kub-client-content-v4.js static/kub-crisis-dynamics-v1.js static/kub-crisis-ru-v1.js static/kub-crisis-shell-fix-v1.js static/kub-live-feed-v3.js static/kub-live-signals-v1.js static/kub-monitoring-health-v1.js
var navigatorJS embed.FS

func serveNavigatorJS(route, file string) {
	http.HandleFunc(route, func(w http.ResponseWriter, r *http.Request) {
		b, err := navigatorJS.ReadFile(file)
		if err != nil {
			http.Error(w, "asset not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		_, _ = w.Write(b)
	})
}

func init() {
	serveNavigatorJS("/app.js", "static/app.js")
	serveNavigatorJS("/portal-unified.js", "static/portal-unified.js")
	serveNavigatorJS("/dashboard-extensions.js", "static/dashboard-extensions.js")
	serveNavigatorJS("/dashboard-premium.js", "static/dashboard-premium.js")
	serveNavigatorJS("/dashboard-modules-premium.js", "static/dashboard-modules-premium.js")
	serveNavigatorJS("/dashboard-final-premium.js", "static/dashboard-final-premium.js")
	serveNavigatorJS("/navigator-stability-preload-v1.js", "static/navigator-stability-preload-v1.js")

	// KUB is a dedicated client runtime. Keep every KUB script on an explicit
	// route so the crisis profile never depends on the legacy JS whitelist.
	serveNavigatorJS("/kub-access-guard-v1.js", "static/kub-access-guard-v1.js")
	serveNavigatorJS("/kub-attack-map-v1.js", "static/kub-attack-map-v1.js")
	serveNavigatorJS("/kub-attack-map-live-v1.js", "static/kub-attack-map-live-v1.js")
	serveNavigatorJS("/kub-attack-map-executive-v1.js", "static/kub-attack-map-executive-v1.js")
	serveNavigatorJS("/kub-attack-map-white3d-v1.js", "static/kub-attack-map-white3d-v1.js")
	serveNavigatorJS("/kub-client-content-v4.js", "static/kub-client-content-v4.js")
	serveNavigatorJS("/kub-crisis-dynamics-v1.js", "static/kub-crisis-dynamics-v1.js")
	serveNavigatorJS("/kub-crisis-ru-v1.js", "static/kub-crisis-ru-v1.js")
	serveNavigatorJS("/kub-crisis-shell-fix-v1.js", "static/kub-crisis-shell-fix-v1.js")
	serveNavigatorJS("/kub-live-feed-v3.js", "static/kub-live-feed-v3.js")
	serveNavigatorJS("/kub-live-signals-v1.js", "static/kub-live-signals-v1.js")
	serveNavigatorJS("/kub-monitoring-health-v1.js", "static/kub-monitoring-health-v1.js")
}

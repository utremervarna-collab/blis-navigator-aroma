package main

import (
	"bytes"
	"net/http"
	"regexp"
)

var kubDashboardLinkRE = regexp.MustCompile(`(?is)(?:<br\s*/?>\s*)?<a\b[^>]*href=["'][^"']*dashboard\.html[^"']*["'][^>]*>.*?</a>`)

// KUB uses dedicated standalone HTML pages. Serve them on exact routes so they
// cannot fall through the legacy dashboard/static loader (whose placeholder is
// literally "Loading..."). Exact DefaultServeMux routes take precedence over
// the catch-all static handler.
func serveKUBHTML(file string, injectRuntime bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		b, err := staticFS.ReadFile("static/" + file)
		if err != nil {
			http.Error(w, "KUB page not found", http.StatusNotFound)
			return
		}

		// KUB client pages must never expose a route back to the shared Navigator.
		// Remove it from the server response itself so this does not depend on JS,
		// cache state, browser session state, or the particular KUB alias route.
		b = kubDashboardLinkRE.ReplaceAll(b, nil)

		if injectRuntime {
			const runtime = `<script defer src="/kub-live-alias-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-access-guard-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-client-content-v4.js?v=20260904-direct9"></script>
<script defer src="/kub-crisis-shell-fix-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-crisis-ru-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-live-feed-v3.js?v=20260904-direct9"></script>
<script defer src="/kub-private-live-v2.js?v=20260904-direct9"></script>
<script defer src="/kub-crisis-dynamics-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-private-hide-standard-link-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-attack-map-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-attack-map-live-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-attack-map-executive-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-attack-map-white3d-v1.js?v=20260904-direct9"></script>
<script defer src="/kub-monitoring-health-v1.js?v=20260904-direct9"></script>`
			if !bytes.Contains(b, []byte("20260904-direct9")) {
				b = bytes.Replace(b, []byte("</body>"), []byte(runtime+"\n</body>"), 1)
			}
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		_, _ = w.Write(b)
	}
}

func init() {
	http.HandleFunc("/kub-home.html", serveKUBHTML("kub-home.html", false))
	http.HandleFunc("/kub-crisis.html", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
	http.HandleFunc("/kub/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
}

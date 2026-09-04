package main

import (
	"bytes"
	"net/http"
	"regexp"
)

var kubDashboardLinkRE = regexp.MustCompile(`(?is)(?:<br\s*/?>\s*)?<a\b[^>]*href=["'][^"']*dashboard\.html[^"']*["'][^>]*>.*?</a>`)

var kubRuntimeFiles = map[string]string{
	"/kub-client-content-v4.js":          "kub-client-content-v4.js",
	"/kub-crisis-shell-fix-v1.js":        "kub-crisis-shell-fix-v1.js",
	"/kub-crisis-ru-v1.js":               "kub-crisis-ru-v1.js",
	"/kub-live-feed-v3.js":                "kub-live-feed-v3.js",
	"/kub-private-live-v2.js":             "kub-private-live-v2.js",
	"/kub-monitoring-health-v1.js":        "kub-monitoring-health-v1.js",
}

// Serve KUB runtime assets with one canonical route test. Older KUB scripts were
// written against different pathname aliases (/kub-crisis.html or /kub-private),
// which made the same client profile initialize only partially on /kub-client.
// Normalizing the guard in the served JS keeps the visible URL stable and avoids
// history/pathname tricks that caused inactive menu, stale dynamics and Loading.
func serveKUBRuntimeJS(file string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		b, err := staticFS.ReadFile("static/" + file)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		aliasGuard := []byte(`if(!/^\/kub-(?:crisis\.html|private|live|client)$/i.test(location.pathname))return;`)
		b = bytes.ReplaceAll(b, []byte(`if(!/\/kub-crisis\.html$/i.test(location.pathname))return;`), aliasGuard)
		b = bytes.ReplaceAll(b, []byte(`if(location.pathname!=='/kub-private')return;`), aliasGuard)
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		_, _ = w.Write(b)
	}
}

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
		b = kubDashboardLinkRE.ReplaceAll(b, nil)

		if injectRuntime {
			const runtime = `<script defer src="/kub-live-alias-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-access-guard-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-client-content-v4.js?v=20260904-direct11"></script>
<script defer src="/kub-crisis-shell-fix-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-crisis-ru-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-live-feed-v3.js?v=20260904-direct11"></script>
<script defer src="/kub-private-live-v2.js?v=20260904-direct11"></script>
<script defer src="/kub-crisis-dynamics-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-private-hide-standard-link-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-attack-map-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-attack-map-live-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-attack-map-executive-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-attack-map-white3d-v1.js?v=20260904-direct11"></script>
<script defer src="/kub-monitoring-health-v1.js?v=20260904-direct11"></script>`
			if !bytes.Contains(b, []byte("20260904-direct11")) {
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
	for route, file := range kubRuntimeFiles {
		http.HandleFunc(route, serveKUBRuntimeJS(file))
	}
	http.HandleFunc("/kub-home.html", serveKUBHTML("kub-home.html", false))
	http.HandleFunc("/kub-crisis.html", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
	http.HandleFunc("/kub/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
}

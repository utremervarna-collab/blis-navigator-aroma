package main

import (
	"bytes"
	"log"
	"net/http"
	"regexp"
)

var kubDashboardLinkRE = regexp.MustCompile(`(?is)(?:<br\s*/?>\s*)?<a\b[^>]*href=["'][^"']*dashboard\.html[^"']*["'][^>]*>.*?</a>`)

var kubRuntimeFiles = map[string]string{
	"/kub-client-content-v4.js":       "kub-client-content-v4.js",
	"/kub-crisis-shell-fix-v1.js":     "kub-crisis-shell-fix-v1.js",
	"/kub-crisis-ru-v1.js":            "kub-crisis-ru-v1.js",
	"/kub-client-stabilizer-v1.js":     "kub-client-stabilizer-v1.js",
	"/kub-crisis-dynamics-force-v1.js": "kub-crisis-dynamics-force-v1.js",
	"/kub-attack-map-v1.js":            "kub-attack-map-v1.js",
	"/kub-attack-map-live-v1.js":       "kub-attack-map-live-v1.js",
	"/kub-attack-map-executive-v1.js":  "kub-attack-map-executive-v1.js",
	"/kub-attack-map-white3d-v1.js":    "kub-attack-map-white3d-v1.js",
}

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

func serveKUBHTML(file string, injectRuntime bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		b, err := staticFS.ReadFile("static/" + file)
		if err != nil {
			http.Error(w, "KUB page not found", http.StatusNotFound)
			return
		}

		b = kubDashboardLinkRE.ReplaceAll(b, nil)

		if injectRuntime {
			// Keep the isolated KUB client runtime deliberately small. The legacy
			// monitoring and dynamics scripts competed for the same DOM nodes and
			// repeatedly restored stale content. The stabilizer owns monitoring and
			// the force renderer owns the crisis curve.
			const runtime = `<script defer src="/kub-client-content-v4.js?v=20260905-direct14"></script>
<script defer src="/kub-crisis-shell-fix-v1.js?v=20260905-direct14"></script>
<script defer src="/kub-crisis-ru-v1.js?v=20260905-direct14"></script>
<script defer src="/kub-attack-map-v1.js?v=20260905-direct14"></script>
<script defer src="/kub-attack-map-live-v1.js?v=20260905-direct14"></script>
<script defer src="/kub-attack-map-executive-v1.js?v=20260905-direct14"></script>
<script defer src="/kub-attack-map-white3d-v1.js?v=20260905-direct14"></script>
<script defer src="/kub-client-stabilizer-v1.js?v=20260905-direct14"></script>
<script defer src="/kub-crisis-dynamics-force-v1.js?v=20260905-direct14"></script>`
			b = bytes.Replace(b, []byte("</body>"), []byte(runtime+"\n</body>"), 1)
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		w.Header().Set("Clear-Site-Data", `"cache"`)
		w.Header().Set("X-BLIS-KUB-Route", "direct14")
		log.Printf("KUB_PAGE route=%s file=%s bytes=%d marker=direct14", r.URL.Path, file, len(b))
		_, _ = w.Write(b)
	}
}

func init() {
	for route, file := range kubRuntimeFiles {
		http.HandleFunc(route, serveKUBRuntimeJS(file))
	}

	http.HandleFunc("/kub-client", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-live", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-private", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-home.html", serveKUBHTML("kub-home.html", false))
	http.HandleFunc("/kub-crisis.html", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
	http.HandleFunc("/kub/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
}

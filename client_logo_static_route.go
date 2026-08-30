package main

import (
	"mime"
	"net/http"
	"path"
	"strings"
)

// Serve only the verified client-logo bundle from the embedded static tree.
// The generic static handler intentionally does not expose JSON, so the logo
// manifest needs this narrow route. No other static JSON becomes public.
func init() {
	http.HandleFunc("/client-logos/", serveClientLogoAsset)
}

func serveClientLogoAsset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	name := strings.TrimPrefix(r.URL.Path, "/client-logos/")
	name = path.Clean("/" + name)
	name = strings.TrimPrefix(name, "/")
	if name == "" || strings.Contains(name, "..") || strings.Contains(name, "/") {
		http.NotFound(w, r)
		return
	}

	allowed := name == "manifest.json"
	if !allowed {
		ext := strings.ToLower(path.Ext(name))
		switch ext {
		case ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif":
			allowed = true
		}
	}
	if !allowed {
		http.NotFound(w, r)
		return
	}

	b, err := staticFS.ReadFile("static/client-logos/" + name)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	if name == "manifest.json" {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	} else {
		ct := mime.TypeByExtension(strings.ToLower(path.Ext(name)))
		if ct == "" && strings.HasSuffix(strings.ToLower(name), ".svg") {
			ct = "image/svg+xml"
		}
		if ct != "" {
			w.Header().Set("Content-Type", ct)
		}
		w.Header().Set("Cache-Control", "public, max-age=3600")
	}
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Length", itoa(len(b)))
	if r.Method == http.MethodHead {
		w.WriteHeader(http.StatusOK)
		return
	}
	_, _ = w.Write(b)
}

func itoa(n int) string {
	if n == 0 { return "0" }
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	return string(buf[i:])
}

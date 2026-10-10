package main

import (
 "net/http"
 "strings"
)

// The tailored iCard presentation is served directly from the embedded bundle.
// It is independent of store restore and all legacy client cookies/scripts.
// Its public data is limited to the reviewed iCard intelligence snapshot.
func serveICardPublic(w http.ResponseWriter, r *http.Request) bool {
 path := strings.TrimSuffix(r.URL.Path, "/")
 if path == "/dashboard.html" && r.URL.Query().Get("client") == icardSlug && (r.Method == http.MethodGet || r.Method == http.MethodHead) {
  http.Redirect(w, r, "/icard", http.StatusFound)
  return true
 }
 if path == "/icard/prepare" || path == "/icard/prospects" || path == "/icard/growth" {
  if r.Method != http.MethodGet && r.Method != http.MethodHead {
   w.Header().Set("Allow", "GET, HEAD")
   http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
  } else { http.Redirect(w, r, "/icard/niches", http.StatusFound) }
  return true
 }
 files := map[string]string{
  "/icard": "static/icard-commercial.html",
  "/icard/data": "static/icard-commercial-data.json",
  "/icard/style.css": "static/icard-commercial.css",
  "/icard/app.js": "static/icard-commercial.js",
  "/icard/report": "static/icard-commercial-report.html",
 }
 for _, page := range []string{"overview", "monitoring", "digital", "market", "competition", "trust", "niches", "reports", "sources"} {
  files["/icard/"+page] = "static/icard-commercial.html"
 }
 file, ok := files[path]
 if !ok { return false }
 if r.Method != http.MethodGet && r.Method != http.MethodHead {
  w.Header().Set("Allow", "GET, HEAD")
  http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
  return true
 }
 b, err := staticFS.ReadFile(file)
 if err != nil { http.NotFound(w, r); return true }
 contentType := "text/html; charset=utf-8"
 switch {
 case strings.HasSuffix(file, ".json"): contentType = "application/json; charset=utf-8"
 case strings.HasSuffix(file, ".css"): contentType = "text/css; charset=utf-8"
 case strings.HasSuffix(file, ".js"): contentType = "application/javascript; charset=utf-8"
 }
 w.Header().Set("Content-Type", contentType)
 w.Header().Set("Cache-Control", "no-store")
 w.Header().Set("X-Content-Type-Options", "nosniff")
 w.Header().Set("X-BLIS-ICard-Version", "icard-market-v3-20261010")
 if path == "/icard/report" && r.URL.Query().Get("download") == "1" {
  w.Header().Set("Content-Disposition", `attachment; filename="iCard_BLIS_Report_2026-10-10.html"`)
 }
 if r.Method == http.MethodHead { w.WriteHeader(http.StatusOK); return true }
 _, _ = w.Write(b)
 return true
}

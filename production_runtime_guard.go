package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// productionHandler keeps heavyweight persistence export work away from the
// live in-memory store lock. All other routes continue through the canonical
// handler, including the KUB routes.
func productionHandler(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(strings.TrimSpace(r.URL.Path), "/")
	switch path {
	case "api/store/export":
		productionStoreExport(w, r)
		return
	case "api/store/meta":
		productionStoreMeta(w, r)
		return
	default:
		handler(w, r)
	}
}

func productionStoreExport(w http.ResponseWriter, r *http.Request) {
	// Serialize exports independently so parallel QA/persistence callers cannot
	// multiply memory pressure. Never hold the live store mutex while sending a
	// multi-megabyte response.
	exportMu.Lock()
	defer exportMu.Unlock()

	p := dataPath
	if p == "" {
		http.Error(w, "store not ready", http.StatusServiceUnavailable)
		return
	}
	b, err := os.ReadFile(p)
	if err != nil || len(b) == 0 || !json.Valid(b) {
		http.Error(w, "persistent store unavailable", http.StatusServiceUnavailable)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Content-Disposition", "inline; filename="+filepath.Base(p))
	_, _ = w.Write(b)
}

func productionStoreMeta(w http.ResponseWriter, r *http.Request) {
	// Hold the global mutex only while reading integer counters. It is released
	// before JSON encoding and before any bytes are transmitted.
	mu.Lock()
	clients := make(map[string]map[string]int, len(store.Clients))
	for slug, c := range store.Clients {
		if c == nil {
			continue
		}
		clients[slug] = map[string]int{
			"snapshots":    len(c.Snapshots),
			"observations": len(c.Observations),
		}
	}
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"ok":      true,
		"clients": clients,
		"restore": getRuntimeRestoreStatus(),
	})
}

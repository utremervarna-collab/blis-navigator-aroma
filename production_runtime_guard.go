package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// productionHandler keeps heavyweight persistence export work away from large
// in-memory byte buffers. All other routes continue through the canonical
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
	// multiply memory pressure. Encode directly to a temporary file instead of
	// building a multi-megabyte []byte in memory, then stream that file after the
	// live-store lock has been released.
	exportMu.Lock()
	defer exportMu.Unlock()

	p := dataPath
	if p == "" {
		http.Error(w, "store not ready", http.StatusServiceUnavailable)
		return
	}
	if err := os.MkdirAll(filepath.Dir(p), 0755); err != nil {
		http.Error(w, "persistent store unavailable", http.StatusServiceUnavailable)
		return
	}
	tmp, err := os.CreateTemp(filepath.Dir(p), "store-export-*.json")
	if err != nil {
		http.Error(w, "persistent store unavailable", http.StatusServiceUnavailable)
		return
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)

	mu.Lock()
	err = json.NewEncoder(tmp).Encode(store)
	mu.Unlock()
	if err != nil {
		tmp.Close()
		http.Error(w, "persistent store unavailable", http.StatusServiceUnavailable)
		return
	}
	if _, err := tmp.Seek(0, io.SeekStart); err != nil {
		tmp.Close()
		http.Error(w, "persistent store unavailable", http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Content-Disposition", "inline; filename="+filepath.Base(p))
	_, _ = io.Copy(w, tmp)
	_ = tmp.Close()
}

func productionStoreMeta(w http.ResponseWriter, r *http.Request) {
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

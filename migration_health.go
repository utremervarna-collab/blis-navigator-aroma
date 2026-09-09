package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const navigatorMigrationBuild = "code-run-migration-2026-09-09-v1"

func migrationStorageMode() string {
	if strings.TrimSpace(os.Getenv("DATA_DIR")) != "" {
		return "DATA_DIR"
	}
	if strings.TrimSpace(os.Getenv("APPDATA")) != "" {
		return "APPDATA"
	}
	if strings.TrimSpace(os.Getenv("RENDER")) != "" {
		return "render-temp"
	}
	return "home-default"
}

func migrationStorageWritable() bool {
	dir := appDataDir()
	if dir == "" {
		return false
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return false
	}
	f, err := os.CreateTemp(dir, ".blis-migration-probe-*")
	if err != nil {
		return false
	}
	name := f.Name()
	_ = f.Close()
	_ = os.Remove(name)
	return true
}

func migrationStorePresent() bool {
	if strings.TrimSpace(dataPath) == "" {
		return false
	}
	_, err := os.Stat(filepath.Clean(dataPath))
	return err == nil
}

func init() {
	http.HandleFunc("/api/migration-health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, max-age=0")
		w.Header().Set("X-BLIS-Migration-Build", navigatorMigrationBuild)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"ok":               true,
			"migration_build":  navigatorMigrationBuild,
			"storage_mode":     migrationStorageMode(),
			"storage_writable": migrationStorageWritable(),
			"store_present":    migrationStorePresent(),
			"time":             time.Now().UTC().Format(time.RFC3339),
		})
	})
}

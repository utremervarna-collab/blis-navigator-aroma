package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func repairedDashboard(t *testing.T) string {
	t.Helper()
	raw, err := staticFS.ReadFile("static/dashboard.html")
	if err != nil {
		t.Fatal(err)
	}
	resp := &http.Response{
		Request: httptest.NewRequest(http.MethodGet, "https://example.test/dashboard.html?client=aroma&page=live", nil),
		Body:    io.NopCloser(bytes.NewReader(raw)),
		Header:  make(http.Header),
	}
	if err := repairNavigatorClientResponse(resp); err != nil {
		t.Fatal(err)
	}
	out, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	return string(out)
}

func TestDashboardHasSingleProductionOwners(t *testing.T) {
	html := repairedDashboard(t)
	retired := []string{
		"navigator-live-master.js",
		"navigator-live-master.css",
		"navigator-geo-v2.js",
		"navigator-geo-v2.css",
		"navigator-social-master.js",
		"navigator-social-master.css",
	}
	for _, asset := range retired {
		if strings.Contains(html, asset) {
			t.Errorf("retired renderer asset is still served: %s", asset)
		}
	}
	for _, asset := range []string{"navigator-architecture-v15.js?v=20260825-owners2", "navigator-module-lock-v1.js?v=20260825-owners2"} {
		if count := strings.Count(html, asset); count != 1 {
			t.Errorf("production owner asset %s appears %d times, want 1", asset, count)
		}
	}
	if count := strings.Count(html, "navigator-reference.js?v=20260825-router10-owners2"); count != 1 {
		t.Fatalf("canonical router appears %d times, want 1", count)
	}

	dataCore := strings.Index(html, "navigator-data-core-v2.js")
	router := strings.Index(html, "navigator-reference.js?v=20260825-router10-owners2")
	architecture := strings.Index(html, "navigator-architecture-v15.js?v=20260825-owners2")
	registry := strings.Index(html, "navigator-module-lock-v1.js?v=20260825-owners2")
	if !(dataCore >= 0 && dataCore < router && router < architecture && architecture < registry) {
		t.Fatalf("invalid production load order: data=%d router=%d architecture=%d registry=%d", dataCore, router, architecture, registry)
	}
}

func TestRouterHasNoLegacyRendererFallbacks(t *testing.T) {
	b, err := staticFS.ReadFile("static/navigator-reference.js")
	if err != nil {
		t.Fatal(err)
	}
	s := string(b)
	for _, legacy := range []string{"BLISLiveMount", "BLISSocialSignalsRender"} {
		if strings.Contains(s, legacy) {
			t.Errorf("canonical router still references retired renderer %s", legacy)
		}
	}
	if !strings.Contains(s, "BLISProductionOwners?.owns") {
		t.Error("canonical router does not delegate locked routes to the production owner registry")
	}
}

func TestArchitectureV15DoesNotCoordinateRoutes(t *testing.T) {
	b, err := staticFS.ReadFile("static/navigator-architecture-v15.js")
	if err != nil {
		t.Fatal(err)
	}
	s := string(b)
	for _, forbidden := range []string{"installRouter()", "blis:routechange", "window.refGo=wrapped"} {
		if strings.Contains(s, forbidden) {
			t.Errorf("V15 renderer still coordinates routes via %q", forbidden)
		}
	}
	if !strings.Contains(s, "routes:Object.freeze(['live','social'])") {
		t.Error("V15 does not explicitly declare its two production routes")
	}
}

func TestLockManifestMatchesConsolidatedOwners(t *testing.T) {
	b, err := staticFS.ReadFile("static/navigator-lock-manifest-v1.json")
	if err != nil {
		t.Fatal(err)
	}
	var manifest struct {
		Version string `json:"version"`
		Modules map[string]struct {
			JS []string `json:"js"`
		} `json:"modules"`
		Forbidden []string `json:"forbidden_global_overlays"`
	}
	if err := json.Unmarshal(b, &manifest); err != nil {
		t.Fatal(err)
	}
	if manifest.Version != "2.0" {
		t.Fatalf("manifest version=%s, want 2.0", manifest.Version)
	}
	for _, route := range []string{"live", "social"} {
		joined := strings.Join(manifest.Modules[route].JS, "|")
		if !strings.Contains(joined, "navigator-architecture-v15.js") || !strings.Contains(joined, "navigator-module-lock-v1.js") {
			t.Errorf("%s owner declaration is incomplete: %v", route, manifest.Modules[route].JS)
		}
	}
}

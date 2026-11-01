package main

import (
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"net/url"
	"strings"
	"testing"
)

func TestSharedNavigatorEscapesLegacyClientScope(t *testing.T) {
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Test-Client", r.URL.Query().Get("client"))
		w.Write([]byte("backend reached"))
	}))
	defer backend.Close()
	target, _ := url.Parse(backend.URL)
	previous := authProxy
	authProxy = httputil.NewSingleHostReverseProxy(target)
	defer func() { authProxy = previous }()
	for _, path := range []string{"/dashboard.html?client=mollox&page=competition", "/api/clients", "/api/clients/aroma/dashboard"} {
		req := httptest.NewRequest("GET", path, nil)
		req.AddCookie(&http.Cookie{Name: topRentScopeCookieName, Value: "top-rent-a-car"})
		rec := httptest.NewRecorder()
		navigatorGateway(rec, req)
		if rec.Code != 200 || rec.Body.String() != "backend reached" {
			t.Fatalf("legacy cookie intercepted %s: %d %s", path, rec.Code, rec.Body.String())
		}
		if strings.HasPrefix(path, "/dashboard") && rec.Header().Get("X-Test-Client") != "mollox" {
			t.Fatal("explicit client overwritten")
		}
	}
}

func TestHomeRemainsSharedAfterClientVisit(t *testing.T) {
	for _, client := range []string{"top-rent-a-car", "delta-planet", "black-sea-center", "icard"} {
		req := httptest.NewRequest("GET", "/?client="+client, nil)
		req.AddCookie(&http.Cookie{Name: topRentScopeCookieName, Value: "top-rent-a-car"})
		rec := httptest.NewRecorder()
		navigatorGateway(rec, req)
		if rec.Code != 200 {
			t.Fatalf("home redirected for %s: %d", client, rec.Code)
		}
		if strings.Contains(rec.Body.String(), "blis-home-client-context") {
			t.Fatalf("home entry locked to %s", client)
		}
		if !strings.Contains(rec.Body.String(), `href="/dashboard.html"`) {
			t.Fatal("shared client entry missing")
		}
		expired := false
		for _, c := range rec.Result().Cookies() {
			if c.Name == topRentScopeCookieName && c.MaxAge < 0 {
				expired = true
			}
		}
		if !expired {
			t.Fatal("legacy scope cookie retained")
		}
	}
}

func TestNavigatorExplicitClientAndResourceRoutes(t *testing.T) {
	for _, page := range []string{"overview", "hub", "calendar"} {
		req := httptest.NewRequest("GET", "/navigator?client=delta-planet&page="+page+"&lang=en", nil)
		req.AddCookie(&http.Cookie{Name: bscScopeCookieName, Value: "black-sea-center"})
		target := navigatorDashboardTarget(req)
		u, _ := url.Parse(target)
		if u.Query().Get("client") != "delta-planet" || u.Query().Get("page") != page || u.Query().Get("lang") != "en" {
			t.Fatalf("route changed: %s", target)
		}
	}
}


func TestArielFishDirectRouteDoesNotFallBackToAroma(t *testing.T) {
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("X-Test-Client", r.URL.Query().Get("client"))
		_, _ = w.Write([]byte("<html><head></head><body>Ariel Fish Navigator</body></html>"))
	}))
	defer backend.Close()
	target, _ := url.Parse(backend.URL)
	previous := authProxy
	authProxy = httputil.NewSingleHostReverseProxy(target)
	authProxy.ModifyResponse = scopeDashboardResponse
	defer func() { authProxy = previous }()
	for _, route := range []string{"/ariel-fish", "/ariel-fish.html", "/ariel-fish/?page=competition"} {
		rec := httptest.NewRecorder()
		navigatorGateway(rec, httptest.NewRequest(http.MethodGet, route, nil))
		if rec.Code != http.StatusOK {
			t.Fatalf("%s returned %d (expected dashboard, not redirect)", route, rec.Code)
		}
		if rec.Header().Get("X-Test-Client") != "ariel-fish" {
			t.Fatalf("%s selected client %q, not ariel-fish", route, rec.Header().Get("X-Test-Client"))
		}
		body := rec.Body.String()
		if !strings.Contains(body, `window.BLIS_CLIENT_SCOPE="ariel-fish"`) || !strings.Contains(body, `window.BLIS_INITIAL_CLIENT="ariel-fish"`) {
			t.Fatalf("%s missing enforced Ariel Fish identity: %s", route, body)
		}
	}
}

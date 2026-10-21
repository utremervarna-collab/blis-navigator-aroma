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

package main

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

const legacyClientRememberCookieName = "blis_client_remember"
const adminClientCookieName = "blis_admin_client"
const publicDemoCookieName = "blis_public_demo"
const navigatorMagicHash = "570e6c3609ca756feee15aabe6cb6f9a3d26607a4f279611f4bbca5d5ced1705"

func validNavigatorClient(slug string) bool {
	switch strings.TrimSpace(slug) {
	case "aroma", "bolyarka", "astor-garden", "varna-towers", "mollox":
		return true
	default:
		return false
	}
}

func navigatorDashboardTarget(r *http.Request) string {
	slug := strings.TrimSpace(r.URL.Query().Get("client"))
	if !validNavigatorClient(slug) {
		if c, err := r.Cookie(adminClientCookieName); err == nil && validNavigatorClient(c.Value) {
			slug = c.Value
		}
	}
	if !validNavigatorClient(slug) {
		slug = "aroma"
	}
	return "/dashboard.html?client=" + url.QueryEscape(slug) + "&page=overview"
}

// Commerce is an owner/admin workspace. Catalogue pages, code and artwork are
// deliberately unavailable to anonymous visitors and client sessions.
func commerceOwnerOnlyPath(path string) bool {
	path = strings.TrimSpace(path)
	return path == "/services.html" || path == "/services" ||
		strings.HasPrefix(path, "/navigator-commerce-") ||
		strings.HasPrefix(path, "/service-cards/") ||
		path == "/service-cards-v10.zip"
}

// Bootstrap exactly one public gateway in front of the internal Navigator engine.
// The gateway keeps the existing client access rules, but the main Navigator has
// its own explicit admin entry and never restores a remembered client profile.
func init() {
	if os.Getenv("BLIS_AUTH_PROXY_DISABLED") == "1" || os.Getenv("BLIS_NAVIGATOR_GATEWAY_BOOTSTRAPPED") == "1" {
		return
	}

	external := strings.TrimSpace(os.Getenv("PORT"))
	if external == "" {
		external = "10000"
	}
	p, err := strconv.Atoi(external)
	if err != nil || p <= 0 || p >= 65534 {
		return
	}
	internal := strconv.Itoa(p + 1)

	os.Setenv("BLIS_NAVIGATOR_GATEWAY_BOOTSTRAPPED", "1")
	os.Setenv("BLIS_AUTH_PROXY_DISABLED", "1")
	authExternalPort = external
	authInternalPort = internal
	os.Setenv("PORT", internal)

	target, _ := url.Parse("http://127.0.0.1:" + internal)
	authProxy = httputil.NewSingleHostReverseProxy(target)
	authProxy.ModifyResponse = scopeDashboardResponse
	authProxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		http.Error(w, "BLIS Navigator временно се зарежда. Опитайте отново след няколко секунди.", http.StatusServiceUnavailable)
	}

	go func() {
		log.Printf("BLIS Navigator gateway listening on 0.0.0.0:%s -> 127.0.0.1:%s", external, internal)
		if err := http.ListenAndServe("0.0.0.0:"+external, http.HandlerFunc(navigatorGateway)); err != nil {
			log.Printf("BLIS Navigator gateway stopped: %v", err)
		}
	}()
}

func navigatorMagicOK(got string) bool {
	got = strings.TrimSpace(got)
	if got == "" {
		return false
	}
	sum := sha256.Sum256([]byte(got))
	expected, err := hex.DecodeString(navigatorMagicHash)
	if err != nil || len(expected) != len(sum) {
		return false
	}
	return subtle.ConstantTimeCompare(sum[:], expected) == 1
}

func clearLegacyClientRememberCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name: legacyClientRememberCookieName, Value: "", Path: "/", HttpOnly: true,
		Secure: secureRequest(r), SameSite: http.SameSiteLaxMode,
		MaxAge: -1, Expires: time.Unix(0, 0),
	})
}

func setPublicDemoCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: publicDemoCookieName, Value: "wirello", Path: "/", HttpOnly: true, Secure: secureRequest(r), SameSite: http.SameSiteLaxMode, MaxAge: 60 * 60 * 8})
}

func clearPublicDemoCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: publicDemoCookieName, Value: "", Path: "/", HttpOnly: true, Secure: secureRequest(r), SameSite: http.SameSiteLaxMode, MaxAge: -1, Expires: time.Unix(0, 0)})
}

func isWirelloDemo(r *http.Request) bool {
	c, err := r.Cookie(publicDemoCookieName)
	return err == nil && c.Value == "wirello"
}

func navigatorGateway(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	// Wirello Market is the isolated public demonstration profile. It bypasses
	// client login but remains scoped to a single fictional dataset.
	if path == "/wirello" || path == "/wirello/" || path == "/wirello-master-demo.html" {
		clearSession(w, r)
		setPublicDemoCookie(w, r)
		r2 := r.Clone(r.Context())
		r2.URL.Path = "/dashboard.html"
		q := r2.URL.Query()
		q.Set("client", "wirello")
		if q.Get("page") == "" { q.Set("page", "overview") }
		r2.URL.RawQuery = q.Encode()
		r2.Header.Set("X-BLIS-Client-Scope", "wirello")
		authProxy.ServeHTTP(w, r2)
		return
	}

	if isWirelloDemo(r) {
		if path == "/api/clients" {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Header().Set("Cache-Control", "no-store")
			_, _ = w.Write([]byte(`[{"slug":"wirello","name":"Wirello Market","sector":"Търговска верига / модерен ритейл","note":"Публичен демо профил"}]`))
			return
		}
		if strings.HasPrefix(path, "/api/clients/") && !strings.HasPrefix(path, "/api/clients/wirello/") {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusForbidden)
			_, _ = w.Write([]byte(`{"error":"Публичното демо е ограничено до Wirello Market"}`))
			return
		}
		if path == "/dashboard.html" {
			http.Redirect(w, r, "/wirello", http.StatusFound)
			return
		}
	}

	if path == "/client-login" || path == "/client-login/" || path == "/login" || path == "/navigator" || path == "/navigator/" || path == "/owner-access" {
		clearPublicDemoCookie(w, r)
	}

	// Services & Payment belongs only to the owner/admin session. A public URL or
	// a normal client login receives a 404, including direct attempts to load its
	// JS/CSS/card assets.
	if commerceOwnerOnlyPath(path) {
		s, ok := sessionFromRequest(r)
		if !ok || !s.Admin {
			http.NotFound(w, r)
			return
		}
	}

	// The main Navigator is intentionally separate from every client profile.
	// A valid existing admin session opens it directly. Otherwise the protected
	// Navigator magic link creates a fresh owner session.
	if path == "/navigator" || path == "/navigator/" {
		clearLegacyClientRememberCookie(w, r)

		if s, ok := sessionFromRequest(r); ok && s.Admin {
			http.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
			return
		}

		if !navigatorMagicOK(r.URL.Query().Get("key")) {
			clearSession(w, r)
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte("<!doctype html><html lang=\"bg\"><meta charset=\"utf-8\"><title>BLIS Navigator</title><body style=\"font-family:Inter,Arial,sans-serif;background:#f7f9fc;color:#17324c;display:grid;place-items:center;min-height:100vh;margin:0\"><div style=\"text-align:center\"><h1>BLIS Navigator</h1><p>Използвайте вашия защитен Navigator линк за вход.</p></div></body></html>"))
			return
		}

		// A client session must never leak into the main Navigator.
		clearSession(w, r)
		s, err := newOwnerSession()
		if err != nil {
			http.Error(w, "Неуспешно създаване на Navigator сесия", http.StatusInternalServerError)
			return
		}
		setSessionCookie(w, r, s)
		http.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
		return
	}

	// Explicit client logout also removes the obsolete remember cookie created by
	// the previous gateway implementation.
	if path == "/api/client-logout" {
		clearLegacyClientRememberCookie(w, r)
	}

	// All normal client behaviour remains handled by the original gateway logic.
	// There is deliberately no automatic client-session restoration here.
	clientGateway(w, r)
}

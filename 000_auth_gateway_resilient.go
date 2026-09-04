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
	case "aroma", "bolyarka", "astor-garden", "varna-towers", "mollox", "wirello", "everbet", "kub":
		return true
	default:
		return false
	}
}

func canonicalNavigatorPage(page string) string {
	switch strings.TrimSpace(strings.ToLower(page)) {
	case "overview", "social", "market", "digital", "reputation", "competition", "opportunities", "history", "reports":
		return strings.TrimSpace(strings.ToLower(page))
	case "signals":
		return "social"
	case "timeline":
		return "history"
	case "live":
		return "overview"
	default:
		return "overview"
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

	q := url.Values{}
	q.Set("client", slug)
	q.Set("page", canonicalNavigatorPage(r.URL.Query().Get("page")))
	if strings.EqualFold(strings.TrimSpace(r.URL.Query().Get("lang")), "en") {
		q.Set("lang", "en")
	}
	return "/dashboard.html?" + q.Encode()
}

func commerceOwnerOnlyPath(path string) bool {
	path = strings.TrimSpace(path)
	return path == "/service-cards-v10.zip"
}

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

func ensureOwnerDashboardSession(w http.ResponseWriter, r *http.Request) bool {
	if s, ok := sessionFromRequest(r); ok && s.Admin {
		return true
	}
	clearSession(w, r)
	clearLegacyClientRememberCookie(w, r)
	clearPublicDemoCookie(w, r)
	s, err := newOwnerSession()
	if err != nil {
		http.Error(w, "Неуспешно създаване на Navigator сесия", http.StatusInternalServerError)
		return false
	}
	setSessionCookie(w, r, s)
	return true
}

func navigatorGateway(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	// KUB is a first-class Navigator client. Route it through the normal dashboard
	// flow instead of special static-page handlers, which caused stale Loading
	// placeholders and disconnected monitoring state.
	if path == "/kub" || path == "/kub/" || path == "/kub-home.html" || path == "/kub-crisis.html" {
		if !ensureOwnerDashboardSession(w, r) {
			return
		}
		q := r.URL.Query()
		q.Set("client", "kub")
		if q.Get("page") == "" {
			q.Set("page", "overview")
		}
		r2 := r.Clone(r.Context())
		r2.URL.Path = "/dashboard.html"
		r2.URL.RawQuery = q.Encode()
		authProxy.ServeHTTP(w, r2)
		return
	}

	if path == "/services" {
		http.Redirect(w, r, "/services.html", http.StatusMovedPermanently)
		return
	}

	if path == "/client-login" || path == "/client-login/" || path == "/login" || path == "/client-access.html" {
		if !ensureOwnerDashboardSession(w, r) {
			return
		}
		http.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
		return
	}

	if path == "/wirello" || path == "/wirello/" || path == "/wirello-master-demo.html" {
		clearSession(w, r)
		setPublicDemoCookie(w, r)
		r2 := r.Clone(r.Context())
		r2.URL.Path = "/dashboard.html"
		q := r2.URL.Query()
		q.Set("client", "wirello")
		if q.Get("page") == "" {
			q.Set("page", "overview")
		}
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

	if path == "/dashboard.html" || path == "/navigator-v2.html" {
		if s, ok := sessionFromRequest(r); !ok || !s.Admin {
			if !ensureOwnerDashboardSession(w, r) {
				return
			}
			http.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
			return
		}
	}

	if path == "/navigator" || path == "/navigator/" || path == "/owner-access" {
		clearPublicDemoCookie(w, r)
	}

	if commerceOwnerOnlyPath(path) {
		s, ok := sessionFromRequest(r)
		if !ok || !s.Admin {
			http.NotFound(w, r)
			return
		}
	}

	if path == "/navigator" || path == "/navigator/" {
		clearLegacyClientRememberCookie(w, r)

		if s, ok := sessionFromRequest(r); ok && s.Admin {
			http.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
			return
		}

		if !navigatorMagicOK(r.URL.Query().Get("key")) {
			if !ensureOwnerDashboardSession(w, r) {
				return
			}
			http.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
			return
		}

		if !ensureOwnerDashboardSession(w, r) {
			return
		}
		http.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
		return
	}

	if path == "/api/client-logout" {
		clearLegacyClientRememberCookie(w, r)
	}

	clientGateway(w, r)
}

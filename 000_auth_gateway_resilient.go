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
const navigatorMagicHash = "570e6c3609ca756feee15aabe6cb6f9a3d26607a4f279611f4bbca5d5ced1705"

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

func navigatorGateway(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	// The main Navigator is intentionally separate from every client profile.
	// A valid existing admin session opens it directly. Otherwise the protected
	// Navigator magic link creates a fresh owner session.
	if path == "/navigator" || path == "/navigator/" {
		clearLegacyClientRememberCookie(w, r)

		if s, ok := sessionFromRequest(r); ok && s.Admin {
			http.Redirect(w, r, "/dashboard.html?client=aroma&page=overview", http.StatusFound)
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
		http.Redirect(w, r, "/dashboard.html?client=aroma&page=overview", http.StatusFound)
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

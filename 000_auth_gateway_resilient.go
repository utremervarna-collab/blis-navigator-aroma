package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

const resilientRememberCookieName = "blis_client_remember"
const resilientRememberVersion = "r1"

// This file intentionally sorts before auth_proxy.go. It boots the same gateway
// one port in front of the Navigator engine, then disables the legacy gateway
// init so there is exactly one external listener.
func init() {
	if os.Getenv("BLIS_AUTH_PROXY_DISABLED") == "1" || os.Getenv("BLIS_RESILIENT_GATEWAY_BOOTSTRAPPED") == "1" {
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

	// Prevent auth_proxy.go from starting a second listener. The Navigator engine
	// must still bind to the internal port.
	os.Setenv("BLIS_RESILIENT_GATEWAY_BOOTSTRAPPED", "1")
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
		log.Printf("BLIS resilient client gateway listening on 0.0.0.0:%s -> 127.0.0.1:%s", external, internal)
		if err := http.ListenAndServe("0.0.0.0:"+external, http.HandlerFunc(resilientClientGateway)); err != nil {
			log.Printf("BLIS resilient client gateway stopped: %v", err)
		}
	}()
}

func resilientRememberToken(a clientAccount) (string, time.Time) {
	expires := time.Now().Add(30 * 24 * time.Hour)
	base := strings.Join([]string{resilientRememberVersion, a.Username, a.ClientSlug, strconv.FormatInt(expires.Unix(), 10)}, "|")
	key := sessionSecret() + "|remember|" + a.PasswordHash
	return base + "|" + sessionMAC(base, key), expires
}

func setResilientRememberCookie(w http.ResponseWriter, r *http.Request, a clientAccount) {
	token, expires := resilientRememberToken(a)
	maxAge := int(time.Until(expires).Seconds())
	if maxAge < 1 {
		maxAge = 1
	}
	http.SetCookie(w, &http.Cookie{
		Name:     resilientRememberCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureRequest(r),
		SameSite: http.SameSiteLaxMode,
		Expires:  expires,
		MaxAge:   maxAge,
	})
}

func clearResilientRememberCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name: resilientRememberCookieName, Value: "", Path: "/", HttpOnly: true,
		Secure: secureRequest(r), SameSite: http.SameSiteLaxMode,
		MaxAge: -1, Expires: time.Unix(0, 0),
	})
}

func resilientRememberAccount(r *http.Request) (clientAccount, bool) {
	c, err := r.Cookie(resilientRememberCookieName)
	if err != nil || c.Value == "" {
		return clientAccount{}, false
	}
	parts := strings.Split(c.Value, "|")
	if len(parts) != 5 || parts[0] != resilientRememberVersion {
		return clientAccount{}, false
	}
	username, slug := parts[1], parts[2]
	exp, err := strconv.ParseInt(parts[3], 10, 64)
	if err != nil || time.Now().Unix() >= exp {
		return clientAccount{}, false
	}
	a, ok := clientAccounts[username]
	if !ok || a.ClientSlug != slug {
		return clientAccount{}, false
	}
	base := strings.Join(parts[:4], "|")
	key := sessionSecret() + "|remember|" + a.PasswordHash
	if !validMAC(base, key, parts[4]) {
		return clientAccount{}, false
	}
	return a, true
}

func replaceRequestSessionCookie(r *http.Request, token string) {
	cookies := r.Cookies()
	r.Header.Del("Cookie")
	for _, c := range cookies {
		if c.Name == clientCookieName {
			continue
		}
		r.AddCookie(c)
	}
	r.AddCookie(&http.Cookie{Name: clientCookieName, Value: token})
}

func restoreResilientSession(w http.ResponseWriter, r *http.Request) (clientSession, bool) {
	if s, ok := sessionFromRequest(r); ok {
		return s, true
	}
	a, ok := resilientRememberAccount(r)
	if !ok {
		return clientSession{}, false
	}
	s, err := newClientSession(a)
	if err != nil {
		return clientSession{}, false
	}
	setSessionCookie(w, r, s)
	replaceRequestSessionCookie(r, s.Token)
	return s, true
}

func resilientDashboardURL(s clientSession) string {
	if s.Admin {
		return "/dashboard.html?client=aroma&page=overview"
	}
	return "/dashboard.html?client=" + url.QueryEscape(s.ClientSlug) + "&page=overview"
}

func handleResilientClientLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method", http.StatusMethodNotAllowed)
		return
	}
	if err := r.ParseForm(); err != nil {
		http.Redirect(w, r, "/client-login?error=1", http.StatusFound)
		return
	}
	username := strings.ToLower(strings.TrimSpace(r.FormValue("username")))
	password := r.FormValue("password")
	a, ok := clientAccounts[username]
	if !ok || !passwordOK(a, password) {
		time.Sleep(180 * time.Millisecond)
		q := "/client-login?error=1"
		if ok {
			q = "/client-login?client=" + url.QueryEscape(a.ClientSlug) + "&error=1"
		}
		http.Redirect(w, r, q, http.StatusFound)
		return
	}

	s, err := newClientSession(a)
	if err != nil {
		http.Error(w, "Неуспешно създаване на сесия", http.StatusInternalServerError)
		return
	}
	setSessionCookie(w, r, s)
	setResilientRememberCookie(w, r, a)
	http.Redirect(w, r, resilientDashboardURL(s), http.StatusFound)
}

func resilientClientGateway(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	switch path {
	case "/api/client-login":
		handleResilientClientLogin(w, r)
		return
	case "/api/client-logout":
		clearSession(w, r)
		clearResilientRememberCookie(w, r)
		http.Redirect(w, r, "/", http.StatusFound)
		return
	case "/client-login", "/client-login/", "/login":
		if s, ok := restoreResilientSession(w, r); ok {
			http.Redirect(w, r, resilientDashboardURL(s), http.StatusFound)
			return
		}
		// Do not clear authentication merely because the login page is opened.
		serveClientLogin(w, r)
		return
	case "/owner-access":
		clearResilientRememberCookie(w, r)
	}

	// A signed remember cookie can recreate the short-lived session cookie after
	// a process restart/deploy. Add the restored session to this request too so
	// the existing scoping logic sees it immediately.
	_, _ = restoreResilientSession(w, r)
	clientGateway(w, r)
}

package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

type clientAccount struct {
	Username     string
	PasswordHash string
	ClientSlug   string
	ClientName   string
	Sector       string
}

type clientSession struct {
	Token      string
	ClientSlug string
	Username   string
	Admin      bool
	ExpiresAt  time.Time
}

var clientAccounts = map[string]clientAccount{
	"bolyarka": {
		Username:     "bolyarka",
		PasswordHash: "1fb075d7042283bb1f60e116c47fbc1647dbfe2e01d6d2be72cc8c7d4c62289d",
		ClientSlug:   "bolyarka",
		ClientName:   "Болярка ВТ АД",
		Sector:       "Пивоварна компания",
	},
	"varna.towers": {
		Username:     "varna.towers",
		PasswordHash: "44a451365e68e2f8ebd9bf246268fa8c85ee3581fb10e6a295e45c0621c02ecd",
		ClientSlug:   "varna-towers",
		ClientName:   "Varna Towers",
		Sector:       "Бизнес център / недвижими имоти",
	},
}

var authProxy *httputil.ReverseProxy
var authExternalPort string
var authInternalPort string

const clientCookieName = "blis_client_session"
const clientHashPrefix = "blis-client-v1|"
const ownerHashPrefix = "blis-owner-v1|"
const ownerAccessHash = "464e29c18c1cfc4d7061965f0d1a7f59661a97f17cc59f26b92ea0694abbd3a9"
const sessionVersion = "v2"

func init() {
	if os.Getenv("BLIS_AUTH_PROXY_DISABLED") == "1" {
		return
	}
	authExternalPort = strings.TrimSpace(os.Getenv("PORT"))
	if authExternalPort == "" {
		authExternalPort = "10000"
	}
	p, err := strconv.Atoi(authExternalPort)
	if err != nil || p <= 0 || p >= 65534 {
		return
	}
	authInternalPort = strconv.Itoa(p + 1)
	os.Setenv("PORT", authInternalPort)

	target, _ := url.Parse("http://127.0.0.1:" + authInternalPort)
	authProxy = httputil.NewSingleHostReverseProxy(target)
	authProxy.ModifyResponse = scopeDashboardResponse
	authProxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		http.Error(w, blisLocalized(r, "BLIS Navigator временно се зарежда. Опитайте отново след няколко секунди.", "BLIS Navigator is temporarily loading. Please try again in a few seconds."), http.StatusServiceUnavailable)
	}

	go func() {
		log.Printf("BLIS client access gateway listening on 0.0.0.0:%s -> 127.0.0.1:%s", authExternalPort, authInternalPort)
		if err := http.ListenAndServe("0.0.0.0:"+authExternalPort, http.HandlerFunc(clientGateway)); err != nil {
			log.Printf("BLIS client access gateway stopped: %v", err)
		}
	}()
}

func passwordOK(a clientAccount, password string) bool {
	sum := sha256.Sum256([]byte(clientHashPrefix + a.Username + "|" + password))
	expected, err := hex.DecodeString(a.PasswordHash)
	if err != nil || len(expected) != len(sum) {
		return false
	}
	return subtle.ConstantTimeCompare(sum[:], expected) == 1
}

func ownerTokenOK(token string) bool {
	if token == "" {
		return false
	}
	sum := sha256.Sum256([]byte(ownerHashPrefix + token))
	expected, err := hex.DecodeString(ownerAccessHash)
	if err != nil || len(expected) != len(sum) {
		return false
	}
	return subtle.ConstantTimeCompare(sum[:], expected) == 1
}

func sessionSecret() string {
	if s := strings.TrimSpace(os.Getenv("BLIS_SESSION_SECRET")); s != "" {
		return s
	}
	return ownerAccessHash
}

func sessionMAC(payload, key string) string {
	m := hmac.New(sha256.New, []byte(key))
	_, _ = m.Write([]byte(payload))
	return hex.EncodeToString(m.Sum(nil))
}

func validMAC(payload, key, got string) bool {
	expected, err1 := hex.DecodeString(sessionMAC(payload, key))
	actual, err2 := hex.DecodeString(got)
	if err1 != nil || err2 != nil || len(expected) != len(actual) {
		return false
	}
	return subtle.ConstantTimeCompare(expected, actual) == 1
}

func newClientSession(a clientAccount) (clientSession, error) {
	expires := time.Now().Add(30 * 24 * time.Hour)
	base := strings.Join([]string{sessionVersion, "client", a.Username, a.ClientSlug, strconv.FormatInt(expires.Unix(), 10)}, "|")
	key := sessionSecret() + "|client|" + a.PasswordHash
	token := base + "|" + sessionMAC(base, key)
	return clientSession{Token: token, ClientSlug: a.ClientSlug, Username: a.Username, Admin: false, ExpiresAt: expires}, nil
}

func newOwnerSession() (clientSession, error) {
	expires := time.Now().Add(30 * 24 * time.Hour)
	base := strings.Join([]string{sessionVersion, "owner", strconv.FormatInt(expires.Unix(), 10)}, "|")
	key := sessionSecret() + "|owner|" + ownerAccessHash
	token := base + "|" + sessionMAC(base, key)
	return clientSession{Token: token, Username: "owner", Admin: true, ExpiresAt: expires}, nil
}

func sessionFromRequest(r *http.Request) (clientSession, bool) {
	c, err := r.Cookie(clientCookieName)
	if err != nil || c.Value == "" {
		return clientSession{}, false
	}
	parts := strings.Split(c.Value, "|")
	if len(parts) < 4 || parts[0] != sessionVersion {
		return clientSession{}, false
	}
	if parts[1] == "owner" && len(parts) == 4 {
		exp, err := strconv.ParseInt(parts[2], 10, 64)
		if err != nil || time.Now().Unix() >= exp {
			return clientSession{}, false
		}
		base := strings.Join(parts[:3], "|")
		if !validMAC(base, sessionSecret()+"|owner|"+ownerAccessHash, parts[3]) {
			return clientSession{}, false
		}
		return clientSession{Token: c.Value, Username: "owner", Admin: true, ExpiresAt: time.Unix(exp, 0)}, true
	}
	if parts[1] == "client" && len(parts) == 6 {
		username, clientSlug := parts[2], parts[3]
		exp, err := strconv.ParseInt(parts[4], 10, 64)
		if err != nil || time.Now().Unix() >= exp {
			return clientSession{}, false
		}
		a, ok := clientAccounts[username]
		if !ok || a.ClientSlug != clientSlug {
			return clientSession{}, false
		}
		base := strings.Join(parts[:5], "|")
		if !validMAC(base, sessionSecret()+"|client|"+a.PasswordHash, parts[5]) {
			return clientSession{}, false
		}
		return clientSession{Token: c.Value, ClientSlug: clientSlug, Username: username, Admin: false, ExpiresAt: time.Unix(exp, 0)}, true
	}
	return clientSession{}, false
}

func secureRequest(r *http.Request) bool {
	return strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") || strings.HasSuffix(strings.ToLower(r.Host), ".onrender.com")
}

func setSessionCookie(w http.ResponseWriter, r *http.Request, s clientSession) {
	maxAge := int(time.Until(s.ExpiresAt).Seconds())
	if maxAge < 1 {
		maxAge = 1
	}
	http.SetCookie(w, &http.Cookie{
		Name:     clientCookieName,
		Value:    s.Token,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureRequest(r),
		SameSite: http.SameSiteLaxMode,
		Expires:  s.ExpiresAt,
		MaxAge:   maxAge,
	})
}

func clearSession(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: clientCookieName, Value: "", Path: "/", HttpOnly: true, Secure: secureRequest(r), MaxAge: -1, Expires: time.Unix(0, 0), SameSite: http.SameSiteLaxMode})
}

func accountForSession(s clientSession) (clientAccount, bool) {
	if s.Admin {
		return clientAccount{}, false
	}
	for _, a := range clientAccounts {
		if a.ClientSlug == s.ClientSlug && a.Username == s.Username {
			return a, true
		}
	}
	return clientAccount{}, false
}

func accountForSlug(slug string) (clientAccount, bool) {
	for _, a := range clientAccounts {
		if a.ClientSlug == slug {
			return a, true
		}
	}
	return clientAccount{}, false
}

func clientGateway(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	switch path {
	case "/owner-access":
		if r.Method != http.MethodGet || !ownerTokenOK(r.URL.Query().Get("key")) {
			http.NotFound(w, r)
			return
		}
		clearSession(w, r)
		s, err := newOwnerSession()
		if err != nil {
			http.Error(w, blisLocalized(r, "Неуспешно създаване на администраторска сесия", "Could not create administrator session"), http.StatusInternalServerError)
			return
		}
		setSessionCookie(w, r, s)
		http.Redirect(w, r, "/dashboard.html?client=aroma&page=overview", http.StatusFound)
		return
	case "/client-login", "/client-login/", "/login":
		// Visiting the login URL must not destroy an already valid session.
		// This protects normal browser tab restore and Render deploy/restart flows.
		if s, ok := sessionFromRequest(r); ok {
			if s.Admin {
				http.Redirect(w, r, "/dashboard.html?client=aroma&page=overview", http.StatusFound)
			} else {
				http.Redirect(w, r, "/dashboard.html?client="+url.QueryEscape(s.ClientSlug)+"&page=overview", http.StatusFound)
			}
			return
		}
		serveClientLogin(w, r)
		return
	case "/api/client-login":
		handleClientLogin(w, r)
		return
	case "/api/client-logout":
		clearSession(w, r)
		http.Redirect(w, r, "/", http.StatusFound)
		return
	case "/api/client-session":
		s, ok := sessionFromRequest(r)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]interface{}{"authenticated": false})
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		if s.Admin {
			json.NewEncoder(w).Encode(map[string]interface{}{"authenticated": true, "admin": true, "username": s.Username})
			return
		}
		a, _ := accountForSession(s)
		json.NewEncoder(w).Encode(map[string]interface{}{"authenticated": true, "admin": false, "client_slug": s.ClientSlug, "client_name": a.ClientName, "username": s.Username})
		return
	}

	s, loggedIn := sessionFromRequest(r)

	if path == "/dashboard.html" || path == "/navigator-v2.html" {
		if !loggedIn {
			next := url.QueryEscape(path)
			http.Redirect(w, r, "/client-login?next="+next, http.StatusFound)
			return
		}
		if !s.Admin {
			if r.URL.Query().Get("client") != s.ClientSlug {
				http.Redirect(w, r, "/dashboard.html?client="+url.QueryEscape(s.ClientSlug)+"&page=overview", http.StatusFound)
				return
			}
			r.Header.Set("X-BLIS-Client-Scope", s.ClientSlug)
		} else if r.URL.Query().Get("client") == "" {
			http.Redirect(w, r, "/dashboard.html?client=aroma&page=overview", http.StatusFound)
			return
		}
	}

	if loggedIn && !s.Admin && path == "/api/clients" {
		a, _ := accountForSession(s)
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		json.NewEncoder(w).Encode([]map[string]string{{"slug": a.ClientSlug, "name": a.ClientName, "sector": a.Sector, "note": blisLocalized(r, "Защитен клиентски профил", "Secure client profile")}})
		return
	}

	if loggedIn && !s.Admin && strings.HasPrefix(path, "/api/clients/") {
		rest := strings.TrimPrefix(path, "/api/clients/")
		slug := strings.Split(rest, "/")[0]
		if slug != "" && slug != s.ClientSlug {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]interface{}{"error": blisLocalized(r, "Достъпът е ограничен до клиентския профил", "Access is restricted to the client profile"), "client": s.ClientSlug})
			return
		}
	}

	if authProxy == nil {
		http.Error(w, "Gateway unavailable", http.StatusServiceUnavailable)
		return
	}
	authProxy.ServeHTTP(w, r)
}

func handleClientLogin(w http.ResponseWriter, r *http.Request) {
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
	if !ok {
		time.Sleep(180 * time.Millisecond)
		http.Redirect(w, r, "/client-login?error=1", http.StatusFound)
		return
	}
	if !passwordOK(a, password) {
		time.Sleep(180 * time.Millisecond)
		http.Redirect(w, r, "/client-login?client="+url.QueryEscape(a.ClientSlug)+"&error=1", http.StatusFound)
		return
	}
	s, err := newClientSession(a)
	if err != nil {
		http.Error(w, blisLocalized(r, "Неуспешно създаване на сесия", "Could not create session"), http.StatusInternalServerError)
		return
	}
	setSessionCookie(w, r, s)
	http.Redirect(w, r, "/dashboard.html?client="+url.QueryEscape(a.ClientSlug)+"&page=overview", http.StatusFound)
}

func serveClientLogin(w http.ResponseWriter, r *http.Request) {
	errMsg := ""
	if r.URL.Query().Get("error") != "" {
		errMsg = `<div class="error">Невалидно потребителско име или парола.</div>`
	}

	prefill := ""
	readonly := ""
	clientTag := ""
	if a, ok := accountForSlug(strings.TrimSpace(r.URL.Query().Get("client"))); ok {
		prefill = a.Username
		readonly = " readonly"
		clientTag = `<div class="clienttag"><span>Клиентски профил</span><b>` + a.ClientName + `</b></div>`
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	_, _ = w.Write(injectBLISI18N([]byte(`<!doctype html><html lang="bg"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BLIS Navigator — Клиентски вход</title><style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,Segoe UI,Arial,sans-serif;background:#f6f8fb;color:#17324c}body{min-height:100vh;display:grid;place-items:center;padding:28px;background:linear-gradient(135deg,#fff 0%,#f5f8fb 65%,#eef3f7 100%)}.wrap{width:min(100%,430px)}.brand{text-align:center;margin-bottom:26px}.brand strong{display:block;font:600 38px/1 Georgia,serif;color:#153652}.brand span{display:block;margin-top:8px;font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#708095}.card{background:#fff;border:1px solid #e0e6ec;border-radius:18px;padding:34px;box-shadow:0 24px 70px rgba(20,48,73,.12)}h1{font:500 28px/1.15 Georgia,serif;margin:0 0 8px;color:#153652}.sub{font-size:12px;line-height:1.55;color:#718196;margin:0 0 20px}.clienttag{display:flex;align-items:center;justify-content:space-between;gap:16px;border:1px solid #dfe7ee;background:#f7fafc;border-radius:9px;padding:11px 12px;margin:0 0 18px}.clienttag span{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#7b8998}.clienttag b{font-size:12px;color:#153652}.field{margin:0 0 15px}.field label{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#52677b;margin-bottom:7px}.field input{width:100%;height:48px;border:1px solid #d7e0e8;border-radius:9px;padding:0 13px;font-size:14px;outline:none;background:#fff;color:#17324c}.field input[readonly]{background:#f5f7f9;color:#52677b}.field input:focus{border-color:#2e6f9d;box-shadow:0 0 0 3px rgba(46,111,157,.10)}button{width:100%;height:50px;border:0;border-radius:9px;background:#153652;color:#fff;font-weight:800;cursor:pointer;margin-top:4px}button:hover{background:#1d4769}.error{background:#fff1f1;border:1px solid #f0cccc;color:#a23e3e;padding:10px 12px;border-radius:8px;font-size:11px;margin-bottom:15px}.back{display:block;text-align:center;margin-top:18px;color:#60788c;font-size:11px;text-decoration:none}.lock{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:20px;color:#8593a1;font-size:9px}.lock i{width:6px;height:6px;border-radius:50%;background:#53a978}</style></head><body><div class="wrap"><div class="brand"><strong>BLIS™</strong><span>Brand Lab Intelligence System</span></div><div class="card"><h1>Клиентски вход</h1><p class="sub">Влезте в защитения профил на вашата организация в BLIS Navigator.</p>` + clientTag + errMsg + `<form method="post" action="/api/client-login" autocomplete="on"><div class="field"><label for="username">Потребителско име</label><input id="username" name="username" type="text" value="` + prefill + `" autocomplete="username" required` + readonly + `></div><div class="field"><label for="password">Парола</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus></div><button type="submit">Вход в Navigator</button></form><div class="lock"><i></i> Защитена клиентска сесия</div></div><a class="back" href="/">← Към началната страница</a></div></body></html>`)))
}

func scopeDashboardResponse(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
		return nil
	}
	scope := resp.Request.Header.Get("X-BLIS-Client-Scope")
	if scope == "" {
		return nil
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	resp.Body.Close()

	early := fmt.Sprintf(`<script>window.BLIS_CLIENT_SCOPE=%q;window.BLIS_INITIAL_CLIENT=%q;</script><style>.client-switch-chevron,.client-switch-menu{display:none!important}.client-switch-button{cursor:default!important}.client-switch-button:hover{transform:none!important}</style>`, scope, scope)
	late := fmt.Sprintf(`<script>(function(){const scope=%q;function lock(){const s=document.getElementById('clientSel');if(s){[...s.options].forEach(o=>{if(o.value!==scope)o.remove()});s.value=scope;s.disabled=true;}document.querySelectorAll('.client-option').forEach(o=>{if(o.dataset.clientKey!==scope)o.remove();});const btn=document.querySelector('.client-switch-button');if(btn){btn.setAttribute('aria-expanded','false');btn.style.pointerEvents='none';}try{if(typeof slug!=='undefined'&&slug!==scope){slug=scope;window.load&&window.load();}}catch(e){}if(!document.getElementById('blisClientLogout')){const top=document.querySelector('.toptools')||document.querySelector('.topbar');if(top){const a=document.createElement('a');a.id='blisClientLogout';a.href='/api/client-logout';a.textContent='Изход';a.style.cssText='height:40px;display:inline-flex;align-items:center;padding:0 13px;border:1px solid #d8e0e7;border-radius:8px;background:#fff;color:#17324c;text-decoration:none;font-size:11px;font-weight:750;margin-left:8px';top.appendChild(a);}}}lock();setTimeout(lock,250);setTimeout(lock,900);})();</script>`, scope)

	body = bytes.Replace(body, []byte("</head>"), []byte(early+"</head>"), 1)
	body = bytes.Replace(body, []byte("</body>"), []byte(late+"</body>"), 1)
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	return nil
}

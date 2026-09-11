from pathlib import Path

GATEWAY = Path("000_auth_gateway_resilient.go")
UI = Path("static/navigator-client-ui.js")

# 1) Open read-only Navigator routes before legacy scoped/login branches.
s = GATEWAY.read_text(encoding="utf-8")
marker = "// PUBLIC_FULL_DASHBOARD_V1"
if marker not in s:
    anchor = "\t// Black Sea Center remains owner-only; migration must not mint an owner session from a public URL.\n"
    if anchor not in s:
        raise SystemExit("gateway anchor not found")
    block = '''\t// PUBLIC_FULL_DASHBOARD_V1
\t// Public Navigator: dashboard and read APIs are accessible without a login.
\t// KUB keeps its dedicated crisis route; admin and mutation routes are not opened here.
\tif path == "/navigator" || path == "/navigator/" {
\t\tclearPublicDemoCookie(w, r)
\t\tclearBscScopeCookie(w, r)
\t\tclearLegacyClientRememberCookie(w, r)
\t\thttp.Redirect(w, r, navigatorDashboardTarget(r), http.StatusFound)
\t\treturn
\t}
\tif (path == "/black-sea-center" || path == "/black-sea-center/" || path == "/black-sea-center-home.html") && (r.Method == http.MethodGet || r.Method == http.MethodHead) {
\t\tclearPublicDemoCookie(w, r)
\t\tclearBscScopeCookie(w, r)
\t\tclearLegacyClientRememberCookie(w, r)
\t\thttp.Redirect(w, r, "/dashboard.html?client=black-sea-center&page=overview", http.StatusFound)
\t\treturn
\t}
\tif (path == "/wirello" || path == "/wirello/" || path == "/wirello-master-demo.html") && (r.Method == http.MethodGet || r.Method == http.MethodHead) {
\t\tclearPublicDemoCookie(w, r)
\t\tclearBscScopeCookie(w, r)
\t\thttp.Redirect(w, r, "/dashboard.html?client=wirello&page=overview", http.StatusFound)
\t\treturn
\t}
\tif (path == "/dashboard.html" || path == "/navigator-v2.html") && (r.Method == http.MethodGet || r.Method == http.MethodHead) {
\t\tclearPublicDemoCookie(w, r)
\t\tclearBscScopeCookie(w, r)
\t\tr2 := r.Clone(r.Context())
\t\tr2.URL.Path = "/dashboard.html"
\t\tq := r2.URL.Query()
\t\tif !validNavigatorClient(strings.TrimSpace(q.Get("client"))) {
\t\t\tq.Set("client", "aroma")
\t\t}
\t\tif q.Get("page") == "" {
\t\t\tq.Set("page", "overview")
\t\t}
\t\tr2.URL.RawQuery = q.Encode()
\t\tr2.Header.Del("X-BLIS-Client-Scope")
\t\tauthProxy.ServeHTTP(w, r2)
\t\treturn
\t}
\tif (r.Method == http.MethodGet || r.Method == http.MethodHead) && (path == "/api/clients" || strings.HasPrefix(path, "/api/clients/")) {
\t\tif authProxy == nil {
\t\t\thttp.Error(w, "Gateway unavailable", http.StatusServiceUnavailable)
\t\t\treturn
\t\t}
\t\tauthProxy.ServeHTTP(w, r)
\t\treturn
\t}

'''
    s = s.replace(anchor, block + anchor, 1)
    GATEWAY.write_text(s, encoding="utf-8")

# 2) Expose every existing client in the dashboard client switcher.
t = UI.read_text(encoding="utf-8")
t = t.replace("visible:false", "visible:true")
t = t.replace(
    "const ownerVisibleOrder=['aroma','bolyarka','mollox'];",
    "const ownerVisibleOrder=['aroma','bolyarka','mollox','wirello','astor-garden','varna-towers','everbet','black-sea-center','kub'];",
)

start = t.find("function visibleOrder(){")
end = t.find("function syncLabels()", start)
if start < 0 or end < 0:
    raise SystemExit("client catalogue function block not found")
replacement = '''function visibleOrder(){return ownerVisibleOrder.slice()}
function selectOrder(){return visibleOrder()}
function ensureSelect(){const sel=document.getElementById('clientSel');if(!sel)return;sel.innerHTML='';for(const k of selectOrder()){const o=document.createElement('option');o.value=k;o.textContent=label(k);sel.appendChild(o)}sel.disabled=false}
function ensureMenu(){const menu=document.querySelector('.client-switch-menu');if(!menu)return;const active=current();menu.innerHTML=visibleOrder().map(k=>`<button type="button" class="client-option${k===active?' active':''}" data-client-key="${k}" role="option" aria-selected="${k===active?'true':'false'}"><span><b>${esc(label(k))}</b><small>${esc(type(k))}</small></span><span class="client-option-check" aria-hidden="true">${k===active?'✓':''}</span></button>`).join('');const btn=document.querySelector('.client-switch-button');menu.style.display='';if(btn)btn.style.pointerEvents=''}
'''
t = t[:start] + replacement + t[end:]

t = t.replace(
    "function toggle(){if(lockedBSC()||(!ownerMode&&!!sessionClient))return;const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');",
    "function toggle(){const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');",
)
t = t.replace(
    "async function select(key){if(!valid(key)||key==='wirello'||(lockedBSC()&&key!=='black-sea-center')||(!ownerMode&&sessionClient&&key!==sessionClient))return;if(ownerMode&&!ownerVisibleOrder.includes(key))return;",
    "async function select(key){if(!valid(key))return;",
)
owner_wirello = '''    if(ownerMode&&current()==='wirello'){
      const u=new URL(location.href);u.pathname='/dashboard.html';u.search='';u.searchParams.set('client','aroma');u.searchParams.set('page','overview');location.replace(u.pathname+u.search);return;
    }
'''
t = t.replace(owner_wirello, "")
UI.write_text(t, encoding="utf-8")

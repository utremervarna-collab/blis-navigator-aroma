#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def replace_once(path,old,new):
    p=ROOT/path
    s=p.read_text(encoding='utf-8')
    if new in s:
        return False
    if old not in s:
        raise SystemExit(f'Expected patch anchor missing in {path}: {old[:100]!r}')
    s=s.replace(old,new,1)
    p.write_text(s,encoding='utf-8')
    print('patched',path)
    return True

def patch_main():
    p=ROOT/'main.go';s=p.read_text(encoding='utf-8');orig=s
    pairs=[
        ('\t\tio.WriteString(w, indexHTML)\n','\t\t_, _ = w.Write(injectBLISI18N([]byte(indexHTML)))\n'),
        ('\t\t\tif path == "dashboard.html" && os.Getenv("BLIS_NAVIGATOR_GATEWAY_BOOTSTRAPPED") != "1" {\n\t\t\t\tb = assembleNavigatorDashboard(b)\n\t\t\t}\n\t\t\tct := http.DetectContentType(b)\n',
         '\t\t\tif path == "dashboard.html" && os.Getenv("BLIS_NAVIGATOR_GATEWAY_BOOTSTRAPPED") != "1" {\n\t\t\t\tb = assembleNavigatorDashboard(b)\n\t\t\t}\n\t\t\tif strings.HasSuffix(path, ".html") {\n\t\t\t\tb = injectBLISI18N(b)\n\t\t\t}\n\t\t\tct := http.DetectContentType(b)\n'),
        ('jsonOut(w, map[string]interface{}{"error": "Невалидна заявка"})','jsonOut(w, map[string]interface{}{"error": blisLocalized(r, "Невалидна заявка", "Invalid request")})'),
        ('jsonOut(w, map[string]interface{}{"error": "Име и валиден имейл са задължителни"})','jsonOut(w, map[string]interface{}{"error": blisLocalized(r, "Име и валиден имейл са задължителни", "Name and a valid email are required")})'),
        ('jsonOut(w, map[string]interface{}{"error": "Заявката не можа да бъде записана"})','jsonOut(w, map[string]interface{}{"error": blisLocalized(r, "Заявката не можа да бъде записана", "The request could not be saved")})'),
        ('title, body := reportContent(c, reportID)','title, body := localizedReportContent(r, c, reportID)'),
    ]
    for old,new in pairs:
        if new in s: continue
        if old not in s: raise SystemExit(f'main.go anchor missing: {old[:120]}')
        s=s.replace(old,new,1)
    old='''\t\tw.Header().Set("Content-Type", "text/html; charset=utf-8")\n\t\tw.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))\n\t\tio.WriteString(w, "<!doctype html><html lang='bg'><meta charset='utf-8'><title>"+title+"</title><style>body{font-family:Segoe UI,Arial,sans-serif;max-width:900px;margin:45px auto;color:#0c2547;line-height:1.55}h1{font-size:28px}h2{font-size:19px;margin-top:28px}small{color:#6f7e92}.box{background:#f7fbff;border-left:4px solid #0e58be;padding:14px 16px;margin:20px 0}</style><body><small>Brand Lab • BLIS™ • Август 2026</small><h1>"+title+"</h1>"+body+"</body></html>")\n'''
    new='''\t\tw.Header().Set("Content-Type", "text/html; charset=utf-8")\n\t\tw.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))\n\t\tdocLang := blisLocalized(r, "bg", "en")\n\t\treportPeriod := blisLocalized(r, "Август 2026", "August 2026")\n\t\t_, _ = io.WriteString(w, "<!doctype html><html lang='"+docLang+"'><meta charset='utf-8'><title>"+title+"</title><style>body{font-family:Segoe UI,Arial,sans-serif;max-width:900px;margin:45px auto;color:#0c2547;line-height:1.55}h1{font-size:28px}h2{font-size:19px;margin-top:28px}small{color:#6f7e92}.box{background:#f7fbff;border-left:4px solid #0e58be;padding:14px 16px;margin:20px 0}</style><body><small>Brand Lab • BLIS™ • "+reportPeriod+"</small><h1>"+title+"</h1>"+body+"</body></html>")\n'''
    if new not in s:
        if old not in s: raise SystemExit('main.go report download anchor missing')
        s=s.replace(old,new,1)
    old='''\t\tcase "reports":\n\t\t\tjsonOut(w, []map[string]string{\n\t\t\t\t{"id": "digital", "title": "Дигитално и съдържателно присъствие", "period": "Август 2026"},\n\t\t\t\t{"id": "reputation", "title": "Репутация и информационна среда", "period": "Август 2026"},\n\t\t\t\t{"id": "signals", "title": "Пазарни сигнали", "period": "Август 2026"},\n\t\t\t\t{"id": "competitive", "title": "Конкурентно позициониране", "period": "Август 2026"},\n\t\t\t\t{"id": "summary", "title": "Месечно обобщение", "period": "Август 2026"},\n\t\t\t})\n\t\t\treturn\n'''
    new='''\t\tcase "reports":\n\t\t\tjsonOut(w, localizedReportList(r))\n\t\t\treturn\n'''
    if new not in s:
        if old not in s: raise SystemExit('main.go report list anchor missing')
        s=s.replace(old,new,1)
    if s!=orig:
        p.write_text(s,encoding='utf-8');print('patched main.go')

def patch_auth():
    p=ROOT/'auth_proxy.go';s=p.read_text(encoding='utf-8');orig=s
    replacements=[
        ('http.Error(w, "BLIS Navigator временно се зарежда. Опитайте отново след няколко секунди.", http.StatusServiceUnavailable)',
         'http.Error(w, blisLocalized(r, "BLIS Navigator временно се зарежда. Опитайте отново след няколко секунди.", "BLIS Navigator is temporarily loading. Please try again in a few seconds."), http.StatusServiceUnavailable)'),
        ('http.Error(w, "Неуспешно създаване на администраторска сесия", http.StatusInternalServerError)',
         'http.Error(w, blisLocalized(r, "Неуспешно създаване на администраторска сесия", "Could not create administrator session"), http.StatusInternalServerError)'),
        ('http.Error(w, "Неуспешно създаване на сесия", http.StatusInternalServerError)',
         'http.Error(w, blisLocalized(r, "Неуспешно създаване на сесия", "Could not create session"), http.StatusInternalServerError)'),
        ('json.NewEncoder(w).Encode([]map[string]string{{"slug": a.ClientSlug, "name": a.ClientName, "sector": a.Sector, "note": "Защитен клиентски профил"}})',
         'json.NewEncoder(w).Encode([]map[string]string{{"slug": a.ClientSlug, "name": a.ClientName, "sector": a.Sector, "note": blisLocalized(r, "Защитен клиентски профил", "Secure client profile")}})'),
        ('json.NewEncoder(w).Encode(map[string]interface{}{"error": "Достъпът е ограничен до клиентския профил", "client": s.ClientSlug})',
         'json.NewEncoder(w).Encode(map[string]interface{}{"error": blisLocalized(r, "Достъпът е ограничен до клиентския профил", "Access is restricted to the client profile"), "client": s.ClientSlug})'),
    ]
    for old,new in replacements:
        if new in s: continue
        if old not in s: raise SystemExit(f'auth_proxy.go anchor missing: {old[:100]}')
        s=s.replace(old,new,1)
    start=s.index('func serveClientLogin(')
    end=s.index('\nfunc scopeDashboardResponse',start)
    block=s[start:end]
    if 'w.Write(injectBLISI18N([]byte(' not in block:
        old='\tio.WriteString(w, `<!doctype html>'
        new='\t_, _ = w.Write(injectBLISI18N([]byte(`<!doctype html>'
        if old not in block: raise SystemExit('login writer start anchor missing')
        block=block.replace(old,new,1)
        tail='</body></html>`)\n}'
        newtail='</body></html>`)))\n}'
        if tail not in block: raise SystemExit('login writer end anchor missing')
        block=block.replace(tail,newtail,1)
        s=s[:start]+block+s[end:]
    if s!=orig:
        p.write_text(s,encoding='utf-8');print('patched auth_proxy.go')

patch_main();patch_auth()

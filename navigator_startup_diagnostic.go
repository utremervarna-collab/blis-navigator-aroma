package main

import (
    "bytes"
    "log"
    "math"
    "time"
)

func init() {
    go func() {
        time.Sleep(3 * time.Second)
        runNavigatorStartupDiagnostic()
    }()
}

func runNavigatorStartupDiagnostic() {
    criticalAssets := []string{
        "static/dashboard.html",
        "static/app.js",
        "static/navigator-reference.js",
        "static/navigator-architecture-v15.js",
        "static/navigator-overview-master.js",
        "static/navigator-live-master.js",
        "static/navigator-social-master.js",
        "static/navigator-digital-master.js",
        "static/navigator-reputation-master.js",
        "static/navigator-perception-map.js",
        "static/navigator-competition-master-v5.js",
        "static/navigator-client-value-pages-v1.js",
        "static/navigator-production-cleanup-v1.js",
        "static/navigator-production-cleanup-v1.css",
        "static/varna-towers-runtime.js",
        "static/varna-towers-data-v18.js",
    }
    assetsOK := true
    for _, p := range criticalAssets {
        if _, err := staticFS.ReadFile(p); err != nil {
            assetsOK = false
            log.Printf("NAV_DIAG asset=FAIL path=%s err=%v", p, err)
        }
    }
    if assetsOK {
        log.Printf("NAV_DIAG assets=OK count=%d", len(criticalAssets))
    }

    // Varna Towers is intentionally isolated in a client-side runtime. Validate
    // that the runtime still contains all core data collections used by Navigator.
    if b, err := staticFS.ReadFile("static/varna-towers-data-v18.js"); err == nil {
        required := [][]byte{[]byte("__VARNA_TOWERS_DATA"), []byte("dashboard"), []byte("sources"), []byte("history"), []byte("competitors"), []byte("indices")}
        ok := true
        for _, marker := range required {
            if !bytes.Contains(b, marker) {
                ok = false
                log.Printf("NAV_DIAG client=varna-towers status=FAIL missing=%s", string(marker))
            }
        }
        if ok {
            log.Printf("NAV_DIAG client=varna-towers status=OK mode=isolated_runtime")
        }
    }

    mu.Lock()
    defer mu.Unlock()
    if store.Clients == nil || len(store.Clients) == 0 {
        log.Printf("NAV_DIAG clients=FAIL reason=empty_store")
        return
    }
    log.Printf("NAV_DIAG server_clients=%d", len(store.Clients))
    for slug, c := range store.Clients {
        if c == nil {
            log.Printf("NAV_DIAG client=%s status=FAIL reason=nil", slug)
            continue
        }
        d := dashboard(c)
        blis := f(d["blis_index"])
        indices, _ := d["indices"].([]interface{})
        competitors, _ := d["competitors"].([]interface{})
        q := dataQuality(c)
        coverage := f(q["coverage"])
        validBLIS := !math.IsNaN(blis) && !math.IsInf(blis, 0) && blis >= 0 && blis <= 100
        validCoverage := !math.IsNaN(coverage) && !math.IsInf(coverage, 0) && coverage >= 0 && coverage <= 100
        ok := len(c.Sources) > 0 && len(c.Observations) > 0 && len(c.Snapshots) > 0 && len(indices) >= 4 && validBLIS && validCoverage
        status := "OK"
        if !ok {
            status = "FAIL"
        }
        log.Printf("NAV_DIAG client=%s status=%s sources=%d observations=%d snapshots=%d indices=%d competitors=%d blis=%.1f coverage=%.1f", slug, status, len(c.Sources), len(c.Observations), len(c.Snapshots), len(indices), len(competitors), blis, coverage)
    }
}

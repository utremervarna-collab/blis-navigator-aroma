package main

import (
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
        "static/navigator-digital-master.js",
        "static/navigator-reputation-master.js",
        "static/navigator-perception-map.js",
        "static/navigator-competition-master-v5.js",
        "static/navigator-client-value-pages-v1.js",
        "static/navigator-production-cleanup-v1.js",
        "static/navigator-production-cleanup-v1.css",
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

    mu.Lock()
    defer mu.Unlock()
    if store.Clients == nil || len(store.Clients) == 0 {
        log.Printf("NAV_DIAG clients=FAIL reason=empty_store")
        return
    }
    log.Printf("NAV_DIAG clients=%d", len(store.Clients))
    for slug, c := range store.Clients {
        if c == nil {
            log.Printf("NAV_DIAG client=%s status=FAIL reason=nil", slug)
            continue
        }
        d := dashboard(c)
        blis := f(d["blis_index"])
        indices, _ := d["indices"].([]interface{})
        ok := len(c.Sources) > 0 && len(c.Observations) > 0 && len(c.Snapshots) > 0 && len(indices) > 0 && !math.IsNaN(blis) && !math.IsInf(blis, 0)
        status := "OK"
        if !ok {
            status = "FAIL"
        }
        log.Printf("NAV_DIAG client=%s status=%s sources=%d observations=%d snapshots=%d indices=%d blis=%.1f", slug, status, len(c.Sources), len(c.Observations), len(c.Snapshots), len(indices), blis)
    }
}

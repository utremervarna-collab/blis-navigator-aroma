package main

import (
    "bytes"
    "io"
    "net/http"
    "strconv"
    "strings"
    "sync"
    "time"
)

var allClientSignalCycleMu sync.Mutex

func followerMetricKey(k string) bool {
    k = strings.ToLower(strings.TrimSpace(k))
    switch k {
    case "follower_count", "followers", "followers_count", "linkedin_followers", "linkedin_follower_count":
        return true
    }
    return strings.Contains(k, "follower")
}

func sanitizeFollowerObservations() {
    mu.Lock()
    defer mu.Unlock()
    for _, c := range store.Clients {
        if c == nil {
            continue
        }
        if len(c.Observations) > 0 {
            clean := c.Observations[:0]
            for _, o := range c.Observations {
                if followerMetricKey(o.MetricKey) {
                    continue
                }
                clean = append(clean, o)
            }
            c.Observations = clean
        }
    }
}

func allRealClientSlugsV5() []string {
    mu.Lock()
    defer mu.Unlock()
    out := make([]string, 0, len(store.Clients))
    for slug, c := range store.Clients {
        if c == nil || slug == "wirello" || slug == "kub" {
            continue
        }
        out = append(out, slug)
    }
    return out
}

func runAllClientSignalsV5() {
    if !allClientSignalCycleMu.TryLock() {
        return
    }
    defer allClientSignalCycleMu.Unlock()

    for _, slug := range allRealClientSlugsV5() {
        c := signalClientSnapshot(slug)
        if c == nil {
            continue
        }
        rows := collectClientSignals(c)
        if len(rows) > 0 {
            mergeSignals(slug, rows)
        }

        competitorRows := []Signal{}
        for _, target := range competitorSignalTargets(c) {
            r := []Signal{}
            r = append(r, collectCompetitorNews(c, target)...)
            r = append(r, collectCompetitorWeb(c, target)...)
            r = append(r, collectCompetitorSocial(c, target)...)
            competitorRows = append(competitorRows, dedupeCompetitorSignals(r)...)
        }
        competitorRows = dedupeCompetitorSignals(competitorRows)
        if len(competitorRows) > 0 {
            mergeSignals(slug, competitorRows)
        }
    }
    saveSignalStateFile()
    saveStore()
}

func serveEvidenceIntegrityV5(w http.ResponseWriter, r *http.Request) {
    b, err := staticFS.ReadFile("static/navigator-evidence-integrity-v7.js")
    if err != nil {
        http.NotFound(w, r)
        return
    }
    w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
    w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    _, _ = w.Write(b)
}

func injectEvidenceIntegrityV5(body []byte) []byte {
    if bytes.Contains(body, []byte("navigator-evidence-integrity-v7.js")) {
        return body
    }
    tag := []byte(`<script src="/navigator-evidence-integrity-v7.js?v=20260906-integrity7"></script>`)
    if bytes.Contains(body, []byte("</body>")) {
        return bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
    }
    return append(body, tag...)
}

func init() {
    http.HandleFunc("/navigator-evidence-integrity-v7.js", serveEvidenceIntegrityV5)

    go func() {
        time.Sleep(2 * time.Second)
        sanitizeFollowerObservations()
        saveStore()
    }()

    go func() {
        time.Sleep(8 * time.Second)
        runAllClientSignalsV5()
        t := time.NewTicker(5 * time.Minute)
        defer t.Stop()
        for range t.C {
            runAllClientSignalsV5()
        }
    }()

    if authProxy == nil {
        return
    }
    previous := authProxy.ModifyResponse
    authProxy.ModifyResponse = func(resp *http.Response) error {
        if previous != nil {
            if err := previous(resp); err != nil {
                return err
            }
        }
        if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
            return nil
        }
        body, err := io.ReadAll(resp.Body)
        if err != nil {
            return err
        }
        _ = resp.Body.Close()
        body = injectEvidenceIntegrityV5(body)
        resp.Body = io.NopCloser(bytes.NewReader(body))
        resp.ContentLength = int64(len(body))
        resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
        resp.Header.Del("Content-Encoding")
        resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        return nil
    }
}

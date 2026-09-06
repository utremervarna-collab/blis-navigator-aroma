package main

import (
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
    sanitizeFollowerObservations()
    saveSignalStateFile()
    saveStore()
}

func init() {
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
}

package main

import (
	"sort"
	"sync"
	"time"
)

var continuousMonitoringMu sync.Mutex

func continuousClientSlugs() []string {
	mu.Lock()
	defer mu.Unlock()
	out := make([]string, 0, len(store.Clients))
	for slug := range store.Clients {
		// Wirello is deliberately synthetic. KUB has a dedicated crisis collector.
		if slug == "wirello" || slug == "kub" {
			continue
		}
		out = append(out, slug)
	}
	sort.Strings(out)
	return out
}

func continuousClientSnapshot(slug string) *Client {
	mu.Lock()
	defer mu.Unlock()
	c := store.Clients[slug]
	if c == nil {
		return nil
	}
	cp := *c
	cp.Sources = append([]Source(nil), c.Sources...)
	cp.Observations = nil
	cp.Snapshots = nil
	return &cp
}

func runContinuousSignalCycle() {
	if !continuousMonitoringMu.TryLock() {
		return
	}
	defer continuousMonitoringMu.Unlock()
	restoreSignalsFromObservations()
	for _, slug := range continuousClientSlugs() {
		c := continuousClientSnapshot(slug)
		if c == nil {
			continue
		}
		brandRows := collectClientSignals(c)
		if len(brandRows) > 0 {
			mergeSignals(slug, brandRows)
		}
		competitorRows := []Signal{}
		for _, target := range competitorSignalTargets(c) {
			rows := []Signal{}
			rows = append(rows, collectCompetitorNews(c, target)...)
			rows = append(rows, collectCompetitorWeb(c, target)...)
			rows = append(rows, collectCompetitorSocial(c, target)...)
			competitorRows = append(competitorRows, dedupeCompetitorSignals(rows)...)
		}
		competitorRows = dedupeCompetitorSignals(competitorRows)
		if len(competitorRows) > 0 {
			mergeSignals(slug, competitorRows)
		}
	}
	sanitizeKnownSignalFalsePositives()
	saveSignalStateFile()
	saveStore()
}

func liveMetricClient(slug string) bool {
	// Only clients with an explicit runClientEngine dispatch belong here.
	// Unknown/legacy client slugs must never fall through to the Aroma engine.
	switch slug {
	case "aroma", "bolyarka", "astor-garden", "mollox", "everbet":
		return true
	default:
		return false
	}
}

func runContinuousMetricCycle(snapshot bool) {
	if !continuousMonitoringMu.TryLock() {
		return
	}
	defer continuousMonitoringMu.Unlock()
	for _, slug := range continuousClientSlugs() {
		if !liveMetricClient(slug) {
			continue
		}
		mu.Lock()
		c := store.Clients[slug]
		mu.Unlock()
		if c == nil {
			continue
		}
		runClientEngine(c, snapshot)
	}
}

func init() {
	// Near-real-time discovery from every accessible public source configured for
	// every real client profile and its configured competitors.
	go func() {
		time.Sleep(4 * time.Minute)
		runContinuousSignalCycle()
		t := time.NewTicker(5 * time.Minute)
		defer t.Stop()
		for range t.C {
			runContinuousSignalCycle()
		}
	}()

	// Measurable brand metrics refresh independently from the mention stream.
	go func() {
		time.Sleep(12 * time.Minute)
		runContinuousMetricCycle(false)
		t := time.NewTicker(30 * time.Minute)
		defer t.Stop()
		for range t.C {
			runContinuousMetricCycle(false)
		}
	}()

	// Historical snapshots are frequent enough for useful curves and comparisons,
	// but intentionally less frequent than mention discovery.
	go func() {
		time.Sleep(25 * time.Minute)
		runContinuousMetricCycle(true)
		t := time.NewTicker(2 * time.Hour)
		defer t.Stop()
		for range t.C {
			runContinuousMetricCycle(true)
		}
	}()
}

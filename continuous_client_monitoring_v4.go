package main

import (
	"sync"
	"time"
)

// continuousMonitoringMu prevents overlapping v4 refresh cycles. The existing
// collectors remain the source of truth and retain their own deduplication.
var continuousMonitoringMu sync.Mutex

func runContinuousSignalCycle() {
	if !continuousMonitoringMu.TryLock() {
		return
	}
	defer continuousMonitoringMu.Unlock()
	runSignalCollector()
	runCompetitorSignalCollector()
}

func runContinuousMetricCycle(snapshot bool) {
	if !continuousMonitoringMu.TryLock() {
		return
	}
	defer continuousMonitoringMu.Unlock()
	for _, slug := range signalEligibleSlugs() {
		c := signalClientSnapshot(slug)
		if c == nil || c.Slug == "wirello" || c.Slug == "kub" {
			continue
		}
		runClientEngine(c, snapshot)
	}
}

func init() {
	// Public mention discovery: five-minute maximum scan cadence inside the app.
	// Search engines/social indexes may expose an item later than its original
	// publication time, so this is near-real-time discovery, not a firehose claim.
	go func() {
		time.Sleep(4 * time.Minute)
		runContinuousSignalCycle()
		t := time.NewTicker(5 * time.Minute)
		defer t.Stop()
		for range t.C {
			runContinuousSignalCycle()
		}
	}()

	// Refresh measurable client metrics more often than the legacy daily cycle.
	go func() {
		time.Sleep(12 * time.Minute)
		runContinuousMetricCycle(false)
		t := time.NewTicker(30 * time.Minute)
		defer t.Stop()
		for range t.C {
			runContinuousMetricCycle(false)
		}
	}()

	// Persist enough history for meaningful curves and period comparisons without
	// flooding the store with a snapshot on every mention scan.
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

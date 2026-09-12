package main

import "time"

// Extends the public-signal collector to the remaining active Navigator profiles
// that are not part of signalEligibleSlugs() yet. This is intentionally additive
// so existing client-specific collectors and renderers remain untouched.
func collectAdditionalActiveClientSignals() {
	for _, slug := range []string{"everbet", "wirello", "astor-garden"} {
		c := signalClientSnapshot(slug)
		if c == nil {
			continue
		}
		fresh := collectClientSignals(c)
		mergeSignals(slug, fresh)
	}
	saveSignalStateFile()
	saveStore()
}

func init() {
	go func() {
		// Let startup migrations and the main collector settle first.
		time.Sleep(20 * time.Second)
		collectAdditionalActiveClientSignals()
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			collectAdditionalActiveClientSignals()
		}
	}()
}

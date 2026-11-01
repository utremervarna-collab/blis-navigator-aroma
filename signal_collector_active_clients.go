package main

import "time"

// Fallback public-signal collection for the active Everbet profile, which is
// not in signalEligibleSlugs(). Astor Garden is already in the primary collector;
// Wirello is a synthetic demo and must never be treated as a real client.
func collectAdditionalActiveClientSignals() {
	for _, slug := range []string{"everbet"} {
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
	if backgroundNetworkLoopsDisabled() {
		return
	}
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

package main

import (
	"encoding/json"
	"strings"
)

// KUB uses a dedicated crisis UI, but its signal history must still live in the
// durable Store so it can be exported to the runtime-data branch and restored
// after a clean deployment. This record is infrastructure-only; client
// visibility remains controlled by the Navigator UI registry and KUB routing.
func ensureKUBSignalPersistenceClient() {
	mu.Lock()
	if store.Clients == nil {
		store.Clients = map[string]*Client{}
	}
	c := store.Clients["kub"]
	if c == nil {
		c = &Client{
			Slug:   "kub",
			Name:   "Корпорация КУБ",
			Sector: "Кризисен мониторинг",
			Note:   "Системен persistence record • скрит от общия Navigator selector",
		}
		store.Clients["kub"] = c
	}
	obs := append([]Observation(nil), c.Observations...)
	mu.Unlock()

	// If signalState is empty after a cold start, rebuild KUB directly from the
	// durable observations. This intentionally does not depend on the generic
	// signalRestored flag because KUB can be restored after a runtime-data fetch.
	signalMu.RLock()
	hasLive := len(signalState.Signals["kub"]) > 0
	signalMu.RUnlock()
	if hasLive || len(obs) == 0 {
		return
	}

	rows := make([]Signal, 0, len(obs))
	for _, o := range obs {
		if o.SourceKey != "signal_collector" || !strings.HasPrefix(o.MetricKey, "signal_event_") {
			continue
		}
		raw, ok := o.Value.(string)
		if !ok || raw == "" {
			continue
		}
		var s Signal
		if json.Unmarshal([]byte(raw), &s) == nil && s.Fingerprint != "" && s.Client == "kub" {
			rows = append(rows, s)
		}
	}
	if len(rows) > 0 {
		mergeSignals("kub", rows)
	}
}

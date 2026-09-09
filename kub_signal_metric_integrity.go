package main

import (
	"strings"
	"time"
)

// normalizeKUBSignalMetrics makes persisted KUB metrics deterministic and
// classifier-derived. It removes any dependency on legacy manually seeded
// relevance/risk values while preserving the verified source evidence itself.
func normalizeKUBSignalMetrics() {
	signalMu.Lock()
	items := signalState.Signals["kub"]
	for i := range items {
		text := items[i].Title + " " + items[i].Text
		low := strings.ToLower(text)

		relevance := 72.0
		if strings.Contains(low, "корпорация куб") || strings.Contains(low, "групировка куб") {
			relevance = 100
		} else if strings.Contains(low, "баба алино") {
			relevance = 92
		} else if strings.Contains(low, "forest club") || strings.Contains(low, "форест клуб") {
			relevance = 82
		}

		sentiment, risk, topic := kubSignalRisk(text)
		items[i].Client = "kub"
		items[i].Brand = "Корпорация КУБ"
		items[i].Relevance = relevance
		items[i].Sentiment = sentiment
		items[i].RiskScore = risk
		items[i].Severity = signalSeverity(risk)
		items[i].Topic = topic
	}
	signalState.Signals["kub"] = items
	signalMu.Unlock()

	saveSignalStateFile()
	saveStore()
}

func init() {
	go func() {
		// The KUB collector starts after 2s. Reconcile after it has populated state,
		// then remain offset from its 5-minute collection cycle.
		time.Sleep(4 * time.Second)
		normalizeKUBSignalMetrics()
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			normalizeKUBSignalMetrics()
		}
	}()
}

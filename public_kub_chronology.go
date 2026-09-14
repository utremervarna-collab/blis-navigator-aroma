package main

import (
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
)

// publicKUBChronologySignal is the read-only representation used by the
// dedicated public KUB crisis profile. The authenticated /api/signals route
// remains protected and unchanged.
type publicKUBChronologySignal struct {
	ID          string  `json:"id"`
	Client      string  `json:"client"`
	Brand       string  `json:"brand,omitempty"`
	Source      string  `json:"source"`
	SourceType  string  `json:"source_type,omitempty"`
	Scope       string  `json:"scope,omitempty"`
	URL         string  `json:"url"`
	Title       string  `json:"title"`
	Text        string  `json:"text,omitempty"`
	PublishedAt string  `json:"published_at"`
	DetectedAt  string  `json:"detected_at,omitempty"`
	Relevance   float64 `json:"relevance,omitempty"`
	Sentiment   string  `json:"sentiment,omitempty"`
	Topic       string  `json:"topic,omitempty"`
	RiskScore   float64 `json:"risk_score,omitempty"`
	Severity    string  `json:"severity,omitempty"`
	Fingerprint string  `json:"fingerprint,omitempty"`
}

func publicKUBChronologySignalValid(s Signal) bool {
	if s.Client != "kub" || strings.TrimSpace(s.Source) == "" || strings.TrimSpace(s.Title) == "" {
		return false
	}
	if _, ok := parseCompetitorPublished(strings.TrimSpace(s.PublishedAt)); !ok {
		return false
	}
	u, err := url.Parse(strings.TrimSpace(s.URL))
	return err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != ""
}

func buildPublicKUBChronology() (string, []publicKUBChronologySignal) {
	restoreSignalsFromObservations()

	signalMu.RLock()
	updated := signalState.UpdatedAt
	live := append([]Signal(nil), signalState.Signals["kub"]...)
	signalMu.RUnlock()

	// Union the live set and durable source-backed observations. The dedicated
	// KUB chronology intentionally does not apply the generic brand-context
	// filter used by /api/public/mentions, because verified crisis developments
	// can be institution- or owner-led without repeating a brand token.
	byFP := make(map[string]Signal, len(live)+256)
	for _, s := range live {
		if s.Fingerprint != "" && publicKUBChronologySignalValid(s) {
			byFP[s.Fingerprint] = s
		}
	}
	for _, s := range persistedMentionSignals("kub") {
		if s.Fingerprint == "" || !publicKUBChronologySignalValid(s) {
			continue
		}
		if _, exists := byFP[s.Fingerprint]; !exists {
			byFP[s.Fingerprint] = s
		}
	}

	rows := make([]Signal, 0, len(byFP))
	for _, s := range byFP {
		rows = append(rows, s)
	}
	sort.SliceStable(rows, func(i, j int) bool {
		iPub, iOK := parseCompetitorPublished(rows[i].PublishedAt)
		jPub, jOK := parseCompetitorPublished(rows[j].PublishedAt)
		if iOK && jOK && !iPub.Equal(jPub) {
			return iPub.After(jPub)
		}
		if iOK != jOK {
			return iOK
		}
		return rows[i].DetectedAt > rows[j].DetectedAt
	})

	out := make([]publicKUBChronologySignal, 0, len(rows))
	for _, s := range rows {
		out = append(out, publicKUBChronologySignal{
			ID: s.ID, Client: "kub", Brand: s.Brand, Source: s.Source,
			SourceType: s.SourceType, Scope: s.Scope, URL: s.URL, Title: s.Title,
			Text: s.Text, PublishedAt: s.PublishedAt, DetectedAt: s.DetectedAt,
			Relevance: s.Relevance, Sentiment: s.Sentiment, Topic: s.Topic,
			RiskScore: s.RiskScore, Severity: s.Severity, Fingerprint: s.Fingerprint,
		})
	}
	return updated, out
}

func publicKUBChronology(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	limit := 500
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}

	updated, rows := buildPublicKUBChronology()
	if len(rows) > limit {
		rows = rows[:limit]
	}
	w.Header().Set("Cache-Control", "no-store, max-age=0")
	if r.Method == http.MethodHead {
		w.WriteHeader(http.StatusOK)
		return
	}
	collectorWriteJSON(w, map[string]interface{}{
		"client": "kub", "updated_at": updated, "signals": rows,
	})
}

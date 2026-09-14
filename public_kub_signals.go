package main

import (
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

// publicKUBSignal is the read-only representation used by the dedicated KUB
// crisis profile. The authenticated /api/signals endpoint stays protected.
type publicKUBSignal struct {
	ID          string  `json:"id"`
	Client      string  `json:"client"`
	Brand       string  `json:"brand,omitempty"`
	Source      string  `json:"source"`
	SourceType  string  `json:"source_type,omitempty"`
	Scope       string  `json:"scope,omitempty"`
	URL         string  `json:"url"`
	Title       string  `json:"title"`
	Text        string  `json:"text,omitempty"`
	PublishedAt string  `json:"published_at,omitempty"`
	DetectedAt  string  `json:"detected_at,omitempty"`
	Relevance   float64 `json:"relevance,omitempty"`
	Sentiment   string  `json:"sentiment,omitempty"`
	Topic       string  `json:"topic,omitempty"`
	RiskScore   float64 `json:"risk_score,omitempty"`
	Severity    string  `json:"severity,omitempty"`
	Fingerprint string  `json:"fingerprint,omitempty"`
}

func publicKUBTimestamp(raw string) time.Time {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return time.Time{}
	}
	for _, layout := range []string{
		time.RFC3339Nano,
		time.RFC3339,
		time.RFC1123Z,
		time.RFC1123,
		time.RFC822Z,
		time.RFC822,
		"2006-01-02 15:04:05 -0700 MST",
		"2006-01-02 15:04:05",
		"2006-01-02",
	} {
		if t, err := time.Parse(layout, raw); err == nil {
			return t
		}
	}
	return time.Time{}
}

func publicKUBSignalValid(s Signal) bool {
	if s.Client != "kub" || strings.TrimSpace(s.Source) == "" || strings.TrimSpace(s.Title) == "" {
		return false
	}
	u, err := url.Parse(strings.TrimSpace(s.URL))
	return err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != ""
}

func buildPublicKUBSignalTimeline() (string, []publicKUBSignal) {
	restoreSignalsFromObservations()

	signalMu.RLock()
	updated := signalState.UpdatedAt
	live := append([]Signal(nil), signalState.Signals["kub"]...)
	signalMu.RUnlock()

	// Durable observations are also included so a restart or bounded in-memory
	// state cannot hide a verified KUB publication from the public chronology.
	byFP := make(map[string]Signal, len(live)+256)
	for _, s := range live {
		if s.Fingerprint != "" && publicKUBSignalValid(s) {
			byFP[s.Fingerprint] = s
		}
	}
	for _, s := range persistedMentionSignals("kub") {
		if s.Fingerprint == "" || !publicKUBSignalValid(s) {
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
		iPub := publicKUBTimestamp(rows[i].PublishedAt)
		jPub := publicKUBTimestamp(rows[j].PublishedAt)
		if !iPub.IsZero() || !jPub.IsZero() {
			if iPub.IsZero() {
				return false
			}
			if jPub.IsZero() {
				return true
			}
			if !iPub.Equal(jPub) {
				return iPub.After(jPub)
			}
		}
		iDet := publicKUBTimestamp(rows[i].DetectedAt)
		jDet := publicKUBTimestamp(rows[j].DetectedAt)
		if !iDet.Equal(jDet) {
			return iDet.After(jDet)
		}
		return rows[i].Fingerprint < rows[j].Fingerprint
	})

	out := make([]publicKUBSignal, 0, len(rows))
	for _, s := range rows {
		out = append(out, publicKUBSignal{
			ID: s.ID, Client: "kub", Brand: s.Brand, Source: s.Source,
			SourceType: s.SourceType, Scope: s.Scope, URL: s.URL, Title: s.Title,
			Text: s.Text, PublishedAt: s.PublishedAt, DetectedAt: s.DetectedAt,
			Relevance: s.Relevance, Sentiment: s.Sentiment, Topic: s.Topic,
			RiskScore: s.RiskScore, Severity: s.Severity, Fingerprint: s.Fingerprint,
		})
	}
	return updated, out
}

func publicKUBSignals(w http.ResponseWriter, r *http.Request) {
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
	updated, rows := buildPublicKUBSignalTimeline()
	if len(rows) > limit {
		rows = rows[:limit]
	}
	w.Header().Set("Cache-Control", "no-store, max-age=0")
	collectorWriteJSON(w, map[string]interface{}{
		"client": "kub", "updated_at": updated, "signals": rows,
	})
}

package main

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

// publicClientMention contains only the source-backed fields displayed by the
// public Navigator. The authenticated /api/signals endpoint remains unchanged.
type publicClientMention struct {
	Client      string `json:"client"`
	Brand       string `json:"brand,omitempty"`
	Scope       string `json:"scope"`
	Source      string `json:"source"`
	URL         string `json:"url"`
	Title       string `json:"title"`
	Text        string `json:"text,omitempty"`
	PublishedAt string `json:"published_at,omitempty"`
	DetectedAt  string `json:"detected_at"`
	Topic       string `json:"topic,omitempty"`
	Severity    string `json:"severity,omitempty"`
	Sentiment   string `json:"sentiment,omitempty"`
	Fingerprint string `json:"fingerprint"`
}

func publicClientMentions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	slug := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("client")))
	scope := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("scope")))
	if !validNavigatorClient(slug) || (scope != "brand" && scope != "competitor") {
		http.Error(w, "valid client and scope required", http.StatusBadRequest)
		return
	}
	if slug == "black-sea-center" {
		if _, ok := ownerSession(r); !ok {
			http.Error(w, "restricted client", http.StatusForbidden)
			return
		}
	}
	if isWirelloDemo(r) && slug != "wirello" {
		http.Error(w, "restricted demo", http.StatusForbidden)
		return
	}
	if s, ok := sessionFromRequest(r); ok && !s.Admin && s.ClientSlug != slug {
		http.Error(w, "restricted client", http.StatusForbidden)
		return
	}
	limit := 300
	if raw := r.URL.Query().Get("limit"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 && n <= 300 {
			limit = n
		}
	}
	rows := make([]publicClientMention, 0)
	updated := ""
	if slug != "wirello" { // A synthetic demo has no verified web mentions.
		restoreSignalsFromObservations()
		signalMu.RLock()
		updated = signalState.UpdatedAt
		for _, s := range signalState.Signals[slug] {
			if s.Client != slug || (scope == "competitor") != (s.Scope == "competitor") {
				continue
			}
			if scope == "brand" && s.Scope != "external" && s.Scope != "owned" {
				continue
			}
			if scope == "competitor" && zagorkaParkOnly(s.Brand, s.Title, s.Text) {
				continue
			}
			u, err := url.Parse(s.URL)
			if err != nil || (u.Scheme != "https" && u.Scheme != "http") || u.Host == "" || strings.TrimSpace(s.Source) == "" || strings.TrimSpace(s.Title) == "" {
				continue
			}
			rows = append(rows, publicClientMention{Client: slug, Brand: s.Brand, Scope: s.Scope, Source: s.Source, URL: s.URL, Title: s.Title, Text: s.Text, PublishedAt: s.PublishedAt, DetectedAt: s.DetectedAt, Topic: s.Topic, Severity: s.Severity, Sentiment: s.Sentiment, Fingerprint: s.Fingerprint})
			if len(rows) >= limit {
				break
			}
		}
		signalMu.RUnlock()
	}
	collectorWriteJSON(w, map[string]interface{}{"client": slug, "scope": scope, "updated_at": updated, "signals": rows})
}

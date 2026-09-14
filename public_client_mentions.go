package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
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

type publicMentionCacheEntry struct {
	created time.Time
	updated string
	rows    []publicClientMention
}

const publicMentionCacheTTL = 45 * time.Second

var (
	publicMentionCacheMu      sync.RWMutex
	publicMentionCacheBuildMu sync.Mutex
	publicMentionCache        = map[string]publicMentionCacheEntry{}
)

func publicMentionCacheGet(key string) (publicMentionCacheEntry, bool) {
	publicMentionCacheMu.RLock()
	entry, ok := publicMentionCache[key]
	publicMentionCacheMu.RUnlock()
	if !ok || time.Since(entry.created) > publicMentionCacheTTL {
		return publicMentionCacheEntry{}, false
	}
	entry.rows = append([]publicClientMention(nil), entry.rows...)
	return entry, true
}

func publicMentionCachePut(key, updated string, rows []publicClientMention) {
	publicMentionCacheMu.Lock()
	publicMentionCache[key] = publicMentionCacheEntry{
		created: time.Now(),
		updated: updated,
		rows:    append([]publicClientMention(nil), rows...),
	}
	publicMentionCacheMu.Unlock()
}

// persistedMentionSignals reads durable source-backed signal observations for
// one client. The public endpoint unions these with the bounded live set and
// then applies the exact rolling three-calendar-month publication window.
func persistedMentionSignals(slug string) []Signal {
	mu.Lock()
	c := store.Clients[slug]
	if c == nil {
		mu.Unlock()
		return nil
	}
	obs := append([]Observation(nil), c.Observations...)
	mu.Unlock()

	rows := make([]Signal, 0, 512)
	for i := len(obs) - 1; i >= 0; i-- {
		o := obs[i]
		if o.SourceKey != "signal_collector" || !strings.HasPrefix(o.MetricKey, "signal_event_") {
			continue
		}
		raw, ok := o.Value.(string)
		if !ok || strings.TrimSpace(raw) == "" {
			continue
		}
		var s Signal
		if json.Unmarshal([]byte(raw), &s) != nil || s.Client != slug || s.Fingerprint == "" {
			continue
		}
		rows = append(rows, s)
	}
	return rows
}

func publicMentionInRecentWindow(s Signal) bool {
	published, ok := parseCompetitorPublished(s.PublishedAt)
	if !ok {
		// A newly detected old page must never masquerade as a current mention.
		// Publication date is therefore mandatory in the public 3-month stream.
		return false
	}
	now := time.Now().UTC()
	return !published.Before(competitorRecentCutoff()) && !published.After(now.Add(48*time.Hour))
}

func publicMentionSignalValid(slug, scope string, c *Client, s Signal) bool {
	if s.Client != slug || (scope == "competitor") != (s.Scope == "competitor") {
		return false
	}
	if scope == "brand" && s.Scope != "external" && s.Scope != "owned" {
		return false
	}
	if !publicMentionInRecentWindow(s) {
		return false
	}
	if scope == "brand" && c != nil && !brandMentionContextAcceptable(c, s.Title, s.Text) {
		return false
	}
	if scope == "competitor" {
		if zagorkaParkOnly(s.Brand, s.Title, s.Text) {
			return false
		}
		if slug == "bolyarka" && bolyarkaCompetitorNoiseV2(s.Brand, s.Title, s.Text) {
			return false
		}
		if slug == "bolyarka" && bolyarkaCompetitorGeographicNoiseV3(s.Brand, s.Title, s.Text) {
			return false
		}
	}
	u, err := url.Parse(s.URL)
	return err == nil && (u.Scheme == "https" || u.Scheme == "http") && u.Host != "" &&
		strings.TrimSpace(s.Source) != "" && strings.TrimSpace(s.Title) != ""
}

func buildPublicMentionTimeline(slug, scope string) (string, []publicClientMention) {
	updated := ""
	var clientSnapshot *Client
	if scope == "brand" {
		clientSnapshot = signalClientSnapshot(slug)
	}
	if slug == "wirello" { // A synthetic demo has no verified web mentions.
		return updated, nil
	}

	restoreSignalsFromObservations()

	// Snapshot the bounded live set without holding the lock while reading the
	// durable observation history. This also avoids lock-order inversions.
	signalMu.RLock()
	updated = signalState.UpdatedAt
	live := append([]Signal(nil), signalState.Signals[slug]...)
	signalMu.RUnlock()

	// Union live + durable history by stable fingerprint. Live rows win because
	// they can contain the freshest normalization for the same publication.
	byFP := make(map[string]Signal, len(live)+256)
	for _, s := range live {
		if s.Fingerprint != "" {
			byFP[s.Fingerprint] = s
		}
	}
	for _, s := range persistedMentionSignals(slug) {
		if s.Fingerprint == "" {
			continue
		}
		if _, exists := byFP[s.Fingerprint]; !exists {
			byFP[s.Fingerprint] = s
		}
	}

	candidates := make([]Signal, 0, len(byFP))
	for _, s := range byFP {
		if publicMentionSignalValid(slug, scope, clientSnapshot, s) {
			candidates = append(candidates, s)
		}
	}
	// The public chronology is publication-first. DetectedAt is used only as
	// a deterministic tie-breaker after the mandatory publication date.
	sort.SliceStable(candidates, func(i, j int) bool {
		iPub, iOK := parseCompetitorPublished(candidates[i].PublishedAt)
		jPub, jOK := parseCompetitorPublished(candidates[j].PublishedAt)
		if iOK && jOK && !iPub.Equal(jPub) {
			return iPub.After(jPub)
		}
		return candidates[i].DetectedAt > candidates[j].DetectedAt
	})
	if len(candidates) > 300 {
		candidates = candidates[:300]
	}

	rows := make([]publicClientMention, 0, len(candidates))
	for _, s := range candidates {
		rows = append(rows, publicClientMention{Client: slug, Brand: s.Brand, Scope: s.Scope, Source: s.Source, URL: s.URL, Title: s.Title, Text: s.Text, PublishedAt: s.PublishedAt, DetectedAt: s.DetectedAt, Topic: s.Topic, Severity: s.Severity, Sentiment: s.Sentiment, Fingerprint: s.Fingerprint})
	}
	return updated, rows
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

	if slug == "kub" && scope == "brand" {
		// KUB crisis monitoring needs the dedicated source-backed chronology.
		// Institutional and owner-led developments can be relevant even when
		// they do not fit the generic brand scope used by other clients.
		publicKUBChronology(w, r)
		return
	}

	limit := 300
	if raw := r.URL.Query().Get("limit"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 && n <= 300 {
			limit = n
		}
	}

	cacheKey := slug + "|" + scope
	entry, ok := publicMentionCacheGet(cacheKey)
	if !ok {
		// Collapse simultaneous first-load requests from the competition page and
		// live-refresh lane into one durable-history scan.
		publicMentionCacheBuildMu.Lock()
		entry, ok = publicMentionCacheGet(cacheKey)
		if !ok {
			updated, rows := buildPublicMentionTimeline(slug, scope)
			publicMentionCachePut(cacheKey, updated, rows)
			entry = publicMentionCacheEntry{created: time.Now(), updated: updated, rows: rows}
		}
		publicMentionCacheBuildMu.Unlock()
	}

	rows := entry.rows
	if len(rows) > limit {
		rows = rows[:limit]
	}
	w.Header().Set("Cache-Control", "private, max-age=20, stale-while-revalidate=45")
	collectorWriteJSON(w, map[string]interface{}{"client": slug, "scope": scope, "window_months": 3, "updated_at": entry.updated, "signals": rows})
}

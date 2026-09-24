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
	now := time.Now().UTC()
	if published, ok := parseCompetitorPublished(s.PublishedAt); ok {
		return !published.Before(competitorRecentCutoff()) && !published.After(now.Add(48*time.Hour))
	}
	// Some public web/social pages expose no machine-readable publication date.
	// Do not invent one. For those rows, allow the item only when the monitor
	// itself actually detected it inside the rolling three-month window.
	detected, err := time.Parse(time.RFC3339, strings.TrimSpace(s.DetectedAt))
	if err != nil {
		return false
	}
	detected = detected.UTC()
	return !detected.Before(competitorRecentCutoff()) && !detected.After(now.Add(48*time.Hour))
}

func deltaCompetitorDisplayName(v string) string {
	v = strings.TrimSpace(v)
	if strings.EqualFold(v, "Mall Varna") || strings.EqualFold(v, "MALL VARNA") || strings.EqualFold(v, "Варна Мол") {
		return "Black Sea Center"
	}
	return v
}

func normalizeDeltaCompetitorCopy(v string) string {
	r := strings.NewReplacer(
		"Mall Varna", "Black Sea Center",
		"MALL VARNA", "Black Sea Center",
		"Варна Мол", "Black Sea Center",
	)
	return strings.TrimSpace(r.Replace(v))
}

func deltaCompetitorTimelineNoise(s Signal) bool {
	u, _ := url.Parse(strings.TrimSpace(s.URL))
	host := strings.ToLower(strings.TrimPrefix(u.Hostname(), "www."))
	title := strings.ToLower(strings.TrimSpace(s.Title))
	body := strings.ToLower(strings.TrimSpace(s.Text))
	combined := strings.Join(strings.Fields(title+" "+body), " ")

	// Static directory/about/home pages are reference sources, not dated
	// competitive events. They must not appear as "mentions" just because the
	// crawler discovered them today.
	if host == "mall-varna.bg" {
		if title == "mall varna" || title == "black sea center" || strings.Contains(title, "about us") || strings.Contains(title, "за нас") {
			return true
		}
	}
	if host == "retailmap.bg" {
		if strings.Contains(combined, "бисквит") || strings.Contains(combined, "cookies") ||
			strings.Contains(combined, "главни търговски улици") || strings.Contains(combined, "пазарни доклади") {
			return true
		}
	}
	for _, junk := range []string{
		"copyright mall varna", "all rights reserved",
		"начало за нас галерия новини контакти",
		"със сърфирането на този уебсайт",
		"вие приемате, че той използва",
	} {
		if strings.Contains(combined, junk) {
			return true
		}
	}
	return false
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
		if slug == "delta-planet" && deltaCompetitorTimelineNoise(s) {
			return false
		}
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
	// Prefer verified publication time. When a source exposes no publication
	// timestamp, order by the real monitor detection time instead.
	effectiveTime := func(s Signal) time.Time {
		if t, ok := parseCompetitorPublished(s.PublishedAt); ok {
			return t
		}
		if t, err := time.Parse(time.RFC3339, strings.TrimSpace(s.DetectedAt)); err == nil {
			return t.UTC()
		}
		return time.Time{}
	}
	sort.SliceStable(candidates, func(i, j int) bool {
		return effectiveTime(candidates[i]).After(effectiveTime(candidates[j]))
	})
	if len(candidates) > 300 {
		candidates = candidates[:300]
	}

	rows := make([]publicClientMention, 0, len(candidates))
	for _, s := range candidates {
		displayTitle := cleanCompetitorDisplayText(strings.TrimSpace(s.Title))
		displayText := cleanCompetitorDisplayText(strings.TrimSpace(s.Text))
		if competitorLooksLikeCode(displayTitle) {
			displayTitle = strings.TrimSpace(s.Brand)
			if displayTitle == "" {
				displayTitle = "Конкурентно споменаване"
			}
		}
		if competitorLooksLikeCode(displayText) {
			displayText = ""
		}
		displayBrand := strings.TrimSpace(s.Brand)
		if slug == "delta-planet" && scope == "competitor" {
			displayBrand = deltaCompetitorDisplayName(displayBrand)
			displayTitle = normalizeDeltaCompetitorCopy(displayTitle)
			displayText = normalizeDeltaCompetitorCopy(displayText)
		}
		rows = append(rows, publicClientMention{Client: slug, Brand: displayBrand, Scope: s.Scope, Source: s.Source, URL: s.URL, Title: displayTitle, Text: displayText, PublishedAt: s.PublishedAt, DetectedAt: s.DetectedAt, Topic: s.Topic, Severity: s.Severity, Sentiment: s.Sentiment, Fingerprint: s.Fingerprint})
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

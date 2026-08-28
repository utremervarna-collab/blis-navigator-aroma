package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"html"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Signal is a normalized external-information event detected for a client.
// The collector is deliberately additive: it does not replace any existing
// client engine, metric, page or approved Navigator renderer.
type Signal struct {
	ID          string  `json:"id"`
	Client      string  `json:"client"`
	Brand       string  `json:"brand"`
	Source      string  `json:"source"`
	SourceType  string  `json:"source_type"`
	Scope       string  `json:"scope"`
	URL         string  `json:"url"`
	Title       string  `json:"title"`
	Text        string  `json:"text"`
	PublishedAt string  `json:"published_at,omitempty"`
	DetectedAt  string  `json:"detected_at"`
	Relevance   float64 `json:"relevance"`
	Sentiment   string  `json:"sentiment"`
	Topic       string  `json:"topic"`
	RiskScore   float64 `json:"risk_score"`
	Severity    string  `json:"severity"`
	Fingerprint string  `json:"fingerprint"`
}

type SignalState struct {
	UpdatedAt string              `json:"updated_at"`
	Signals   map[string][]Signal `json:"signals"`
}

type collectorRSS struct {
	Channel struct {
		Items []struct {
			Title       string `xml:"title"`
			Link        string `xml:"link"`
			PubDate     string `xml:"pubDate"`
			Description string `xml:"description"`
		} `xml:"item"`
	} `xml:"channel"`
}

var (
	signalMu       sync.RWMutex
	signalState    = SignalState{Signals: map[string][]Signal{}}
	signalRestored bool
)

var (
	collectorBlockRE = regexp.MustCompile(`(?is)<li[^>]*class=["'][^"']*b_algo[^"']*["'][^>]*>(.*?)</li>`)
	collectorLinkRE  = regexp.MustCompile(`(?is)<h2[^>]*>.*?<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)</a>`)
	collectorPRE     = regexp.MustCompile(`(?is)<p[^>]*>(.*?)</p>`)
)

func signalDataPath() string { return appDataDir() + "/signals.json" }

func signalBrandTerms(c *Client) []string {
	if c == nil {
		return nil
	}
	switch c.Slug {
	case "aroma":
		return []string{"Aroma Cosmetics", "Aroma Cosmetics AD", "Арома Козметикс", "Арома козметика"}
	case "bolyarka":
		return []string{"Болярка", "Bolyarka", "Boliarka", "Болярка ВТ"}
	case "mollox":
		return []string{"MOLLOX", "MOLLOX България", "Mollox Bulgaria", "Молокс"}
	case "varna-towers":
		return []string{"Varna Towers", "Варна Тауърс", "Варна Тауърс"}
	default:
		if strings.TrimSpace(c.Name) != "" {
			return []string{strings.TrimSpace(c.Name)}
		}
	}
	return nil
}

func signalQuery(c *Client) string {
	terms := signalBrandTerms(c)
	parts := make([]string, 0, len(terms))
	seen := map[string]bool{}
	for _, term := range terms {
		term = strings.TrimSpace(term)
		key := strings.ToLower(term)
		if term == "" || seen[key] {
			continue
		}
		seen[key] = true
		parts = append(parts, `"`+term+`"`)
	}
	return strings.Join(parts, " OR ")
}

func signalHash(client, rawURL, title, text string) string {
	canonical := strings.ToLower(strings.TrimSpace(client + "|" + rawURL + "|" + title + "|" + text))
	h := sha1.Sum([]byte(canonical))
	return hex.EncodeToString(h[:])
}

func signalSeverity(risk float64) string {
	switch {
	case risk >= 80:
		return "critical"
	case risk >= 60:
		return "high"
	case risk >= 35:
		return "medium"
	default:
		return "low"
	}
}

func containsAny(low string, terms ...string) bool {
	for _, term := range terms {
		if strings.Contains(low, term) {
			return true
		}
	}
	return false
}

func signalTopic(text string) string {
	low := strings.ToLower(text)
	switch {
	case containsAny(low, "комисия", "санкц", "глоб", "регул", "забран", "изтегля", "recall", "warning", "echa", "кзп", "нарушение"):
		return "regulatory"
	case containsAny(low, "скандал", "измама", "оплак", "жалб", "недовол", "бойкот", "фалш", "опас", "репутац"):
		return "reputation"
	case containsAny(low, "конкур", "пазарен дял", "каменица", "загорка", "хаглайтнер", "calvatis", "albis", "biofresh", "alteya"):
		return "competition"
	case containsAny(low, "продукт", "опаков", "качество", "състав", "формул", "бира", "козмет", "препарат"):
		return "product"
	case containsAny(low, "цена", "промо", "продаж", "дистриб", "магазин", "пазар", "клиент", "поръч"):
		return "commercial"
	default:
		return "brand_mention"
	}
}

func signalSentimentAndRisk(text string) (string, float64) {
	low := strings.ToLower(text)
	negative := []string{"скандал", "измама", "опас", "забран", "санкц", "глоб", "изтегля", "жалб", "оплак", "недовол", "лош", "проблем", "бойкот", "дефект", "наруш", "fake", "fraud", "recall", "warning"}
	positive := []string{"награда", "успех", "растеж", "нов продукт", "партньор", "иновац", "отлич", "препоръч", "award", "growth", "launch"}
	n, p := 0, 0
	for _, term := range negative {
		if strings.Contains(low, term) {
			n++
		}
	}
	for _, term := range positive {
		if strings.Contains(low, term) {
			p++
		}
	}
	if n > 0 {
		risk := 40.0 + float64(n)*15.0
		if containsAny(low, "опас", "забран", "санкц", "изтегля", "fraud", "recall") {
			risk += 15
		}
		if risk > 100 {
			risk = 100
		}
		return "negative", risk
	}
	if p > 0 {
		return "positive", 10
	}
	return "neutral", 20
}

func signalRelevance(c *Client, title, text string) float64 {
	if c == nil {
		return 0
	}
	low := strings.ToLower(title + " " + text)
	score := 0.0
	for i, term := range signalBrandTerms(c) {
		term = strings.ToLower(strings.TrimSpace(term))
		if term == "" || !strings.Contains(low, term) {
			continue
		}
		if i == 0 {
			score += 60
		} else {
			score += 35
		}
	}
	if c.Slug == "aroma" && score == 0 && strings.Contains(low, "арома") && containsAny(low, "козмет", "шампоан", "крем", "toothpaste", "cosmetic") {
		score = 45
	}
	if score > 100 {
		score = 100
	}
	return score
}

func signalSourceScope(c *Client, rawURL string) string {
	if c == nil || rawURL == "" {
		return "external"
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return "external"
	}
	host := strings.ToLower(strings.TrimPrefix(u.Host, "www."))
	path := strings.ToLower(strings.Trim(u.Path, "/"))
	for _, src := range c.Sources {
		su, err := url.Parse(src.URL)
		if err != nil {
			continue
		}
		shost := strings.ToLower(strings.TrimPrefix(su.Host, "www."))
		spath := strings.ToLower(strings.Trim(su.Path, "/"))
		if host != shost || host == "" {
			continue
		}
		if spath == "" || path == spath || strings.HasPrefix(path, spath+"/") {
			return "owned"
		}
	}
	return "external"
}

func buildSignal(c *Client, source, sourceType, rawURL, title, text, published string) (Signal, bool) {
	title = cleanPostSnippet(title)
	text = cleanPostSnippet(text)
	if text == "" {
		text = title
	}
	relevance := signalRelevance(c, title, text)
	if relevance < 35 || rawURL == "" {
		return Signal{}, false
	}
	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	fingerprint := signalHash(c.Slug, rawURL, title, text)
	return Signal{
		ID:          fingerprint[:16],
		Client:      c.Slug,
		Brand:       c.Name,
		Source:      source,
		SourceType:  sourceType,
		Scope:       signalSourceScope(c, rawURL),
		URL:         rawURL,
		Title:       title,
		Text:        text,
		PublishedAt: published,
		DetectedAt:  nowISO(),
		Relevance:   relevance,
		Sentiment:   sentiment,
		Topic:       signalTopic(title + " " + text),
		RiskScore:   risk,
		Severity:    signalSeverity(risk),
		Fingerprint: fingerprint,
	}, true
}

func collectNewsSignals(c *Client) []Signal {
	query := signalQuery(c)
	if query == "" {
		return nil
	}
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(query) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed collectorRSS
	if err := xml.Unmarshal([]byte(body), &feed); err != nil {
		return nil
	}
	out := make([]Signal, 0, 20)
	for _, item := range feed.Channel.Items {
		if s, ok := buildSignal(c, "Google News", "news", item.Link, item.Title, item.Description, item.PubDate); ok {
			out = append(out, s)
			if len(out) >= 20 {
				break
			}
		}
	}
	return out
}

func parseBingSignalResults(c *Client, body, sourceType, platform string) []Signal {
	out := []Signal{}
	seen := map[string]bool{}
	for _, block := range collectorBlockRE.FindAllStringSubmatch(body, -1) {
		if len(block) < 2 {
			continue
		}
		lm := collectorLinkRE.FindStringSubmatch(block[1])
		if len(lm) < 3 {
			continue
		}
		rawURL := html.UnescapeString(strings.TrimSpace(lm[1]))
		if platform != "" {
			rawURL = normalizeSocialURL(rawURL, platform)
			if !isSocialPostURL(platform, rawURL) {
				continue
			}
		}
		key := strings.ToLower(rawURL)
		if key == "" || seen[key] {
			continue
		}
		seen[key] = true
		title := cleanPostSnippet(lm[2])
		snippet := ""
		if pm := collectorPRE.FindStringSubmatch(block[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(pm[1])
		}
		source := sourceType
		if platform != "" {
			source = platform
		} else if u, err := url.Parse(rawURL); err == nil && u.Host != "" {
			source = u.Host
		}
		if s, ok := buildSignal(c, source, sourceType, rawURL, title, snippet, ""); ok {
			out = append(out, s)
			if len(out) >= 20 {
				break
			}
		}
	}
	return out
}

func bingSignalSearch(c *Client, query, sourceType, platform string) []Signal {
	if strings.TrimSpace(query) == "" {
		return nil
	}
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(query) + "&count=20&setlang=bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	return parseBingSignalResults(c, body, sourceType, platform)
}

func collectPublicWebSignals(c *Client) []Signal {
	query := signalQuery(c)
	if query == "" {
		return nil
	}
	return bingSignalSearch(c, query, "web", "")
}

func collectExternalSocialSignals(c *Client) []Signal {
	brand := signalQuery(c)
	if brand == "" {
		return nil
	}
	queries := []struct {
		platform string
		query    string
	}{
		{"linkedin", "site:linkedin.com/posts " + brand},
		{"facebook", "site:facebook.com " + brand},
		{"instagram", "site:instagram.com " + brand},
		{"youtube", "site:youtube.com/watch " + brand},
		{"tiktok", "site:tiktok.com " + brand},
	}
	out := []Signal{}
	for _, q := range queries {
		out = append(out, bingSignalSearch(c, q.query, "social", q.platform)...)
	}
	return out
}

func collectOwnedSocialSignals(c *Client) []Signal {
	out := []Signal{}
	for i := range c.Sources {
		src := &c.Sources[i]
		if !isSpecificSocialSource(*src) {
			continue
		}
		platform := socialPlatform(src)
		if platform == "" {
			continue
		}
		posts := preciseSearchPosts(c, src, platform)
		for _, post := range posts {
			if s, ok := buildSignal(c, platform, "social", post.URL, post.Text, post.Text, post.Published); ok {
				out = append(out, s)
			}
		}
	}
	return out
}

func dedupeSignals(in []Signal) []Signal {
	seen := map[string]bool{}
	out := make([]Signal, 0, len(in))
	for _, s := range in {
		if s.Fingerprint == "" || seen[s.Fingerprint] {
			continue
		}
		seen[s.Fingerprint] = true
		out = append(out, s)
	}
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].RiskScore != out[j].RiskScore {
			return out[i].RiskScore > out[j].RiskScore
		}
		return out[i].Relevance > out[j].Relevance
	})
	return out
}

func collectClientSignals(c *Client) []Signal {
	if c == nil {
		return nil
	}
	combined := []Signal{}
	combined = append(combined, collectNewsSignals(c)...)
	combined = append(combined, collectPublicWebSignals(c)...)
	combined = append(combined, collectExternalSocialSignals(c)...)
	combined = append(combined, collectOwnedSocialSignals(c)...)
	return dedupeSignals(combined)
}

func signalClientSnapshot(slug string) *Client {
	mu.Lock()
	defer mu.Unlock()
	c := store.Clients[slug]
	if c == nil {
		return nil
	}
	copyClient := *c
	copyClient.Sources = append([]Source(nil), c.Sources...)
	copyClient.Observations = nil
	copyClient.Snapshots = nil
	return &copyClient
}

func signalEligibleSlugs() []string {
	// Existing-client rollout only. A slug is never created here; it is used
	// only when it already exists in the live store.
	return []string{"aroma", "bolyarka", "mollox", "varna-towers"}
}

func signalObservationExists(c *Client, metric string) bool {
	if c == nil {
		return false
	}
	for i := len(c.Observations) - 1; i >= 0 && i >= len(c.Observations)-2000; i-- {
		o := c.Observations[i]
		if o.SourceKey == "signal_collector" && o.MetricKey == metric {
			return true
		}
	}
	return false
}

func persistSignalObservation(s Signal) {
	mu.Lock()
	c := store.Clients[s.Client]
	mu.Unlock()
	if c == nil {
		return
	}
	metric := "signal_event_" + s.ID
	if signalObservationExists(c, metric) {
		return
	}
	b, err := json.Marshal(s)
	if err != nil {
		return
	}
	add(c, "signal_collector", metric, string(b), s.DetectedAt)
}

func mergeSignals(client string, fresh []Signal) int {
	signalMu.Lock()
	existing := signalState.Signals[client]
	byFP := map[string]Signal{}
	for _, s := range existing {
		byFP[s.Fingerprint] = s
	}
	newCount := 0
	for _, s := range fresh {
		if old, ok := byFP[s.Fingerprint]; ok {
			if old.DetectedAt != "" {
				s.DetectedAt = old.DetectedAt
			}
		} else {
			newCount++
		}
		byFP[s.Fingerprint] = s
	}
	merged := make([]Signal, 0, len(byFP))
	for _, s := range byFP {
		merged = append(merged, s)
	}
	sort.SliceStable(merged, func(i, j int) bool { return merged[i].DetectedAt > merged[j].DetectedAt })
	if len(merged) > 500 {
		merged = merged[:500]
	}
	signalState.Signals[client] = merged
	signalState.UpdatedAt = nowISO()
	signalMu.Unlock()

	for _, s := range fresh {
		persistSignalObservation(s)
	}
	return newCount
}

func restoreSignalsFromObservations() {
	signalMu.Lock()
	if signalRestored {
		signalMu.Unlock()
		return
	}
	signalRestored = true
	signalMu.Unlock()

	for _, slug := range signalEligibleSlugs() {
		mu.Lock()
		c := store.Clients[slug]
		var obs []Observation
		if c != nil {
			obs = append([]Observation(nil), c.Observations...)
		}
		mu.Unlock()
		if c == nil {
			continue
		}
		rows := []Signal{}
		for _, o := range obs {
			if o.SourceKey != "signal_collector" || !strings.HasPrefix(o.MetricKey, "signal_event_") {
				continue
			}
			raw, ok := o.Value.(string)
			if !ok || raw == "" {
				continue
			}
			var s Signal
			if json.Unmarshal([]byte(raw), &s) == nil && s.Fingerprint != "" {
				rows = append(rows, s)
			}
		}
		if len(rows) > 0 {
			mergeSignals(slug, rows)
		}
	}
}

func loadSignalStateFile() {
	b, err := os.ReadFile(signalDataPath())
	if err != nil {
		return
	}
	var state SignalState
	if json.Unmarshal(b, &state) != nil || state.Signals == nil {
		return
	}
	signalMu.Lock()
	signalState = state
	signalMu.Unlock()
}

func saveSignalStateFile() {
	signalMu.RLock()
	b, err := json.MarshalIndent(signalState, "", "  ")
	signalMu.RUnlock()
	if err != nil {
		return
	}
	_ = os.MkdirAll(appDataDir(), 0755)
	_ = os.WriteFile(signalDataPath(), b, 0644)
}

func runSignalCollector() map[string]interface{} {
	restoreSignalsFromObservations()
	started := time.Now()
	freshCounts := map[string]int{}
	newCounts := map[string]int{}
	for _, slug := range signalEligibleSlugs() {
		c := signalClientSnapshot(slug)
		if c == nil {
			continue
		}
		fresh := collectClientSignals(c)
		freshCounts[slug] = len(fresh)
		newCounts[slug] = mergeSignals(slug, fresh)
	}
	saveSignalStateFile()
	saveStore()
	return map[string]interface{}{
		"ok":           true,
		"updated_at":   nowISO(),
		"duration_ms":  time.Since(started).Milliseconds(),
		"fresh_counts": freshCounts,
		"new_counts":   newCounts,
	}
}

func collectorWriteJSON(w http.ResponseWriter, value interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	_ = json.NewEncoder(w).Encode(value)
}

func signalListHandler(w http.ResponseWriter, r *http.Request) {
	restoreSignalsFromObservations()
	client := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("client")))
	limit := 100
	if raw := r.URL.Query().Get("limit"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}
	scope := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("scope")))
	signalMu.RLock()
	defer signalMu.RUnlock()
	if client != "" {
		rows := append([]Signal(nil), signalState.Signals[client]...)
		if scope == "external" || scope == "owned" {
			filtered := rows[:0]
			for _, s := range rows {
				if s.Scope == scope {
					filtered = append(filtered, s)
				}
			}
			rows = filtered
		}
		if len(rows) > limit {
			rows = rows[:limit]
		}
		collectorWriteJSON(w, map[string]interface{}{"client": client, "updated_at": signalState.UpdatedAt, "signals": rows})
		return
	}
	collectorWriteJSON(w, signalState)
}

func signalRefreshHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	collectorWriteJSON(w, runSignalCollector())
}

func signalHealthHandler(w http.ResponseWriter, r *http.Request) {
	restoreSignalsFromObservations()
	signalMu.RLock()
	counts := map[string]int{}
	external := map[string]int{}
	for client, rows := range signalState.Signals {
		counts[client] = len(rows)
		for _, s := range rows {
			if s.Scope == "external" {
				external[client]++
			}
		}
	}
	updated := signalState.UpdatedAt
	signalMu.RUnlock()
	collectorWriteJSON(w, map[string]interface{}{
		"ok":               true,
		"updated_at":       updated,
		"interval_minutes": 10,
		"clients":          counts,
		"external":         external,
	})
}

func init() {
	loadSignalStateFile()
	http.HandleFunc("/api/signals", signalListHandler)
	http.HandleFunc("/api/signals/refresh", signalRefreshHandler)
	http.HandleFunc("/api/signals/health", signalHealthHandler)
	go func() {
		// Avoid competing with the existing startup migrations and probes.
		time.Sleep(90 * time.Second)
		runSignalCollector()
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			runSignalCollector()
		}
	}()
}

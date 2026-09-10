package main

import (
	"encoding/xml"
	"log"
	"net/url"
	"sort"
	"strings"
	"sync"
	"time"
)

// Universal realtime mentions keeps the proven KUB crisis collector intact and
// extends the same discovery principles to every other real Navigator profile:
// fast news discovery, direct publisher polling, stable article identity,
// durable observations and strict per-client separation.
const universalRealtimeMentionInterval = 15 * time.Second

type universalDirectPublisherTarget struct {
	Label    string
	Root     string
	Host     string
	Priority bool
}

var (
	universalDirectStateMu  sync.Mutex
	universalDirectLastPoll = map[string]time.Time{}
)

func universalRealtimeClients() []*Client {
	out := []*Client{}
	for _, slug := range continuousClientSlugs() {
		// KUB retains its dedicated 15-second crisis collector. Wirello is a
		// synthetic demo profile and must never enter real-world monitoring.
		if slug == "kub" || slug == "wirello" {
			continue
		}
		c := continuousClientSnapshot(slug)
		if c == nil || len(universalMentionTerms(c)) == 0 {
			continue
		}
		out = append(out, c)
	}
	return out
}

func universalMentionTerms(c *Client) []string {
	if c == nil {
		return nil
	}
	terms := append([]string{}, signalBrandTerms(c)...)
	switch c.Slug {
	case "aroma":
		terms = append(terms, "Арома АД", "Aroma AD")
	case "bolyarka":
		terms = append(terms, "Пивоварна Болярка", "Bolyarka Brewery")
	case "mollox":
		terms = append(terms, "MOLLOX Bulgaria")
	case "varna-towers":
		terms = append(terms, "Varna Towers Mall")
	case "everbet":
		terms = append(terms, "Евърбет", "Everbet.bg")
	case "astor-garden":
		terms = append(terms, "Astor Garden", "Astor Garden Hotel", "Астор Гардън")
	case "black-sea-center":
		terms = append(terms, "Блек Сий Център")
	}
	if strings.TrimSpace(c.Name) != "" {
		terms = append(terms, strings.TrimSpace(c.Name))
	}

	seen := map[string]bool{}
	out := make([]string, 0, len(terms))
	for _, term := range terms {
		term = strings.TrimSpace(term)
		key := strings.ToLower(term)
		if term == "" || seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, term)
	}
	return out
}

func universalMentionQuery(c *Client) string {
	parts := []string{}
	for _, term := range universalMentionTerms(c) {
		parts = append(parts, `"`+term+`"`)
	}
	return strings.Join(parts, " OR ")
}

func universalMentionHits(c *Client, text string) int {
	low := strings.ToLower(text)
	hits := 0
	for _, term := range universalMentionTerms(c) {
		if strings.Contains(low, strings.ToLower(term)) {
			hits++
		}
	}
	return hits
}

func buildUniversalMentionSignal(c *Client, source, sourceType, rawURL, title, text, published string) (Signal, bool) {
	if c == nil || strings.TrimSpace(rawURL) == "" {
		return Signal{}, false
	}
	title = cleanPostSnippet(title)
	text = cleanPostSnippet(text)
	if text == "" {
		text = title
	}
	hits := universalMentionHits(c, title+" "+text)
	if hits == 0 {
		return Signal{}, false
	}
	relevance := 60.0 + float64(hits-1)*10.0
	if relevance > 100 {
		relevance = 100
	}
	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	scope := signalSourceScope(c, rawURL)
	if sourceType == "news" {
		scope = "external"
	}
	fingerprint := signalHash(c.Slug, rawURL, title, "")
	return Signal{
		ID:          fingerprint[:16],
		Client:      c.Slug,
		Brand:       c.Name,
		Source:      source,
		SourceType:  sourceType,
		Scope:       scope,
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

func universalCanonicalURL(raw string) string {
	u, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || u.Host == "" {
		return strings.TrimSpace(raw)
	}
	u.Host = strings.ToLower(strings.TrimPrefix(u.Host, "www."))
	u.Fragment = ""
	q := u.Query()
	for _, key := range []string{"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ref", "source"} {
		q.Del(key)
	}
	u.RawQuery = q.Encode()
	u.Path = strings.TrimSuffix(u.Path, "/")
	return u.String()
}

func universalMentionIdentityKey(s Signal) string {
	title := strings.Join(strings.Fields(strings.ToLower(strings.TrimSpace(s.Title))), " ")
	return strings.ToLower(strings.TrimSpace(s.Client)) + "|" + strings.ToLower(universalCanonicalURL(s.URL)) + "|" + title
}

func stabilizeUniversalMentionFingerprints(client string, fresh []Signal) []Signal {
	signalMu.RLock()
	existing := append([]Signal(nil), signalState.Signals[client]...)
	signalMu.RUnlock()

	known := make(map[string]Signal, len(existing)+len(fresh))
	for _, s := range existing {
		if key := universalMentionIdentityKey(s); key != "||" {
			known[key] = s
		}
	}

	for i := range fresh {
		key := universalMentionIdentityKey(fresh[i])
		if old, ok := known[key]; ok {
			fresh[i].Fingerprint = old.Fingerprint
			fresh[i].ID = old.ID
			if old.DetectedAt != "" {
				fresh[i].DetectedAt = old.DetectedAt
			}
			continue
		}
		canonical := universalCanonicalURL(fresh[i].URL)
		fp := signalHash(client, canonical, fresh[i].Title, "")
		fresh[i].Fingerprint = fp
		fresh[i].ID = fp[:16]
		known[key] = fresh[i]
	}
	return dedupeSignals(fresh)
}

func collectUniversalRealtimeNews(c *Client) []Signal {
	query := universalMentionQuery(c)
	if query == "" {
		return nil
	}
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(query) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		log.Printf("BLIS_MENTION_REALTIME client=%s source=google status=%d err=%v", c.Slug, status, err)
		return nil
	}
	var feed collectorRSS
	if err := xml.Unmarshal([]byte(body), &feed); err != nil {
		log.Printf("BLIS_MENTION_REALTIME client=%s source=google parse_error=%v", c.Slug, err)
		return nil
	}
	out := make([]Signal, 0, 40)
	for _, item := range feed.Channel.Items {
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		if s, ok := buildUniversalMentionSignal(c, source, "news", item.Link, item.Title, item.Description, item.PubDate); ok {
			out = append(out, s)
			if len(out) >= 40 {
				break
			}
		}
	}
	return out
}

func universalDirectTargets(clients []*Client) []universalDirectPublisherTarget {
	m := map[string]universalDirectPublisherTarget{}
	for _, seed := range kubDirectSeedPublishers {
		root, host := kubDirectRoot(seed.Root)
		if root == "" {
			continue
		}
		m[host] = universalDirectPublisherTarget{Label: seed.Label, Root: root, Host: host}
	}

	signalMu.RLock()
	for _, c := range clients {
		for _, s := range signalState.Signals[c.Slug] {
			root, host := kubDirectRoot(s.URL)
			if root == "" {
				continue
			}
			label := strings.TrimSpace(s.Source)
			if label == "" || strings.EqualFold(label, "web") || strings.Contains(strings.ToLower(label), "google") || strings.Contains(strings.ToLower(label), "bing") {
				label = host
			}
			t := m[host]
			if t.Host == "" {
				t = universalDirectPublisherTarget{Label: label, Root: root, Host: host}
			}
			if t.Label == "" {
				t.Label = label
			}
			t.Priority = true
			m[host] = t
		}
	}
	signalMu.RUnlock()

	out := make([]universalDirectPublisherTarget, 0, len(m))
	for _, t := range m {
		out = append(out, t)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Priority != out[j].Priority {
			return out[i].Priority
		}
		return out[i].Host < out[j].Host
	})
	return out
}

func universalDirectDue(t universalDirectPublisherTarget) bool {
	interval := 90 * time.Second
	if t.Priority {
		interval = 30 * time.Second
	}
	now := time.Now()
	universalDirectStateMu.Lock()
	defer universalDirectStateMu.Unlock()
	if last := universalDirectLastPoll[t.Host]; !last.IsZero() && now.Sub(last) < interval {
		return false
	}
	universalDirectLastPoll[t.Host] = now
	return true
}

func distributeUniversalDirectItem(clients []*Client, out map[string][]Signal, t universalDirectPublisherTarget, rawURL, title, text, published string) {
	for _, c := range clients {
		if len(out[c.Slug]) >= 50 {
			continue
		}
		if s, ok := buildUniversalMentionSignal(c, t.Label, "news", rawURL, title, text, published); ok {
			out[c.Slug] = append(out[c.Slug], s)
		}
	}
}

func scanUniversalDirectTarget(t universalDirectPublisherTarget, clients []*Client) map[string][]Signal {
	out := map[string][]Signal{}
	status, body, _, err := timedFetch(t.Root, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return out
	}

	// First inspect fresh links directly on the publisher surface.
	seenURL := map[string]bool{}
	for _, m := range kubDirectAnchorRE.FindAllStringSubmatch(body, -1) {
		if len(m) < 3 {
			continue
		}
		title := cleanPostSnippet(m[2])
		if title == "" {
			continue
		}
		rawURL := kubDirectURL(t.Root, m[1])
		u, parseErr := url.Parse(rawURL)
		if parseErr != nil || rawURL == "" || !kubDirectRelatedHost(u.Hostname(), t.Host) {
			continue
		}
		key := strings.ToLower(universalCanonicalURL(rawURL))
		if seenURL[key] {
			continue
		}
		seenURL[key] = true
		distributeUniversalDirectItem(clients, out, t, rawURL, title, title, "")
	}

	endpoints := append([]string{}, kubDirectCachedEndpoints(t.Host)...)
	endpoints = append(endpoints, kubDirectFeedEndpoints(body, t.Root, t.Host)...)
	endpointSeen := map[string]bool{}
	feedEndpoints := make([]string, 0, 4)
	for _, endpoint := range endpoints {
		endpoint = strings.TrimSpace(endpoint)
		if endpoint == "" || endpointSeen[endpoint] {
			continue
		}
		endpointSeen[endpoint] = true
		feedEndpoints = append(feedEndpoints, endpoint)
		if len(feedEndpoints) >= 4 {
			break
		}
	}
	kubDirectRememberEndpoints(t.Host, feedEndpoints)

	for _, endpoint := range feedEndpoints {
		feedStatus, feedBody, _, feedErr := timedFetch(endpoint, 3*1024*1024)
		if feedErr != nil || feedStatus < 200 || feedStatus >= 400 {
			continue
		}
		var rss kubDirectRSS
		if xml.Unmarshal([]byte(feedBody), &rss) == nil {
			items := append([]kubDirectRSSItem(nil), rss.Channel.Items...)
			items = append(items, rss.Items...)
			for _, item := range items {
				rawURL := kubDirectURL(endpoint, item.Link)
				u, parseErr := url.Parse(rawURL)
				if parseErr != nil || rawURL == "" || !kubDirectRelatedHost(u.Hostname(), t.Host) {
					continue
				}
				distributeUniversalDirectItem(clients, out, t, rawURL, item.Title, item.Description, item.PubDate)
			}
		}

		var atom kubDirectAtom
		if xml.Unmarshal([]byte(feedBody), &atom) == nil {
			for _, entry := range atom.Entries {
				rawURL := ""
				for _, link := range entry.Links {
					if rawURL == "" || link.Rel == "alternate" {
						rawURL = kubDirectURL(endpoint, link.Href)
					}
				}
				u, parseErr := url.Parse(rawURL)
				if parseErr != nil || rawURL == "" || !kubDirectRelatedHost(u.Hostname(), t.Host) {
					continue
				}
				published := entry.Published
				if published == "" {
					published = entry.Updated
				}
				text := entry.Summary
				if text == "" {
					text = entry.Content
				}
				distributeUniversalDirectItem(clients, out, t, rawURL, entry.Title, text, published)
			}
		}
	}
	return out
}

func collectUniversalDirectMentions(clients []*Client) map[string][]Signal {
	targets := universalDirectTargets(clients)
	due := make([]universalDirectPublisherTarget, 0, len(targets))
	for _, t := range targets {
		if universalDirectDue(t) {
			due = append(due, t)
		}
	}
	if len(due) == 0 {
		return map[string][]Signal{}
	}

	type result struct{ rows map[string][]Signal }
	sem := make(chan struct{}, 6)
	ch := make(chan result, len(due))
	var wg sync.WaitGroup
	for _, target := range due {
		t := target
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			rows := scanUniversalDirectTarget(t, clients)
			<-sem
			ch <- result{rows: rows}
		}()
	}
	wg.Wait()
	close(ch)

	out := map[string][]Signal{}
	for r := range ch {
		for slug, rows := range r.rows {
			out[slug] = append(out[slug], rows...)
		}
	}
	return out
}

func runUniversalRealtimeMentionCycle() {
	// Share the lock with the existing generic monitoring cycles so expensive
	// public-source passes cannot write the same client state concurrently.
	if !continuousMonitoringMu.TryLock() {
		return
	}
	defer continuousMonitoringMu.Unlock()

	restoreSignalsFromObservations()
	clients := universalRealtimeClients()
	if len(clients) == 0 {
		return
	}

	direct := collectUniversalDirectMentions(clients)
	totalFresh, totalNew := 0, 0
	for _, c := range clients {
		fresh := collectUniversalRealtimeNews(c)
		fresh = append(fresh, direct[c.Slug]...)
		fresh = stabilizeUniversalMentionFingerprints(c.Slug, fresh)
		if len(fresh) == 0 {
			continue
		}
		totalFresh += len(fresh)
		totalNew += mergeSignals(c.Slug, fresh)
	}
	sanitizeKnownSignalFalsePositives()
	saveSignalStateFile()
	saveStore()
	log.Printf("BLIS_MENTION_REALTIME clients=%d fresh=%d new=%d", len(clients), totalFresh, totalNew)
}

func init() {
	go func() {
		// Run shortly after startup, then keep discovering while the Navigator
		// process is alive. The separate availability probe keeps production warm.
		time.Sleep(5 * time.Second)
		for {
			runUniversalRealtimeMentionCycle()
			time.Sleep(universalRealtimeMentionInterval)
		}
	}()
}

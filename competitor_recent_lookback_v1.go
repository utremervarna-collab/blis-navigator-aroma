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

// competitorRecentLookbackV1 keeps the competitor intelligence stream focused
// on the latest three calendar months. It supplements the fast realtime lane
// with a deeper bounded Google News lookback, without increasing the frequency
// of the normal 2-minute collector.
const competitorRecentLookbackInterval = 15 * time.Minute

func competitorRecentCutoff() time.Time {
	return time.Now().UTC().AddDate(0, -3, 0)
}

// The deep three-month query is intentionally broader than the realtime query.
// Relevance is enforced after retrieval. This prevents a recent article from
// disappearing just because its headline is about an event, investment or
// campaign rather than repeating a sector keyword used by the fast lane.
func competitorRecentQuery(c *Client, t competitorSignalTarget) string {
	aliases := t.Aliases
	if len(aliases) > 4 {
		aliases = aliases[:4]
	}
	parts := make([]string, 0, len(aliases))
	seen := map[string]bool{}
	for _, alias := range aliases {
		alias = strings.TrimSpace(alias)
		key := strings.ToLower(alias)
		if alias == "" || seen[key] {
			continue
		}
		seen[key] = true
		parts = append(parts, `"`+alias+`"`)
	}
	if len(parts) == 0 {
		return ""
	}
	return "(" + strings.Join(parts, " OR ") + ") after:" + competitorRecentCutoff().Format("2006-01-02")
}

func parseCompetitorPublished(raw string) (time.Time, bool) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return time.Time{}, false
	}
	layouts := []string{
		time.RFC1123Z,
		time.RFC1123,
		time.RFC3339,
		"2006-01-02",
		"Mon, 2 Jan 2006 15:04:05 MST",
		"Mon, 02 Jan 2006 15:04:05 MST",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, raw); err == nil {
			return t.UTC(), true
		}
	}
	return time.Time{}, false
}

func explicitZagorkaCompanyMention(title, text string) bool {
	low := strings.ToLower(title + " " + text)
	if !strings.Contains(low, "загорка") && !strings.Contains(low, "zagorka") {
		return false
	}
	for _, evidence := range []string{
		"загорка ад", "загорка а.д.", "пивоварна загорка", "пивоварната загорка",
		"zagorka ad", "zagorka brewery", "zagorka company",
		"организиран от загорка", "организира от загорка", "организирано от загорка",
		"организатор загорка", "съорганизатор загорка", "съорганизира загорка",
		"партньор загорка", "с подкрепата на загорка",
	} {
		if strings.Contains(low, evidence) {
			return true
		}
	}
	// Some event coverage names the municipality first and the brewery second.
	if strings.Contains(low, "организ") && strings.Contains(low, "загорка") &&
		(strings.Contains(low, "бира") || strings.Contains(low, "beer") || strings.Contains(low, "пивовар")) {
		return true
	}
	return false
}

func buildRecentCompetitorSignal(c *Client, t competitorSignalTarget, source, rawURL, title, text, published string) (Signal, bool) {
	title = cleanPostSnippet(title)
	text = cleanPostSnippet(text)
	if text == "" {
		text = title
	}
	if strings.TrimSpace(rawURL) == "" {
		return Signal{}, false
	}
	publishedAt, ok := parseCompetitorPublished(published)
	if !ok || publishedAt.Before(competitorRecentCutoff()) {
		return Signal{}, false
	}

	relevance := competitorRelevance(c, t, title, text)
	if strings.EqualFold(strings.TrimSpace(t.Name), "Загорка") && explicitZagorkaCompanyMention(title, text) {
		// Do not throw away Beerfest/event coverage merely because it also says
		// "парк Загорка" when the same item explicitly identifies the brewery.
		if competitorAliasHit(t, strings.ToLower(title+" "+text)) {
			relevance = 96
		}
	}
	if relevance < 60 {
		return Signal{}, false
	}

	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	fingerprint := signalHash(c.Slug+"|competitor|recent90|"+t.Key, rawURL, title, text)
	return Signal{
		ID:          fingerprint[:16],
		Client:      c.Slug,
		Brand:       t.Name,
		Source:      source,
		SourceType:  "news",
		Scope:       "competitor",
		URL:         rawURL,
		Title:       title,
		Text:        text,
		PublishedAt: publishedAt.Format(time.RFC3339),
		DetectedAt:  nowISO(),
		Relevance:   relevance,
		Sentiment:   sentiment,
		Topic:       signalTopic(title + " " + text),
		RiskScore:   risk,
		Severity:    signalSeverity(risk),
		Fingerprint: fingerprint,
	}, true
}

func collectRecentCompetitorNews(c *Client, t competitorSignalTarget) []Signal {
	q := competitorRecentQuery(c, t)
	if q == "" {
		return nil
	}
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(q) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 4*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed competitorRSS
	if xml.Unmarshal([]byte(body), &feed) != nil {
		return nil
	}

	out := make([]Signal, 0, 100)
	seen := map[string]bool{}
	for _, item := range feed.Channel.Items {
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		s, ok := buildRecentCompetitorSignal(c, t, source, item.Link, item.Title, item.Description, item.PubDate)
		if !ok || seen[s.Fingerprint] {
			continue
		}
		seen[s.Fingerprint] = true
		out = append(out, s)
		if len(out) >= 100 {
			break
		}
	}
	sort.SliceStable(out, func(i, j int) bool {
		return out[i].PublishedAt > out[j].PublishedAt
	})
	return out
}

type competitorRecentResult struct {
	slug string
	rows []Signal
}

// runCompetitorRecentLookback returns false only when another monitoring pass
// currently owns the collector mutex. Startup retries use that signal so the
// first three-month backfill cannot silently be postponed for 15 minutes.
func runCompetitorRecentLookback() bool {
	if !continuousMonitoringMu.TryLock() {
		return false
	}
	defer continuousMonitoringMu.Unlock()

	restoreSignalsFromObservations()
	tasks := universalRealtimeCompetitorTasks()
	if len(tasks) == 0 {
		return true
	}

	sem := make(chan struct{}, 3)
	results := make(chan competitorRecentResult, len(tasks))
	var wg sync.WaitGroup
	for _, task := range tasks {
		t := task
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			rows := collectRecentCompetitorNews(t.client, t.target)
			<-sem
			results <- competitorRecentResult{slug: t.client.Slug, rows: rows}
		}()
	}
	wg.Wait()
	close(results)

	byClient := map[string][]Signal{}
	for result := range results {
		byClient[result.slug] = append(byClient[result.slug], result.rows...)
	}

	totalFresh, totalNew := 0, 0
	for slug, rows := range byClient {
		seen := map[string]bool{}
		clean := make([]Signal, 0, len(rows))
		for _, s := range rows {
			if s.Fingerprint == "" || seen[s.Fingerprint] {
				continue
			}
			seen[s.Fingerprint] = true
			clean = append(clean, s)
		}
		sort.SliceStable(clean, func(i, j int) bool { return clean[i].PublishedAt > clean[j].PublishedAt })
		if len(clean) > 300 {
			clean = clean[:300]
		}
		totalFresh += len(clean)
		if len(clean) > 0 {
			totalNew += mergeSignals(slug, clean)
		}
	}
	if totalNew > 0 {
		sanitizeKnownSignalFalsePositives()
		saveSignalStateFile()
		saveStore()
	}
	log.Printf("BLIS_COMPETITOR_3M_LOOKBACK tasks=%d fresh=%d new=%d cutoff=%s", len(tasks), totalFresh, totalNew, competitorRecentCutoff().Format("2006-01-02"))
	return true
}

func init() {
	go func() {
		// Guarantee an initial backfill even if the first attempt overlaps the
		// normal realtime competitor cycle. Retries remain bounded and spaced.
		time.Sleep(70 * time.Second)
		for attempt := 1; attempt <= 8; attempt++ {
			if runCompetitorRecentLookback() {
				break
			}
			log.Printf("BLIS_COMPETITOR_3M_LOOKBACK_BUSY retry=%d", attempt)
			time.Sleep(20 * time.Second)
		}
		ticker := time.NewTicker(competitorRecentLookbackInterval)
		defer ticker.Stop()
		for range ticker.C {
			_ = runCompetitorRecentLookback()
		}
	}()
}

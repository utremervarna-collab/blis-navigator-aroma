package main

import (
	"html"
	"log"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
)

// This low-frequency verifier complements Google News with ordinary indexed
// web pages. It follows a small bounded set of search results, verifies the
// publisher page, extracts an explicit publication date and only then admits
// the mention into the three-month intelligence stream.
const competitorRecentWebInterval = 45 * time.Minute

var (
	recentWebTitleRE = regexp.MustCompile(`(?is)<title[^>]*>(.*?)</title>`)
	recentWebTagRE   = regexp.MustCompile(`(?is)<[^>]+>`)
	recentWebSpaceRE = regexp.MustCompile(`\s+`)
	recentWebJSONDateRE = regexp.MustCompile(`(?is)["']datePublished["']\s*:\s*["']([^"']+)["']`)
	recentWebMetaDateRE = regexp.MustCompile(`(?is)<meta[^>]+(?:property|name|itemprop)\s*=\s*["'](?:article:published_time|og:published_time|datePublished|date|pubdate|publishdate|publish-date)["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>`)
	recentWebMetaDateReverseRE = regexp.MustCompile(`(?is)<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+(?:property|name|itemprop)\s*=\s*["'](?:article:published_time|og:published_time|datePublished|date|pubdate|publishdate|publish-date)["'][^>]*>`)
	recentWebTimeRE = regexp.MustCompile(`(?is)<time[^>]+datetime\s*=\s*["']([^"']+)["'][^>]*>`)
	recentWebCanonicalRE = regexp.MustCompile(`(?is)<link[^>]+rel\s*=\s*["'][^"']*canonical[^"']*["'][^>]+href\s*=\s*["']([^"']+)["'][^>]*>`)
	recentWebCanonicalReverseRE = regexp.MustCompile(`(?is)<link[^>]+href\s*=\s*["']([^"']+)["'][^>]+rel\s*=\s*["'][^"']*canonical[^"']*["'][^>]*>`)
)

type recentWebCandidate struct {
	URL     string
	Title   string
	Snippet string
}

type recentWebResult struct {
	slug string
	rows []Signal
}

func recentWebText(raw string) string {
	v := recentWebTagRE.ReplaceAllString(raw, " ")
	v = html.UnescapeString(v)
	v = recentWebSpaceRE.ReplaceAllString(v, " ")
	v = strings.TrimSpace(v)
	if len(v) > 24000 {
		v = v[:24000]
	}
	return v
}

func recentWebTitle(raw, fallback string) string {
	if m := recentWebTitleRE.FindStringSubmatch(raw); len(m) > 1 {
		if v := cleanPostSnippet(html.UnescapeString(m[1])); v != "" {
			return v
		}
	}
	return cleanPostSnippet(fallback)
}

func recentWebCanonical(raw, fallback string) string {
	for _, re := range []*regexp.Regexp{recentWebCanonicalRE, recentWebCanonicalReverseRE} {
		if m := re.FindStringSubmatch(raw); len(m) > 1 {
			v := html.UnescapeString(strings.TrimSpace(m[1]))
			if strings.HasPrefix(strings.ToLower(v), "http://") || strings.HasPrefix(strings.ToLower(v), "https://") {
				return v
			}
		}
	}
	return fallback
}

func parseRecentWebDate(raw string) (time.Time, bool) {
	v := strings.TrimSpace(html.UnescapeString(raw))
	if v == "" {
		return time.Time{}, false
	}
	layouts := []string{
		time.RFC3339Nano, time.RFC3339, time.RFC1123Z, time.RFC1123,
		"2006-01-02 15:04:05-07:00", "2006-01-02 15:04:05", "2006-01-02",
		"02.01.2006 15:04", "02.01.2006", "02/01/2006",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, v); err == nil {
			return t.UTC(), true
		}
	}
	// Metadata sometimes appends microseconds or a timezone label after the
	// ISO date. A verified calendar date is still sufficient for chronology.
	for _, re := range []*regexp.Regexp{
		regexp.MustCompile(`\b(20\d{2}-\d{2}-\d{2})\b`),
		regexp.MustCompile(`\b(\d{2}\.\d{2}\.20\d{2})\b`),
	} {
		if m := re.FindStringSubmatch(v); len(m) > 1 {
			for _, layout := range []string{"2006-01-02", "02.01.2006"} {
				if t, err := time.Parse(layout, m[1]); err == nil {
					return t.UTC(), true
				}
			}
		}
	}
	return time.Time{}, false
}

func recentWebPublished(raw string) (time.Time, bool) {
	for _, re := range []*regexp.Regexp{recentWebJSONDateRE, recentWebMetaDateRE, recentWebMetaDateReverseRE, recentWebTimeRE} {
		for _, m := range re.FindAllStringSubmatch(raw, 6) {
			if len(m) < 2 {
				continue
			}
			if t, ok := parseRecentWebDate(m[1]); ok && !t.After(time.Now().UTC().Add(48*time.Hour)) {
				return t, true
			}
		}
	}
	return time.Time{}, false
}

func recentWebSource(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return "Web"
	}
	h := strings.TrimPrefix(strings.ToLower(u.Host), "www.")
	if h == "" {
		return "Web"
	}
	return h
}

func recentWebSearchCandidates(c *Client, t competitorSignalTarget) []recentWebCandidate {
	q := competitorRecentQuery(c, t)
	if q == "" {
		return nil
	}
	// Bing is used only for discovery. Inclusion requires a successful fetch of
	// the publisher page plus an explicit page publication date.
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(q) + "&count=30&setlang=bg"
	status, body, _, err := timedFetch(raw, 4*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	out := make([]recentWebCandidate, 0, 12)
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
		u, err := url.Parse(rawURL)
		if err != nil || (u.Scheme != "http" && u.Scheme != "https") {
			continue
		}
		host := strings.ToLower(u.Host)
		if host == "" || strings.Contains(host, "bing.com") || strings.Contains(host, "microsoft.com") {
			continue
		}
		key := strings.ToLower(strings.TrimRight(rawURL, "/"))
		if seen[key] {
			continue
		}
		seen[key] = true
		snippet := ""
		if pm := collectorPRE.FindStringSubmatch(block[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(pm[1])
		}
		out = append(out, recentWebCandidate{URL: rawURL, Title: cleanPostSnippet(lm[2]), Snippet: snippet})
		if len(out) >= 12 {
			break
		}
	}
	return out
}

func verifyRecentWebCandidate(c *Client, t competitorSignalTarget, candidate recentWebCandidate) (Signal, bool) {
	status, raw, _, err := timedFetch(candidate.URL, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 || raw == "" {
		return Signal{}, false
	}
	published, ok := recentWebPublished(raw)
	if !ok || published.Before(competitorRecentCutoff()) {
		return Signal{}, false
	}
	canonical := recentWebCanonical(raw, candidate.URL)
	title := recentWebTitle(raw, candidate.Title)
	pageText := recentWebText(raw)
	if len(pageText) > 12000 {
		pageText = pageText[:12000]
	}
	combined := strings.TrimSpace(candidate.Snippet + " " + pageText)
	relevance := competitorRelevance(c, t, title, combined)
	if strings.EqualFold(strings.TrimSpace(t.Name), "Загорка") && explicitZagorkaCompanyMention(title, combined) && competitorAliasHit(t, strings.ToLower(title+" "+combined)) {
		relevance = 96
	}
	if relevance < 60 {
		return Signal{}, false
	}
	text := cleanPostSnippet(candidate.Snippet)
	if text == "" {
		text = cleanPostSnippet(pageText)
	}
	if len(text) > 700 {
		text = text[:700]
	}
	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	fingerprint := signalHash(c.Slug+"|competitor|verifiedweb|"+t.Key, canonical, title, published.Format("2006-01-02"))
	return Signal{
		ID:          fingerprint[:16],
		Client:      c.Slug,
		Brand:       t.Name,
		Source:      recentWebSource(canonical),
		SourceType:  "web",
		Scope:       "competitor",
		URL:         canonical,
		Title:       title,
		Text:        text,
		PublishedAt: published.Format(time.RFC3339),
		DetectedAt:  nowISO(),
		Relevance:   relevance,
		Sentiment:   sentiment,
		Topic:       signalTopic(title + " " + text),
		RiskScore:   risk,
		Severity:    signalSeverity(risk),
		Fingerprint: fingerprint,
	}, true
}

func collectRecentVerifiedWeb(c *Client, t competitorSignalTarget) []Signal {
	candidates := recentWebSearchCandidates(c, t)
	out := make([]Signal, 0, 12)
	for _, candidate := range candidates {
		if s, ok := verifyRecentWebCandidate(c, t, candidate); ok {
			out = append(out, s)
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].PublishedAt > out[j].PublishedAt })
	return out
}

func runCompetitorRecentWebVerifier() bool {
	if !continuousMonitoringMu.TryLock() {
		return false
	}
	defer continuousMonitoringMu.Unlock()

	tasks := universalRealtimeCompetitorTasks()
	if len(tasks) == 0 {
		return true
	}
	sem := make(chan struct{}, 2)
	results := make(chan recentWebResult, len(tasks))
	var wg sync.WaitGroup
	for _, task := range tasks {
		task := task
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			rows := collectRecentVerifiedWeb(task.client, task.target)
			<-sem
			results <- recentWebResult{slug: task.client.Slug, rows: rows}
		}()
	}
	wg.Wait()
	close(results)

	byClient := map[string][]Signal{}
	for result := range results {
		byClient[result.slug] = append(byClient[result.slug], result.rows...)
	}
	totalVerified, totalNew := 0, 0
	for slug, rows := range byClient {
		rows = dedupeCompetitorSignals(rows)
		totalVerified += len(rows)
		if len(rows) > 0 {
			totalNew += mergeSignals(slug, rows)
		}
	}
	if totalNew > 0 {
		sanitizeKnownSignalFalsePositives()
		saveSignalStateFile()
		saveStore()
	}
	log.Printf("BLIS_COMPETITOR_3M_WEB_VERIFY tasks=%d verified=%d new=%d cutoff=%s", len(tasks), totalVerified, totalNew, competitorRecentCutoff().Format("2006-01-02"))
	return true
}

func init() {
	go func() {
		// Let the cheaper RSS backfill go first, then verify ordinary web pages.
		time.Sleep(150 * time.Second)
		for attempt := 1; attempt <= 6; attempt++ {
			if runCompetitorRecentWebVerifier() {
				break
			}
			time.Sleep(30 * time.Second)
		}
		ticker := time.NewTicker(competitorRecentWebInterval)
		defer ticker.Stop()
		for range ticker.C {
			_ = runCompetitorRecentWebVerifier()
		}
	}()
}

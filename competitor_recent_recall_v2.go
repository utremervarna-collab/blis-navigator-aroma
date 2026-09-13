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

// This companion pass closes two quality gaps in the three-month competitor
// stream: ambiguous geographic uses of beer-brand names and missed recent
// publisher pages that are not ranked by the normal realtime queries.
const competitorRecentRecallV2Interval = 20 * time.Minute

var (
	recallVisibleDateDMY = regexp.MustCompile(`(?is)(?:публикувано\s+на|публикувано|от|published(?:\s+on)?|date)\s*:?\s*(\d{1,2}[./-]\d{1,2}[./-]20\d{2})(?:\s*[,г\.]*\s*(\d{1,2}:\d{2}))?`)
	recallVisibleDateISO = regexp.MustCompile(`(?is)(?:публикувано\s+на|публикувано|published(?:\s+on)?|date)\s*:?\s*(20\d{2}-\d{2}-\d{2})(?:[T\s]+(\d{1,2}:\d{2}))?`)
)

func normalizedCompetitorTextV2(v string) string {
	v = strings.ToLower(v)
	v = strings.NewReplacer("„", " ", "“", " ", `\"`, " ", "'", " ", "«", " ", "»", " ", "–", " ", "—", " ").Replace(v)
	return strings.Join(strings.Fields(v), " ")
}

func beerCompanyEvidenceV2(v string) bool {
	low := normalizedCompetitorTextV2(v)
	for _, term := range []string{
		"бира", "пиво", "пивовар", "пивоварна", "beer", "brewery", "brewing", "lager",
		"heineken", "carlsberg", "molson coors", "zagorka ad", "загорка ад", "загорка а.д.",
		"каменица ад", "каменица а.д.", "kamenitza", "шуменско пиво", "шуменско специално",
	} {
		if strings.Contains(low, term) {
			return true
		}
	}
	return false
}

func explicitCurrentKamenitzaEvidenceV2(v string) bool {
	low := normalizedCompetitorTextV2(v)
	for _, term := range []string{
		"каменица ад", "каменица а.д.", "kamenitza", "molson coors", "бира каменица", "каменица бира",
		"пивоварна каменица", "пивоварната каменица", "каменица 1881",
	} {
		if strings.Contains(low, term) {
			return true
		}
	}
	return false
}

func bolyarkaCompetitorNoiseV2(name, title, body string) bool {
	brand := normalizedCompetitorTextV2(name)
	titleLow := normalizedCompetitorTextV2(title)
	allLow := normalizedCompetitorTextV2(title + " " + body)

	switch brand {
	case "загорка":
		return zagorkaParkOnly(name, title, body)
	case "каменица":
		// Kamenitza is also a Plovdiv place name. Location/history stories do not
		// belong in the current competitive stream unless the current beer brand
		// is explicitly part of the story.
		if strings.Contains(titleLow, "парк каменица") || strings.Contains(titleLow, "хълм каменица") ||
			strings.Contains(titleLow, "кв каменица") || strings.Contains(titleLow, "квартал каменица") ||
			strings.Contains(titleLow, "старата пивоварна каменица") || strings.Contains(titleLow, "стара пивоварна каменица") {
			return !explicitCurrentKamenitzaEvidenceV2(titleLow)
		}
		return !beerCompanyEvidenceV2(allLow)
	case "шуменско":
		// "Шуменско" is also a geographic adjective. Require explicit beer or
		// brewing evidence for every item before treating it as the competitor.
		return !beerCompanyEvidenceV2(allLow)
	default:
		return false
	}
}

func sanitizeBolyarkaCompetitorNoiseV2() int {
	removed := 0
	signalMu.Lock()
	rows := signalState.Signals["bolyarka"]
	if len(rows) > 0 {
		clean := make([]Signal, 0, len(rows))
		for _, s := range rows {
			if s.Scope == "competitor" && bolyarkaCompetitorNoiseV2(s.Brand, s.Title, s.Text) {
				removed++
				continue
			}
			clean = append(clean, s)
		}
		if removed > 0 {
			signalState.Signals["bolyarka"] = clean
		}
	}
	signalMu.Unlock()
	if removed > 0 {
		saveSignalStateFile()
		saveStore()
		log.Printf("BLIS_BOLYARKA_COMPETITOR_QUALITY_V2 removed=%d", removed)
	}
	return removed
}

func recallAliasBaseV2(t competitorSignalTarget) string {
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
	return "(" + strings.Join(parts, " OR ") + ")"
}

func recentRecallQueriesV2(c *Client, t competitorSignalTarget) []string {
	base := recallAliasBaseV2(t)
	if base == "" {
		return nil
	}
	queries := []string{base}
	if c != nil {
		if ctx := competitorContextTerms(c); len(ctx) > 0 {
			queries = append(queries, base+" ("+strings.Join(ctx, " OR ")+")")
		}
	}
	if c != nil && c.Slug == "bolyarka" {
		queries = append(queries, base+" (бира OR пивоварна OR beer OR brewery OR фестивал OR BEERфест OR организатор OR партньор OR инвестиция)")
		if strings.EqualFold(strings.TrimSpace(t.Name), "Загорка") {
			// These bounded discovery queries target publishers that have current
			// source-backed BEERfest coverage. They do not bypass page/date checks.
			queries = append(queries,
				`site:bta.bg "Загорка" BEERфест`,
				`site:nbp.bg "Загорка" BEERфест`,
				`site:zagora.bg "Загорка" BEERфест`,
				`site:actualno.com "Загорка" BEERфест`,
			)
		}
	}
	seen := map[string]bool{}
	out := make([]string, 0, len(queries))
	for _, q := range queries {
		q = strings.TrimSpace(q)
		key := strings.ToLower(q)
		if q == "" || seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, q)
	}
	return out
}

func recentRecallBingCandidatesV2(query string) []recentWebCandidate {
	if strings.TrimSpace(query) == "" {
		return nil
	}
	rawURL := "https://www.bing.com/search?q=" + url.QueryEscape(query) + "&count=50&setlang=bg"
	status, body, _, err := timedFetch(rawURL, 4*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	out := make([]recentWebCandidate, 0, 20)
	seen := map[string]bool{}
	for _, block := range collectorBlockRE.FindAllStringSubmatch(body, -1) {
		if len(block) < 2 {
			continue
		}
		lm := collectorLinkRE.FindStringSubmatch(block[1])
		if len(lm) < 3 {
			continue
		}
		candidateURL := html.UnescapeString(strings.TrimSpace(lm[1]))
		u, err := url.Parse(candidateURL)
		if err != nil || (u.Scheme != "http" && u.Scheme != "https") {
			continue
		}
		host := strings.ToLower(u.Host)
		if host == "" || strings.Contains(host, "bing.com") || strings.Contains(host, "microsoft.com") {
			continue
		}
		key := strings.ToLower(strings.TrimRight(candidateURL, "/"))
		if seen[key] {
			continue
		}
		seen[key] = true
		snippet := ""
		if pm := collectorPRE.FindStringSubmatch(block[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(pm[1])
		}
		out = append(out, recentWebCandidate{URL: candidateURL, Title: cleanPostSnippet(lm[2]), Snippet: snippet})
		if len(out) >= 20 {
			break
		}
	}
	return out
}

func knownRecentBolyarkaCandidatesV2(t competitorSignalTarget) []recentWebCandidate {
	if !strings.EqualFold(strings.TrimSpace(t.Name), "Загорка") {
		return nil
	}
	// Real publisher pages discovered in the current three-month window. The
	// page itself is still fetched and must pass date + entity verification.
	return []recentWebCandidate{
		{URL: "https://www.bta.bg/bg/news/bulgaria/1190353", Title: "BEERфест 2026 – Стара Загора"},
		{URL: "https://www.bta.bg/bg/news/bulgaria/regional-news/stara-zagora/1197081-edinadesetoto-izdanie-na-stanaliya-traditsionen-petdneven-beerfest-v-stara-zag", Title: "BEERфест 2026 – откриване"},
		{URL: "https://www.bta.bg/bg/news/bulgaria/oficial-messages/1197296-obshtina-stara-zagora-muzika-talant-i-emotsiya-dadoha-start-na-11-iya-beerfest", Title: "BEERфест 2026 – старт"},
		{URL: "https://www.nbp.bg/nbp/%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%B0%D1%82-%D0%B4%D0%BD%D0%B8-%D0%B4%D0%BE-%D1%81%D1%82%D0%B0%D1%80%D1%82%D0%B0-%D0%BD%D0%B0-beer%D1%84%D0%B5%D1%81%D1%82-2026-%D0%B2-%D1%81%D1%82%D0%B0%D1%80%D0%B0/", Title: "Остават дни до старта на BEERфест 2026"},
		{URL: "https://www.actualno.com/starazagora/rekorden-broj-posetiteli-na-beerfestyt-v-stara-zagora-news_2637441.html", Title: "Рекорден брой посетители на BEERфестът"},
	}
}

func visiblePublishedDateV2(raw string) (time.Time, bool) {
	for _, re := range []*regexp.Regexp{recallVisibleDateDMY, recallVisibleDateISO} {
		for _, m := range re.FindAllStringSubmatch(raw, 12) {
			if len(m) < 2 {
				continue
			}
			datePart := strings.TrimSpace(m[1])
			timePart := ""
			if len(m) > 2 {
				timePart = strings.TrimSpace(m[2])
			}
			candidates := []string{datePart}
			if timePart != "" {
				candidates = append([]string{datePart + " " + timePart}, candidates...)
			}
			for _, candidate := range candidates {
				for _, layout := range []string{"02.01.2006 15:04", "02/01/2006 15:04", "02-01-2006 15:04", "2006-01-02 15:04", "02.01.2006", "02/01/2006", "02-01-2006", "2006-01-02"} {
					if d, err := time.Parse(layout, candidate); err == nil && !d.After(time.Now().UTC().Add(48*time.Hour)) {
						return d.UTC(), true
					}
				}
			}
		}
	}
	return time.Time{}, false
}

func verifyRecentRecallCandidateV2(c *Client, t competitorSignalTarget, candidate recentWebCandidate) (Signal, bool) {
	status, raw, _, err := timedFetch(candidate.URL, 4*1024*1024)
	if err != nil || status < 200 || status >= 400 || raw == "" {
		return Signal{}, false
	}
	published, ok := recentWebPublished(raw)
	if !ok {
		published, ok = visiblePublishedDateV2(recentWebText(raw))
	}
	if !ok || published.Before(competitorRecentCutoff()) {
		return Signal{}, false
	}
	canonical := recentWebCanonical(raw, candidate.URL)
	title := recentWebTitle(raw, candidate.Title)
	pageText := recentWebText(raw)
	if len(pageText) > 16000 {
		pageText = pageText[:16000]
	}
	combined := strings.TrimSpace(candidate.Snippet + " " + pageText)
	if c != nil && c.Slug == "bolyarka" && bolyarkaCompetitorNoiseV2(t.Name, title, combined) {
		return Signal{}, false
	}
	relevance := competitorRelevance(c, t, title, combined)
	if strings.EqualFold(strings.TrimSpace(t.Name), "Загорка") && explicitZagorkaCompanyMention(title, combined) && competitorAliasHit(t, strings.ToLower(title+" "+combined)) {
		relevance = 98
	}
	if relevance < 60 {
		return Signal{}, false
	}
	text := cleanPostSnippet(candidate.Snippet)
	if text == "" {
		text = cleanPostSnippet(pageText)
	}
	if len(text) > 900 {
		text = text[:900]
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

func collectRecentRecallV2(c *Client, t competitorSignalTarget) []Signal {
	candidates := append([]recentWebCandidate{}, knownRecentBolyarkaCandidatesV2(t)...)
	for _, query := range recentRecallQueriesV2(c, t) {
		candidates = append(candidates, recentRecallBingCandidatesV2(query)...)
	}
	seenURL := map[string]bool{}
	out := make([]Signal, 0, 40)
	for _, candidate := range candidates {
		key := strings.ToLower(strings.TrimRight(strings.TrimSpace(candidate.URL), "/"))
		if key == "" || seenURL[key] {
			continue
		}
		seenURL[key] = true
		if s, ok := verifyRecentRecallCandidateV2(c, t, candidate); ok {
			out = append(out, s)
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].PublishedAt > out[j].PublishedAt })
	if len(out) > 80 {
		out = out[:80]
	}
	return out
}

type recentRecallResultV2 struct {
	slug string
	rows []Signal
}

func runCompetitorRecentRecallV2() bool {
	if !continuousMonitoringMu.TryLock() {
		return false
	}
	defer continuousMonitoringMu.Unlock()

	tasks := universalRealtimeCompetitorTasks()
	if len(tasks) == 0 {
		return true
	}
	sem := make(chan struct{}, 2)
	results := make(chan recentRecallResultV2, len(tasks))
	var wg sync.WaitGroup
	for _, task := range tasks {
		task := task
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			rows := collectRecentRecallV2(task.client, task.target)
			<-sem
			results <- recentRecallResultV2{slug: task.client.Slug, rows: rows}
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
	sanitizeKnownSignalFalsePositives()
	sanitizeBolyarkaCompetitorNoiseV2()
	if totalNew > 0 {
		saveSignalStateFile()
		saveStore()
	}
	log.Printf("BLIS_COMPETITOR_3M_RECALL_V2 tasks=%d verified=%d new=%d cutoff=%s", len(tasks), totalVerified, totalNew, competitorRecentCutoff().Format("2006-01-02"))
	return true
}

func init() {
	go func() {
		// Purge already-persisted geographic collisions promptly after startup.
		time.Sleep(12 * time.Second)
		sanitizeBolyarkaCompetitorNoiseV2()
		qualityTicker := time.NewTicker(20 * time.Second)
		defer qualityTicker.Stop()
		go func() {
			for range qualityTicker.C {
				sanitizeBolyarkaCompetitorNoiseV2()
			}
		}()

		// Run a source-backed recall early, then keep it fresh at a bounded rate.
		time.Sleep(18 * time.Second)
		for attempt := 1; attempt <= 8; attempt++ {
			if runCompetitorRecentRecallV2() {
				break
			}
			time.Sleep(20 * time.Second)
		}
		ticker := time.NewTicker(competitorRecentRecallV2Interval)
		defer ticker.Stop()
		for range ticker.C {
			_ = runCompetitorRecentRecallV2()
		}
	}()
}

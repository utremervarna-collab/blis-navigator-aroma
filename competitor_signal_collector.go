package main

import (
	"encoding/xml"
	"html"
	"net/url"
	"sort"
	"strings"
	"time"
)

// competitorSignalTarget is derived only from competitors already configured
// inside an existing client profile. This collector never creates clients or
// invents competitors.
type competitorSignalTarget struct {
	Key     string
	Name    string
	URL     string
	Aliases []string
}

type competitorRSS struct {
	Channel struct {
		Items []struct {
			Title       string `xml:"title"`
			Link        string `xml:"link"`
			PubDate     string `xml:"pubDate"`
			Description string `xml:"description"`
			Source      string `xml:"source"`
		} `xml:"item"`
	} `xml:"channel"`
}

func competitorAliases(name string) []string {
	parts := strings.FieldsFunc(name, func(r rune) bool { return r == '/' || r == '|' })
	seen := map[string]bool{}
	out := []string{}
	addAlias := func(v string) {
		v = strings.TrimSpace(v)
		v = strings.Trim(v, "-–—,;()[]")
		if v == "" {
			return
		}
		key := strings.ToLower(v)
		if seen[key] {
			return
		}
		seen[key] = true
		out = append(out, v)
	}
	for _, p := range parts {
		addAlias(p)
		q := strings.TrimSpace(p)
		for _, suffix := range []string{" България", " Bulgaria", " АД", " AD", " Ltd", " EOOD", " ЕООД", " OOD", " ООД"} {
			if strings.HasSuffix(strings.ToLower(q), strings.ToLower(suffix)) {
				addAlias(strings.TrimSpace(q[:len(q)-len(suffix)]))
			}
		}
	}
	if len(out) == 0 {
		addAlias(name)
	}
	return out
}

func competitorSignalTargets(c *Client) []competitorSignalTarget {
	if c == nil {
		return nil
	}
	out := []competitorSignalTarget{}
	seen := map[string]bool{}
	for _, src := range c.Sources {
		key := strings.ToLower(strings.TrimSpace(src.Key))
		if !(strings.HasPrefix(key, "cmp_") || strings.HasPrefix(key, "competitor_")) {
			continue
		}
		// Product-level comparable sources (for example Booking or Untappd)
		// are not company entities and are intentionally excluded here.
		if strings.Contains(key, "booking") || strings.Contains(key, "untappd") || strings.Contains(key, "beeradvocate") {
			continue
		}
		name := strings.TrimSpace(src.Label)
		if name == "" || seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, competitorSignalTarget{Key: src.Key, Name: name, URL: src.URL, Aliases: competitorAliases(name)})
	}
	return out
}

func competitorContextTerms(c *Client) []string {
	if c == nil {
		return nil
	}
	switch c.Slug {
	case "bolyarka":
		return []string{"бира", "пивовар", "пивоварна", "beer", "brewery", "напитки"}
	case "aroma":
		return []string{"козметика", "козметич", "cosmetics", "beauty", "грижа", "шампоан", "крем"}
	case "mollox":
		return []string{"хигиена", "почистване", "почистващ", "дезинфекция", "дезинфектант", "hygiene", "cleaning", "disinfection", "detergent"}
	case "varna-towers":
		return []string{"варна", "бизнес център", "офиси", "имоти", "real estate", "office", "business center"}
	default:
		return nil
	}
}

func competitorQuery(c *Client, t competitorSignalTarget) string {
	aliases := t.Aliases
	if len(aliases) > 3 {
		aliases = aliases[:3]
	}
	qs := make([]string, 0, len(aliases))
	for _, a := range aliases {
		if strings.TrimSpace(a) != "" {
			qs = append(qs, `"`+strings.TrimSpace(a)+`"`)
		}
	}
	base := strings.Join(qs, " OR ")
	ctx := competitorContextTerms(c)
	if len(ctx) > 0 {
		return "(" + base + ") (" + strings.Join(ctx, " OR ") + ")"
	}
	return base
}

func competitorContextHit(c *Client, low string) bool {
	for _, term := range competitorContextTerms(c) {
		if strings.Contains(low, strings.ToLower(term)) {
			return true
		}
	}
	return false
}

func competitorAliasHit(t competitorSignalTarget, low string) bool {
	for _, a := range t.Aliases {
		a = strings.ToLower(strings.TrimSpace(a))
		if a != "" && strings.Contains(low, a) {
			return true
		}
	}
	return false
}

func competitorRelevance(c *Client, t competitorSignalTarget, title, text string) float64 {
	low := strings.ToLower(title + " " + text)
	if !competitorAliasHit(t, low) {
		return 0
	}
	score := 72.0
	if competitorContextHit(c, low) {
		score += 22
	}
	// Short or generic company names require sector context to prevent unrelated
	// people, places and products from entering the intelligence stream.
	shortest := 999
	for _, a := range t.Aliases {
		n := len([]rune(strings.TrimSpace(a)))
		if n > 0 && n < shortest {
			shortest = n
		}
	}
	if shortest <= 8 && !competitorContextHit(c, low) {
		return 0
	}
	if score > 100 {
		score = 100
	}
	return score
}

func buildCompetitorSignal(c *Client, t competitorSignalTarget, source, sourceType, rawURL, title, text, published string) (Signal, bool) {
	title = cleanPostSnippet(title)
	text = cleanPostSnippet(text)
	if text == "" {
		text = title
	}
	relevance := competitorRelevance(c, t, title, text)
	if relevance < 60 || strings.TrimSpace(rawURL) == "" {
		return Signal{}, false
	}
	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	fingerprint := signalHash(c.Slug+"|competitor|"+t.Key, rawURL, title, text)
	return Signal{
		ID:          fingerprint[:16],
		Client:      c.Slug,
		Brand:       t.Name,
		Source:      source,
		SourceType:  sourceType,
		Scope:       "competitor",
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

func collectCompetitorNews(c *Client, t competitorSignalTarget) []Signal {
	q := competitorQuery(c, t)
	if q == "" {
		return nil
	}
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(q) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed competitorRSS
	if xml.Unmarshal([]byte(body), &feed) != nil {
		return nil
	}
	out := []Signal{}
	for _, item := range feed.Channel.Items {
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		if s, ok := buildCompetitorSignal(c, t, source, "news", item.Link, item.Title, item.Description, item.PubDate); ok {
			out = append(out, s)
			if len(out) >= 18 {
				break
			}
		}
	}
	return out
}

func parseCompetitorBing(c *Client, t competitorSignalTarget, body, sourceType, platform string) []Signal {
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
		k := strings.ToLower(rawURL)
		if k == "" || seen[k] {
			continue
		}
		seen[k] = true
		title := cleanPostSnippet(lm[2])
		snippet := ""
		if pm := collectorPRE.FindStringSubmatch(block[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(pm[1])
		}
		source := platform
		if source == "" {
			if u, e := url.Parse(rawURL); e == nil {
				source = strings.TrimPrefix(strings.ToLower(u.Host), "www.")
			}
		}
		if source == "" {
			source = sourceType
		}
		if s, ok := buildCompetitorSignal(c, t, source, sourceType, rawURL, title, snippet, ""); ok {
			out = append(out, s)
			if len(out) >= 12 {
				break
			}
		}
	}
	return out
}

func competitorBingSearch(c *Client, t competitorSignalTarget, query, sourceType, platform string) []Signal {
	if strings.TrimSpace(query) == "" {
		return nil
	}
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(query) + "&count=20&setlang=bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	return parseCompetitorBing(c, t, body, sourceType, platform)
}

func collectCompetitorWeb(c *Client, t competitorSignalTarget) []Signal {
	return competitorBingSearch(c, t, competitorQuery(c, t), "web", "")
}

func collectCompetitorSocial(c *Client, t competitorSignalTarget) []Signal {
	base := competitorQuery(c, t)
	if base == "" {
		return nil
	}
	queries := []struct {
		platform string
		prefix   string
	}{
		{"linkedin", "site:linkedin.com/posts "},
		{"facebook", "site:facebook.com "},
		{"instagram", "site:instagram.com "},
		{"youtube", "site:youtube.com/watch "},
		{"tiktok", "site:tiktok.com "},
	}
	out := []Signal{}
	for _, q := range queries {
		out = append(out, competitorBingSearch(c, t, q.prefix+base, "social", q.platform)...)
	}
	return out
}

func dedupeCompetitorSignals(in []Signal) []Signal {
	seen := map[string]bool{}
	out := []Signal{}
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
	if len(out) > 50 {
		out = out[:50]
	}
	return out
}

func sanitizeKnownSignalFalsePositives() {
	signalMu.Lock()
	defer signalMu.Unlock()
	rows := signalState.Signals["bolyarka"]
	if len(rows) == 0 {
		return
	}
	clean := rows[:0]
	for _, s := range rows {
		if s.Scope == "external" {
			low := strings.ToLower(s.Title + " " + s.Text)
			furniture := collectorContainsAny(low, "мебелна къща", "мебелен", "мебели")
			brandContext := collectorContainsAny(low, "болярка вт", "пивовар", "бира", "brewery", "beer", "напитки")
			if furniture && !brandContext {
				continue
			}
		}
		clean = append(clean, s)
	}
	signalState.Signals["bolyarka"] = clean
}

func runCompetitorSignalCollector() map[string]int {
	counts := map[string]int{}
	for _, slug := range signalEligibleSlugs() {
		c := signalClientSnapshot(slug)
		if c == nil {
			continue
		}
		all := []Signal{}
		for _, target := range competitorSignalTargets(c) {
			rows := []Signal{}
			rows = append(rows, collectCompetitorNews(c, target)...)
			rows = append(rows, collectCompetitorWeb(c, target)...)
			rows = append(rows, collectCompetitorSocial(c, target)...)
			rows = dedupeCompetitorSignals(rows)
			all = append(all, rows...)
		}
		all = dedupeCompetitorSignals(all)
		if len(all) > 0 {
			mergeSignals(slug, all)
		}
		counts[slug] = len(all)
	}
	sanitizeKnownSignalFalsePositives()
	saveSignalStateFile()
	saveStore()
	return counts
}

func init() {
	go func() {
		// Run shortly after the base collector has restored its state.
		time.Sleep(110 * time.Second)
		runCompetitorSignalCollector()
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			runCompetitorSignalCollector()
		}
	}()
}

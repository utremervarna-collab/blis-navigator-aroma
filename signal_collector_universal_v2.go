package main

import (
	"encoding/xml"
	"net/url"
	"strings"
	"time"
)

// Universal monitoring V2 closes the gap left by the original rollout list.
// It does not create clients. It refreshes signals only for profiles that
// already exist in the live store and adds a crisis-focused KUB query.
func universalSignalSlugsV2() []string {
	return []string{
		"aroma",
		"bolyarka",
		"mollox",
		"varna-towers",
		"wirello",
		"everbet",
		"astor-garden",
		"kub",
	}
}

func kubCrisisSignalV2(c *Client, source, rawURL, title, text, published string) (Signal, bool) {
	if c == nil || c.Slug != "kub" || strings.TrimSpace(rawURL) == "" {
		return Signal{}, false
	}
	title = cleanPostSnippet(title)
	text = cleanPostSnippet(text)
	if text == "" {
		text = title
	}
	low := strings.ToLower(title + " " + text)
	terms := []string{"куб", "kyb", "баба алино", "baba alino", "forest club", "форест клуб"}
	hits := 0
	for _, term := range terms {
		if strings.Contains(low, term) {
			hits++
		}
	}
	if hits == 0 {
		return Signal{}, false
	}
	relevance := 45.0 + float64(hits)*12.0
	if strings.Contains(low, "баба алино") || strings.Contains(low, "baba alino") {
		relevance += 18
	}
	if relevance > 100 {
		relevance = 100
	}
	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	if strings.Contains(low, "незакон") || strings.Contains(low, "съд") || strings.Contains(low, "конпи") || strings.Contains(low, "строител") || strings.Contains(low, "сеч") || strings.Contains(low, "разрешение") || strings.Contains(low, "правен статут") {
		if risk < 60 {
			risk = 60
		}
		if sentiment == "neutral" {
			sentiment = "negative"
		}
	}
	fingerprint := signalHash(c.Slug, rawURL, title, text)
	return Signal{
		ID:          fingerprint[:16],
		Client:      c.Slug,
		Brand:       c.Name,
		Source:      source,
		SourceType:  "news",
		Scope:       "external",
		URL:         rawURL,
		Title:       title,
		Text:        text,
		PublishedAt: published,
		DetectedAt:  nowISO(),
		Relevance:   relevance,
		Sentiment:   sentiment,
		Topic:       "crisis_baba_alino",
		RiskScore:   risk,
		Severity:    signalSeverity(risk),
		Fingerprint: fingerprint,
	}, true
}

func collectKubCrisisNewsSignalsV2(c *Client) []Signal {
	if c == nil || c.Slug != "kub" {
		return nil
	}
	query := `("Баба Алино" OR "Baba Alino" OR "Forest Club") ("КУБ" OR "KYB" OR "Корпорация КУБ")`
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(query) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed collectorRSS
	if err := xml.Unmarshal([]byte(body), &feed); err != nil {
		return nil
	}
	out := make([]Signal, 0, 30)
	for _, item := range feed.Channel.Items {
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		if s, ok := kubCrisisSignalV2(c, source, item.Link, item.Title, item.Description, item.PubDate); ok {
			out = append(out, s)
			if len(out) >= 30 {
				break
			}
		}
	}
	return out
}

func runUniversalSignalCollectorV2() {
	for _, slug := range universalSignalSlugsV2() {
		c := signalClientSnapshot(slug)
		if c == nil {
			continue
		}
		fresh := collectClientSignals(c)
		if slug == "kub" {
			fresh = append(fresh, collectKubCrisisNewsSignalsV2(c)...)
		}
		mergeSignals(slug, fresh)
	}
	saveSignalStateFile()
	saveStore()
}

func init() {
	go func() {
		// First refresh shortly after process start, then continuously.
		time.Sleep(15 * time.Second)
		runUniversalSignalCollectorV2()
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			runUniversalSignalCollectorV2()
		}
	}()
}

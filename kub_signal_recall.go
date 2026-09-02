package main

import (
	"encoding/xml"
	"html"
	"net/url"
	"strings"
	"time"
)

// KUB crisis recall searches are intentionally split into several narrower
// queries. A single long OR query was too easy for search transports to trim or
// rank narrowly, which reduced recall for fast-moving mentions.
func kubRecallQueries() []string {
	return []string{
		`"Баба Алино"`,
		`"Корпорация КУБ"`,
		`"групировка КУБ"`,
		`"Форест Клуб Варна"`,
		`"Forest Club Varna"`,
		`"КУБ" "Баба Алино"`,
		`"КУБ" Варна`,
		`"Олег Несторов" "Баба Алино"`,
		`"Олег Невзоров" "Баба Алино"`,
	}
}

func collectKUBNewsRecall() []Signal {
	out := []Signal{}
	for _, query := range kubRecallQueries() {
		raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(query) + "&hl=bg&gl=BG&ceid=BG:bg"
		status, body, _, err := timedFetch(raw, 3*1024*1024)
		if err != nil || status < 200 || status >= 400 {
			continue
		}
		var feed collectorRSS
		if xml.Unmarshal([]byte(body), &feed) != nil {
			continue
		}
		for _, item := range feed.Channel.Items {
			source := strings.TrimSpace(item.Source)
			if source == "" {
				source = "Google News"
			}
			if s, ok := buildKUBSignal(source, "news", item.Link, item.Title, item.Description, item.PubDate); ok {
				out = append(out, s)
			}
			if len(out) >= 250 {
				return dedupeSignals(out)
			}
		}
	}
	return dedupeSignals(out)
}

func collectKUBWebRecall() []Signal {
	out := []Signal{}
	for _, query := range kubRecallQueries() {
		raw := "https://www.bing.com/search?q=" + url.QueryEscape(query) + "&count=50&setlang=bg"
		status, body, _, err := timedFetch(raw, 3*1024*1024)
		if err != nil || status < 200 || status >= 400 {
			continue
		}
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
			key := strings.ToLower(rawURL)
			if rawURL == "" || seen[key] {
				continue
			}
			seen[key] = true
			title := cleanPostSnippet(lm[2])
			snippet := ""
			if pm := collectorPRE.FindStringSubmatch(block[1]); len(pm) > 1 {
				snippet = cleanPostSnippet(pm[1])
			}
			source := "web"
			if u, err := url.Parse(rawURL); err == nil && u.Host != "" {
				source = strings.TrimPrefix(strings.ToLower(u.Host), "www.")
			}
			if s, ok := buildKUBSignal(source, "web", rawURL, title, snippet, ""); ok {
				out = append(out, s)
			}
			if len(out) >= 250 {
				return dedupeSignals(out)
			}
		}
	}
	return dedupeSignals(out)
}

func runKUBRecallCollector() {
	fresh := collectKUBNewsRecall()
	fresh = append(fresh, collectKUBWebRecall()...)
	fresh = dedupeSignals(fresh)
	if len(fresh) == 0 {
		return
	}
	mergeSignals("kub", fresh)
	saveSignalStateFile()
}

func init() {
	go func() {
		time.Sleep(8 * time.Second)
		runKUBRecallCollector()
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			runKUBRecallCollector()
		}
	}()
}

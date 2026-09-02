package main

import (
	"encoding/xml"
	"net/url"
	"strings"
	"time"
)

// Near-real-time KUB news collector. The broader 5-minute collector remains as
// a fallback, while this loop uses short, high-recall queries so new indexed
// mentions are merged into the same signalState as soon as possible.
var kubRealtimeQueries = []string{
	`"Баба Алино"`,
	`"Форест Клуб Варна" OR "Forest Club Varna"`,
	`"Корпорация КУБ" OR "групировка КУБ"`,
}

func collectKUBRealtimeNewsSignals() []Signal {
	out := make([]Signal, 0, 120)
	for _, q := range kubRealtimeQueries {
		raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(q) + "&hl=bg&gl=BG&ceid=BG:bg"
		status, body, _, err := timedFetch(raw, 3*1024*1024)
		if err != nil || status < 200 || status >= 400 {
			continue
		}
		var feed collectorRSS
		if err := xml.Unmarshal([]byte(body), &feed); err != nil {
			continue
		}
		for _, item := range feed.Channel.Items {
			source := strings.TrimSpace(item.Source)
			if source == "" {
				source = "Google News"
			}
			if s, ok := buildKUBSignal(source, "news", item.Link, item.Title, item.Description, item.PubDate); ok {
				out = append(out, s)
				if len(out) >= 120 {
					break
				}
			}
		}
	}
	return dedupeSignals(out)
}

func runKUBRealtimeCollector() {
	fresh := collectKUBRealtimeNewsSignals()
	if len(fresh) == 0 {
		return
	}
	mergeSignals("kub", fresh)
	saveSignalStateFile()
}

func init() {
	go func() {
		time.Sleep(5 * time.Second)
		runKUBRealtimeCollector()
		ticker := time.NewTicker(60 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			runKUBRealtimeCollector()
		}
	}()
}

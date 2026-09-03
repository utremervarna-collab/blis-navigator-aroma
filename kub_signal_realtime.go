package main

import (
	"encoding/xml"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"
)

// Near-real-time KUB collector. Google News is the primary discovery stream and
// Bing web search is a secondary recall layer. Both merge into the same KUB
// signalState; every retained signal keeps its source URL.
var kubRealtimeQueries = []string{
	`"Баба Алино"`,
	`"Форест Клуб Варна" OR "Forest Club Varna"`,
	`"Корпорация КУБ" OR "групировка КУБ"`,
}

// The Free-plan keepalive pulse and the normal 60-second ticker may fire at the
// same time. Serialize the expensive discovery pass so we never duplicate web
// requests or write signals.json concurrently.
var kubRealtimeRunMu sync.Mutex

func collectKUBRealtimeNewsSignals() []Signal {
	out := make([]Signal, 0, 120)
	for _, q := range kubRealtimeQueries {
		raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(q) + "&hl=bg&gl=BG&ceid=BG:bg"
		status, body, _, err := timedFetch(raw, 3*1024*1024)
		if err != nil || status < 200 || status >= 400 {
			log.Printf("KUB_REALTIME source=google status=%d err=%v query=%q", status, err, q)
			continue
		}
		var feed collectorRSS
		if err := xml.Unmarshal([]byte(body), &feed); err != nil {
			log.Printf("KUB_REALTIME source=google parse_error=%v query=%q", err, q)
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
	return dedupeSignals(out)
}

func runKUBRealtimeCollector() {
	kubRealtimeRunMu.Lock()
	defer kubRealtimeRunMu.Unlock()

	fresh := collectKUBRealtimeNewsSignals()
	// Secondary open-web recall catches publisher pages that have not yet reached
	// the Google News RSS result set.
	fresh = append(fresh, collectKUBWebSignals()...)
	fresh = dedupeSignals(fresh)
	if len(fresh) == 0 {
		log.Printf("KUB_REALTIME fresh=0 new=0")
		return
	}
	newCount := mergeSignals("kub", fresh)
	saveSignalStateFile()
	log.Printf("KUB_REALTIME fresh=%d new=%d", len(fresh), newCount)
}

func init() {
	go func() {
		// Run almost immediately after startup so a cold wake does not leave the
		// Monitoring page waiting for the next minute boundary.
		time.Sleep(1 * time.Second)
		runKUBRealtimeCollector()
		ticker := time.NewTicker(60 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			runKUBRealtimeCollector()
		}
	}()
}

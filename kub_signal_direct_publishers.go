package main

import (
	"html"
	"log"
	"net/url"
	"regexp"
	"strings"
)

// Search aggregators are useful for recall, but they can lag behind a publisher.
// For a fast-moving crisis we also poll selected primary publisher pages directly.
// This lets a newly published BNT item enter Navigator before Google/Bing indexing.
var kubDirectAnchorRE = regexp.MustCompile(`(?is)<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)</a>`)

func kubDirectURL(baseURL, raw string) string {
	raw = html.UnescapeString(strings.TrimSpace(raw))
	if raw == "" || strings.HasPrefix(strings.ToLower(raw), "javascript:") || strings.HasPrefix(raw, "#") {
		return ""
	}
	base, err := url.Parse(baseURL)
	if err != nil {
		return ""
	}
	u, err := url.Parse(raw)
	if err != nil {
		return ""
	}
	return base.ResolveReference(u).String()
}

func collectKUBBNTDirectSignals() []Signal {
	const latestURL = "https://bntnews.bg/latest.html"
	status, body, _, err := timedFetch(latestURL, 4*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		log.Printf("KUB_DIRECT source=BNT status=%d err=%v", status, err)
		return nil
	}

	out := make([]Signal, 0, 40)
	seen := map[string]bool{}
	for _, m := range kubDirectAnchorRE.FindAllStringSubmatch(body, -1) {
		if len(m) < 3 {
			continue
		}
		title := cleanPostSnippet(m[2])
		if title == "" || !kubRelevant(title) {
			continue
		}
		rawURL := kubDirectURL(latestURL, m[1])
		if rawURL == "" {
			continue
		}
		u, err := url.Parse(rawURL)
		if err != nil || !strings.EqualFold(strings.TrimPrefix(u.Hostname(), "www."), "bntnews.bg") || !strings.Contains(strings.ToLower(u.Path), "/news/") {
			continue
		}
		key := strings.ToLower(rawURL)
		if seen[key] {
			continue
		}
		seen[key] = true
		if s, ok := buildKUBSignal("БНТ", "news", rawURL, title, title, ""); ok {
			out = append(out, s)
		}
	}
	if len(out) > 0 {
		log.Printf("KUB_DIRECT source=BNT fresh=%d", len(out))
	}
	return dedupeSignals(out)
}

// Immediate bootstrap for the current BNT development. It is kept as a verified
// source-level signal so it appears even if the BNT latest page or a search index
// is temporarily delayed. Future BNT items are discovered by the direct watcher.
func kubDirectVerifiedCurrentSignals() []Signal {
	return []Signal{
		kubSeedSignal(
			"БНТ",
			"https://bntnews.bg/news/spirat-vodata-v-nezakonniya-kompleks-baba-alino-1410692news.html",
			"Спират водата в незаконния комплекс „Баба Алино“",
			"БНТ съобщава, че водоподаването е спряно към пет едноетажни постройки в местността „Баба Алино“ в изпълнение на заповед на Община Варна; материалът описва установено незаконно водно отклонение и действия на ВиК-Варна.",
			"2026-09-03T12:10:00+03:00",
			98,
		),
	}
}

func collectKUBDirectPublisherSignals() []Signal {
	out := kubDirectVerifiedCurrentSignals()
	out = append(out, collectKUBBNTDirectSignals()...)
	return dedupeSignals(out)
}

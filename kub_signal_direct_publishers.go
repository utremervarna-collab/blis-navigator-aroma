package main

import (
	"encoding/xml"
	"html"
	"log"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"
)

// KUB direct publisher monitoring is source-agnostic. A broad publisher registry
// is watched directly, and every real publisher domain subsequently discovered in
// the KUB signal state is promoted automatically to the direct-watch set.
type kubDirectPublisherTarget struct {
	Label    string
	Root     string
	Host     string
	Priority bool
}

type kubDirectRSSItem struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	PubDate     string `xml:"pubDate"`
	Description string `xml:"description"`
}

type kubDirectRSS struct {
	Channel struct {
		Items []kubDirectRSSItem `xml:"item"`
	} `xml:"channel"`
	Items []kubDirectRSSItem `xml:"item"`
}

type kubDirectAtomEntry struct {
	Title     string `xml:"title"`
	Updated   string `xml:"updated"`
	Published string `xml:"published"`
	Summary   string `xml:"summary"`
	Content   string `xml:"content"`
	Links     []struct {
		Href string `xml:"href,attr"`
		Rel  string `xml:"rel,attr"`
	} `xml:"link"`
}

type kubDirectAtom struct {
	Entries []kubDirectAtomEntry `xml:"entry"`
}

var kubDirectSeedPublishers = []struct {
	Label string
	Root  string
}{
	{"БНТ", "https://bntnews.bg/"},
	{"БТА", "https://www.bta.bg/"},
	{"NOVA", "https://nova.bg/"},
	{"bTV Новините", "https://btvnovinite.bg/"},
	{"News.bg", "https://news.bg/"},
	{"Dir.bg", "https://dnes.dir.bg/"},
	{"Darik", "https://dariknews.bg/"},
	{"БНР", "https://bnr.bg/"},
	{"Евроком", "https://eurocom.bg/"},
	{"Varna24", "https://www.varna24.bg/"},
	{"Паралел 43", "https://parallel43.bg/"},
	{"Lupa.bg", "https://lupa.bg/"},
	{"Moreto.net", "https://www.moreto.net/"},
	{"Petel.bg", "https://petel.bg/"},
	{"Черно море", "https://www.chernomore.bg/"},
	{"OFFNews", "https://offnews.bg/"},
	{"Mediapool", "https://www.mediapool.bg/"},
	{"Дневник", "https://www.dnevnik.bg/"},
	{"24 часа", "https://www.24chasa.bg/"},
	{"Actualno", "https://www.actualno.com/"},
	{"Bulgaria ON AIR", "https://www.bgonair.bg/"},
	{"Fakti", "https://fakti.bg/"},
	{"Dnes.bg", "https://www.dnes.bg/"},
	{"Investor", "https://www.investor.bg/"},
	{"Сега", "https://www.segabg.com/"},
}

var (
	kubDirectAnchorRE       = regexp.MustCompile(`(?is)<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)</a>`)
	kubDirectLinkTagRE      = regexp.MustCompile(`(?is)<link\b[^>]*>`)
	kubDirectHrefRE         = regexp.MustCompile(`(?is)\bhref=["']([^"']+)["']`)
	kubDirectDateJSONRE     = regexp.MustCompile(`(?is)["']datePublished["']\s*:\s*["']([^"']+)["']`)
	kubDirectDateMetaRE     = regexp.MustCompile(`(?is)(?:article:published_time|datepublished|date_published|publish-date)[^>]{0,180}content=["']([^"']+)["']`)
	kubDirectDateMetaRevRE  = regexp.MustCompile(`(?is)content=["']([^"']+)["'][^>]{0,180}(?:article:published_time|datepublished|date_published|publish-date)`)
	kubDirectTimeRE         = regexp.MustCompile(`(?is)<time\b[^>]*datetime=["']([^"']+)["']`)
	kubDirectDescMetaRE     = regexp.MustCompile(`(?is)(?:og:description|name=["']description["'])[^>]{0,180}content=["']([^"']+)["']`)
	kubDirectDescMetaRevRE  = regexp.MustCompile(`(?is)content=["']([^"']+)["'][^>]{0,180}(?:og:description|name=["']description["'])`)
	kubDirectStateMu        sync.Mutex
	kubDirectLastPoll       = map[string]time.Time{}
	kubDirectEndpointCache  = map[string][]string{}
)

func kubDirectNormalizeHost(host string) string {
	host = strings.ToLower(strings.TrimSpace(host))
	host = strings.TrimSuffix(host, ".")
	return strings.TrimPrefix(host, "www.")
}

func kubDirectTransportHost(host string) bool {
	h := kubDirectNormalizeHost(host)
	return h == "" || h == "google.com" || strings.HasSuffix(h, ".google.com") || h == "news.google.com" || h == "bing.com" || strings.HasSuffix(h, ".bing.com")
}

func kubDirectRelatedHost(a, b string) bool {
	a, b = kubDirectNormalizeHost(a), kubDirectNormalizeHost(b)
	return a != "" && b != "" && (a == b || strings.HasSuffix(a, "."+b) || strings.HasSuffix(b, "."+a))
}

func kubDirectURL(baseURL, raw string) string {
	raw = html.UnescapeString(strings.TrimSpace(raw))
	low := strings.ToLower(raw)
	if raw == "" || strings.HasPrefix(low, "javascript:") || strings.HasPrefix(low, "mailto:") || strings.HasPrefix(raw, "#") {
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
	u = base.ResolveReference(u)
	u.Fragment = ""
	return u.String()
}

func kubDirectRoot(raw string) (string, string) {
	u, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || u.Hostname() == "" {
		return "", ""
	}
	host := kubDirectNormalizeHost(u.Hostname())
	if kubDirectTransportHost(host) {
		return "", ""
	}
	scheme := u.Scheme
	if scheme != "http" && scheme != "https" {
		scheme = "https"
	}
	return scheme + "://" + u.Host + "/", host
}

func kubDirectTargets() []kubDirectPublisherTarget {
	m := map[string]kubDirectPublisherTarget{}
	for _, seed := range kubDirectSeedPublishers {
		root, host := kubDirectRoot(seed.Root)
		if root == "" {
			continue
		}
		m[host] = kubDirectPublisherTarget{Label: seed.Label, Root: root, Host: host}
	}

	signalMu.RLock()
	rows := append([]Signal(nil), signalState.Signals["kub"]...)
	signalMu.RUnlock()
	for _, s := range rows {
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
			t = kubDirectPublisherTarget{Label: label, Root: root, Host: host}
		}
		if t.Label == "" {
			t.Label = label
		}
		t.Priority = true
		m[host] = t
	}

	out := make([]kubDirectPublisherTarget, 0, len(m))
	for _, t := range m {
		out = append(out, t)
	}
	return out
}

func kubDirectDue(t kubDirectPublisherTarget) bool {
	interval := 90 * time.Second
	if t.Priority {
		interval = 18 * time.Second
	}
	now := time.Now()
	kubDirectStateMu.Lock()
	defer kubDirectStateMu.Unlock()
	if last := kubDirectLastPoll[t.Host]; !last.IsZero() && now.Sub(last) < interval {
		return false
	}
	kubDirectLastPoll[t.Host] = now
	return true
}

func kubDirectCachedEndpoints(host string) []string {
	kubDirectStateMu.Lock()
	defer kubDirectStateMu.Unlock()
	return append([]string(nil), kubDirectEndpointCache[host]...)
}

func kubDirectRememberEndpoints(host string, candidates []string) {
	if len(candidates) == 0 {
		return
	}
	kubDirectStateMu.Lock()
	defer kubDirectStateMu.Unlock()
	seen := map[string]bool{}
	out := make([]string, 0, 4)
	for _, v := range kubDirectEndpointCache[host] {
		if v != "" && !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
	}
	for _, v := range candidates {
		if v != "" && !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
		if len(out) >= 4 {
			break
		}
	}
	kubDirectEndpointCache[host] = out
}

func kubDirectFeedEndpoints(body, baseURL, targetHost string) []string {
	out := []string{}
	seen := map[string]bool{}
	for _, tag := range kubDirectLinkTagRE.FindAllString(body, -1) {
		low := strings.ToLower(tag)
		if !strings.Contains(low, "rss") && !strings.Contains(low, "atom") && !strings.Contains(low, "feed") {
			continue
		}
		m := kubDirectHrefRE.FindStringSubmatch(tag)
		if len(m) < 2 {
			continue
		}
		v := kubDirectURL(baseURL, m[1])
		u, err := url.Parse(v)
		if err != nil || !kubDirectRelatedHost(u.Hostname(), targetHost) || seen[v] {
			continue
		}
		seen[v] = true
		out = append(out, v)
		if len(out) >= 2 {
			break
		}
	}
	for _, m := range kubDirectAnchorRE.FindAllStringSubmatch(body, -1) {
		if len(m) < 3 || len(out) >= 4 {
			break
		}
		text := strings.ToLower(cleanPostSnippet(m[2]))
		if !(strings.Contains(text, "последни") || strings.Contains(text, "всички новини") || text == "новини" || strings.Contains(text, "latest") || text == "news" || strings.Contains(text, "актуално")) {
			continue
		}
		v := kubDirectURL(baseURL, m[1])
		u, err := url.Parse(v)
		if err != nil || !kubDirectRelatedHost(u.Hostname(), targetHost) || seen[v] {
			continue
		}
		seen[v] = true
		out = append(out, v)
	}
	return out
}

func kubDirectArticleMeta(rawURL string) (string, string) {
	status, body, _, err := timedFetch(rawURL, 1536*1024)
	if err != nil || status < 200 || status >= 400 {
		return "", ""
	}
	published := ""
	for _, re := range []*regexp.Regexp{kubDirectDateJSONRE, kubDirectDateMetaRE, kubDirectDateMetaRevRE, kubDirectTimeRE} {
		if m := re.FindStringSubmatch(body); len(m) > 1 {
			published = html.UnescapeString(strings.TrimSpace(m[1]))
			break
		}
	}
	desc := ""
	for _, re := range []*regexp.Regexp{kubDirectDescMetaRE, kubDirectDescMetaRevRE} {
		if m := re.FindStringSubmatch(body); len(m) > 1 {
			desc = cleanPostSnippet(html.UnescapeString(m[1]))
			break
		}
	}
	return published, desc
}

func kubDirectHTMLSignals(t kubDirectPublisherTarget, endpoint, body string) []Signal {
	out := []Signal{}
	seen := map[string]bool{}
	enriched := 0
	for _, m := range kubDirectAnchorRE.FindAllStringSubmatch(body, -1) {
		if len(m) < 3 {
			continue
		}
		title := cleanPostSnippet(m[2])
		if title == "" || !kubRelevant(title) {
			continue
		}
		rawURL := kubDirectURL(endpoint, m[1])
		u, err := url.Parse(rawURL)
		if err != nil || rawURL == "" || !kubDirectRelatedHost(u.Hostname(), t.Host) {
			continue
		}
		key := strings.ToLower(rawURL)
		if seen[key] {
			continue
		}
		seen[key] = true
		published, desc := "", ""
		if enriched < 6 {
			published, desc = kubDirectArticleMeta(rawURL)
			enriched++
		}
		if desc == "" {
			desc = title
		}
		if s, ok := buildKUBSignal(t.Label, "news", rawURL, title, desc, published); ok {
			out = append(out, s)
		}
		if len(out) >= 20 {
			break
		}
	}
	return out
}

func kubDirectFeedSignals(t kubDirectPublisherTarget, endpoint, body string) []Signal {
	out := []Signal{}
	var rss kubDirectRSS
	if err := xml.Unmarshal([]byte(body), &rss); err == nil {
		items := append([]kubDirectRSSItem(nil), rss.Channel.Items...)
		items = append(items, rss.Items...)
		for _, item := range items {
			rawURL := kubDirectURL(endpoint, item.Link)
			u, err := url.Parse(rawURL)
			if err != nil || !kubDirectRelatedHost(u.Hostname(), t.Host) {
				continue
			}
			if s, ok := buildKUBSignal(t.Label, "news", rawURL, item.Title, item.Description, item.PubDate); ok {
				out = append(out, s)
			}
		}
	}
	var atom kubDirectAtom
	if err := xml.Unmarshal([]byte(body), &atom); err == nil {
		for _, entry := range atom.Entries {
			rawURL := ""
			for _, l := range entry.Links {
				if rawURL == "" || l.Rel == "alternate" {
					rawURL = kubDirectURL(endpoint, l.Href)
				}
				if l.Rel == "alternate" {
					break
				}
			}
			u, err := url.Parse(rawURL)
			if err != nil || !kubDirectRelatedHost(u.Hostname(), t.Host) {
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
			if s, ok := buildKUBSignal(t.Label, "news", rawURL, entry.Title, text, published); ok {
				out = append(out, s)
			}
		}
	}
	return dedupeSignals(out)
}

func kubDirectScanEndpoint(t kubDirectPublisherTarget, endpoint string) ([]Signal, []string) {
	status, body, _, err := timedFetch(endpoint, 2*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil, nil
	}
	fresh := kubDirectFeedSignals(t, endpoint, body)
	fresh = append(fresh, kubDirectHTMLSignals(t, endpoint, body)...)
	return dedupeSignals(fresh), kubDirectFeedEndpoints(body, endpoint, t.Host)
}

func kubDirectScanPublisher(t kubDirectPublisherTarget) []Signal {
	endpoints := []string{t.Root}
	for _, v := range kubDirectCachedEndpoints(t.Host) {
		if v != "" && v != t.Root {
			endpoints = append(endpoints, v)
		}
		if len(endpoints) >= 3 {
			break
		}
	}
	fresh := []Signal{}
	newEndpoints := []string{}
	for _, endpoint := range endpoints {
		rows, found := kubDirectScanEndpoint(t, endpoint)
		fresh = append(fresh, rows...)
		newEndpoints = append(newEndpoints, found...)
	}
	kubDirectRememberEndpoints(t.Host, newEndpoints)
	fresh = dedupeSignals(fresh)
	if len(fresh) > 0 {
		log.Printf("KUB_DIRECT source=%s host=%s fresh=%d", t.Label, t.Host, len(fresh))
	}
	return fresh
}

func collectKUBDirectPublisherSignals() []Signal {
	targets := kubDirectTargets()
	due := make([]kubDirectPublisherTarget, 0, len(targets))
	for _, t := range targets {
		if kubDirectDue(t) {
			due = append(due, t)
		}
	}
	if len(due) == 0 {
		return nil
	}

	type result struct{ rows []Signal }
	sem := make(chan struct{}, 6)
	ch := make(chan result, len(due))
	var wg sync.WaitGroup
	for _, target := range due {
		t := target
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			rows := kubDirectScanPublisher(t)
			<-sem
			ch <- result{rows: rows}
		}()
	}
	wg.Wait()
	close(ch)

	fresh := []Signal{}
	for r := range ch {
		fresh = append(fresh, r.rows...)
	}
	fresh = dedupeSignals(fresh)
	log.Printf("KUB_DIRECT publishers=%d polled=%d fresh=%d", len(targets), len(due), len(fresh))
	return fresh
}

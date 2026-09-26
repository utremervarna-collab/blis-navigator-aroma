package main

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"html"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"sync"
	"time"
)

type homeSearchResultV1 struct {
	Kind      string  `json:"kind"`
	Title     string  `json:"title"`
	Snippet   string  `json:"snippet,omitempty"`
	Source    string  `json:"source,omitempty"`
	URL       string  `json:"url,omitempty"`
	Client    string  `json:"client,omitempty"`
	ClientName string `json:"client_name,omitempty"`
	Score     float64 `json:"score,omitempty"`
	Published string  `json:"published,omitempty"`
}

type homeSearchAnswerSourceV1 struct {
	Title  string `json:"title"`
	Source string `json:"source,omitempty"`
	URL    string `json:"url,omitempty"`
}

type homeSearchOfferV1 struct {
	Show  bool   `json:"show"`
	Title string `json:"title,omitempty"`
	Text  string `json:"text,omitempty"`
	CTA   string `json:"cta,omitempty"`
	URL   string `json:"url,omitempty"`
}

type homeSearchPayloadV1 struct {
	OK            bool                       `json:"ok"`
	Query         string                     `json:"query"`
	Mode          string                     `json:"mode"`
	Summary       string                     `json:"summary"`
	Answer        string                     `json:"answer,omitempty"`
	AnswerSources []homeSearchAnswerSourceV1 `json:"answer_sources,omitempty"`
	Offer         homeSearchOfferV1          `json:"analysis_offer"`
	Results       []homeSearchResultV1       `json:"results"`
	Navigator     int                        `json:"navigator_count"`
	Web           int                        `json:"web_count"`
	Generated     string                     `json:"generated_at"`
}

type homeSearchCacheEntryV1 struct {
	Payload homeSearchPayloadV1
	At      time.Time
}

var (
	homeSearchCacheMuV1 sync.Mutex
	homeSearchCacheV1   = map[string]homeSearchCacheEntryV1{}
)

func homeSearchTokensV1(q string) []string {
	q = strings.ToLower(strings.TrimSpace(q))
	repl := strings.NewReplacer("„", " ", "“", " ", `"`, " ", "'", " ", ",", " ", ".", " ", ":", " ", ";", " ", "!", " ", "?", " ", "/", " ", "\\", " ", "(", " ", ")", " ", "-", " ")
	q = repl.Replace(q)
	seen := map[string]bool{}
	out := []string{}
	for _, t := range strings.Fields(q) {
		if len([]rune(t)) < 2 || seen[t] {
			continue
		}
		seen[t] = true
		out = append(out, t)
	}
	return out
}

func homeSearchMatchScoreV1(tokens []string, title, text, brand, source string) float64 {
	if len(tokens) == 0 {
		return 0
	}
	titleL := strings.ToLower(title)
	textL := strings.ToLower(text)
	brandL := strings.ToLower(brand)
	sourceL := strings.ToLower(source)
	score := 0.0
	hits := 0
	for _, t := range tokens {
		hit := false
		if strings.Contains(titleL, t) {
			score += 6
			hit = true
		}
		if strings.Contains(brandL, t) {
			score += 5
			hit = true
		}
		if strings.Contains(textL, t) {
			score += 2
			hit = true
		}
		if strings.Contains(sourceL, t) {
			score += 1
			hit = true
		}
		if hit {
			hits++
		}
	}
	if hits == len(tokens) {
		score += 8
	}
	return score
}

func homeNavigatorSearchV1(q string, limit int) []homeSearchResultV1 {
	tokens := homeSearchTokensV1(q)
	if len(tokens) == 0 {
		return nil
	}

	clientNames := map[string]string{}
	mu.Lock()
	for slug, c := range store.Clients {
		if c != nil {
			clientNames[slug] = c.Name
		}
	}
	mu.Unlock()

	type scored struct {
		R homeSearchResultV1
		S float64
		T int64
	}
	rows := []scored{}

	signalMu.RLock()
	for slug, sigs := range signalState.Signals {
		if slug == "kub" {
			continue
		}
		for _, s := range sigs {
			score := homeSearchMatchScoreV1(tokens, s.Title, s.Text, s.Brand, s.Source)
			if score <= 0 {
				continue
			}
			ts := int64(0)
			if t, err := time.Parse(time.RFC3339, s.PublishedAt); err == nil {
				ts = t.Unix()
			} else if t, err := time.Parse(time.RFC3339, s.DetectedAt); err == nil {
				ts = t.Unix()
			}
			title := strings.TrimSpace(s.Title)
			if title == "" {
				title = strings.TrimSpace(s.Text)
			}
			if title == "" {
				continue
			}
			snippet := strings.TrimSpace(s.Text)
			if snippet == title {
				snippet = ""
			}
			runes := []rune(snippet)
			if len(runes) > 260 {
				snippet = string(runes[:260]) + "…"
			}
			rows = append(rows, scored{R: homeSearchResultV1{
				Kind: "navigator", Title: title, Snippet: snippet, Source: s.Source,
				URL: s.URL, Client: slug, ClientName: clientNames[slug], Score: score,
				Published: firstNonEmptyV1(s.PublishedAt, s.DetectedAt),
			}, S: score, T: ts})
		}
	}
	signalMu.RUnlock()

	for slug, name := range clientNames {
		score := homeSearchMatchScoreV1(tokens, name, "", name, "")
		if score <= 0 {
			continue
		}
		rows = append(rows, scored{R: homeSearchResultV1{
			Kind: "profile", Title: name, Snippet: "Отвори текущия профил и свързаните анализи в BLIS Navigator.",
			Client: slug, ClientName: name, Score: score + 4,
		}, S: score + 4, T: time.Now().Unix()})
	}

	sort.SliceStable(rows, func(i, j int) bool {
		if rows[i].S != rows[j].S {
			return rows[i].S > rows[j].S
		}
		return rows[i].T > rows[j].T
	})
	seen := map[string]bool{}
	out := []homeSearchResultV1{}
	for _, row := range rows {
		key := strings.ToLower(strings.TrimSpace(row.R.URL + "|" + row.R.Title + "|" + row.R.Client))
		if key == "" || seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, row.R)
		if len(out) >= limit {
			break
		}
	}
	return out
}

func firstNonEmptyV1(xs ...string) string {
	for _, x := range xs {
		if strings.TrimSpace(x) != "" {
			return x
		}
	}
	return ""
}

type homeNewsRSSV1 struct {
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

func homeWebBingV1(q string, limit int) []homeSearchResultV1 {
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(q) + "&count=12&setlang=bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	out := []homeSearchResultV1{}
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
		if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
			continue
		}
		if seen[strings.ToLower(rawURL)] {
			continue
		}
		seen[strings.ToLower(rawURL)] = true
		title := cleanPostSnippet(html.UnescapeString(lm[2]))
		snippet := ""
		if pm := collectorPRE.FindStringSubmatch(block[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(html.UnescapeString(pm[1]))
		}
		source := ""
		if u, err := url.Parse(rawURL); err == nil {
			source = strings.TrimPrefix(strings.ToLower(u.Host), "www.")
		}
		if title == "" {
			continue
		}
		out = append(out, homeSearchResultV1{Kind: "web", Title: title, Snippet: snippet, Source: source, URL: rawURL})
		if len(out) >= limit {
			break
		}
	}
	return out
}

func homeWebNewsV1(q string, limit int) []homeSearchResultV1 {
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(q) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed homeNewsRSSV1
	if xml.Unmarshal([]byte(body), &feed) != nil {
		return nil
	}
	out := []homeSearchResultV1{}
	for _, item := range feed.Channel.Items {
		title := cleanPostSnippet(item.Title)
		if title == "" {
			continue
		}
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		out = append(out, homeSearchResultV1{
			Kind: "news", Title: title, Snippet: cleanPostSnippet(item.Description), Source: source,
			URL: strings.TrimSpace(item.Link), Published: strings.TrimSpace(item.PubDate),
		})
		if len(out) >= limit {
			break
		}
	}
	return out
}

func homeWebSearchV1(q string, limit int) []homeSearchResultV1 {
	type batch struct{ rows []homeSearchResultV1 }
	ch := make(chan batch, 2)
	go func() { ch <- batch{homeWebBingV1(q, limit)} }()
	go func() { ch <- batch{homeWebNewsV1(q, 5)} }()
	all := []homeSearchResultV1{}
	for i := 0; i < 2; i++ {
		all = append(all, (<-ch).rows...)
	}
	seen := map[string]bool{}
	out := []homeSearchResultV1{}
	for _, r := range all {
		key := strings.ToLower(strings.TrimSpace(r.URL + "|" + r.Title))
		if key == "" || seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, r)
		if len(out) >= limit {
			break
		}
	}
	return out
}

func homeSearchSummaryV1(q, mode string, nav, web []homeSearchResultV1) string {
	switch mode {
	case "navigator":
		if len(nav) == 0 {
			return "Не открих достатъчно релевантна информация в натрупаната база на Navigator."
		}
		return "Намерих релевантни сигнали и профили в базата на Navigator. Резултатите са подредени по близост до въпроса."
	case "web":
		if len(web) == 0 {
			return "Външното търсене не върна надеждни резултати в момента."
		}
		return "Това са актуални публични резултати от външното търсене. Отвори източника за пълния контекст."
	default:
		if len(nav)+len(web) == 0 {
			return "Не открих достатъчно надеждна информация по тази заявка."
		}
		if len(nav) > 0 && len(web) > 0 {
			return "Обединих натрупаната база на Navigator с актуални публични резултати от web."
		}
		if len(nav) > 0 {
			return "Намерих релевантна информация в Navigator; външното търсене не добави достатъчно нови резултати."
		}
		return "Намерих актуални публични резултати извън текущите клиентски профили."
	}
}


func homeSearchCompactTextV2(v string, limit int) string {
	v = strings.TrimSpace(strings.Join(strings.Fields(cleanPostSnippet(v)), " "))
	if v == "" {
		return ""
	}
	r := []rune(v)
	if len(r) > limit {
		return strings.TrimSpace(string(r[:limit])) + "…"
	}
	return v
}

func homeSearchAnswerV2(web []homeSearchResultV1) (string, []homeSearchAnswerSourceV1) {
	parts := []string{}
	sources := []homeSearchAnswerSourceV1{}
	seenText := map[string]bool{}
	seenURL := map[string]bool{}
	for _, r := range web {
		text := homeSearchCompactTextV2(r.Snippet, 240)
		if text == "" {
			text = homeSearchCompactTextV2(r.Title, 180)
		}
		key := strings.ToLower(text)
		if text != "" && !seenText[key] {
			seenText[key] = true
			parts = append(parts, text)
		}
		u := strings.TrimSpace(r.URL)
		if u != "" && !seenURL[strings.ToLower(u)] {
			seenURL[strings.ToLower(u)] = true
			sources = append(sources, homeSearchAnswerSourceV1{
				Title: homeSearchCompactTextV2(r.Title, 120),
				Source: strings.TrimSpace(r.Source),
				URL: u,
			})
		}
		if len(parts) >= 2 && len(sources) >= 3 {
			break
		}
	}
	answer := ""
	if len(parts) > 0 {
		answer = parts[0]
		if len(parts) > 1 {
			answer += " " + parts[1]
		}
	}
	return homeSearchCompactTextV2(answer, 470), sources
}

func homeSearchBusinessIntentV2(q string, nav []homeSearchResultV1) (bool, string) {
	low := strings.ToLower(q)
	if len(nav) > 0 {
		return true, "profile"
	}
	groups := map[string][]string{
		"market": {"пазар", "сектор", "индустр", "конкурент", "цена", "цени", "потребител", "търсене", "продажб", "офис", "имот", "retail", "fmcg", "market", "sector", "competitor", "price"},
		"brand": {"компания", "фирма", "марка", "бранд", "репутац", "кампания", "медия", "социалн", "company", "brand", "reputation"},
		"risk": {"криза", "риск", "скандал", "протест", "съд", "атака", "негатив", "crisis", "risk"},
	}
	for kind, terms := range groups {
		for _, term := range terms {
			if strings.Contains(low, term) {
				return true, kind
			}
		}
	}
	return false, ""
}

func homeSearchOfferV2(q string, nav []homeSearchResultV1) homeSearchOfferV1 {
	ok, kind := homeSearchBusinessIntentV2(q, nav)
	if !ok {
		return homeSearchOfferV1{}
	}
	title := "Искате по-дълбок анализ на тази тема?"
	text := "BLIS™ Navigator може да превърне бързото търсене в структуриран анализ с проверени източници, контекст, конкуренти, тенденции, рискове и възможности."
	switch kind {
	case "profile", "brand":
		title = "Искате пълен профил и постоянен мониторинг?"
		text = "Navigator може да следи компанията, конкурентите, публичните споменавания и ключовите промени във времето в постоянен клиентски профил."
	case "market":
		title = "Искате по-дълбок пазарен анализ?"
		text = "Navigator може да разшири темата с конкурентен контекст, динамика, тенденции, сигнали и практически изводи."
	case "risk":
		title = "Искате постоянен мониторинг на тази тема?"
		text = "Navigator може да проследява развитието, източниците, тона, рисковете и новите сигнали в постоянен аналитичен профил."
	}
	return homeSearchOfferV1{
		Show: true,
		Title: title,
		Text: text,
		CTA: "Заяви анализ с Navigator",
		URL: "/contact.html?analysis=1&topic=" + url.QueryEscape(q),
	}
}

func buildHomeSearchPayloadV1(q, mode string) homeSearchPayloadV1 {
	nav, web := []homeSearchResultV1{}, []homeSearchResultV1{}
	if mode == "navigator" || mode == "all" {
		nav = homeNavigatorSearchV1(q, 8)
	}
	if mode == "web" || mode == "all" {
		web = homeWebSearchV1(q, 8)
	}
	results := []homeSearchResultV1{}
	if mode == "all" {
		// Interleave internal evidence and current public search so one source
		// family does not visually dominate the answer.
		for i := 0; i < 8; i++ {
			if i < len(nav) {
				results = append(results, nav[i])
			}
			if i < len(web) {
				results = append(results, web[i])
			}
			if len(results) >= 12 {
				break
			}
		}
	} else if mode == "navigator" {
		results = nav
	} else {
		results = web
	}
	answer, answerSources := homeSearchAnswerV2(web)
	return homeSearchPayloadV1{
		OK: true, Query: q, Mode: mode, Summary: homeSearchSummaryV1(q, mode, nav, web),
		Answer: answer, AnswerSources: answerSources, Offer: homeSearchOfferV2(q, nav),
		Results: results, Navigator: len(nav), Web: len(web), Generated: nowISO(),
	}
}

type homeSearchTransportV1 struct{ base http.RoundTripper }

func (t homeSearchTransportV1) RoundTrip(req *http.Request) (*http.Response, error) {
	if req.URL.Path != "/api/intelligence/search" {
		return t.base.RoundTrip(req)
	}
	if req.Method != http.MethodGet && req.Method != http.MethodHead {
		return transportJSONV3(req, http.StatusMethodNotAllowed, map[string]interface{}{"error": "method"})
	}
	q := strings.TrimSpace(req.URL.Query().Get("q"))
	if len([]rune(q)) > 220 {
		q = string([]rune(q)[:220])
	}
	if len([]rune(q)) < 2 {
		return transportJSONV3(req, http.StatusBadRequest, map[string]interface{}{"error": "Въведете по-конкретен въпрос или тема."})
	}
	mode := strings.ToLower(strings.TrimSpace(req.URL.Query().Get("mode")))
	if mode != "navigator" && mode != "web" && mode != "all" {
		mode = "all"
	}
	key := mode + "|" + strings.ToLower(q)
	homeSearchCacheMuV1.Lock()
	if hit, ok := homeSearchCacheV1[key]; ok && time.Since(hit.At) < 2*time.Minute {
		homeSearchCacheMuV1.Unlock()
		return homeSearchJSONV1(req, hit.Payload)
	}
	homeSearchCacheMuV1.Unlock()

	payload := buildHomeSearchPayloadV1(q, mode)
	homeSearchCacheMuV1.Lock()
	if len(homeSearchCacheV1) > 80 {
		homeSearchCacheV1 = map[string]homeSearchCacheEntryV1{}
	}
	homeSearchCacheV1[key] = homeSearchCacheEntryV1{Payload: payload, At: time.Now()}
	homeSearchCacheMuV1.Unlock()
	return homeSearchJSONV1(req, payload)
}

func homeSearchJSONV1(req *http.Request, payload homeSearchPayloadV1) (*http.Response, error) {
	b, _ := json.Marshal(payload)
	h := make(http.Header)
	h.Set("Content-Type", "application/json; charset=utf-8")
	h.Set("Cache-Control", "no-store")
	return &http.Response{
		StatusCode: http.StatusOK, Status: "200 OK", Header: h,
		Body: io.NopCloser(bytes.NewReader(b)), ContentLength: int64(len(b)), Request: req,
	}, nil
}

func init() {
	if authProxy == nil {
		return
	}
	base := authProxy.Transport
	if base == nil {
		base = http.DefaultTransport
	}
	authProxy.Transport = homeSearchTransportV1{base: base}
}

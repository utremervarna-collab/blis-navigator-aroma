package main

import (
	"bytes"
	"encoding/base64"
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
	stop := map[string]bool{
		"на":true,"в":true,"във":true,"за":true,"от":true,"до":true,"и":true,"или":true,"с":true,"със":true,"по":true,"при":true,"към":true,
		"как":true,"какво":true,"колко":true,"кога":true,"къде":true,"кой":true,"коя":true,"кои":true,"е":true,"са":true,"има":true,"ли":true,"се":true,"ми":true,
		"the":true,"a":true,"an":true,"of":true,"in":true,"on":true,"for":true,"to":true,"and":true,"or":true,"is":true,"are":true,"what":true,"how":true,"when":true,"where":true,
	}
	seen := map[string]bool{}
	out := []string{}
	for _, t := range strings.Fields(q) {
		if len([]rune(t)) < 3 || stop[t] || seen[t] {
			continue
		}
		seen[t] = true
		out = append(out, t)
	}
	return out
}

func homeSearchTokenHitV4(token, text string) bool {
	token = strings.ToLower(strings.TrimSpace(token))
	text = strings.ToLower(text)
	if token == "" || text == "" {
		return false
	}
	if strings.Contains(text, token) {
		return true
	}
	r := []rune(token)
	if len(r) >= 5 {
		n := 4
		if r[0] >= 'а' && r[0] <= 'я' {
			n = 3
		}
		if n < len(r) && strings.Contains(text, string(r[:n])) {
			return true
		}
	}
	return false
}

func homeSearchLooksRussianV4(v string) bool {
	low := " " + strings.ToLower(v) + " "
	score := 0
	for _, x := range []string{"ы","э","ё"," которая "," который "," что "," всё "," является "," служит "," миллионов "," товаров "," скидки "," купить "," доставка "} {
		if strings.Contains(low, x) {
			score++
		}
	}
	return score >= 2 || strings.Contains(low, "ы") || strings.Contains(low, "э") || strings.Contains(low, "ё")
}

func homeSearchBulgarianQueryV4(q string) bool {
	for _, r := range strings.ToLower(q) {
		if r >= 'а' && r <= 'я' {
			return true
		}
	}
	return false
}

func homeSearchResultRelevanceV4(q, title, text, source string) float64 {
	tokens := homeSearchTokensV1(q)
	if len(tokens) == 0 {
		return 0
	}
	combined := title + " " + text
	if homeSearchBulgarianQueryV4(q) && homeSearchLooksRussianV4(combined) {
		return 0
	}
	hits := 0
	score := 0.0
	for _, t := range tokens {
		hit := false
		if homeSearchTokenHitV4(t, title) {
			score += 7
			hit = true
		}
		if homeSearchTokenHitV4(t, text) {
			score += 3
			hit = true
		}
		if homeSearchTokenHitV4(t, source) {
			score += 1
			hit = true
		}
		if hit {
			hits++
		}
	}
	need := 1
	if len(tokens) >= 3 {
		need = 2
	}
	if len(tokens) >= 5 {
		need = 3
	}
	if hits < need {
		return 0
	}
	score += float64(hits) * 4
	if strings.Contains(strings.ToLower(combined), strings.ToLower(strings.TrimSpace(q))) {
		score += 12
	}
	return score
}

func homeSearchMatchScoreV1(tokens []string, title, text, brand, source string) float64 {
	if len(tokens) == 0 {
		return 0
	}
	score := 0.0
	hits := 0
	for _, t := range tokens {
		hit := false
		if homeSearchTokenHitV4(t, title) {
			score += 6
			hit = true
		}
		if homeSearchTokenHitV4(t, brand) {
			score += 5
			hit = true
		}
		if homeSearchTokenHitV4(t, text) {
			score += 2
			hit = true
		}
		if homeSearchTokenHitV4(t, source) {
			score += 1
			hit = true
		}
		if hit {
			hits++
		}
	}
	need := 1
	if len(tokens) >= 3 {
		need = 2
	}
	if len(tokens) >= 5 {
		need = 3
	}
	if hits < need {
		return 0
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

func homeSearchResolveBingURLV4(raw string) string {
	raw = html.UnescapeString(strings.TrimSpace(raw))
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	host := strings.ToLower(strings.TrimPrefix(u.Host, "www."))
	if host != "bing.com" && !strings.HasSuffix(host, ".bing.com") {
		return raw
	}
	for _, key := range []string{"u", "url", "r"} {
		target := strings.TrimSpace(u.Query().Get(key))
		if target == "" {
			continue
		}
		if decoded, err := url.QueryUnescape(target); err == nil {
			target = decoded
		}
		if strings.HasPrefix(target, "http://") || strings.HasPrefix(target, "https://") {
			return target
		}
		if strings.HasPrefix(target, "a1") {
			enc := strings.TrimPrefix(target, "a1")
			if b, err := base64.RawURLEncoding.DecodeString(enc); err == nil {
				v := string(b)
				if strings.HasPrefix(v, "http://") || strings.HasPrefix(v, "https://") {
					return v
				}
			}
		}
	}
	return ""
}

func homeWebBingV1(q string, limit int) []homeSearchResultV1 {
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(q) + "&count=20&setlang=bg-BG&mkt=bg-BG&cc=BG"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	type scored struct {
		r homeSearchResultV1
		s float64
	}
	rows := []scored{}
	seen := map[string]bool{}
	for _, block := range collectorBlockRE.FindAllStringSubmatch(body, -1) {
		if len(block) < 2 {
			continue
		}
		lm := collectorLinkRE.FindStringSubmatch(block[1])
		if len(lm) < 3 {
			continue
		}
		rawURL := homeSearchResolveBingURLV4(lm[1])
		if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
			continue
		}
		if seen[strings.ToLower(rawURL)] {
			continue
		}
		title := cleanPostSnippet(html.UnescapeString(lm[2]))
		snippet := ""
		if pm := collectorPRE.FindStringSubmatch(block[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(html.UnescapeString(pm[1]))
		}
		source := ""
		if u, err := url.Parse(rawURL); err == nil {
			source = strings.TrimPrefix(strings.ToLower(u.Host), "www.")
		}
		if source == "bing.com" || strings.HasSuffix(source, ".bing.com") {
			continue
		}
		if title == "" {
			continue
		}
		score := homeSearchResultRelevanceV4(q, title, snippet, source)
		if score <= 0 {
			continue
		}
		seen[strings.ToLower(rawURL)] = true
		rows = append(rows, scored{r:homeSearchResultV1{Kind:"web",Title:title,Snippet:snippet,Source:source,URL:rawURL,Score:score},s:score})
	}
	sort.SliceStable(rows,func(i,j int)bool{return rows[i].s>rows[j].s})
	out:=[]homeSearchResultV1{}
	for _,row:=range rows{
		out=append(out,row.r)
		if len(out)>=limit{break}
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
	type scored struct{ r homeSearchResultV1; s float64 }
	rows:=[]scored{}
	for _, item := range feed.Channel.Items {
		title := cleanPostSnippet(item.Title)
		snippet := cleanPostSnippet(item.Description)
		if title == "" {
			continue
		}
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		score:=homeSearchResultRelevanceV4(q,title,snippet,source)
		if score<=0{continue}
		rows=append(rows,scored{r:homeSearchResultV1{
			Kind:"news",Title:title,Snippet:snippet,Source:source,
			URL:strings.TrimSpace(item.Link),Published:strings.TrimSpace(item.PubDate),Score:score,
		},s:score})
	}
	sort.SliceStable(rows,func(i,j int)bool{return rows[i].s>rows[j].s})
	out:=[]homeSearchResultV1{}
	for _,row:=range rows{
		out=append(out,row.r)
		if len(out)>=limit{break}
	}
	return out
}

func homeSearchNeedsNewsV4(q string) bool {
	low:=strings.ToLower(q)
	for _,term:=range []string{"новини","новина","последн","днес","вчера","сега","актуалн","развитие","какво се случва","latest","news","today","recent"}{
		if strings.Contains(low,term){return true}
	}
	return false
}

func homeWebSearchV1(q string, limit int) []homeSearchResultV1 {
	web:=homeWebBingV1(q,limit+4)
	all:=append([]homeSearchResultV1{},web...)
	if homeSearchNeedsNewsV4(q){
		all=append(all,homeWebNewsV1(q,5)...)
	}
	sort.SliceStable(all,func(i,j int)bool{return all[i].Score>all[j].Score})
	seen:=map[string]bool{}
	out:=[]homeSearchResultV1{}
	for _,r:=range all{
		key:=strings.ToLower(strings.TrimSpace(r.URL+"|"+r.Title))
		if key==""||seen[key]{continue}
		if homeSearchBulgarianQueryV4(q)&&homeSearchLooksRussianV4(r.Title+" "+r.Snippet){continue}
		seen[key]=true
		out=append(out,r)
		if len(out)>=limit{break}
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

func homeSearchPreviewV3(v string, maxRunes int) string {
	v = strings.TrimSpace(strings.Join(strings.Fields(cleanPostSnippet(v)), " "))
	if v == "" {
		return ""
	}
	r := []rune(v)
	if maxRunes <= 0 {
		maxRunes = 420
	}
	if len(r) > maxRunes {
		return strings.TrimSpace(string(r[:maxRunes])) + "…"
	}
	return v
}

func homeSearchSentenceScoreV4(q, sentence string) float64 {
	sentence=strings.TrimSpace(strings.Join(strings.Fields(sentence)," "))
	if len([]rune(sentence))<45||len([]rune(sentence))>360{return 0}
	if homeSearchBulgarianQueryV4(q)&&homeSearchLooksRussianV4(sentence){return 0}
	low:=strings.ToLower(sentence)
	for _,bad:=range []string{"cookie","бисквитк","поверителност","privacy","регистрац","вход в профил","javascript","прочетете повече"}{
		if strings.Contains(low,bad){return 0}
	}
	tokens:=homeSearchTokensV1(q)
	hits:=0
	for _,t:=range tokens{
		if homeSearchTokenHitV4(t,sentence){hits++}
	}
	need:=1
	if len(tokens)>=3{need=2}
	if len(tokens)>=5{need=3}
	if hits<need{return 0}
	return float64(hits*10)+float64(360-len([]rune(sentence)))/120
}

func homeSearchBestPageSentenceV4(q, rawURL string) string {
	if strings.TrimSpace(rawURL)==""{return ""}
	status,body,_,err:=timedFetch(rawURL,2*1024*1024)
	if err!=nil||status<200||status>=400{return ""}
	_,plain:=competitorPageText(body)
	if plain==""{return ""}
	parts:=strings.FieldsFunc(plain,func(r rune)bool{return r=='.'||r=='!'||r=='?'||r=='\n'||r=='\r'})
	best:=""
	bestScore:=0.0
	for _,part:=range parts{
		s:=strings.TrimSpace(part)
		score:=homeSearchSentenceScoreV4(q,s)
		if score>bestScore{
			bestScore=score
			best=s
		}
	}
	return homeSearchPreviewV3(best,300)
}

func homeSearchAnswerV2(q string, web []homeSearchResultV1) (string, []homeSearchAnswerSourceV1) {
	if len(web)==0{return "",nil}
	type enriched struct{idx int; sentence string}
	ch:=make(chan enriched,2)
	fetchN:=2
	if len(web)<fetchN{fetchN=len(web)}
	for i:=0;i<fetchN;i++{
		go func(idx int){ch<-enriched{idx:idx,sentence:homeSearchBestPageSentenceV4(q,web[idx].URL)}}(i)
	}
	pageSent:=map[int]string{}
	for i:=0;i<fetchN;i++{e:=<-ch;pageSent[e.idx]=e.sentence}
	parts:=[]string{}
	sources:=[]homeSearchAnswerSourceV1{}
	seenText:=map[string]bool{}
	for i,r:=range web{
		text:=pageSent[i]
		if text==""{text=homeSearchPreviewV3(r.Snippet,260)}
		if text==""{text=homeSearchPreviewV3(r.Title,180)}
		if homeSearchSentenceScoreV4(q,text)<=0{
			continue
		}
		key:=strings.ToLower(strings.TrimSpace(text))
		if !seenText[key]{
			seenText[key]=true
			parts=append(parts,text)
		}
		if strings.TrimSpace(r.URL)!=""{
			sources=append(sources,homeSearchAnswerSourceV1{Title:homeSearchCompactTextV2(r.Title,120),Source:strings.TrimSpace(r.Source),URL:r.URL})
		}
		if len(parts)>=2||len(strings.Join(parts," "))>=330{break}
	}
	answer:=strings.TrimSpace(strings.Join(parts," "))
	if len([]rune(answer))>430{answer=homeSearchPreviewV3(answer,430)}
	return answer,sources
}

func homeSearchContainsAnyV3(low string, terms []string) bool {
	for _, term := range terms {
		if strings.Contains(low, term) {
			return true
		}
	}
	return false
}

func homeSearchExplicitProfileV3(q string, nav []homeSearchResultV1) bool {
	low := strings.ToLower(strings.TrimSpace(q))
	if homeSearchContainsAnyV3(low, []string{"компания", "фирма", "марка", "бранд", "репутац", "кампания", "медия", "социалн", "company", "brand", "reputation"}) {
		return true
	}
	for _, r := range nav {
		if r.Kind != "profile" {
			continue
		}
		name := strings.ToLower(strings.TrimSpace(firstNonEmptyV1(r.ClientName, r.Title)))
		if len([]rune(name)) >= 4 && strings.Contains(low, name) {
			return true
		}
	}
	return false
}

func homeSearchBusinessIntentV2(q string, nav []homeSearchResultV1) (bool, string) {
	low := strings.ToLower(q)
	if homeSearchContainsAnyV3(low, []string{"криза", "риск", "скандал", "протест", "съд", "атака", "негатив", "crisis", "risk"}) {
		return true, "risk"
	}
	if homeSearchContainsAnyV3(low, []string{"цена", "цени", "струва", "промо", "оферта", "намаление", "продукт", "артикул", "магазин", "lidl", "kaufland", "billa", "price", "prices", "promotion", "product"}) {
		return true, "price"
	}
	if homeSearchContainsAnyV3(low, []string{"пазар", "сектор", "индустр", "конкурент", "потребител", "търсене", "продажб", "офис", "имот", "retail", "fmcg", "market", "sector", "competitor"}) {
		return true, "market"
	}
	if homeSearchExplicitProfileV3(q, nav) {
		return true, "brand"
	}
	return false, ""
}

func homeSearchOfferV2(q string, nav []homeSearchResultV1) homeSearchOfferV1 {
	ok, kind := homeSearchBusinessIntentV2(q, nav)
	if !ok {
		return homeSearchOfferV1{}
	}
	title := "Искате по-задълбочен анализ?"
	text := "BLIS™ Navigator може да разшири краткия отговор с повече проверени източници, контекст и аналитични изводи."
	switch kind {
	case "brand":
		title = "Искате задълбочен анализ на компанията?"
		text = "Navigator може да изгради цялостен профил на компанията, конкурентната среда, публичните споменавания, репутацията и ключовите промени във времето."
	case "market":
		title = "Искате пълен анализ на този пазар?"
		text = "Navigator може да разшири темата с конкурентна картина, пазарна динамика, тенденции, сигнали, рискове и практически изводи."
	case "price":
		title = "Искате по-пълна картина на цените и конкуренцията?"
		text = "Navigator може да сравни повече публични източници и конкуренти, да проследи промени в цените и промоциите и да постави резултата в пазарен контекст."
	case "risk":
		title = "Искате пълен анализ и проследяване на развитието?"
		text = "Navigator може да проследи източниците, динамиката, тона, рисковете и новите сигнали и да ги обедини в постоянен аналитичен профил."
	}
	return homeSearchOfferV1{
		Show: true,
		Title: title,
		Text: text,
		CTA: "Поръчай пълен анализ с Navigator",
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
	answer, answerSources := homeSearchAnswerV2(q, web)
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

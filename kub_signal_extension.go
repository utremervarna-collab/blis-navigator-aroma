package main

import (
	"encoding/xml"
	"html"
	"net/url"
	"strings"
	"time"
)

var kubSignalAliases = []string{
	"Корпорация КУБ",
	"групировка КУБ",
	"Баба Алино",
	"Forest Club Varna",
	"Форест Клуб Варна",
	"Forest Club",
}

func kubSignalQuery() string {
	parts := make([]string, 0, len(kubSignalAliases))
	for _, term := range kubSignalAliases {
		parts = append(parts, `"`+term+`"`)
	}
	return strings.Join(parts, " OR ")
}

func kubRelevant(text string) bool {
	low := strings.ToLower(text)
	for _, term := range kubSignalAliases {
		if strings.Contains(low, strings.ToLower(term)) {
			return true
		}
	}
	return false
}

func kubSignalRisk(text string) (string, float64, string) {
	low := strings.ToLower(text)
	risk := 35.0
	topic := "reputation"

	critical := []string{"корупцион", "престъп", "прокурат", "запечат", "събар", "премахван", "незакон", "обвин", "разслед", "парламентар", "народното събрание", "спиране на тока", "без ток", "спиране на водата"}
	high := []string{"съд", "дело", "жалба", "електрозахран", "водоснабд", "община", "строителен контрол", "полиция", "институци"}
	for _, term := range critical {
		if strings.Contains(low, term) {
			risk += 12
		}
	}
	for _, term := range high {
		if strings.Contains(low, term) {
			risk += 6
		}
	}
	if strings.Contains(low, "парламент") || strings.Contains(low, "народното събрание") || strings.Contains(low, "прокурат") || strings.Contains(low, "съд") || strings.Contains(low, "община") {
		topic = "regulatory"
	}
	if risk > 100 {
		risk = 100
	}
	sentiment := "neutral"
	if risk >= 60 {
		sentiment = "negative"
	}
	return sentiment, risk, topic
}

func buildKUBSignal(source, sourceType, rawURL, title, text, published string) (Signal, bool) {
	title = cleanPostSnippet(title)
	text = cleanPostSnippet(text)
	if text == "" {
		text = title
	}
	if rawURL == "" || !kubRelevant(title+" "+text) {
		return Signal{}, false
	}
	low := strings.ToLower(title + " " + text)
	relevance := 72.0
	if strings.Contains(low, "корпорация куб") || strings.Contains(low, "групировка куб") {
		relevance = 100
	} else if strings.Contains(low, "баба алино") {
		relevance = 92
	} else if strings.Contains(low, "forest club") || strings.Contains(low, "форест клуб") {
		relevance = 82
	}
	sentiment, risk, topic := kubSignalRisk(title + " " + text)
	fingerprint := signalHash("kub", rawURL, title, text)
	return Signal{
		ID:          fingerprint[:16],
		Client:      "kub",
		Brand:       "Корпорация КУБ",
		Source:      source,
		SourceType:  sourceType,
		Scope:       "external",
		URL:         rawURL,
		Title:       title,
		Text:        text,
		PublishedAt: published,
		DetectedAt:  nowISO(),
		Relevance:   relevance,
		Sentiment:   sentiment,
		Topic:       topic,
		RiskScore:   risk,
		Severity:    signalSeverity(risk),
		Fingerprint: fingerprint,
	}, true
}

func collectKUBNewsSignals() []Signal {
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(kubSignalQuery()) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed collectorRSS
	if err := xml.Unmarshal([]byte(body), &feed); err != nil {
		return nil
	}
	out := make([]Signal, 0, 100)
	for _, item := range feed.Channel.Items {
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		if s, ok := buildKUBSignal(source, "news", item.Link, item.Title, item.Description, item.PubDate); ok {
			out = append(out, s)
			if len(out) >= 100 {
				break
			}
		}
	}
	return out
}

func collectKUBWebSignals() []Signal {
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(kubSignalQuery()) + "&count=50&setlang=bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
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
		if rawURL == "" || seen[strings.ToLower(rawURL)] {
			continue
		}
		seen[strings.ToLower(rawURL)] = true
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
			if len(out) >= 50 {
				break
			}
		}
	}
	return out
}

func kubSeedSignal(source, rawURL, title, text, published string, risk float64) Signal {
	fingerprint := signalHash("kub", rawURL, title, text)
	return Signal{
		ID: fingerprint[:16], Client: "kub", Brand: "Корпорация КУБ", Source: source,
		SourceType: "news", Scope: "external", URL: rawURL, Title: title, Text: text,
		PublishedAt: published, DetectedAt: nowISO(), Relevance: 100, Sentiment: "negative",
		Topic: "regulatory", RiskScore: risk, Severity: signalSeverity(risk), Fingerprint: fingerprint,
	}
}

func kubVerifiedCurrentSignals() []Signal {
	return []Signal{
		kubSeedSignal("БТА", "https://www.bta.bg/bg/news/bulgaria/oficial-messages/1196415-kosta-stoyanov-za-nay-golyamata-koruptsionna-shema-baba-alino-darzhavata-znae", "Коста Стоянов: „Държавата знае, въпросът е защо не действа“", "Политическа декларация от парламентарната трибуна на Народното събрание за казуса „Баба Алино“ и действията, свързвани с КУБ.", "2026-09-02T10:03:00+03:00", 98),
		kubSeedSignal("БНТ", "https://bntnews.bg/news/kosta-stoyanov-za-nai-golyamata-korupcionna-shema-baba-alino-darzhavata-znae-vaprosat-e-zashto-ne-deistva-1410513news.html", "БНТ отрази декларацията на „Възраждане“ за „Баба Алино“", "Коста Стоянов отправя остри критики към институциите и поставя казуса отново на национално парламентарно ниво.", "2026-09-02T09:58:00+03:00", 96),
		kubSeedSignal("Varna24", "https://www.varna24.bg/novini/varna/Kosta-Stoyanov-za-Baba-Alino-Durzhavata-znae-vuprosut-e-zashto-ne-deistva-3019111", "Varna24 публикува декларацията за „Баба Алино“", "Материалът възпроизвежда позицията на Коста Стоянов, че институциите разполагат с информация и въпросът вече е защо не действат.", "2026-09-02T10:03:00+03:00", 94),
		kubSeedSignal("DarikNews", "https://dariknews.bg/novini/bylgariia/vyzrazhdane-za-godina-ne-vidiahme-nito-edin-osyden-za-sluchaia-baba-alino-2465416", "„Възраждане“: За година няма нито един осъден за случая „Баба Алино“", "Darik отразява декларацията от парламентарната трибуна и критиките за липса на осъдени и институционален резултат.", "2026-09-02T10:49:00+03:00", 94),
		kubSeedSignal("Евроком", "https://eurocom.bg/video/nezakonnoto-selishte-baba-alino-stroitelstvoto-prodalzhava-tokat-ne-e-napalno-spryan/", "Евроком: Строителството в „Баба Алино“ продължава, токът не е напълно спрян", "Материалът поставя нов оперативен и репутационен риск около строителните дейности, електрозахранването и действията на институциите.", "2026-09-02T10:31:00+03:00", 90),
		kubSeedSignal("Евроком", "https://eurocom.bg/video/sadat-vav-varna-otkaza-tok-za-nezakonnite-sgradi-v-baba-alino/", "Евроком: Съдът във Варна отказа ток за сградите в „Баба Алино“", "Материалът свързва съдебното развитие, електрозахранването и предстоящото запечатване на обекти с КУБ и „Баба Алино“.", "2026-09-02T00:09:00+03:00", 90),
	}
}

func runKUBSignalCollector() {
	fresh := kubVerifiedCurrentSignals()
	fresh = append(fresh, collectKUBNewsSignals()...)
	fresh = append(fresh, collectKUBWebSignals()...)
	fresh = dedupeSignals(fresh)
	mergeSignals("kub", fresh)
	saveSignalStateFile()
}

func init() {
	go func() {
		time.Sleep(2 * time.Second)
		runKUBSignalCollector()
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			runKUBSignalCollector()
		}
	}()
}

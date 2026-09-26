package main

import (
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"
)

type decisionTransportV1 struct{ base http.RoundTripper }

type decisionMoveV1 struct {
	Competitor string                   `json:"competitor"`
	Type       string                   `json:"type"`
	Title      string                   `json:"title"`
	Summary    string                   `json:"summary"`
	LastSeen   string                   `json:"last_seen"`
	Sources    int                      `json:"sources"`
	Evidence   []IntelligenceEvidenceV3 `json:"evidence"`
}

type decisionOpportunityV1 struct {
	Type        string                   `json:"type"`
	Title       string                   `json:"title"`
	Explanation string                   `json:"explanation"`
	Sources     int                      `json:"sources"`
	Evidence    []IntelligenceEvidenceV3 `json:"evidence"`
}

type decisionReasonV1 struct {
	Title       string                   `json:"title"`
	Explanation string                   `json:"explanation"`
	Direction   string                   `json:"direction"`
	Evidence    []IntelligenceEvidenceV3 `json:"evidence"`
}

type decisionBriefItemV1 struct {
	Label       string `json:"label"`
	Title       string `json:"title"`
	Text        string `json:"text"`
	EvidenceCnt int    `json:"evidence_count"`
}

func decisionRecentV1(s Signal, days int) bool {
	t := analysisSignalTimeV3(s)
	if t.IsZero() {
		return false
	}
	age := time.Since(t)
	return age >= 0 && age <= time.Duration(days)*24*time.Hour
}

func decisionMoveTypeV1(s Signal) string {
	low := strings.ToLower(s.Title + " " + s.Text)
	switch {
	case strings.Contains(low, "цена"), strings.Contains(low, "price"), strings.Contains(low, "промо"), strings.Contains(low, "discount"), strings.Contains(low, "оферт"):
		return "Цена / оферта"
	case strings.Contains(low, "нов продукт"), strings.Contains(low, "launch"), strings.Contains(low, "линия"), strings.Contains(low, "колекция"), strings.Contains(low, "product"):
		return "Продукт"
	case strings.Contains(low, "кампания"), strings.Contains(low, "campaign"), strings.Contains(low, "реклама"), strings.Contains(low, "advert"):
		return "Кампания"
	case strings.Contains(low, "партньор"), strings.Contains(low, "partner"), strings.Contains(low, "събит"), strings.Contains(low, "event"), strings.Contains(low, "фестив"):
		return "Партньорство / събитие"
	case strings.Contains(low, "сайт"), strings.Contains(low, "website"), strings.Contains(low, "landing"), strings.Contains(low, "страниц"), strings.Contains(low, "e-commerce"):
		return "Дигитално движение"
	case strings.Contains(low, "позиция"), strings.Contains(low, "career"), strings.Contains(low, "hiring"), strings.Contains(low, "job"), strings.Contains(low, "назнач"):
		return "Екип / разширяване"
	case strings.Contains(low, "интервю"), strings.Contains(low, "interview"), strings.Contains(low, "медия"), strings.Contains(low, "публикац"), strings.Contains(low, "review"):
		return "Публична активност"
	default:
		return "Пазарно движение"
	}
}

func decisionCompetitiveMovesV1(slug string) []decisionMoveV1 {
	rows := analysisSignalsForClientV3(slug)
	type agg struct {
		competitor string
		typ        string
		rows       []Signal
		sources    map[string]bool
		latest     time.Time
	}
	groups := map[string]*agg{}
	for _, s := range rows {
		if s.Scope != "competitor" || !decisionRecentV1(s, 45) {
			continue
		}
		competitor := strings.TrimSpace(s.Brand)
		if competitor == "" {
			competitor = "Конкурент"
		}
		typ := decisionMoveTypeV1(s)
		key := strings.ToLower(competitor + "|" + typ)
		a := groups[key]
		if a == nil {
			a = &agg{competitor: competitor, typ: typ, sources: map[string]bool{}}
			groups[key] = a
		}
		a.rows = append(a.rows, s)
		if strings.TrimSpace(s.Source) != "" {
			a.sources[strings.ToLower(strings.TrimSpace(s.Source))] = true
		}
		if t := analysisSignalTimeV3(s); t.After(a.latest) {
			a.latest = t
		}
	}
	out := make([]decisionMoveV1, 0, len(groups))
	for _, a := range groups {
		if len(a.rows) == 0 {
			continue
		}
		sort.SliceStable(a.rows, func(i, j int) bool { return analysisSignalTimeV3(a.rows[i]).After(analysisSignalTimeV3(a.rows[j])) })
		lead := a.rows[0]
		title := strings.TrimSpace(lead.Title)
		if title == "" {
			title = a.competitor + " — " + a.typ
		}
		summary := "Потвърдено движение при " + a.competitor + "."
		if len(a.rows) > 1 {
			summary = "Има " + strconv.Itoa(len(a.rows)) + " свързани сигнала за " + strings.ToLower(a.typ) + "."
		}
		out = append(out, decisionMoveV1{
			Competitor: a.competitor,
			Type:       a.typ,
			Title:      title,
			Summary:    summary,
			LastSeen:   a.latest.Format(time.RFC3339),
			Sources:    len(a.sources),
			Evidence:   topEvidenceV3(a.rows, 3),
		})
	}
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].LastSeen != out[j].LastSeen {
			return out[i].LastSeen > out[j].LastSeen
		}
		return out[i].Sources > out[j].Sources
	})
	if len(out) > 6 {
		out = out[:6]
	}
	return out
}

func decisionOpportunityTitleV1(topic string) (string, string) {
	switch topic {
	case "commercial":
		return "Търговска възможност", "Наблюдава се пазарна или търговска тема с достатъчно потвърждение."
	case "product":
		return "Продуктова възможност", "Появява се продуктова тема с положителен или нарастващ контекст."
	case "reputation":
		return "Положителен репутационен импулс", "Има повторяем положителен контекст, който заслужава проследяване."
	case "brand_mention":
		return "Засилващ се интерес към бранда", "Публичният разговор показва положителна тема с повече от единично потвърждение."
	default:
		return "Пазарна възможност", "Има потвърдена тема, която може да създаде благоприятен контекст за бранда."
	}
}

func decisionOpportunitiesV1(slug string) []decisionOpportunityV1 {
	rows := analysisSignalsForClientV3(slug)
	type agg struct {
		topic     string
		rows      []Signal
		sources   map[string]bool
		positive  int
		relevance float64
	}
	groups := map[string]*agg{}
	for _, s := range rows {
		if s.Scope == "competitor" || !decisionRecentV1(s, 21) {
			continue
		}
		if !(s.Sentiment == "positive" || s.Topic == "commercial" || s.Topic == "product") {
			continue
		}
		if s.RiskScore >= 60 {
			continue
		}
		topic := strings.TrimSpace(s.Topic)
		if topic == "" {
			topic = "brand_mention"
		}
		a := groups[topic]
		if a == nil {
			a = &agg{topic: topic, sources: map[string]bool{}}
			groups[topic] = a
		}
		a.rows = append(a.rows, s)
		a.relevance += s.Relevance
		if s.Sentiment == "positive" {
			a.positive++
		}
		if strings.TrimSpace(s.Source) != "" {
			a.sources[strings.ToLower(strings.TrimSpace(s.Source))] = true
		}
	}
	out := []decisionOpportunityV1{}
	for _, a := range groups {
		if len(a.rows) == 0 {
			continue
		}
		avgRel := a.relevance / float64(len(a.rows))
		if len(a.sources) < 2 && !(a.positive > 0 && avgRel >= 70) {
			continue
		}
		title, explanation := decisionOpportunityTitleV1(a.topic)
		if len(a.sources) >= 2 {
			explanation += " Потвърждението идва от " + strconv.Itoa(len(a.sources)) + " независими източника."
		} else {
			explanation += " Сигналът е силен, но все още е с ограничено източниково покритие."
		}
		out = append(out, decisionOpportunityV1{Type: a.topic, Title: title, Explanation: explanation, Sources: len(a.sources), Evidence: topEvidenceV3(a.rows, 3)})
	}
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].Sources != out[j].Sources {
			return out[i].Sources > out[j].Sources
		}
		return len(out[i].Evidence) > len(out[j].Evidence)
	})
	if len(out) > 3 {
		out = out[:3]
	}
	return out
}

func decisionMetricLabelV1(metric string) string {
	low := strings.ToLower(metric)
	switch {
	case strings.Contains(low, "rating"):
		return "Публичната оценка се промени"
	case strings.Contains(low, "review"):
		return "Обемът на отзивите се промени"
	case strings.Contains(low, "mention"):
		return "Обемът на споменаванията се промени"
	case strings.Contains(low, "activity"):
		return "Видимата активност се промени"
	case strings.Contains(low, "index"), strings.Contains(low, "score"):
		return "Ключов измерен показател се промени"
	case strings.Contains(low, "price"):
		return "Има измерима ценова промяна"
	default:
		return "Има измерима промяна"
	}
}

func decisionWhyV1(slug string, a IntelligenceAnalysisV3) []decisionReasonV1 {
	out := []decisionReasonV1{}
	m := buildMetricIntelligenceV33(slug)
	if changes, ok := m["changes"].([]MetricChangeV33); ok {
		for _, ch := range changes {
			if len(out) >= 2 {
				break
			}
			out = append(out, decisionReasonV1{Title: decisionMetricLabelV1(ch.Metric), Explanation: ch.Interpretation, Direction: ch.Direction})
		}
	}
	for _, in := range a.Insights {
		if len(out) >= 3 {
			break
		}
		if in.Category == "data_quality" {
			continue
		}
		duplicate := false
		for _, x := range out {
			if strings.EqualFold(x.Title, in.Title) {
				duplicate = true
			}
		}
		if duplicate {
			continue
		}
		out = append(out, decisionReasonV1{Title: in.Title, Explanation: in.Finding + " " + in.WhyItMatters, Direction: in.Direction, Evidence: in.Evidence})
	}
	if len(out) == 0 {
		out = append(out, decisionReasonV1{Title: "Няма съществена измерена промяна", Explanation: "Текущите данни не показват достатъчно силно движение, което да изисква отделно обяснение.", Direction: "stable"})
	}
	return out
}

func decisionAIVisibilityV1(slug string) map[string]interface{} {
	c := analysisClientCopyV3(slug)
	providers := []string{"ChatGPT", "Google AI", "Gemini", "Claude", "Perplexity"}
	rows := []map[string]interface{}{}
	found := 0
	if c != nil {
		for _, provider := range providers {
			key := strings.ToLower(strings.ReplaceAll(provider, " ", "_"))
			status := "not_measured"
			var value interface{}
			for i := len(c.Observations) - 1; i >= 0; i-- {
				o := c.Observations[i]
				blob := strings.ToLower(o.SourceKey + " " + o.MetricKey)
				if strings.Contains(blob, strings.ToLower(provider)) || strings.Contains(blob, key) || strings.Contains(blob, "ai_visibility") || strings.Contains(blob, "llm_visibility") {
					status = "measured"
					value = o.Value
					found++
					break
				}
			}
			row := map[string]interface{}{"name": provider, "status": status}
			if value != nil {
				row["value"] = value
			}
			rows = append(rows, row)
		}
	}
	status := "not_measured"
	explanation := "Няма достатъчно директни измервания от AI платформи. Navigator не показва фиктивен AI индекс."
	if found > 0 {
		status = "active"
		explanation = "Показват се само реално регистрирани измервания за AI присъствие."
	}
	return map[string]interface{}{
		"status":      status,
		"explanation": explanation,
		"providers":   rows,
		"dimensions":  []string{"Споменаване на бранда", "Сравнение с конкуренти", "Източници в AI отговорите"},
	}
}

func decisionBriefV1(a IntelligenceAnalysisV3, why []decisionReasonV1, moves []decisionMoveV1, opp []decisionOpportunityV1) []decisionBriefItemV1 {
	out := []decisionBriefItemV1{}
	for _, in := range a.Insights {
		if in.Category == "data_quality" {
			continue
		}
		out = append(out, decisionBriefItemV1{Label: "Най-важното", Title: in.Title, Text: in.Finding, EvidenceCnt: len(in.Evidence)})
		break
	}
	if len(why) > 0 {
		out = append(out, decisionBriefItemV1{Label: "Какво се промени", Title: why[0].Title, Text: why[0].Explanation, EvidenceCnt: len(why[0].Evidence)})
	}
	if len(moves) > 0 {
		out = append(out, decisionBriefItemV1{Label: "Конкуренция", Title: moves[0].Competitor + " · " + moves[0].Type, Text: moves[0].Summary, EvidenceCnt: len(moves[0].Evidence)})
	}
	if len(opp) > 0 {
		out = append(out, decisionBriefItemV1{Label: "Възможност", Title: opp[0].Title, Text: opp[0].Explanation, EvidenceCnt: len(opp[0].Evidence)})
	}
	if len(out) == 0 {
		out = append(out, decisionBriefItemV1{Label: "Състояние", Title: "Няма нова значима промяна", Text: "Наблюдението продължава, без да се показва излишен информационен шум."})
	}
	if len(out) > 4 {
		out = out[:4]
	}
	return out
}

func decisionSummaryV1(slug string) map[string]interface{} {
	a := buildAnalysisV3(slug)
	moves := decisionCompetitiveMovesV1(slug)
	opp := decisionOpportunitiesV1(slug)
	why := decisionWhyV1(slug, a)
	brief := decisionBriefV1(a, why, moves, opp)
	return map[string]interface{}{
		"version":           "4.0-decision-v1",
		"client":            slug,
		"client_name":       a.ClientName,
		"generated_at":      nowISO(),
		"status":            a.Status,
		"brief":             brief,
		"why":               why,
		"competitive_moves": moves,
		"opportunities":     opp,
		"ai_visibility":     decisionAIVisibilityV1(slug),
	}
}

func decisionAskV1(slug, query string) map[string]interface{} {
	q := strings.ToLower(strings.TrimSpace(query))
	s := decisionSummaryV1(slug)
	a := buildAnalysisV3(slug)
	answer := "Ето най-важното от текущите проверени данни."
	evidence := []IntelligenceEvidenceV3{}
	intent := "brief"
	switch {
	case strings.Contains(q, "конкур"), strings.Contains(q, "compet"):
		intent = "competition"
		moves, _ := s["competitive_moves"].([]decisionMoveV1)
		if len(moves) == 0 {
			answer = "Няма потвърдено ново конкурентно движение над прага за значимост."
		} else {
			answer = moves[0].Competitor + ": " + moves[0].Summary + " Най-новият тип движение е „" + moves[0].Type + "“."
			evidence = moves[0].Evidence
		}
	case strings.Contains(q, "възмож"), strings.Contains(q, "opportun"):
		intent = "opportunity"
		opp, _ := s["opportunities"].([]decisionOpportunityV1)
		if len(opp) == 0 {
			answer = "В момента няма достатъчно потвърдена възможност. Navigator не показва слаби или еднократни сигнали като стратегическа възможност."
		} else {
			answer = opp[0].Title + ". " + opp[0].Explanation
			evidence = opp[0].Evidence
		}
	case strings.Contains(q, "защо"), strings.Contains(q, "промян"), strings.Contains(q, "why"):
		intent = "why"
		why, _ := s["why"].([]decisionReasonV1)
		if len(why) > 0 {
			answer = why[0].Title + ". " + why[0].Explanation
			evidence = why[0].Evidence
		}
	case strings.Contains(q, "ai"), strings.Contains(q, "chatgpt"), strings.Contains(q, "gemini"), strings.Contains(q, "claude"), strings.Contains(q, "perplexity"):
		intent = "ai_visibility"
		ai, _ := s["ai_visibility"].(map[string]interface{})
		answer, _ = ai["explanation"].(string)
	case strings.Contains(q, "риск"), strings.Contains(q, "репута"), strings.Contains(q, "risk"):
		intent = "risk"
		for _, in := range a.Insights {
			if in.Category == "risk" || in.Category == "reputation" || in.Category == "anomaly" {
				answer = in.Title + ". " + in.Finding + " " + in.WhyItMatters
				evidence = in.Evidence
				break
			}
		}
	default:
		brief, _ := s["brief"].([]decisionBriefItemV1)
		if len(brief) > 0 {
			parts := []string{}
			for _, b := range brief {
				parts = append(parts, b.Label+": "+b.Title+". "+b.Text)
			}
			answer = strings.Join(parts, " ")
		}
	}
	return map[string]interface{}{
		"client":       slug,
		"generated_at": nowISO(),
		"intent":       intent,
		"answer":       answer,
		"evidence":     evidence,
		"suggestions":  []string{"Какво се промени?", "Какво правят конкурентите?", "Има ли нова възможност?", "Как изглежда AI видимостта?"},
	}
}

func (t decisionTransportV1) RoundTrip(req *http.Request) (*http.Response, error) {
	path := req.URL.Path
	if path != "/api/decision/summary" && path != "/api/decision/ask" {
		return t.base.RoundTrip(req)
	}
	slug, _, ok := scopedClientV3(req)
	if !ok {
		if _, authenticated := sessionFromRequest(req); authenticated {
			return transportJSONV3(req, http.StatusBadRequest, map[string]interface{}{"error": "Невалиден Navigator клиент"})
		}
		return transportJSONV3(req, http.StatusUnauthorized, map[string]interface{}{"error": "Изисква се валидна BLIS сесия"})
	}
	if slug == "wirello" {
		return transportJSONV3(req, http.StatusOK, map[string]interface{}{"client": slug, "public_demo": true, "decision_intelligence_disabled": true})
	}
	if path == "/api/decision/ask" {
		q := strings.TrimSpace(req.URL.Query().Get("q"))
		return transportJSONV3(req, http.StatusOK, decisionAskV1(slug, q))
	}
	return transportJSONV3(req, http.StatusOK, decisionSummaryV1(slug))
}

func init() {
	if authProxy == nil {
		return
	}
	base := authProxy.Transport
	if base == nil {
		base = http.DefaultTransport
	}
	authProxy.Transport = decisionTransportV1{base: base}
}

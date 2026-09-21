package main

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

// Varna Towers is a real monitored client. The original profile was a
// client-side onboarding snapshot; this module gives it a durable backend
// identity so brand and competitor signals can be collected, persisted and
// rendered without falling through to another client's dashboard/engine.

const varnaTowersBaselineAsOf = "2026-08-18"

func canonicalVarnaTowersSources() []Source {
	return []Source{
		{Key: "official_site", Label: "Varna Towers · официален сайт", URL: "https://www.varnatowers.bg/", Method: "официална информация, позициониране и промени", Reliability: .98},
		{Key: "building", Label: "Varna Towers · сградата", URL: "https://www.varnatowers.bg/sgradata", Method: "официални площи, заетост, паркиране и предназначение", Reliability: .98},
		{Key: "location", Label: "Varna Towers · локация", URL: "https://www.varnatowers.bg/lokatsia", Method: "официална локация и достъп", Reliability: .96},
		{Key: "tenants", Label: "Varna Towers · наематели", URL: "https://www.varnatowers.bg/en/tenants", Method: "официален tenant mix и промени", Reliability: .97},
		{Key: "services", Label: "Varna Towers · услуги", URL: "https://www.varnatowers.bg/uslugi", Method: "официални услуги и активности", Reliability: .97},
		{Key: "news", Label: "Varna Towers · новини", URL: "https://www.varnatowers.bg/en/news", Method: "официални новини и събития", Reliability: .97},
		{Key: "linkedin", Label: "LinkedIn · Varna Towers", URL: "https://bg.linkedin.com/company/varna-towers", Method: "публично фирмено съдържание и employer сигнали", Reliability: .88},
		{Key: "google_business", Label: "Google Maps · Varna Towers", URL: "https://www.google.com/maps/search/?api=1&query=Varna+Towers+Varna", Method: "публична локална видимост, статус, оценки и отзиви", Reliability: .90},
		{Key: "google_news", Label: "Google News · Varna Towers", URL: "https://news.google.com/search?q=Varna%20Towers&hl=bg&gl=BG&ceid=BG%3Abg", Method: "новинарски споменавания", Reliability: .91},
		{Key: "officemap", Label: "OfficeMAP · Varna Towers", URL: "https://www.officemap.bg/office/varna-towers", Method: "офис клас, площи и паркинг", Reliability: .88},
		{Key: "ownership_2026", Label: "Mediapool · сделка Varna Towers 2026", URL: "https://www.mediapool.bg/varna-tauars-e-s-nov-sobstvenik-a-na-balgarskiya-pazar-vleze-nov-sporten-brand-news383840.html", Method: "проверена публикация за собственост и пазарен контекст", Reliability: .94},
		{Key: "bultrako_2025", Label: "Varna Towers · Bultrako Motors showroom", URL: "https://www.varnatowers.bg/en/news/bultrako-motors-returns-to-varna-honda-subaru-moto-morini", Method: "официална новина за tenant/showroom развитие", Reliability: .98},
		{Key: "registry", Label: "Търговски регистър", URL: "https://portal.registryagency.bg/", Method: "официални фирмени вписвания", Reliability: 1.0},
		{Key: "municipality", Label: "Община Варна", URL: "https://www.varna.bg/", Method: "градска и институционална среда", Reliability: .95},
		{Key: "airport", Label: "Летище Варна", URL: "https://varna-airport.bg/", Method: "транспортна достъпност и среда", Reliability: .95},

		// Canonical direct competitors. These keys are already recognized by the
		// competitor collector and therefore feed news/web/social discovery.
		{Key: "bpv", Label: "Business Park Varna", URL: "https://www.bpv.bg/", Method: "пряк конкурент · официален сайт, офис площи, tenant activity, услуги и инвестиции", Reliability: .97},
		{Key: "landmark", Label: "Landmark Centre Varna", URL: "https://www.landmark.bg/landmark-centre-varna", Method: "пряк конкурент · Class A офиси, площи, parking и leasing позициониране", Reliability: .97},
		{Key: "blacksea_capital", Label: "Black Sea Capital Center", URL: "https://www.blackseacapital.com/", Method: "пряк конкурент · Class A+ офиси, услуги, tenant activity и централна локация", Reliability: .97},
		{Key: "komfort_business", Label: "Комфорт Бизнес Център", URL: "https://www.komfortbg.com/bg/portfolio/komfort-biznes-tsentr", Method: "пряк конкурент · административни/офис площи, корпоративна видимост и tenant activity", Reliability: .96},

		// External public evidence for the direct competitor set. These sources
		// keep the competitor timeline populated even when search-engine HTML
		// changes or temporarily returns no parseable results.
		{Key: "cmp_bpv_officemap", Label: "Business Park Varna", URL: "https://www.officemap.bg/office/business-park-varna", Method: "външен източник · офис клас, площи, availability и наемни условия", Reliability: .90},
		{Key: "cmp_landmark_officemap", Label: "Landmark Centre Varna", URL: "https://www.officemap.bg/office/landmark-centre-varna", Method: "външен източник · Class A профил, площи и leasing информация", Reliability: .90},
		{Key: "cmp_blacksea_sutherland", Label: "Black Sea Capital Center", URL: "https://www.sutherlandglobal.bg/contact/", Method: "външен tenant източник · потвърдена офис локация на Sutherland във Варна", Reliability: .94},
		{Key: "cmp_komfort_centralpoint_bdc", Label: "Комфорт Бизнес Център", URL: "https://www.bdrc.bg/contact", Method: "външен tenant/location източник · Central Point, Варна", Reliability: .90},

		{Key: "cmp_secondary_varna115", Label: "Varna 115", URL: "https://varna115.com/", Method: "втори конкурентен кръг · офиси, availability и услуги", Reliability: .95},
		{Key: "cmp_secondary_chayka", Label: "Chaika Center", URL: "https://www.chayka-center.com/bg/", Method: "втори конкурентен кръг · бизнес/търговски площи и tenant mix", Reliability: .93},
	}
}

func vtHasObservation(c *Client, source, metric string) bool {
	if c == nil {
		return false
	}
	for i := len(c.Observations) - 1; i >= 0; i-- {
		o := c.Observations[i]
		if o.SourceKey == source && o.MetricKey == metric {
			return true
		}
	}
	return false
}

func vtSeedObservation(c *Client, source, metric string, value interface{}, observedAt string) {
	if !vtHasObservation(c, source, metric) {
		add(c, source, metric, value, observedAt)
	}
}

func seedVarnaTowersVerifiedFacts(c *Client) {
	if c == nil {
		return
	}
	stamp := "2026-09-21T10:00:00+03:00"

	// Official Varna Towers building page, re-checked in September 2026.
	vtSeedObservation(c, "building", "gross_build_area_m2", 81506.0, stamp)
	vtSeedObservation(c, "building", "total_gla_m2", 47604.0, stamp)
	vtSeedObservation(c, "building", "retail_gla_m2", 29067.0, stamp)
	vtSeedObservation(c, "building", "office_gla_m2", 18537.0, stamp)
	vtSeedObservation(c, "building", "leased_area_m2", 15074.0, stamp)
	vtSeedObservation(c, "building", "underground_parking_spaces", 600.0, stamp)
	vtSeedObservation(c, "building", "retail_occupancy_pct", 8.0, stamp)
	vtSeedObservation(c, "building", "office_warehouse_occupancy_pct", 70.0, stamp)
	vtSeedObservation(c, "location", "official_drive_minutes_center", 10.0, stamp)
	vtSeedObservation(c, "location", "official_drive_minutes_airport", 10.0, stamp)
	vtSeedObservation(c, "official_site", "current_use", "mainly office centre", stamp)
	vtSeedObservation(c, "official_site", "site_owner_statement", "Piraeus Bank", stamp)

	// Mediapool / Cushman & Wakefield Forton market report, 28 May 2026.
	vtSeedObservation(c, "ownership_2026", "reported_owner_change", "acquired by two local private investors", stamp)
	vtSeedObservation(c, "ownership_2026", "reported_retail_lettable_m2", 29000.0, stamp)
	vtSeedObservation(c, "ownership_2026", "reported_office_lettable_m2", 18500.0, stamp)

	// OfficeMAP keeps a separate public specification. Preserve it separately
	// rather than overwriting the official-site figures.
	vtSeedObservation(c, "officemap", "office_class", "Class A", stamp)
	vtSeedObservation(c, "officemap", "completion_year", 2010.0, stamp)
	vtSeedObservation(c, "officemap", "office_area_including_common_m2", 18900.0, stamp)
	vtSeedObservation(c, "officemap", "open_parking_spaces", 250.0, stamp)
	vtSeedObservation(c, "officemap", "underground_parking_spaces", 550.0, stamp)

	// Official tenant page / official Bultrako Motors news.
	vtSeedObservation(c, "tenants", "public_tenant_mix", "Honda; Subaru; Moto Morini; AutoUnion; BYV games; Paysafe; Naval Technology Bulgaria; Concentrix; Dance Bulgaria; DXC; Kamenitza; Karate club Nihonto; Yes Rent a Car; Florin Ballet School; Restaurant Tabla; Kramer Confectionery; Rowers Gym; Cafe Bar City; Phone Arena; Tek Experts; Studio Reshovski; MJ Autobox; K-Industria; Art Dance; House Of Steel GYM", stamp)
	vtSeedObservation(c, "bultrako_2025", "multibrand_showroom_m2", 450.0, stamp)
	vtSeedObservation(c, "bultrako_2025", "nearby_service_facility_m2", 920.0, stamp)
	vtSeedObservation(c, "bultrako_2025", "brands", "Honda; Subaru; Moto Morini", stamp)

	// Google currently exposes contradictory index states for the same place:
	// one result says "Permanently closed", while a fresh Maps result exposes
	// the corporate office as Open 24 hours. Keep the inconsistency as evidence.
	vtSeedObservation(c, "google_business", "rating", 3.9, stamp)
	vtSeedObservation(c, "google_business", "reviews", 355.0, stamp)
	vtSeedObservation(c, "google_business", "listing_status_conflict", "Open 24 hours / Permanently closed", stamp)
}

func mergeVarnaTowersSources(c *Client) {
	if c == nil {
		return
	}
	seen := map[string]bool{}
	for _, s := range c.Sources {
		seen[s.Key] = true
	}
	for _, s := range canonicalVarnaTowersSources() {
		if !seen[s.Key] {
			c.Sources = append(c.Sources, s)
			seen[s.Key] = true
		}
	}
}

func ensureVarnaTowersLiveClient() *Client {
	mu.Lock()
	if store.Clients == nil {
		mu.Unlock()
		return nil
	}
	c := store.Clients["varna-towers"]
	if c == nil {
		c = &Client{
			Slug:   "varna-towers",
			Name:   "Varna Towers",
			Sector: "Бизнес център / Class A офиси / смесени търговски площи",
			Note:   "Публичен профил · live monitoring · конкурентна среда",
		}
		store.Clients[c.Slug] = c
	}
	mergeVarnaTowersSources(c)
	mu.Unlock()

	seedVarnaTowersVerifiedFacts(c)
	if dataPath != "" {
		saveStore()
	}
	return c
}

func varnaTowersVerifiedOwnershipSignal() Signal {
	title := "Varna Towers е придобит от двама местни частни инвеститори"
	text := "Mediapool, позовавайки се на пазарния анализ на Cushman & Wakefield Forton, съобщава за значима сделка в началото на 2026 г. за Varna Towers. Материалът посочва 29 000 кв.м отдаваема търговска и 18 500 кв.м офис площ."
	rawURL := "https://www.mediapool.bg/varna-tauars-e-s-nov-sobstvenik-a-na-balgarskiya-pazar-vleze-nov-sporten-brand-news383840.html"
	fp := signalHash("varna-towers", rawURL, title, "2026-05-28")
	return Signal{
		ID: fp[:16], Client: "varna-towers", Brand: "Varna Towers", Source: "Mediapool",
		SourceType: "news", Scope: "external", URL: rawURL, Title: title, Text: text,
		PublishedAt: "2026-05-28T14:30:00+03:00", DetectedAt: nowISO(), Relevance: 100,
		Sentiment: "neutral", Topic: "commercial", RiskScore: 20, Severity: "low", Fingerprint: fp,
	}
}

func vtSignalRows() []Signal {
	signalMu.RLock()
	rows := append([]Signal(nil), signalState.Signals["varna-towers"]...)
	signalMu.RUnlock()
	sort.SliceStable(rows, func(i, j int) bool {
		ai := rows[i].PublishedAt
		if ai == "" {
			ai = rows[i].DetectedAt
		}
		aj := rows[j].PublishedAt
		if aj == "" {
			aj = rows[j].DetectedAt
		}
		return ai > aj
	})
	return rows
}

func vtSignalTime(s Signal) time.Time {
	if t, ok := parseCompetitorPublished(s.PublishedAt); ok {
		return t
	}
	if t, err := time.Parse(time.RFC3339, s.DetectedAt); err == nil {
		return t
	}
	return time.Time{}
}

func vtRecentSignals(scope string, days int) []Signal {
	cut := time.Now().UTC().Add(-time.Duration(days) * 24 * time.Hour)
	out := []Signal{}
	for _, s := range vtSignalRows() {
		if scope != "" && s.Scope != scope {
			continue
		}
		t := vtSignalTime(s)
		if t.IsZero() || t.Before(cut) {
			continue
		}
		out = append(out, s)
	}
	return out
}

func vtCompetitorMentionCount(name string, days int) int {
	name = strings.ToLower(strings.TrimSpace(name))
	n := 0
	for _, s := range vtRecentSignals("competitor", days) {
		if strings.ToLower(strings.TrimSpace(s.Brand)) == name {
			n++
		}
	}
	return n
}

func vtDashboardSignals() []interface{} {
	out := []interface{}{
		map[string]interface{}{
			"level": "watch", "title": "Собствеността е променена през 2026 г.",
			"text": "На 28.05.2026 Mediapool съобщава, че Varna Towers е придобит от двама местни частни инвеститори. Официалният сайт все още съдържа по-стар текст, който посочва Piraeus Bank като собственик.",
			"source": "Mediapool / Varna Towers", "published_at": "2026-05-28T14:30:00+03:00",
			"url": "https://www.mediapool.bg/varna-tauars-e-s-nov-sobstvenik-a-na-balgarskiya-pazar-vleze-nov-sporten-brand-news383840.html",
		},
		map[string]interface{}{
			"level": "watch", "title": "Google Maps показва противоречив статус за обекта",
			"text": "Публични Google резултати за същия адрес показват едновременно „Open 24 hours“ и „Permanently closed“. Това е дигитално/репутационно несъответствие, а не потвърждение, че комплексът е затворен.",
			"source": "Google Maps", "published_at": "2026-09-21T10:00:00+03:00",
			"url": "https://www.google.com/maps/search/?api=1&query=Varna+Towers+Varna",
		},
	}

	for _, s := range vtSignalRows() {
		if s.Scope == "competitor" {
			continue
		}
		level := "info"
		if s.Severity == "critical" || s.Severity == "high" {
			level = "watch"
		} else if s.Sentiment == "positive" {
			level = "positive"
		}
		out = append(out, map[string]interface{}{
			"level": level, "title": s.Title, "text": s.Text, "source": s.Source,
			"url": s.URL, "published_at": s.PublishedAt, "detected_at": s.DetectedAt,
			"scope": s.Scope, "topic": s.Topic,
		})
		if len(out) >= 24 {
			break
		}
	}
	return out
}

func vtCompetitorRow(name string, baseline float64) map[string]interface{} {
	n90 := vtCompetitorMentionCount(name, 90)
	n30 := vtCompetitorMentionCount(name, 30)
	return map[string]interface{}{
		"name": name, "score": baseline, "baseline_as_of": varnaTowersBaselineAsOf,
		"news": float64(n90), "activity": float64(n90), "trend": float64(n30),
		"live_mentions_30d": n30, "live_mentions_90d": n90,
	}
}

func varnaTowersDashboard(c *Client) map[string]interface{} {
	if c == nil {
		return map[string]interface{}{}
	}
	brand90 := 0
	negative90 := 0
	positive90 := 0
	for _, s := range vtRecentSignals("", 90) {
		if s.Scope == "competitor" {
			continue
		}
		brand90++
		if s.Sentiment == "negative" {
			negative90++
		}
		if s.Sentiment == "positive" {
			positive90++
		}
	}
	comp90 := len(vtRecentSignals("competitor", 90))

	return map[string]interface{}{
		"client": c.Slug, "slug": c.Slug, "client_slug": c.Slug,
		"name": c.Name, "sector": c.Sector, "note": c.Note,
		// Keep the accepted onboarding benchmark stable. The live layer below
		// updates mentions, source health, activity, history and competitor news.
		"blis_index": 81.0, "benchmark": 83.0, "relative": 97.6, "confidence": 91.0,
		"trend": 0.0, "data_updated": latestObservedAt(c), "baseline_as_of": varnaTowersBaselineAsOf,
		"nav": []interface{}{
			map[string]interface{}{"key": "overview", "label": "Общ изглед", "icon": "⌂"},
			map[string]interface{}{"key": "social", "label": "Мониторинг", "icon": "◉"},
			map[string]interface{}{"key": "market", "label": "Среда", "icon": "◎"},
			map[string]interface{}{"key": "competition", "label": "Конкуренти", "icon": "◇"},
			map[string]interface{}{"key": "history", "label": "Развитие", "icon": "↗"},
			map[string]interface{}{"key": "reports", "label": "Доклади", "icon": "⇩"},
		},
		"indices": []interface{}{
			idx("presence", "Индекс на присъствието", 84.6, "Базова оценка от публичния onboarding; текущите споменавания и източниковата активност се обновяват отделно в live мониторинга.", []interface{}{comp("Brand mentions · 90 дни", brand90, "live"), comp("Позитивни · 90 дни", positive90, "live"), comp("Негативни · 90 дни", negative90, "live")}, "Приет onboarding benchmark + live evidence", []string{"Varna Towers", "Google News", "публичен web"}),
			idx("reputation", "Индекс на репутацията", 73.1, "Базова репутационна оценка от onboarding; текущият информационен поток и Google listing несъответствието се показват като отделни проверими сигнали.", []interface{}{comp("Google Maps rating", 3.9, "публично"), comp("Google Maps reviews", 355, "публично"), comp("Негативни сигнали · 90 дни", negative90, "live")}, "Измерени публични показатели", []string{"Google Maps", "публични източници"}),
			idx("digital", "Индекс на дигиталната видимост", 83.2, "Базова оценка на официалния сайт и публичните профили; source health се обновява от live engine.", []interface{}{comp("Официален сайт", "наблюдава се", "live"), comp("LinkedIn", "наблюдава се", "live"), comp("Новини и web", brand90, "90 дни")}, "Публични дигитални източници", []string{"varnatowers.bg", "LinkedIn", "Google News"}),
			idx("competitive", "Индекс на конкурентната позиция", 76.2, "Сравнителният benchmark е фиксиран към onboarding датата; текущите конкурентни споменавания и развития се обновяват непрекъснато.", []interface{}{comp("Конкурентни сигнали · 90 дни", comp90, "live"), comp("Сравнявани преки конкуренти", 4, "постоянно наблюдение")}, "Onboarding benchmark + live competitor stream", []string{"Business Park Varna", "Landmark Centre Varna", "Black Sea Capital Center", "Комфорт Бизнес Център"}),
		},
		"metrics": []interface{}{
			met("Основно предназначение", "Главно офис център"),
			met("Gross Build Area", "81 506 m²"),
			met("Total GLA", "47 604 m²"),
			met("Търговска GLA", "29 067 m²"),
			met("Офисна GLA", "18 537 m²"),
			met("Подземни паркоместа · официален сайт", "600"),
			met("Заетост офиси + складове · официален сайт", "70%"),
			met("Заетост търговски площи · официален сайт", "8%"),
			met("Собственост · публично съобщена 28.05.2026", "Двама местни частни инвеститори"),
			met("Google Maps", "3.9 · 355 отзива · противоречив статус"),
			met("Автомобилен tenant mix", "Honda · Subaru · Moto Morini · AutoUnion"),
			met("Корпоративни/технологични наематели", "Paysafe · Naval Technology Bulgaria · Concentrix · DXC · Kamenitza · Tek Experts · K-Industria"),
			met("Услуги и активности", "BYV games · Dance Bulgaria · Karate Nihonto · Yes Rent a Car · Florin Ballet School · Tabla · Kramer · Rowers · House Of Steel · Art Dance"),
			met("Bultrako multi-brand showroom", "450 m² · Honda · Subaru · Moto Morini"),
			met("Адрес", "бул. „Владислав Варненчик“ 256, Варна"),
			met("Контакт", "+359 89 555 8025 · managervt@ipc.bg"),
		},
		"signals": vtDashboardSignals(),
		"competitors": []interface{}{
			vtCompetitorRow("Varna Towers", 76.2),
			vtCompetitorRow("Business Park Varna", 84.0),
			vtCompetitorRow("Landmark Centre Varna", 85.5),
			vtCompetitorRow("Black Sea Capital Center", 82.0),
			vtCompetitorRow("Комфорт Бизнес Център", 80.5),
		},
		"live_summary": map[string]interface{}{
			"brand_mentions_90d": brand90,
			"competitor_mentions_90d": comp90,
			"positive_brand_mentions_90d": positive90,
			"negative_brand_mentions_90d": negative90,
		},
	}
}

func varnaTowersKeywords(c *Client) []map[string]interface{} {
	brand90 := 0
	comp90 := 0
	for _, s := range vtRecentSignals("", 90) {
		if s.Scope == "competitor" {
			comp90++
		} else {
			brand90++
		}
	}
	return []map[string]interface{}{
		{"title": "Смяна на собствеността", "explanation": "Публично съобщена значима сделка за комплекса през 2026 г.", "display": "Двама местни частни инвеститори", "source": "Mediapool / Cushman & Wakefield Forton", "status": "Потвърдено 28.05.2026", "kind": "market", "measured": true},
		{"title": "Споменавания за Varna Towers", "explanation": "Проверими публикации за марката в текущия 90-дневен поток.", "display": fmt.Sprintf("%d публикации", brand90), "source": "BLIS public-source monitoring", "status": "Live", "kind": "media", "value": brand90, "measured": true},
		{"title": "Конкурентни споменавания", "explanation": "Проверими публикации за наблюдаваните конкуренти в 90-дневния поток.", "display": fmt.Sprintf("%d публикации", comp90), "source": "BLIS competitor monitoring", "status": "Live", "kind": "competition", "value": comp90, "measured": true},
		{"title": "Google Maps статус", "explanation": "Публичните Google повърхности показват противоречив статус за един и същ адрес.", "display": "Open 24 hours / Permanently closed", "source": "Google Maps", "status": "Изисква корекция/верификация", "kind": "reputation", "measured": true},
		{"title": "Заетост на офисни + складови площи", "explanation": "Публично посочена заетост на официалната страница на сградата.", "display": "70%", "source": "Varna Towers · официален сайт", "status": "Публична стойност", "kind": "market", "value": 70, "measured": true},
		{"title": "Заетост на търговските площи", "explanation": "Публично посочена заетост на официалната страница на сградата.", "display": "8%", "source": "Varna Towers · официален сайт", "status": "Публична стойност", "kind": "market", "value": 8, "measured": true},
	}
}


func varnaTowersVerifiedCompetitorObservations() []Signal {
	rows := []struct {
		brand  string
		source string
		url    string
		title  string
		text   string
	}{
		{
			brand:  "Business Park Varna",
			source: "LinkedIn · iCard",
			url:    "https://bg.linkedin.com/company/icardofficial",
			title:  "iCard посочва Business Park Varna, Building B1 като основна локация във Варна",
			text:   "Публичният LinkedIn профил на iCard посочва Business Park Varna, Building B1, Varna 9009 като primary location. Това е текущо външно tenant/location споменаване на Business Park Varna.",
		},
		{
			brand:  "Landmark Centre Varna",
			source: "JOBS.BG · Cargill Bulgaria",
			url:    "https://www.jobs.bg/en/company/cargill?job=8370926",
			title:  "Cargill Bulgaria посочва офиса си във Варна в Landmark Centre",
			text:   "Публичният профил на Cargill Bulgaria в JOBS.BG посочва Varna Ocean Transportation office на 24 Slivnitsa Blvd., Landmark Centre, Varna. Страницата съдържа текущи обяви от август 2026.",
		},
		{
			brand:  "Black Sea Capital Center",
			source: "Sutherland Bulgaria",
			url:    "https://www.sutherlandglobal.bg/contact/",
			title:  "Sutherland Bulgaria посочва Black Sea Capital Center като локация на офиса си във Варна",
			text:   "Публичната контактна страница на Sutherland Bulgaria посочва офиса във Варна в Black Sea Capital Center и описва сградата като бизнес център в централния бизнес район.",
		},
		{
			brand:  "Комфорт Бизнес Център",
			source: "Bulgarian Dredging Company",
			url:    "https://www.bdrc.bg/contact",
			title:  "Bulgarian Dredging Company посочва Central Point building като офис локация във Варна",
			text:   "Публичната контактна страница на Bulgarian Dredging Company посочва адрес 54 Osmi Primorski polk Blvd., Central Point building, 6th floor, Varna. Central Point е свързан административен актив в конкурентния клъстер на Комфорт.",
		},
	}
	out := make([]Signal, 0, len(rows))
	for _, row := range rows {
		sentiment, risk := signalSentimentAndRisk(row.title + " " + row.text)
		fp := signalHash("varna-towers|competitor|verified-observed|"+strings.ToLower(row.brand), row.url, row.title, row.text)
		out = append(out, Signal{
			ID:          fp[:16],
			Client:      "varna-towers",
			Brand:       row.brand,
			Source:      row.source,
			SourceType:  "web",
			Scope:       "competitor",
			URL:         row.url,
			Title:       row.title,
			Text:        row.text,
			DetectedAt:  nowISO(),
			Relevance:   100,
			Sentiment:   sentiment,
			Topic:       signalTopic(row.title + " " + row.text),
			RiskScore:   risk,
			Severity:    signalSeverity(risk),
			Fingerprint: fp,
		})
	}
	return out
}

func invalidateVarnaTowersMentionCache() {
	publicMentionCacheMu.Lock()
	delete(publicMentionCache, "varna-towers|brand")
	delete(publicMentionCache, "varna-towers|competitor")
	publicMentionCacheMu.Unlock()
}

func bootstrapVarnaTowersLiveMonitoring() {
	c := ensureVarnaTowersLiveClient()
	if c == nil {
		return
	}
	// Keep the May ownership event in the durable history even after it falls
	// outside the rolling three-month public mention window.
	mergeSignals("varna-towers", append([]Signal{varnaTowersVerifiedOwnershipSignal()}, varnaTowersVerifiedCompetitorObservations()...))
	saveSignalStateFile()
	saveStore()

	// Populate current source observations immediately so the direct profile
	// does not wait for the normal daily universal engine cycle.
	runUniversalClientEngineV34(c, true)

	if continuousMonitoringMu.TryLock() {
		snapshot := signalClientSnapshot("varna-towers")
		if snapshot != nil {
			fresh := collectClientSignals(snapshot)
			for _, target := range competitorSignalTargets(snapshot) {
				fresh = append(fresh, collectCompetitorNews(snapshot, target)...)
				fresh = append(fresh, collectCompetitorWeb(snapshot, target)...)
				fresh = append(fresh, collectCompetitorSocial(snapshot, target)...)
			}
			fresh = dedupeSignals(fresh)
			mergeSignals("varna-towers", fresh)
			saveSignalStateFile()
			saveStore()
		}
		continuousMonitoringMu.Unlock()
	}
	invalidateVarnaTowersMentionCache()
}

func init() {
	go func() {
		// main() initializes the persistent store after package init. Wait for the
		// canonical store path/client map, then register and hydrate Varna Towers.
		for i := 0; i < 30; i++ {
			time.Sleep(1 * time.Second)
			mu.Lock()
			ready := store.Clients != nil && dataPath != ""
			mu.Unlock()
			if ready {
				bootstrapVarnaTowersLiveMonitoring()
				// Runtime persistence restore can land shortly after HTTP readiness.
				// Re-apply the Varna Towers live profile after that window so the
				// verified competitor stream cannot be overwritten by an older snapshot.
				go func() {
					for _, delay := range []time.Duration{8 * time.Second, 25 * time.Second} {
						time.Sleep(delay)
						bootstrapVarnaTowersLiveMonitoring()
					}
				}()
				return
			}
		}
	}()
}

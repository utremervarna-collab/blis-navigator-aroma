package main

import (
	"encoding/xml"
	"net/url"
	"strings"
	"time"
)

const blackSeaCenterSlug = "black-sea-center"

func blackSeaCenterClient() *Client {
	c := &Client{
		Slug:   blackSeaCenterSlug,
		Name:   "Black Sea Center",
		Sector: "Търговски и бизнес комплекс / офис площи",
		Note:   "Реален клиентски профил • публичен мониторинг • 30-дневна начална база от 08.08.2026",
		Sources: []Source{
			{Key: "official_site", Label: "Black Sea Center Offices", URL: "https://bsc-offices.com/", Method: "официален сайт, офис площи, локация, инфраструктура и проектни параметри", Reliability: .99},
			{Key: "official_contact", Label: "Black Sea Center - контакти", URL: "https://bsc-offices.com/contact-us/", Method: "официални контактни и адресни данни", Reliability: .99},
			{Key: "voivoda_group", Label: "Войвода Груп - Black Sea Center", URL: "https://voivodagroup.com/black-sea-center/", Method: "проектно позициониране, ритейл, бизнес и лайфстайл среда", Reliability: .93},
			{Key: "google_news", Label: "Google News - Black Sea Center", URL: "https://news.google.com/", Method: "медийни споменавания и нови публикации", Reliability: .92},
			{Key: "marica", Label: "Марица", URL: "https://www.marica.bg/imoti/black-sea-center-novo-pokolenie-gradsko-prostranstvo-v-centara-na-varna/amp", Method: "медийни публикации за проекта", Reliability: .88},
			{Key: "krib_media", Label: "КРИБ - медиен преглед", URL: "https://krib.bg/", Method: "медиен мониторинг и препубликувани бизнес материали", Reliability: .90},
			{Key: "babyplanet", Label: "BabyPlanet - Black Sea Center", URL: "https://babyplanet.bg/", Method: "публично потвърждение за действащ търговски обект и адрес в комплекса", Reliability: .94},
			{Key: "companybook", Label: "CompanyBook - Black Sea Center BSC", URL: "https://companybook.bg/companies/205829188", Method: "публични фирмени и регистрационни промени", Reliability: .90},
			{Key: "imot_bg", Label: "Imot.bg - локационни споменавания", URL: "https://www.imot.bg/", Method: "пазарни и локационни споменавания в имотни обяви", Reliability: .82},
			{Key: "cmp_varna_towers", Label: "Varna Towers", URL: "https://varnatowers.bg/", Method: "сравнима бизнес и офис локация във Варна", Reliability: .86},
			{Key: "cmp_business_park_varna", Label: "Business Park Varna", URL: "https://businessparkvarna.com/", Method: "сравнима офис и бизнес локация във Варна", Reliability: .86},
			{Key: "cmp_delta_planet_mall", Label: "Delta Planet Mall", URL: "https://deltaplanet.bg/", Method: "сравнима търговска и градска среда във Варна", Reliability: .88},
			{Key: "cmp_grand_mall_varna", Label: "Grand Mall Varna", URL: "https://grandmall-varna.com/", Method: "сравнима търговска и градска среда във Варна", Reliability: .88},
		},
	}
	obs := []Observation{
		{SourceKey: "official_site", MetricKey: "website_active", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "active_offers", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "product_details", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "prime_real_estate_sqm", Value: 65000.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "parking_spaces", Value: 600.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "office_floors_publicly_offered", Value: 2.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "fitness_spa_planned_sqm", Value: 5000.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "child_center_planned_sqm", Value: 2500.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "news_mentions_30d", Value: 2.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "public_mentions_30d", Value: 7.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "babyplanet", MetricKey: "tenant_location_confirmed", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
	}
	c.Observations = obs
	c.Snapshots = []Snapshot{{CreatedAt: "2026-09-07T09:00:00Z", Payload: dashboard(c)}}
	return c
}

func bscStaticSignal(source, sourceType, rawURL, title, text, published, topic string, relevance float64) Signal {
	fingerprint := signalHash(blackSeaCenterSlug, rawURL, title, text)
	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	return Signal{
		ID:          fingerprint[:16],
		Client:      blackSeaCenterSlug,
		Brand:       "Black Sea Center",
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
	}
}

func blackSeaCenterBackfill() []Signal {
	return []Signal{
		bscStaticSignal("КРИБ", "news", "https://krib.bg/%D0%BF%D1%80%D0%B5%D0%B3%D0%BB%D0%B5%D0%B4-%D0%BD%D0%B0-%D0%BC%D0%B5%D0%B4%D0%B8%D0%B8%D1%82%D0%B5-19-8-2026-%D1%81%D1%80%D1%8F%D0%B4%D0%B0/", "Black Sea Center - ново поколение градско пространство в центъра на Варна", "Медийният преглед представя Black Sea Center като мултифункционален комплекс с клас А офис пространства, ритейл, ресторанти, спорт, услуги и зони за свободното време.", "2026-08-19T00:07:00+03:00", "media", 98),
		bscStaticSignal("Марица", "news", "https://www.marica.bg/imoti/black-sea-center-novo-pokolenie-gradsko-prostranstvo-v-centara-na-varna/amp", "Black Sea Center - ново поколение градско пространство в центъра на Варна", "Публикация за офис средата, ритейл микса и пространствата за отдих и развлечения в проекта.", "2026-08-20T09:55:00+03:00", "media", 100),
		bscStaticSignal("CompanyBook", "registry", "https://companybook.bg/companies/205829188", "Промяна по БЛЕК СИЙ ЦЕНТЪР БиЕсСи ЕАД", "Публичният фирмен профил отчита промяна във внесения капитал на 19 август 2026 г.", "2026-08-19T00:00:00+03:00", "corporate", 88),
		bscStaticSignal("BabyPlanet", "web", "https://babyplanet.bg/support/help", "BabyPlanet посочва магазин в Black Sea Center", "Страницата за помощ посочва адрес бул. Владислав Варненчик 186, Black Sea Center, ет. 0. Последна актуализация 31 август 2026 г.", "2026-08-31T00:00:00+03:00", "tenant", 96),
		bscStaticSignal("BabyPlanet", "web", "https://babyplanet.bg/support/shipping", "BabyPlanet потвърждава адрес в Black Sea Center", "Страницата за доставка съдържа публично посочен адрес на физическия обект в Black Sea Center, ет. 0.", "2026-09-05T00:00:00+03:00", "tenant", 94),
		bscStaticSignal("BabyPlanet", "web", "https://babyplanet.bg/support/click-and-collect", "Вземане от магазина в Black Sea Center", "Страницата за Click & Collect посочва магазина на бул. Владислав Варненчик 186, Black Sea Center, ет. 0, Варна.", "2026-09-07T00:00:00+03:00", "tenant", 98),
		bscStaticSignal("Imot.bg", "web", "https://www.imot.bg/obiavi/prodazhbi/grad-varna/troshevo/p-8", "Локационно споменаване: Varna Mall (Black Sea Center)", "Публична имотна обява използва Black Sea Center като разпознаваем ориентир за локация в Трошево. Публикационна дата не е потвърдена, записът е маркиран при откриване.", "", "location", 82),
	}
}

func bscTermHit(text string) bool {
	low := strings.ToLower(text)
	for _, term := range []string{"black sea center", "black sea center offices", "black sea center bsc", "блек сий център", "блек сий център бисиси"} {
		if strings.Contains(low, term) {
			return true
		}
	}
	return false
}

func bscPublishedWithinWindow(raw string, days int) bool {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return true
	}
	for _, layout := range []string{time.RFC1123Z, time.RFC1123, time.RFC3339} {
		if t, err := time.Parse(layout, raw); err == nil {
			return t.After(time.Now().Add(-time.Duration(days) * 24 * time.Hour))
		}
	}
	return true
}

func collectBlackSeaCenterNews(c *Client) []Signal {
	if c == nil || c.Slug != blackSeaCenterSlug {
		return nil
	}
	query := `("Black Sea Center" OR "Black Sea Center Offices" OR "Блек Сий Център" OR "BLACK SEA CENTER BSC") (Варна OR Varna OR офис OR office OR бизнес OR business)`
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(query) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed collectorRSS
	if xml.Unmarshal([]byte(body), &feed) != nil {
		return nil
	}
	out := []Signal{}
	for _, item := range feed.Channel.Items {
		title := cleanPostSnippet(item.Title)
		text := cleanPostSnippet(item.Description)
		if !bscTermHit(title+" "+text) || !bscPublishedWithinWindow(item.PubDate, 35) {
			continue
		}
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		out = append(out, bscStaticSignal(source, "news", item.Link, title, text, item.PubDate, signalTopic(title+" "+text), 100))
		if len(out) >= 40 {
			break
		}
	}
	return out
}

func ensureBlackSeaCenterClient() bool {
	mu.Lock()
	if store.Clients == nil {
		mu.Unlock()
		return false
	}
	if _, ok := store.Clients[blackSeaCenterSlug]; !ok {
		store.Clients[blackSeaCenterSlug] = blackSeaCenterClient()
	}
	c := store.Clients[blackSeaCenterSlug]
	mu.Unlock()
	if c == nil {
		return false
	}
	restoreSignalsFromObservations()
	mergeSignals(blackSeaCenterSlug, blackSeaCenterBackfill())
	fresh := collectClientSignals(c)
	fresh = append(fresh, collectBlackSeaCenterNews(c)...)
	if len(fresh) > 0 {
		mergeSignals(blackSeaCenterSlug, fresh)
	}
	saveSignalStateFile()
	saveStore()
	return true
}

func init() {
	go func() {
		for i := 0; i < 40; i++ {
			time.Sleep(500 * time.Millisecond)
			if ensureBlackSeaCenterClient() {
				break
			}
		}
	}()
	go func() {
		time.Sleep(90 * time.Second)
		for {
			c := signalClientSnapshot(blackSeaCenterSlug)
			if c != nil {
				rows := collectBlackSeaCenterNews(c)
				rows = append(rows, collectClientSignals(c)...)
				if len(rows) > 0 {
					mergeSignals(blackSeaCenterSlug, rows)
					saveSignalStateFile()
					saveStore()
				}
			}
			time.Sleep(5 * time.Minute)
		}
	}()
	go func() {
		time.Sleep(4 * time.Minute)
		for {
			mu.Lock()
			c := store.Clients[blackSeaCenterSlug]
			mu.Unlock()
			if c != nil {
				runClientEngine(c, false)
			}
			time.Sleep(30 * time.Minute)
		}
	}()
}

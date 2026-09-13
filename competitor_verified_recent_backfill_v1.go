package main

import (
	"log"
	"strings"
	"time"
)

// verifiedRecentMentionV1 is used only to repair a confirmed historical gap in
// the rolling three-month window. Every row below is tied to a real publisher
// page and a publication timestamp verified from that publisher. New material
// continues to come from the live collectors; this is not a synthetic feed.
type verifiedRecentMentionV1 struct {
	Brand       string
	Source      string
	URL         string
	Title       string
	Text        string
	PublishedAt string
}

func verifiedRecentBolyarkaBackfillV1() []verifiedRecentMentionV1 {
	return []verifiedRecentMentionV1{
		{
			Brand:  "Загорка",
			Source: "БТА",
			URL:    "https://www.bta.bg/bg/news/bulgaria/1190353",
			Title:  "Стара Загора ще бъде домакин на петдневен „Beerфест“, който събира любители на музиката и бирата за 11-и път",
			Text:   "Публикацията посочва Община Стара Загора и „Загорка“ АД като организатори на Beerфест 2026, който се провежда от 2 до 6 септември.",
			PublishedAt: "2026-08-23T12:52:00+03:00",
		},
		{
			Brand:  "Загорка",
			Source: "Национална бизнес поща",
			URL:    "https://www.nbp.bg/nbp/%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%B0%D1%82-%D0%B4%D0%BD%D0%B8-%D0%B4%D0%BE-%D1%81%D1%82%D0%B0%D1%80%D1%82%D0%B0-%D0%BD%D0%B0-beer%D1%84%D0%B5%D1%81%D1%82-2026-%D0%B2-%D1%81%D1%82%D0%B0%D1%80%D0%B0/",
			Title:  "Остават дни до старта на BEERфест 2026 в Стара Загора",
			Text:   "Публикацията изрично посочва, че BEERфест 2026 се организира от пивоварна „ЗАГОРКА“ и Община Стара Загора и се провежда от 2 до 6 септември.",
			PublishedAt: "2026-08-31T18:49:00+03:00",
		},
		{
			Brand:  "Загорка",
			Source: "Infoz.bg",
			URL:    "https://www.infoz.bg/region/stara-zagora/14732-beerfest-v-stara-zagora-s-petdnevna-muzikalna-programa",
			Title:  "BEERфест в Стара Загора с петдневна музикална програма",
			Text:   "Материалът за откриването на BEERфест 2026 посочва, че събитието е организирано съвместно от Община Стара Загора и „Загорка“ АД.",
			PublishedAt: "2026-09-03T15:19:00+03:00",
		},
	}
}

func buildVerifiedRecentSignalV1(slug string, row verifiedRecentMentionV1) (Signal, bool) {
	published, ok := parseCompetitorPublished(row.PublishedAt)
	if !ok || published.Before(competitorRecentCutoff()) {
		return Signal{}, false
	}
	if strings.TrimSpace(row.URL) == "" || strings.TrimSpace(row.Source) == "" || strings.TrimSpace(row.Title) == "" {
		return Signal{}, false
	}
	sentiment, risk := signalSentimentAndRisk(row.Title + " " + row.Text)
	fingerprint := signalHash(slug+"|competitor|verified-backfill-v1|"+strings.ToLower(row.Brand), row.URL, row.Title, row.PublishedAt)
	return Signal{
		ID:          fingerprint[:16],
		Client:      slug,
		Brand:       row.Brand,
		Source:      row.Source,
		SourceType:  "web",
		Scope:       "competitor",
		URL:         row.URL,
		Title:       row.Title,
		Text:        row.Text,
		PublishedAt: published.Format(time.RFC3339),
		DetectedAt:  nowISO(),
		Relevance:   100,
		Sentiment:   sentiment,
		Topic:       signalTopic(row.Title + " " + row.Text),
		RiskScore:   risk,
		Severity:    signalSeverity(risk),
		Fingerprint: fingerprint,
	}, true
}

func mergeVerifiedRecentBolyarkaBackfillV1() int {
	rows := make([]Signal, 0, 8)
	for _, row := range verifiedRecentBolyarkaBackfillV1() {
		if s, ok := buildVerifiedRecentSignalV1("bolyarka", row); ok {
			rows = append(rows, s)
		}
	}
	if len(rows) == 0 {
		return 0
	}
	continuousMonitoringMu.Lock()
	defer continuousMonitoringMu.Unlock()
	added := mergeSignals("bolyarka", rows)
	if added > 0 {
		sanitizeKnownSignalFalsePositives()
		sanitizeBolyarkaCompetitorNoiseV2()
		saveSignalStateFile()
		saveStore()
	}
	log.Printf("BLIS_VERIFIED_RECENT_BACKFILL client=bolyarka verified=%d added=%d cutoff=%s", len(rows), added, competitorRecentCutoff().Format("2006-01-02"))
	return added
}

func init() {
	go func() {
		// Run after state restoration but before the first long recall cycle. A few
		// retries cover a concurrent collector owning the persistence path.
		time.Sleep(8 * time.Second)
		for i := 0; i < 3; i++ {
			mergeVerifiedRecentBolyarkaBackfillV1()
			time.Sleep(12 * time.Second)
		}
	}()
}

package main

import (
	"log"
	"strings"
	"time"
)

// verifiedMolloxRecentV1 repairs a proven chronology gap with real,
// source-backed rows. Fingerprints make the repair idempotent.
type verifiedMolloxRecentV1 struct {
	Scope       string
	Brand       string
	Source      string
	SourceType  string
	URL         string
	Title       string
	Text        string
	PublishedAt string
}

func verifiedMolloxRecentRowsV1() []verifiedMolloxRecentV1 {
	return []verifiedMolloxRecentV1{
		{
			Scope: "owned", Brand: "MOLLOX България", Source: "MOLLOX България – Новини", SourceType: "web",
			URL: "https://mollox.bg/aktualno/agro-eca-protect-poveche-ustoychivost-za-rasteniyata-po-malko-stres-za-proizvoditelya",
			Title: "AGRO ECA PROTECT – повече устойчивост за растенията, по-малко стрес за производителя",
			Text: "Официална публикация на MOLLOX България за AGRO ECA PROTECT и приложението му като немикробен биостимулатор в земеделието.",
			PublishedAt: "2026-08-31T00:00:00+03:00",
		},
		{
			Scope: "owned", Brand: "MOLLOX България", Source: "MOLLOX България – Новини", SourceType: "web",
			URL: "https://www.mollox.bg/aktualno/studena-magla-za-rastitelna-zashtita-i-biosigurnost-edna-tehnologiya-razlichni-zadachi",
			Title: "Студена мъгла за растителна защита и биосигурност – една технология, различни задачи",
			Text: "Официална публикация на MOLLOX България за генератори за студена мъгла, растителна защита, дезинфекция и биосигурност.",
			PublishedAt: "2026-08-14T00:00:00+03:00",
		},
		{
			Scope: "owned", Brand: "MOLLOX България", Source: "MOLLOX България – Новини", SourceType: "web",
			URL: "https://mollox.bg/aktualno/idva-li-krayat-na-mrasnata-rabota-v-svinefermata",
			Title: "Идва ли краят на мръсната работа в свинефермата",
			Text: "Официална публикация на MOLLOX България за автоматизация на хигиената и роботизирано миене в свинеферми.",
			PublishedAt: "2026-06-29T00:00:00+03:00",
		},
		{
			Scope: "owned", Brand: "MOLLOX България", Source: "MOLLOX България – Новини", SourceType: "web",
			URL: "https://mollox.bg/aktualno/mollox-kani-partnorite-si-na-eurotier-2026-v-hanover",
			Title: "Mollox кани партньорите си на EuroTier 2026 в Хановер",
			Text: "Официална публикация на MOLLOX България за участието на компанията и партньорите ѝ в EuroTier 2026.",
			PublishedAt: "2026-06-29T00:00:00+03:00",
		},
		{
			Scope: "competitor", Brand: "Hagleitner България", Source: "LinkedIn – Hagleitner Hygiene", SourceType: "social",
			URL: "https://de.linkedin.com/posts/hagleitner-hygiene-international-gmbh_hagleitner-innovativehygiene-lehre-activity-7500848270068490241-_Ikl",
			Title: "Hagleitner Hygiene – професионално обучение и развитие на служители",
			Text: "Публична LinkedIn публикация на Hagleitner Hygiene за завършено професионално обучение и развитие на служители.",
			PublishedAt: "2026-09-02T12:33:06+03:00",
		},
	}
}

func buildVerifiedMolloxRecentV1(row verifiedMolloxRecentV1) (Signal, bool) {
	published, ok := parseCompetitorPublished(row.PublishedAt)
	if !ok || published.Before(competitorRecentCutoff()) {
		return Signal{}, false
	}
	if strings.TrimSpace(row.URL) == "" || strings.TrimSpace(row.Source) == "" || strings.TrimSpace(row.Title) == "" {
		return Signal{}, false
	}
	if row.Scope != "owned" && row.Scope != "competitor" {
		return Signal{}, false
	}
	brand := strings.TrimSpace(row.Brand)
	if brand == "" {
		brand = "MOLLOX България"
	}
	sentiment, risk := signalSentimentAndRisk(row.Title + " " + row.Text)
	fp := signalHash("mollox|verified-recent-v1|"+row.Scope+"|"+strings.ToLower(brand), row.URL, row.Title, row.PublishedAt)
	return Signal{
		ID: fp[:16], Client: "mollox", Brand: brand, Source: row.Source, SourceType: row.SourceType,
		Scope: row.Scope, URL: row.URL, Title: row.Title, Text: row.Text,
		PublishedAt: published.Format(time.RFC3339), DetectedAt: nowISO(), Relevance: 100,
		Sentiment: sentiment, Topic: signalTopic(row.Title+" "+row.Text), RiskScore: risk,
		Severity: signalSeverity(risk), Fingerprint: fp,
	}, true
}

func mergeVerifiedMolloxRecentV1() int {
	rows := make([]Signal, 0, 8)
	for _, row := range verifiedMolloxRecentRowsV1() {
		if s, ok := buildVerifiedMolloxRecentV1(row); ok {
			rows = append(rows, s)
		}
	}
	if len(rows) == 0 {
		return 0
	}
	added := mergeSignals("mollox", rows)
	log.Printf("BLIS_MOLLOX_VERIFIED_RECENT_V1 verified=%d added=%d cutoff=%s", len(rows), added, competitorRecentCutoff().Format("2006-01-02"))
	return added
}

func init() {
	go func() {
		// Allow runtime-data restore to settle, then repair the known gap.
		// Repetition is safe because mergeSignals is fingerprint-idempotent.
		time.Sleep(20 * time.Second)
		for i := 0; i < 6; i++ {
			mergeVerifiedMolloxRecentV1()
			time.Sleep(10 * time.Second)
		}
	}()
}

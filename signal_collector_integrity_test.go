package main

import (
    "strings"
    "testing"
)

func TestKUBSignalContextValid(t *testing.T) {
    cases := []struct {
        name string
        text string
        want bool
    }{
        {"project", "Новини за Forest Club в Баба Алино", true},
        {"corporation", "Корпорация КУБ публикува позиция", true},
        {"person", "Олег Невзоров коментира случая", true},
        {"company with context", "КУБ е инвеститор в жилищен комплекс", true},
        {"cubic metres", "Над 5 милиона куб. метра вода", false},
        {"cubic word", "Кубически метри в строителния сектор", false},
        {"ambiguous short name", "КУБ обяви новина", false},
        {"unrelated gallery Kub BTA 25 Oct", "Галерия „Куб“ в „Топлоцентрала“ обяви конкурс за изложбен проект, който ще бъде реализиран през 2027 г.", false},
        {"unrelated", "Друг строителен инвеститор във Варна", false},
    }
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got := kubSignalContextValid(strings.ToLower(tc.text))
            if got != tc.want {
                t.Errorf("kubSignalContextValid(%q) = %v, want %v", tc.text, got, tc.want)
            }
        })
    }
}

func TestSignalObservationExistsAcrossFullHistory(t *testing.T) {
    c := &Client{Observations: make([]Observation, 2101)}
    c.Observations[0] = Observation{SourceKey: "signal_collector", MetricKey: "signal_event_original"}
    if !signalObservationExists(c, "signal_event_original") {
        t.Fatal("historical signal older than 2000 observations was not found")
    }
    if signalObservationExists(c, "signal_event_other") {
        t.Fatal("unexpected duplicate detected")
    }
}

func TestAstorGardenIncludedInCollector(t *testing.T) {
    for _, slug := range signalEligibleSlugs() {
        if slug == "astor-garden" {
            return
        }
    }
    t.Fatal("astor-garden missing from collector")
}


func TestPublicKUBChronologyIdentityFilter(t *testing.T) {
    base := Signal{Client: "kub", Source: "Публична медия", URL: "https://example.org/story", PublishedAt: "2026-10-22T15:00:00Z"}
    bad := base
    bad.Title = "Над 5 милиона куб. метра вода"
    if publicKUBChronologySignalValid(bad) {
        t.Fatal("cubic-unit historical item leaked into KUB chronology")
    }
    gallery := base
    gallery.Title = "Галерия „Куб“ в „Топлоцентрала“ обяви конкурс за изложбен проект, който ще бъде реализиран през 2027 г."
    if publicKUBChronologySignalValid(gallery) {
        t.Fatal("unrelated Sofia art-gallery article leaked into KUB chronology")
    }
    good := base
    good.Title = "Съдът разглежда ново дело за Баба Алино"
    if !publicKUBChronologySignalValid(good) {
        t.Fatal("relevant Baba Alino judicial development was filtered")
    }
}


func TestKUBCrisisCollectorRejectsCubicUnits(t *testing.T) {
    client := &Client{Slug: "kub", Name: "Корпорация КУБ"}
    _, ok := kubCrisisSignalV2(client, "Новини", "https://example.org/water", "Над 5 милиона куб. метра вода", "", "Thu, 22 Oct 2026 16:39:35 GMT")
    if ok {
        t.Fatal("crisis collector accepted an unrelated cubic-metre article")
    }
    signal, ok := kubCrisisSignalV2(client, "Новини", "https://example.org/court", "Ново дело за Forest Club в Баба Алино", "", "Thu, 22 Oct 2026 16:39:35 GMT")
    if !ok || signal.Client != "kub" {
        t.Fatal("crisis collector rejected a relevant Forest Club judicial mention")
    }
}

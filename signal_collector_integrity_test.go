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

package main

import "testing"

func TestArielFishUnmeasuredScoresRemainNull(t *testing.T) {
    c := &Client{Slug: "ariel-fish", Name: "Ариел Фиш"}
    dashboard := arielFishDashboard(c)
    competitors, ok := dashboard["competitors"].([]interface{})
    if !ok || len(competitors) != 5 {
        t.Fatalf("expected five comparison rows, got %#v", dashboard["competitors"])
    }
    for _, row := range competitors {
        score := row.(map[string]interface{})["score"]
        if score != nil {
            t.Fatalf("unmeasured competitor score must be null, got %#v", score)
        }
    }
    if got := dashboard["indices"].([]interface{}); len(got) != 0 {
        t.Fatalf("unmeasured indicators must be absent, got %#v", got)
    }
}

func TestArielFishObservedZeroDistinctFromMissing(t *testing.T) {
    c := &Client{Slug: "ariel-fish", Name: "Ариел Фиш",
        Observations: []Observation{
            {SourceKey: "official_site", MetricKey: "score", Value: float64(0), ObservedAt: "2026-10-25T09:00:00Z"},
            {SourceKey: "cmp_michik", MetricKey: "score", Value: float64(65), ObservedAt: "2026-10-25T09:00:00Z"},
        },
    }
    dashboard := arielFishDashboard(c)
    rows := dashboard["competitors"].([]interface{})
    if got := rows[0].(map[string]interface{})["score"]; got != float64(0) {
        t.Fatalf("observed zero must remain zero, got %#v", got)
    }
    if got := rows[1].(map[string]interface{})["score"]; got != float64(65) {
        t.Fatalf("observed score must be retained, got %#v", got)
    }
    if got := rows[2].(map[string]interface{})["score"]; got != nil {
        t.Fatalf("missing competitor score must remain null, got %#v", got)
    }
    indices := dashboard["indices"].([]interface{})
    if len(indices) != 1 {
        t.Fatalf("expected only observed competitive indicator, got %d", len(indices))
    }
}

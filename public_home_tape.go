package main

import (
	"math"
	"net/http"
	"strings"
)

type publicHomeTapeItem struct {
	Client   string  `json:"client"`
	Name     string  `json:"name"`
	Metric   string  `json:"metric"`
	Label    string  `json:"label"`
	Value    float64 `json:"value"`
	Delta    float64 `json:"delta"`
	HasDelta bool    `json:"has_delta"`
	Measured string  `json:"measured_at,omitempty"`
}

func homeTapeMetricValue(payload map[string]interface{}, key string) (float64, bool) {
	if payload == nil {
		return 0, false
	}
	if key == "blis" {
		raw, ok := payload["blis_index"]
		if !ok || raw == nil {
			return 0, false
		}
		return f(raw), true
	}
	raw, ok := payload["indices"]
	if !ok {
		return 0, false
	}
	rows, ok := raw.([]interface{})
	if !ok {
		return 0, false
	}
	for _, rawRow := range rows {
		row, ok := rawRow.(map[string]interface{})
		if !ok || !strings.EqualFold(strings.TrimSpace(stringValue(row["key"])), key) {
			continue
		}
		value, exists := row["value"]
		if !exists || value == nil {
			return 0, false
		}
		return f(value), true
	}
	return 0, false
}

func stringValue(v interface{}) string {
	s, _ := v.(string)
	return s
}

func publicHomeTape(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	clientOrder := []struct {
		slug  string
		label string
	}{
		{"aroma", "AROMA"},
		{"bolyarka", "БОЛЯРКА"},
		{"astor-garden", "ASTOR GARDEN"},
		{"varna-towers", "VARNA TOWERS"},
	}
	metricOrder := []struct {
		key   string
		label string
	}{
		{"blis", "BLIS"},
		{"digital", "DIGITAL"},
		{"reputation", "REPUTATION"},
		{"competitive", "COMPETITIVE"},
	}

	items := make([]publicHomeTapeItem, 0, len(clientOrder)*len(metricOrder))
	mu.Lock()
	for _, metric := range metricOrder {
		for _, spec := range clientOrder {
			c := store.Clients[spec.slug]
			if c == nil || len(c.Snapshots) == 0 {
				continue
			}
			currentIndex := -1
			var current float64
			for i := len(c.Snapshots) - 1; i >= 0; i-- {
				if v, ok := homeTapeMetricValue(c.Snapshots[i].Payload, metric.key); ok {
					currentIndex = i
					current = v
					break
				}
			}
			if currentIndex < 0 {
				continue
			}
			delta := 0.0
			hasEarlier := false
			foundChange := false
			for i := currentIndex - 1; i >= 0; i-- {
				previous, ok := homeTapeMetricValue(c.Snapshots[i].Payload, metric.key)
				if !ok {
					continue
				}
				hasEarlier = true
				if math.Abs(current-previous) >= 0.05 {
					delta = current - previous
					foundChange = true
					break
				}
			}
			item := publicHomeTapeItem{
				Client: spec.slug,
				Name: spec.label,
				Metric: metric.key,
				Label: metric.label,
				Value: current,
				Delta: delta,
				HasDelta: foundChange || hasEarlier,
				Measured: c.Snapshots[currentIndex].CreatedAt,
			}
			items = append(items, item)
		}
	}
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=30, stale-while-revalidate=120")
	jsonOut(w, map[string]interface{}{"ok": true, "items": items})
}

func init() {
	http.HandleFunc("/api/public/home-tape", publicHomeTape)
}

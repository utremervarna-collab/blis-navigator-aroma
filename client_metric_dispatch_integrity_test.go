package main

import "testing"

// Signal-only and synthetic clients must not inherit Aroma metrics or snapshots.
func TestUnsupportedClientsNeverUseAromaMetricEngine(t *testing.T) {
	for _, slug := range []string{"kub", "icard", "top-rent-a-car", "wirello", "unconfigured-client"} {
		t.Run(slug, func(t *testing.T) {
			c := &Client{Slug: slug}
			status := runClientEngine(c, true)
			if status.Failed != 1 || status.Successful != 0 {
				t.Fatalf("unsupported client %q unexpectedly ran a metric engine: %+v", slug, status)
			}
			if len(c.Observations) != 0 || len(c.Snapshots) != 0 {
				t.Fatalf("unsupported client %q acquired cross-client metric data", slug)
			}
			if liveMetricClient(slug) {
				t.Fatalf("unsupported client %q is allowed into scheduled metric refresh", slug)
			}
		})
	}
}

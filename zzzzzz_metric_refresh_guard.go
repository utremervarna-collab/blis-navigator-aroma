package main

import (
	"io"
	"net/http"
	"strings"
)

// metricRefreshGuardTransport blocks external manual refresh requests for
// client profiles that do not have a dedicated metric engine. This keeps
// legacy runClientEngine default routing from ever treating an unsupported
// client as Aroma while preserving the supported engines unchanged.
type metricRefreshGuardTransport struct {
	base http.RoundTripper
}

func supportsDedicatedMetricEngine(slug string) bool {
	switch strings.TrimSpace(strings.ToLower(slug)) {
	case "aroma", "bolyarka", "astor-garden", "mollox", "everbet":
		return true
	default:
		return false
	}
}

func (t metricRefreshGuardTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	if req != nil && req.Method == http.MethodPost {
		path := strings.Trim(req.URL.Path, "/")
		parts := strings.Split(path, "/")
		if len(parts) == 4 && parts[0] == "api" && parts[1] == "clients" && parts[3] == "refresh" {
			if !supportsDedicatedMetricEngine(parts[2]) {
				body := `{"ok":false,"error":"metric engine unavailable for this client"}`
				return &http.Response{
					StatusCode: http.StatusConflict,
					Status:     "409 Conflict",
					Header: http.Header{
						"Content-Type":  []string{"application/json; charset=utf-8"},
						"Cache-Control": []string{"no-store"},
					},
					Body:    io.NopCloser(strings.NewReader(body)),
					Request: req,
				}, nil
			}
		}
	}
	return t.base.RoundTrip(req)
}

func init() {
	if authProxy == nil {
		return
	}
	base := authProxy.Transport
	if base == nil {
		base = http.DefaultTransport
	}
	authProxy.Transport = metricRefreshGuardTransport{base: base}
}

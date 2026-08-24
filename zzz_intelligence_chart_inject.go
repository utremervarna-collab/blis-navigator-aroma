package main

import (
	"bytes"
	"io"
	"net/http"
)

func init() {
	if authProxy == nil {
		return
	}
	previous := authProxy.ModifyResponse
	authProxy.ModifyResponse = func(resp *http.Response) error {
		if previous != nil {
			if err := previous(resp); err != nil {
				return err
			}
		}
		return injectIntelligenceCharts(resp)
	}
}

func injectIntelligenceCharts(resp *http.Response) error {
	if resp == nil || resp.Request == nil {
		return nil
	}
	path := resp.Request.URL.Path
	if path != "/intelligence-retail-bulgaria-2026.html" && path != "/intelligence-reputation-trust.html" && path != "/intelligence-ai-search.html" {
		return nil
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	_ = resp.Body.Close()
	marker := []byte("</body>")
	if i := bytes.LastIndex(body, marker); i >= 0 {
		script := []byte(`<script src="/intelligence-charts-v2.js?v=20260824-chart2"></script>`)
		out := make([]byte, 0, len(body)+len(script))
		out = append(out, body[:i]...)
		out = append(out, script...)
		out = append(out, body[i:]...)
		body = out
	}
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Del("Content-Length")
	resp.Header.Set("Cache-Control", "no-store, max-age=0")
	return nil
}

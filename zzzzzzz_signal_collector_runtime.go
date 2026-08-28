package main

import (
	"bytes"
	"embed"
	"io"
	"net/http"
	"strconv"
)

//go:embed static/navigator-signal-collector-v1.js static/navigator-intelligence-stream-v2.js
var signalCollectorAssets embed.FS

func serveSignalCollectorJS() {
	http.HandleFunc("/navigator-signal-collector-v1.js", func(w http.ResponseWriter, r *http.Request) {
		b, err := signalCollectorAssets.ReadFile("static/navigator-signal-collector-v1.js")
		if err != nil {
			http.Error(w, "asset not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		_, _ = w.Write(b)
	})
	http.HandleFunc("/navigator-intelligence-stream-v2.js", func(w http.ResponseWriter, r *http.Request) {
		b, err := signalCollectorAssets.ReadFile("static/navigator-intelligence-stream-v2.js")
		if err != nil {
			http.Error(w, "asset not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		_, _ = w.Write(b)
	})
}

func injectSignalCollector(body []byte) []byte {
	if bytes.Contains(body, []byte("navigator-intelligence-stream-v2.js")) {
		return body
	}
	// v2 supersedes the small Signals-only panel and distributes the same real
	// evidence across Monitoring, Signals, Reputation, Digital, Market,
	// Competition, Overview and History.
	tag := []byte(`<script src="/navigator-intelligence-stream-v2.js?v=20260828-intelligence2"></script>`)
	if bytes.Contains(body, []byte("</body>")) {
		return bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
	}
	return append(body, tag...)
}

func init() {
	serveSignalCollectorJS()
	if authProxy == nil {
		return
	}
	previous := authProxy.ModifyResponse
	authProxy.ModifyResponse = func(resp *http.Response) error {
		if previous != nil {
			if err := previous(resp); err != nil {
				return err
			}
		if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
			return nil
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()
		body = injectSignalCollector(body)
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		return nil
	}
}

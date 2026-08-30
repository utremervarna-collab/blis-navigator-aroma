package main

import (
	"bytes"
	"embed"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

//go:embed static/navigator-mollox-signals-truth-v1.js
var molloxSignalTruthAssets embed.FS

// sanitizeMolloxActiveSignals keeps source/profile evidence out of the active
// signal stream. Owned static web pages remain represented by Sources,
// Observations and profile metrics; they are not events and must not appear as
// current Important Signals.
func sanitizeMolloxActiveSignals() bool {
	signalMu.Lock()
	defer signalMu.Unlock()
	rows := signalState.Signals["mollox"]
	if len(rows) == 0 {
		return false
	}
	clean := make([]Signal, 0, len(rows))
	changed := false
	for _, s := range rows {
		title := strings.ToLower(strings.TrimSpace(s.Title))
		legacyBaseline := title == "пълна техническа документация" ||
			title == "private label е публично потвърдена услуга" ||
			title == "регионална дистрибуция"
		ownedStaticWeb := strings.EqualFold(strings.TrimSpace(s.Scope), "owned") &&
			strings.EqualFold(strings.TrimSpace(s.SourceType), "web")
		if legacyBaseline || ownedStaticWeb {
			changed = true
			continue
		}
		clean = append(clean, s)
	}
	if changed {
		signalState.Signals["mollox"] = clean
	}
	return changed
}

func serveMolloxSignalTruthJS() {
	http.HandleFunc("/navigator-mollox-signals-truth-v1.js", func(w http.ResponseWriter, r *http.Request) {
		b, err := molloxSignalTruthAssets.ReadFile("static/navigator-mollox-signals-truth-v1.js")
		if err != nil {
			http.Error(w, "asset not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		_, _ = w.Write(b)
	})
}

func injectMolloxSignalTruth(body []byte) []byte {
	if bytes.Contains(body, []byte("navigator-mollox-signals-truth-v1.js")) {
		return body
	}
	tag := []byte(`<script src="/navigator-mollox-signals-truth-v1.js?v=20260830-mollox-signals-truth1"></script>`)
	if bytes.Contains(body, []byte("</body>")) {
		return bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
	}
	return append(body, tag...)
}

func init() {
	serveMolloxSignalTruthJS()
	if authProxy != nil {
		previous := authProxy.ModifyResponse
		authProxy.ModifyResponse = func(resp *http.Response) error {
			if previous != nil {
				if err := previous(resp); err != nil {
					return err
				}
			}
			if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
				return nil
			}
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return err
			}
			_ = resp.Body.Close()
			body = injectMolloxSignalTruth(body)
			resp.Body = io.NopCloser(bytes.NewReader(body))
			resp.ContentLength = int64(len(body))
			resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
			resp.Header.Del("Content-Encoding")
			resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
			return nil
		}
	}

	go func() {
		time.Sleep(3 * time.Second)
		if sanitizeMolloxActiveSignals() {
			saveSignalStateFile()
		}
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			if sanitizeMolloxActiveSignals() {
				saveSignalStateFile()
			}
		}
	}()
}

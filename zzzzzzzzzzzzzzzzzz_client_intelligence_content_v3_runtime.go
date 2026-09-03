package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

var legacyMonitoringScripts = regexp.MustCompile(`(?is)<script[^>]+src=["']/navigator-monitoring-(?:intelligence-v2|polish-v3|profile-v4)\.js[^"']*["'][^>]*></script>`)

// Load the decision-intelligence content owner after the existing dashboard
// renderers. It does not change KUB's dedicated crisis interface.
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
		if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
			return nil
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()

		// Strip the superseded Monitoring overlays. Monitoring is now owned by one
		// canonical renderer mounted into the current visible Monitoring owner.
		body = legacyMonitoringScripts.ReplaceAll(body, nil)

		const v3 = `<script defer src="/navigator-client-intelligence-content-v3.js?v=20260903-decision3"></script>`
		const stability = `<script defer src="/navigator-client-intelligence-content-v3-stability.js?v=20260903-dedupe3"></script>`
		const competitionNews = `<script defer src="/navigator-competition-news-v1.js?v=20260903-compnews3"></script>`
		const dossierData = `<script defer src="/navigator-competitor-dossiers-data-v2.js?v=20260903-dossierdata2"></script>`
		const dossierTune = `<script defer src="/navigator-competitor-dossiers-tune-v1.js?v=20260903-tune1"></script>`
		const dossierV2 = `<script defer src="/navigator-3-competitor-dossier-v2.js?v=20260903-dossierui2"></script>`
		const editorial = `<script defer src="/navigator-editorial-cleanup-v1.js?v=20260903-editorial1"></script>`
		const monitoringCanonical = `<script defer src="/navigator-monitoring-canonical-v5.js?v=20260903-monitor5b"></script>`

		if !bytes.Contains(body, []byte("navigator-client-intelligence-content-v3.js")) {
			body = injectBeforeBodyClose(body, v3)
		}
		if !bytes.Contains(body, []byte("navigator-client-intelligence-content-v3-stability.js")) {
			body = injectBeforeBodyClose(body, stability)
		}
		if !bytes.Contains(body, []byte("navigator-competition-news-v1.js")) {
			body = injectBeforeBodyClose(body, competitionNews)
		}
		if !bytes.Contains(body, []byte("navigator-competitor-dossiers-data-v2.js")) {
			body = injectBeforeBodyClose(body, dossierData)
		}
		if !bytes.Contains(body, []byte("navigator-competitor-dossiers-tune-v1.js")) {
			body = injectBeforeBodyClose(body, dossierTune)
		}
		if !bytes.Contains(body, []byte("navigator-3-competitor-dossier-v2.js")) {
			body = injectBeforeBodyClose(body, dossierV2)
		}
		if !bytes.Contains(body, []byte("navigator-editorial-cleanup-v1.js")) {
			body = injectBeforeBodyClose(body, editorial)
		}
		if !bytes.Contains(body, []byte("navigator-monitoring-canonical-v5.js")) {
			body = injectBeforeBodyClose(body, monitoringCanonical)
		}

		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		return nil
	}
}

func injectBeforeBodyClose(body []byte, tag string) []byte {
	if bytes.Contains(body, []byte("</body>")) {
		return bytes.Replace(body, []byte("</body>"), []byte(tag+"</body>"), 1)
	}
	return append(body, []byte(tag)...)
}

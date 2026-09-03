package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

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
		const v3 = `<script defer src="/navigator-client-intelligence-content-v3.js?v=20260903-decision2"></script>`
		const stability = `<script defer src="/navigator-client-intelligence-content-v3-stability.js?v=20260903-dedupe2"></script>`
		const competitionNews = `<script defer src="/navigator-competition-news-v1.js?v=20260903-compnews2"></script>`
		const dossierData = `<script defer src="/navigator-competitor-dossiers-data-v2.js?v=20260903-dossierdata1"></script>`
		const dossierV2 = `<script defer src="/navigator-3-competitor-dossier-v2.js?v=20260903-dossierui1"></script>`
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
		if !bytes.Contains(body, []byte("navigator-3-competitor-dossier-v2.js")) {
			body = injectBeforeBodyClose(body, dossierV2)
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

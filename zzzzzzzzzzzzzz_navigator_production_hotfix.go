package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

var legacyVarnaTowersUIScripts = regexp.MustCompile(`<script[^>]+src="/varna-towers-(?:ui|reference)\.js[^\"]*"[^>]*></script>`)

// This late init wraps the existing response modifier. It keeps the production
// Navigator on one canonical UI path and routes the public client CTA directly
// to the dashboard without a login screen.
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
		return applyNavigatorProductionHotfixes(resp)
	}
}

func applyNavigatorProductionHotfixes(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Body == nil {
		return nil
	}

	path := resp.Request.URL.Path
	if path != "/dashboard.html" && path != "/" && path != "/index.html" {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	_ = resp.Body.Close()

	if path == "/dashboard.html" {
		body = legacyVarnaTowersUIScripts.ReplaceAll(body, nil)

		marker := []byte("navigator-production-entry-v1.js")
		if !bytes.Contains(body, marker) {
			tag := []byte(`<script src="/navigator-production-entry-v1.js?v=20260829-production-entry-4"></script>`)
			body = bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
		}
	} else {
		// Every existing public client-entry link now opens the canonical dashboard.
		body = bytes.ReplaceAll(body, []byte(`href="/client-access.html?v=20260829-neutral2"`), []byte(`href="/dashboard.html?client=aroma&page=overview"`))
		body = bytes.ReplaceAll(body, []byte(`href="/client-login?generic=1"`), []byte(`href="/dashboard.html?client=aroma&page=overview"`))
		body = bytes.ReplaceAll(body, []byte(`href="/dashboard.html"`), []byte(`href="/dashboard.html?client=aroma&page=overview"`))
	}

	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	return nil
}

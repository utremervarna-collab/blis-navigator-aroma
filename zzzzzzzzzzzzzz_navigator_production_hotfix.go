package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

var legacyVarnaTowersUIScripts = regexp.MustCompile(`<script[^>]+src="/varna-towers-(?:ui|reference)\.js[^\"]*"[^>]*></script>`)
var legacyNavigatorUIScripts = regexp.MustCompile(`<script[^>]+src="/(?:navigator-reference|navigator-social-master|navigator-overview-master|navigator-live-master|navigator-geo-v2|navigator-digital-master|navigator-digital-bootstrap|navigator-client-ui|navigator-client-hero|varna-towers-hero-guard|navigator-reputation-exact-art-v41|navigator-production-cleanup-v1|navigator-perception-core-v8|navigator-perception-map)\.js[^\"]*"[^>]*></script>`)
var navigatorProductionEntrypoint = regexp.MustCompile(`<script[^>]+src="/navigator-production-entry-v1\.js(?:\?v=[^\"]*)?"[^>]*></script>`)

func init() {
	if authProxy == nil { return }
	previous := authProxy.ModifyResponse
	authProxy.ModifyResponse = func(resp *http.Response) error {
		if previous != nil { if err := previous(resp); err != nil { return err } }
		return applyNavigatorProductionHotfixes(resp)
	}
}

func applyNavigatorProductionHotfixes(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Body == nil { return nil }
	path := resp.Request.URL.Path
	if path != "/dashboard.html" && path != "/" && path != "/index.html" { return nil }
	body, err := io.ReadAll(resp.Body)
	if err != nil { return err }
	_ = resp.Body.Close()
	if path == "/dashboard.html" {
		/* Keep app.js and data/runtime infrastructure, but remove the old UI owners.
		   Perception map is also removed here and reloaded explicitly by the canonical entrypoint. */
		body = legacyVarnaTowersUIScripts.ReplaceAll(body, nil)
		body = legacyNavigatorUIScripts.ReplaceAll(body, nil)
		tag := []byte(`<script src="/navigator-production-entry-v1.js?v=20260829-canonical-ui-2-map"></script>`)
		if navigatorProductionEntrypoint.Match(body) {
			body = navigatorProductionEntrypoint.ReplaceAll(body, tag)
		} else {
			body = bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
		}
		resp.Header.Set("X-BLIS-Navigator-Build", "20260829-canonical-ui-2-map")
	} else {
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

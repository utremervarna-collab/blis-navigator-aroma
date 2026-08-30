package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

var legacyVarnaTowersUIScripts = regexp.MustCompile(`<script[^>]+src="/varna-towers-(?:ui|reference)\.js[^\"]*"[^>]*></script>`)
var legacyNavigatorUIScripts = regexp.MustCompile(`<script[^>]+src="/(?:app|navigator-reference|navigator-social-master|navigator-overview-master|navigator-overview-system-v6|navigator-signals-system-v3|navigator-live-master|navigator-geo-v2|navigator-digital-master|navigator-digital-bootstrap|navigator-client-ui|navigator-client-header-v1|navigator-client-hero|varna-towers-hero-guard|navigator-reputation-exact-art-v41|navigator-reputation-master-v47|navigator-production-cleanup-v1|navigator-perception-core-v8|navigator-perception-map|navigator-system-dynamics-v1|navigator-competition-master-v5|navigator-competition-ladder-v1|navigator-competition-layout-fix-v1|navigator-executive-ui-v1|navigator-executive-ui-v2|navigator-executive-ui-v3|navigator-executive-reports-v1|navigator-color-system-v1|navigator-visual-focus-v1|navigator-visual-interaction-v1|navigator-visual-suite-v1|navigator-visual-suite-motion-v1|navigator-visual-special-v2|navigator-overview-client-home-v1|navigator-overview-marker-fix-v1|navigator-language-cleanup-v1|navigator-history-fix|navigator-temporal-ui|navigator-commerce-visual-cards-v7|navigator-commerce-exact-cards-v8)\.js[^\"]*"[^>]*></script>`)
var legacyNavigatorUIStyles = regexp.MustCompile(`<link[^>]+href="/(?:navigator-reference|navigator-overview-master|navigator-live-master|navigator-geo-v2|navigator-digital-master|navigator-shell-master|navigator-client-ui|navigator-social-master|navigator-reputation-exact-art-v41|navigator-perception-map|navigator-production-cleanup-v1|navigator-overview-clarity|navigator-trend-fix|navigator-visual-special-v2)\.css[^\"]*"[^>]*>`)
var legacyCompetitionPaintGuard = regexp.MustCompile(`(?s)<style[^>]+id="blisCompetitionPaintGuard"[^>]*>.*?</style>`)
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
		body = legacyVarnaTowersUIScripts.ReplaceAll(body, nil)
		body = legacyNavigatorUIScripts.ReplaceAll(body, nil)
		body = legacyNavigatorUIStyles.ReplaceAll(body, nil)
		body = legacyCompetitionPaintGuard.ReplaceAll(body, nil)
		tag := []byte(`<script src="/navigator-production-entry-v1.js?v=20260830-client-header-real-logos-1"></script>`)
		if navigatorProductionEntrypoint.Match(body) {
			body = navigatorProductionEntrypoint.ReplaceAll(body, tag)
		} else {
			body = bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
		}
		resp.Header.Set("X-BLIS-Navigator-Build", "20260830-client-header-real-logos-1")
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

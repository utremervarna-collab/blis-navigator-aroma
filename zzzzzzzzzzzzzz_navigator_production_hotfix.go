package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

var legacyVarnaTowersUIScripts = regexp.MustCompile(`<script[^>]+src="/varna-towers-(?:ui|reference)\.js[^\"]*"[^>]*></script>`)
var legacyNavigatorUIScripts = regexp.MustCompile(`<script[^>]+src="/(?:app|navigator-reference|navigator-social-master|navigator-overview-master|navigator-overview-system-v6|navigator-signals-system-v3|navigator-live-master|navigator-geo-v2|navigator-digital-master|navigator-digital-bootstrap|navigator-client-ui|navigator-client-header-v1|navigator-client-branding-v3|navigator-client-hero|varna-towers-hero-guard|navigator-reputation-exact-art-v41|navigator-reputation-master|navigator-reputation-master-v47|navigator-reputation-totem-3d-v39|navigator-production-cleanup-v1|navigator-perception-core-v8|navigator-perception-map|navigator-system-dynamics-v1|navigator-architecture-v15|navigator-data-core-v2|navigator-module-lock-v1|navigator-client-value-pages-v1|navigator-competition-master-v5|navigator-competition-intelligence-v9|navigator-competition-environment-v10|navigator-competition-page-v11|navigator-competition-page-v12|navigator-competition-ladder-v1|navigator-competition-layout-fix-v1|navigator-executive-ui-v1|navigator-executive-ui-v2|navigator-executive-ui-v3|navigator-executive-reports-v1|navigator-color-system-v1|navigator-visual-focus-v1|navigator-visual-interaction-v1|navigator-visual-suite-v1|navigator-visual-suite-motion-v1|navigator-visual-special-v2|navigator-overview-client-home-v1|navigator-overview-marker-fix-v1|navigator-language-cleanup-v1|navigator-history-fix|navigator-temporal-ui|navigator-commerce-visual-cards-v7|navigator-commerce-exact-cards-v8)\.js[^\"]*"[^>]*></script>`)
var legacyNavigatorUIStyles = regexp.MustCompile(`<link[^>]+href="/(?:navigator-reference|navigator-overview-master|navigator-live-master|navigator-geo-v2|navigator-digital-master|navigator-shell-master|navigator-client-ui|navigator-social-master|navigator-reputation-exact-art-v41|navigator-reputation-master|navigator-reputation-totem-3d-v40|navigator-client-value-pages-v1|navigator-perception-map|navigator-production-cleanup-v1|navigator-overview-clarity|navigator-trend-fix|navigator-visual-special-v2)\.css[^\"]*"[^>]*>`)
var legacyCompetitionPaintGuard = regexp.MustCompile(`(?s)<style[^>]+id="blisCompetitionPaintGuard"[^>]*>.*?</style>`)
var navigatorProductionEntrypoint = regexp.MustCompile(`<script[^>]+src="/navigator-production-entry-v1\.js(?:\?v=[^\"]*)?"[^>]*></script>`)

const navigatorStartupGuard = `<style id="blisNavigatorStartupGuard">
html,body{background:#f4f7fb!important}
body:not(.blis-app-ready){overflow:hidden!important}
body:not(.blis-app-ready) .app{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
body.blis-app-ready .app{visibility:visible!important;opacity:1!important;pointer-events:auto!important}
#blisNavigatorBootScreen{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:linear-gradient(135deg,#f8fafc 0%,#eef4f8 58%,#f7f4ed 100%);opacity:1;visibility:visible;transition:opacity .16s ease,visibility .16s ease}
#blisNavigatorBootScreen .blisBootMark{display:flex;flex-direction:column;align-items:center;gap:10px;color:#132c49;font:800 22px/1.1 Inter,Segoe UI,Arial,sans-serif;letter-spacing:-.02em}
#blisNavigatorBootScreen .blisBootMark:before{content:"";width:38px;height:38px;border-radius:50%;border:2px solid #d4e1eb;border-top-color:#1f7c89;animation:blisBootSpin .8s linear infinite}
#blisNavigatorBootScreen small{font-size:10px;font-weight:650;letter-spacing:.04em;color:#7a8d9f}
body.blis-app-ready #blisNavigatorBootScreen{opacity:0;visibility:hidden;pointer-events:none}
@keyframes blisBootSpin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){#blisNavigatorBootScreen .blisBootMark:before{animation:none}}
</style>`

const navigatorStartupScreen = `<div id="blisNavigatorBootScreen" aria-live="polite"><div class="blisBootMark">BLIS Navigator<small>Зареждане на профила</small></div></div><script>(function(){var started=Date.now();function route(){var r=(document.querySelector('.page.active')||{}).id||new URLSearchParams(location.search).get('page')||'overview';var a={digital:'social',opportunities:'social',live:'social',reputation:'market',reports:'history',timeline:'history'};return a[r]||r}function visualReady(){var id=route();if(id==='overview')return!!document.querySelector('#overview .ovh-gauge svg,#overview .vs-gauge-card svg,#overview .vs-gauge-svg');if(id==='social')return!!document.querySelector('#social #digitalBody .dv-radar-wrap .dv-radar-grid');if(id==='market')return!!document.querySelector('#market .pm-stage,#market .pm-canvas');if(id==='competition')return!!document.querySelector('#competition .vs-comp-axis');if(id==='history')return!!document.querySelector('#history .vs-history-board');if(id==='hub'||id==='calendar')return!!document.querySelector('#'+id+' .n3-resource-card');return false}function reveal(){if(document.body.classList.contains('blis-app-ready'))return;var ok=document.documentElement.dataset.navigatorVersion==='3.0-preserved-visuals-5plus2'&&document.querySelectorAll('#nav [data-n3-page]').length===7&&document.querySelector('.bch3-context-title')&&document.querySelector('.page.active')&&visualReady();if(ok){var g=document.getElementById('blisPrepaintGuard');if(g)g.remove();document.body.classList.add('blis-app-ready');document.documentElement.dataset.navigatorPaint='ready';requestAnimationFrame(function(){requestAnimationFrame(function(){var c=document.getElementById('blisNavigatorBootScreen');if(c)setTimeout(function(){c.remove()},180)})});return}if(Date.now()-started>12000){var s=document.querySelector('#blisNavigatorBootScreen small');if(s)s.textContent='Финализиране на профила'}setTimeout(reveal,50)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal()})();</script>`

func init() {
	if authProxy == nil { return }
	previous := authProxy.ModifyResponse
	authProxy.ModifyResponse = func(resp *http.Response) error {
		if previous != nil { if err := previous(resp); err != nil { return err } }
		return applyNavigatorProductionHotfixes(resp)
	}
}

func injectNavigatorStartup(body []byte) []byte {
	if !bytes.Contains(body, []byte(`id="blisNavigatorStartupGuard"`)) {
		body = bytes.Replace(body, []byte("</head>"), append([]byte(navigatorStartupGuard), []byte("</head>")...), 1)
	}
	if !bytes.Contains(body, []byte(`id="blisNavigatorBootScreen"`)) {
		if pos := bytes.Index(body, []byte("<body")); pos >= 0 {
			if endRel := bytes.IndexByte(body[pos:], '>'); endRel >= 0 {
				end := pos + endRel + 1
				out := make([]byte, 0, len(body)+len(navigatorStartupScreen))
				out = append(out, body[:end]...)
				out = append(out, []byte(navigatorStartupScreen)...)
				out = append(out, body[end:]...)
				body = out
			}
		}
	}
	return body
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
		body = injectNavigatorStartup(body)
		tag := []byte(`<script src="/navigator-production-entry-v1.js?v=20260901-first-paint-lock-1"></script>`)
		if navigatorProductionEntrypoint.Match(body) {
			body = navigatorProductionEntrypoint.ReplaceAll(body, tag)
		} else {
			body = bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
		}
		resp.Header.Set("X-BLIS-Navigator-Build", "20260901-first-paint-lock-1")
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

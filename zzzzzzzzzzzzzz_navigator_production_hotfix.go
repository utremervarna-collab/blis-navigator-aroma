package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"
)

var legacyVarnaTowersUIScripts = regexp.MustCompile(`<script[^>]+src="/varna-towers-(?:ui|reference)\.js[^\"]*"[^>]*></script>`)
var legacyNavigatorUIScripts = regexp.MustCompile(`<script[^>]+src="/(?:app|navigator-reference|navigator-social-master|navigator-overview-master|navigator-overview-system-v6|navigator-signals-system-v3|navigator-live-master|navigator-geo-v2|navigator-digital-master|navigator-digital-bootstrap|navigator-client-ui|navigator-client-header-v1|navigator-client-branding-v3|navigator-client-hero|varna-towers-hero-guard|navigator-reputation-exact-art-v41|navigator-reputation-master|navigator-reputation-master-v47|navigator-reputation-totem-3d-v39|navigator-production-cleanup-v1|navigator-perception-core-v8|navigator-perception-map|navigator-system-dynamics-v1|navigator-architecture-v15|navigator-data-core-v2|navigator-module-lock-v1|navigator-client-value-pages-v1|navigator-competition-master-v5|navigator-competition-intelligence-v9|navigator-competition-environment-v10|navigator-competition-page-v11|navigator-competition-page-v12|navigator-competition-ladder-v1|navigator-competition-layout-fix-v1|navigator-executive-ui-v1|navigator-executive-ui-v2|navigator-executive-ui-v3|navigator-executive-reports-v1|navigator-color-system-v1|navigator-visual-focus-v1|navigator-visual-interaction-v1|navigator-visual-suite-v1|navigator-visual-suite-motion-v1|navigator-visual-special-v2|navigator-overview-client-home-v1|navigator-overview-marker-fix-v1|navigator-language-cleanup-v1|navigator-history-fix|navigator-temporal-ui|navigator-commerce-visual-cards-v7|navigator-commerce-exact-cards-v8)\.js[^\"]*"[^>]*></script>`)
var legacyNavigatorUIStyles = regexp.MustCompile(`<link[^>]+href="/(?:navigator-reference|navigator-overview-master|navigator-live-master|navigator-geo-v2|navigator-digital-master|navigator-shell-master|navigator-client-ui|navigator-social-master|navigator-reputation-exact-art-v41|navigator-reputation-master|navigator-reputation-totem-3d-v40|navigator-client-value-pages-v1|navigator-perception-map|navigator-production-cleanup-v1|navigator-overview-clarity|navigator-trend-fix|navigator-visual-special-v2)\.css[^\"]*"[^>]*>`)
var legacyCompetitionPaintGuard = regexp.MustCompile(`(?s)<style[^>]+id="blisCompetitionPaintGuard"[^>]*>.*?</style>`)
var navigatorProductionEntrypoint = regexp.MustCompile(`<script[^>]+src="/navigator-production-entry-v1\.js(?:\?v=[^\"]*)?"[^>]*></script>`)
var navigatorLiveRefreshEntrypoint = regexp.MustCompile(`<script[^>]+src="/navigator-live-refresh-v1\.js(?:\?v=[^\"]*)?"[^>]*></script>`)
var navigatorMentionMountGuardEntrypoint = regexp.MustCompile(`<script[^>]+src="/navigator-mention-mount-guard-v1\.js(?:\?v=[^\"]*)?"[^>]*></script>`)
var navigatorClientValueUniversalEntrypoint = regexp.MustCompile(`<script[^>]+src="/navigator-client-value-universal-v2\.js(?:\?v=[^\"]*)?"[^>]*></script>`)
var navigatorPublicKeyRedactionEntrypoint = regexp.MustCompile(`<script[^>]+src="/navigator-public-key-redaction-v1\.js(?:\?v=[^\"]*)?"[^>]*></script>`)
var navigatorLeanSupersededScripts = regexp.MustCompile(`<script[^>]+src="/(?:navigator-intelligence-analysis-v3|navigator-deep-analytics-v31|navigator-metric-intelligence-v33|navigator-client-value-guard-v1|navigator-client-value-universal-v2|navigator-client-intelligence-content-v2|navigator-client-intelligence-content-v3|navigator-client-intelligence-content-v3-stability|navigator-editorial-cleanup-v1|navigator-route-lazy-v1|navigator-decision-intelligence-v1|navigator-competition-news-v1|navigator-competitor-dossiers-data-v2|navigator-competitor-dossiers-tune-v1|navigator-3-competitor-dossier-v2|navigator-monitoring-canonical-v5|navigator-stability-preload-v1|navigator-client-value-repair-v3|navigator-intelligence-canonical-v5)\.js[^\"]*"[^>]*></script>`)

func init() {
	if authProxy == nil { return }
	previous := authProxy.ModifyResponse
	authProxy.ModifyResponse = func(resp *http.Response) error {
		if previous != nil { if err := previous(resp); err != nil { return err } }
		return applyNavigatorProductionHotfixes(resp)
	}
}

func rewriteNavigatorAsset(resp *http.Response, replacements ...[2]string) error {
	body, err := io.ReadAll(resp.Body)
	if err != nil { return err }
	_ = resp.Body.Close()
	for _, pair := range replacements {
		body = bytes.Replace(body, []byte(pair[0]), []byte(pair[1]), 1)
	}
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	return nil
}

func applyNavigatorProductionHotfixes(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Body == nil { return nil }
	path := resp.Request.URL.Path

	// Versioned production assets are immutable for the lifetime of their query
	// version. Let the browser reuse them instead of downloading the whole UI on
	// every route change or refresh. HTML and API responses remain uncached.
	if (strings.HasSuffix(path, ".js") || strings.HasSuffix(path, ".css")) && resp.Request.URL.Query().Get("v") != "" {
		resp.Header.Set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600")
	}

	if path == "/navigator-production-entry-v1.js" {
		err := rewriteNavigatorAsset(resp,
			[2]string{"const VERSION='20260907-key-factors-title-1';", "const VERSION='20260926-lean1';"},
			[2]string{"await Promise.race([window.BLISDataLoaderV1?.load?.(initialClient,true),new Promise(resolve=>setTimeout(resolve,3000))]);", "const initialData=window.BLISDataLoaderV1?.load?.(initialClient,true);if(initialData&&typeof initialData.catch==='function')initialData.catch(()=>{});"},
			[2]string{"await safe('/navigator-intelligence-stream-v2.js');await safe('/navigator-client-perspective-classifier-v1.js');await safe('/navigator-executive-data-v1.js');", "await Promise.all([safe('/navigator-intelligence-stream-v2.js'),safe('/navigator-client-perspective-classifier-v1.js'),safe('/navigator-executive-data-v1.js')]);"},
			[2]string{"await safe('/navigator-digital-master.js');await safe('/navigator-client-ui.js');await safe('/navigator-client-branding-v3.js');await safe('/navigator-executive-reports-v1.js');", "await Promise.all([safe('/navigator-digital-master.js'),safe('/navigator-client-ui.js'),safe('/navigator-executive-reports-v1.js')]);await safe('/navigator-client-branding-v3.js');"},
			[2]string{"await safe('/navigator-visual-suite-v1.js');await safe('/navigator-visual-suite-motion-v1.js');await safe('/navigator-visual-special-v2.js');await safe('/navigator-overview-client-home-v1.js');", "await safe('/navigator-visual-suite-v1.js');await Promise.all([safe('/navigator-visual-suite-motion-v1.js'),safe('/navigator-visual-special-v2.js'),safe('/navigator-overview-client-home-v1.js')]);"},
			[2]string{"await safe('/navigator-risk-priority-sync-v1.js');await safe('/navigator-overview-marker-fix-v1.js');await safe('/navigator-color-system-v1.js');await safe('/navigator-no-page-numbers-v1.js');await safe('/navigator-language-cleanup-v1.js');", "await Promise.all([safe('/navigator-risk-priority-sync-v1.js'),safe('/navigator-overview-marker-fix-v1.js'),safe('/navigator-color-system-v1.js'),safe('/navigator-no-page-numbers-v1.js'),safe('/navigator-language-cleanup-v1.js')]);"},
			[2]string{"await safe('/navigator-3-client-clarity-v1.js');await safe('/navigator-3-evidence-v1.js');await safe('/navigator-3-competitor-dossier-v1.js');await safe('/navigator-3-client-proof-v1.js');", "await Promise.all([safe('/navigator-3-client-clarity-v1.js'),safe('/navigator-3-evidence-v1.js'),safe('/navigator-3-competitor-dossier-v1.js'),safe('/navigator-3-client-proof-v1.js')]);"},
			[2]string{"'/navigator-signal-current-marker-v1.css'", "'/navigator-signal-current-marker-v1.css','/navigator-decision-intelligence-v1.css'"},
			[2]string{"await safe('/navigator-readable-type-v1.js');", "await safe('/navigator-readable-type-v1.js');await Promise.all([safe('/navigator-client-intelligence-content-v3.js'),safe('/navigator-client-intelligence-content-v3-stability.js'),safe('/navigator-editorial-cleanup-v1.js'),safe('/navigator-client-value-guard-v1.js'),safe('/navigator-decision-intelligence-v1.js')]);await safe('/navigator-route-lazy-v1.js');"},
		)
		if err != nil { return err }
		resp.Header.Set("X-BLIS-Navigator-Asset", "fastboot-1")
		return nil
	}

	if path == "/navigator-live-refresh-v1.js" {
		err := rewriteNavigatorAsset(resp,
			[2]string{"const MENTION_MS=30000,MAX_ROWS=300;", "const MENTION_MS=30000,MAX_ROWS=120;"},
			[2]string{"async function refreshMentions(force=false){\n  if(mentionBusy||document.hidden)return;\n  const c=client(),st=state(c);\n  if(!force&&Date.now()-st.updated<MENTION_MS-1000)return;\n  mentionBusy=true;\n  try{\n    const [b,k]=await Promise.all([fetchScope(c,'brand'),fetchScope(c,'competitor')]);\n    if(client()!==c)return;\n    st.brand=merge(st.brand,b,'brand',c);st.competitor=merge(st.competitor,k,'competitor',c);\n    st.updated=Date.now();st.error=false;\n    if(document.body){document.body.dataset.blisMentionStream='live';document.body.dataset.blisMentionUpdated=String(st.updated)}\n  }catch(e){\n    if(client()===c&&document.body){st.error=true;document.body.dataset.blisMentionStream='degraded'}\n    console.warn('BLIS mention stream',e?.message||e)\n  }finally{mentionBusy=false;scheduleMount(20)}\n}", "function mentionScope(){try{const raw=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';const p=window.BLISRouteAlias?.(raw)||raw;return p==='social'?'brand':p==='competition'?'competitor':''}catch(_){return''}}\nasync function refreshMentions(force=false){\n  if(mentionBusy||document.hidden)return;\n  const scope=mentionScope();if(!scope)return;\n  const c=client(),st=state(c);\n  if(!force&&Date.now()-st.updated<MENTION_MS-1000)return;\n  mentionBusy=true;\n  try{\n    const rows=await fetchScope(c,scope);\n    if(client()!==c)return;\n    if(scope==='brand')st.brand=merge(st.brand,rows,'brand',c);else st.competitor=merge(st.competitor,rows,'competitor',c);\n    st.updated=Date.now();st.error=false;\n    if(document.body){document.body.dataset.blisMentionStream='live';document.body.dataset.blisMentionUpdated=String(st.updated)}\n  }catch(e){\n    if(client()===c&&document.body){st.error=true;document.body.dataset.blisMentionStream='degraded'}\n    console.warn('BLIS mention stream',e?.message||e)\n  }finally{mentionBusy=false;scheduleMount(20)}\n}"},
			[2]string{"function routePulse(){[80,280,700].forEach(ms=>setTimeout(renderStreams,ms));refreshMentions(false)}", "function routePulse(){[80,280,700].forEach(ms=>setTimeout(renderStreams,ms));refreshMentions(true)}"},
		)
		if err != nil { return err }
		resp.Header.Set("X-BLIS-Navigator-Asset", "mentions-route-scoped-1")
		return nil
	}

	if path != "/dashboard.html" && path != "/varna-towers" && path != "/varna-towers-dashboard" && path != "/delta-planet" && path != "/" && path != "/index.html" { return nil }
	body, err := io.ReadAll(resp.Body)
	if err != nil { return err }
	_ = resp.Body.Close()
	if path == "/dashboard.html" || path == "/varna-towers" || path == "/varna-towers-dashboard" || path == "/delta-planet" {
		if path == "/varna-towers" || path == "/varna-towers-dashboard" {
			isolation := []byte(`<style id="blis-varna-towers-isolation-v2">.dashboard-home-link,.client-switch,.client-switch-menu,#clientSel{display:none!important;visibility:hidden!important;pointer-events:none!important}</style><script id="blis-varna-towers-isolation-v2-script">(function(){function lock(){document.querySelectorAll('.dashboard-home-link,.client-switch,.client-switch-menu,#clientSel').forEach(function(el){try{el.remove()}catch(e){el.style.setProperty('display','none','important')}})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lock,{once:true});else lock();new MutationObserver(lock).observe(document.documentElement,{childList:true,subtree:true});})();</script>`)
			body = bytes.Replace(body, []byte("</body>"), append(isolation, []byte("</body>")...), 1)
		}
		body = legacyVarnaTowersUIScripts.ReplaceAll(body, nil)
		body = legacyNavigatorUIScripts.ReplaceAll(body, nil)
		body = legacyNavigatorUIStyles.ReplaceAll(body, nil)
		body = legacyCompetitionPaintGuard.ReplaceAll(body, nil)
		body = navigatorLeanSupersededScripts.ReplaceAll(body, nil)
		// Mention UI is intentionally after the canonical Navigator entrypoint.
		// This keeps first paint independent from monitoring network calls and
		// prevents a page renderer from deleting chronology/ticker on startup.
		body = navigatorLiveRefreshEntrypoint.ReplaceAll(body, nil)
		body = navigatorMentionMountGuardEntrypoint.ReplaceAll(body, nil)
		body = navigatorPublicKeyRedactionEntrypoint.ReplaceAll(body, nil)
		const leanHead = `<style id="blisDashboardPrepaintLean">html:not(.blis-dashboard-ready) body{background:#f4f7fb!important;overflow:hidden!important}html:not(.blis-dashboard-ready) .app,html:not(.blis-dashboard-ready) #modal{visibility:hidden!important;opacity:0!important;pointer-events:none!important}html:not(.blis-dashboard-ready) body:before{content:"BLIS Navigator";position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:#f4f7fb;color:#1d5fd0;font:700 22px/1.2 Arial,sans-serif}html.blis-route-pending.blis-dashboard-ready .main .page.active{visibility:hidden!important;opacity:0!important}</style>`
		if !bytes.Contains(body, []byte("blisDashboardPrepaintLean")) { body = bytes.Replace(body, []byte("</head>"), []byte(leanHead+"</head>"), 1) }
		tag := []byte(`<script src="/navigator-production-entry-v1.js?v=20260926-lean1"></script><script src="/navigator-public-key-redaction-v1.js?v=20260922-redact2"></script><script src="/navigator-nav-visibility-guard-v1.js?v=20260923-deltahome1"></script><script src="/navigator-live-refresh-v1.js?v=20260924-delta-clean1"></script><script src="/navigator-mention-mount-guard-v1.js?v=20260913-fastboot1"></script>`)
		if navigatorProductionEntrypoint.Match(body) {
			body = navigatorProductionEntrypoint.ReplaceAll(body, tag)
		} else {
			body = bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
		}
		resp.Header.Set("X-BLIS-Navigator-Build", "20260926-lean1")
	} else {
		homeTarget := "/dashboard.html?client=aroma&page=overview"
		if strings.EqualFold(resp.Request.URL.Query().Get("client"), "varna-towers") { homeTarget = "/varna-towers" }
		body = bytes.ReplaceAll(body, []byte(`href="/client-access.html?v=20260829-neutral2"`), []byte(`href="`+homeTarget+`"`))
		body = bytes.ReplaceAll(body, []byte(`href="/client-login?generic=1"`), []byte(`href="`+homeTarget+`"`))
		body = bytes.ReplaceAll(body, []byte(`href="/dashboard.html"`), []byte(`href="`+homeTarget+`"`))
		body = bytes.ReplaceAll(body, []byte(`href="/dashboard.html?client=aroma&page=overview"`), []byte(`href="`+homeTarget+`"`))
	}
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	return nil
}

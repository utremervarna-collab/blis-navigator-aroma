package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Canonical client-dashboard assembly.
// Approved modules have one renderer only; legacy page renderers are removed
// from the served dashboard so later changes cannot overlay locked pages.
func assembleNavigatorDashboard(body []byte, hideCommerce bool) []byte {
	// Final production normalization: remove every competing bootstrap/owner
	// before injecting one deterministic runtime for each route.
	body = stripCommerceAsset(body, "app.js")
	body = stripCommerceAsset(body, "navigator-data-core-v2.js")
	body = stripCommerceAsset(body, "navigator-architecture-v15.js")
	body = stripCommerceAsset(body, "navigator-module-lock-v1.js")
	body = stripCommerceAsset(body, "navigator-digital-bootstrap.js")
	body = stripCommerceAsset(body, "navigator-digital-master.js")
	body = stripCommerceAsset(body, "navigator-digital-master.css")
	body = stripCommerceAsset(body, "navigator-live-master.js")
	body = stripCommerceAsset(body, "navigator-live-master.css")
	body = stripCommerceAsset(body, "navigator-geo-v2.js")
	body = stripCommerceAsset(body, "navigator-geo-v2.css")
	body = stripCommerceAsset(body, "navigator-social-master.js")
	body = stripCommerceAsset(body, "navigator-social-master.css")
	body = stripCommerceAsset(body, "navigator-social-bootstrap.js")
	body = stripCommerceAsset(body, "navigator-social-interactive.js")
	body = stripCommerceAsset(body, "navigator-reputation-bootstrap.js")
	body = stripCommerceAsset(body, "navigator-final-fixes-v16.js")
	body = stripCommerceAsset(body, "navigator-final-paint-guard-v17.js")

	// Stable button router + matching CSS. Fresh URLs prevent browsers from
	// retaining the incomplete native-link navigation implementation.
	body = bytes.Replace(body,
		[]byte(`/navigator-reference.js?v=20260824-router3`),
		[]byte(`/navigator-reference.js?v=20260825-router12-singleowner1`), -1)
	body = bytes.Replace(body,
		[]byte(`/navigator-reference.js?v=20260825-router6`),
		[]byte(`/navigator-reference.js?v=20260825-router12-singleowner1`), -1)
	body = bytes.Replace(body,
		[]byte(`/navigator-reference.js?v=20260825-router8-progressive1`),
		[]byte(`/navigator-reference.js?v=20260825-router12-singleowner1`), -1)
	body = bytes.Replace(body,
		[]byte(`/navigator-reference.js?v=20260825-router9-v15owners1`),
		[]byte(`/navigator-reference.js?v=20260825-router12-singleowner1`), -1)
	body = bytes.Replace(body,
		[]byte(`/navigator-reference.js?v=20260825-router11-stablev15`),
		[]byte(`/navigator-reference.js?v=20260825-router12-singleowner1`), -1)
	body = bytes.Replace(body,
		[]byte(`/navigator-reference.css?v=20260816-1`),
		[]byte(`/navigator-reference.css?v=20260825-native1`), -1)
	body = bytes.Replace(body,
		[]byte(`/navigator-runtime-core-v1.js?v=20260824-core3`),
		[]byte(`/navigator-runtime-core-v1.js?v=20260825-core6-noowners1`), -1)

	body = stripCommerceAsset(body, "navigator-reputation-exact-art-v41.css")
	body = stripCommerceAsset(body, "navigator-reputation-exact-art-v41.js")

	body = bytes.Replace(body,
		[]byte(`<style id="blisPrepaintGuard">.page{visibility:hidden!important}.page.active{min-height:560px!important}</style>`),
		[]byte(``), 1)

	if !bytes.Contains(body, []byte("navigator-data-core-v2.js?v=20260825-stablev15")) {
		coreTag := []byte(`<script src="/navigator-data-core-v2.js?v=20260825-stablev15"></script>`)
		anchor := []byte(`<script src="/navigator-runtime-core-v1.js`)
		if i := bytes.Index(body, anchor); i >= 0 {
			tmp := make([]byte, 0, len(body)+len(coreTag))
			tmp = append(tmp, body[:i]...)
			tmp = append(tmp, coreTag...)
			tmp = append(tmp, body[i:]...)
			body = tmp
		} else {
			body = bytes.Replace(body, []byte("</body>"), append(coreTag, []byte("</body>")...), 1)
		}
	}

	body = bytes.Replace(body, []byte(`<script>window.__BLIS_CANONICAL_REFGO=window.refGo;</script>`), []byte(``), -1)
	if !bytes.Contains(body, []byte("__BLIS_CANONICAL_REFGO")) {
		anchor := []byte(`<script src="/navigator-reference.js`)
		if i := bytes.Index(body, anchor); i >= 0 {
			rel := bytes.Index(body[i:], []byte(`</script>`))
			if rel >= 0 {
				pos := i + rel + len(`</script>`)
				capture := []byte(`<script>window.__BLIS_CANONICAL_REFGO=window.refGo;</script>`)
				tmp := make([]byte, 0, len(body)+len(capture))
				tmp = append(tmp, body[:pos]...)
				tmp = append(tmp, capture...)
				tmp = append(tmp, body[pos:]...)
				body = tmp
			}
		}
	}

	if !bytes.Contains(body, []byte("navigator-client-value-pages-v1.css?v=20260825-stablev15")) {
		headAssets := `<link rel="stylesheet" href="/navigator-client-value-pages-v1.css?v=20260825-stablev15">
<link rel="stylesheet" href="/navigator-reputation-master.css?v=20260825-stablev15">
<link rel="stylesheet" href="/navigator-reputation-totem-3d-v40.css?v=20260825-stablev15">
<style id="blisLockedVisibilityRelease">.page{visibility:visible!important}</style>`
		if hideCommerce {
			headAssets += `<style id="blisCommerceFinalGuard">#commerce,.blis-commerce-launch,[data-blis-commerce-open]{display:none!important}</style>`
		}
		body = bytes.Replace(body, []byte("</head>"), []byte(headAssets+"</head>"), 1)
	}

	if !bytes.Contains(body, []byte("navigator-module-lock-v1.js?v=20260825-stablev15")) {
		bodyAssets := `<script src="/navigator-architecture-v15.js?v=20260825-stablev15"></script>
<script src="/navigator-client-value-pages-v1.js?v=20260825-stablev15"></script>
<script src="/navigator-reputation-master.js?v=20260825-stablev15"></script>
<script src="/navigator-reputation-totem-3d-v39.js?v=20260825-stablev15"></script>
<script src="/navigator-competition-master-v5.js?v=20260825-stablev15"></script>
<script src="/navigator-competition-intelligence-v9.js?v=20260825-stablev15"></script>
<script src="/navigator-competition-environment-v10.js?v=20260825-stablev15"></script>
<script src="/navigator-competition-page-v11.js?v=20260825-stablev15"></script>
<script src="/navigator-competition-page-v12.js?v=20260825-stablev15"></script>
<script src="/navigator-module-lock-v1.js?v=20260825-stablev15"></script>`
		if hideCommerce {
			bodyAssets += `<script>(function(){
  function removeCommerceLauncher(){document.querySelectorAll('.blis-commerce-launch,[data-blis-commerce-open]').forEach(function(n){n.remove()});}
  removeCommerceLauncher();
  document.addEventListener('DOMContentLoaded',removeCommerceLauncher,{once:true});
  window.addEventListener('blis:clientdata',function(){requestAnimationFrame(removeCommerceLauncher)});
})();</script>`
		}
		body = bytes.Replace(body, []byte("</body>"), []byte(bodyAssets+"</body>"), 1)
	}

	return body
}

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

		s, ok := sessionFromRequest(resp.Request)
		body = assembleNavigatorDashboard(body, !(ok && s.Admin))
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		resp.Header.Set("Pragma", "no-cache")
		resp.Header.Set("Expires", "0")
		return nil
	}
}

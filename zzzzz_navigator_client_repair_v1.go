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

		// Remove the legacy monolith: it owns an obsolete nav and duplicate renderers.
		body = stripCommerceAsset(body, "app.js")

		// Remove obsolete raster Reputation overlay.
		body = stripCommerceAsset(body, "navigator-reputation-exact-art-v41.css")
		body = stripCommerceAsset(body, "navigator-reputation-exact-art-v41.js")

		// Data-only core runs before runtime/router/page masters.
		if !bytes.Contains(body, []byte("navigator-data-core-v2.js")) {
			coreTag := []byte(`<script src="/navigator-data-core-v2.js?v=20260825-lock2"></script>`)
			anchor := []byte(`<script src="/navigator-runtime-core-v1.js`)
			if i := bytes.Index(body, anchor); i >= 0 {
				tmp := make([]byte, 0, len(body)+len(coreTag))
				tmp = append(tmp, body[:i]...)
				tmp = append(tmp, coreTag...)
				tmp = append(tmp, body[i:]...)
				body = tmp
			}
		}

		// Capture canonical router before later legacy modules can wrap refGo.
		if !bytes.Contains(body, []byte("__BLIS_CANONICAL_REFGO")) {
			refTag := []byte(`<script src="/navigator-reference.js?v=20260824-router3"></script>`)
			refLocked := []byte(`<script src="/navigator-reference.js?v=20260824-router3"></script><script>window.__BLIS_CANONICAL_REFGO=window.refGo;</script>`)
			body = bytes.Replace(body, refTag, refLocked, 1)
		}

		if !bytes.Contains(body, []byte("navigator-client-value-pages-v1.css?v=20260825-lock2")) {
			headAssets := `<link rel="stylesheet" href="/navigator-client-value-pages-v1.css?v=20260825-lock2">
<link rel="stylesheet" href="/navigator-reputation-master.css?v=20260825-lock2">
<link rel="stylesheet" href="/navigator-reputation-totem-3d-v40.css?v=20260825-lock2">
<style id="blisCommerceLauncherRemoved">.blis-commerce-launch,[data-blis-commerce-open]{display:none!important}</style>`
			body = bytes.Replace(body, []byte("</head>"), []byte(headAssets+"</head>"), 1)
		}

		if !bytes.Contains(body, []byte("navigator-module-lock-v1.js?v=20260825-lock2")) {
			bodyAssets := `<script src="/navigator-client-value-pages-v1.js?v=20260825-lock2"></script>
<script src="/navigator-reputation-master.js?v=20260825-lock2"></script>
<script src="/navigator-reputation-totem-3d-v39.js?v=20260825-lock2"></script>
<script src="/navigator-competition-master-v5.js?v=20260825-lock2"></script>
<script src="/navigator-competition-intelligence-v9.js?v=20260825-lock2"></script>
<script src="/navigator-competition-environment-v10.js?v=20260825-lock2"></script>
<script src="/navigator-competition-page-v11.js?v=20260825-lock2"></script>
<script src="/navigator-competition-page-v12.js?v=20260825-lock2"></script>
<script src="/navigator-module-lock-v1.js?v=20260825-lock2"></script>
<script>(function(){
  function removeCommerceLauncher(){document.querySelectorAll('.blis-commerce-launch,[data-blis-commerce-open]').forEach(function(n){n.remove()});}
  removeCommerceLauncher();
  document.addEventListener('DOMContentLoaded',removeCommerceLauncher,{once:true});
  window.addEventListener('blis:clientdata',function(){requestAnimationFrame(removeCommerceLauncher)});
})();</script>`
			body = bytes.Replace(body, []byte("</body>"), []byte(bodyAssets+"</body>"), 1)
		}

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

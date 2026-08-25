package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Final client-dashboard repair layer.
// 1) restores the production modules that the canonical router expects;
// 2) removes the obsolete Reputation image overlay so the approved 3D crystal/podium returns;
// 3) removes the Services & Payment launcher from the Navigator sidebar.
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
		if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
			return nil
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()

		// Retire the old raster/exact-art overlay. The approved Reputation visual
		// is the shared 3D crystal/podium with only the client name changing.
		body = stripCommerceAsset(body, "navigator-reputation-exact-art-v41.css")
		body = stripCommerceAsset(body, "navigator-reputation-exact-art-v41.js")

		headAssets := `<link rel="stylesheet" href="/navigator-client-value-pages-v1.css?v=20260825-clientrepair1">
<link rel="stylesheet" href="/navigator-reputation-master.css?v=20260825-clientrepair1">
<link rel="stylesheet" href="/navigator-reputation-totem-3d-v40.css?v=20260825-clientrepair1">
<style id="blisCommerceLauncherRemoved">.blis-commerce-launch,[data-blis-commerce-open]{display:none!important}</style>`

		bodyAssets := `<script src="/navigator-client-value-pages-v1.js?v=20260825-clientrepair1"></script>
<script src="/navigator-reputation-master.js?v=20260825-clientrepair1"></script>
<script src="/navigator-reputation-totem-3d-v39.js?v=20260825-clientrepair1"></script>
<script src="/navigator-competition-master-v5.js?v=20260825-clientrepair1"></script>
<script src="/navigator-competition-intelligence-v9.js?v=20260825-clientrepair1"></script>
<script src="/navigator-competition-environment-v10.js?v=20260825-clientrepair1"></script>
<script src="/navigator-competition-page-v11.js?v=20260825-clientrepair1"></script>
<script src="/navigator-competition-page-v12.js?v=20260825-clientrepair1"></script>
<script>(function(){
  function removeCommerceLauncher(){document.querySelectorAll('.blis-commerce-launch,[data-blis-commerce-open]').forEach(function(n){n.remove()});}
  removeCommerceLauncher();
  document.addEventListener('DOMContentLoaded',removeCommerceLauncher,{once:true});
  window.addEventListener('blis:clientdata',function(){requestAnimationFrame(removeCommerceLauncher)});
  window.addEventListener('blis:periodchange',function(){requestAnimationFrame(removeCommerceLauncher)});
})();</script>`

		if !bytes.Contains(body, []byte("20260825-clientrepair1")) {
			body = bytes.Replace(body, []byte("</head>"), []byte(headAssets+"</head>"), 1)
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

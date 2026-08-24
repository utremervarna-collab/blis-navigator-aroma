package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Final commerce presentation layer: force the approved light v11 product family
// into every protected dashboard response, including owner/admin sessions.
// This deliberately runs after the gateway bootstrap and preserves the existing
// response modifier before adding the commerce assets.
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

		headAsset := `<link rel="stylesheet" href="/navigator-commerce-approved-all-v11.css?v=20260824-family11b" data-blis-approved-v11="1">`
		bodyAsset := `<script src="/navigator-commerce-approved-all-v11.js?v=20260824-family11b" data-blis-approved-v11="1"></script><script>setTimeout(function(){window.BLISCommerceApprovedAllV11&&window.BLISCommerceApprovedAllV11.enhance&&window.BLISCommerceApprovedAllV11.enhance()},120);</script>`
		if !bytes.Contains(body, []byte("navigator-commerce-approved-all-v11.css")) {
			body = bytes.Replace(body, []byte("</head>"), []byte(headAsset+"</head>"), 1)
		}
		if !bytes.Contains(body, []byte("navigator-commerce-approved-all-v11.js")) {
			body = bytes.Replace(body, []byte("</body>"), []byte(bodyAsset+"</body>"), 1)
		}
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		return nil
	}
}

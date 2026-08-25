package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

// stripCommerceAsset removes one legacy/current commerce JS or CSS tag from an
// HTML response regardless of cache-busting query string or extra attributes.
func stripCommerceAsset(body []byte, asset string) []byte {
	q := regexp.QuoteMeta(asset)
	linkRE := regexp.MustCompile(`(?is)<link\b[^>]*href=["'][^"']*` + q + `[^"']*["'][^>]*>`)
	scriptRE := regexp.MustCompile(`(?is)<script\b[^>]*src=["'][^"']*` + q + `[^"']*["'][^>]*>\s*</script>`)
	body = linkRE.ReplaceAll(body, nil)
	body = scriptRE.ReplaceAll(body, nil)
	return body
}

// Final commerce presentation layer. It removes every obsolete visual layer
// and installs exactly one stable approved family on both the public catalogue
// and authenticated Navigator.
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
		if resp == nil || resp.Request == nil {
			return nil
		}
		path := resp.Request.URL.Path
		if path != "/dashboard.html" && path != "/services.html" {
			return nil
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()

		for _, asset := range []string{
			"navigator-commerce-visual-cards-v7.css",
			"navigator-commerce-visual-cards-v7.js",
			"navigator-commerce-exact-cards-v8.css",
			"navigator-commerce-exact-cards-v8.js",
			"navigator-commerce-light-fix-v9.css",
			"navigator-commerce-approved-v10.css",
			"navigator-commerce-approved-v10.js",
			"navigator-commerce-approved-all-v11.css",
			"navigator-commerce-approved-all-v11.js",
		} {
			body = stripCommerceAsset(body, asset)
		}

		headAsset := `<link rel="stylesheet" href="/navigator-commerce-approved-all-v11.css?v=20260825-stable2" data-blis-approved-v11="1">`
		bodyAsset := `<script>window.__BLIS_COMMERCE_VISUAL_CARDS_V7=true;window.__BLIS_COMMERCE_EXACT_CARDS_V8=true;window.__BLIS_APPROVED_SERVICE_CARDS_V10=true;</script><script src="/navigator-commerce-approved-all-v11.js?v=20260825-stable2" data-blis-approved-v11="1"></script><script>setTimeout(function(){window.BLISCommerceApprovedAllV11&&window.BLISCommerceApprovedAllV11.reset&&window.BLISCommerceApprovedAllV11.reset()},160);</script>`

		body = bytes.Replace(body, []byte("</head>"), []byte(headAsset+"</head>"), 1)
		body = bytes.Replace(body, []byte("</body>"), []byte(bodyAsset+"</body>"), 1)
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

package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

// stripCommerceAsset removes one commerce JS or CSS tag from an HTML response
// regardless of cache-busting query string or extra attributes.
func stripCommerceAsset(body []byte, asset string) []byte {
	q := regexp.QuoteMeta(asset)
	linkRE := regexp.MustCompile(`(?is)<link\b[^>]*href=["'][^"']*` + q + `[^"']*["'][^>]*>`)
	scriptRE := regexp.MustCompile(`(?is)<script\b[^>]*src=["'][^"']*` + q + `[^"']*["'][^>]*>\s*</script>`)
	body = linkRE.ReplaceAll(body, nil)
	body = scriptRE.ReplaceAll(body, nil)
	return body
}

func stripAllCommerceAssets(body []byte) []byte {
	for _, asset := range []string{
		"navigator-commerce-safe-v3.css",
		"navigator-commerce-safe-v3.js",
		"navigator-commerce-sales-v5.js",
		"navigator-commerce-v1.js",
		"navigator-commerce-v2.js",
		"navigator-commerce-visual-cards-v7.css",
		"navigator-commerce-visual-cards-v7.js",
		"navigator-commerce-exact-cards-v8.css",
		"navigator-commerce-exact-cards-v8.js",
		"navigator-commerce-light-fix-v9.css",
		"navigator-commerce-approved-v10.css",
		"navigator-commerce-approved-v10.js",
		"navigator-commerce-approved-all-v11.css",
		"navigator-commerce-approved-all-v11.js",
		"navigator-commerce-owner-fix-v15.css",
	} {
		body = stripCommerceAsset(body, asset)
	}
	return body
}

// Services & Payment remains separate from the analytical dashboard. Dashboard
// responses never receive commerce code, while the standalone catalogue is
// available to public visitors and authenticated users.
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
		body = stripAllCommerceAssets(body)

		if path == "/dashboard.html" {
			head := `<style id="blisCommerceOwnerOnly">#commerce,.blis-commerce-launch,[data-blis-commerce-open]{display:none!important}</style>`
			late := `<script>(function(){function hide(){document.querySelectorAll('#commerce,.blis-commerce-launch,[data-blis-commerce-open]').forEach(function(n){n.remove()});}hide();setTimeout(hide,250);setTimeout(hide,900);})();</script>`
			body = bytes.Replace(body, []byte("</head>"), []byte(head+"</head>"), 1)
			body = bytes.Replace(body, []byte("</body>"), []byte(late+"</body>"), 1)
		} else if path == "/services.html" {
			headAsset := `<link rel="stylesheet" href="/navigator-commerce-safe-v3.css?v=20260825-owner15"><link rel="stylesheet" href="/navigator-commerce-approved-all-v11.css?v=20260825-owner15"><link rel="stylesheet" href="/navigator-commerce-owner-fix-v15.css?v=20260825-owner15">`
			bodyAsset := `<script>window.__BLIS_COMMERCE_VISUAL_CARDS_V7=true;window.__BLIS_COMMERCE_EXACT_CARDS_V8=true;window.__BLIS_APPROVED_SERVICE_CARDS_V10=true;window.__BLIS_COMMERCE_APPROVED_STABLE_20260825=true;</script><script src="/navigator-commerce-safe-v3.js?v=20260825-owner15"></script><script src="/navigator-commerce-approved-all-v11.js?v=20260825-owner15"></script><script>(function(){function place(){var b=document.querySelector('[data-blis-commerce-open]');var nav=document.getElementById('nav');if(!b||!nav)return;b.classList.add('blis-commerce-owner-launch');if(b.nextElementSibling!==nav)nav.parentNode.insertBefore(b,nav);}function refresh(){place();if(window.BLISCommerceApprovedAllV11&&window.BLISCommerceApprovedAllV11.reset)window.BLISCommerceApprovedAllV11.reset();}setTimeout(refresh,100);setTimeout(place,350);setTimeout(place,1000);var side=document.querySelector('.side');if(side&&window.MutationObserver){new MutationObserver(function(){place()}).observe(side,{childList:true});}})();</script>`
			body = bytes.Replace(body, []byte("</head>"), []byte(headAsset+"</head>"), 1)
			body = bytes.Replace(body, []byte("</body>"), []byte(bodyAsset+"</body>"), 1)
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

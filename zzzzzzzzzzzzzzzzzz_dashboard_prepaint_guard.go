package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Prevent intermediate dashboard states from painting before the canonical
// page renderer is actually ready. Styling alone is not sufficient: on entry
// the shared client-intelligence layer can render before the approved overview.
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

		const guard = `<style id="blisDashboardPrepaintV5">
html:not(.blis-dashboard-ready) body{background:#f4f7fb!important;overflow:hidden!important}
html:not(.blis-dashboard-ready) .app,
html:not(.blis-dashboard-ready) #modal{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
html:not(.blis-dashboard-ready) body::before{content:"BLIS Navigator";position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:#f4f7fb;color:#1d5fd0;font:700 22px/1.2 Arial,sans-serif;letter-spacing:-.02em}
html:not(.blis-dashboard-ready) body::after{content:"";position:fixed;z-index:2147483647;left:50%;top:calc(50% + 36px);width:24px;height:24px;margin-left:-12px;border:2px solid #d8e3ef;border-top-color:#1d73b7;border-radius:50%;animation:blisBootSpin .7s linear infinite}
html.blis-dashboard-slow:not(.blis-dashboard-ready) body::before{content:"BLIS Navigator се зарежда. Моля, изчакайте.";font-size:17px;padding:24px;text-align:center}
@keyframes blisBootSpin{to{transform:rotate(360deg)}}
html.blis-route-pending.blis-dashboard-ready .main .page.active{visibility:hidden!important;opacity:0!important;min-height:calc(100vh - 160px)!important}
html.blis-route-pending.blis-dashboard-ready .main .shell::after{content:"Зареждане…";position:fixed;top:50%;left:calc(50% + 100px);z-index:20;color:#5d7289;background:#f4f7fb;padding:12px 18px;border-radius:12px;font:600 13px Arial,sans-serif;pointer-events:none}
</style><script id="blisDashboardPrepaintScriptV5">(function(){
// A slow connection is not a failed bootstrap. Keep the progress indicator
// until the production entrypoint has assembled the canonical dashboard.
setTimeout(function(){if(!document.documentElement.classList.contains('blis-dashboard-ready'))document.documentElement.classList.add('blis-dashboard-slow')},15000);
})();</script>`

		// Remove any previously injected prepaint guard from an earlier wrapper
		// version in the same assembled response, then install the canonical V5.
		if !bytes.Contains(body, []byte("blisDashboardPrepaintV5")) {
			if bytes.Contains(body, []byte("</head>")) {
				body = bytes.Replace(body, []byte("</head>"), []byte(guard+"</head>"), 1)
			} else {
				body = append([]byte(guard), body...)
			}
		}

		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		return nil
	}
}

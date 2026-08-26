package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Milestone-only navigation repair: the service root opens the owner dashboard,
// while the dashboard's "Начален екран" control reaches the fully assembled
// BLIS home page, including all runtime-injected images and visual patches.
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
		if path != "/dashboard.html" && path != "/index.html" {
			return nil
		}

		var body []byte
		if path == "/index.html" {
			// The raw static/index.html does not contain the Go init-time home visuals.
			// Serve the canonical assembled indexHTML used by the original root route.
			_ = resp.Body.Close()
			body = []byte(indexHTML)
		} else {
			var err error
			body, err = io.ReadAll(resp.Body)
			if err != nil {
				return err
			}
			_ = resp.Body.Close()
			body = bytes.ReplaceAll(body,
				[]byte(`href="/" aria-label="Към началния екран"`),
				[]byte(`href="/index.html" aria-label="Към началния екран"`),
			)
		}

		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Content-Type", "text/html; charset=utf-8")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		resp.Header.Set("Pragma", "no-cache")
		resp.Header.Set("Expires", "0")
		return nil
	}
}

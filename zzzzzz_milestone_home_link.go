package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Milestone-only navigation repair: the service root opens the owner dashboard,
// while the dashboard's "Начален екран" control must still reach the public
// BLIS home page. /index.html is intentionally outside the root redirect.
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

		body = bytes.ReplaceAll(body,
			[]byte(`href="/" aria-label="Към началния екран"`),
			[]byte(`href="/index.html" aria-label="Към началния екран"`),
		)

		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		return nil
	}
}

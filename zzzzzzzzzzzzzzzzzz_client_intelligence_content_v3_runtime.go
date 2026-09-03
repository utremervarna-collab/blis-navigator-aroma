package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Load the decision-intelligence content owner after the existing dashboard
// renderers. It does not change KUB's dedicated crisis interface.
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
		const tag = `<script defer src="/navigator-client-intelligence-content-v3.js?v=20260903-decision1"></script><script defer src="/navigator-client-intelligence-content-v3-stability.js?v=20260903-dedupe1"></script>`
		if !bytes.Contains(body, []byte("navigator-client-intelligence-content-v3.js")) {
			if bytes.Contains(body, []byte("</body>")) {
				body = bytes.Replace(body, []byte("</body>"), []byte(tag+"</body>"), 1)
			} else {
				body = append(body, []byte(tag)...)
			}
		} else if !bytes.Contains(body, []byte("navigator-client-intelligence-content-v3-stability.js")) {
			const stability = `<script defer src="/navigator-client-intelligence-content-v3-stability.js?v=20260903-dedupe1"></script>`
			if bytes.Contains(body, []byte("</body>")) {
				body = bytes.Replace(body, []byte("</body>"), []byte(stability+"</body>"), 1)
			} else {
				body = append(body, []byte(stability)...)
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

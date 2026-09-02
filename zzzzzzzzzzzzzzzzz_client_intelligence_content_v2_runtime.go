package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Load the shared client-intelligence content pass after the assembled
// standard dashboard. This applies to all normal client profiles; KUB keeps
// its dedicated crisis interface.
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
		const tag = `<script defer src="/navigator-client-intelligence-content-v2.js?v=20260902-allclients1"></script>`
		if !bytes.Contains(body, []byte("navigator-client-intelligence-content-v2.js")) {
			if bytes.Contains(body, []byte("</body>")) {
				body = bytes.Replace(body, []byte("</body>"), []byte(tag+"</body>"), 1)
			} else {
				body = append(body, []byte(tag)...)
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

package main

import (
	"bytes"
	"io"
	"net/http"
	"strings"
)

// Wirello stays a data-only adapter on top of the current canonical Navigator.
// The response hook loads the synthetic client runtime and demo polish before the
// normal dashboard scripts, so every current page renderer and visual fix remains the owner.
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
		return injectWirelloDemoRuntime(resp)
	}
}

func injectWirelloDemoRuntime(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
		return nil
	}
	scope := strings.TrimSpace(resp.Request.Header.Get("X-BLIS-Client-Scope"))
	if scope != "wirello" && strings.TrimSpace(resp.Request.URL.Query().Get("client")) != "wirello" {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	resp.Body.Close()

	marker := []byte("<body")
	start := bytes.Index(body, marker)
	if start >= 0 {
		if relEnd := bytes.IndexByte(body[start:], '>'); relEnd >= 0 {
			end := start + relEnd + 1
			boot := []byte(`<script src="/wirello-navigator-runtime.js?v=20260822-current"></script><script src="/wirello-demo-polish-v2.js?v=20260822-qa1"></script><script src="/wirello-route-stability.js?v=20260822-qa2"></script>`)
			out := make([]byte, 0, len(body)+len(boot))
			out = append(out, body[:end]...)
			out = append(out, boot...)
			out = append(out, body[end:]...)
			body = out
		}
	}

	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Del("Content-Length")
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	return nil
}

package main

import (
	"bytes"
	"io"
	"net/http"
	"strings"
)

// Wirello is a first-class synthetic demo client on top of the canonical Navigator.
// Only one client data/theme runtime and one one-shot hero loader are injected.
// Route ownership, page rendering and visual modules remain canonical Navigator code.
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
			boot := []byte(`<script src="/wirello-client-runtime-v1.js?v=20260822-arch2"></script><script src="/wirello-hero-loader-v1.js?v=20260822-hero2"></script>`)
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

package main

import (
	"bytes"
	"io"
	"net/http"
	"strings"
)

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
			boot := []byte(`<script src="/wirello-client-runtime-v1.js?v=20260824-stable2"></script><script src="/wirello-curves-stable-v1.js?v=20260824-curves2"></script><script src="/wirello-hero-loader-v1.js?v=20260822-hero2"></script>`)
			out := make([]byte, 0, len(body)+len(boot))
			out = append(out, body[:end]...)
			out = append(out, boot...)
			out = append(out, body[end:]...)
			body = out
		}
	}

	// Wirello-only completion layers loaded after the canonical Navigator.
	// Reputation is owned by an independent Wirello renderer and does not use
	// legacy app.js globals or the shared Reputation lifecycle.
	tail := []byte(`<script src="/wirello-page-stability-v2.js?v=20260824-pages2"></script><script src="/wirello-shell-repair-v1.js?v=20260824-shell1"></script><script src="/wirello-final-ui-v3.js?v=20260824-final3"></script><script src="/wirello-reputation-v3.js?v=20260824-rep3"></script>`)
	if pos := bytes.LastIndex(body, []byte("</body>")); pos >= 0 {
		out := make([]byte, 0, len(body)+len(tail))
		out = append(out, body[:pos]...)
		out = append(out, tail...)
		out = append(out, body[pos:]...)
		body = out
	} else {
		body = append(body, tail...)
	}

	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Del("Content-Length")
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	return nil
}

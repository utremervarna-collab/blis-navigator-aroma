package main

import (
	"bytes"
	"io"
	"net/http"
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
		return injectNavigatorCommerce(resp)
	}
}

func injectNavigatorCommerce(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
		return nil
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	resp.Body.Close()
	if bytes.Contains(body, []byte("/navigator-commerce-v1.js")) {
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		return nil
	}
	tag := []byte(`<script src="/navigator-commerce-v1.js?v=20260824-commerce1"></script>`)
	if pos := bytes.LastIndex(body, []byte("</body>")); pos >= 0 {
		out := make([]byte, 0, len(body)+len(tag))
		out = append(out, body[:pos]...)
		out = append(out, tag...)
		out = append(out, body[pos:]...)
		body = out
	} else {
		body = append(body, tag...)
	}
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Del("Content-Length")
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	return nil
}

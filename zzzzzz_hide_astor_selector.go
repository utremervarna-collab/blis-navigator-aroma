package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Keep Astor Garden available in the backend but hidden from the client selector.
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
		if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
			return nil
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()
		style := []byte(`<style id="blisHideAstor">.client-option[data-client-key="astor-garden"]{display:none!important}</style>`)
		if !bytes.Contains(body, []byte(`id="blisHideAstor"`)) {
			body = bytes.Replace(body, []byte("</head>"), append(style, []byte("</head>")...), 1)
		}
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		return nil
	}
}

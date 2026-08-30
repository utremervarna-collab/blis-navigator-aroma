package main

import (
	"io"
	"net/http"
	"strings"
)

// The dedicated Wirello Render service keeps its historical public URL, but
// uses the current Navigator mainline. Its root only redirects to the native
// isolated /wirello route already provided by the current gateway.
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
		if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/" {
			return nil
		}
		if resp.Body != nil {
			_ = resp.Body.Close()
		}
		resp.StatusCode = http.StatusFound
		resp.Status = "302 Found"
		resp.Header.Set("Location", "/wirello")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		resp.Header.Set("Pragma", "no-cache")
		resp.Header.Set("Expires", "0")
		resp.Header.Set("Content-Length", "0")
		resp.ContentLength = 0
		resp.Body = io.NopCloser(strings.NewReader(""))
		return nil
	}
}

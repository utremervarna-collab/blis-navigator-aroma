package main

import (
	"bytes"
	"io"
	"net/http"
	"regexp"
	"strconv"
)

var legacyVarnaTowersUIScripts = regexp.MustCompile(`<script[^>]+src="/varna-towers-(?:ui|reference)\.js[^\"]*"[^>]*></script>`)

// This late init wraps the existing dashboard response modifier. The canonical
// Navigator entrypoint is injected after every legacy browser asset, so old
// client-specific scripts cannot remain the final owner of window.refGo.
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
		return injectNavigatorProductionEntrypoint(resp)
	}
}

func injectNavigatorProductionEntrypoint(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" || resp.Body == nil {
		return nil
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	_ = resp.Body.Close()

	// Never send the two legacy Varna Towers UI/router overrides to the browser.
	// The isolated Varna Towers data adapter may remain, but presentation and
	// routing are now universal across every client profile.
	body = legacyVarnaTowersUIScripts.ReplaceAll(body, nil)

	marker := []byte("navigator-production-entry-v1.js")
	if !bytes.Contains(body, marker) {
		tag := []byte(`<script src="/navigator-production-entry-v1.js?v=20260829-production-entry-2"></script>`)
		body = bytes.Replace(body, []byte("</body>"), append(tag, []byte("</body>")...), 1)
	}

	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	return nil
}

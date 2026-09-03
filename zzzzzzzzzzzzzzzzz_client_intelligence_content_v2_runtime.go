package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// V2 is kept only as a compatibility purge pass. The actual client-facing
// content is owned by V3; this loader cache-busts old browsers so legacy
// low-value facts cannot reappear from a cached V2 asset.
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
		const tag = `<script defer src="/navigator-client-intelligence-content-v2.js?v=20260903-retired2"></script>`
		// Replace any older V2 URL already injected by an earlier response layer.
		if i := bytes.Index(body, []byte(`<script defer src="/navigator-client-intelligence-content-v2.js?v=`)); i >= 0 {
			if e := bytes.Index(body[i:], []byte(`</script>`)); e >= 0 {
				body = append(append(append([]byte{}, body[:i]...), []byte(tag)...), body[i+e+len(`</script>`):]...)
			}
		} else if !bytes.Contains(body, []byte("navigator-client-intelligence-content-v2.js")) {
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

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
        return injectNavigatorProductionCleanup(resp)
    }
}

func injectNavigatorProductionCleanup(resp *http.Response) error {
    if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
        return nil
    }
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return err
    }
    resp.Body.Close()

    var tags []byte
    if !bytes.Contains(body, []byte("/navigator-production-cleanup-v1.js")) {
        tags = append(tags, []byte(`<link rel="stylesheet" href="/navigator-production-cleanup-v1.css?v=20260824-clean1"><script src="/navigator-production-cleanup-v1.js?v=20260824-clean1"></script>`)...)
    }
    if !bytes.Contains(body, []byte("/navigator-commerce-safe-v3.js")) {
        tags = append(tags, []byte(`<link rel="stylesheet" href="/navigator-commerce-safe-v3.css?v=20260824-commerce3"><script src="/navigator-commerce-safe-v3.js?v=20260824-commerce3"></script>`)...)
    }

    if len(tags) > 0 {
        if pos := bytes.LastIndex(body, []byte("</body>")); pos >= 0 {
            out := make([]byte, 0, len(body)+len(tags))
            out = append(out, body[:pos]...)
            out = append(out, tags...)
            out = append(out, body[pos:]...)
            body = out
        } else {
            body = append(body, tags...)
        }
    }

    resp.Body = io.NopCloser(bytes.NewReader(body))
    resp.ContentLength = int64(len(body))
    resp.Header.Del("Content-Length")
    resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    return nil
}

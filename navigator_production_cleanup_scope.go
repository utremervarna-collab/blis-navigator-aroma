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
    if resp == nil || resp.Request == nil {
        return nil
    }
    path := resp.Request.URL.Path
    if path != "/dashboard.html" && path != "/services.html" {
        return nil
    }
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return err
    }
    resp.Body.Close()

    replacements := [][2]string{
        {"/navigator-runtime-core-v1.js?v=20260824-core3", "/navigator-runtime-core-v1.js?v=20260824-core5"},
        {"/navigator-runtime-core-v1.js?v=20260824-core4", "/navigator-runtime-core-v1.js?v=20260824-core5"},
        {"/navigator-reference.js?v=20260823-client-clean1", "/navigator-reference.js?v=20260824-router5"},
        {"/navigator-reference.js?v=20260824-router3", "/navigator-reference.js?v=20260824-router5"},
        {"/navigator-digital-bootstrap.js?v=20260819-radarboot2", "/navigator-digital-bootstrap.js?v=20260824-digital2"},
        {"/navigator-reputation-exact-art-v41.js?v=20260824-event1", "/navigator-reputation-exact-art-v41.js?v=20260824-event64"},
        {"/navigator-reputation-exact-art-v41.js?v=20260819-exact43", "/navigator-reputation-exact-art-v41.js?v=20260824-event64"},
        {"/navigator-stability-preload-v1.js?v=20260822-stability1", "/navigator-stability-preload-v1.js?v=20260824-stability3"},
        {"/navigator-stability-preload-v1.js?v=20260824-stability2", "/navigator-stability-preload-v1.js?v=20260824-stability3"},
        {"/navigator-production-cleanup-v1.css?v=20260824-clean1", "/navigator-production-cleanup-v1.css?v=20260824-clean3"},
        {"/navigator-production-cleanup-v1.css?v=20260824-clean2", "/navigator-production-cleanup-v1.css?v=20260824-clean3"},
        {"/navigator-production-cleanup-v1.js?v=20260824-clean1", "/navigator-production-cleanup-v1.js?v=20260824-clean3"},
        {"/navigator-production-cleanup-v1.js?v=20260824-clean2", "/navigator-production-cleanup-v1.js?v=20260824-clean3"},
        {"/navigator-commerce-visual-cards-v7.js?v=20260824-v7", "/navigator-commerce-visual-cards-v7.js?v=20260824-light9"},
        {"/navigator-commerce-visual-cards-v7.js?v=20260824-v7-light3", "/navigator-commerce-visual-cards-v7.js?v=20260824-light9"},
    }
    for _, pair := range replacements {
        body = bytes.ReplaceAll(body, []byte(pair[0]), []byte(pair[1]))
    }

    var tags []byte
    if path == "/dashboard.html" && !bytes.Contains(body, []byte("/navigator-production-cleanup-v1.js")) {
        tags = append(tags, []byte(`<link rel="stylesheet" href="/navigator-production-cleanup-v1.css?v=20260824-clean3"><script src="/navigator-production-cleanup-v1.js?v=20260824-clean3"></script>`)...)
    }
    if !bytes.Contains(body, []byte("/navigator-commerce-safe-v3.js")) {
        tags = append(tags, []byte(`<link rel="stylesheet" href="/navigator-commerce-safe-v3.css?v=20260824-commerce3"><script src="/navigator-commerce-safe-v3.js?v=20260824-commerce3"></script>`)...)
    }
    if !bytes.Contains(body, []byte("/navigator-commerce-light-cards-v9.js")) {
        tags = append(tags, []byte(`<link rel="stylesheet" href="/navigator-commerce-light-cards-v9.css?v=20260824-light9"><link rel="stylesheet" href="/navigator-commerce-light-fix-v9.css?v=20260824-light9"><script src="/navigator-commerce-light-cards-v9.js?v=20260824-light9"></script>`)...)
    } else if !bytes.Contains(body, []byte("/navigator-commerce-light-fix-v9.css")) {
        tags = append(tags, []byte(`<link rel="stylesheet" href="/navigator-commerce-light-fix-v9.css?v=20260824-light9">`)...)
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

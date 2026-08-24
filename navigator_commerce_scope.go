package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
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
	if bytes.Contains(body, []byte("/navigator-commerce-v2.js")) {
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		return nil
	}

	cfg := map[string]any{
		"provider":         strings.TrimSpace(os.Getenv("BLIS_COMMERCE_PROVIDER")),
		"checkoutEndpoint": strings.TrimSpace(os.Getenv("BLIS_COMMERCE_CHECKOUT_ENDPOINT")),
	}
	if u := strings.TrimSpace(os.Getenv("BLIS_COMMERCE_PAYMENT_URL")); u != "" {
		cfg["paymentUrls"] = map[string]string{"default": u}
	}
	cfgJSON, _ := json.Marshal(cfg)
	tag := []byte(`<script>window.BLIS_COMMERCE_CONFIG=` + string(cfgJSON) + `;</script><script src="/navigator-commerce-v2.js?v=20260824-commerce2"></script>`)
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

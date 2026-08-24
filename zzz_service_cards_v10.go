package main

import (
	"archive/zip"
	"bytes"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Install the approved light BLIS service-card artwork atomically and make the
// final v10 visual layer authoritative on both the public catalogue and the
// authenticated Navigator.
func init() {
	installApprovedServiceCardAssetsV10()

	if authProxy == nil {
		log.Printf("BLIS service cards v10: auth proxy not ready")
		return
	}
	previous := authProxy.ModifyResponse
	authProxy.ModifyResponse = func(resp *http.Response) error {
		if previous != nil {
			if err := previous(resp); err != nil {
				return err
			}
		}
		return applyApprovedServiceCardsV10(resp)
	}
}

func installApprovedServiceCardAssetsV10() {
	const archivePath = "static/service-cards-v10.zip"
	r, err := zip.OpenReader(archivePath)
	if err != nil {
		log.Printf("BLIS service cards v10: archive: %v", err)
		return
	}
	defer r.Close()

	outDir := filepath.Join("static", "service-cards")
	if err := os.MkdirAll(outDir, 0o755); err != nil {
		log.Printf("BLIS service cards v10: mkdir: %v", err)
		return
	}

	allowed := map[string]bool{
		"monitor.webp": true,
		"analysis.webp": true,
		"full.webp": true,
		"corporate.webp": true,
		"brand-scan.webp": true,
		"reputation.webp": true,
		"competitive.webp": true,
		"digital.webp": true,
		"attitudes.webp": true,
		"signals.webp": true,
		"crisis.webp": true,
		"comm-effect.webp": true,
		"source-audit.webp": true,
		"blis360.webp": true,
	}

	for _, f := range r.File {
		name := filepath.Base(f.Name)
		if !allowed[name] {
			continue
		}
		src, err := f.Open()
		if err != nil {
			log.Printf("BLIS service cards v10: open %s: %v", name, err)
			continue
		}
		dst, err := os.Create(filepath.Join(outDir, name))
		if err != nil {
			src.Close()
			log.Printf("BLIS service cards v10: create %s: %v", name, err)
			continue
		}
		_, copyErr := io.Copy(dst, src)
		closeErr := dst.Close()
		src.Close()
		if copyErr != nil {
			log.Printf("BLIS service cards v10: copy %s: %v", name, copyErr)
		} else if closeErr != nil {
			log.Printf("BLIS service cards v10: close %s: %v", name, closeErr)
		}
	}
}

func applyApprovedServiceCardsV10(resp *http.Response) error {
	if resp == nil || resp.Request == nil {
		return nil
	}
	path := resp.Request.URL.Path
	if strings.HasPrefix(path, "/service-cards/") || path == "/navigator-commerce-approved-v10.js" || path == "/navigator-commerce-approved-v10.css" {
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		resp.Header.Set("Pragma", "no-cache")
		resp.Header.Set("Expires", "0")
		return nil
	}
	if path != "/dashboard.html" && path != "/services.html" {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	_ = resp.Body.Close()

	css := []byte(`<link rel="stylesheet" href="/navigator-commerce-approved-v10.css?v=20260824-final1" data-blis-approved-v10="1">`)
	js := []byte(`<script src="/navigator-commerce-approved-v10.js?v=20260824-final1" data-blis-approved-v10="1"></script>`)
	if !bytes.Contains(body, []byte("navigator-commerce-approved-v10.css")) {
		body = bytes.Replace(body, []byte("</head>"), append(css, []byte("</head>")...), 1)
	}
	if !bytes.Contains(body, []byte("navigator-commerce-approved-v10.js")) {
		body = bytes.Replace(body, []byte("</body>"), append(js, []byte("</body>")...), 1)
	}
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	resp.Header.Del("Content-Encoding")
	resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	resp.Header.Set("Pragma", "no-cache")
	resp.Header.Set("Expires", "0")
	return nil
}

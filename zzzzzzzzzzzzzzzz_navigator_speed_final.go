package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Final production speed pass. It runs after the canonical production hotfix
// and removes artificial paint delays without changing any page owner or data.
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
		return applyNavigatorSpeedFinal(resp)
	}
}

func applyNavigatorSpeedFinal(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Body == nil {
		return nil
	}
	path := resp.Request.URL.Path

	// The optimized production assets are versioned and browser-cacheable. Bump
	// the injected version so an already open Navigator cannot keep the slower
	// pre-optimization entrypoint for the cache window.
	if path == "/dashboard.html" {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()
		body = bytes.ReplaceAll(body, []byte("20260913-fastboot1"), []byte("20260913-fastboot2"))
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Set("X-BLIS-Navigator-Speed", "fastboot2")
		return nil
	}
	if path != "/navigator-production-entry-v1.js" {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	_ = resp.Body.Close()

	// Once the canonical visual is present there is no reason to keep a route
	// behind an artificial timer. This also prevents late chronology remounts from
	// putting an already visible page back into the pending state.
	body = bytes.ReplaceAll(body, []byte("Date.now()-started>=600"), []byte("Date.now()-started>=0"))
	body = bytes.ReplaceAll(body, []byte("root.classList.add('blis-route-pending');\n setTimeout(()=>settleRoute(id,token,Date.now()),50);"), []byte("if(finalShellReady()&&document.body?.dataset.blisLoading!=='true'){root.classList.remove('blis-route-pending');root.removeAttribute('data-blis-pending-route');return}\n root.classList.add('blis-route-pending');\n setTimeout(()=>settleRoute(id,token,Date.now()),0);"))
	body = bytes.ReplaceAll(body, []byte("setTimeout(()=>waitForFinalPaint(),120);"), []byte("setTimeout(()=>waitForFinalPaint(),20);"))
	body = bytes.ReplaceAll(body, []byte("setTimeout(()=>cover.remove(),120)"), []byte("setTimeout(()=>cover.remove(),40)"))

	// Start the dashboard request as soon as the small data loader is available,
	// while the visual modules continue loading in parallel.
	oldPrelude := []byte("await safe('/navigator-system-structure-v1.js');\n await safe('/navigator-perception-core-v8.js');await safe('/navigator-perception-map.js');await safe('/navigator-market-system-v1.js');\n await safe('/navigator-data-loader-v1.js');")
	newPrelude := []byte("const blisDataLoaderReady=safe('/navigator-data-loader-v1.js');await safe('/navigator-system-structure-v1.js');await blisDataLoaderReady;const blisInitialData=window.BLISDataLoaderV1?.load?.(initialClient,true);if(blisInitialData&&typeof blisInitialData.catch==='function')blisInitialData.catch(()=>{});\n await safe('/navigator-perception-core-v8.js');await safe('/navigator-perception-map.js');await safe('/navigator-market-system-v1.js');")
	body = bytes.Replace(body, oldPrelude, newPrelude, 1)
	oldLateLoad := []byte("const initialData=window.BLISDataLoaderV1?.load?.(initialClient,true);if(initialData&&typeof initialData.catch==='function')initialData.catch(()=>{});")
	body = bytes.Replace(body, oldLateLoad, nil, 1)

	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	resp.Header.Set("X-BLIS-Navigator-Speed", "route-immediate-early-data")
	return nil
}

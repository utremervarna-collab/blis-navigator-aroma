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
	if resp == nil || resp.Request == nil || resp.Body == nil || resp.Request.URL.Path != "/navigator-production-entry-v1.js" {
		return nil
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	_ = resp.Body.Close()

	// Navigation is synchronous once its canonical visual exists. The old 600ms
	// guard made every click feel slow even when the page was already ready.
	body = bytes.ReplaceAll(body, []byte("Date.now()-started>=600"), []byte("Date.now()-started>=120"))
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
	resp.Header.Set("X-BLIS-Navigator-Speed", "route-120ms-early-data")
	return nil
}

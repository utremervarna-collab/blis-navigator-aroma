package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
)

// This runtime shim preserves the restored Navigator code unchanged while
// providing stable human-friendly aliases for the dashboard entry point.
// The original application is moved to an internal loopback port and this
// proxy keeps the Render-provided public port.
func init() {
	publicPort := os.Getenv("PORT")
	if publicPort == "" {
		publicPort = "10000"
	}
	internalPort := "10001"
	if publicPort == internalPort {
		internalPort = "10002"
	}
	_ = os.Setenv("PORT", internalPort)

	target, _ := url.Parse("http://127.0.0.1:" + internalPort)
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		http.Error(w, "BLIS Navigator backend starting", http.StatusServiceUnavailable)
	}

	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/dashboard" || r.URL.Path == "/navigator" {
			r.URL.Path = "/dashboard.html"
		}
		proxy.ServeHTTP(w, r)
	})

	go func() {
		if err := http.ListenAndServe("0.0.0.0:"+publicPort, h); err != nil {
			log.Printf("BLIS alias proxy stopped: %v", err)
		}
	}()
}

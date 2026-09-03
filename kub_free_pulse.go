package main

import (
	"log"
	"sync"
	"time"
)

// The public keepalive endpoint is intentionally rate-limited. GitHub Actions
// can wake a sleeping Free instance and request an immediate KUB discovery
// pass, but arbitrary repeated requests cannot start an expensive collector
// more often than once every 45 seconds.
var (
	kubFreePulseMu   sync.Mutex
	kubFreePulseLast time.Time
)

func runKUBFreePulse() bool {
	now := time.Now()
	kubFreePulseMu.Lock()
	if !kubFreePulseLast.IsZero() && now.Sub(kubFreePulseLast) < 45*time.Second {
		kubFreePulseMu.Unlock()
		return false
	}
	kubFreePulseLast = now
	kubFreePulseMu.Unlock()

	runKUBRealtimeCollector()
	log.Printf("KUB_FREE_PULSE checked_at=%s", nowISO())
	return true
}

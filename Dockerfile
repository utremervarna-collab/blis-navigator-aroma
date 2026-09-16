FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
# The public web service must stay lightweight and continuously healthy.
# Multi-client refresh is already owned by BLIS Daily Engine in GitHub Actions;
# running the same network-heavy refresh cycle again inside the web container
# 30 seconds after boot can exhaust the runtime and remove it from the upstream
# pool. Keep the scheduler available only as an explicit opt-in.
RUN grep -q '^[[:space:]]*startEngineScheduler()[[:space:]]*$' main.go \
    && sed -i 's/^[[:space:]]*startEngineScheduler()[[:space:]]*$/\tif os.Getenv("BLIS_ENABLE_INPROCESS_SCHEDULER") == "1" { startEngineScheduler() }/' main.go \
    && grep -q 'BLIS_ENABLE_INPROCESS_SCHEDULER' main.go
# Signal collection is network-heavy and must not run as an embedded boot-time
# loop in the same process that serves the public Navigator. Keep all signal
# read/health/refresh API routes intact, but make the automatic 15-second boot
# poll and five-minute loop explicit opt-in.
RUN grep -q 'http.HandleFunc("/api/signals/health", signalHealthHandler)' signal_collector.go \
    && sed -i '/http.HandleFunc("\/api\/signals\/health", signalHealthHandler)/a\	if os.Getenv("BLIS_ENABLE_EMBEDDED_SIGNAL_COLLECTOR") != "1" { return }' signal_collector.go \
    && grep -q 'BLIS_ENABLE_EMBEDDED_SIGNAL_COLLECTOR' signal_collector.go
# Cold-start must bind the HTTP port as quickly as possible. The code.run
# runtime starts from the bundled live_store.json on an ephemeral DATA_DIR, so
# avoid holding both the complete file bytes and the decoded Store at once and
# do not immediately marshal the same multi-megabyte Store back to disk before
# ListenAndServe. Persistence restore runs after HTTP readiness and later
# mutations still use saveStore normally.
RUN sed -i '/Persisted public-data snapshot committed by the daily GitHub workflow\./,/^[[:space:]]*}/ { \
      s/if b, err := os.ReadFile(filepath.Join("data", "live_store.json")); err == nil {/if f, err := os.Open(filepath.Join("data", "live_store.json")); err == nil {/; \
      s/if json.Unmarshal(b, \&store) == nil \&\& len(store.Clients) > 0 {/if json.NewDecoder(f).Decode(\&store) == nil \&\& len(store.Clients) > 0 {/; \
      /^[[:space:]]*saveStore()[[:space:]]*$/d; \
    }' main.go \
    && sed -i '/if f, err := os.Open(filepath.Join("data", "live_store.json")); err == nil {/a\		defer f.Close()' main.go \
    && sed -n '/Persisted public-data snapshot committed by the daily GitHub workflow\./,/^[[:space:]]*}/p' main.go | grep -q 'json.NewDecoder(f).Decode(&store)' \
    && ! sed -n '/Persisted public-data snapshot committed by the daily GitHub workflow\./,/^[[:space:]]*}/p' main.go | grep -q 'saveStore()'
# In production, route through the memory-bounded runtime guard.
RUN grep -q 'http.ListenAndServe(addr, http.HandlerFunc(handler))' main.go \
    && sed -i 's/http.ListenAndServe(addr, http.HandlerFunc(handler))/http.ListenAndServe(addr, http.HandlerFunc(productionHandler))/' main.go \
    && grep -q 'http.HandlerFunc(productionHandler)' main.go
RUN CGO_ENABLED=0 GOOS=linux go build -tags netgo -ldflags '-s -w' -o /out/app .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /out/app /app/app
COPY --from=builder /src/data /app/data
ENV BLIS_ENABLE_INPROCESS_SCHEDULER=0
ENV BLIS_ENABLE_EMBEDDED_SIGNAL_COLLECTOR=0
# The full diagnostic remains available for CI/local runs but is intentionally
# disabled in the constrained public web container. It duplicates expensive
# dashboard calculations during the same cold-start window as persistence restore.
ENV BLIS_ENABLE_STARTUP_DIAGNOSTIC=0
# Ask Go to collect more aggressively so transient JSON allocations are released
# before they can push the instance out of the provider's healthy upstream pool.
ENV GOGC=50
LABEL blis.navigator.recovery="2026-09-16-http-ready-fast-bind-v2"
ENV PORT=8080
ENV DATA_DIR=/tmp/blis-navigator
EXPOSE 8080
CMD ["/app/app"]

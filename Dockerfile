FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
# The external gateway used to bind the public port immediately from init(),
# before main() had finished restoring the store and started the internal HTTP
# server. During that boot window the gateway was reachable but its upstream
# was not, producing the user-visible temporary-loading 503. Make the built
# production gateway wait for the internal listener before exposing the public
# port. This changes startup readiness only; client routing and KUB stay intact.
RUN apk add --no-cache python3 \
    && python3 - <<'PY'
from pathlib import Path
p = Path('/src/000_auth_gateway_resilient.go')
s = p.read_text()
old_import = '\t"log"\n\t"net/http"\n'
new_import = '\t"log"\n\t"net"\n\t"net/http"\n'
old_gateway = '''\tgo func() {
\t\tlog.Printf("BLIS Navigator gateway listening on 0.0.0.0:%s -> 127.0.0.1:%s", external, internal)
\t\tif err := http.ListenAndServe("0.0.0.0:"+external, http.HandlerFunc(navigatorGateway)); err != nil {
\t\t\tlog.Printf("BLIS Navigator gateway stopped: %v", err)
\t\t}
\t}()
'''
new_gateway = '''\tgo func() {
\t\tbackend := "127.0.0.1:" + internal
\t\tfor {
\t\t\tconn, err := net.DialTimeout("tcp", backend, 500*time.Millisecond)
\t\t\tif err == nil {
\t\t\t\t_ = conn.Close()
\t\t\t\tbreak
\t\t\t}
\t\t\ttime.Sleep(250 * time.Millisecond)
\t\t}
\t\tlog.Printf("BLIS Navigator gateway listening on 0.0.0.0:%s -> %s", external, backend)
\t\tif err := http.ListenAndServe("0.0.0.0:"+external, http.HandlerFunc(navigatorGateway)); err != nil {
\t\t\tlog.Printf("BLIS Navigator gateway stopped: %v", err)
\t\t}
\t}()
'''
if old_import not in s:
    raise SystemExit('gateway import anchor not found')
if old_gateway not in s:
    raise SystemExit('gateway startup block not found')
s = s.replace(old_import, new_import, 1)
s = s.replace(old_gateway, new_gateway, 1)
p.write_text(s)
PY
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
# poll and five-minute loop explicit opt-in. This protects every client route,
# including KUB, while preserving manual/external refresh capability.
RUN grep -q 'http.HandleFunc("/api/signals/health", signalHealthHandler)' signal_collector.go \
    && sed -i '/http.HandleFunc("\/api\/signals\/health", signalHealthHandler)/a\	if os.Getenv("BLIS_ENABLE_EMBEDDED_SIGNAL_COLLECTOR") != "1" { return }' signal_collector.go \
    && grep -q 'BLIS_ENABLE_EMBEDDED_SIGNAL_COLLECTOR' signal_collector.go
# In production, route through the runtime guard. It serves heavyweight store
# exports from the persisted snapshot under an independent lock instead of
# holding the live store mutex for the duration of a multi-megabyte response.
RUN grep -q 'http.ListenAndServe(addr, http.HandlerFunc(handler))' main.go \
    && sed -i 's/http.ListenAndServe(addr, http.HandlerFunc(handler))/http.ListenAndServe(addr, http.HandlerFunc(productionHandler))/' main.go \
    && grep -q 'http.HandlerFunc(productionHandler)' main.go
RUN CGO_ENABLED=0 GOOS=linux go build -tags netgo -ldflags '-s -w' -o /out/app .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /out/app /app/app
# The committed BLIS snapshot is the durable bootstrap source. The runtime
# keeps its writable working copy under /tmp, while every clean deployment
# restores from /app/data/live_store.json before accepting new refreshes.
COPY --from=builder /src/data /app/data
# Refresh cadence is externalized. Manual API refreshes remain available; only
# automatic in-process boot/background cycles are disabled in the web runtime.
ENV BLIS_ENABLE_INPROCESS_SCHEDULER=0
ENV BLIS_ENABLE_EMBEDDED_SIGNAL_COLLECTOR=0
# Recovery label intentionally changes the final runtime image digest so the
# existing production service replaces the unstable image without changing URL.
LABEL blis.navigator.recovery="2026-09-15-gateway-readiness-v3"
ENV PORT=8080
ENV DATA_DIR=/tmp/blis-navigator
EXPOSE 8080
CMD ["/app/app"]

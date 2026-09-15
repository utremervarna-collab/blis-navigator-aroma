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
# Refresh cadence is externalized to BLIS Daily Engine. Manual API refreshes
# remain available; only the automatic in-process boot cycle is disabled.
ENV BLIS_ENABLE_INPROCESS_SCHEDULER=0
# Recovery label intentionally changes the final runtime image digest so the
# existing production service replaces the unstable image without changing URL.
LABEL blis.navigator.recovery="2026-09-15-nonblocking-store-export"
ENV PORT=8080
ENV DATA_DIR=/tmp/blis-navigator
EXPOSE 8080
CMD ["/app/app"]

FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -tags netgo -ldflags '-s -w' -o /out/app .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /out/app /app/app
# The committed BLIS snapshot is the durable bootstrap source. The runtime
# keeps its writable working copy under /tmp, while every clean deployment
# restores from /app/data/live_store.json before accepting new refreshes.
COPY --from=builder /src/data /app/data
# Recovery label intentionally changes the final runtime image digest without
# changing application behavior. This forces the existing production service
# to replace an unhealthy upstream instead of reusing an identical image.
LABEL blis.navigator.recovery="2026-09-15-dashboard-upstream-1"
ENV PORT=8080
ENV DATA_DIR=/tmp/blis-navigator
EXPOSE 8080
CMD ["/app/app"]

# BLIS Navigator

Production repository for BLIS™ Navigator.

## Production

- Branch: `main`
- Public origin: `https://p01--blis-navigator-aroma--2rnk9hqsd2bc.code.run/`
- Health endpoint: `/api/health`
- Runtime: Go backend with embedded client interface
- Production deployment is triggered from `main`.

## Build

```bash
go build -tags netgo -ldflags '-s -w' -o app .
./app
```

## Architecture

BLIS™ Navigator serves client-specific intelligence views, APIs, monitoring, historical data and recurring analytical workflows from one canonical production codebase.

Production health, routing and persistence are validated through GitHub Actions. The daily intelligence engine and client-specific data flows are maintained against the same canonical production deployment.

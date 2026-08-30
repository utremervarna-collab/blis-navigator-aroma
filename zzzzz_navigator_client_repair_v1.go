package main

// Legacy V15 dashboard assembly is retired.
// The canonical production entrypoint and router are now the sole owners of
// client-facing Navigator UI. Keep this helper as a no-op only for source
// compatibility with any older code that may still reference it.
func assembleNavigatorDashboard(body []byte) []byte {
	return body
}

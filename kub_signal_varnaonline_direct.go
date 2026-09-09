package main

// Varna Online is a relevant regional publisher for the KUB / Baba Alino crisis.
// Keep it in the direct-watch registry so new regional coverage can be discovered
// without waiting for a search-engine result to promote the domain dynamically.
func init() {
	kubDirectSeedPublishers = append(kubDirectSeedPublishers, struct {
		Label string
		Root  string
	}{
		Label: "Varna Online",
		Root:  "https://varnaonline.bg/",
	})
}

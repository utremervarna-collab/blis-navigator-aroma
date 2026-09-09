package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

const runtimeDataSnapshotURL = "https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/runtime-data/data/live_store.json"

func storeDurabilityWeight(s Store) (snapshots int, observations int) {
	for _, c := range s.Clients {
		if c == nil {
			continue
		}
		snapshots += len(c.Snapshots)
		observations += len(c.Observations)
	}
	return
}

func runtimeSnapshotValid(s Store) bool {
	if len(s.Clients) == 0 {
		return false
	}
	for _, slug := range []string{"aroma", "bolyarka", "mollox", "astor-garden"} {
		if s.Clients[slug] == nil {
			return false
		}
	}
	return true
}

func restoreLatestRuntimeSnapshot() {
	// main.ensureStore() initializes dataPath synchronously. Wait briefly rather
	// than racing it from init-time goroutines.
	for i := 0; i < 50 && dataPath == ""; i++ {
		time.Sleep(20 * time.Millisecond)
	}
	if dataPath == "" {
		return
	}

	client := &http.Client{Timeout: 12 * time.Second}
	req, err := http.NewRequest(http.MethodGet, runtimeDataSnapshotURL+"?ts="+time.Now().UTC().Format("20060102150405"), nil)
	if err != nil {
		return
	}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("RUNTIME_DATA_RESTORE unavailable err=%v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		log.Printf("RUNTIME_DATA_RESTORE status=%d", resp.StatusCode)
		return
	}

	var remote Store
	if err := json.NewDecoder(resp.Body).Decode(&remote); err != nil || !runtimeSnapshotValid(remote) {
		log.Printf("RUNTIME_DATA_RESTORE invalid err=%v", err)
		return
	}

	mu.Lock()
	localSnapshots, localObservations := storeDurabilityWeight(store)
	remoteSnapshots, remoteObservations := storeDurabilityWeight(remote)
	// Never replace a running store with an older/smaller snapshot. Prefer the
	// remote branch only when it is at least as complete and strictly newer by
	// one of the durable counters.
	useRemote := remoteObservations >= localObservations && remoteSnapshots >= localSnapshots &&
		(remoteObservations > localObservations || remoteSnapshots > localSnapshots || store.Clients["kub"] == nil && remote.Clients["kub"] != nil)
	if useRemote {
		store = remote
	}
	mu.Unlock()

	if useRemote {
		saveStore()
		log.Printf("RUNTIME_DATA_RESTORE ok snapshots=%d observations=%d", remoteSnapshots, remoteObservations)
	}
}

func init() {
	go func() {
		// Restore before the first delayed KUB discovery pass whenever possible.
		time.Sleep(80 * time.Millisecond)
		restoreLatestRuntimeSnapshot()
	}()
}

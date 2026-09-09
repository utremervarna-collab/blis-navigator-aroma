package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

const runtimeDataSnapshotURL = "https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/runtime-data/data/live_store.json"

type runtimeDataRestoreStatus struct {
	Attempted             bool   `json:"attempted"`
	Applied               bool   `json:"applied"`
	Reason                string `json:"reason"`
	RemoteSnapshots       int    `json:"remote_snapshots"`
	RemoteObservations    int    `json:"remote_observations"`
	KUBSignalObservations int    `json:"kub_signal_observations"`
	RestoredAt            string `json:"restored_at,omitempty"`
}

var (
	runtimeRestoreMu sync.RWMutex
	runtimeRestore   = runtimeDataRestoreStatus{Reason: "not_attempted"}
)

func setRuntimeRestoreStatus(s runtimeDataRestoreStatus) {
	runtimeRestoreMu.Lock()
	runtimeRestore = s
	runtimeRestoreMu.Unlock()
}

func getRuntimeRestoreStatus() runtimeDataRestoreStatus {
	runtimeRestoreMu.RLock()
	s := runtimeRestore
	runtimeRestoreMu.RUnlock()
	return s
}

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

func kubSignalObservationCount(s Store) int {
	c := s.Clients["kub"]
	if c == nil {
		return 0
	}
	n := 0
	for _, o := range c.Observations {
		if o.SourceKey == "signal_collector" && strings.HasPrefix(o.MetricKey, "signal_event_") {
			n++
		}
	}
	return n
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
	status := runtimeDataRestoreStatus{Attempted: true, Reason: "starting"}
	setRuntimeRestoreStatus(status)

	// main.ensureStore() initializes dataPath synchronously. Wait briefly rather
	// than racing it from init-time goroutines.
	for i := 0; i < 50 && dataPath == ""; i++ {
		time.Sleep(20 * time.Millisecond)
	}
	if dataPath == "" {
		status.Reason = "data_path_unavailable"
		setRuntimeRestoreStatus(status)
		return
	}

	client := &http.Client{Timeout: 12 * time.Second}
	req, err := http.NewRequest(http.MethodGet, runtimeDataSnapshotURL+"?ts="+time.Now().UTC().Format("20060102150405"), nil)
	if err != nil {
		status.Reason = "request_build_failed"
		setRuntimeRestoreStatus(status)
		return
	}
	resp, err := client.Do(req)
	if err != nil {
		status.Reason = "snapshot_unavailable"
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE unavailable err=%v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		status.Reason = "snapshot_http_status"
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE status=%d", resp.StatusCode)
		return
	}

	var remote Store
	if err := json.NewDecoder(resp.Body).Decode(&remote); err != nil || !runtimeSnapshotValid(remote) {
		status.Reason = "snapshot_invalid"
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE invalid err=%v", err)
		return
	}

	remoteSnapshots, remoteObservations := storeDurabilityWeight(remote)
	status.RemoteSnapshots = remoteSnapshots
	status.RemoteObservations = remoteObservations
	status.KUBSignalObservations = kubSignalObservationCount(remote)

	mu.Lock()
	localSnapshots, localObservations := storeDurabilityWeight(store)
	// Never replace a running store with an older/smaller snapshot. Prefer the
	// remote branch only when it is at least as complete and strictly newer by
	// one of the durable counters, or when it contributes the durable KUB record.
	useRemote := remoteObservations >= localObservations && remoteSnapshots >= localSnapshots &&
		(remoteObservations > localObservations || remoteSnapshots > localSnapshots || (store.Clients["kub"] == nil && remote.Clients["kub"] != nil))
	if useRemote {
		store = remote
	}
	mu.Unlock()

	if useRemote {
		saveStore()
		status.Applied = true
		status.Reason = "remote_snapshot_applied"
		status.RestoredAt = nowISO()
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE ok snapshots=%d observations=%d kub_signals=%d", remoteSnapshots, remoteObservations, status.KUBSignalObservations)
		return
	}

	status.Reason = "local_store_equal_or_newer"
	setRuntimeRestoreStatus(status)
}

func runtimeDataStatusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	_ = json.NewEncoder(w).Encode(getRuntimeRestoreStatus())
}

func init() {
	http.HandleFunc("/api/runtime-data/status", runtimeDataStatusHandler)
	go func() {
		// Restore before the first delayed KUB discovery pass whenever possible.
		time.Sleep(80 * time.Millisecond)
		restoreLatestRuntimeSnapshot()
	}()
}

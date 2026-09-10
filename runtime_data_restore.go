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

func isKUBSignalObservation(o Observation) bool {
	return o.SourceKey == "signal_collector" && strings.HasPrefix(o.MetricKey, "signal_event_")
}

func kubSignalObservationCount(s Store) int {
	c := s.Clients["kub"]
	if c == nil {
		return 0
	}
	n := 0
	for _, o := range c.Observations {
		if isKUBSignalObservation(o) {
			n++
		}
	}
	return n
}

// mergeKUBPersistenceClients returns a copy of preferred that contains the union
// of durable KUB signal observations from both stores. Non-signal observations
// remain owned by preferred. This prevents a restore from ever rolling the KUB
// crisis timeline back merely because another client has more observations.
func mergeKUBPersistenceClients(preferred, other *Client) (*Client, int) {
	if preferred == nil && other == nil {
		return nil, 0
	}
	if preferred == nil {
		clone := *other
		clone.Observations = append([]Observation(nil), other.Observations...)
		return &clone, kubSignalObservationCount(Store{Clients: map[string]*Client{"kub": &clone}})
	}

	clone := *preferred
	clone.Observations = append([]Observation(nil), preferred.Observations...)
	seen := make(map[string]struct{}, len(clone.Observations))
	for _, o := range clone.Observations {
		if isKUBSignalObservation(o) {
			seen[o.MetricKey] = struct{}{}
		}
	}

	added := 0
	if other != nil {
		for _, o := range other.Observations {
			if !isKUBSignalObservation(o) {
				continue
			}
			if _, ok := seen[o.MetricKey]; ok {
				continue
			}
			clone.Observations = append(clone.Observations, o)
			seen[o.MetricKey] = struct{}{}
			added++
		}
	}
	return &clone, added
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

	mu.Lock()
	localSnapshots, localObservations := storeDurabilityWeight(store)
	localKUBCount := kubSignalObservationCount(store)
	remoteKUBCount := kubSignalObservationCount(remote)

	// Keep the existing whole-store preference rule, but make KUB non-regressive:
	// whichever whole store wins receives the union of KUB signal observations.
	useRemote := remoteObservations >= localObservations && remoteSnapshots >= localSnapshots &&
		(remoteObservations > localObservations || remoteSnapshots > localSnapshots || (store.Clients["kub"] == nil && remote.Clients["kub"] != nil))

	kubMerged := false
	if useRemote {
		merged, added := mergeKUBPersistenceClients(remote.Clients["kub"], store.Clients["kub"])
		if merged != nil {
			if remote.Clients == nil {
				remote.Clients = map[string]*Client{}
			}
			remote.Clients["kub"] = merged
		}
		kubMerged = added > 0 || remoteKUBCount < localKUBCount
		store = remote
	} else {
		merged, added := mergeKUBPersistenceClients(store.Clients["kub"], remote.Clients["kub"])
		if merged != nil {
			if store.Clients == nil {
				store.Clients = map[string]*Client{}
			}
			store.Clients["kub"] = merged
		}
		kubMerged = added > 0 || localKUBCount < remoteKUBCount
	}
	status.KUBSignalObservations = kubSignalObservationCount(store)
	mu.Unlock()

	if useRemote || kubMerged {
		saveStore()
	}
	if useRemote {
		status.Applied = true
		status.Reason = "remote_snapshot_applied_kub_merged"
		status.RestoredAt = nowISO()
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE ok snapshots=%d observations=%d kub_signals=%d", remoteSnapshots, remoteObservations, status.KUBSignalObservations)
		return
	}
	if kubMerged {
		status.Applied = true
		status.Reason = "local_store_kept_kub_history_merged"
		status.RestoredAt = nowISO()
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE local store kept; KUB history merged kub_signals=%d", status.KUBSignalObservations)
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

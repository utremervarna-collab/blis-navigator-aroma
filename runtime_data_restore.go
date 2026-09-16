package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

const runtimeDataSnapshotURL = "https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/runtime-data/data/live_store.json"
const runtimeDataSnapshotLimit = int64(64 << 20)

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

func clonePersistenceClient(c *Client) *Client {
	if c == nil {
		return nil
	}
	clone := *c
	clone.Observations = append([]Observation(nil), c.Observations...)
	return &clone
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

// walkRuntimeSnapshot decodes one client at a time. The previous restore decoded
// the entire multi-megabyte snapshot into a second Store while the live Store was
// still resident, then marshalled the whole result again. On constrained web
// containers that transient duplication can exhaust memory and remove the
// instance from the upstream pool. Streaming keeps peak memory bounded to one
// decoded client plus the live store.
func walkRuntimeSnapshot(path string, fn func(string, *Client) error) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	dec := json.NewDecoder(f)
	tok, err := dec.Token()
	if err != nil {
		return err
	}
	if delim, ok := tok.(json.Delim); !ok || delim != '{' {
		return fmt.Errorf("runtime snapshot root is not an object")
	}

	foundClients := false
	for dec.More() {
		keyToken, err := dec.Token()
		if err != nil {
			return err
		}
		key, ok := keyToken.(string)
		if !ok {
			return fmt.Errorf("runtime snapshot has invalid key token")
		}
		if key != "clients" {
			var discard json.RawMessage
			if err := dec.Decode(&discard); err != nil {
				return err
			}
			continue
		}

		foundClients = true
		tok, err := dec.Token()
		if err != nil {
			return err
		}
		if delim, ok := tok.(json.Delim); !ok || delim != '{' {
			return fmt.Errorf("runtime snapshot clients is not an object")
		}
		for dec.More() {
			slugToken, err := dec.Token()
			if err != nil {
				return err
			}
			slug, ok := slugToken.(string)
			if !ok || strings.TrimSpace(slug) == "" {
				return fmt.Errorf("runtime snapshot has invalid client key")
			}
			var c Client
			if err := dec.Decode(&c); err != nil {
				return err
			}
			if c.Slug == "" {
				c.Slug = slug
			}
			if err := fn(slug, &c); err != nil {
				return err
			}
		}
		if _, err := dec.Token(); err != nil {
			return err
		}
	}
	if _, err := dec.Token(); err != nil {
		return err
	}
	if !foundClients {
		return fmt.Errorf("runtime snapshot has no clients object")
	}
	return nil
}

func restoreLatestRuntimeSnapshot() {
	status := runtimeDataRestoreStatus{Attempted: true, Reason: "starting"}
	setRuntimeRestoreStatus(status)

	for i := 0; i < 50 && dataPath == ""; i++ {
		time.Sleep(20 * time.Millisecond)
	}
	if dataPath == "" {
		status.Reason = "data_path_unavailable"
		setRuntimeRestoreStatus(status)
		return
	}

	client := &http.Client{Timeout: 20 * time.Second}
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

	if err := os.MkdirAll(filepath.Dir(dataPath), 0755); err != nil {
		status.Reason = "snapshot_temp_dir_failed"
		setRuntimeRestoreStatus(status)
		return
	}
	tmp, err := os.CreateTemp(filepath.Dir(dataPath), "runtime-restore-*.json")
	if err != nil {
		status.Reason = "snapshot_temp_failed"
		setRuntimeRestoreStatus(status)
		return
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)

	n, copyErr := io.Copy(tmp, io.LimitReader(resp.Body, runtimeDataSnapshotLimit+1))
	closeErr := tmp.Close()
	if copyErr != nil || closeErr != nil || n == 0 || n > runtimeDataSnapshotLimit {
		status.Reason = "snapshot_download_invalid"
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE download invalid bytes=%d copyErr=%v closeErr=%v", n, copyErr, closeErr)
		return
	}

	required := map[string]bool{"aroma": false, "bolyarka": false, "mollox": false, "astor-garden": false}
	remoteSnapshots := 0
	remoteObservations := 0
	remoteKUBCount := 0
	var remoteKUB *Client
	err = walkRuntimeSnapshot(tmpPath, func(slug string, c *Client) error {
		remoteSnapshots += len(c.Snapshots)
		remoteObservations += len(c.Observations)
		if _, ok := required[slug]; ok {
			required[slug] = true
		}
		if slug == "kub" {
			remoteKUB = clonePersistenceClient(c)
			remoteKUBCount = kubSignalObservationCount(Store{Clients: map[string]*Client{"kub": remoteKUB}})
		}
		return nil
	})
	if err != nil {
		status.Reason = "snapshot_invalid"
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE invalid err=%v", err)
		return
	}
	for slug, seen := range required {
		if !seen {
			status.Reason = "snapshot_invalid"
			setRuntimeRestoreStatus(status)
			log.Printf("RUNTIME_DATA_RESTORE missing required client=%s", slug)
			return
		}
	}

	status.RemoteSnapshots = remoteSnapshots
	status.RemoteObservations = remoteObservations

	mu.Lock()
	localSnapshots, localObservations := storeDurabilityWeight(store)
	localKUB := clonePersistenceClient(store.Clients["kub"])
	localKUBCount := kubSignalObservationCount(Store{Clients: map[string]*Client{"kub": localKUB}})
	mu.Unlock()

	useRemote := remoteObservations >= localObservations && remoteSnapshots >= localSnapshots &&
		(remoteObservations > localObservations || remoteSnapshots > localSnapshots || (localKUB == nil && remoteKUB != nil))

	kubMerged := false
	if useRemote {
		applied := 0
		err = walkRuntimeSnapshot(tmpPath, func(slug string, c *Client) error {
			chosen := c
			if slug == "kub" {
				merged, added := mergeKUBPersistenceClients(c, localKUB)
				if merged != nil {
					chosen = merged
				}
				kubMerged = added > 0 || remoteKUBCount < localKUBCount
			}
			mu.Lock()
			if store.Clients == nil {
				store.Clients = map[string]*Client{}
			}
			store.Clients[slug] = chosen
			mu.Unlock()
			applied++
			if applied%2 == 0 {
				runtime.GC()
			}
			return nil
		})
		if err != nil {
			status.Reason = "snapshot_apply_failed"
			setRuntimeRestoreStatus(status)
			log.Printf("RUNTIME_DATA_RESTORE apply failed err=%v", err)
			return
		}
	} else if remoteKUB != nil {
		mu.Lock()
		merged, added := mergeKUBPersistenceClients(store.Clients["kub"], remoteKUB)
		if merged != nil {
			if store.Clients == nil {
				store.Clients = map[string]*Client{}
			}
			store.Clients["kub"] = merged
		}
		kubMerged = added > 0 || localKUBCount < remoteKUBCount
		mu.Unlock()
	}

	mu.Lock()
	status.KUBSignalObservations = kubSignalObservationCount(store)
	mu.Unlock()

	// Do not immediately marshal the complete store again here. Production export
	// streams the live store through a temporary file, and later intentional data
	// mutations persist through the normal save path. Avoiding a second full-store
	// marshal is what keeps cold-start memory bounded.
	if useRemote {
		status.Applied = true
		status.Reason = "remote_snapshot_applied_streaming_kub_merged"
		status.RestoredAt = nowISO()
		setRuntimeRestoreStatus(status)
		log.Printf("RUNTIME_DATA_RESTORE ok streaming snapshots=%d observations=%d kub_signals=%d", remoteSnapshots, remoteObservations, status.KUBSignalObservations)
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
		time.Sleep(80 * time.Millisecond)
		restoreLatestRuntimeSnapshot()
	}()
}

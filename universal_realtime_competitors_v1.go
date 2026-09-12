package main

import (
	"log"
	"sync"
	"time"
)

// Universal realtime competitor mentions extends the fast KUB-style discovery
// principle to every real client profile. The broad web/social collectors still
// run on their bounded cycle; this lane checks Google News frequently so a new
// competitor mention can reach Navigator without waiting for the full pass.
const universalRealtimeCompetitorInterval = 60 * time.Second

type universalCompetitorTask struct {
	client *Client
	target competitorSignalTarget
}

type universalCompetitorResult struct {
	slug string
	rows []Signal
}

func universalRealtimeCompetitorTasks() []universalCompetitorTask {
	out := []universalCompetitorTask{}
	for _, c := range universalRealtimeClients() {
		for _, target := range competitorSignalTargets(c) {
			out = append(out, universalCompetitorTask{client: c, target: target})
		}
	}
	return out
}

func runUniversalRealtimeCompetitorCycle() {
	// A competitor pass is guaranteed to run once scheduled. Other broad signal
	// cycles use TryLock and will simply yield while this bounded pass is active.
	continuousMonitoringMu.Lock()
	defer continuousMonitoringMu.Unlock()

	restoreSignalsFromObservations()
	tasks := universalRealtimeCompetitorTasks()
	if len(tasks) == 0 {
		return
	}

	// Bound upstream concurrency. This gives fast discovery without reproducing
	// the intermittent 503 pressure that an unbounded all-client sweep can cause.
	sem := make(chan struct{}, 4)
	results := make(chan universalCompetitorResult, len(tasks))
	var wg sync.WaitGroup
	for _, task := range tasks {
		t := task
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			rows := collectCompetitorNews(t.client, t.target)
			<-sem
			results <- universalCompetitorResult{slug: t.client.Slug, rows: rows}
		}()
	}
	wg.Wait()
	close(results)

	byClient := map[string][]Signal{}
	for result := range results {
		byClient[result.slug] = append(byClient[result.slug], result.rows...)
	}

	totalFresh, totalNew := 0, 0
	for slug, rows := range byClient {
		rows = dedupeCompetitorSignals(rows)
		if len(rows) == 0 {
			continue
		}
		totalFresh += len(rows)
		totalNew += mergeSignals(slug, rows)
	}
	sanitizeKnownSignalFalsePositives()
	saveSignalStateFile()
	saveStore()
	log.Printf("BLIS_COMPETITOR_REALTIME tasks=%d fresh=%d new=%d", len(tasks), totalFresh, totalNew)
}

func init() {
	go func() {
		// Let the fast brand lane finish its cold-start pass first, then begin a
		// separate competitor stream. Sleep after each pass to avoid ticker backlog.
		time.Sleep(20 * time.Second)
		for {
			runUniversalRealtimeCompetitorCycle()
			time.Sleep(universalRealtimeCompetitorInterval)
		}
	}()
}

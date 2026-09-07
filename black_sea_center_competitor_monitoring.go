package main

import "time"

func runBlackSeaCenterCompetitorMonitoring() {
	c := signalClientSnapshot(blackSeaCenterSlug)
	if c == nil {
		return
	}
	all := []Signal{}
	for _, target := range competitorSignalTargets(c) {
		rows := []Signal{}
		rows = append(rows, collectCompetitorNews(c, target)...)
		rows = append(rows, collectCompetitorWeb(c, target)...)
		rows = append(rows, collectCompetitorSocial(c, target)...)
		all = append(all, dedupeCompetitorSignals(rows)...)
	}
	all = dedupeCompetitorSignals(all)
	if len(all) > 0 {
		mergeSignals(blackSeaCenterSlug, all)
	}
	saveSignalStateFile()
	saveStore()
}

func init() {
	go func() {
		time.Sleep(2 * time.Minute)
		runBlackSeaCenterCompetitorMonitoring()
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			runBlackSeaCenterCompetitorMonitoring()
		}
	}()
}

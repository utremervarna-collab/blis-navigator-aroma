package main

import "time"

// Verified KUB public-development signal discovered on 2026-09-10.
// The source event was published by BTA on 2026-09-09. Metric values are derived
// exclusively by the existing KUB classifier; no scores or percentages are seeded.
func init() {
	go func() {
		time.Sleep(3 * time.Second)
		if s, ok := buildKUBSignal(
			"БТА",
			"news",
			"https://www.bta.bg/bg/news/1200403-parlamentat-othvarli-dve-iskaniya-na-vazrazhdane-za-izslushvaniya-otnosno-rast",
			"Парламентът отхвърли искане за изслушване относно корпорация КУБ",
			"БТА съобщава, че Народното събрание е отхвърлило предложение на Коста Стоянов за изслушване на председателя на ДАНС относно твърдения за дейността на КУБ и нейния собственик Олег Невзоров. Сигналът е политическо и институционално развитие, пряко свързано с кризисния профил КУБ.",
			"2026-09-09T09:31:00+03:00",
		); ok {
			mergeSignals("kub", []Signal{s})
			saveSignalStateFile()
		}
	}()
}

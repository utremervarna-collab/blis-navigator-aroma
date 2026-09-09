package main

import "time"

// Verified KUB development published on 2026-09-09.
// Durable evidence seed for the KUB profile only; no manual metric values are injected.
func init() {
	go func() {
		time.Sleep(3 * time.Second)
		fresh := []Signal{
			kubSeedSignal(
				"БНТ",
				"https://bntnews.bg/news/varnenskiyat-administrativen-sad-prekrati-deloto-sreshtu-zadalzhitelnoto-predpisanie-za-spirane-na-toka-v-baba-alino-1411599news.html",
				"Варненският административен съд прекрати делото срещу предписанието за спиране на тока в „Баба Алино“",
				"Административният съд – Варна прекратява делото по жалбата срещу задължителното предписание за спиране на електрозахранването към обекти във Forest Club / „Баба Алино“. Развитието е правен и кризисен сигнал с пряко значение за профила КУБ.",
				"2026-09-09T14:58:00+03:00",
				99,
			),
		}
		mergeSignals("kub", fresh)
		saveSignalStateFile()
	}()
}

package main

import "time"

// Verified current development supplied from the original publisher URL. This is
// a durable evidence seed, not publisher-specific monitoring logic; discovery of
// future items is handled by the generic direct-publisher watcher.
func init() {
	go func() {
		time.Sleep(3 * time.Second)
		fresh := []Signal{
			kubSeedSignal(
				"БНТ",
				"https://bntnews.bg/news/spirat-vodata-v-nezakonniya-kompleks-baba-alino-1410692news.html",
				"Спират водата в незаконния комплекс „Баба Алино“",
				"БНТ съобщава, че водоподаването е спряно към пет едноетажни постройки в местността „Баба Алино“ в изпълнение на заповед на Община Варна; материалът описва установено незаконно водно отклонение и действия на ВиК-Варна.",
				"2026-09-03T12:10:00+03:00",
				98,
			),
		}
		mergeSignals("kub", fresh)
		saveSignalStateFile()
	}()
}

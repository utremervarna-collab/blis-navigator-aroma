package main

import "time"

// Verified current developments supplied from original publisher URLs. These are
// durable evidence seeds, not publisher-specific monitoring logic; discovery of
// future items is handled by the generic direct-publisher watcher.
func init() {
	go func() {
		time.Sleep(3 * time.Second)
		fresh := []Signal{
			kubSeedSignal(
				"EraNova",
				"https://www.eranova.bg/spirat-vodata-na-nezakonnite-postroyki-v-mestnostta-baba-alino-kray-varna-30186",
				"Спират водата на незаконните постройки в местността „Баба Алино“ край Варна",
				"EraNova съобщава за акция по прекъсване на водоснабдяването на пет постройки в „Баба Алино“ и за последващи действия по незаконните присъединявания към мрежите.",
				"2026-09-03T12:43:00+03:00",
				96,
			),
			kubSeedSignal(
				"News.bg",
				"https://news.bg/regions/spryaha-vodata-kam-pet-nezakonni-sgradi-v-baba-alino.html",
				"Спряха водата към пет незаконни сгради в „Баба Алино“",
				"News.bg съобщава, че на 3 септември е спряно водоподаването към пет постройки в „Баба Алино“ и проследява изпълнението на действията на Община Варна.",
				"2026-09-03T12:37:00+03:00",
				98,
			),
			kubSeedSignal(
				"БГНЕС",
				"https://www.bgnes.bg/vik-spira-vodata-na-pet-nezakonni-postroyki-v-baba-alino",
				"ВиК спира водата на пет незаконни постройки в „Баба Алино“",
				"БГНЕС съобщава за действия на ВиК по прекъсване на водата и посочва, че общият брой на подписаните заповеди за премахване на незаконни строежи достига 19.",
				"2026-09-03T12:27:00+03:00",
				98,
			),
			kubSeedSignal(
				"VarnaUtre.bg",
				"https://varnautre.bg/2026/09/03/652870-vik_spira_vodata_na_pet_nezakonni_postroyki_v_baba_alino_video",
				"ВиК спира водата на пет незаконни постройки в „Баба Алино“",
				"VarnaUtre.bg съобщава за започналото на 3 септември прекъсване на водоснабдяването и свързва развитието с отказа на съда за незабавно възстановяване на електрозахранването.",
				"2026-09-03T12:13:00+03:00",
				98,
			),
			kubSeedSignal(
				"БНТ",
				"https://bntnews.bg/news/spirat-vodata-v-nezakonniya-kompleks-baba-alino-1410692news.html",
				"Спират водата в незаконния комплекс „Баба Алино“",
				"БНТ съобщава, че водоподаването е спряно към пет едноетажни постройки в местността „Баба Алино“; материалът описва действията на ВиК-Варна и изпълнението на заповедта на Община Варна.",
				"2026-09-03T12:10:00+03:00",
				98,
			),
			kubSeedSignal(
				"Евроком",
				"https://eurocom.bg/2026/09/03/vik-varna-sprya-vodata-na-chast-ot-baba-alino-predstoi-zapechatvane-na-sgradi/",
				"ВиК-Варна спря водата на част от „Баба Алино“, предстои запечатване на сгради",
				"Евроком съобщава за прекъснато водоподаване към част от комплекса и за предстоящо ограничаване на достъпа до засегнатите сгради.",
				"2026-09-03T12:05:00+03:00",
				97,
			),
			kubSeedSignal(
				"Varna24",
				"https://www.varna24.bg/novini/varna/Ogranichavat-dostupa-do-obitavani-sgradi-v-Baba-Alino-predstoi-da-budat-zapechatani-3019608",
				"Ограничават достъпа до обитавани сгради в „Баба Алино“ – предстои да бъдат запечатани",
				"Varna24 отразява заявеното ограничаване на достъпа и предстоящото запечатване на част от сградите след прекъсване на електрозахранването и водоснабдяването.",
				"2026-09-03T09:20:00+03:00",
				96,
			),
		}
		mergeSignals("kub", fresh)
		saveSignalStateFile()
	}()
}

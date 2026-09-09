package main

import "time"

// Verified public development: Forest Club / Baba Alino owners requested an
// urgent meeting with the Mayor of Varna and a joint working group. This is
// stored only in the KUB client signal stream. No synthetic metric values are
// introduced here; downstream history/curves must derive from the real signal.
func init() {
	go func() {
		time.Sleep(3 * time.Second)
		fresh := []Signal{
			kubSeedSignal(
				"БТА",
				"https://www.bta.bg/bg/news/bulgaria/1199567-zhitelite-na-forest-klub-v-mestnostta-baba-alino-iskat-sreshta-s-kmeta-na-varn",
				"Жителите на Forest Club в местността „Баба Алино“ искат среща с кмета на Варна",
				"Собственици и жители на Forest Club в местността „Баба Алино“ настояват за спешна лична среща с кмета на Варна и за създаване на работна група с общината, институции, юристи и представители на собствениците. Обръщението е разпространено чрез пресцентъра на Корпорация КУБ и представлява високоприоритетно институционално и репутационно развитие по кризата.",
				"2026-09-07T20:12:00+03:00",
				99,
			),
		}
		mergeSignals("kub", fresh)
		saveSignalStateFile()
	}()
}

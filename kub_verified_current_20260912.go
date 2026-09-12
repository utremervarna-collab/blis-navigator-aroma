package main

import "time"

// Verified public KUB / Baba Alino developments added on Sep 12.
// Existing Sep 8-10 items remain in kub_verified_current_20260911.go.
// These are evidence seeds only: the canonical KUB classifier derives risk,
// severity and relevance; no manual metric values are injected here.
func init() {
	go func() {
		time.Sleep(5 * time.Second)
		ensureKUBSignalPersistenceClient()

		items := []struct {
			source, sourceType, url, title, text, published string
		}{
			{
				"БТА", "news",
				"https://www.bta.bg/bg/news/bulgaria/regional-news/oblast-varna/1197401--vik-varna-ood-sprya-vodata-na-pet-sgradi-v-mestnostta-baba-alino",
				"„ВиК – Варна“ ООД спря водата на пет сгради в местността Баба Алино",
				"БТА съобщава, че на 3 септември „ВиК – Варна“ е прекъснало водоснабдяването на пет сгради в местността „Баба Алино“ на база заповед на кмета на Варна. Развитието следва предходното прекъсване на електрозахранването и е част от последователните административни действия по казуса.",
				"2026-09-03T13:14:00+03:00",
			},
			{
				"БТА", "news",
				"https://www.bta.bg/bg/news/bulgaria/regional-news/varna/1198286-sadat-vav-varna-ostavi-bez-uvazhenie-iskaneto-za-spirane-na-izpalnenieto-na-zapo",
				"Съдът във Варна остави без уважение искането за спиране на изпълнението на заповедта за тока и водата в Баба Алино",
				"Административният съд – Варна оставя без уважение искането на „Форест клуб Варна“ ООД за спиране на изпълнението на заповедта в частта за прекъсване на електроснабдяването и водоподаването. Решението е ключово за институционалната и правната динамика около „Баба Алино“.",
				"2026-09-04T14:55:00+03:00",
			},
			{
				"Радио Варна / БНР", "news",
				"https://bnrnews.bg/varna/post/526983/baba-alino-i-balgarskoto-chernomorie-v-tsentara-na-arhitekturna-diskusiya-vav-varna",
				"Баба Алино и Българското Черноморие в центъра на архитектурна дискусия във Варна",
				"Радио Варна включва казуса „Баба Алино“ в професионалната дискусия „Архитектът и морето“, посветена на устройството на крайбрежните територии и баланса между обществения и инвестиционния интерес. Това разширява темата от текущ административен спор към професионален и обществен дебат.",
				"2026-09-11T10:10:00+03:00",
			},
			{
				"Радио Варна / БНР", "news",
				"https://bnrnews.bg/main/post/527204/zabraniha-dostapa-do-pet-nezakonni-stroezha-v-mestnostta-baba-alino",
				"Забраниха достъпа до пет незаконни строежа в местността Баба Алино",
				"Служители на Община Варна са запечатали на място пет строежа в „Баба Алино“ и е наложена забрана за достъп. Според публикацията при многократните проверки в сградите не са установени хора, а Общината и „Общинска полиция“ ще следят за спазване на забраната. Това е преминаване от прекъсване на комунални услуги към физическо ограничаване на достъпа до обектите.",
				"2026-09-11T14:22:00+03:00",
			},
		}

		fresh := make([]Signal, 0, len(items))
		for _, it := range items {
			if s, ok := buildKUBSignal(it.source, it.sourceType, it.url, it.title, it.text, it.published); ok {
				fresh = append(fresh, s)
			}
		}
		if len(fresh) > 0 {
			mergeSignals("kub", fresh)
			saveSignalStateFile()
			saveStore()
		}
	}()
}

package main

import "time"

// Verified same-day publications discovered after 10:30 EEST on 02.09.2026.
// These are kept as separate media mentions even when they cover the same
// underlying event, because the KUB monitoring view is intended to expose
// media propagation as well as unique developments.
func kubAfternoonVerifiedSignals() []Signal {
	return []Signal{
		kubSeedSignal("Евроком", "https://eurocom.bg/video/nezakonnoto-selishte-baba-alino-stroitelstvoto-prodalzhava-tokat-ne-e-napalno-spryan/", "Евроком: Строителството в „Баба Алино“ продължава, токът не е напълно спрян", "Нова публикация за продължаващи строителни дейности, електрозахранването и действията на институциите около „Баба Алино“.", "2026-09-02T10:31:00+03:00", 92),
		kubSeedSignal("DarikNews", "https://dariknews.bg/novini/bylgariia/vyzrazhdane-pita-ima-li-politicheski-chadyr-nad-ukrainskata-grupirovka-kub-i-oleg-nevzorov-2465416", "„Възраждане“ пита: Има ли политически чадър над КУБ и Олег Невзоров", "Darik отразява декларацията на Коста Стоянов и твърденията за институционален чадър над КУБ.", "2026-09-02T10:49:00+03:00", 96),
		kubSeedSignal("Днес+", "https://dnesplus.bg/varna/sadat-reshi-spiraneto-na-toka-v-baba-alino-ostava-v-sila_1233756", "Съдът реши: Спирането на тока в „Баба Алино“ остава в сила", "Публикация за съдебния отказ за незабавно възстановяване на електрозахранването към обекти на „Форест клуб Варна“.", "2026-09-02T10:50:00+03:00", 90),
		kubSeedSignal("Focus News", "https://www.focus-news.net/novini/regioni/Vuzrazhdane-za-Baba-Alino-Deistviyata-na-grupirovkata-KUB-sa-opisvani-i-v-dokladi-na-DANS-Nikoi-na-nai-visok-durzhaven-post-ne-mozhe-da-kazhe-ne-znaeh--3019129", "„Възраждане“: Действията на КУБ са описвани и в доклади на ДАНС", "Focus публикува разширено отразяване на декларацията с твърдения за доклади на ДАНС и информираност на държавните институции.", "2026-09-02T10:58:00+03:00", 97),
		kubSeedSignal("Варна Утре", "https://varnautre.bg/2026/09/02/652846-zapechatvat_sus_stikeri_i_lenti_nezakonnite_sgradi_v_baba_alino_vuv_varna", "Запечатват със стикери и ленти сградите в „Баба Алино“", "Публикация за 19 издадени заповеди за премахване, още 4 предстоящи и планирано физическо ограничаване на достъпа до обектите.", "2026-09-02T12:21:00+03:00", 96),
		kubSeedSignal("24 часа", "https://www.24chasa.bg/index.php/bulgaria/article/23492303", "23 обекта в „Баба Алино“ отиват към премахване, общината ще ограничи достъпа", "Материалът съобщава за 19 издадени и още 4 подготвяни заповеди за премахване, както и за последващо ограничаване на физическия достъп.", "2026-09-02T12:52:00+03:00", 96),
		kubSeedSignal("TrafficNews", "https://trafficnews.bg/bulgaria/sabariat-23-kashtite-baba-alino-obshtinata-ogranichava-388040/", "Събарят 23 от къщите в „Баба Алино“, общината ограничава достъпа", "Публикация, разпространяваща информацията за 19 издадени и 4 предстоящи заповеди и мерките за ограничаване на достъпа.", "2026-09-02T13:15:00+03:00", 92),
		kubSeedSignal("NewsPoint", "https://newspoint.bg/sabaryat-23-nezakonni-kasthi-v-baba-alino-dostapat-do-tyah-sthe-bade-ogranichen/", "Събарят 23 незаконни обекта в „Баба Алино“, достъпът ще бъде ограничен", "Още едно медийно разпространение на общинските действия за премахване и физическо ограничаване на достъпа.", "2026-09-02T13:39:00+03:00", 91),
		kubSeedSignal("24 Пловдив", "https://www.24plovdiv.bg/novini/article/23492991", "Собственици на имоти в „Баба Алино“ искат съдът да върне тока и водата", "Ново съдебно развитие: „Форест клуб Варна“ ООД е внесло искане до Административния съд – Варна за незабавно спиране на прекъсването на захранването.", "2026-09-02T13:43:00+03:00", 94),
		kubSeedSignal("БТА", "https://www.bta.bg/", "Административният съд във Варна образува ново дело заради спирането на тока в „Баба Алино“", "БТА съобщава за ново дело по искова молба на „Форест клуб Варна“ ООД за незабавно възстановяване на тока и водата.", "2026-09-02T14:09:00+03:00", 98),
		kubSeedSignal("DarikNews", "https://dariknews.bg/regioni/varna/administrativniiat-syd-vyv-varna-obrazuva-novo-delo-zaradi-spiraneto-na-toka-v-baba-alino-2465452", "Административният съд във Варна образува ново дело заради спирането на тока в „Баба Алино“", "Darik отразява новото дело по искане на „Форест клуб Варна“ ООД за незабавно възстановяване на тока и водата.", "2026-09-02T14:22:00+03:00", 96),
	}
}

func init() {
	go func() {
		time.Sleep(3 * time.Second)
		mergeSignals("kub", kubAfternoonVerifiedSignals())
		saveSignalStateFile()
	}()
}

package main

import "time"

// Verified KUB/Baba Alino mentions published after the previous 14:22 catch-up.
// They remain separate source-level mentions because Monitoring must show media
// propagation, with a direct source link for every publication.
func kubLateAfternoonVerifiedSignals() []Signal {
	return []Signal{
		kubSeedSignal("Nova", "https://nova.bg/news/view/2026/09/02/549912/%D1%81%D1%8A%D0%B4%D1%8A%D1%82-%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D1%83%D0%B2%D0%B0-%D0%BD%D0%BE%D0%B2%D0%BE-%D0%B4%D0%B5%D0%BB%D0%BE-%D0%B7%D0%B0-%D1%82%D0%BE%D0%BA%D0%B0-%D0%B8-%D0%B2%D0%BE%D0%B4%D0%B0%D1%82%D0%B0-%D0%B2-%D0%B1%D0%B0%D0%B1%D0%B0-%D0%B0%D0%BB%D0%B8%D0%BD%D0%BE/", "Съдът образува ново дело за тока и водата в „Баба Алино“", "Nova отразява новото дело по искане на „Форест клуб Варна“ за незабавно възстановяване на електрозахранването и водоснабдяването.", "2026-09-02T14:21:00+03:00", 95),
		kubSeedSignal("Darik", "https://darik.bg/sadat-obrazuva-novo-delo-za-toka-i-vodata-v-baba-alino~541693.html", "Съдът образува ново дело за тока и водата в „Баба Алино“", "Darik публикува отделно отразяване на новото дело на „Форест клуб Варна“ за възстановяване на тока и водата.", "2026-09-02T14:33:00+03:00", 95),
		kubSeedSignal("БНТ", "https://bntnews.bg/news/sadat-vav-varna-reshava-za-spiraneto-na-toka-i-vodata-v-baba-alino-1410569news.html", "Съдът във Варна решава за спирането на тока и водата в „Баба Алино“", "БНТ отразява новото административно дело и искането на „Форест Клуб Варна“ срещу прекъсването на тока и водата.", "2026-09-02T14:34:00+03:00", 97),
		kubSeedSignal("Евроком", "https://eurocom.bg/2026/09/02/novo-delo-zaradi-spiraneto-na-toka-i-vodata-v-mestnostta-baba-alino/", "Ново дело заради спирането на тока и водата в местността „Баба Алино“", "Евроком отразява искането за незабавно възстановяване на захранването и новото дело в Административния съд – Варна.", "2026-09-02T14:39:00+03:00", 95),
		kubSeedSignal("Dir.bg", "https://dnes.dir.bg/varna/novo-delo-za-toka-i-vodata-v-baba-alino-kmetat-s-novi-zapovedi-za-sabaryane", "Ново дело за тока и водата в „Баба Алино“, кметът с нови заповеди за събаряне", "Dir.bg съчетава съдебното развитие с информацията за издадените общински заповеди за премахване на постройки.", "2026-09-02T14:58:00+03:00", 98),
		kubSeedSignal("Lupa.bg", "https://lupa.bg/news/sadat-obrazuva-novo-delo-zaradi-spiraneto-na-toka-v-bdquobaba-alinoldquo_423843news.html", "Съдът образува ново дело заради спирането на тока в „Баба Алино“", "Lupa.bg публикува отделно медийно отразяване на новото дело и прекъсването на тока и водата.", "2026-09-02T15:01:00+03:00", 93),
		kubSeedSignal("Паралел 43", "https://parallel43.bg/iskat-ot-sada-nezabavno-vazstanovyavane-na-zahranvaneto-s-tok-i-voda-v-baba-alino", "Искат от съда незабавно възстановяване на захранването с ток и вода в „Баба Алино“", "Паралел 43 отразява административно дело №2733/2026 г. и искането на „Форест Клуб Варна“.", "2026-09-02T15:06:00+03:00", 94),
		kubSeedSignal("News.bg", "https://news.bg/crime/sadat-vav-varna-obrazuva-novo-delo-sreshtu-spiraneto-na-toka-i-vodata-v-baba-alino.html", "Съдът във Варна образува ново дело срещу спирането на тока и водата в „Баба Алино“", "News.bg отразява новото дело на „Форест Клуб Варна“ срещу спирането на тока и водата и основанията, посочени от общината.", "2026-09-02T15:16:00+03:00", 95),
	}
}

func init() {
	go func() {
		time.Sleep(4 * time.Second)
		mergeSignals("kub", kubLateAfternoonVerifiedSignals())
		saveSignalStateFile()
	}()
}

package main

import "time"

// Verified public KUB / Baba Alino mentions published after the Sep 7 feed cutoff.
// These are durable evidence seeds only. Risk, severity and relevance are derived
// by the canonical KUB classifier; no manual metric values are injected.
func init() {
	go func() {
		time.Sleep(4 * time.Second)
		ensureKUBSignalPersistenceClient()

		items := []struct {
			source, sourceType, url, title, text, published string
		}{
			{
				"Радио Варна / БНР", "news",
				"https://www.bnrnews.bg/varna/post/525331/kazusat-baba-alino-zhiteli-nastoyavat-za-lichna-sreshta-s-kmeta-na-varna-i-rabotna-grupa",
				"Казусът „Баба Алино“: Жители настояват за лична среща с кмета на Варна",
				"Радио Варна отразява отвореното писмо на жители на Forest Club с искане за лична среща с кмета и създаване на работна група. Публикацията е пряко свързана с текущата комуникационна и институционална динамика около КУБ и „Баба Алино“.",
				"2026-09-08T08:13:00+03:00",
			},
			{
				"БГНЕС", "news",
				"https://www.bgnes.bg/jiteli-na-forest-club-v-baba-alino-nastoqvat-za-sreshta-s-kmeta-na-varna-i-rabotna-grupa",
				"Жители на Forest Club в Баба Алино настояват за среща с кмета на Варна и работна група",
				"БГНЕС публикува искането на жители на комплекса за пряк диалог с институциите и работна група, като материалът е част от активния медиен цикъл по казуса „Баба Алино“.",
				"2026-09-08T08:46:00+03:00",
			},
			{
				"Евроком", "news",
				"https://eurocom.bg/2026/09/08/domovete-ni-sa-zalozhnik-na-spor-zhiteli-na-baba-alino-nastoyavat-za-sreshta-s-kmeta/",
				"„Домовете ни са заложник на спор“: Жители на Баба Алино настояват за среща с кмета",
				"Евроком отразява позицията на жители на Forest Club, които искат среща с кмета, индивидуален преглед на документите и предупреждават за възможно сезиране на европейски институции.",
				"2026-09-08T08:55:00+03:00",
			},
			{
				"Dir.bg", "news",
				"https://dnes.dir.bg/varna/zhiteli-ot-kompleksa-v-baba-alino-iskat-lichna-sreshta-s-kmeta-na-varna",
				"Жители от комплекса в Баба Алино искат лична среща с кмета на Варна",
				"Dir.bg отразява призива за лична среща с кмета и създаване на работна група за спорните казуси около Forest Club и „Баба Алино“.",
				"2026-09-08T09:40:00+03:00",
			},
			{
				"VarnaUtre.bg", "news",
				"https://varnautre.bg/2026/09/08/652982-sobstvenitsi_na_imoti_vuv_forest_clubiskat_speshna_sreshta_s_kmeta_na_varna",
				"Собственици на имоти във Forest Club искат спешна среща с кмета на Варна",
				"VarnaUtre.bg публикува позицията на собственици в Forest Club и искането им за работна група и диалог с институциите.",
				"2026-09-08T10:58:00+03:00",
			},
			{
				"Moreto.net", "news",
				"https://www.moreto.net/novini.php?c=09&n=535068",
				"Жители на комплекс в „Баба Алино“ настояват за спешна среща с кмета на Варна и диалог с институциите",
				"Moreto.net отразява призива на жители на Forest Club за спешна среща с кмета, общинската администрация и юристи по текущия казус.",
				"2026-09-08T11:03:00+03:00",
			},
			{
				"FrogNews", "news",
				"https://frognews.bg/novini/horata-baba-alino-bez-tok-voda-iskat-reshenie-gotovi-sezirat.html",
				"Хората в „Баба Алино“ без ток и вода: Искат решение, готови са да сезират ЕС",
				"FrogNews отразява исканията на собственици за среща с кмета и за институционално решение, на фона на прекъснат ток и вода в част от комплекса.",
				"2026-09-08T15:09:00+03:00",
			},
			{
				"БТА", "news",
				"https://www.bta.bg/bg/news/1200403-parlamentat-othvarli-dve-iskaniya-na-vazrazhdane-za-izslushvaniya-otnosno-rast",
				"Парламентът отхвърли искане за изслушване относно корпорация КУБ",
				"БТА съобщава, че Народното събрание е отхвърлило предложение за изслушване на председателя на ДАНС относно твърдения за дейността на КУБ и нейния собственик Олег Невзоров.",
				"2026-09-09T09:31:00+03:00",
			},
			{
				"Dir.bg", "news",
				"https://dnes.dir.bg/politika/vazrazhdane-pita-dans-prodalzhava-li-nevzorov-da-vkarva-pari-i-orazhiya-v-chuvali",
				"„Възраждане“ постави въпроси към ДАНС за Невзоров; парламентът отхвърли изслушването",
				"Dir.bg отразява парламентарния спор и отправените твърдения и въпроси към ДАНС относно Олег Невзоров и КУБ. Твърденията са представени като политически обвинения, а не като установени факти.",
				"2026-09-09T10:02:00+03:00",
			},
			{
				"БТА", "news",
				"https://www.bta.bg/bg/news/bulgaria/regional-news/oblast-varna/1200678-varnenskiyat-administrativen-sad-prekrati-deloto-sreshtu-zadalzhitelnoto-predpis",
				"Варненският административен съд прекрати делото срещу предписанието за спиране на тока в Баба Алино",
				"БТА съобщава, че Административният съд – Варна е прекратил делото по жалбата на „Форест клуб Варна“ ООД срещу задължително предписание на „Електроразпределение Север“ за спиране на тока към няколко постройки.",
				"2026-09-09T14:10:00+03:00",
			},
			{
				"Труд news", "news",
				"https://trud.bg/a/articles/sadat-otriaza-pretentsiite-sreshtu-spiraneto-na-toka-v-baba-alino",
				"Съдът отряза претенциите срещу спирането на тока в „Баба Алино“",
				"„Труд news“ отразява прекратяването на административното дело срещу предписанието за спиране на електрозахранването към част от постройките в „Баба Алино“.",
				"2026-09-09T14:13:00+03:00",
			},
			{
				"БНТ", "news",
				"https://bntnews.bg/news/varnenskiyat-administrativen-sad-prekrati-deloto-sreshtu-zadalzhitelnoto-predpisanie-za-spirane-na-toka-v-baba-alino-1411599news.html",
				"Варненският административен съд прекрати делото срещу предписанието за спиране на тока в „Баба Алино“",
				"БНТ отразява решението на Административния съд – Варна за прекратяване на делото по жалбата срещу предписанието за спиране на електрозахранването.",
				"2026-09-09T14:58:00+03:00",
			},
			{
				"Varna24.bg", "news",
				"https://www.varna24.bg/novini/varna/Advokat-za-Baba-Alino-Sobstvenici-ne-sa-uvedomeni-i-ne-sa-adresati-na-zapovedta-na-kmeta-ot-01092025g-Shte-tursyat-pravata-si-3022574",
				"Адвокат за „Баба Алино“: Собственици ще търсят правата си",
				"Varna24.bg публикува становище на адвокат на собственици в „Баба Алино“, според което те не са били адресати на заповедта на кмета и възнамеряват да търсят правата си, включително по европейски ред.",
				"2026-09-09T17:25:00+03:00",
			},
			{
				"Филтър", "news",
				"https://filternews.bg/medijnata-pushilka-baba-alino/",
				"„Медийната пушилка Баба Алино“",
				"Коментарна публикация във „Филтър“ оспорва публичния разказ, че действията на институциите решават казуса „Баба Алино“, и поддържа кризисната тема активна в информационната среда.",
				"2026-09-10T00:00:00+03:00",
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

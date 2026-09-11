package main

// Extend the KUB crisis identity set without weakening client isolation.
// These terms are intentionally specific: standalone "КУБ" remains context-
// guarded in kubRelevant so generic uses of the Bulgarian word "куб" do not
// pollute the crisis feed.
func init() {
	kubSignalAliases = append(kubSignalAliases,
		"Олег Невзоров",
		"Олег Несторов",
		"Oleg Nevzorov",
		"Forest Club Варна",
		"Форест клуб",
		"КУБ Варна",
		"KUB Varna",
	)

	kubRealtimeQueries = append(kubRealtimeQueries,
		`"Олег Невзоров"`,
		`"Олег Несторов"`,
		`"Oleg Nevzorov"`,
		`"КУБ" Варна`,
		`"KUB" Varna`,
		`"Forest Club" Варна`,
	)
}

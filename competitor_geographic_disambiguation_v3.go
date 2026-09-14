package main

import "strings"

// bolyarkaCompetitorGeographicNoiseV3 blocks geographic uses of the ambiguous
// competitor name "Шуменско" without suppressing source-backed beer-brand
// coverage. It is intentionally narrow and complements the existing V2
// disambiguation used by the collector.
func bolyarkaCompetitorGeographicNoiseV3(name, title, body string) bool {
	if normalizedCompetitorTextV2(name) != "шуменско" {
		return false
	}

	low := normalizedCompetitorTextV2(title + " " + body)

	// Strong brand/company evidence always wins over a geographic phrase.
	for _, evidence := range []string{
		"шуменско специално",
		"шуменско пиво",
		"бира шуменско",
		"шуменско бира",
		"пивоварна шуменско",
		"пивоварната шуменско",
		"shumensko beer",
		"shumensko special",
		"carlsberg bulgaria",
		"карлсберг българия",
	} {
		if strings.Contains(low, evidence) {
			return false
		}
	}

	// These are geographic forms around Shumen, not the beer brand. The V2
	// generic beer evidence used substring matching for short words such as
	// "бира", which can occur inside unrelated words (for example "събира").
	// This guard prevents that collision from reaching the public chronology.
	for _, geographic := range []string{
		"шуменското плато",
		"шуменско плато",
		"шуменските",
		"шуменски",
		"шуменска",
		"шуменско село",
		"шуменско села",
		"област шумен",
		"община шумен",
		"град шумен",
		"край шумен",
		"до шумен",
		"в шумен",
	} {
		if strings.Contains(low, geographic) {
			return true
		}
	}
	return false
}

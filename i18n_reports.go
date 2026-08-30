package main

import "net/http"

func reportContentEnglish(c *Client, id string) (string, string) {
	name := c.Name
	switch id {
	case "digital":
		return "Digital & Content Presence – " + name,
			"<p>The monthly analysis tracks the development of owned digital assets, the structure and freshness of content, product presentation and visible changes during the period.</p><div class='box'><b>Primary focus:</b> website, e-commerce, content, product categories, public company profiles and consistency of presentation.</div><h2>What is analyzed</h2><p>Changes versus the previous period, strengths and weaknesses, new publications, updates and opportunities for improvement.</p>"
	case "reputation":
		return "Reputation & Information Environment – " + name,
			"<p>Analysis of the public information environment around the brand, visible ratings and opinions, external publications and topics that may influence perception.</p><div class='box'><b>Primary focus:</b> reputation signals, recurring themes, external mentions and changes that require attention.</div>"
	case "signals":
		return "Market Signals – " + name,
			"<p>Analysis of changes in interest, thematic focus, brand activity and observable movements in the category.</p><div class='box'><b>Primary focus:</b> new signals, acceleration or weakening of interest, product and communication themes and opportunities.</div>"
	case "competitive":
		return "Competitive Positioning – " + name,
			"<p>Comparison with a predefined group of comparable brands using consistent public criteria.</p><div class='box'><b>Primary focus:</b> differences in digital presence, content, product presentation, visible activity and development over time.</div>"
	case "summary":
		return "Monthly Summary – " + name,
			"<p>A concise summary of the most important changes during the month: what improved, what requires attention, which signals recur and which recommendations should be prioritized for the next period.</p>"
	}
	return "", ""
}

func localizedReportContent(r *http.Request, c *Client, id string) (string, string) {
	if blisEnglishRequest(r) {
		return reportContentEnglish(c, id)
	}
	return reportContent(c, id)
}

func localizedReportList(r *http.Request) []map[string]string {
	if blisEnglishRequest(r) {
		return []map[string]string{
			{"id": "digital", "title": "Digital & Content Presence", "period": "August 2026"},
			{"id": "reputation", "title": "Reputation & Information Environment", "period": "August 2026"},
			{"id": "signals", "title": "Market Signals", "period": "August 2026"},
			{"id": "competitive", "title": "Competitive Positioning", "period": "August 2026"},
			{"id": "summary", "title": "Monthly Summary", "period": "August 2026"},
		}
	}
	return []map[string]string{
		{"id": "digital", "title": "Дигитално и съдържателно присъствие", "period": "Август 2026"},
		{"id": "reputation", "title": "Репутация и информационна среда", "period": "Август 2026"},
		{"id": "signals", "title": "Пазарни сигнали", "period": "Август 2026"},
		{"id": "competitive", "title": "Конкурентно позициониране", "period": "Август 2026"},
		{"id": "summary", "title": "Месечно обобщение", "period": "Август 2026"},
	}
}

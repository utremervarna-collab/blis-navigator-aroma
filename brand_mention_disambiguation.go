package main

import "strings"

// brandMentionContextAcceptable prevents ambiguous brand names from leaking
// unrelated entities into the public monitoring timeline. It is intentionally
// conservative and only adds rules for names with a proven collision in live
// production data.
func brandMentionContextAcceptable(c *Client, title, text string) bool {
	if c == nil {
		return true
	}
	low := strings.ToLower(strings.Join(strings.Fields(title+" "+text), " "))

	switch c.Slug {
	case "bolyarka":
		// Corporate/brewery references are always strong evidence.
		for _, evidence := range []string{
			"болярка вт",
			"болярка в.т.",
			"bolyarka vt",
			"boliarka vt",
			"bolyarka brewery",
			"пивоварна болярка",
			"пивоварната болярка",
			"пивоварна „болярка“",
			"пивоварна “болярка”",
			"бира болярка",
			"бирата болярка",
		} {
			if strings.Contains(low, evidence) {
				return true
			}
		}

		// If the ambiguous word is present by itself, require beer/brewery
		// context. This removes Furniture House Bolyarka and State Forestry
		// Bolyarka while preserving real brewery coverage.
		ambiguous := strings.Contains(low, "болярка") || strings.Contains(low, "bolyarka") || strings.Contains(low, "boliarka")
		if !ambiguous {
			return true
		}
		for _, context := range []string{
			"бира", "пиво", "пивовар", "пивоварна", "пивоварство",
			"beer", "brewery", "brewing", "lager", "ale", "малц", "хмел",
		} {
			if strings.Contains(low, context) {
				return true
			}
		}
		return false
	default:
		return true
	}
}

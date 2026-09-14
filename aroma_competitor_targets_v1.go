package main

import "strings"

// aromaConfiguredCompetitorTargets bridges the existing Aroma competitor specs
// into the universal competitor monitoring pipeline. The Aroma profile already
// defines these companies in aromaCompetitors; this helper does not invent or
// replace competitors, it only exposes the existing configuration to the
// realtime and three-month lookback collectors.
func aromaConfiguredCompetitorTargets(c *Client) []competitorSignalTarget {
	if c == nil || c.Slug != "aroma" {
		return nil
	}
	out := make([]competitorSignalTarget, 0, len(aromaCompetitors))
	for _, sp := range aromaCompetitors {
		name := strings.TrimSpace(sp.Name)
		if name == "" || strings.TrimSpace(sp.Key) == "" {
			continue
		}
		aliases := competitorAliases(name)
		aliases = appendUniqueCompetitorAliases(aliases, quotedCompetitorAliases(sp.NewsQuery)...)
		out = append(out, competitorSignalTarget{
			Key:     sp.Key,
			Name:    name,
			URL:     sp.URL,
			Aliases: aliases,
		})
	}
	return out
}

func quotedCompetitorAliases(q string) []string {
	out := []string{}
	for {
		start := strings.Index(q, `"`)
		if start < 0 {
			break
		}
		q = q[start+1:]
		end := strings.Index(q, `"`)
		if end < 0 {
			break
		}
		if v := strings.TrimSpace(q[:end]); v != "" {
			out = append(out, v)
		}
		q = q[end+1:]
	}
	return out
}

func appendUniqueCompetitorAliases(base []string, extra ...string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(base)+len(extra))
	for _, group := range [][]string{base, extra} {
		for _, v := range group {
			v = strings.TrimSpace(v)
			key := strings.ToLower(v)
			if v == "" || seen[key] {
				continue
			}
			seen[key] = true
			out = append(out, v)
		}
	}
	return out
}

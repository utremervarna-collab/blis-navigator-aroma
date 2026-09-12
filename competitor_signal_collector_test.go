package main

import "testing"

func TestZagorkaParkIsNotACompetitorMention(t *testing.T) {
	c := &Client{Slug: "bolyarka"}
	target := competitorSignalTarget{Name: "Загорка", Aliases: []string{"Загорка"}}
	title := "Силен старт на BEERфест 2026 в парк „Загорка“"
	text := "Бирен фестивал в парк Загорка, Стара Загора"
	if !zagorkaParkOnly(target.Name, title, text) || competitorRelevance(c, target, title, text) != 0 {
		t.Fatal("a beer event at park Zagorka is not evidence of a brewery mention")
	}
	withBrand := text + ". Пивоварна Загорка представи нова бира."
	if zagorkaParkOnly(target.Name, title, withBrand) || competitorRelevance(c, target, title, withBrand) == 0 {
		t.Fatal("an explicit brewery mention should remain eligible")
	}
	if zagorkaParkOnly("Каменица", title, text) {
		t.Fatal("the place-name filter must not apply to other brands")
	}
}

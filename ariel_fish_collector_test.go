package main

import "testing"

func TestArielFishIsCollected(t *testing.T) {
    count := 0
    for _, slug := range signalEligibleSlugs() {
        if slug == "ariel-fish" { count++ }
    }
    if count != 1 {
        t.Fatalf("expected Ariel Fish in primary collector exactly once; got %d", count)
    }
    for _, slug := range universalSignalSlugsV2() {
        if slug == "ariel-fish" {
            t.Fatal("Ariel Fish must not be collected by both primary and universal loops")
        }
    }
}

func TestArielFishMentionAttribution(t *testing.T) {
    c := &Client{Slug: "ariel-fish", Name: "Ариел Фиш"}
    cases := []struct{
        name, title, description string
        want bool
    }{
        {"Bulgarian company", "Ариел Фиш представи рибни продукти", "Производител на рибни продукти", true},
        {"English company", "Ariel Fish Bulgaria seafood producer", "Fish processing in Varna", true},
        {"Unrelated photographer", "New album cover photographed by Ariel Fish", "Ariel Fish is credited for music photography", false},
    }
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got, ok := buildSignal(c, "example", "news", "https://example.org/test", tc.title, tc.description, "")
            if ok != tc.want { t.Fatalf("accepted=%v, want=%v", ok, tc.want) }
            if ok && got.Client != "ariel-fish" { t.Fatalf("wrong client attribution: %q", got.Client) }
        })
    }
}

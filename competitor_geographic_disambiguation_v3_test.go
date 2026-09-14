package main

import "testing"

func TestBolyarkaCompetitorGeographicNoiseV3(t *testing.T) {
	tests := []struct {
		name  string
		brand string
		title string
		body  string
		want  bool
	}{
		{
			name:  "Shumen village crash is geographic",
			brand: "Шуменско",
			title: "23-годишен мъж загина в катастрофа на пътя между шуменските села Панайот Волов и Мадара",
			body:  "",
			want:  true,
		},
		{
			name:  "Shumen plateau is geographic",
			brand: "Шуменско",
			title: "Шуменското плато - мястото, където отиваме да дишаме",
			body:  "",
			want:  true,
		},
		{
			name:  "Shumensko Specialno is the beer brand",
			brand: "Шуменско",
			title: "Шуменско Специално с нова кампания",
			body:  "Пивоварната марка представи инициативата.",
			want:  false,
		},
		{
			name:  "Carlsberg evidence preserves brand coverage",
			brand: "Шуменско",
			title: "Нова инициатива на Шуменско",
			body:  "Карлсберг България представи кампанията на бранда.",
			want:  false,
		},
		{
			name:  "Other competitors are untouched",
			brand: "Загорка",
			title: "Загорка инвестира в производство",
			body:  "",
			want:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := bolyarkaCompetitorGeographicNoiseV3(tt.brand, tt.title, tt.body); got != tt.want {
				t.Fatalf("bolyarkaCompetitorGeographicNoiseV3()=%v want=%v", got, tt.want)
			}
		})
	}
}

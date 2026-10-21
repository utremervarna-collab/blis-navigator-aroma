package main

import (
    "regexp"
    "strings"
)

// kubSignalHasCompanyEvidence rejects unrelated uses of "куб." as a unit
// of volume while retaining the corporate name, named projects and
// context-backed standalone company mentions.
var kubCompanyTokenRE = regexp.MustCompile(`(^|[^\p{L}\p{N}])куб([^\p{L}\p{N}]|$)`)
var kubVolumeRE = regexp.MustCompile(`куб\.?\s*(?:м\.?|метра|метър|метри|м3|м³)\b`)

func kubSignalHasCompanyEvidence(title, body string) bool {
    low := strings.ToLower(strings.Join(strings.Fields(title+" "+body), " "))
    if collectorContainsAny(low,
        "корпорация куб", "куб корпорация", "куб-дивелъпмънт",
        "куб дивелъпмънт", "куб кънстракшън", "куб construction",
        "баба алино", "baba alino", "forest club", "форест клуб",
        "forest village", "олег невзоров", "oleg nevzorov") {
        return true
    }
    // A unit of measurement must never count as a company mention.
    withoutVolume := kubVolumeRE.ReplaceAllString(low, " ")
    if !kubCompanyTokenRE.MatchString(withoutVolume) {
        return false
    }
    return collectorContainsAny(withoutVolume,
        "строител", "инвеститор", "недвижим", "жилищен комплекс",
        "разрешение за строеж", "административен съд", "заповеди за премахване")
}

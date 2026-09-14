package main

import "bytes"

func init() {
	const chronologyScript = `<script defer src="/aroma-mention-chronology-v1.js?v=20260914-2"></script>`
	const activationScript = `<script defer src="/aroma-competition-activation-v1.js?v=20260914-1"></script>`
	const dedupScript = `<script defer src="/aroma-chronology-semantic-dedup-v1.js?v=20260914-1"></script>`
	const dossierDataScript = `<script defer src="/navigator-competitor-dossiers-data-v2.js?v=20260914-aroma3"></script>`
	const aromaDossierScript = `<script defer src="/navigator-aroma-competitor-dossiers-v3.js?v=20260914-1"></script>`
	const dossierUIScript = `<script defer src="/navigator-3-competitor-dossier-v2.js?v=20260914-aroma3"></script>`
	const emptyGuardScript = `<script defer src="/navigator-aroma-empty-measurement-guard-v1.js?v=20260914-1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("aroma-mention-chronology-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(chronologyScript)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("aroma-competition-activation-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(activationScript)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("aroma-chronology-semantic-dedup-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(dedupScript)...)
	}
	// Rich dossier data must load before the Aroma-specific verified facts and V2 drawer.
	if !bytes.Contains(blisI18NScripts, []byte("navigator-competitor-dossiers-data-v2.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(dossierDataScript)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("navigator-aroma-competitor-dossiers-v3.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(aromaDossierScript)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("navigator-3-competitor-dossier-v2.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(dossierUIScript)...)
	}
	if !bytes.Contains(blisI18NScripts, []byte("navigator-aroma-empty-measurement-guard-v1.js")) {
		blisI18NScripts = append(blisI18NScripts, []byte(emptyGuardScript)...)
	}
}

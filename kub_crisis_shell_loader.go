package main

import "bytes"

func init() {
	const kubAttackMapWhite3dScript = `<script defer src="/kub-attack-map-white3d-v1.js?v=20260902-white3d1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-attack-map-white3d-v1.js")) {
		blisI18NScripts = append([]byte(kubAttackMapWhite3dScript), blisI18NScripts...)
	}

	const kubAttackMapLiveScript = `<script defer src="/kub-attack-map-live-v1.js?v=20260902-live2"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-attack-map-live-v1.js")) {
		blisI18NScripts = append([]byte(kubAttackMapLiveScript), blisI18NScripts...)
	}

	const kubAttackMapScript = `<script src="/kub-attack-map-v1.js?v=20260902-attack1"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-attack-map-v1.js")) {
		blisI18NScripts = append([]byte(kubAttackMapScript), blisI18NScripts...)
	}

	const kubShellScript = `<script src="/kub-crisis-shell-fix-v1.js?v=20260902-shell6"></script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-crisis-shell-fix-v1.js")) {
		blisI18NScripts = append([]byte(kubShellScript), blisI18NScripts...)
	}
}
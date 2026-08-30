#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / 'static'
OLD = 'window.BLIS_EN_TRANSLATIONS=Object.assign(window.BLIS_EN_TRANSLATIONS||{},T);'
NEW = 'window.BLIS_EN_TRANSLATIONS=Object.assign({},window.BLIS_EN_TRANSLATIONS||{},T);'
changed = []
matched = 0

for p in sorted(STATIC.glob('blis-i18n-en-*.js')):
    s = p.read_text(encoding='utf-8')
    count = s.count(OLD)
    if count:
        matched += count
        s = s.replace(OLD, NEW)
        p.write_text(s, encoding='utf-8')
        changed.append(p.name)

if not matched:
    # Idempotent runs are valid once all additive catalogs have already been hardened.
    already = sum((p.read_text(encoding='utf-8').count(NEW) for p in STATIC.glob('blis-i18n-en-*.js')), 0)
    if not already:
        raise SystemExit('No additive BLIS EN catalog assignments found')
    print(f'all additive EN catalogs already frozen-safe ({already} assignments)')
else:
    print(f'hardened {matched} additive catalog assignments across {len(changed)} files')
    for name in changed:
        print(' -', name)

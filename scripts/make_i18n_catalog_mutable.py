#!/usr/bin/env python3
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'static'/'blis-i18n-en-v1.js'
s=p.read_text(encoding='utf-8')
old='window.BLIS_EN_TRANSLATIONS=Object.freeze(T);'
new='window.BLIS_EN_TRANSLATIONS=Object.assign({},T);'
if new in s:
    print('canonical EN catalog already mutable')
elif old in s:
    p.write_text(s.replace(old,new,1),encoding='utf-8')
    print('made canonical EN catalog mutable')
else:
    raise SystemExit('canonical EN catalog assignment anchor missing')

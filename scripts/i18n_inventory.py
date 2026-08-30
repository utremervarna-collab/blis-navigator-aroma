#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CYR = re.compile(r"[А-Яа-яЁёЀ-ӿ]")
WS = re.compile(r"\s+")
SKIP_EXT = {'.png','.jpg','.jpeg','.webp','.gif','.ico','.zip','.b64','.txt'}
SCAN_EXT = {'.html','.js','.go','.svg'}


def clean(s: str) -> str:
    s = unescape(s or '').replace('\\n',' ').replace('\\t',' ')
    return WS.sub(' ', s).strip()


def meaningful(s: str) -> bool:
    if not s or not CYR.search(s):
        return False
    if len(s) > 1200:
        return False
    # source/code fragments that are not user-facing text
    if any(x in s for x in ('package main','func ','const ','var ','document.querySelector','window.','http.','strings.')):
        return False
    return True


class TextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.texts=[]
        self.attrs=[]
        self.skip=0
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style'):
            self.skip += 1
        for k,v in attrs:
            if k in ('title','aria-label','placeholder','alt','value','content') and v:
                t=clean(v)
                if meaningful(t): self.attrs.append(t)
    def handle_endtag(self, tag):
        if tag in ('script','style') and self.skip:
            self.skip -= 1
    def handle_data(self, data):
        if self.skip: return
        t=clean(data)
        if meaningful(t): self.texts.append(t)


# Conservative JS/Go quoted-string scanner. We do not try to parse template markup;
# the runtime browser QA is the final source of truth.
STR_RE = re.compile(r'''(?s)(?:`([^`]{1,1200})`|"((?:\\.|[^"\\]){1,1200})"|'((?:\\.|[^'\\]){1,1200})')''')


def quoted_strings(text: str):
    for m in STR_RE.finditer(text):
        s = next((g for g in m.groups() if g is not None), '')
        if '<' in s and '>' in s:
            # Extract textual chunks from HTML templates separately.
            p=TextParser()
            try: p.feed(s)
            except Exception: pass
            yield from p.texts
            yield from p.attrs
        t=clean(s)
        if meaningful(t):
            yield t


def add(bucket, locations, phrase, path):
    phrase=clean(phrase)
    if not meaningful(phrase): return
    bucket[phrase]+=1
    if len(locations[phrase]) < 8:
        locations[phrase].append(str(path.relative_to(ROOT)))


def main():
    counts=Counter(); locations=defaultdict(list); by_type=Counter()
    targets=[]
    for base in (ROOT/'static', ROOT):
        if not base.exists(): continue
        it=base.rglob('*') if base.name=='static' else base.glob('*.go')
        for p in it:
            if not p.is_file() or p.suffix.lower() not in SCAN_EXT: continue
            targets.append(p)
    seen=set()
    for p in targets:
        rp=str(p.resolve())
        if rp in seen: continue
        seen.add(rp)
        try: text=p.read_text(encoding='utf-8', errors='ignore')
        except Exception: continue
        if not CYR.search(text): continue
        by_type[p.suffix.lower()]+=1
        if p.suffix.lower() in ('.html','.svg'):
            parser=TextParser()
            try: parser.feed(text)
            except Exception: pass
            for s in parser.texts + parser.attrs:
                add(counts, locations, s, p)
        if p.suffix.lower() in ('.js','.go'):
            for s in quoted_strings(text):
                add(counts, locations, s, p)
    rows=[
        {'text':k,'count':v,'files':locations[k]}
        for k,v in sorted(counts.items(), key=lambda kv:(-kv[1], -len(kv[0]), kv[0].lower()))
    ]
    out={
        'summary':{'unique':len(rows),'occurrences':sum(counts.values()),'files_by_type':dict(by_type)},
        'phrases':rows,
    }
    out_path=ROOT/'i18n-inventory.json'
    out_path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(out['summary'],ensure_ascii=False))
    for r in rows[:120]:
        print(f"{r['count']:>3} | {r['text'][:180]}")

if __name__=='__main__':
    main()

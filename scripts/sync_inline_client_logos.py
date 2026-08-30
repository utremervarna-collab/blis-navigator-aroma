#!/usr/bin/env python3
"""Recover full client logos that are embedded as SVG in official brand sites.

This is a strict fallback for brands whose current official site does not expose a
normal logo file URL. It copies literal SVG artwork only; it never redraws,
generates, traces or substitutes a logo. Existing verified logo entries are left
untouched.
"""
from __future__ import annotations

import base64
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote_to_bytes, urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static" / "client-logos"
MANIFEST = OUT / "manifest.json"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
)

BRANDS = {
    "astor-garden": {
        "homes": ["https://astorgardenhotel.com/", "https://en.astorgardenhotel.com/"],
        "domains": ["astorgardenhotel.com"],
        "tokens": ["astor", "garden"],
    },
    "varna-towers": {
        "homes": [
            "https://varnatowers.bg/",
            "https://www.varnatowers.bg/",
            "http://varnatowers.bg/",
            "http://www.varnatowers.bg/",
        ],
        "domains": ["varnatowers.bg"],
        "tokens": ["varna", "tower", "towers"],
    },
}

BLOCKED = re.compile(
    r"(?:favicon|apple-touch-icon|fontawesome|fa-(?:brands|solid|regular)|/fonts?/|"
    r"sprite|payment|vendor|partner|tenant|facebook|instagram|youtube|linkedin|tiktok)",
    re.I,
)
SVG_RE = re.compile(r"<svg\b[^>]*>.*?</svg\s*>", re.I | re.S)
STYLE_LINK_RE = re.compile(
    r"<link\b[^>]*rel=[\"'][^\"']*stylesheet[^\"']*[\"'][^>]*href=[\"']([^\"']+)[\"'][^>]*>|"
    r"<link\b[^>]*href=[\"']([^\"']+)[\"'][^>]*rel=[\"'][^\"']*stylesheet[^\"']*[\"'][^>]*>",
    re.I,
)
DATA_SVG_RE = re.compile(r"url\(\s*([\"']?)(data:image/svg\+xml[^)]*)\1\s*\)", re.I)


def fetch(url: str, limit: int = 6_000_000) -> bytes:
    req = Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "*/*",
            "Accept-Language": "bg-BG,bg;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
        },
    )
    with urlopen(req, timeout=25) as r:
        data = r.read(limit + 1)
        if len(data) > limit:
            raise ValueError("response too large")
        return data


def host_allowed(url: str, domains: list[str]) -> bool:
    try:
        host = urlparse(url).hostname.lower().removeprefix("www.")
    except Exception:
        return False
    return any(host == d or host.endswith("." + d) for d in domains)


def current_entry_ok(item: dict | None, domains: list[str]) -> bool:
    if not item:
        return False
    source = str(item.get("source", ""))
    path = str(item.get("path", ""))
    return (
        bool(source)
        and bool(path)
        and path.startswith("/client-logos/")
        and not BLOCKED.search(source + " " + path)
        and host_allowed(source, domains)
    )


def opening_tag(svg: str) -> str:
    end = svg.find(">")
    return svg if end < 0 else svg[: end + 1]


def token_hits(text: str, tokens: list[str]) -> int:
    low = text.lower()
    return sum(1 for token in tokens if token in low)


def svg_ratio(svg: str) -> float | None:
    tag = opening_tag(svg)
    m = re.search(r"\bviewBox\s*=\s*[\"']\s*[-+\d.eE]+\s+[-+\d.eE]+\s+([-+\d.eE]+)\s+([-+\d.eE]+)", tag, re.I)
    if m:
        try:
            w, h = float(m.group(1)), float(m.group(2))
            if h > 0:
                return abs(w / h)
        except Exception:
            pass
    wm = re.search(r"\bwidth\s*=\s*[\"']\s*([\d.]+)", tag, re.I)
    hm = re.search(r"\bheight\s*=\s*[\"']\s*([\d.]+)", tag, re.I)
    if wm and hm:
        try:
            w, h = float(wm.group(1)), float(hm.group(1))
            if h > 0:
                return abs(w / h)
        except Exception:
            pass
    return None


def standalone_svg(svg: str, tokens: list[str]) -> bytes | None:
    cleaned = html.unescape(svg).strip()
    low = cleaned.lower()
    if len(cleaned) < 250 or len(cleaned) > 1_000_000:
        return None
    if "<svg" not in low or "</svg" not in low or "<html" in low:
        return None
    if BLOCKED.search(low) or "fontawesome" in low or "fa-brands" in low:
        return None
    # External sprite references do not form a self-contained logo file.
    if re.search(r"<use\b[^>]+(?:href|xlink:href)=[\"'](?!#|data:)[^\"']+", cleaned, re.I):
        return None
    ratio = svg_ratio(cleaned)
    branded_text = token_hits(cleaned[:4000], tokens) > 0
    # Full client wordmarks are normally wider than app/social icons. A square
    # mark is accepted only when the SVG itself carries the client name.
    if ratio is not None and ratio < 1.25 and not branded_text:
        return None
    tag = opening_tag(cleaned)
    if "xmlns=" not in tag.lower():
        cleaned = cleaned.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    return (cleaned + "\n").encode("utf-8")


def score_svg(svg: str, lead: str, position: float, tokens: list[str]) -> int:
    tag = opening_tag(svg).lower()
    lead_low = lead.lower()
    first = svg[:4000].lower()
    hay = tag + " " + lead_low + " " + first
    if BLOCKED.search(hay):
        return -1000
    score = 0
    if re.search(r"\b(?:class|id|aria-label|title)=[\"'][^\"']*logo", tag, re.I):
        score += 230
    elif "logo" in tag:
        score += 190
    if re.search(r"\b(?:class|id|aria-label|title)=[\"'][^\"']*brand", tag, re.I):
        score += 190
    if re.search(r"\b(?:class|id|aria-label|title)=[\"'][^\"']*(?:logo|brand)[^\"']*[\"']", lead_low, re.I):
        score += 150
    hits = token_hits(hay, tokens)
    score += min(hits, 2) * 85
    if position <= 0.30:
        score += 35
    return score


def inline_candidates(source: str, text: str, tokens: list[str]) -> list[tuple[int, bytes, str]]:
    out: list[tuple[int, bytes, str]] = []
    total = max(len(text), 1)
    for m in SVG_RE.finditer(text):
        svg = m.group(0)
        lead = text[max(0, m.start() - 260):m.start()]
        score = score_svg(svg, lead, m.start() / total, tokens)
        if score < 250:
            continue
        data = standalone_svg(svg, tokens)
        if data:
            out.append((score, data, source))
    return out


def decode_data_svg(uri: str) -> bytes | None:
    try:
        head, payload = uri.split(",", 1)
        if ";base64" in head.lower():
            return base64.b64decode(payload, validate=False)
        return unquote_to_bytes(payload)
    except Exception:
        return None


def data_svg_candidates(source: str, text: str, tokens: list[str]) -> list[tuple[int, bytes, str]]:
    out: list[tuple[int, bytes, str]] = []
    for m in DATA_SVG_RE.finditer(text):
        lead = text[max(0, m.start() - 360):m.start()].lower()
        if BLOCKED.search(lead):
            continue
        explicit = bool(re.search(r"(?:logo|brand)", lead, re.I))
        if not explicit:
            continue
        raw = decode_data_svg(m.group(2))
        if not raw:
            continue
        try:
            svg = raw.decode("utf-8", "ignore")
        except Exception:
            continue
        data = standalone_svg(svg, tokens)
        if not data:
            continue
        score = 225 + min(token_hits(lead + " " + svg[:2500], tokens), 2) * 85
        out.append((score, data, source))
    return out


def stylesheets(home: str, text: str) -> list[str]:
    out: list[str] = []
    for m in STYLE_LINK_RE.finditer(text):
        raw = m.group(1) or m.group(2) or ""
        u = urljoin(home, raw)
        if u.startswith("http") and u not in out:
            out.append(u)
    return out[:14]


def discover(cfg: dict) -> tuple[bytes, str] | None:
    ranked: list[tuple[int, bytes, str]] = []
    for home in cfg["homes"]:
        if not host_allowed(home, cfg["domains"]):
            continue
        try:
            body = fetch(home)
            text = body.decode("utf-8", "ignore")
        except Exception as exc:
            print(f"INLINE WARN homepage {home}: {exc}", file=sys.stderr)
            continue
        ranked.extend(inline_candidates(home, text, cfg["tokens"]))
        ranked.extend(data_svg_candidates(home, text, cfg["tokens"]))
        for css_url in stylesheets(home, text):
            if not host_allowed(css_url, cfg["domains"]) or BLOCKED.search(css_url):
                continue
            try:
                css = fetch(css_url, limit=3_000_000).decode("utf-8", "ignore")
            except Exception:
                continue
            ranked.extend(data_svg_candidates(css_url, css, cfg["tokens"]))
    if not ranked:
        return None
    ranked.sort(key=lambda x: x[0], reverse=True)
    score, data, source = ranked[0]
    if score < 250 or not host_allowed(source, cfg["domains"]):
        return None
    return data, source


def main() -> int:
    if not MANIFEST.exists():
        print("INLINE: manifest missing; standard sync must run first", file=sys.stderr)
        return 0
    doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
    logos = doc.setdefault("logos", {})
    changed = False
    for slug, cfg in BRANDS.items():
        if current_entry_ok(logos.get(slug), cfg["domains"]):
            print(f"INLINE keep verified {slug}")
            continue
        found = discover(cfg)
        if not found:
            print(f"INLINE no verified full logo for {slug}")
            continue
        data, source = found
        dest = OUT / f"{slug}.svg"
        for stale in OUT.glob(slug + ".*"):
            if stale.name != "manifest.json" and stale != dest:
                stale.unlink(missing_ok=True)
        dest.write_bytes(data)
        logos[slug] = {"path": f"/client-logos/{dest.name}", "source": source}
        changed = True
        print(f"INLINE OK {slug}: {source} -> {dest.relative_to(ROOT)}")
    if changed:
        doc["version"] = max(int(doc.get("version") or 0), 6)
        MANIFEST.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

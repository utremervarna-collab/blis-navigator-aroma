#!/usr/bin/env python3
"""Sync real client brand logos into static/client-logos from official websites.
No generated marks, initials or favicon substitutes are created.
"""
from __future__ import annotations

import json
import mimetypes
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static" / "client-logos"
OUT.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 BLIS-Navigator-LogoSync/1.0"

BRANDS = {
    "aroma": {
        "home": "https://aroma.bg/",
        "tokens": ["aroma"],
        "fallbacks": [],
    },
    "bolyarka": {
        "home": "https://boliarka.bg/",
        "tokens": ["boliarka", "bolyarka", "болярка"],
        "fallbacks": ["https://boliarka.bg/wp-content/uploads/2019/02/logo_2019.png"],
    },
    "astor-garden": {
        "home": "https://astorgardenhotel.com/",
        "tokens": ["astor", "garden"],
        "fallbacks": [],
    },
    "varna-towers": {
        "home": "https://www.varnatowers.bg/",
        "tokens": ["varna", "tower", "towers"],
        "fallbacks": [],
    },
    "mollox": {
        "home": "https://mollox.bg/",
        "tokens": ["mollox"],
        "fallbacks": ["https://mollox.bg/wp-content/uploads/2018/05/logo-mollox.png"],
    },
    "everbet": {
        "home": "https://everbet.bg/",
        "tokens": ["everbet"],
        "fallbacks": [
            "https://everbet.bg/assets/icons/logo-left-column-light.svg",
            "https://everbet.bg/assets/icons/logo-left-column-dark.svg",
        ],
    },
}

class ImgParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images: list[dict[str, str]] = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "img":
            return
        d = {str(k).lower(): str(v or "") for k, v in attrs}
        src = d.get("src") or d.get("data-src") or d.get("data-lazy-src") or d.get("data-original")
        if src:
            d["src"] = src
            self.images.append(d)


def fetch(url: str, limit: int = 3_000_000) -> tuple[bytes, str]:
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=25) as r:
        data = r.read(limit + 1)
        if len(data) > limit:
            raise ValueError(f"asset too large: {url}")
        return data, (r.headers.get_content_type() or "application/octet-stream").lower()


def score_img(img: dict[str, str], tokens: list[str]) -> int:
    src = img.get("src", "").lower()
    alt = img.get("alt", "").lower()
    cls = (img.get("class", "") + " " + img.get("id", "")).lower()
    hay = " ".join([src, alt, cls])
    score = 0
    if "logo" in src: score += 120
    if "logo" in cls: score += 90
    if "brand" in cls: score += 25
    if any(t in alt for t in tokens): score += 80
    if any(t in src for t in tokens): score += 45
    if all(t in hay for t in tokens[:2]): score += 20
    if any(x in src for x in ["favicon", "icon-", "sprite", "payment", "partner", "tenant"]): score -= 150
    return score


def discover(home: str, tokens: list[str]) -> list[str]:
    try:
        body, _ = fetch(home)
        text = body.decode("utf-8", "ignore")
    except Exception as e:
        print(f"WARN homepage {home}: {e}", file=sys.stderr)
        return []
    parser = ImgParser()
    parser.feed(text)
    ranked = sorted(parser.images, key=lambda x: score_img(x, tokens), reverse=True)
    out: list[str] = []
    for img in ranked:
        if score_img(img, tokens) < 45:
            continue
        u = urljoin(home, img["src"])
        if u.startswith("http") and u not in out:
            out.append(u)
    # Also discover SVG/CSS logo URLs appearing directly in markup.
    for m in re.findall(r"(?:src|href)=[\"']([^\"']*(?:logo|brand)[^\"']*\.(?:svg|png|webp|jpe?g))", text, flags=re.I):
        u = urljoin(home, m)
        if u.startswith("http") and u not in out:
            out.append(u)
    return out[:12]


def ext_for(url: str, ctype: str, data: bytes) -> str:
    ctype = ctype.split(";", 1)[0].strip().lower()
    by_type = {
        "image/svg+xml": ".svg",
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    if ctype in by_type:
        return by_type[ctype]
    p = Path(urlparse(url).path).suffix.lower()
    if p in {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        return ".jpg" if p == ".jpeg" else p
    if data.lstrip().startswith(b"<svg") or b"<svg" in data[:300]:
        return ".svg"
    if data.startswith(b"\x89PNG"):
        return ".png"
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return ".webp"
    raise ValueError("unknown image type")


def valid_image(data: bytes, ext: str) -> bool:
    if len(data) < 250:
        return False
    if ext == ".svg":
        return b"<svg" in data[:1500].lower()
    return True


def sync_brand(slug: str, cfg: dict) -> dict | None:
    candidates = discover(cfg["home"], cfg["tokens"]) + list(cfg.get("fallbacks", []))
    seen = set()
    for url in candidates:
        if url in seen:
            continue
        seen.add(url)
        try:
            data, ctype = fetch(url)
            ext = ext_for(url, ctype, data)
            if not valid_image(data, ext):
                continue
            # Remove previous versions for this slug only after a valid replacement exists.
            for old in OUT.glob(slug + ".*"):
                if old.name != "manifest.json":
                    old.unlink(missing_ok=True)
            dest = OUT / f"{slug}{ext}"
            dest.write_bytes(data)
            print(f"OK {slug}: {url} -> {dest.relative_to(ROOT)}")
            return {"path": "/client-logos/" + dest.name, "source": url}
        except Exception as e:
            print(f"WARN {slug} candidate {url}: {e}", file=sys.stderr)
    print(f"WARN no verified logo downloaded for {slug}", file=sys.stderr)
    return None


def main() -> int:
    manifest = {"version": 1, "logos": {}}
    for slug, cfg in BRANDS.items():
        item = sync_brand(slug, cfg)
        if item:
            manifest["logos"][slug] = item
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

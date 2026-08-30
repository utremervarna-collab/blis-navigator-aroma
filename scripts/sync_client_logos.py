#!/usr/bin/env python3
"""Sync real client brand logos into static/client-logos from official websites.

Only artwork exposed by the brand's own official website is accepted. The sync
never creates initials, generated marks, favicons, or third-party substitutes.
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static" / "client-logos"
OUT.mkdir(parents=True, exist_ok=True)

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
)

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
        "require_logo_hint": True,
    },
    "varna-towers": {
        "home": "https://www.varnatowers.bg/",
        "tokens": ["varna", "tower", "towers"],
        "fallbacks": [],
        "require_logo_hint": True,
    },
    "mollox": {
        "home": "https://mollox.bg/",
        "tokens": ["mollox"],
        "fallbacks": [
            "https://mollox.bg/assets/img/logo-mollox.png",
            "https://mollox.bg/wp-content/uploads/2018/05/logo-mollox.png",
        ],
    },
    "everbet": {
        "home": "https://everbet.bg/",
        "tokens": ["everbet"],
        "fallbacks": [
            "https://everbet.bg/assets/icons/logo-left-column-dark.svg",
            "https://everbet.bg/assets/icons/logo-left-column-light.svg",
        ],
        "require_logo_hint": True,
    },
}


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images: list[dict[str, str]] = []
        self.stylesheets: list[str] = []

    @staticmethod
    def _attrs(attrs) -> dict[str, str]:
        return {str(k).lower(): str(v or "") for k, v in attrs}

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        d = self._attrs(attrs)
        if tag == "img":
            src = (
                d.get("src")
                or d.get("data-src")
                or d.get("data-lazy-src")
                or d.get("data-original")
            )
            if src:
                d["src"] = src
                self.images.append(d)
            srcset = d.get("srcset") or d.get("data-srcset")
            if srcset:
                for item in srcset.split(","):
                    u = item.strip().split()[0] if item.strip() else ""
                    if u:
                        clone = dict(d)
                        clone["src"] = u
                        self.images.append(clone)
        elif tag == "source":
            srcset = d.get("srcset") or d.get("data-srcset") or d.get("src")
            if srcset:
                for item in srcset.split(","):
                    u = item.strip().split()[0] if item.strip() else ""
                    if u:
                        clone = dict(d)
                        clone["src"] = u
                        self.images.append(clone)
        elif tag == "link":
            rel = d.get("rel", "").lower()
            href = d.get("href", "")
            if href and "stylesheet" in rel:
                self.stylesheets.append(href)


def fetch(url: str, limit: int = 4_000_000) -> tuple[bytes, str]:
    req = Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "bg-BG,bg;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
        },
    )
    with urlopen(req, timeout=25) as r:
        data = r.read(limit + 1)
        if len(data) > limit:
            raise ValueError(f"asset too large: {url}")
        return data, (r.headers.get_content_type() or "application/octet-stream").lower()


def score_img(img: dict[str, str], tokens: list[str]) -> int:
    src = img.get("src", "").lower()
    alt = img.get("alt", "").lower()
    cls = (img.get("class", "") + " " + img.get("id", "")).lower()
    title = img.get("title", "").lower()
    hay = " ".join([src, alt, cls, title])
    score = 0
    if "logo" in src: score += 120
    if "logo" in cls: score += 100
    if "brand" in cls: score += 40
    if "logo" in alt: score += 100
    if "brand" in alt: score += 35
    if "logo" in title: score += 80
    if any(t in alt for t in tokens): score += 80
    if any(t in title for t in tokens): score += 55
    if any(t in src for t in tokens): score += 45
    if all(t in hay for t in tokens[:2]): score += 20
    if any(x in src for x in ["favicon", "icon-", "sprite", "payment", "partner", "tenant"]):
        score -= 150
    return score


def has_logo_hint(img: dict[str, str]) -> bool:
    hay = " ".join([
        img.get("src", ""), img.get("alt", ""), img.get("class", ""),
        img.get("id", ""), img.get("title", "")
    ]).lower()
    return "logo" in hay or "brand" in hay


def css_logo_candidates(home: str, stylesheet_urls: list[str]) -> list[str]:
    out: list[str] = []
    for href in stylesheet_urls[:10]:
        css_url = urljoin(home, href)
        try:
            body, _ = fetch(css_url, limit=2_000_000)
            text = body.decode("utf-8", "ignore")
        except Exception as e:
            print(f"WARN stylesheet {css_url}: {e}", file=sys.stderr)
            continue
        for m in re.finditer(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", text, flags=re.I):
            raw = m.group(1).strip()
            if not raw or raw.startswith("data:"):
                continue
            context = text[max(0, m.start() - 260):m.end() + 120].lower()
            if "logo" not in context and "brand" not in context and not re.search(r"(?:logo|brand)", raw, re.I):
                continue
            u = urljoin(css_url, raw)
            if u.startswith("http") and u not in out:
                out.append(u)
    return out


def discover(home: str, tokens: list[str], require_logo_hint: bool = False) -> list[str]:
    try:
        body, _ = fetch(home)
        text = body.decode("utf-8", "ignore")
    except Exception as e:
        print(f"WARN homepage {home}: {e}", file=sys.stderr)
        return []

    parser = AssetParser()
    parser.feed(text)
    ranked = sorted(parser.images, key=lambda x: score_img(x, tokens), reverse=True)
    out: list[str] = []

    for img in ranked:
        if score_img(img, tokens) < 45:
            continue
        if require_logo_hint and not has_logo_hint(img):
            continue
        u = urljoin(home, img["src"])
        if u.startswith("http") and u not in out:
            out.append(u)

    # Explicit asset URLs carrying a logo/brand semantic in the official markup.
    patterns = [
        r"(?:src|href|content)=[\"']([^\"']*(?:logo|brand)[^\"']*\.(?:svg|png|webp|jpe?g)(?:\?[^\"']*)?)[\"']",
        r"[\"']([^\"']*/(?:logo|brand)[^\"']*\.(?:svg|png|webp|jpe?g)(?:\?[^\"']*)?)[\"']",
    ]
    for pattern in patterns:
        for m in re.findall(pattern, text, flags=re.I):
            u = urljoin(home, m)
            if u.startswith("http") and u not in out:
                out.append(u)

    # Old sites often expose the actual masthead logo only as a CSS background.
    for u in css_logo_candidates(home, parser.stylesheets):
        if u not in out:
            out.append(u)

    return out[:24]


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
    if data.lstrip().startswith(b"<svg") or b"<svg" in data[:500].lower():
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
        head = data[:2500].lower()
        return b"<svg" in head and b"<html" not in head
    if ext == ".png":
        return data.startswith(b"\x89PNG")
    if ext == ".jpg":
        return data.startswith(b"\xff\xd8\xff")
    if ext == ".webp":
        return data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    return True


def sync_brand(slug: str, cfg: dict) -> dict | None:
    strict = bool(cfg.get("require_logo_hint"))
    discovered = discover(cfg["home"], cfg["tokens"], strict)
    candidates: list[tuple[str, bool]] = [(u, True) for u in discovered]
    candidates += [(u, bool(re.search(r"(?:logo|brand)", u, flags=re.I))) for u in cfg.get("fallbacks", [])]
    seen: set[str] = set()

    for url, verified_hint in candidates:
        if url in seen:
            continue
        seen.add(url)
        if strict and not verified_hint:
            continue
        try:
            data, ctype = fetch(url)
            ext = ext_for(url, ctype, data)
            if not valid_image(data, ext):
                continue
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
    manifest = {"version": 3, "logos": {}}
    for slug, cfg in BRANDS.items():
        item = sync_brand(slug, cfg)
        if item:
            manifest["logos"][slug] = item
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

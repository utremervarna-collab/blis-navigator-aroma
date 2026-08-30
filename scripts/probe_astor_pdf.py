#!/usr/bin/env python3
"""Diagnostic-only inspection of Astor Garden's official PDF artwork."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.request import Request, urlopen

import fitz

URL = "https://astorgardenhotel.com/images/eacb3a8fe620246fec1448635d7096cda874b4fe.pdf"
OUT = Path("/tmp/astor-logo-probe")
OUT.mkdir(parents=True, exist_ok=True)

req = Request(URL, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/pdf"})
with urlopen(req, timeout=30) as r:
    raw = r.read(25_000_000)

(OUT / "source.txt").write_text(URL + "\n", encoding="utf-8")
(OUT / "source.pdf").write_bytes(raw)

doc = fitz.open(stream=raw, filetype="pdf")
meta = {"source": URL, "pdf_bytes": len(raw), "pages": doc.page_count, "page_data": [], "images": []}
seen = set()

for idx, page in enumerate(doc):
    n = idx + 1
    page.get_pixmap(matrix=fitz.Matrix(2.4, 2.4), alpha=False).save(OUT / f"page-{n}.png")
    top = fitz.Rect(0, 0, page.rect.width, min(page.rect.height * 0.45, page.rect.height))
    page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=top, alpha=True).save(OUT / f"page-{n}-top.png")
    drawings = page.get_drawings()
    text = page.get_text("text") or ""
    page_meta = {
        "page": n,
        "width": float(page.rect.width),
        "height": float(page.rect.height),
        "drawings": len(drawings),
        "images": len(page.get_images(full=True)),
        "text": text[:5000],
    }
    meta["page_data"].append(page_meta)
    for item in page.get_images(full=True):
        xref = int(item[0])
        if xref in seen:
            continue
        seen.add(xref)
        try:
            data = doc.extract_image(xref)
        except Exception:
            continue
        blob = data.get("image") or b""
        if not blob:
            continue
        ext = str(data.get("ext") or "bin").lower()
        name = f"image-xref-{xref}.{ext}"
        (OUT / name).write_bytes(blob)
        rects = [list(map(float, r)) for r in page.get_image_rects(xref)]
        meta["images"].append({
            "xref": xref,
            "first_page": n,
            "file": name,
            "width": int(data.get("width") or 0),
            "height": int(data.get("height") or 0),
            "rects": rects,
        })

(OUT / "manifest.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("ASTOR PDF pages:", doc.page_count, "embedded images:", len(meta["images"]), "bytes:", len(raw))
for p in meta["page_data"]:
    print("PAGE", p["page"], "drawings", p["drawings"], "images", p["images"], "text", len(p["text"]))

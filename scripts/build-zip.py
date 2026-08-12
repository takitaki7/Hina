#!/usr/bin/env python3
"""Package the Hina extension into a Chrome Web Store zip (manifest at root).
Excludes store/ screenshots and README.md. Usage: python3 scripts/build-zip.py"""
import zipfile, os, json, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(root, "extension")
ver = json.load(open(os.path.join(src, "manifest.json")))["version"]
os.makedirs(os.path.join(root, "dist"), exist_ok=True)
out = os.path.join(root, "dist", f"hina-chrome-v{ver}.zip")
items = []
for base, _, files in os.walk(src):
    for f in files:
        rel = os.path.relpath(os.path.join(base, f), src)
        # exclude store screenshots, README, the 512px listing icon (uploaded
        # separately, not referenced by the manifest), and OS cruft
        if (rel.startswith("store" + os.sep) or rel == "README.md"
                or rel == os.path.join("icons", "icon512.png") or f == ".DS_Store"):
            continue
        items.append((os.path.join(base, f), rel))
items.sort(key=lambda x: x[1])
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for p, rel in items:
        z.write(p, rel)
print(f"wrote {os.path.relpath(out, root)} ({round(os.path.getsize(out)/1024,1)} KB, {len(items)} files)")

#!/usr/bin/env python3
import base64
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip()
OUTPUT = Path("automation-output")
OUTPUT.mkdir(exist_ok=True)

COLLECTIONS = [
    {
        "slug": "somehow",
        "title": "SOMEHOW",
        "subtitle": "I MADE IT THROUGH WHAT WAS SUPPOSED TO BREAK ME",
        "description": "A StormAndMe statement piece inspired by perseverance, survival, faith, and making it through what was supposed to break you.",
    },
    {
        "slug": "house-pain-built",
        "title": "THE HOUSE THAT PAIN BUILT",
        "subtitle": "BUILT FROM EVERY STORM I SURVIVED",
        "description": "A bold StormAndMe design for everyone who turned pain into structure, scars into strength, and survival into a foundation.",
    },
]

PRODUCTS = [
    {"kind": "tee", "label": "Classic Streetwear Tee", "blueprint_terms": [["unisex", "heavy", "cotton", "tee"], ["unisex", "t-shirt"], ["tee"]], "price": 3399, "colors": ["black", "dark heather", "charcoal"], "sizes": ["s", "m", "l", "xl", "2xl", "3xl"]},
    {"kind": "hoodie", "label": "Heavyweight Hoodie", "blueprint_terms": [["unisex", "heavy", "hoodie"], ["hooded sweatshirt"], ["hoodie"]], "price": 5999, "colors": ["black", "dark heather", "charcoal"], "sizes": ["s", "m", "l", "xl", "2xl", "3xl"]},
    {"kind": "mug", "label": "Ceramic Mug 11oz", "blueprint_terms": [["ceramic", "mug", "11oz"], ["mug", "11"], ["mug"]], "price": 1699, "colors": [], "sizes": []},
    {"kind": "canvas", "label": "Gallery Canvas Wrap", "blueprint_terms": [["gallery", "canvas"], ["canvas", "wrap"], ["canvas"]], "price": 3999, "colors": [], "sizes": []},
]


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}", data=data, method=method,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json", "User-Agent": "StormAndMe-Automation/2.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def font(size, italic=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf" if italic else "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-BoldItalic.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ]
    for path in paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def centered(draw, text, y, fnt, fill, stroke=0):
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke)
    x = (4500 - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=fnt, fill=fill, stroke_width=stroke, stroke_fill=(15, 15, 15, 255))


def make_artwork(collection):
    W = H = 4500
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if collection["slug"] == "somehow":
        cloud = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(cloud)
        import random
        random.seed(7)
        for _ in range(125):
            x, y = random.randint(700, 3800), random.randint(1050, 3000)
            rx, ry = random.randint(100, 450), random.randint(60, 220)
            shade = random.randint(170, 235)
            cd.ellipse((x-rx, y-ry, x+rx, y+ry), fill=(shade, shade, shade, random.randint(12, 45)))
        img.alpha_composite(cloud.filter(ImageFilter.GaussianBlur(16)))
        d = ImageDraw.Draw(img)
        for _ in range(24):
            x1, y1 = random.randint(650, 1400), random.randint(1450, 2450)
            x2, y2 = random.randint(3000, 3900), y1 + random.randint(-180, 180)
            d.line((x1, y1, x2, y2), fill=(240, 240, 240, random.randint(55, 120)), width=random.randint(14, 38))
        centered(d, "SOMEHOW", 1350, font(620, True), (248, 248, 248, 255), 10)
        centered(d, "I MADE IT THROUGH", 2280, font(220), (220, 175, 70, 255), 5)
        centered(d, "WHAT WAS SUPPOSED TO BREAK ME", 2580, font(180), (248, 248, 248, 255), 5)
    else:
        centered(d, "THE HOUSE", 340, font(410), (225, 178, 74, 255), 8)
        centered(d, "THAT PAIN BUILT", 800, font(410), (225, 178, 74, 255), 8)
        d.polygon([(1250,3350),(1250,2150),(1850,1600),(2400,2150),(2400,1500),(2850,1500),(2850,2400),(3250,2400),(3250,3350)], fill=(25,25,25,255))
        d.polygon([(1050,2250),(1850,1450),(2600,2250)], fill=(15,15,15,255))
        d.polygon([(2250,1550),(2580,1200),(3020,1550)], fill=(15,15,15,255))
        d.rectangle((2730,1120,2850,1580), fill=(20,20,20,255))
        for box in [(1500,2380,1760,2740),(1990,2340,2250,2710),(2510,1840,2720,2160),(2800,2730,3020,3060)]:
            d.rectangle(box, fill=(235,125,35,240))
            mx, my = (box[0]+box[2])//2, (box[1]+box[3])//2
            d.line((mx,box[1],mx,box[3]), fill=(30,20,15,255), width=18)
            d.line((box[0],my,box[2],my), fill=(30,20,15,255), width=18)
        d.rectangle((2240,2730,2580,3350), fill=(8,8,8,255))
        d.ellipse((2500,3040,2540,3080), fill=(230,145,55,255))
        for bx in (800, 3650):
            d.line((bx,3400,bx,1850), fill=(28,28,28,255), width=42)
            for j in range(6):
                y = 2050 + j*190
                side = -1 if j % 2 == 0 else 1
                d.line((bx,y,bx+side*(250+j*20),y-180), fill=(28,28,28,255), width=18)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def resolve_shop_id():
    if SHOP_ID:
        return SHOP_ID
    shops = request("GET", "/shops.json")
    if not shops:
        raise RuntimeError("No Printify shop found")
    preferred = [s for s in shops if "storm" in s.get("title", "").lower()]
    return str((preferred[0] if preferred else shops[0])["id"])


def all_existing(shop_id):
    items, page = [], 1
    while True:
        result = request("GET", f"/shops/{shop_id}/products.json?limit=50&page={page}")
        data = result.get("data", []) if isinstance(result, dict) else []
        items.extend(data)
        if not data or page >= int(result.get("last_page", page)):
            break
        page += 1
    return items


def choose_blueprint(blueprints, term_sets):
    for terms in term_sets:
        matches = []
        for bp in blueprints:
            title = bp.get("title", "").lower()
            if all(term in title for term in terms):
                matches.append(bp)
        if matches:
            return matches[0]
    raise RuntimeError(f"No catalog blueprint matched {term_sets}")


def choose_provider_and_variants(blueprint_id, product):
    providers = request("GET", f"/catalog/blueprints/{blueprint_id}/print_providers.json")
    if isinstance(providers, dict):
        providers = providers.get("data", providers.get("print_providers", []))
    errors = []
    for provider in providers:
        provider_id = provider.get("id")
        try:
            catalog = request("GET", f"/catalog/blueprints/{blueprint_id}/print_providers/{provider_id}/variants.json")
            variants = catalog.get("variants", [])
            placeholders = catalog.get("placeholders", [])
            selected = []
            for v in variants:
                if not v.get("is_available", True):
                    continue
                title = v.get("title", "").lower()
                if product["colors"] and not any(c in title for c in product["colors"]):
                    continue
                if product["sizes"] and not any((f" / {s}" in title or title.endswith(f" {s}") or title.endswith(f"/{s}")) for s in product["sizes"]):
                    continue
                selected.append(v)
            if not selected and not product["colors"]:
                selected = [v for v in variants if v.get("is_available", True)]
            if selected and placeholders:
                return provider_id, selected, placeholders
        except Exception as exc:
            errors.append(str(exc))
    raise RuntimeError(f"No usable provider/variants for blueprint {blueprint_id}: {'; '.join(errors[-3:])}")


def upload_artwork(name, png_bytes):
    payload = {"file_name": name, "contents": base64.b64encode(png_bytes).decode("ascii")}
    return request("POST", "/uploads/images.json", payload)["id"]


def create_and_publish(shop_id, collection, product, image_id, blueprints, existing_titles):
    title = f"{collection['title']} — {product['label']}"
    if title.lower() in existing_titles:
        return {"title": title, "status": "skipped_existing"}
    bp = choose_blueprint(blueprints, product["blueprint_terms"])
    provider_id, variants, placeholders = choose_provider_and_variants(bp["id"], product)
    variant_rows = []
    for index, variant in enumerate(variants):
        variant_rows.append({"id": variant["id"], "price": product["price"], "is_enabled": True, "is_default": index == 0})
    positions = [p.get("position") for p in placeholders if p.get("position")]
    preferred = "front" if "front" in positions else positions[0]
    print_areas = [{
        "variant_ids": [v["id"] for v in variants],
        "placeholders": [{"position": preferred, "images": [{"id": image_id, "x": 0.5, "y": 0.5, "scale": 0.85, "angle": 0}]}],
    }]
    payload = {
        "title": title,
        "description": collection["description"],
        "tags": ["StormAndMe", "Willy Will", "music", "perseverance", collection["slug"]],
        "blueprint_id": int(bp["id"]),
        "print_provider_id": int(provider_id),
        "variants": variant_rows,
        "print_areas": print_areas,
    }
    created = request("POST", f"/shops/{shop_id}/products.json", payload)
    product_id = created["id"]
    request("POST", f"/shops/{shop_id}/products/{product_id}/publish.json", {
        "title": True, "description": True, "images": True, "variants": True, "tags": True, "keyFeatures": True
    })
    return {"title": title, "product_id": product_id, "blueprint": bp.get("title"), "provider_id": provider_id, "variant_count": len(variant_rows), "status": "publish_requested"}


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")
    shop_id = resolve_shop_id()
    existing = all_existing(shop_id)
    existing_titles = {p.get("title", "").lower() for p in existing}
    blueprints = request("GET", "/catalog/blueprints.json")
    if isinstance(blueprints, dict):
        blueprints = blueprints.get("data", blueprints.get("blueprints", []))
    results = []
    for collection in COLLECTIONS:
        artwork = make_artwork(collection)
        image_id = upload_artwork(f"stormandme-{collection['slug']}.png", artwork)
        for product in PRODUCTS:
            try:
                result = create_and_publish(shop_id, collection, product, image_id, blueprints, existing_titles)
                results.append(result)
                if result["status"] != "skipped_existing":
                    existing_titles.add(result["title"].lower())
                time.sleep(1)
            except Exception as exc:
                results.append({"title": f"{collection['title']} — {product['label']}", "status": "failed", "error": str(exc)})
    report = {"shop_id": shop_id, "results": results}
    (OUTPUT / "music-collection-results.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if any(r["status"] == "failed" for r in results):
        raise RuntimeError("One or more products failed. See artifact report.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

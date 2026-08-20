#!/usr/bin/env python3
import base64
import io
import json
import math
import os
import random
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip()
SHOP_URL = "https://storm-and-me-official.printify.me"
LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/7463b3a3-ce4d-4fcb-8b80-776d01ad6286/images/a3d5a538ff81f998f6794bf45162190a817187cbc7de2e5721dad88e66e09e8f.png"
OUTPUT = Path("automation-output")
DATA_PATH = Path("frontend/src/data/rules-products.generated.json")
OUTPUT.mkdir(exist_ok=True)
DATA_PATH.parent.mkdir(parents=True, exist_ok=True)

COLLECTION_NAME = "RULES DON’T EXIST ANYMORE"

PRODUCTS = [
    {
        "id": "rules-black-tee",
        "kind": "tee",
        "label": "Washed Black",
        "title": "Obama 2028 — Vintage Black Statement Tee",
        "description": "Vintage wash. Bold truth. No apologies. A satirical Storm And Me statement tee featuring the Obama 2028 / Rules Don’t Exist Anymore back print and official Storm And Me chest mark. Not affiliated with or endorsed by any political campaign.",
        "price": 3200,
        "palette": "dark",
        "blueprint_terms": [["garment", "dyed", "t-shirt"], ["unisex", "heavy", "cotton", "tee"], ["unisex", "t-shirt"], ["t-shirt"]],
        "colors": ["black", "pepper", "charcoal", "dark"],
        "sizes": ["s", "m", "l", "xl", "2xl", "3xl"],
    },
    {
        "id": "rules-hoodie",
        "kind": "hoodie",
        "label": "Premium Hoodie",
        "title": "Obama 2028 — Statement Hoodie",
        "description": "Premium heavy blend. Comfort meets conviction. A satirical Storm And Me hoodie featuring the Obama 2028 / Rules Don’t Exist Anymore back print and official Storm And Me chest mark. Not affiliated with or endorsed by any political campaign.",
        "price": 6200,
        "palette": "light",
        "blueprint_terms": [["heavy", "blend", "hooded"], ["unisex", "heavy", "hoodie"], ["hooded", "sweatshirt"], ["hoodie"]],
        "colors": ["sand", "cream", "natural", "oatmeal", "ivory", "white"],
        "sizes": ["s", "m", "l", "xl", "2xl", "3xl"],
    },
    {
        "id": "rules-white-tee",
        "kind": "tee",
        "label": "White Tee",
        "title": "Obama 2028 — White Statement Tee",
        "description": "Crisp, clean, and loud. The message speaks for itself. A satirical Storm And Me statement tee featuring the Obama 2028 / Rules Don’t Exist Anymore back print and official Storm And Me chest mark. Not affiliated with or endorsed by any political campaign.",
        "price": 2800,
        "palette": "light",
        "blueprint_terms": [["garment", "dyed", "t-shirt"], ["unisex", "heavy", "cotton", "tee"], ["unisex", "t-shirt"], ["t-shirt"]],
        "colors": ["white"],
        "sizes": ["s", "m", "l", "xl", "2xl", "3xl"],
    },
]


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-Rules-Collection/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": "StormAndMe-Rules-Collection/1.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


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
        rows = result.get("data", []) if isinstance(result, dict) else []
        items.extend(rows)
        if not rows or page >= int(result.get("last_page", page)):
            break
        page += 1
    return items


def font(size):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ]
    for path in paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def centered_text(draw, text, y, fnt, fill, canvas_width=4500, stroke_width=0, stroke_fill=None):
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    width = box[2] - box[0]
    x = (canvas_width - width) // 2
    draw.text((x, y), text, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill or fill)
    return (x, y, x + width, y + (box[3] - box[1]))


def draw_star(draw, cx, cy, radius, fill):
    pts = []
    for i in range(10):
        angle = -math.pi / 2 + i * math.pi / 5
        r = radius if i % 2 == 0 else radius * 0.44
        pts.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
    draw.polygon(pts, fill=fill)


def distress_alpha(img, seed):
    rng = random.Random(seed)
    alpha = img.getchannel("A")
    d = ImageDraw.Draw(alpha)
    for _ in range(1250):
        x = rng.randint(850, 3650)
        y = rng.randint(450, 4550)
        w = rng.randint(8, 55)
        h = rng.randint(3, 18)
        shade = rng.randint(0, 110)
        d.rectangle((x, y, x + w, y + h), fill=shade)
    img.putalpha(alpha)
    return img


def make_back_art(palette):
    W, H = 4500, 5400
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if palette == "dark":
        primary = (242, 233, 214, 255)
        secondary = (181, 48, 43, 255)
    else:
        primary = (20, 48, 88, 255)
        secondary = (183, 43, 48, 255)

    centered_text(d, "OBAMA", 500, font(650), primary)
    centered_text(d, "2028", 1240, font(770), primary)
    draw_star(d, 820, 1670, 220, secondary)
    draw_star(d, 3680, 1670, 220, secondary)

    stripe_y = 2110
    for offset, color, height in [(0, primary, 42), (95, secondary, 70), (215, primary, 42)]:
        y = stripe_y + offset
        d.rounded_rectangle((700, y, 1710, y + height), radius=18, fill=color)
        d.rounded_rectangle((2790, y, 3800, y + height), radius=18, fill=color)

    centered_text(d, "SINCE", 2030, font(370), primary)
    centered_text(d, "RULES DON'T", 2730, font(470), secondary)
    centered_text(d, "EXIST ANYMORE", 3350, font(390), primary)

    # Small lower divider echoes the approved patriotic treatment without competing with the punchline.
    d.rounded_rectangle((1220, 4090, 3280, 4138), radius=16, fill=primary)
    d.rounded_rectangle((1530, 4200, 2970, 4268), radius=18, fill=secondary)

    return distress_alpha(img, 2028 if palette == "light" else 2029)


def transparent_logo_bytes():
    raw = fetch_bytes(LOGO_URL)
    logo = Image.open(io.BytesIO(raw)).convert("RGBA")
    alpha = logo.getchannel("A")
    if alpha.getextrema()[0] == 255:
        bg = logo.getpixel((0, 0))[:3]
        px = logo.load()
        for y in range(logo.height):
            for x in range(logo.width):
                r, g, b, a = px[x, y]
                dist = math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
                if dist < 52:
                    px[x, y] = (r, g, b, 0)
                elif dist < 88:
                    px[x, y] = (r, g, b, int(a * (dist - 52) / 36))
    bbox = logo.getbbox()
    if not bbox:
        raise RuntimeError("Official Storm And Me logo became empty after background cleanup")
    logo = logo.crop(bbox)
    out = Image.new("RGBA", (2400, 2400), (0, 0, 0, 0))
    logo.thumbnail((1900, 1900), Image.Resampling.LANCZOS)
    out.alpha_composite(logo, ((2400 - logo.width) // 2, (2400 - logo.height) // 2))
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def png_bytes(image):
    buf = io.BytesIO()
    image.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def upload_artwork(name, raw):
    return request("POST", "/uploads/images.json", {
        "file_name": name,
        "contents": base64.b64encode(raw).decode("ascii"),
    })["id"]


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


def size_match(title, sizes):
    low = title.lower().replace("xxl", "2xl").replace("xxxl", "3xl")
    tokens = set(re.split(r"[^a-z0-9]+", low))
    return any(s in tokens for s in sizes)


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
            positions = {p.get("position") for p in placeholders}
            if not {"front", "back"}.issubset(positions):
                continue
            selected = []
            for variant in variants:
                if not variant.get("is_available", True):
                    continue
                title = variant.get("title", "").lower()
                if not any(color in title for color in product["colors"]):
                    continue
                if not size_match(title, product["sizes"]):
                    continue
                selected.append(variant)
            if selected:
                # Keep a single garment color family per listing, with all selected sizes.
                first_title = selected[0].get("title", "").lower()
                first_color = next((c for c in product["colors"] if c in first_title), product["colors"][0])
                same_color = [v for v in selected if first_color in v.get("title", "").lower()]
                return provider_id, (same_color or selected), placeholders
        except Exception as exc:
            errors.append(str(exc))
    raise RuntimeError(f"No usable provider/variants for blueprint {blueprint_id}: {'; '.join(errors[-3:])}")


def existing_product_by_title(shop_id, title):
    for product in all_existing(shop_id):
        if product.get("title", "").strip().lower() == title.strip().lower():
            return request("GET", f"/shops/{shop_id}/products/{product['id']}.json")
    return None


def create_product(shop_id, product, back_image_id, logo_image_id, blueprints):
    existing = existing_product_by_title(shop_id, product["title"])
    if existing:
        return existing, "existing"

    blueprint = choose_blueprint(blueprints, product["blueprint_terms"])
    provider_id, variants, placeholders = choose_provider_and_variants(blueprint["id"], product)
    variant_ids = [v["id"] for v in variants]
    variant_rows = [
        {
            "id": variant["id"],
            "price": product["price"],
            "is_enabled": True,
            "is_default": index == 0,
        }
        for index, variant in enumerate(variants)
    ]

    print_areas = [{
        "variant_ids": variant_ids,
        "placeholders": [
            {
                "position": "back",
                "images": [{"id": back_image_id, "x": 0.5, "y": 0.5, "scale": 0.90, "angle": 0}],
            },
            {
                "position": "front",
                "images": [{"id": logo_image_id, "x": 0.33, "y": 0.28, "scale": 0.22, "angle": 0}],
            },
        ],
    }]

    payload = {
        "title": product["title"],
        "description": product["description"],
        "tags": ["Storm And Me", "satire", "Obama 2028", "Rules Don’t Exist Anymore"],
        "blueprint_id": int(blueprint["id"]),
        "print_provider_id": int(provider_id),
        "variants": variant_rows,
        "print_areas": print_areas,
    }
    created = request("POST", f"/shops/{shop_id}/products.json", payload)
    product_id = created["id"]
    request("POST", f"/shops/{shop_id}/products/{product_id}/publish.json", {
        "title": True,
        "description": True,
        "images": True,
        "variants": True,
        "tags": True,
        "keyFeatures": True,
    })
    return request("GET", f"/shops/{shop_id}/products/{product_id}.json"), "created"


def poll_product(shop_id, product_id):
    latest = {}
    for _ in range(18):
        latest = request("GET", f"/shops/{shop_id}/products/{product_id}.json")
        if latest.get("images"):
            return latest
        time.sleep(5)
    return latest


def choose_back_image(product):
    images = product.get("images", [])
    for image in images:
        if str(image.get("position", "")).lower() == "back" and image.get("src"):
            return image["src"]
    for image in images:
        src = image.get("src", "")
        if "back" in src.lower():
            return src
    for image in images:
        if image.get("src"):
            return image["src"]
    return ""


def choose_product_url(product):
    for key in ("url", "external_url"):
        value = product.get(key)
        if isinstance(value, str) and value.startswith("http"):
            return value
    external = product.get("external") or {}
    if isinstance(external, dict):
        for key in ("url", "link"):
            value = external.get(key)
            if isinstance(value, str) and value.startswith("http"):
                return value
        external_id = external.get("id")
        if external_id:
            return f"{SHOP_URL}/product/{external_id}"
    return SHOP_URL


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    shop_id = resolve_shop_id()
    blueprints = request("GET", "/catalog/blueprints.json")
    if isinstance(blueprints, dict):
        blueprints = blueprints.get("data", blueprints.get("blueprints", []))

    logo_id = upload_artwork("storm-and-me-official-chest-mark.png", transparent_logo_bytes())
    art_ids = {
        "light": upload_artwork("obama-2028-rules-light-back.png", png_bytes(make_back_art("light"))),
        "dark": upload_artwork("obama-2028-rules-dark-back.png", png_bytes(make_back_art("dark"))),
    }

    results = []
    site_products = []
    for spec in PRODUCTS:
        product, action = create_product(shop_id, spec, art_ids[spec["palette"]], logo_id, blueprints)
        product = poll_product(shop_id, product["id"])
        image_url = choose_back_image(product)
        product_url = choose_product_url(product)
        if not image_url:
            raise RuntimeError(f"Printify did not return a product mockup image for {spec['title']}")
        site_products.append({
            "id": spec["id"],
            "printify_product_id": product["id"],
            "title": spec["title"],
            "label": spec["label"],
            "price_cents": spec["price"],
            "price": f"${spec['price'] / 100:.2f}",
            "image": image_url,
            "url": product_url,
            "description": spec["description"].split(". A satirical", 1)[0] + ".",
            "visible": bool(product.get("visible", True)),
        })
        results.append({
            "id": spec["id"],
            "product_id": product["id"],
            "title": product.get("title", spec["title"]),
            "action": action,
            "image": image_url,
            "url": product_url,
            "visible": product.get("visible"),
            "variant_count": len(product.get("variants", [])),
        })
        time.sleep(2)

    payload = {
        "collection": COLLECTION_NAME,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "products": site_products,
    }
    DATA_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    (OUTPUT / "rules-collection-results.json").write_text(json.dumps({"shop_id": shop_id, "results": results}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"shop_id": shop_id, "results": results}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

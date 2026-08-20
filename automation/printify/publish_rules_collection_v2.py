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
# This is the StormAndMe Printify *storefront* sales channel. A similarly named
# Shopify channel (26840227) is not the public Printify store used by the site.
OFFICIAL_SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip() or "28312107"
WRONG_SHOP_ID = "26840227"
SHOP_URL = "https://storm-and-me-official.printify.me"
SOURCE_TEE_ID = "6a7bd33e44cf7ff645047bd3"
LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/7463b3a3-ce4d-4fcb-8b80-776d01ad6286/images/a3d5a538ff81f998f6794bf45162190a817187cbc7de2e5721dad88e66e09e8f.png"
OUT = Path("automation-output")
DATA = Path("frontend/src/data/rules-products.generated.json")
OUT.mkdir(exist_ok=True)
DATA.parent.mkdir(parents=True, exist_ok=True)
COLLECTION = "RULES DON’T EXIST ANYMORE"
SIZES = ["s", "m", "l", "xl", "2xl", "3xl"]

PRODUCTS = [
    {
        "id": "rules-black-tee",
        "kind": "tee",
        "label": "Washed Black",
        "title": "Obama 2028 — Vintage Black Statement Tee",
        "price": 3200,
        "palette": "dark",
        "color": "pepper",
        "description": "Vintage wash. Bold truth. No apologies.",
    },
    {
        "id": "rules-hoodie",
        "kind": "hoodie",
        "label": "Premium Hoodie",
        "title": "Obama 2028 — Statement Hoodie",
        "price": 6200,
        "palette": "light",
        "color": "sand",
        "description": "Premium heavy blend. Comfort meets conviction.",
    },
    {
        "id": "rules-white-tee",
        "kind": "tee",
        "label": "White Tee",
        "title": "Obama 2028 — White Statement Tee",
        "price": 2800,
        "palette": "light",
        "color": "white",
        "description": "Crisp, clean, and loud. The message speaks for itself.",
    },
]


def request(method, path, payload=None):
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-Rules/3.0",
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
    req = urllib.request.Request(url, headers={"User-Agent": "StormAndMe-Rules/3.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def font(size):
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def centered_text(draw, text, y, text_font, fill, width=4500):
    box = draw.textbbox((0, 0), text, font=text_font)
    text_width = box[2] - box[0]
    draw.text(((width - text_width) // 2, y), text, font=text_font, fill=fill)


def draw_star(draw, cx, cy, radius, fill):
    points = []
    for i in range(10):
        angle = -math.pi / 2 + i * math.pi / 5
        r = radius if i % 2 == 0 else radius * 0.44
        points.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
    draw.polygon(points, fill=fill)


def official_logo_rgba():
    logo = Image.open(io.BytesIO(fetch_bytes(LOGO_URL))).convert("RGBA")
    alpha = logo.getchannel("A")
    if alpha.getextrema()[0] == 255:
        bg = logo.getpixel((0, 0))[:3]
        pixels = logo.load()
        for y in range(logo.height):
            for x in range(logo.width):
                r, g, b, a = pixels[x, y]
                distance = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
                if distance < 52:
                    pixels[x, y] = (r, g, b, 0)
                elif distance < 88:
                    pixels[x, y] = (r, g, b, int(a * (distance - 52) / 36))
    bbox = logo.getbbox()
    if not bbox:
        raise RuntimeError("Official Storm And Me logo cleanup produced empty art")
    return logo.crop(bbox)


def back_art(palette, logo_source):
    width, height = 4500, 5400
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    primary = (242, 233, 214, 255) if palette == "dark" else (20, 48, 88, 255)
    red = (183, 43, 48, 255)

    # Approved collection treatment: small full Storm And Me cloud/lightning mark
    # at the upper back, then the oversized statement print below it.
    logo = logo_source.copy()
    logo.thumbnail((720, 720), Image.Resampling.LANCZOS)
    image.alpha_composite(logo, ((width - logo.width) // 2, 80))

    centered_text(draw, "OBAMA", 820, font(650), primary)
    centered_text(draw, "2028", 1510, font(760), primary)
    draw_star(draw, 820, 1880, 220, red)
    draw_star(draw, 3680, 1880, 220, red)

    for offset, color, stripe_height in [(0, primary, 42), (95, red, 70), (215, primary, 42)]:
        y = 2310 + offset
        draw.rounded_rectangle((700, y, 1710, y + stripe_height), radius=18, fill=color)
        draw.rounded_rectangle((2790, y, 3800, y + stripe_height), radius=18, fill=color)

    centered_text(draw, "SINCE", 2230, font(370), primary)
    centered_text(draw, "RULES DON'T", 2960, font(470), red)
    centered_text(draw, "EXIST ANYMORE", 3580, font(390), primary)

    # Gentle vintage distress so the real DTG mockups match the approved preview.
    rng = random.Random(2028 if palette == "light" else 2029)
    alpha = image.getchannel("A")
    alpha_draw = ImageDraw.Draw(alpha)
    for _ in range(1100):
        x = rng.randint(850, 3650)
        y = rng.randint(800, 4150)
        w = rng.randint(8, 55)
        h = rng.randint(3, 18)
        alpha_draw.rectangle((x, y, x + w, y + h), fill=rng.randint(0, 120))
    image.putalpha(alpha)
    return image


def png_bytes(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def chest_logo_bytes(logo_source):
    canvas = Image.new("RGBA", (2400, 2400), (0, 0, 0, 0))
    logo = logo_source.copy()
    logo.thumbnail((1900, 1900), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo, ((2400 - logo.width) // 2, (2400 - logo.height) // 2))
    return png_bytes(canvas)


def upload(name, raw):
    response = request(
        "POST",
        "/uploads/images.json",
        {"file_name": name, "contents": base64.b64encode(raw).decode("ascii")},
    )
    return response["id"]


def normalized_size_tokens(title):
    low = title.lower().replace("xxxl", "3xl").replace("xxl", "2xl")
    return set(re.split(r"[^a-z0-9]+", low))


def select_variants(rows, color):
    selected = []
    for variant in rows:
        if not variant.get("is_available", True):
            continue
        title = variant.get("title", "").lower()
        if color not in title:
            continue
        if not any(size in normalized_size_tokens(title) for size in SIZES):
            continue
        selected.append(variant)
    return selected


def list_products(shop_id):
    rows = []
    page = 1
    while True:
        result = request("GET", f"/shops/{shop_id}/products.json?limit=50&page={page}")
        batch = result.get("data", []) if isinstance(result, dict) else []
        rows.extend(batch)
        if not batch or page >= int(result.get("last_page", page)):
            break
        page += 1
    return rows


def cleanup_wrong_channel():
    # Earlier test runs accidentally targeted the similarly named Shopify channel.
    # Remove only the three titles owned by this feature; never touch other products.
    try:
        for product in list_products(WRONG_SHOP_ID):
            if product.get("title") in {spec["title"] for spec in PRODUCTS}:
                request("DELETE", f"/shops/{WRONG_SHOP_ID}/products/{product['id']}.json")
                print(f"Removed accidental test product {product['id']} from Shopify channel {WRONG_SHOP_ID}")
    except Exception as exc:
        print(f"Warning: wrong-channel cleanup skipped: {exc}")


def exact_matches(shop_id, title):
    return [p for p in list_products(shop_id) if p.get("title", "").strip().lower() == title.strip().lower()]


def dedupe_and_get_existing(shop_id, title):
    matches = exact_matches(shop_id, title)
    if not matches:
        return None
    full = [request("GET", f"/shops/{shop_id}/products/{p['id']}.json") for p in matches]
    # Prefer a product that already has a public storefront handle.
    full.sort(key=lambda p: bool((p.get("external") or {}).get("handle")), reverse=True)
    keeper = full[0]
    for duplicate in full[1:]:
        request("DELETE", f"/shops/{shop_id}/products/{duplicate['id']}.json")
        print(f"Removed duplicate storefront product {duplicate['id']} ({title})")
    return keeper


def tee_catalog_from_store(color):
    # Clone catalog identity from a product already proven live on this exact storefront.
    source = request("GET", f"/shops/{OFFICIAL_SHOP_ID}/products/{SOURCE_TEE_ID}.json")
    variants = select_variants(source.get("variants", []), color)
    if not variants:
        raise RuntimeError(f"Official storefront tee source has no {color} variants")
    return int(source["blueprint_id"]), int(source["print_provider_id"]), variants


def hoodie_catalog():
    # Proven by catalog probe: adult Gildan 18500-style heavy blend pullover in Sand.
    blueprint_id, provider_id, color = 77, 217, "sand"
    catalog = request("GET", f"/catalog/blueprints/{blueprint_id}/print_providers/{provider_id}/variants.json")
    variants = select_variants(catalog.get("variants", []), color)
    if not variants:
        raise RuntimeError("Official hoodie catalog selection no longer exposes Sand S–3XL variants")
    return blueprint_id, provider_id, variants, color


def create_product(shop_id, spec, back_image_id, chest_logo_id, hoodie_choice):
    existing = dedupe_and_get_existing(shop_id, spec["title"])
    if existing:
        return existing, "existing"

    if spec["kind"] == "tee":
        blueprint_id, provider_id, variants = tee_catalog_from_store(spec["color"])
    else:
        blueprint_id, provider_id, variants, actual_color = hoodie_choice
        spec["color"] = actual_color

    variant_rows = [
        {
            "id": variant["id"],
            "price": spec["price"],
            "is_enabled": True,
            "is_default": index == 0,
        }
        for index, variant in enumerate(variants)
    ]
    variant_ids = [variant["id"] for variant in variants]
    payload = {
        "title": spec["title"],
        "description": spec["description"]
        + " Satirical apparel concept. Not affiliated with, endorsed by, or connected to any political campaign.",
        "tags": ["Storm And Me", "satire", "Obama 2028", "Rules Don’t Exist Anymore"],
        "blueprint_id": blueprint_id,
        "print_provider_id": provider_id,
        "variants": variant_rows,
        "print_areas": [
            {
                "variant_ids": variant_ids,
                "placeholders": [
                    {
                        "position": "back",
                        "images": [{"id": back_image_id, "x": 0.5, "y": 0.5, "scale": 0.94, "angle": 0}],
                    },
                    {
                        "position": "front",
                        "images": [{"id": chest_logo_id, "x": 0.33, "y": 0.28, "scale": 0.22, "angle": 0}],
                    },
                ],
            }
        ],
    }
    created = request("POST", f"/shops/{shop_id}/products.json", payload)
    product_id = created["id"]
    request(
        "POST",
        f"/shops/{shop_id}/products/{product_id}/publish.json",
        {"title": True, "description": True, "images": True, "variants": True, "tags": True, "keyFeatures": True},
    )
    return request("GET", f"/shops/{shop_id}/products/{product_id}.json"), "created"


def poll_for_storefront(shop_id, product_id, attempts=36):
    latest = {}
    for _ in range(attempts):
        latest = request("GET", f"/shops/{shop_id}/products/{product_id}.json")
        external = latest.get("external") or {}
        if latest.get("images") and external.get("handle"):
            return latest
        time.sleep(5)
    return latest


def back_image(product):
    for image in product.get("images", []):
        if str(image.get("position", "")).lower() == "back" and image.get("src"):
            return image["src"]
    return ""


def storefront_url(product):
    external = product.get("external") or {}
    handle = external.get("handle") if isinstance(external, dict) else None
    if isinstance(handle, str) and handle.startswith("http"):
        return handle
    external_id = external.get("id") if isinstance(external, dict) else None
    return f"{SHOP_URL}/product/{external_id}" if external_id else ""


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    cleanup_wrong_channel()
    logo = official_logo_rgba()
    chest_logo_id = upload("storm-and-me-official-chest-mark.png", chest_logo_bytes(logo))
    art_ids = {
        "light": upload("obama-2028-rules-light-back.png", png_bytes(back_art("light", logo))),
        "dark": upload("obama-2028-rules-dark-back.png", png_bytes(back_art("dark", logo))),
    }
    hoodie_choice = hoodie_catalog()

    created_products = []
    for spec in PRODUCTS:
        product, action = create_product(
            OFFICIAL_SHOP_ID,
            spec,
            art_ids[spec["palette"]],
            chest_logo_id,
            hoodie_choice,
        )
        created_products.append((spec, product["id"], action))
        print(f"{action}: {spec['title']} -> {product['id']}")

    # Poll after all three creation requests so a slow storefront sync never prevents
    # the remaining products from being created.
    site_products = []
    report = []
    for spec, product_id, action in created_products:
        product = poll_for_storefront(OFFICIAL_SHOP_ID, product_id)
        image_url = back_image(product)
        product_url = storefront_url(product)
        if not image_url:
            raise RuntimeError(f"No real Printify back-view mockup image for {spec['title']}")
        if not product_url:
            raise RuntimeError(f"No public Printify storefront URL for {spec['title']} after sync window")
        enabled = [variant for variant in product.get("variants", []) if variant.get("is_enabled")]
        if not enabled or any(int(variant.get("price", 0)) != spec["price"] for variant in enabled):
            raise RuntimeError(f"Price/variant verification failed for {spec['title']}")

        site_products.append(
            {
                "id": spec["id"],
                "printify_product_id": product_id,
                "title": spec["title"],
                "label": spec["label"],
                "price_cents": spec["price"],
                "price": f"${spec['price'] / 100:.2f}",
                "image": image_url,
                "url": product_url,
                "description": spec["description"],
                "visible": bool(product.get("visible", True)),
            }
        )
        report.append(
            {
                "id": spec["id"],
                "product_id": product_id,
                "action": action,
                "title": spec["title"],
                "color": spec["color"],
                "image": image_url,
                "url": product_url,
                "external": product.get("external"),
                "visible": product.get("visible"),
                "variant_count": len(enabled),
            }
        )

    DATA.write_text(
        json.dumps(
            {"collection": COLLECTION, "shop_id": OFFICIAL_SHOP_ID, "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "products": site_products},
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    OUT.joinpath("rules-collection-results.json").write_text(
        json.dumps({"shop_id": OFFICIAL_SHOP_ID, "results": report}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"shop_id": OFFICIAL_SHOP_ID, "results": report}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

#!/usr/bin/env python3
import base64
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip() or "28312107"
SHOP_URL = "https://storm-and-me-official.printify.me"
SOURCE_TEE_ID = "6a7bd33e44cf7ff645047bd3"
OUT = Path("automation-output")
DATA = Path("frontend/src/data/obama-reference-products.generated.json")
PORTAL = Path("frontend/src/components/FeaturedMerchPortal.js")
OUT.mkdir(exist_ok=True)
DATA.parent.mkdir(parents=True, exist_ok=True)
SIZES = {"s", "m", "l", "xl", "2xl", "3xl"}

PRODUCTS = [
    {
        "id": "obama-2028-collegiate-heather",
        "label": "Heather Gray",
        "title": "Obama 2028 — Collegiate Heather Statement Tee",
        "price": 3200,
        "garment": "gray",
        "art": "collegiate",
        "description": "Clean collegiate OBAMA 2028 front print inspired by the reference image.",
    },
    {
        "id": "obama-2028-yes-we-can-heather",
        "label": "Heather Gray",
        "title": "Obama 2028 — Yes We Can Heather Tee",
        "price": 3200,
        "garment": "gray",
        "art": "yes_we_can_gray",
        "description": "Stacked OBAMA 2028 with YES WE CAN beneath it, matched to the reference image treatment.",
    },
    {
        "id": "obama-2028-yes-we-can-black",
        "label": "Black",
        "title": "Obama 2028 — Yes We Can Black Tee",
        "price": 3200,
        "garment": "black",
        "art": "yes_we_can_black",
        "description": "High-contrast OBAMA 2028 with YES WE CAN on a dark statement tee.",
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
            "User-Agent": "StormAndMe-ObamaReferenceDrop/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def font(size):
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def fit_font(draw, text, max_width, start=760, floor=260):
    size = start
    while size >= floor:
        f = font(size)
        box = draw.textbbox((0, 0), text, font=f, stroke_width=0)
        if box[2] - box[0] <= max_width:
            return f
        size -= 20
    return font(floor)


def centered(draw, text, y, fnt, fill, stroke_fill=None, stroke_width=0, width=4500):
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    text_width = box[2] - box[0]
    x = (width - text_width) // 2
    draw.text(
        (x, y),
        text,
        font=fnt,
        fill=fill,
        stroke_fill=stroke_fill,
        stroke_width=stroke_width,
    )


def text_art(kind):
    width, height = 4500, 5400
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    navy = (18, 53, 102, 255)
    royal = (33, 81, 154, 255)
    red = (196, 43, 55, 255)
    white = (249, 249, 246, 255)

    if kind == "collegiate":
        # The repeated gray-shirt look in the reference: oversized white varsity letters
        # with a thick blue outline. No source screenshot or model imagery is printed.
        f1 = fit_font(draw, "OBAMA", 3500, 820)
        f2 = fit_font(draw, "2028", 3000, 920)
        centered(draw, "OBAMA", 1120, f1, white, navy, 54)
        centered(draw, "2028", 2050, f2, white, navy, 58)
    elif kind == "yes_we_can_gray":
        # Gray-shirt red/blue variant from the reference.
        f1 = fit_font(draw, "OBAMA", 3400, 760)
        f2 = fit_font(draw, "2028", 2800, 900)
        f3 = fit_font(draw, "YES WE CAN", 2700, 360)
        centered(draw, "OBAMA", 930, f1, white, navy, 44)
        centered(draw, "2028", 1840, f2, red, white, 34)
        centered(draw, "YES WE CAN", 3000, f3, royal, white, 14)
    elif kind == "yes_we_can_black":
        # Dark-shirt high-contrast variant from the reference.
        f1 = fit_font(draw, "OBAMA", 3400, 760)
        f2 = fit_font(draw, "2028", 2800, 900)
        f3 = fit_font(draw, "YES WE CAN", 2700, 360)
        centered(draw, "OBAMA", 930, f1, white, red, 42)
        centered(draw, "2028", 1840, f2, red, white, 30)
        centered(draw, "YES WE CAN", 3000, f3, white, navy, 12)
    else:
        raise RuntimeError(f"Unknown art kind: {kind}")

    if image.getbbox() is None:
        raise RuntimeError(f"Generated art is empty: {kind}")
    return image


def png_bytes(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def upload(name, raw):
    result = request(
        "POST",
        "/uploads/images.json",
        {"file_name": name, "contents": base64.b64encode(raw).decode("ascii")},
    )
    if not result.get("id"):
        raise RuntimeError(f"Printify image upload returned no id for {name}")
    return result["id"]


def size_tokens(title):
    low = title.lower().replace("xxxl", "3xl").replace("xxl", "2xl")
    return set(re.split(r"[^a-z0-9]+", low))


def color_match(title, garment):
    low = title.lower()
    if garment == "black":
        return any(token in low for token in ["black", "pepper"])
    return any(token in low for token in ["gray", "grey", "heather", "granite", "ash"])


def select_variants(rows, garment):
    selected = []
    for variant in rows:
        if not variant.get("is_available", True):
            continue
        title = variant.get("title", "")
        if not color_match(title, garment):
            continue
        if not (size_tokens(title) & SIZES):
            continue
        selected.append(variant)
    return selected


def list_products():
    products = []
    page = 1
    while True:
        result = request("GET", f"/shops/{SHOP_ID}/products.json?limit=50&page={page}")
        batch = result.get("data", []) if isinstance(result, dict) else []
        products.extend(batch)
        if not batch or page >= int(result.get("last_page", page)):
            break
        page += 1
    return products


def exact_match(title):
    for product in list_products():
        if product.get("title", "").strip().lower() == title.strip().lower():
            return request("GET", f"/shops/{SHOP_ID}/products/{product['id']}.json")
    return None


def template_for(garment):
    candidate_ids = [SOURCE_TEE_ID]
    for product in list_products():
        pid = product.get("id")
        title = product.get("title", "").lower()
        if pid and pid not in candidate_ids and any(word in title for word in ["tee", "shirt"]):
            candidate_ids.append(pid)

    for pid in candidate_ids:
        try:
            product = request("GET", f"/shops/{SHOP_ID}/products/{pid}.json")
        except Exception:
            continue
        variants = select_variants(product.get("variants", []), garment)
        if variants:
            return int(product["blueprint_id"]), int(product["print_provider_id"]), variants
    raise RuntimeError(f"Could not find a live Storm And Me tee template with {garment} S–3XL variants")


def create_or_reuse(spec, image_id):
    existing = exact_match(spec["title"])
    if existing:
        return existing, "existing"

    blueprint_id, provider_id, variants = template_for(spec["garment"])
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
        "description": (
            spec["description"]
            + " Satirical/parody apparel. Not affiliated with, endorsed by, or connected to Barack Obama, any campaign, or political organization."
        ),
        "tags": ["Storm And Me", "satire", "parody", "Obama 2028", "Yes We Can"],
        "blueprint_id": blueprint_id,
        "print_provider_id": provider_id,
        "variants": variant_rows,
        "print_areas": [
            {
                "variant_ids": variant_ids,
                "placeholders": [
                    {
                        "position": "front",
                        "images": [{"id": image_id, "x": 0.5, "y": 0.48, "scale": 0.78, "angle": 0}],
                    }
                ],
            }
        ],
    }
    created = request("POST", f"/shops/{SHOP_ID}/products.json", payload)
    product_id = created["id"]
    request(
        "POST",
        f"/shops/{SHOP_ID}/products/{product_id}/publish.json",
        {"title": True, "description": True, "images": True, "variants": True, "tags": True, "keyFeatures": True},
    )
    return request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json"), "created"


def poll(product_id, attempts=36):
    latest = {}
    for _ in range(attempts):
        latest = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")
        external = latest.get("external") or {}
        if latest.get("images") and external.get("handle"):
            return latest
        time.sleep(5)
    return latest


def front_image(product):
    for image in product.get("images", []):
        if str(image.get("position", "")).lower() == "front" and image.get("src"):
            return image["src"]
    for image in product.get("images", []):
        if image.get("src"):
            return image["src"]
    return ""


def storefront_url(product):
    external = product.get("external") or {}
    handle = external.get("handle") if isinstance(external, dict) else None
    if isinstance(handle, str) and handle.startswith("http"):
        return handle
    external_id = external.get("id") if isinstance(external, dict) else None
    return f"{SHOP_URL}/product/{external_id}" if external_id else ""


def patch_portal():
    text = PORTAL.read_text(encoding="utf-8")
    original = text

    import_line = 'import rulesProductData from "../data/rules-products.generated.json";'
    ref_import = 'import referenceProductData from "../data/obama-reference-products.generated.json";'
    if ref_import not in text:
        if import_line not in text:
            raise RuntimeError("FeaturedMerchPortal import anchor not found")
        text = text.replace(import_line, import_line + "\n" + ref_import, 1)

    old_products = 'const RULES_DONT_EXIST_PRODUCTS = rulesProductData.products;'
    new_products = 'const RULES_DONT_EXIST_PRODUCTS = [...rulesProductData.products, ...referenceProductData.products];'
    if new_products not in text:
        if old_products not in text:
            raise RuntimeError("FeaturedMerchPortal product merge anchor not found")
        text = text.replace(old_products, new_products, 1)

    text = text.replace(
        'alt={`${item.title} — real Printify back-view product mockup`}',
        'alt={`${item.title} — real Printify product mockup`}',
    )
    text = text.replace(
        '.rules-card:last-child { grid-column:1/-1; width:min(50%,430px); justify-self:center; }',
        '.rules-card:last-child:nth-child(odd) { grid-column:1/-1; width:min(50%,430px); justify-self:center; }',
    )

    old_copy = '<p className="rules-hero-copy">The straight-face joke is now a real collection: <strong>OBAMA 2028</strong>, the punchline underneath, and the full official Storm And Me cloud-and-lightning mark worked into the actual garments.</p>'
    new_copy = '<p className="rules-hero-copy">The straight-face joke is now a real collection. The reference drop adds the clean front-print looks from the viral image: big collegiate <strong>OBAMA 2028</strong> plus the stacked <strong>YES WE CAN</strong> treatment — actual print artwork, never the screenshot or model photo.</p>'
    if new_copy not in text:
        if old_copy not in text:
            raise RuntimeError("FeaturedMerchPortal hero copy anchor not found")
        text = text.replace(old_copy, new_copy, 1)

    text = text.replace(
        'These cards use Printify’s real product mockups for the exact live products — no drawn garment placeholders.',
        'These cards use Printify’s real product mockups for the live products — the uploaded reference image itself is never printed on the garment.',
    )

    if text != original:
        PORTAL.write_text(text, encoding="utf-8")


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    art_ids = {}
    art_dir = OUT / "obama-reference-art"
    art_dir.mkdir(parents=True, exist_ok=True)
    for spec in PRODUCTS:
        if spec["art"] not in art_ids:
            art = text_art(spec["art"])
            art.save(art_dir / f"{spec['art']}.png", format="PNG", optimize=True)
            raw = png_bytes(art)
            art_ids[spec["art"]] = upload(f"{spec['id']}-front.png", raw)

    created = []
    for spec in PRODUCTS:
        product, action = create_or_reuse(spec, art_ids[spec["art"]])
        created.append((spec, product["id"], action))
        print(f"{action}: {spec['title']} -> {product['id']}")

    site_products = []
    report = []
    for spec, product_id, action in created:
        product = poll(product_id)
        image_url = front_image(product)
        product_url = storefront_url(product)
        enabled = [v for v in product.get("variants", []) if v.get("is_enabled")]
        if not image_url:
            raise RuntimeError(f"No Printify mockup image for {spec['title']}")
        if not product_url:
            raise RuntimeError(f"No storefront URL for {spec['title']}")
        if not enabled:
            raise RuntimeError(f"No enabled variants for {spec['title']}")
        if any(int(v.get("price", 0)) != spec["price"] for v in enabled):
            raise RuntimeError(f"Price verification failed for {spec['title']}")

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
                "image": image_url,
                "url": product_url,
                "variant_count": len(enabled),
                "visible": product.get("visible"),
            }
        )

    payload = {
        "collection": "RULES DON’T EXIST ANYMORE — Reference Drop",
        "shop_id": SHOP_ID,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "products": site_products,
    }
    DATA.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    patch_portal()
    OUT.joinpath("obama-reference-drop-results.json").write_text(
        json.dumps({"shop_id": SHOP_ID, "results": report}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"shop_id": SHOP_ID, "results": report}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

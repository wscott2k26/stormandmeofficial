#!/usr/bin/env python3
import base64
import io
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip() or "28312107"
MODE = os.environ.get("RULES_LAYOUT_MODE", "probe").strip().lower()
LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/7463b3a3-ce4d-4fcb-8b80-776d01ad6286/images/a3d5a538ff81f998f6794bf45162190a817187cbc7de2e5721dad88e66e09e8f.png"
OUT = Path("automation-output/rules-approved-layout")
OUT.mkdir(parents=True, exist_ok=True)
COLLECTION = "RULES DON’T EXIST ANYMORE"

# Final placement contract. Probe mode tests nearby scale values before live apply.
FRONT_X = 0.30
FRONT_Y = 0.28
BACK_X = 0.50
BACK_Y = 0.43
FRONT_SCALE = 1.00
BACK_SCALE = 0.76

PRODUCTS = [
    {
        "id": "6a869680606e476ad103a016",
        "slug": "black-tee",
        "title": "Obama 2028 — Vintage Black Statement Tee",
        "price": 3200,
        "palette": "dark",
    },
    {
        "id": "6a86968a6ad239171c07ee5b",
        "slug": "hoodie",
        "title": "Obama 2028 — Statement Hoodie",
        "price": 6200,
        "palette": "light",
    },
    {
        "id": "6a86969021939a43b002c79c",
        "slug": "white-tee",
        "title": "Obama 2028 — White Statement Tee",
        "price": 2800,
        "palette": "light",
    },
]

PROBE_CANDIDATES = [
    {"name": "compact", "front_scale": 0.82, "back_scale": 0.68},
    {"name": "balanced", "front_scale": 1.00, "back_scale": 0.76},
    {"name": "bold", "front_scale": 1.18, "back_scale": 0.84},
]


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-ApprovedRulesLayout/1.0",
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
    req = urllib.request.Request(url, headers={"User-Agent": "StormAndMe-ApprovedRulesLayout/1.0"})
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


def centered_text(draw, text, y, text_font, fill, width):
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


def crop_transparent(image, pad=96):
    bbox = image.getbbox()
    if not bbox:
        raise RuntimeError("Artwork unexpectedly empty")
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(image.width, bbox[2] + pad)
    bottom = min(image.height, bbox[3] + pad)
    return image.crop((left, top, right, bottom))


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
    return crop_transparent(logo, pad=30)


def tight_back_art(palette):
    # Deliberately transparent and tightly cropped: no opaque square, no back logo.
    width, height = 3600, 3900
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    primary = (244, 238, 226, 255) if palette == "dark" else (16, 48, 91, 255)
    red = (190, 43, 49, 255)

    centered_text(draw, "OBAMA", 90, font(650), primary, width)
    centered_text(draw, "2028", 720, font(900), primary, width)
    draw_star(draw, 430, 1235, 190, red)
    draw_star(draw, 3170, 1235, 190, red)

    draw.rounded_rectangle((560, 1640, 3040, 1700), radius=24, fill=red)
    draw.rounded_rectangle((700, 1750, 2900, 1795), radius=20, fill=primary)
    centered_text(draw, "SINCE", 1880, font(340), primary, width)
    centered_text(draw, "RULES DON'T", 2420, font(500), red, width)
    centered_text(draw, "EXIST ANYMORE", 3070, font(385), primary, width)

    return crop_transparent(image, pad=110)


def png_bytes(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def upload(name, image):
    raw = png_bytes(image)
    response = request(
        "POST",
        "/uploads/images.json",
        {"file_name": name, "contents": base64.b64encode(raw).decode("ascii")},
    )
    return response["id"]


def get_product(product_id):
    return request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")


def enabled_variants(product):
    rows = []
    for variant in product.get("variants", []):
        if not variant.get("is_enabled"):
            continue
        rows.append(
            {
                "id": variant["id"],
                "price": int(variant["price"]),
                "is_enabled": True,
                "is_default": bool(variant.get("is_default")),
            }
        )
    if not rows:
        raise RuntimeError(f"{product.get('title')}: no enabled variants")
    if not any(row["is_default"] for row in rows):
        rows[0]["is_default"] = True
    return rows


def verify_product(product, spec):
    if product.get("title") != spec["title"]:
        raise RuntimeError(f"Title mismatch for {spec['id']}: {product.get('title')!r}")
    rows = enabled_variants(product)
    if any(row["price"] != spec["price"] for row in rows):
        raise RuntimeError(f"Price drift for {spec['title']}")
    return rows


def print_areas(variant_ids, logo_id, back_id, front_scale, back_scale):
    return [
        {
            "variant_ids": variant_ids,
            "placeholders": [
                {
                    "position": "front",
                    "images": [
                        {"id": logo_id, "x": FRONT_X, "y": FRONT_Y, "scale": front_scale, "angle": 0}
                    ],
                },
                {
                    "position": "back",
                    "images": [
                        {"id": back_id, "x": BACK_X, "y": BACK_Y, "scale": back_scale, "angle": 0}
                    ],
                },
            ],
        }
    ]


def wait_for_images(product_id, attempts=36):
    latest = {}
    for _ in range(attempts):
        latest = get_product(product_id)
        positions = {str(image.get("position", "")).lower() for image in latest.get("images", []) if image.get("src")}
        if {"front", "back"}.issubset(positions):
            return latest
        time.sleep(5)
    return latest


def image_url(product, position):
    for image in product.get("images", []):
        if str(image.get("position", "")).lower() == position and image.get("src"):
            return image["src"]
    return ""


def save_mockups(product, prefix):
    saved = {}
    for position in ("front", "back"):
        url = image_url(product, position)
        if not url:
            raise RuntimeError(f"{product.get('title')}: missing {position} mockup")
        path = OUT / f"{prefix}-{position}.jpg"
        path.write_bytes(fetch_bytes(url))
        if path.stat().st_size < 10000:
            raise RuntimeError(f"{path}: mockup download unexpectedly small")
        saved[position] = str(path)
    return saved


def create_canary(source, spec, candidate, logo_id, back_id):
    variants = enabled_variants(source)
    variant_ids = [row["id"] for row in variants]
    payload = {
        "title": f"QA {spec['title']} — {candidate['name']}",
        "description": "Unpublished visual QA canary for approved Storm And Me merch placement.",
        "tags": ["Storm And Me", "QA", COLLECTION],
        "blueprint_id": int(source["blueprint_id"]),
        "print_provider_id": int(source["print_provider_id"]),
        "variants": variants,
        "print_areas": print_areas(
            variant_ids,
            logo_id,
            back_id,
            candidate["front_scale"],
            candidate["back_scale"],
        ),
    }
    return request("POST", f"/shops/{SHOP_ID}/products.json", payload)


def probe():
    logo_id = upload("storm-and-me-approved-left-chest.png", official_logo_rgba())
    art_ids = {
        "dark": upload("rules-approved-dark-back.png", tight_back_art("dark")),
        "light": upload("rules-approved-light-back.png", tight_back_art("light")),
    }

    # Tee + hoodie cover both print-area geometries; white tee shares tee geometry.
    probe_specs = [PRODUCTS[0], PRODUCTS[1]]
    report = []
    created_ids = []
    try:
        for spec in probe_specs:
            source = get_product(spec["id"])
            verify_product(source, spec)
            for candidate in PROBE_CANDIDATES:
                canary = create_canary(source, spec, candidate, logo_id, art_ids[spec["palette"]])
                canary_id = canary["id"]
                created_ids.append(canary_id)
                latest = wait_for_images(canary_id)
                files = save_mockups(latest, f"{spec['slug']}-{candidate['name']}")
                report.append(
                    {
                        "garment": spec["slug"],
                        "candidate": candidate,
                        "canary_id": canary_id,
                        "front": image_url(latest, "front"),
                        "back": image_url(latest, "back"),
                        "files": files,
                    }
                )
                print(f"PROBE CAPTURED: {spec['slug']} / {candidate['name']}")
    finally:
        for product_id in created_ids:
            try:
                request("DELETE", f"/shops/{SHOP_ID}/products/{product_id}.json")
                print(f"deleted unpublished canary {product_id}")
            except Exception as exc:
                print(f"warning: could not delete canary {product_id}: {exc}")

    (OUT / "probe-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("PROBE_COMPLETE")


def update_when_editable(product_id, payload):
    for attempt in range(1, 31):
        try:
            return request("PUT", f"/shops/{SHOP_ID}/products/{product_id}.json", payload)
        except RuntimeError as exc:
            if "Product is disabled for editing" not in str(exc) or attempt == 30:
                raise
            time.sleep(10)
    raise RuntimeError(f"{product_id}: edit lock did not clear")


def apply_live():
    logo_id = upload("storm-and-me-approved-left-chest-live.png", official_logo_rgba())
    art_ids = {
        "dark": upload("rules-approved-dark-back-live.png", tight_back_art("dark")),
        "light": upload("rules-approved-light-back-live.png", tight_back_art("light")),
    }
    report = []

    for spec in PRODUCTS:
        product = get_product(spec["id"])
        variants = verify_product(product, spec)
        variant_ids = [row["id"] for row in variants]
        update_when_editable(
            spec["id"],
            {"print_areas": print_areas(variant_ids, logo_id, art_ids[spec["palette"]], FRONT_SCALE, BACK_SCALE)},
        )
        print(f"submitted approved layout: {spec['title']}")

    # Let placements propagate before republishing images.
    time.sleep(15)
    for spec in PRODUCTS:
        request(
            "POST",
            f"/shops/{SHOP_ID}/products/{spec['id']}/publish.json",
            {"title": False, "description": False, "images": True, "variants": False, "tags": False, "keyFeatures": False},
        )
        print(f"republished images: {spec['title']}")

    time.sleep(30)
    for spec in PRODUCTS:
        product = wait_for_images(spec["id"])
        verify_product(product, spec)
        files = save_mockups(product, f"LIVE-{spec['slug']}")
        report.append(
            {
                "id": spec["id"],
                "title": spec["title"],
                "front": image_url(product, "front"),
                "back": image_url(product, "back"),
                "files": files,
                "external": product.get("external"),
                "visible": product.get("visible"),
            }
        )
        print(f"LIVE VERIFIED: {spec['title']} — small left chest brand + large clean back statement")

    (OUT / "live-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("LIVE_APPLY_COMPLETE")


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")
    if MODE == "probe":
        probe()
    elif MODE == "apply":
        apply_live()
    else:
        raise RuntimeError(f"Unknown RULES_LAYOUT_MODE={MODE!r}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

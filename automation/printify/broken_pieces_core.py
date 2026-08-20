#!/usr/bin/env python3
import base64
import copy
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

from PIL import Image, ImageChops, ImageDraw, ImageFont

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip() or "28312107"
SHOP_URL = "https://storm-and-me-official.printify.me"
SOURCE_TEE_ID = "6a7bd33e44cf7ff645047bd3"
OUT = Path("automation-output")
DATA = Path("frontend/src/data/broken-pieces-products.generated.json")
PORTAL = Path("frontend/src/components/FeaturedMerchPortal.js")
OUT.mkdir(exist_ok=True)
DATA.parent.mkdir(parents=True, exist_ok=True)

# These are ONLY the three accidental reference-drop products created from the wrong image read.
# The original Rules Don't Exist Anymore collection is intentionally preserved.
OBAMA_PRODUCT_IDS = [
    "6a8734ac4334f6ea37086290",
    "6a8734bad916929e7500b843",
    "6a8734c729aeb510e50271a8",
]

PRODUCTS = [
    {
        "slug": "cracked-heart",
        "title": "Broken Pieces — Cracked Heart Tee",
        "label": "1. Cracked Heart",
        "front_kind": "cracked-heart",
        "back_text": "GOD STILL MAKES MASTERPIECES FROM BROKEN PIECES",
        "description": "A distressed cracked heart breaking into fragments, paired with the reminder that God still makes masterpieces from broken pieces.",
    },
    {
        "slug": "kintsugi-heart",
        "title": "Broken Pieces — Kintsugi Heart Tee",
        "label": "2. Kintsugi Heart",
        "front_kind": "kintsugi-heart",
        "back_text": "STILL STANDING.",
        "description": "A dark heart repaired in glowing gold seams — broken history turned into visible strength. Still standing.",
    },
    {
        "slug": "broken-cross",
        "title": "Broken Pieces — Broken Cross Tee",
        "label": "3. Broken Cross",
        "front_kind": "broken-cross",
        "back_text": "THE CRACKS LET THE LIGHT IN.",
        "description": "A fractured stone cross with warm light breaking through the cracks — faith, damage, and light in the same frame.",
    },
    {
        "slug": "streetwear",
        "title": "Broken Pieces — Still Breathing Streetwear Tee",
        "label": "4. Streetwear",
        "front_kind": "streetwear",
        "back_text": "",
        "description": "Oversized distressed BROKEN PIECES typography with STILL BREATHING beneath it and a minimal Storm And Me back treatment.",
    },
    {
        "slug": "puzzle-piece",
        "title": "Broken Pieces — Still Becoming Puzzle Piece Tee",
        "label": "5. The Puzzle Piece",
        "front_kind": "puzzle-piece",
        "back_text": "STILL BECOMING.",
        "description": "A weathered puzzle piece with light breaking through one side — a reminder that unfinished does not mean defeated.",
    },
]

W, H = 4500, 5400
TAN = (203, 181, 153, 255)
TAN_DARK = (151, 126, 98, 255)
GOLD = (224, 165, 78, 255)
GLOW = (255, 213, 132, 255)
STONE = (96, 84, 72, 255)
DARK = (38, 34, 31, 255)
TRANSPARENT = (0, 0, 0, 0)


def request(method, path, payload=None, allow_404=False):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-BrokenPieces/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        if allow_404 and exc.code == 404:
            return None
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def font_path(prefer_italic=False):
    candidates = (
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Oblique.ttf",
            "/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf",
        ]
        if prefer_italic
        else [
            "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
        ]
    )
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
    return None


def font(size, italic=False):
    path = font_path(prefer_italic=italic)
    return ImageFont.truetype(path, size) if path else ImageFont.load_default()


def fit_font(draw, text, max_width, start=700, floor=180, italic=False):
    size = start
    while size >= floor:
        f = font(size, italic=italic)
        box = draw.textbbox((0, 0), text, font=f, stroke_width=0)
        if box[2] - box[0] <= max_width:
            return f
        size -= 16
    return font(floor, italic=italic)


def text_mask(text, fnt, canvas=(W, H), x=None, y=0, max_width=None):
    mask = Image.new("L", canvas, 0)
    draw = ImageDraw.Draw(mask)
    box = draw.textbbox((0, 0), text, font=fnt)
    tw = box[2] - box[0]
    if max_width and tw > max_width:
        raise ValueError(f"Text too wide after fit: {text}")
    if x is None:
        x = (canvas[0] - tw) // 2
    draw.text((x, y), text, font=fnt, fill=255)
    return mask


def distress(mask, seed, density=0.012):
    rng = random.Random(seed)
    out = mask.copy()
    draw = ImageDraw.Draw(out)
    bbox = out.getbbox()
    if not bbox:
        return out
    x0, y0, x1, y1 = bbox
    count = max(120, int((x1 - x0) * (y1 - y0) * density / 900))
    for _ in range(count):
        x = rng.randint(x0, max(x0, x1 - 1))
        y = rng.randint(y0, max(y0, y1 - 1))
        rw = rng.randint(8, 32)
        rh = rng.randint(2, 12)
        draw.ellipse((x, y, x + rw, y + rh), fill=0)
    return out


def apply_mask(image, mask, color):
    layer = Image.new("RGBA", image.size, color)
    image.alpha_composite(Image.composite(layer, Image.new("RGBA", image.size, TRANSPARENT), mask))


def centered_distressed_text(image, text, y, size, seed, color=TAN, max_width=3700, italic=False):
    draw = ImageDraw.Draw(image)
    fnt = fit_font(draw, text, max_width, start=size, floor=max(120, int(size * 0.55)), italic=italic)
    mask = text_mask(text, fnt, y=y)
    mask = distress(mask, seed, 0.02)
    apply_mask(image, mask, color)


def draw_broken_pieces_label(image, y=3920, seed=9):
    centered_distressed_text(image, "BROKEN PIECES", y, 360, seed, TAN, 3400)


def heart_points(cx, cy, scale):
    pts = []
    for i in range(240):
        t = math.pi * 2 * i / 240
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * scale, cy - y * scale))
    return pts


def glow_line(image, points, width=26):
    glow = Image.new("RGBA", image.size, TRANSPARENT)
    gd = ImageDraw.Draw(glow)
    for w, alpha in [(100, 35), (65, 70), (40, 120)]:
        gd.line(points, fill=(255, 188, 80, alpha), width=w, joint="curve")
    gd.line(points, fill=GLOW, width=width, joint="curve")
    image.alpha_composite(glow)


def front_cracked_heart():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    md.polygon(heart_points(2050, 1920, 105), fill=255)
    mask = distress(mask, 101, 0.006)
    apply_mask(image, mask, TAN)
    draw = ImageDraw.Draw(image)
    cracks = [
        [(2050, 900), (1940, 1350), (2130, 1680), (1900, 2050), (2070, 2410), (1950, 2890)],
        [(1940, 1350), (1550, 1500), (1350, 1820)],
        [(2130, 1680), (2450, 1520), (2700, 1260)],
        [(1900, 2050), (1570, 2220), (1440, 2490)],
        [(2070, 2410), (2440, 2270), (2640, 1980)],
    ]
    for line in cracks:
        draw.line(line, fill=(28, 25, 22, 255), width=42, joint="curve")
    # break off the right edge and add shards
    draw.polygon([(2670, 1180), (3020, 1410), (2840, 1780), (3050, 2080), (2730, 2370), (2890, 2740), (2540, 2990)], fill=TRANSPARENT)
    rng = random.Random(404)
    for _ in range(16):
        x = rng.randint(2780, 3420)
        y = rng.randint(1200, 2800)
        s = rng.randint(70, 180)
        pts = [(x, y), (x + s, y + rng.randint(-30, 90)), (x + rng.randint(10, s), y + s)]
        ImageDraw.Draw(image).polygon(pts, fill=TAN)
    draw_broken_pieces_label(image, 3580, 12)
    return image


def front_kintsugi_heart():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(heart_points(2250, 1900, 108), fill=255)
    apply_mask(image, mask, (63, 57, 51, 255))
    outline = Image.new("RGBA", (W, H), TRANSPARENT)
    od = ImageDraw.Draw(outline)
    od.line(heart_points(2250, 1900, 108) + [heart_points(2250, 1900, 108)[0]], fill=TAN_DARK, width=30)
    image.alpha_composite(outline)
    cracks = [
        [(2100, 880), (2170, 1320), (2010, 1580), (2300, 1950), (2180, 2320), (2350, 2850)],
        [(2170, 1320), (1750, 1230), (1470, 1460)],
        [(2010, 1580), (1650, 1880), (1490, 2250)],
        [(2300, 1950), (2750, 1740), (3010, 1440)],
        [(2180, 2320), (2630, 2390), (2850, 2700)],
        [(1750, 1880), (1900, 2450), (1730, 2700)],
    ]
    for line in cracks:
        glow_line(image, line, 24)
    draw_broken_pieces_label(image, 3580, 22)
    return image


def front_broken_cross():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((1830, 650, 2670, 3150), radius=60, fill=255)
    md.rounded_rectangle((980, 1300, 3520, 2100), radius=60, fill=255)
    mask = distress(mask, 77, 0.006)
    apply_mask(image, mask, STONE)
    cracks = [
        [(2250, 690), (2130, 1150), (2350, 1460), (2130, 1780), (2340, 2150), (2200, 2600), (2310, 3100)],
        [(2130, 1150), (1810, 1360), (1510, 1420)],
        [(2350, 1460), (2710, 1320), (3060, 1480)],
        [(2130, 1780), (1760, 1860), (1330, 1780)],
        [(2340, 2150), (2740, 2000), (3190, 2080)],
    ]
    for line in cracks:
        glow_line(image, line, 30)
    draw_broken_pieces_label(image, 3540, 31)
    return image


def front_streetwear():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    centered_distressed_text(image, "BROKEN", 900, 1060, 41, TAN, 3600)
    centered_distressed_text(image, "PIECES", 2000, 1060, 42, TAN, 3600)
    centered_distressed_text(image, "STILL BREATHING.", 3300, 430, 43, TAN_DARK, 3200, italic=True)
    return image


def puzzle_mask():
    base = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(base)
    x0, y0, x1, y1 = 1300, 900, 3200, 3000
    d.rounded_rectangle((x0, y0, x1, y1), radius=90, fill=255)
    # tabs
    d.ellipse((1950, 570, 2550, 1170), fill=255)
    d.ellipse((2900, 1650, 3500, 2250), fill=255)
    # notches
    d.ellipse((1950, 2700, 2550, 3300), fill=0)
    d.ellipse((1000, 1650, 1600, 2250), fill=0)
    return base


def front_puzzle_piece():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    mask = puzzle_mask()
    mask = distress(mask, 66, 0.006)
    apply_mask(image, mask, STONE)
    cracks = [
        [(2450, 980), (2600, 1380), (2480, 1740), (2760, 2050), (2630, 2490), (2860, 2840)],
        [(2480, 1740), (2100, 1630), (1870, 1360)],
        [(2760, 2050), (3060, 1870), (3300, 1660)],
    ]
    for line in cracks:
        glow_line(image, line, 26)
    # bright break on right side
    glow_line(image, [(2930, 1600), (3160, 1780), (3000, 2060), (3290, 2230)], 34)
    draw_broken_pieces_label(image, 3550, 58)
    return image


def wrap_lines(draw, words, max_width, start_size=520, max_lines=6):
    fnt = font(start_size)
    lines = []
    current = ""
    for word in words.split():
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=fnt)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    if len(lines) > max_lines:
        return wrap_lines(draw, words, max_width, start_size - 30, max_lines)
    return lines, fnt


def back_statement(text, kind):
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(image)
    lines, fnt = wrap_lines(draw, text, 3300, 540, 6)
    line_h = int(fnt.size * 1.05)
    total_h = line_h * len(lines)
    y = max(780, (H - total_h) // 2 - 300)
    for idx, line in enumerate(lines):
        centered_distressed_text(image, line, y + idx * line_h, fnt.size, 100 + idx, TAN, 3400)
    if kind == "broken-cross":
        underline_y = y + len(lines) * line_h + 120
        ImageDraw.Draw(image).arc((1250, underline_y - 80, 3250, underline_y + 160), 190, 350, fill=TAN_DARK, width=24)
    centered_distressed_text(image, "Willy Will", min(H - 820, y + total_h + 450), 330, 211, GOLD, 2000, italic=True)
    return image


def back_streetwear():
    image = Image.new("RGBA", (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(image)
    # small cloud + lightning high on the back
    cx, cy = 2250, 850
    draw.arc((cx - 300, cy - 170, cx + 40, cy + 130), 190, 360, fill=TAN, width=28)
    draw.arc((cx - 30, cy - 250, cx + 360, cy + 130), 180, 350, fill=TAN, width=28)
    draw.line((cx - 230, cy + 90, cx + 230, cy + 90), fill=TAN, width=28)
    bolt = [(2250, 760), (2090, 1080), (2240, 1060), (2150, 1350), (2440, 980), (2280, 1000)]
    draw.polygon(bolt, fill=GOLD)
    centered_distressed_text(image, "Willy Will", 4000, 310, 701, GOLD, 1800, italic=True)
    return image


def build_art(spec):
    front_builders = {
        "cracked-heart": front_cracked_heart,
        "kintsugi-heart": front_kintsugi_heart,
        "broken-cross": front_broken_cross,
        "streetwear": front_streetwear,
        "puzzle-piece": front_puzzle_piece,
    }
    front = front_builders[spec["front_kind"]]()
    back = back_streetwear() if spec["front_kind"] == "streetwear" else back_statement(spec["back_text"], spec["front_kind"])
    return front, back


def to_png_bytes(image):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def upload(name, raw):
    result = request(
        "POST",
        "/uploads/images.json",
        {"file_name": name, "contents": base64.b64encode(raw).decode("ascii")},
    )
    if not result or not result.get("id"):
        raise RuntimeError(f"Printify upload returned no id for {name}")
    return result["id"]


def list_products():
    products = []
    page = 1
    while True:
        result = request("GET", f"/shops/{SHOP_ID}/products.json?limit=50&page={page}")
        batch = result.get("data", []) if isinstance(result, dict) else []
        products.extend(batch)
        last_page = int(result.get("last_page", page)) if isinstance(result, dict) else page
        if not batch or page >= last_page:
            break
        page += 1
    return products


def exact_product(title):
    for product in list_products():
        if product.get("title", "").strip().lower() == title.strip().lower():
            return request("GET", f"/shops/{SHOP_ID}/products/{product['id']}.json")
    return None


def delete_accidental_products():
    report = []
    for product_id in OBAMA_PRODUCT_IDS:
        existing = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json", allow_404=True)
        if existing is None:
            report.append({"product_id": product_id, "status": "already_absent"})
            continue
        request("DELETE", f"/shops/{SHOP_ID}/products/{product_id}.json")
        report.append({"product_id": product_id, "status": "deleted", "title": existing.get("title")})
    return report


def select_black_variants(source):
    selected = []
    for variant in source.get("variants", []):
        if not variant.get("is_available", True):
            continue
        title = str(variant.get("title", "")).lower()
        if any(token in title for token in ["black", "pepper"]):
            selected.append(variant)
    if not selected:
        selected = [v for v in source.get("variants", []) if v.get("is_available", True) and v.get("is_enabled", True)]
    if not selected:
        raise RuntimeError("No usable source tee variants found")
    return selected


def template_layer(source, position):
    for area in source.get("print_areas", []):
        for placeholder in area.get("placeholders", []):
            if placeholder.get("position") != position:
                continue
            images = placeholder.get("images", [])
            if images:
                layer = copy.deepcopy(images[0])
                layer.pop("id", None)
                return layer
    return {"x": 0.5, "y": 0.5, "scale": 0.86, "angle": 0}


def product_payload(source, spec, front_id, back_id):
    variants = select_black_variants(source)
    variant_ids = [v["id"] for v in variants]
    front_layer = template_layer(source, "front")
    front_layer["id"] = front_id
    front_layer["x"] = 0.5
    front_layer["y"] = 0.49
    front_layer["scale"] = min(float(front_layer.get("scale", 0.86)), 0.86)
    back_layer = template_layer(source, "back")
    back_layer["id"] = back_id
    back_layer["x"] = 0.5
    back_layer["y"] = 0.49
    back_layer["scale"] = min(float(back_layer.get("scale", 0.86)), 0.86)

    return {
        "title": spec["title"],
        "description": spec["description"] + " Part of the Storm And Me Broken Pieces Collection inspired by the song and the stories behind surviving what tried to break you.",
        "tags": ["Storm And Me", "Broken Pieces", "Willy Will", "streetwear", "resilience", "music merch"],
        "blueprint_id": source["blueprint_id"],
        "print_provider_id": source["print_provider_id"],
        "variants": [
            {
                "id": v["id"],
                "price": int(v.get("price", 3399) or 3399),
                "is_enabled": True,
                "is_default": idx == 0,
            }
            for idx, v in enumerate(variants)
        ],
        "print_areas": [
            {
                "variant_ids": variant_ids,
                "placeholders": [
                    {"position": "front", "images": [front_layer]},
                    {"position": "back", "images": [back_layer]},
                ],
            }
        ],
    }


def create_or_update(source, spec, front_id, back_id):
    payload = product_payload(source, spec, front_id, back_id)
    existing = exact_product(spec["title"])
    if existing:
        product_id = existing["id"]
        request("PUT", f"/shops/{SHOP_ID}/products/{product_id}.json", payload)
        action = "updated"
    else:
        created = request("POST", f"/shops/{SHOP_ID}/products.json", payload)
        product_id = created["id"]
        action = "created"
    request(
        "POST",
        f"/shops/{SHOP_ID}/products/{product_id}/publish.json",
        {"title": True, "description": True, "images": True, "variants": True, "tags": True, "keyFeatures": True},
    )
    return product_id, action


def poll_product(product_id, attempts=30):
    last = {}
    for _ in range(attempts):
        last = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")
        external = last.get("external") or {}
        has_external = isinstance(external, dict) and bool(external.get("id") or external.get("handle"))
        has_image = any(img.get("src") for img in last.get("images", []))
        if has_external and has_image and last.get("visible") is True:
            return last
        time.sleep(5)
    return last


def storefront_url(product):
    external = product.get("external") or {}
    handle = external.get("handle") if isinstance(external, dict) else None
    if isinstance(handle, str) and handle.startswith("http"):
        return handle
    external_id = external.get("id") if isinstance(external, dict) else None
    return f"{SHOP_URL}/product/{external_id}" if external_id else ""


def front_mockup(product):
    for image in product.get("images", []):
        if str(image.get("position", "")).lower() == "front" and image.get("src"):
            return image["src"]
    for image in product.get("images", []):
        if image.get("src"):
            return image["src"]
    return ""


def patch_portal():
    text = PORTAL.read_text(encoding="utf-8")
    original = text

    obama_import = 'import referenceProductData from "../data/obama-reference-products.generated.json";\n'
    broken_import = 'import brokenPiecesProductData from "../data/broken-pieces-products.generated.json";\n'
    if obama_import in text:
        text = text.replace(obama_import, broken_import)
    elif broken_import not in text:
        anchor = 'import rulesProductData from "../data/rules-products.generated.json";\n'
        text = text.replace(anchor, anchor + broken_import)

    # Remove the old two-product hardcoded Broken Pieces grid and define the new five-product feed instead.
    text = re.sub(
        r'const PRODUCTS = \[.*?\];\n\nconst RULES_DONT_EXIST_PRODUCTS = .*?;\n',
        'const BROKEN_PIECES_PRODUCTS = brokenPiecesProductData.products;\nconst RULES_DONT_EXIST_PRODUCTS = rulesProductData.products;\n',
        text,
        count=1,
        flags=re.S,
    )
    text = text.replace(
        'const RULES_DONT_EXIST_PRODUCTS = [...rulesProductData.products, ...referenceProductData.products];',
        'const BROKEN_PIECES_PRODUCTS = brokenPiecesProductData.products;\nconst RULES_DONT_EXIST_PRODUCTS = rulesProductData.products;',
    )

    css_anchor = '        .rules-shell { position:relative; overflow:hidden; margin:34px 0 42px;'
    if '.broken-shell {' not in text and css_anchor in text:
        broken_css = '''        .broken-shell { position:relative; overflow:hidden; margin:34px 0 46px; border:1px solid rgba(215,180,97,.28); border-radius:28px; background:radial-gradient(circle at 78% 8%,rgba(215,180,97,.12),transparent 28%),linear-gradient(145deg,#11100f 0%,#171513 55%,#090909 100%); color:#f2e7d8; box-shadow:0 28px 70px rgba(0,0,0,.38); }\n        .broken-shell::before { content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(120deg,rgba(255,255,255,.025),transparent 38%); }\n        .broken-shell .rules-overline { color:#d7b461; }\n        .broken-shell .rules-hero h3 { color:#eadcc8; }\n        .broken-shell .rules-hero-copy,.broken-shell .rules-disclaimer { color:rgba(242,231,216,.68); }\n        .broken-shell .rules-logo-panel { border-color:rgba(215,180,97,.2); background:rgba(255,255,255,.045); }\n        .broken-shell .rules-logo-panel span { color:rgba(242,231,216,.62); }\n        .broken-shell .rules-card { border-color:rgba(215,180,97,.18); background:#171513; color:#f2e7d8; }\n        .broken-shell .rules-card-top { background:linear-gradient(145deg,#22201e,#0d0c0b); }\n        .broken-shell .rules-live-badge { background:#d7b461; color:#11100f; }\n        .broken-shell .rules-label { color:#d7b461; }\n        .broken-shell .rules-card-copy h4 { color:#f2e7d8; }\n        .broken-shell .rules-card-copy p { color:rgba(242,231,216,.62); }\n        .broken-shell .rules-price-row { border-top-color:rgba(215,180,97,.16); }\n        .broken-shell .rules-price,.broken-shell .rules-view { color:#d7b461; }\n        .broken-shell .rules-footer p { color:rgba(242,231,216,.6); }\n\n'''
        text = text.replace(css_anchor, broken_css + css_anchor, 1)

    rules_section_anchor = '      <section className="rules-shell" data-testid="rules-dont-exist-collection" aria-labelledby="rules-collection-title">'
    if 'data-testid="broken-pieces-collection"' not in text:
        broken_section = '''      <section className="broken-shell" data-testid="broken-pieces-collection" aria-labelledby="broken-pieces-title">\n        <div className="rules-hero">\n          <div>\n            <p className="rules-overline">Featured collection · inspired by the song</p>\n            <h3 id="broken-pieces-title">BROKEN PIECES COLLECTION</h3>\n            <p className="rules-hero-copy">Five pieces. Five ways of saying the same thing: what broke you does not get to finish the story. Cracked Heart, Kintsugi Heart, Broken Cross, Still Breathing streetwear, and The Puzzle Piece are live now.</p>\n            <p className="rules-disclaimer">Original Storm And Me / Willy Will merchandise. Real Printify products and checkout.</p>\n          </div>\n          <div className="rules-logo-panel">\n            <img src={ASSETS.logo} alt="Storm And Me official logo" loading="lazy" />\n            <span>Broken Pieces · Storm And Me</span>\n          </div>\n        </div>\n\n        <div className="rules-grid">\n          {BROKEN_PIECES_PRODUCTS.map((item) => <RulesCard key={item.id} item={item} />)}\n        </div>\n\n        <div className="rules-footer">\n          <p>The five featured cards use Printify’s real live product mockups — not the concept-board screenshot.</p>\n          <a className="rules-cta" href={SHOP_URL} target="_blank" rel="noreferrer">Shop Broken Pieces <ArrowUpRight size={16} aria-hidden="true" /></a>\n        </div>\n      </section>\n\n'''
        if rules_section_anchor not in text:
            raise RuntimeError("Could not locate Rules collection insertion anchor")
        text = text.replace(rules_section_anchor, broken_section + rules_section_anchor, 1)

    old_rules_copy = 'The straight-face joke is now a real collection. The reference drop adds the clean front-print looks from the viral image: big collegiate <strong>OBAMA 2028</strong> plus the stacked <strong>YES WE CAN</strong> treatment — actual print artwork, never the screenshot or model photo.'
    new_rules_copy = 'The original satire collection stays in its own lane. Broken Pieces is featured first above, while the Rules Don’t Exist Anymore drop remains available here for the folks who came for the running joke.'
    text = text.replace(old_rules_copy, new_rules_copy)
    text = text.replace(
        'These cards use Printify’s real product mockups for the live products — the uploaded reference image itself is never printed on the garment.',
        'These are the original Rules Don’t Exist Anymore products, kept separate from the featured Broken Pieces collection.',
    )

    # Remove the old hardcoded two-card grid; the new five-product collection replaces it.
    text = re.sub(
        r'\n      <div className="sam-grid">\n        \{PRODUCTS\.map\(\(product\) => <ProductCard key=\{product\.id\} product=\{product\} />\)\}\n      </div>\n',
        '\n',
        text,
        count=1,
    )

    if 'referenceProductData' in text or 'obama-reference-products.generated.json' in text:
        raise RuntimeError("Obama reference-drop data is still wired into FeaturedMerchPortal")
    if 'BROKEN PIECES COLLECTION' not in text:
        raise RuntimeError("Broken Pieces feature section was not added")
    if text.index('BROKEN PIECES COLLECTION') > text.index('RULES DON’T EXIST ANYMORE'):
        raise RuntimeError("Broken Pieces must be featured before Rules")

    if text != original:
        PORTAL.write_text(text, encoding="utf-8")


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    removal_report = delete_accidental_products()
    source = request("GET", f"/shops/{SHOP_ID}/products/{SOURCE_TEE_ID}.json")

    art_dir = OUT / "broken-pieces-art"
    art_dir.mkdir(parents=True, exist_ok=True)
    created = []

    for spec in PRODUCTS:
        front, back = build_art(spec)
        if front.getbbox() is None or back.getbbox() is None:
            raise RuntimeError(f"Generated empty artwork for {spec['slug']}")
        front_path = art_dir / f"{spec['slug']}-front.png"
        back_path = art_dir / f"{spec['slug']}-back.png"
        front.save(front_path, "PNG", optimize=True)
        back.save(back_path, "PNG", optimize=True)
        front_id = upload(f"broken-pieces-{spec['slug']}-front.png", to_png_bytes(front))
        back_id = upload(f"broken-pieces-{spec['slug']}-back.png", to_png_bytes(back))
        product_id, action = create_or_update(source, spec, front_id, back_id)
        created.append((spec, product_id, action))
        print(f"{action}: {spec['title']} -> {product_id}")

    site_products = []
    live_report = []
    for spec, product_id, action in created:
        product = poll_product(product_id)
        image_url = front_mockup(product)
        product_url = storefront_url(product)
        enabled = [v for v in product.get("variants", []) if v.get("is_enabled")]
        if not image_url:
            raise RuntimeError(f"No live Printify mockup for {spec['title']}")
        if not product_url:
            raise RuntimeError(f"No live storefront URL for {spec['title']}")
        if not enabled:
            raise RuntimeError(f"No enabled variants for {spec['title']}")
        prices = [int(v.get("price", 0)) for v in enabled if int(v.get("price", 0)) > 0]
        price_cents = min(prices) if prices else 3399
        site_products.append(
            {
                "id": f"broken-pieces-{spec['slug']}",
                "printify_product_id": product_id,
                "title": spec["title"],
                "label": spec["label"],
                "price_cents": price_cents,
                "price": f"${price_cents / 100:.2f}",
                "image": image_url,
                "url": product_url,
                "description": spec["description"],
                "visible": bool(product.get("visible", True)),
            }
        )
        live_report.append(
            {
                "slug": spec["slug"],
                "product_id": product_id,
                "action": action,
                "visible": product.get("visible"),
                "variant_count": len(enabled),
                "url": product_url,
                "mockup": image_url,
            }
        )

    DATA.write_text(
        json.dumps(
            {
                "collection": "BROKEN PIECES COLLECTION",
                "shop_id": SHOP_ID,
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "products": site_products,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    patch_portal()
    OUT.joinpath("broken-pieces-publish-results.json").write_text(
        json.dumps({"removed_accidental_products": removal_report, "live_products": live_report}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"removed_accidental_products": removal_report, "live_products": live_report}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

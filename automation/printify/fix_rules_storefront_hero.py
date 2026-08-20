#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip() or "28312107"
OUT = Path("automation-output/storefront-hero-mockups")
OUT.mkdir(parents=True, exist_ok=True)

PRODUCTS = [
    {
        "id": "6a869680606e476ad103a016",
        "slug": "black-tee",
        "title": "Obama 2028 — Vintage Black Statement Tee",
        "price": 3200,
    },
    {
        "id": "6a86968a6ad239171c07ee5b",
        "slug": "hoodie",
        "title": "Obama 2028 — Statement Hoodie",
        "price": 6200,
    },
    {
        "id": "6a86969021939a43b002c79c",
        "slug": "white-tee",
        "title": "Obama 2028 — White Statement Tee",
        "price": 2800,
    },
]

# Printify's Pop-Up Store uses the generated FRONT mockup as the collection card.
# The old 0.22-scale upper-left mark rendered like a speck. Preserve the approved
# oversized Obama statement on the BACK and make the official Storm And Me mark an
# intentional centered FRONT treatment that is actually visible in the store grid.
TARGET_FRONT_SCALE = 0.62
TARGET_FRONT_X = 0.50
TARGET_FRONT_Y = 0.36


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-StorefrontHeroFix/4.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def fetch_binary(url):
    req = urllib.request.Request(url, headers={"User-Agent": "StormAndMe-StorefrontHeroQA/1.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def get_product(product_id):
    return request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")


def placement_rows(product, wanted_position=None):
    rows = []
    for area in product.get("print_areas", []):
        for placeholder in area.get("placeholders", []):
            position = str(placeholder.get("position", "")).lower()
            if wanted_position and position != wanted_position:
                continue
            for image in placeholder.get("images", []):
                rows.append(
                    {
                        "position": position,
                        "id": image.get("id"),
                        "x": image.get("x"),
                        "y": image.get("y"),
                        "scale": image.get("scale"),
                        "angle": image.get("angle"),
                    }
                )
    return rows


def placement_is_ready(product):
    front = placement_rows(product, "front")
    back = placement_rows(product, "back")
    if not front or not back:
        return False
    for row in front:
        try:
            if abs(float(row.get("scale") or 0) - TARGET_FRONT_SCALE) > 0.02:
                return False
            if abs(float(row.get("x") or 0) - TARGET_FRONT_X) > 0.02:
                return False
            if abs(float(row.get("y") or 0) - TARGET_FRONT_Y) > 0.02:
                return False
        except (TypeError, ValueError):
            return False
    return True


def verify_price(product, expected):
    enabled = [variant for variant in product.get("variants", []) if variant.get("is_enabled")]
    if not enabled:
        raise RuntimeError(f"{product.get('title')}: no enabled variants")
    if any(int(variant.get("price", 0)) != expected for variant in enabled):
        raise RuntimeError(f"{product.get('title')}: price drift")
    return len(enabled)


def find_logo_image_id(products):
    ids = []
    for product in products.values():
        ids.extend(row["id"] for row in placement_rows(product, "front") if row.get("id"))
    if not ids:
        raise RuntimeError("No existing official Storm And Me front-logo image ID found")
    print(f"Using existing official Storm And Me logo upload {ids[0]}")
    return ids[0]


def clean_back_images(placeholder):
    return [
        {
            "id": image["id"],
            "x": image.get("x", 0.5),
            "y": image.get("y", 0.5),
            "scale": image.get("scale", 1),
            "angle": image.get("angle", 0),
        }
        for image in placeholder.get("images", [])
        if image.get("id")
    ]


def rebuilt_print_areas(product, logo_image_id):
    result = []
    for area in product.get("print_areas", []):
        backs = []
        for placeholder in area.get("placeholders", []):
            if str(placeholder.get("position", "")).lower() == "back":
                images = clean_back_images(placeholder)
                if images:
                    backs.append({"position": "back", "images": images})
        if not backs:
            continue
        result.append(
            {
                "variant_ids": area.get("variant_ids", []),
                "placeholders": [
                    *backs,
                    {
                        "position": "front",
                        "images": [
                            {
                                "id": logo_image_id,
                                "x": TARGET_FRONT_X,
                                "y": TARGET_FRONT_Y,
                                "scale": TARGET_FRONT_SCALE,
                                "angle": 0,
                            }
                        ],
                    },
                ],
            }
        )
    if not result:
        raise RuntimeError(f"{product.get('title')}: back artwork missing; refusing update")
    return result


def update_when_editable(product_id, payload):
    for attempt in range(1, 31):
        try:
            return request("PUT", f"/shops/{SHOP_ID}/products/{product_id}.json", payload)
        except RuntimeError as exc:
            if "Product is disabled for editing" not in str(exc) or attempt == 30:
                raise
            if attempt in {1, 6, 12, 18, 24}:
                print(f"{product_id}: Printify still finishing prior publish; retry {attempt}/30")
            time.sleep(10)
    raise RuntimeError(f"{product_id}: edit lock did not clear")


def wait_for_ready(product_ids):
    latest = {}
    for attempt in range(1, 61):
        pending = []
        for product_id in product_ids:
            latest[product_id] = get_product(product_id)
            if not placement_is_ready(latest[product_id]):
                pending.append(product_id)
        if not pending:
            return latest
        if attempt in {1, 6, 12, 24, 36, 48, 60}:
            print(f"Waiting for Printify placement propagation {attempt}/60; pending={pending}")
        time.sleep(5)
    raise RuntimeError("Printify placement propagation timed out")


def mockup(product, position, default_only=False):
    for image in product.get("images", []):
        if str(image.get("position", "")).lower() != position:
            continue
        if default_only and not image.get("is_default"):
            continue
        if image.get("src"):
            return image["src"]
    return ""


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    current = {}
    for spec in PRODUCTS:
        product = get_product(spec["id"])
        if product.get("title") != spec["title"]:
            raise RuntimeError(
                f"Refusing {spec['id']}: expected {spec['title']!r}, got {product.get('title')!r}"
            )
        verify_price(product, spec["price"])
        if not placement_rows(product, "back"):
            raise RuntimeError(f"{spec['title']}: approved back statement artwork missing")
        current[spec["id"]] = product

    needs_update = [spec for spec in PRODUCTS if not placement_is_ready(current[spec["id"]])]
    if needs_update:
        logo_id = find_logo_image_id(current)
        for spec in needs_update:
            update_when_editable(
                spec["id"],
                {"print_areas": rebuilt_print_areas(current[spec["id"]], logo_id)},
            )
            print(f"submitted storefront-visibility update: {spec['title']}")
        wait_for_ready([spec["id"] for spec in PRODUCTS])
        for spec in needs_update:
            request(
                "POST",
                f"/shops/{SHOP_ID}/products/{spec['id']}/publish.json",
                {
                    "title": False,
                    "description": False,
                    "images": True,
                    "variants": False,
                    "tags": False,
                    "keyFeatures": False,
                },
            )
            print(f"republished mockups: {spec['title']}")
        time.sleep(30)
    else:
        print("All three live products already have the corrected centered front branding; no write needed.")

    report = []
    for spec in PRODUCTS:
        product = get_product(spec["id"])
        if not placement_is_ready(product):
            raise RuntimeError(f"{spec['title']}: final placement verification failed")
        variant_count = verify_price(product, spec["price"])
        front_url = mockup(product, "front", default_only=True)
        back_url = mockup(product, "back")
        if not front_url or not back_url:
            raise RuntimeError(f"{spec['title']}: generated front/back mockup missing")

        front_path = OUT / f"{spec['slug']}-storefront-front.jpg"
        back_path = OUT / f"{spec['slug']}-back.jpg"
        front_path.write_bytes(fetch_binary(front_url))
        back_path.write_bytes(fetch_binary(back_url))
        if front_path.stat().st_size < 10000 or back_path.stat().st_size < 10000:
            raise RuntimeError(f"{spec['title']}: downloaded QA mockup is unexpectedly small")

        report.append(
            {
                "product_id": spec["id"],
                "title": spec["title"],
                "price_cents": spec["price"],
                "variant_count": variant_count,
                "front_placement": placement_rows(product, "front"),
                "back_placement": placement_rows(product, "back"),
                "storefront_default_front_mockup": front_url,
                "back_mockup": back_url,
                "front_file": str(front_path),
                "back_file": str(back_path),
                "visible": product.get("visible"),
                "external": product.get("external"),
            }
        )
        print(f"VERIFIED + CAPTURED: {spec['title']} — exact price, visible front brand, preserved back statement")

    report_path = OUT / "report.json"
    report_path.write_text(json.dumps({"shop_id": SHOP_ID, "products": report}, indent=2) + "\n", encoding="utf-8")
    print(f"QA mockups saved to {OUT}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

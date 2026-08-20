#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip() or "28312107"

PRODUCTS = {
    "6a869680606e476ad103a016": {
        "title": "Obama 2028 — Vintage Black Statement Tee",
        "price": 3200,
    },
    "6a86968a6ad239171c07ee5b": {
        "title": "Obama 2028 — Statement Hoodie",
        "price": 6200,
    },
    "6a86969021939a43b002c79c": {
        "title": "Obama 2028 — White Statement Tee",
        "price": 2800,
    },
}

# Printify Pop-Up Store always uses its generated FRONT mockup as the catalog card.
# The old 0.22-scale upper-left chest mark looked like a speck in the store grid.
# Keep the approved oversized Obama statement on the BACK, but make the official
# Storm And Me mark an intentional, visible centered FRONT treatment.
TARGET_FRONT_SCALE = 0.62
TARGET_FRONT_X = 0.50
TARGET_FRONT_Y = 0.36
POLL_SECONDS = 5
POLL_ATTEMPTS = 60


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-StorefrontHeroFix/3.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def get_product(product_id):
    return request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")


def image_rows(product, wanted_position=None):
    rows = []
    for area_index, area in enumerate(product.get("print_areas", [])):
        for placeholder in area.get("placeholders", []):
            position = str(placeholder.get("position", "")).lower()
            if wanted_position and position != wanted_position:
                continue
            for image in placeholder.get("images", []):
                rows.append(
                    {
                        "area_index": area_index,
                        "variant_ids": area.get("variant_ids", []),
                        "position": position,
                        "id": image.get("id"),
                        "x": image.get("x"),
                        "y": image.get("y"),
                        "scale": image.get("scale"),
                        "angle": image.get("angle"),
                    }
                )
    return rows


def find_logo_image_id(products):
    # Black may already be missing its front placeholder from the earlier safe test.
    # Reuse the exact official logo upload still attached to white/hoodie, rather than
    # uploading or substituting any new artwork.
    candidates = []
    for product_id, product in products.items():
        for row in image_rows(product, "front"):
            if row.get("id"):
                candidates.append((product_id, row["id"]))
    if not candidates:
        raise RuntimeError("No existing Storm And Me front-logo image ID found on the three exact products")
    logo_id = candidates[0][1]
    distinct = {candidate[1] for candidate in candidates}
    print(f"Using existing official front-logo image id {logo_id}; observed front image ids={sorted(distinct)}")
    return logo_id


def clean_back_images(placeholder):
    rows = []
    for image in placeholder.get("images", []):
        if not image.get("id"):
            continue
        rows.append(
            {
                "id": image["id"],
                "x": image.get("x", 0.5),
                "y": image.get("y", 0.5),
                "scale": image.get("scale", 1),
                "angle": image.get("angle", 0),
            }
        )
    return rows


def rebuilt_print_areas(product, logo_image_id):
    result = []
    back_found = False
    for area in product.get("print_areas", []):
        back_placeholders = []
        for placeholder in area.get("placeholders", []):
            if str(placeholder.get("position", "")).lower() != "back":
                continue
            images = clean_back_images(placeholder)
            if images:
                back_placeholders.append({"position": "back", "images": images})
                back_found = True
        if not back_placeholders:
            continue
        result.append(
            {
                "variant_ids": area.get("variant_ids", []),
                "placeholders": [
                    *back_placeholders,
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
    if not back_found or not result:
        raise RuntimeError(f"{product.get('title')}: approved back artwork is missing; refusing to modify product")
    return result


def placement_is_ready(product):
    front = image_rows(product, "front")
    back = image_rows(product, "back")
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


def wait_for_all_placements():
    latest = {}
    for attempt in range(1, POLL_ATTEMPTS + 1):
        pending = []
        for product_id, spec in PRODUCTS.items():
            product = get_product(product_id)
            latest[product_id] = product
            if not placement_is_ready(product):
                pending.append(spec["title"])
        if not pending:
            print(f"All three Printify print-area updates visible after {attempt} poll(s).")
            return latest
        if attempt in {1, 6, 12, 24, 36, 48, 60}:
            print(f"Waiting for Printify print-area propagation ({attempt}/{POLL_ATTEMPTS}); pending={pending}")
        time.sleep(POLL_SECONDS)
    detail = {
        product_id: image_rows(product)
        for product_id, product in latest.items()
    }
    raise RuntimeError(f"Printify print-area propagation timed out: {json.dumps(detail)}")


def mockup(product, position, default_only=False):
    for image in product.get("images", []):
        if str(image.get("position", "")).lower() != position:
            continue
        if default_only and not image.get("is_default"):
            continue
        if image.get("src"):
            return image["src"]
    return ""


def verify_price(product, expected):
    enabled = [variant for variant in product.get("variants", []) if variant.get("is_enabled")]
    if not enabled:
        raise RuntimeError(f"{product.get('title')}: no enabled variants after update")
    if any(int(variant.get("price", 0)) != expected for variant in enabled):
        raise RuntimeError(f"{product.get('title')}: price drift after update")
    return len(enabled)


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    originals = {}
    for product_id, spec in PRODUCTS.items():
        product = get_product(product_id)
        if product.get("title") != spec["title"]:
            raise RuntimeError(
                f"Refusing to update {product_id}: expected {spec['title']!r}, got {product.get('title')!r}"
            )
        verify_price(product, spec["price"])
        if not image_rows(product, "back"):
            raise RuntimeError(f"{spec['title']}: approved back artwork is missing before update")
        originals[product_id] = product

    logo_image_id = find_logo_image_id(originals)

    # Send all three updates first so Printify can regenerate them in parallel.
    for product_id, spec in PRODUCTS.items():
        request(
            "PUT",
            f"/shops/{SHOP_ID}/products/{product_id}.json",
            {"print_areas": rebuilt_print_areas(originals[product_id], logo_image_id)},
        )
        print(f"submitted front-visibility update: {spec['title']}")

    wait_for_all_placements()

    # Publish only image changes; title/price/variants/tags remain untouched.
    for product_id, spec in PRODUCTS.items():
        request(
            "POST",
            f"/shops/{SHOP_ID}/products/{product_id}/publish.json",
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

    # Give the mockup renderer/storefront sync a short window, then verify the exact
    # products still have front+back mockups and the unchanged prices.
    time.sleep(30)
    report = []
    for product_id, spec in PRODUCTS.items():
        product = get_product(product_id)
        if not placement_is_ready(product):
            raise RuntimeError(f"{spec['title']}: final front/back placement verification failed")
        variant_count = verify_price(product, spec["price"])
        front_default = mockup(product, "front", default_only=True)
        front_any = mockup(product, "front")
        back_any = mockup(product, "back")
        if not front_any or not back_any:
            raise RuntimeError(f"{spec['title']}: missing generated front/back mockup after publish")
        if not front_default:
            raise RuntimeError(f"{spec['title']}: Printify did not expose its expected front title mockup")
        row = {
            "product_id": product_id,
            "title": spec["title"],
            "price_cents": spec["price"],
            "variant_count": variant_count,
            "front_placement": image_rows(product, "front"),
            "back_placement": image_rows(product, "back"),
            "storefront_default_front_mockup": front_default,
            "back_mockup": back_any,
            "visible": product.get("visible"),
            "external": product.get("external"),
        }
        report.append(row)
        print(f"VERIFIED: {spec['title']} — visible centered front brand + preserved back statement + exact price")

    print("STOREFRONT_HERO_FIX_REPORT=" + json.dumps({"shop_id": SHOP_ID, "products": report}, separators=(",", ":")))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

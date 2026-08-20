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
    "6a869680606e476ad103a016": "Obama 2028 — Vintage Black Statement Tee",
    "6a86968a6ad239171c07ee5b": "Obama 2028 — Statement Hoodie",
    "6a86969021939a43b002c79c": "Obama 2028 — White Statement Tee",
}

TARGET_FRONT_SCALE = 0.52
TARGET_FRONT_X = 0.50
TARGET_FRONT_Y = 0.34


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-StorefrontHeroFix/2.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def clean_image(image, position):
    result = {
        "id": image["id"],
        "x": image.get("x", 0.5),
        "y": image.get("y", 0.5),
        "scale": image.get("scale", 1),
        "angle": image.get("angle", 0),
    }
    if position == "front":
        result.update({"x": TARGET_FRONT_X, "y": TARGET_FRONT_Y, "scale": TARGET_FRONT_SCALE, "angle": 0})
    return result


def rebuilt_print_areas(product):
    areas = []
    front_found = False
    back_found = False
    for area in product.get("print_areas", []):
        placeholders = []
        for placeholder in area.get("placeholders", []):
            position = str(placeholder.get("position", "")).lower()
            if position not in {"front", "back"}:
                continue
            images = [clean_image(image, position) for image in placeholder.get("images", [])]
            if not images:
                continue
            placeholders.append({"position": position, "images": images})
            front_found = front_found or position == "front"
            back_found = back_found or position == "back"
        if placeholders:
            areas.append({"variant_ids": area.get("variant_ids", []), "placeholders": placeholders})
    if not front_found:
        raise RuntimeError(f"{product.get('title')}: expected existing front branding placeholder")
    if not back_found:
        raise RuntimeError(f"{product.get('title')}: expected existing back statement artwork")
    return areas


def inspect_positions(product):
    rows = []
    for area in product.get("print_areas", []):
        for placeholder in area.get("placeholders", []):
            position = str(placeholder.get("position", "")).lower()
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


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    report = []
    for product_id, expected_title in PRODUCTS.items():
        product = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")
        if product.get("title") != expected_title:
            raise RuntimeError(
                f"Refusing to update {product_id}: expected {expected_title!r}, got {product.get('title')!r}"
            )

        before = inspect_positions(product)
        request(
            "PUT",
            f"/shops/{SHOP_ID}/products/{product_id}.json",
            {"print_areas": rebuilt_print_areas(product)},
        )
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
        time.sleep(8)
        latest = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")
        after = inspect_positions(latest)

        front = [row for row in after if row["position"] == "front"]
        back = [row for row in after if row["position"] == "back"]
        if not front or not back:
            raise RuntimeError(f"{expected_title}: front/back artwork missing after update")
        if any(abs(float(row.get("scale") or 0) - TARGET_FRONT_SCALE) > 0.02 for row in front):
            raise RuntimeError(f"{expected_title}: front logo scale did not update: {front}")
        if any(abs(float(row.get("x") or 0) - TARGET_FRONT_X) > 0.02 for row in front):
            raise RuntimeError(f"{expected_title}: front logo x did not update: {front}")
        if any(abs(float(row.get("y") or 0) - TARGET_FRONT_Y) > 0.02 for row in front):
            raise RuntimeError(f"{expected_title}: front logo y did not update: {front}")

        default_images = [
            {"position": img.get("position"), "src": img.get("src"), "is_default": img.get("is_default")}
            for img in latest.get("images", [])
            if img.get("is_default")
        ]
        if not default_images or any(str(img.get("position", "")).lower() != "front" for img in default_images):
            raise RuntimeError(f"{expected_title}: unexpected storefront default image state: {default_images}")

        report.append(
            {
                "product_id": product_id,
                "title": expected_title,
                "before": before,
                "after": after,
                "default_images": default_images,
            }
        )
        print(f"fixed: {expected_title} -> storefront default front now uses a visible centered Storm And Me mark")

    print(json.dumps({"shop_id": SHOP_ID, "products": report}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

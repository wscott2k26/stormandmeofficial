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


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-StorefrontHeroFix/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def back_only_print_areas(product):
    result = []
    for area in product.get("print_areas", []):
        placeholders = [
            placeholder
            for placeholder in area.get("placeholders", [])
            if str(placeholder.get("position", "")).lower() == "back"
        ]
        if placeholders:
            result.append(
                {
                    "variant_ids": area.get("variant_ids", []),
                    "placeholders": placeholders,
                }
            )
    if not result:
        raise RuntimeError(f"{product.get('title')} has no back print area to preserve")
    return result


def wait_for_back_hero(product_id, attempts=36):
    latest = {}
    for _ in range(attempts):
        latest = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")
        images = latest.get("images", [])
        defaults = [image for image in images if image.get("is_default")]
        if defaults and all(str(image.get("position", "")).lower() == "back" for image in defaults):
            return latest
        time.sleep(5)
    return latest


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

        # The storefront uses Printify's default mockup as the collection-card hero.
        # A tiny left-chest logo was making these cards look blank. Keep the approved
        # oversized statement artwork on the back and remove the tiny front placeholder
        # so Printify promotes the back mockup as the product's title image.
        request(
            "PUT",
            f"/shops/{SHOP_ID}/products/{product_id}.json",
            {"print_areas": back_only_print_areas(product)},
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

        latest = wait_for_back_hero(product_id)
        defaults = [
            {
                "position": image.get("position"),
                "src": image.get("src"),
                "is_default": image.get("is_default"),
            }
            for image in latest.get("images", [])
            if image.get("is_default")
        ]
        front_placeholders = [
            placeholder
            for area in latest.get("print_areas", [])
            for placeholder in area.get("placeholders", [])
            if str(placeholder.get("position", "")).lower() == "front"
        ]
        back_placeholders = [
            placeholder
            for area in latest.get("print_areas", [])
            for placeholder in area.get("placeholders", [])
            if str(placeholder.get("position", "")).lower() == "back"
        ]

        if front_placeholders:
            raise RuntimeError(f"{expected_title}: front placeholder still exists after update")
        if not back_placeholders:
            raise RuntimeError(f"{expected_title}: back artwork disappeared after update")
        if not defaults or any(str(image.get("position", "")).lower() != "back" for image in defaults):
            raise RuntimeError(
                f"{expected_title}: storefront hero did not resolve to a back mockup; defaults={defaults}"
            )

        report.append(
            {
                "product_id": product_id,
                "title": expected_title,
                "default_images": defaults,
                "front_placeholders": len(front_placeholders),
                "back_placeholders": len(back_placeholders),
            }
        )
        print(f"fixed: {expected_title} -> default storefront mockup is BACK")

    print(json.dumps({"shop_id": SHOP_ID, "products": report}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

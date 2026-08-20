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
SOURCE_ID = "6a869680606e476ad103a016"
SOURCE_TITLE = "Obama 2028 — Vintage Black Statement Tee"
TEST_TITLE = SOURCE_TITLE + " — STOREFRONT HERO TEST"


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-StorefrontHeroCanary/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def list_products():
    result = request("GET", f"/shops/{SHOP_ID}/products.json?limit=50&page=1")
    return result.get("data", []) if isinstance(result, dict) else []


def delete_old_canaries():
    for row in list_products():
        if row.get("title") == TEST_TITLE:
            request("DELETE", f"/shops/{SHOP_ID}/products/{row['id']}.json")
            print(f"deleted stale canary {row['id']}")


def clean_image(image):
    return {
        "id": image["id"],
        "x": image.get("x", 0.5),
        "y": image.get("y", 0.5),
        "scale": image.get("scale", 1),
        "angle": image.get("angle", 0),
    }


def back_only_print_areas(product):
    areas = []
    for area in product.get("print_areas", []):
        back_placeholders = []
        for placeholder in area.get("placeholders", []):
            if str(placeholder.get("position", "")).lower() != "back":
                continue
            back_placeholders.append(
                {
                    "position": "back",
                    "images": [clean_image(image) for image in placeholder.get("images", [])],
                }
            )
        if back_placeholders:
            areas.append({"variant_ids": area.get("variant_ids", []), "placeholders": back_placeholders})
    if not areas:
        raise RuntimeError("Source product has no back print area")
    return areas


def clone_variants(product):
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
        raise RuntimeError("Source product has no enabled variants")
    if not any(row["is_default"] for row in rows):
        rows[0]["is_default"] = True
    return rows


def wait_for_images(product_id, attempts=24):
    latest = {}
    for _ in range(attempts):
        latest = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")
        if latest.get("images"):
            return latest
        time.sleep(5)
    return latest


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    delete_old_canaries()
    source = request("GET", f"/shops/{SHOP_ID}/products/{SOURCE_ID}.json")
    if source.get("title") != SOURCE_TITLE:
        raise RuntimeError(f"Source title mismatch: {source.get('title')!r}")

    payload = {
        "title": TEST_TITLE,
        "description": "Unpublished technical canary used to verify the Printify storefront title-image behavior.",
        "tags": ["Storm And Me", "storefront hero test"],
        "blueprint_id": int(source["blueprint_id"]),
        "print_provider_id": int(source["print_provider_id"]),
        "variants": clone_variants(source),
        "print_areas": back_only_print_areas(source),
    }
    created = request("POST", f"/shops/{SHOP_ID}/products.json", payload)
    product_id = created["id"]
    print(f"created unpublished back-only canary {product_id}")

    latest = wait_for_images(product_id)
    images = latest.get("images", [])
    defaults = [image for image in images if image.get("is_default")]
    summary = [
        {
            "position": image.get("position"),
            "is_default": image.get("is_default"),
            "src": image.get("src"),
        }
        for image in images[:12]
    ]
    print(json.dumps({"product_id": product_id, "defaults": defaults, "images": summary}, indent=2))

    # Always delete the unpublished canary after inspection.
    request("DELETE", f"/shops/{SHOP_ID}/products/{product_id}.json")
    print(f"deleted canary {product_id}")

    if not defaults:
        raise RuntimeError("Back-only canary produced no default mockup")
    if any(str(image.get("position", "")).lower() != "back" for image in defaults):
        raise RuntimeError(f"Back-only canary still defaults to a non-back mockup: {defaults}")

    print("CANARY PASS: a back-only Printify product defaults to the back mockup, so safe recreation will fix the storefront cards without changing the approved garment design.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

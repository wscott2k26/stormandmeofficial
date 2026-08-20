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
SOURCE_ID = "6a869680606e476ad103a016"
OUT = Path("automation-output/front-scale-probe")
OUT.mkdir(parents=True, exist_ok=True)
SCALES = [1.8, 3.0, 4.0]


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-FrontScaleProbe/1.0",
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
    req = urllib.request.Request(url, headers={"User-Agent": "StormAndMe-FrontScaleProbe/1.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def placement_image(product, position):
    for area in product.get("print_areas", []):
        for placeholder in area.get("placeholders", []):
            if str(placeholder.get("position", "")).lower() == position:
                for image in placeholder.get("images", []):
                    if image.get("id"):
                        return image
    return None


def enabled_variants(product):
    rows = []
    for variant in product.get("variants", []):
        if variant.get("is_enabled"):
            rows.append(
                {
                    "id": variant["id"],
                    "price": int(variant["price"]),
                    "is_enabled": True,
                    "is_default": bool(variant.get("is_default")),
                }
            )
    if not rows:
        raise RuntimeError("Source has no enabled variants")
    if not any(row["is_default"] for row in rows):
        rows[0]["is_default"] = True
    return rows


def wait_for_front(product_id):
    latest = {}
    for _ in range(30):
        latest = request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json")
        for image in latest.get("images", []):
            if str(image.get("position", "")).lower() == "front" and image.get("src"):
                return latest, image["src"]
        time.sleep(3)
    raise RuntimeError(f"No front mockup generated for {product_id}")


def cleanup_existing():
    result = request("GET", f"/shops/{SHOP_ID}/products.json?limit=50&page=1")
    for product in result.get("data", []):
        if str(product.get("title", "")).startswith("STORE HERO SCALE PROBE —"):
            request("DELETE", f"/shops/{SHOP_ID}/products/{product['id']}.json")
            print(f"removed stale probe {product['id']}")


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")
    cleanup_existing()
    source = request("GET", f"/shops/{SHOP_ID}/products/{SOURCE_ID}.json")
    logo = placement_image(source, "front")
    back = placement_image(source, "back")
    if not logo or not back:
        raise RuntimeError("Source product must have both front logo and back statement art")
    variants = enabled_variants(source)
    variant_ids = [row["id"] for row in variants]

    report = []
    created_ids = []
    try:
        for scale in SCALES:
            title = f"STORE HERO SCALE PROBE — {scale:.1f}"
            payload = {
                "title": title,
                "description": "Unpublished temporary mockup sizing probe. Not for sale.",
                "tags": ["technical probe"],
                "blueprint_id": int(source["blueprint_id"]),
                "print_provider_id": int(source["print_provider_id"]),
                "variants": variants,
                "print_areas": [
                    {
                        "variant_ids": variant_ids,
                        "placeholders": [
                            {
                                "position": "back",
                                "images": [
                                    {
                                        "id": back["id"],
                                        "x": back.get("x", 0.5),
                                        "y": back.get("y", 0.5),
                                        "scale": back.get("scale", 0.94),
                                        "angle": back.get("angle", 0),
                                    }
                                ],
                            },
                            {
                                "position": "front",
                                "images": [
                                    {
                                        "id": logo["id"],
                                        "x": 0.5,
                                        "y": 0.38,
                                        "scale": scale,
                                        "angle": 0,
                                    }
                                ],
                            },
                        ],
                    }
                ],
            }
            created = request("POST", f"/shops/{SHOP_ID}/products.json", payload)
            product_id = created["id"]
            created_ids.append(product_id)
            latest, front_url = wait_for_front(product_id)
            path = OUT / f"front-scale-{str(scale).replace('.', '_')}.jpg"
            path.write_bytes(fetch_binary(front_url))
            report.append({"scale": scale, "product_id": product_id, "front_url": front_url, "file": str(path)})
            print(f"captured scale {scale:.1f}: {front_url}")
    finally:
        for product_id in created_ids:
            try:
                request("DELETE", f"/shops/{SHOP_ID}/products/{product_id}.json")
                print(f"deleted probe {product_id}")
            except Exception as exc:
                print(f"WARNING: could not delete probe {product_id}: {exc}")

    (OUT / "report.json").write_text(json.dumps({"shop_id": SHOP_ID, "probes": report}, indent=2) + "\n", encoding="utf-8")
    print("FRONT SCALE PROBE COMPLETE")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

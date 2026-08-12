#!/usr/bin/env python3
import base64
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.printify.com/v1"
TOKEN = os.environ["PRINTIFY_API_TOKEN"].strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "28312107").strip()
SOURCE_ID = "6a7bd33e44cf7ff645047bd3"
TARGET_ID = "6a7bd78b62d856b0f700a290"
TITLE = "God Builds Masterpieces Out of Broken Pieces — Cracked Heart Tee"
ART_B64 = Path("automation/printify/god-builds-back.png.b64")


def request(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-Automation/3.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail}") from exc


def main():
    source = request("GET", f"/shops/{SHOP_ID}/products/{SOURCE_ID}.json")
    image = request(
        "POST",
        "/uploads/images.json",
        {
            "file_name": "Broken-Pieces-God-Builds-BACK-PRINT.png",
            "contents": ART_B64.read_text(encoding="ascii").strip(),
        },
    )
    image_id = image["id"]

    print_areas = source["print_areas"]
    replaced = False
    for area in print_areas:
        for placeholder in area.get("placeholders", []):
            if placeholder.get("position") != "back":
                continue
            for layer in placeholder.get("images", []):
                layer["id"] = image_id
                replaced = True
    if not replaced:
        raise RuntimeError("The copied product did not contain a back print layer.")

    description = source.get("description", "")
    replacements = {
        "God Still Makes Masterpieces From Broken Pieces": "God Builds Masterpieces Out of Broken Pieces",
        "GOD STILL MAKES MASTERPIECES FROM BROKEN PIECES": "GOD BUILDS MASTERPIECES OUT OF BROKEN PIECES",
        "still makes masterpieces from broken pieces": "builds masterpieces out of broken pieces",
    }
    for old, new in replacements.items():
        description = description.replace(old, new)

    payload = {
        "title": TITLE,
        "description": description,
        "tags": source.get("tags", []),
        "blueprint_id": source["blueprint_id"],
        "print_provider_id": source["print_provider_id"],
        "variants": [
            {
                "id": variant["id"],
                "price": variant["price"],
                "is_enabled": variant.get("is_enabled", True),
                "is_default": variant.get("is_default", False),
            }
            for variant in source["variants"]
        ],
        "print_areas": print_areas,
    }

    request("PUT", f"/shops/{SHOP_ID}/products/{TARGET_ID}.json", payload)
    request(
        "POST",
        f"/shops/{SHOP_ID}/products/{TARGET_ID}/publish.json",
        {
            "title": True,
            "description": True,
            "images": True,
            "variants": True,
            "tags": True,
            "keyFeatures": True,
        },
    )

    result = {}
    for _ in range(12):
        result = request("GET", f"/shops/{SHOP_ID}/products/{TARGET_ID}.json")
        if result.get("visible") or result.get("is_locked") is False:
            break
        time.sleep(5)

    print(json.dumps({
        "product_id": TARGET_ID,
        "title": result.get("title", TITLE),
        "visible": result.get("visible"),
        "variants": len(result.get("variants", [])),
        "status": "publish_requested",
    }, indent=2))


if __name__ == "__main__":
    main()

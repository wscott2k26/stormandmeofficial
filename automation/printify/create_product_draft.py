#!/usr/bin/env python3
import json
import os
import sys
import urllib.request
import urllib.error

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip()
CONFIG_PATH = os.environ.get("PRODUCT_CONFIG", "automation/printify/product-request.json")
CONFIRM_CREATE = os.environ.get("CONFIRM_CREATE", "false").lower() == "true"


def request(method, path, payload=None):
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}",
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "StormAndMe-Automation/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code}: {detail}") from exc


def resolve_shop_id():
    if SHOP_ID:
        return SHOP_ID
    shops = request("GET", "/shops.json")
    if not shops:
        raise RuntimeError("No Printify shops were returned.")
    preferred = [s for s in shops if "storm" in s.get("title", "").lower()]
    shop = preferred[0] if preferred else shops[0]
    return str(shop["id"])


def main():
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN secret.")
    with open(CONFIG_PATH, "r", encoding="utf-8") as handle:
        cfg = json.load(handle)

    required = ["title", "description", "blueprint_id", "print_provider_id", "variants", "print_areas"]
    missing = [key for key in required if key not in cfg]
    if missing:
        raise RuntimeError("Missing required config keys: " + ", ".join(missing))

    shop_id = resolve_shop_id()
    payload = {
        "title": cfg["title"],
        "description": cfg["description"],
        "blueprint_id": int(cfg["blueprint_id"]),
        "print_provider_id": int(cfg["print_provider_id"]),
        "variants": cfg["variants"],
        "print_areas": cfg["print_areas"],
    }

    os.makedirs("automation-output", exist_ok=True)
    with open("automation-output/product-payload.json", "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)

    if not CONFIRM_CREATE:
        print("DRY RUN COMPLETE: payload validated; no Printify product was created.")
        print(f"Resolved shop ID: {shop_id}")
        return

    product = request("POST", f"/shops/{shop_id}/products.json", payload)
    result = {
        "shop_id": shop_id,
        "product_id": product.get("id"),
        "title": product.get("title"),
        "published": False,
        "status": "draft_created",
    }
    with open("automation-output/product-result.json", "w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

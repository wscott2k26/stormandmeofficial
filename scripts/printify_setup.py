#!/usr/bin/env python3
"""Validate the StormAndMe Printify connection without publishing anything.

This script:
- reads PRINTIFY_API_TOKEN from the environment
- discovers the StormAndMe shop automatically
- lists the current product catalog
- writes a redacted JSON report for GitHub Actions

It never prints the token and performs no write or publish requests.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

API_BASE = "https://api.printify.com/v1"
REPORT_PATH = Path("automation-output/printify-inventory.json")


def api_get(path: str, token: str) -> Any:
    request = urllib.request.Request(
        f"{API_BASE}{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "StormAndMe-GitHub-Automation/1.0",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API returned HTTP {exc.code}: {body[:500]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Could not reach Printify API: {exc.reason}") from exc


def choose_shop(shops: list[dict[str, Any]]) -> dict[str, Any]:
    if not shops:
        raise RuntimeError("No Printify shops were returned for this token.")

    preferred = [
        shop
        for shop in shops
        if "stormandme" in str(shop.get("title", "")).lower().replace(" ", "")
    ]
    if len(preferred) == 1:
        return preferred[0]
    if len(shops) == 1:
        return shops[0]

    available = ", ".join(str(shop.get("title", shop.get("id"))) for shop in shops)
    raise RuntimeError(
        "Multiple Printify shops were found and StormAndMe could not be selected "
        f"safely. Available shops: {available}"
    )


def main() -> int:
    token = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
    if not token:
        print("ERROR: GitHub secret PRINTIFY_API_TOKEN is missing.", file=sys.stderr)
        return 1

    shops = api_get("/shops.json", token)
    if not isinstance(shops, list):
        raise RuntimeError("Unexpected response from Printify shops endpoint.")

    shop = choose_shop(shops)
    shop_id = int(shop["id"])
    products_response = api_get(f"/shops/{shop_id}/products.json?limit=50&page=1", token)
    products = products_response.get("data", []) if isinstance(products_response, dict) else []

    safe_products = []
    for product in products:
        variants = product.get("variants", []) or []
        safe_products.append(
            {
                "id": product.get("id"),
                "title": product.get("title"),
                "visible": product.get("visible"),
                "is_locked": product.get("is_locked"),
                "variant_count": len(variants),
                "enabled_variant_count": sum(1 for variant in variants if variant.get("is_enabled")),
                "created_at": product.get("created_at"),
                "updated_at": product.get("updated_at"),
            }
        )

    report = {
        "connection": "verified",
        "mode": "read-only-draft-first",
        "shop": {
            "id": shop_id,
            "title": shop.get("title"),
            "sales_channel": shop.get("sales_channel"),
        },
        "product_count_returned": len(safe_products),
        "products": safe_products,
        "next_step": "Review inventory before enabling product creation or publishing.",
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as output:
            output.write(f"shop_id={shop_id}\n")
            output.write(f"shop_title={shop.get('title', '')}\n")
            output.write(f"product_count={len(safe_products)}\n")

    print(f"Printify connection verified for shop: {shop.get('title')} (ID {shop_id})")
    print(f"Found {len(safe_products)} products on the first inventory page.")
    print("No products were created, changed, or published.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001 - concise CI failure output
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)

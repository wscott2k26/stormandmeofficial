#!/usr/bin/env python3
import json
from pathlib import Path

from finalize_rules_collection_layout import (
    SHOP_ID,
    COLLECTION,
    PRODUCTS,
    request,
    get_product,
    verify_product,
    enabled_variants,
    upload,
    official_logo_rgba,
    tight_back_art,
    wait_for_images,
    image_url,
    fetch_bytes,
)

OUT = Path("automation-output/rules-hoodie-back-probe")
OUT.mkdir(parents=True, exist_ok=True)
SPEC = PRODUCTS[1]
CANDIDATES = [
    {"name": "hood-a", "back_y": 0.52, "back_scale": 0.92},
    {"name": "hood-b", "back_y": 0.56, "back_scale": 0.96},
    {"name": "hood-c", "back_y": 0.60, "back_scale": 1.00},
]


def save(product, prefix):
    for position in ("front", "back"):
        url = image_url(product, position)
        if not url:
            raise RuntimeError(f"{prefix}: missing {position} mockup")
        path = OUT / f"{prefix}-{position}.jpg"
        path.write_bytes(fetch_bytes(url))
        if path.stat().st_size < 10000:
            raise RuntimeError(f"{path}: unexpectedly small mockup")


def main():
    source = get_product(SPEC["id"])
    verify_product(source, SPEC)
    variants = enabled_variants(source)
    ids = [row["id"] for row in variants]
    logo_id = upload("storm-and-me-final-left-chest-hoodie-probe.png", official_logo_rgba())
    back_id = upload("rules-final-hoodie-back-probe.png", tight_back_art("light"))
    created = []
    report = []
    try:
        for candidate in CANDIDATES:
            payload = {
                "title": f"QA HOOD BACK {SPEC['title']} — {candidate['name']}",
                "description": "Unpublished hoodie back-placement canary.",
                "tags": ["Storm And Me", "QA", COLLECTION],
                "blueprint_id": int(source["blueprint_id"]),
                "print_provider_id": int(source["print_provider_id"]),
                "variants": variants,
                "print_areas": [
                    {
                        "variant_ids": ids,
                        "placeholders": [
                            {
                                "position": "front",
                                "images": [{"id": logo_id, "x": 0.72, "y": 0.24, "scale": 0.28, "angle": 0}],
                            },
                            {
                                "position": "back",
                                "images": [{"id": back_id, "x": 0.50, "y": candidate["back_y"], "scale": candidate["back_scale"], "angle": 0}],
                            },
                        ],
                    }
                ],
            }
            canary = request("POST", f"/shops/{SHOP_ID}/products.json", payload)
            created.append(canary["id"])
            latest = wait_for_images(canary["id"])
            save(latest, candidate["name"])
            report.append({"candidate": candidate, "front": image_url(latest, "front"), "back": image_url(latest, "back")})
            print(f"CAPTURED {candidate['name']}")
    finally:
        for product_id in created:
            try:
                request("DELETE", f"/shops/{SHOP_ID}/products/{product_id}.json")
            except Exception as exc:
                print(f"warning: canary cleanup failed {product_id}: {exc}")
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("HOODIE_BACK_PROBE_COMPLETE")


if __name__ == "__main__":
    main()

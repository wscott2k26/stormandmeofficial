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

OUT = Path("automation-output/rules-true-left-chest-probe")
OUT.mkdir(parents=True, exist_ok=True)

# Wearer's left chest renders on viewer-right. Probe classic polo/Tommy-style placement.
CANDIDATES = [
    {"name": "polo-a", "x": 0.82, "y": 0.21, "scale": 0.22},
    {"name": "polo-b", "x": 0.86, "y": 0.21, "scale": 0.22},
    {"name": "polo-c", "x": 0.90, "y": 0.21, "scale": 0.22},
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


def create_canary(source, spec, candidate, logo_id, back_id):
    variants = enabled_variants(source)
    ids = [row["id"] for row in variants]
    if spec["slug"] == "hoodie":
        back_y, back_scale = 0.56, 0.96
    else:
        back_y, back_scale = 0.43, 0.88
    payload = {
        "title": f"QA TRUE LEFT CHEST {spec['title']} — {candidate['name']}",
        "description": "Unpublished classic left-chest placement canary.",
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
                        "images": [{"id": logo_id, "x": candidate["x"], "y": candidate["y"], "scale": candidate["scale"], "angle": 0}],
                    },
                    {
                        "position": "back",
                        "images": [{"id": back_id, "x": 0.50, "y": back_y, "scale": back_scale, "angle": 0}],
                    },
                ],
            }
        ],
    }
    return request("POST", f"/shops/{SHOP_ID}/products.json", payload)


def main():
    logo_id = upload("storm-and-me-true-left-chest-probe.png", official_logo_rgba())
    art_ids = {
        "dark": upload("rules-true-left-chest-dark-back.png", tight_back_art("dark")),
        "light": upload("rules-true-left-chest-light-back.png", tight_back_art("light")),
    }
    created = []
    report = []
    try:
        for spec in (PRODUCTS[0], PRODUCTS[1]):
            source = get_product(spec["id"])
            verify_product(source, spec)
            for candidate in CANDIDATES:
                canary = create_canary(source, spec, candidate, logo_id, art_ids[spec["palette"]])
                created.append(canary["id"])
                latest = wait_for_images(canary["id"])
                prefix = f"{spec['slug']}-{candidate['name']}"
                save(latest, prefix)
                report.append({
                    "garment": spec["slug"],
                    "candidate": candidate,
                    "front": image_url(latest, "front"),
                    "back": image_url(latest, "back"),
                })
                print(f"CAPTURED {prefix}")
    finally:
        for product_id in created:
            try:
                request("DELETE", f"/shops/{SHOP_ID}/products/{product_id}.json")
            except Exception as exc:
                print(f"warning: canary cleanup failed {product_id}: {exc}")
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("TRUE_LEFT_CHEST_PROBE_COMPLETE")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import copy
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import jesus_coffee_rollout as jcr

SOURCES = {
    "6a876990aa9cea471b08e022": {
        "base_title": "I Run on Coffee & Jesus",
        "front": "6a888132e4c22e733848d0b1",
        "back": "6a8882e7e28ead6037a77cc2",
    },
    "6a8768c94c5ccb17760a17a2": {
        "base_title": "Jesus Saves, Coffee Helps Me Act Saved",
        "front": "6a888132e4c22e733848d0b1",
        "back": "6a88869ef543190f0b061da0",
    },
    "6a876921765de48d610d9a0c": {
        "base_title": "Coffee, Jesus & Minding My Business",
        "front": "6a888132e4c22e733848d0b1",
        "back": "6a888584c6724f17ec5a2b2a",
    },
    "6a87697334e6b74a81056e4b": {
        "base_title": "Coffee First, Jesus Always",
        "front": "6a888132e4c22e733848d0b1",
        "back": "6a888446e4c22e733848d26b",
    },
    "6a8769c22a86ae766007bbaa": {
        "base_title": "Jesus Saves, Coffee Keeps Me Going",
        "front": "6a888132e4c22e733848d0b1",
        "back": "6a8881561ff8c0de07471495",
    },
}

OUT = Path("automation-output/jesus-coffee-rollout.json")


def sanitize_source(source, artwork, clean_title):
    clean = copy.deepcopy(source)
    clean["title"] = clean_title
    allowed = {artwork["front"], artwork["back"]}
    areas = []
    for area in clean.get("print_areas", []) or []:
        new_area = copy.deepcopy(area)
        placeholders = []
        for placeholder in new_area.get("placeholders", []) or []:
            row = copy.deepcopy(placeholder)
            row["images"] = [img for img in (row.get("images", []) or []) if img.get("id") in allowed]
            if row["images"]:
                placeholders.append(row)
        if placeholders:
            new_area["placeholders"] = placeholders
            areas.append(new_area)
    clean["print_areas"] = areas
    if not areas:
        raise RuntimeError(f"No approved artwork remained for source {source.get('id')}")
    return clean


def phone_source(source, artwork, clean_title):
    clean = copy.deepcopy(source)
    clean["title"] = clean_title
    back_id = artwork["back"]
    areas = []
    for area in clean.get("print_areas", []) or []:
        back_images = []
        for placeholder in area.get("placeholders", []) or []:
            for image in placeholder.get("images", []) or []:
                if image.get("id") == back_id:
                    back_images.append(copy.deepcopy(image))
        if back_images:
            areas.append({
                "variant_ids": copy.deepcopy(area.get("variant_ids", []) or []),
                "placeholders": [{"position": "front", "images": back_images}],
            })
    clean["print_areas"] = areas
    if not areas:
        raise RuntimeError(f"Approved large back artwork not found for phone source {source.get('id')}")
    return clean


def source_rows():
    rows = []
    for product_id, spec in SOURCES.items():
        source = jcr.get_product(product_id)
        if not source:
            raise RuntimeError(f"Missing approved source product: {product_id}")
        approved_ids = {spec["front"], spec["back"]}
        present = set(jcr.image_ids(source))
        if not approved_ids <= present:
            raise RuntimeError(
                f"Approved artwork IDs changed for {product_id}: "
                f"expected {sorted(approved_ids)}, found {sorted(present)}"
            )
        rows.append((source, spec))
    return rows


def main():
    sources = source_rows()
    blueprints = jcr.catalog_blueprints()
    preflight = jcr.preflight_targets(blueprints)

    phone_families = set()
    for row in preflight["phone"]:
        phone_families.update(row["covered"])
    if not (phone_families - {"iPhone"}):
        raise RuntimeError("Refusing rollout: phone cases do not include any non-iPhone family.")

    existing = jcr.list_products()
    results = []
    for raw_source, spec in sources:
        apparel_source = sanitize_source(raw_source, spec, spec["base_title"])
        phone_ready = phone_source(raw_source, spec, spec["base_title"])

        for target in preflight["apparel"]:
            result = jcr.create_or_update_product(
                existing,
                apparel_source,
                target["blueprint"],
                target["provider"],
                target["spec"]["kind"],
                target["spec"]["label"],
                target["spec"]["price"],
                target["provider"]["variants"],
                target["provider"]["placeholders"],
            )
            result["source_product_id"] = raw_source["id"]
            result["approved_artwork_ids"] = [spec["front"], spec["back"]]
            results.append(result)
            time.sleep(0.6)

        for phone_target in preflight["phone"]:
            families = sorted(phone_target["covered"])
            label = "Phone Case" if len(preflight["phone"]) == 1 else f"Phone Case ({' / '.join(families)})"
            result = jcr.create_or_update_product(
                existing,
                phone_ready,
                phone_target["blueprint"],
                phone_target["provider"],
                "phone-case",
                label,
                2799,
                phone_target["provider"]["variants"],
                phone_target["provider"]["placeholders"],
            )
            result["source_product_id"] = raw_source["id"]
            result["approved_artwork_ids"] = [spec["back"]]
            results.append(result)
            time.sleep(0.6)

    verification = []
    for row in results:
        product_id = row.get("product_id")
        if not product_id:
            verification.append({"title": row.get("title"), "status": row.get("status"), "verified": False})
            continue
        product = jcr.poll_product(product_id)
        mockups = [img.get("src") for img in product.get("images", []) or [] if img.get("src")]
        verification.append({
            "title": row.get("title"),
            "product_id": product_id,
            "visible": product.get("visible"),
            "mockup_count": len(mockups),
            "verified": product.get("visible") is True and bool(mockups),
        })

    failed = [row for row in verification if not row["verified"]]
    if failed:
        raise RuntimeError(f"{len(failed)} products failed live/mockup verification; homepage not changed.")

    homepage_changed = jcr.patch_homepage()
    report = {
        "mode": "apply-approved-art-only",
        "no_generated_art": True,
        "source_count": len(sources),
        "source_products": [
            {
                "id": raw["id"],
                "original_title": raw.get("title"),
                "collection_title": spec["base_title"],
                "front_artwork_id": spec["front"],
                "back_artwork_id": spec["back"],
            }
            for raw, spec in sources
        ],
        "phone_device_families": sorted(phone_families),
        "results": results,
        "verification": verification,
        "homepage_feature_changed": homepage_changed,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({
        "source_count": len(sources),
        "created_or_updated": len(results),
        "phone_device_families": sorted(phone_families),
        "homepage_feature_changed": homepage_changed,
        "report": str(OUT),
    }, indent=2))


if __name__ == "__main__":
    main()

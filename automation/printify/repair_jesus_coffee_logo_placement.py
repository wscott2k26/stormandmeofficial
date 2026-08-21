#!/usr/bin/env python3
"""Repair only the Jesus & Coffee apparel front-logo placement in Printify.

This intentionally does not recreate products and does not send variants in the
update payload. It reuses each live product's complete print_areas document,
moves only the approved shared front logo to the established left-chest
position, and verifies that artwork IDs, variant coverage, prices, titles, and
back artwork remain unchanged.
"""

from __future__ import annotations

import copy
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import apply_jesus_coffee_collection as app
import jesus_coffee_rollout as jcr

OUT = Path("automation-output/jesus-coffee-logo-repair.json")
APPAREL_KINDS = {"hoodie", "long-sleeve", "fitted-tee"}


def artwork_signature(print_areas):
    """Artwork identity by print-area/placeholder, ignoring placement transforms."""
    rows = []
    for area_index, area in enumerate(print_areas or []):
        for placeholder_index, placeholder in enumerate(area.get("placeholders", []) or []):
            rows.append((
                area_index,
                placeholder_index,
                placeholder.get("position"),
                tuple(image.get("id") for image in (placeholder.get("images", []) or [])),
            ))
    return tuple(rows)


def variant_signature(print_areas):
    """Exact variant coverage for every print area."""
    return tuple(tuple(area.get("variant_ids", []) or []) for area in (print_areas or []))


def product_variant_signature(product):
    """Protect live variant IDs, prices and enable/default state from accidental drift."""
    return tuple(
        (
            variant.get("id"),
            variant.get("price"),
            bool(variant.get("is_enabled")),
            bool(variant.get("is_default")),
        )
        for variant in (product.get("variants", []) or [])
    )


def front_logo_positions(print_areas):
    rows = []
    for area in print_areas or []:
        for placeholder in area.get("placeholders", []) or []:
            if placeholder.get("position") != "front":
                continue
            for image in placeholder.get("images", []) or []:
                if image.get("id") == app.APPAREL_LOGO_ID:
                    rows.append({
                        "x": float(image.get("x", 0.5)),
                        "y": float(image.get("y", 0.5)),
                        "scale": float(image.get("scale", 1.0)),
                        "angle": int(round(float(image.get("angle", 0) or 0))),
                    })
    return rows


def repair_print_areas(print_areas, require_logo=True):
    """Return a copy with only the approved front logo moved to left chest."""
    repaired = copy.deepcopy(print_areas or [])
    found = 0
    changed = 0

    for area in repaired:
        for placeholder in area.get("placeholders", []) or []:
            if placeholder.get("position") != "front":
                continue
            for image in placeholder.get("images", []) or []:
                if image.get("id") != app.APPAREL_LOGO_ID:
                    continue
                found += 1
                old_x = float(image.get("x", 0.5))
                old_y = float(image.get("y", 0.5))
                if abs(old_x - app.LEFT_CHEST_X) > 0.0001 or abs(old_y - app.LEFT_CHEST_Y) > 0.0001:
                    image["x"] = app.LEFT_CHEST_X
                    image["y"] = app.LEFT_CHEST_Y
                    changed += 1
                # Printify requires integer rotation in product payloads. Keep the
                # same visual rotation while normalizing the JSON type.
                image["angle"] = int(round(float(image.get("angle", 0) or 0)))

    if require_logo and not found:
        raise RuntimeError("Approved Storm And Me front logo was not found; refusing repair.")
    return repaired, changed


def expected_titles():
    labels = [
        target["label"]
        for target in jcr.TARGETS
        if target.get("kind") in APPAREL_KINDS
    ]
    titles = []
    for source in app.SOURCES.values():
        for label in labels:
            titles.append(f"{source['base_title']} — {label}")
    if len(titles) != 15 or len(set(titles)) != 15:
        raise RuntimeError(f"Expected exactly 15 unique apparel titles, got {len(set(titles))}.")
    return titles


def exact_product_map(products):
    wanted = set(expected_titles())
    found = {}
    for product in products:
        title = str(product.get("title", "")).strip()
        if title in wanted:
            if title in found:
                raise RuntimeError(f"Duplicate live Printify title: {title}")
            found[title] = product
    missing = sorted(wanted - set(found))
    if missing:
        raise RuntimeError(f"Missing {len(missing)} Jesus & Coffee apparel products: {missing}")
    return found


def selective_publish(product_id):
    """Refresh mockup images only; do not republish variants/title/copy."""
    return jcr.request(
        "POST",
        f"/shops/{jcr.SHOP_ID}/products/{product_id}/publish.json",
        {
            "title": False,
            "description": False,
            "images": True,
            "variants": False,
            "tags": False,
            "keyFeatures": False,
            "shipping_template": False,
        },
    )


def verify_live_product(product_id, before, attempts=18, delay=4):
    last = None
    for _ in range(attempts):
        last = jcr.get_product(product_id)
        if last:
            positions = front_logo_positions(last.get("print_areas", []))
            coords_ok = positions and all(
                abs(row["x"] - app.LEFT_CHEST_X) <= 0.0001
                and abs(row["y"] - app.LEFT_CHEST_Y) <= 0.0001
                for row in positions
            )
            if coords_ok:
                break
        time.sleep(delay)
    if not last:
        raise RuntimeError(f"Could not re-read product {product_id} after repair.")

    after_areas = last.get("print_areas", []) or []
    if artwork_signature(before["print_areas"]) != artwork_signature(after_areas):
        raise RuntimeError(f"Artwork IDs changed for {before['title']}; refusing success.")
    if variant_signature(before["print_areas"]) != variant_signature(after_areas):
        raise RuntimeError(f"Print-area variant coverage changed for {before['title']}; refusing success.")
    if product_variant_signature(before) != product_variant_signature(last):
        raise RuntimeError(f"Product variants/prices changed for {before['title']}; refusing success.")
    if last.get("title") != before.get("title"):
        raise RuntimeError(f"Title changed for {before['title']}; refusing success.")
    if last.get("description") != before.get("description"):
        raise RuntimeError(f"Description changed for {before['title']}; refusing success.")

    positions = front_logo_positions(after_areas)
    if not positions or not all(
        abs(row["x"] - app.LEFT_CHEST_X) <= 0.0001
        and abs(row["y"] - app.LEFT_CHEST_Y) <= 0.0001
        for row in positions
    ):
        raise RuntimeError(f"Left-chest placement did not persist for {before['title']}.")

    front_mockups = [
        image.get("src")
        for image in (last.get("images", []) or [])
        if str(image.get("position", "")).lower() == "front" and image.get("src")
    ]
    return last, positions, front_mockups


def main():
    stubs = jcr.list_products()
    product_map = exact_product_map(stubs)
    results = []

    for title in expected_titles():
        stub = product_map[title]
        product_id = str(stub["id"])
        before = jcr.get_product(product_id)
        if not before:
            raise RuntimeError(f"Could not retrieve live product {product_id} ({title}).")

        before_areas = before.get("print_areas", []) or []
        before_art = artwork_signature(before_areas)
        before_coverage = variant_signature(before_areas)
        before_variants = product_variant_signature(before)
        before_positions = front_logo_positions(before_areas)
        repaired_areas, changed = repair_print_areas(before_areas, require_logo=True)

        if artwork_signature(repaired_areas) != before_art:
            raise RuntimeError(f"Repair would change artwork IDs for {title}; aborted.")
        if variant_signature(repaired_areas) != before_coverage:
            raise RuntimeError(f"Repair would change print-area variant coverage for {title}; aborted.")

        action = "already_correct"
        if changed:
            # Printify supports partial product updates. Supplying only print_areas
            # avoids the all-variants requirement that caused the prior full PUT to fail.
            jcr.request(
                "PUT",
                f"/shops/{jcr.SHOP_ID}/products/{product_id}.json",
                {"print_areas": repaired_areas},
            )
            selective_publish(product_id)
            action = "placement_updated"

        latest, after_positions, front_mockups = verify_live_product(product_id, before)
        if product_variant_signature(latest) != before_variants:
            raise RuntimeError(f"Variant contract drifted after verification for {title}.")

        results.append({
            "title": title,
            "product_id": product_id,
            "action": action,
            "changed_logo_instances": changed,
            "before_logo_positions": before_positions,
            "after_logo_positions": after_positions,
            "artwork_signature_unchanged": artwork_signature(latest.get("print_areas", [])) == before_art,
            "variant_coverage_unchanged": variant_signature(latest.get("print_areas", [])) == before_coverage,
            "product_variants_unchanged": product_variant_signature(latest) == before_variants,
            "visible": latest.get("visible"),
            "front_mockup_count": len(front_mockups),
            "front_mockup": front_mockups[0] if front_mockups else None,
            "verified": True,
        })
        time.sleep(0.7)

    if len(results) != 15 or not all(row["verified"] for row in results):
        raise RuntimeError("Logo repair did not verify exactly 15 apparel products.")
    if not all(row["artwork_signature_unchanged"] for row in results):
        raise RuntimeError("Artwork identity drift detected after repair.")
    if not all(row["variant_coverage_unchanged"] and row["product_variants_unchanged"] for row in results):
        raise RuntimeError("Variant drift detected after repair.")

    report = {
        "mode": "surgical-left-chest-logo-repair",
        "product_count": len(results),
        "logo_artwork_id": app.APPAREL_LOGO_ID,
        "left_chest": {"x": app.LEFT_CHEST_X, "y": app.LEFT_CHEST_Y},
        "phone_cases_touched": False,
        "artwork_generated": False,
        "results": results,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({
        "product_count": len(results),
        "updated": sum(row["action"] == "placement_updated" for row in results),
        "already_correct": sum(row["action"] == "already_correct" for row in results),
        "left_chest": report["left_chest"],
        "report": str(OUT),
    }, indent=2))


if __name__ == "__main__":
    main()

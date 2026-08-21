#!/usr/bin/env python3
import copy
import json
import time
from collections import Counter
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

# Proven Printify catalog targets. Keeping these explicit prevents broad catalog
# scans from burning API rate limits or silently swapping in a different garment.
LOCKED_APPAREL_BLUEPRINT_IDS = {
    "hoodie": 77,       # Gildan 18500 Heavy Blend hoodie
    "long-sleeve": 80,  # Gildan 2400 Ultra Cotton long sleeve
    "fitted-tee": 12,   # Bella+Canvas 3001 retail-fit tee
}
LOCKED_PHONE_BLUEPRINT_IDS = (421,)  # Protective cases: iPhone + Samsung + Pixel
MAX_PRODUCT_VARIANTS = 100
APPAREL_LOGO_ID = next(iter(SOURCES.values()))["front"]
LEFT_CHEST_X = 0.30
LEFT_CHEST_Y = 0.28


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


def choose_usable_target(blueprints, spec):
    errors = []
    for terms in spec["terms"]:
        matches = [
            bp for bp in blueprints
            if all(term in str(bp.get("title", "")).lower() for term in terms)
        ]
        for bp in matches:
            try:
                provider = jcr.choose_provider(int(bp["id"]), spec["kind"])
                return {"spec": spec, "blueprint": bp, "provider": provider}
            except Exception as exc:
                errors.append(f"{bp.get('id')} {bp.get('title')}: {exc}")
    raise RuntimeError(
        f"No usable catalog target for {spec['kind']}. Tried: {' | '.join(errors[-8:])}"
    )


def blueprint_by_id(blueprints, blueprint_id):
    for bp in blueprints:
        try:
            current_id = int(bp.get("id"))
        except (TypeError, ValueError):
            continue
        if current_id == int(blueprint_id):
            return bp
    raise RuntimeError(f"Locked Printify blueprint {blueprint_id} is not available in the catalog.")


def provider_variants_compat(blueprint_id, provider_id):
    """Read Printify variants while supporting variant-level placeholder metadata."""
    result = jcr.request(
        "GET",
        f"/catalog/blueprints/{blueprint_id}/print_providers/{provider_id}/variants.json",
    )
    variants = result.get("variants", []) or []
    placeholders = result.get("placeholders", []) or []
    if placeholders:
        return variants, placeholders

    # Current Printify V1 catalog responses expose printable placeholders on each
    # variant. Collapse them to the unique placeholder shapes expected by the
    # existing product builder.
    unique = []
    seen = set()
    for variant in variants:
        for placeholder in variant.get("placeholders", []) or []:
            key = (
                placeholder.get("position"),
                placeholder.get("decoration_method"),
                placeholder.get("width"),
                placeholder.get("height"),
            )
            if not key[0] or key in seen:
                continue
            seen.add(key)
            unique.append(copy.deepcopy(placeholder))
    return variants, unique


def _apparel_color(variant):
    options = variant.get("options") or {}
    color = str(options.get("color") or "").strip()
    if color:
        return color
    title = str(variant.get("title") or "")
    return title.split(" / ", 1)[0].strip() or "Other"


def _apparel_size_rank(variant):
    options = variant.get("options") or {}
    size = str(options.get("size") or "").strip().lower().replace("xxxl", "3xl").replace("xxl", "2xl")
    rank = {"m": 0, "l": 1, "xl": 2, "s": 3, "2xl": 4, "3xl": 5, "xs": 6, "4xl": 7, "5xl": 8}
    return rank.get(size, 99)


def _color_rank(color):
    low = color.lower()
    priority = [
        "black", "white", "navy", "sand", "heather", "grey", "gray", "charcoal",
        "brown", "maroon", "forest", "military", "natural", "red", "royal", "blue",
        "pink", "purple", "green", "gold", "orange",
    ]
    for index, token in enumerate(priority):
        if token in low:
            return index
    return len(priority)


def limit_variants(variants, kind, max_enabled=MAX_PRODUCT_VARIANTS):
    """Respect Printify's 100-enabled-variant limit without collapsing useful coverage."""
    rows = []
    seen_ids = set()
    for variant in variants:
        variant_id = variant.get("id")
        if variant_id is None or variant_id in seen_ids:
            continue
        seen_ids.add(variant_id)
        rows.append(variant)
    if len(rows) <= max_enabled:
        return rows

    if kind == "phone-case":
        family_order = ["iPhone", "Samsung", "Google Pixel", "Motorola"]
        buckets = {family: [] for family in family_order}
        for variant in rows:
            family = jcr.device_family(variant.get("title", ""))
            if family in buckets:
                buckets[family].append(variant)
        selected = []
        while len(selected) < max_enabled and any(buckets.values()):
            for family in family_order:
                bucket = buckets[family]
                if bucket and len(selected) < max_enabled:
                    selected.append(bucket.pop(0))
        if selected:
            return selected[:max_enabled]
        return rows[:max_enabled]

    buckets = {}
    for variant in rows:
        buckets.setdefault(_apparel_color(variant), []).append(variant)
    ordered_colors = sorted(buckets, key=lambda color: (_color_rank(color), color.lower()))
    selected = []
    for color in ordered_colors:
        bucket = sorted(buckets[color], key=_apparel_size_rank)
        remaining = max_enabled - len(selected)
        if remaining <= 0:
            break
        selected.extend(bucket[:remaining])
    return selected[:max_enabled]


def choose_provider_compat(blueprint_id, kind):
    candidates = []
    errors = []
    for provider in jcr.providers_for(blueprint_id):
        provider_id = int(provider["id"])
        try:
            variants, placeholders = provider_variants_compat(blueprint_id, provider_id)
        except Exception as exc:
            errors.append(str(exc))
            continue
        available = [variant for variant in variants if variant.get("is_available", True)]
        curated = limit_variants(available, kind)
        positions = {row.get("position") for row in placeholders if row.get("position")}
        if not curated or not positions:
            continue
        if kind != "phone-case" and not ({"front", "back"} & positions):
            continue
        families = Counter(jcr.device_family(variant.get("title", "")) for variant in curated)
        supported_family_count = len([
            family for family, count in families.items()
            if family in getattr(jcr, "PHONE_FAMILIES", ()) and count > 0
        ])
        candidates.append({
            "provider_id": provider_id,
            "provider_title": provider.get("title"),
            "variants": curated,
            "placeholders": placeholders,
            "families": dict(families),
            "score": len(curated) + (20 if "front" in positions else 0) + (50 * supported_family_count if kind == "phone-case" else 0),
        })
    if not candidates:
        detail = "; ".join(errors[-3:]) if errors else "providers returned no printable variants"
        raise RuntimeError(f"No usable provider for blueprint {blueprint_id}: {detail}")
    candidates.sort(key=lambda row: row["score"], reverse=True)
    return candidates[0]


def fit_images_compat(images, kind):
    """Preserve apparel placement, keep cases centered, and satisfy Printify integer angles."""
    fitted = []
    for image in images:
        row = copy.deepcopy(image)
        if kind == "phone-case":
            row["x"] = 0.5
            row["y"] = 0.5
        else:
            source_x = 0.5 if row.get("x") is None else float(row.get("x"))
            source_y = 0.5 if row.get("y") is None else float(row.get("y"))
            # The shared brand mark belongs on the left chest. Preserve any valid
            # source placement, but never allow a centered source/default to move
            # this logo back into the middle of the garment.
            if row.get("id") == APPAREL_LOGO_ID and abs(source_x - 0.5) < 0.0001 and abs(source_y - 0.5) < 0.0001:
                row["x"] = LEFT_CHEST_X
                row["y"] = LEFT_CHEST_Y
            else:
                row["x"] = source_x
                row["y"] = source_y
        row["angle"] = int(round(float(row.get("angle", 0) or 0)))
        current = float(row.get("scale", 0.85) or 0.85)
        row["scale"] = min(current, 0.72 if kind == "phone-case" else 0.86)
        fitted.append(row)
    return fitted


def safe_preflight(blueprints):
    apparel = []
    for spec in jcr.TARGETS:
        kind = spec["kind"]
        blueprint_id = LOCKED_APPAREL_BLUEPRINT_IDS.get(kind)
        if not blueprint_id:
            raise RuntimeError(f"No locked Printify blueprint configured for {kind}.")
        bp = blueprint_by_id(blueprints, blueprint_id)
        provider = choose_provider_compat(blueprint_id, kind)
        apparel.append({"spec": spec, "blueprint": bp, "provider": provider})

    phone = []
    for blueprint_id in LOCKED_PHONE_BLUEPRINT_IDS:
        bp = blueprint_by_id(blueprints, blueprint_id)
        provider = choose_provider_compat(blueprint_id, "phone-case")
        family_counts = provider.get("families") or {}
        covered = {
            family
            for family, count in family_counts.items()
            if family in jcr.PHONE_FAMILIES and count > 0
        }
        if not covered:
            raise RuntimeError(
                f"Locked phone-case blueprint {blueprint_id} has no supported phone families."
            )
        phone.append({"blueprint": bp, "provider": provider, "covered": covered})

    return {"apparel": apparel, "phone": phone}


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
    # Collection-scoped compatibility shim: the shared helper historically emitted
    # float angles (0.0), while Printify's create-product endpoint requires integers.
    jcr.fit_images = fit_images_compat

    sources = source_rows()
    blueprints = jcr.catalog_blueprints()
    preflight = safe_preflight(blueprints)

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
        "apparel_preflight": [
            {
                "kind": row["spec"]["kind"],
                "blueprint_id": row["blueprint"].get("id"),
                "blueprint_title": row["blueprint"].get("title"),
                "provider_id": row["provider"].get("provider_id"),
                "provider_title": row["provider"].get("provider_title"),
                "variant_count": len(row["provider"].get("variants", [])),
            }
            for row in preflight["apparel"]
        ],
        "phone_preflight": [
            {
                "blueprint_id": row["blueprint"].get("id"),
                "blueprint_title": row["blueprint"].get("title"),
                "provider_id": row["provider"].get("provider_id"),
                "provider_title": row["provider"].get("provider_title"),
                "device_families": sorted(row["covered"]),
                "variant_count": len(row["provider"].get("variants", [])),
            }
            for row in preflight["phone"]
        ],
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

#!/usr/bin/env python3
"""Inspect and safely expand existing Jesus & Coffee Printify shirts.

Safety goals:
- Reuse the exact existing Printify artwork IDs. This script never generates replacement art.
- Inspect first; apply only with explicit source product IDs.
- Preflight every catalog target before creating or updating products.
- Require non-iPhone phone-case coverage when phone cases are requested.
- Patch the homepage with text/CTA only; no invented product imagery.
"""

from __future__ import annotations

import copy
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

API = "https://api.printify.com/v1"
TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "").strip()
SHOP_ID = os.environ.get("PRINTIFY_SHOP_ID", "").strip() or "28312107"
MODE = os.environ.get("ROLLOUT_MODE", "inspect").strip().lower()
SOURCE_PRODUCT_IDS = [
    value.strip()
    for value in os.environ.get("JESUS_COFFEE_SOURCE_PRODUCT_IDS", "").split(",")
    if value.strip()
]
OUT = Path("automation-output")
OUT.mkdir(parents=True, exist_ok=True)
INSPECTION_REPORT = OUT / "jesus-coffee-source-inspection.json"
ROLLOUT_REPORT = OUT / "jesus-coffee-rollout.json"
HOME_PATH = Path("frontend/src/pages/Home.js")

DARK_TOKENS = (
    "black", "pepper", "charcoal", "navy", "dark", "espresso", "chocolate",
    "maroon", "forest", "brown", "berry", "heather black",
)
LIGHT_TOKENS = (
    "white", "cream", "ivory", "natural", "sand", "blossom", "pink", "salmon",
    "ash", "light", "mint", "sky", "yellow", "butter", "grey", "gray",
)

TARGETS = [
    {
        "kind": "hoodie",
        "label": "Heavyweight Hoodie",
        "price": 5499,
        "terms": [
            ["unisex", "heavy", "hoodie"],
            ["heavy", "blend", "hooded", "sweatshirt"],
            ["unisex", "hooded", "sweatshirt"],
            ["hoodie"],
        ],
    },
    {
        "kind": "long-sleeve",
        "label": "Long Sleeve Tee",
        "price": 3699,
        "terms": [
            ["unisex", "jersey", "long", "sleeve", "tee"],
            ["unisex", "long", "sleeve", "tee"],
            ["long", "sleeve", "t-shirt"],
            ["long", "sleeve"],
        ],
    },
    {
        "kind": "fitted-tee",
        "label": "Retail Fit Tee",
        "price": 3299,
        "terms": [
            ["unisex", "jersey", "short", "sleeve", "tee"],
            ["unisex", "jersey", "tee"],
            ["retail", "fit", "tee"],
            ["fitted", "tee"],
            ["slim", "fit", "tee"],
        ],
    },
]

PHONE_FAMILIES = ("Samsung", "Google Pixel", "Motorola", "iPhone")


def request(method: str, path: str, payload: Any | None = None, allow_404: bool = False) -> Any:
    if not TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "StormAndMe-JesusCoffee/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        if allow_404 and exc.code == 404:
            return None
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Printify API {exc.code} on {path}: {detail[:1200]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Printify network error on {path}: {exc.reason}") from exc


def text_blob(product: dict[str, Any]) -> str:
    tags = product.get("tags") or []
    if isinstance(tags, str):
        tags = [tags]
    return " ".join(
        [
            str(product.get("title", "")),
            str(product.get("description", "")),
            " ".join(str(tag) for tag in tags),
        ]
    ).lower()


def keyword_score(product: dict[str, Any]) -> int:
    blob = text_blob(product)
    score = 0
    if "coffee" in blob:
        score += 100
    if "jesus" in blob:
        score += 25
    if "faith" in blob:
        score += 5
    if "caffeine" in blob:
        score += 10
    return score


def strip_garment_suffix(title: str) -> str:
    value = re.sub(r"\s+", " ", str(title)).strip()
    patterns = [
        r"\s+[—-]\s+comfort colors(?:®)?(?:\s*1717)?\s+tee$",
        r"\s+[—-]\s+(?:classic\s+)?(?:unisex\s+)?t-?shirt$",
        r"\s+[—-]\s+(?:classic\s+)?tee$",
        r"\s+(?:t-?shirt|tee)$",
    ]
    for pattern in patterns:
        value = re.sub(pattern, "", value, flags=re.I).strip()
    return value


def build_target_title(source_title: str, label: str) -> str:
    return f"{strip_garment_suffix(source_title)} — {label}"


def device_family(title: str) -> str:
    lower = str(title).lower()
    if "samsung" in lower or "galaxy" in lower:
        return "Samsung"
    if "google pixel" in lower or re.search(r"\bpixel\s+\d", lower):
        return "Google Pixel"
    if "motorola" in lower or "moto " in lower or "razr" in lower:
        return "Motorola"
    if "iphone" in lower:
        return "iPhone"
    return "Other"


def color_bucket(title: str) -> str:
    lower = str(title).lower()
    if any(token in lower for token in DARK_TOKENS):
        return "dark"
    if any(token in lower for token in LIGHT_TOKENS):
        return "light"
    return "neutral"


def is_reasonable_apparel_variant(title: str) -> bool:
    lower = str(title).lower()
    return not any(token in lower for token in ("5xl", "6xl", "5x ", "6x "))


def list_products() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    page = 1
    while True:
        result = request("GET", f"/shops/{SHOP_ID}/products.json?limit=50&page={page}")
        batch = result.get("data", []) if isinstance(result, dict) else []
        items.extend(batch)
        last_page = int(result.get("last_page", page)) if isinstance(result, dict) else page
        if not batch or page >= last_page:
            break
        page += 1
    return items


def get_product(product_id: str) -> dict[str, Any] | None:
    return request("GET", f"/shops/{SHOP_ID}/products/{product_id}.json", allow_404=True)


def get_upload(image_id: str) -> dict[str, Any] | None:
    if not image_id:
        return None
    return request("GET", f"/uploads/{image_id}.json", allow_404=True)


def image_ids(product: dict[str, Any]) -> list[str]:
    ids: list[str] = []
    for area in product.get("print_areas", []) or []:
        for placeholder in area.get("placeholders", []) or []:
            for image in placeholder.get("images", []) or []:
                image_id = str(image.get("id", "")).strip()
                if image_id and image_id not in ids:
                    ids.append(image_id)
    return ids


def safe_upload_summary(upload: dict[str, Any] | None) -> dict[str, Any]:
    if not upload:
        return {}
    return {
        "id": upload.get("id"),
        "file_name": upload.get("file_name"),
        "width": upload.get("width"),
        "height": upload.get("height"),
        "size": upload.get("size"),
        "preview_url": upload.get("preview_url"),
        "upload_time": upload.get("upload_time"),
    }


def summarize_product(product: dict[str, Any], include_uploads: bool = True) -> dict[str, Any]:
    variants = product.get("variants", []) or []
    mockups = [
        {
            "src": image.get("src"),
            "position": image.get("position"),
            "variant_ids": image.get("variant_ids"),
        }
        for image in (product.get("images", []) or [])
        if image.get("src")
    ][:8]
    uploads = []
    if include_uploads:
        for image_id in image_ids(product):
            try:
                uploads.append(safe_upload_summary(get_upload(image_id)))
            except Exception as exc:
                uploads.append({"id": image_id, "error": str(exc)})
    return {
        "id": product.get("id"),
        "title": product.get("title"),
        "description": product.get("description"),
        "tags": product.get("tags"),
        "visible": product.get("visible"),
        "is_locked": product.get("is_locked"),
        "created_at": product.get("created_at"),
        "updated_at": product.get("updated_at"),
        "blueprint_id": product.get("blueprint_id"),
        "print_provider_id": product.get("print_provider_id"),
        "keyword_score": keyword_score(product),
        "variant_count": len(variants),
        "enabled_variants": [
            {"id": v.get("id"), "title": v.get("title"), "price": v.get("price")}
            for v in variants
            if v.get("is_enabled")
        ][:120],
        "print_areas": product.get("print_areas"),
        "mockups": mockups,
        "uploads": uploads,
    }


def parse_dt(value: Any) -> datetime:
    text = str(value or "")
    if not text:
        return datetime(1970, 1, 1, tzinfo=timezone.utc)
    text = text.replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(text)
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return datetime(1970, 1, 1, tzinfo=timezone.utc)


def inspect_sources() -> dict[str, Any]:
    stubs = list_products()
    ranked = sorted(stubs, key=lambda p: parse_dt(p.get("updated_at")), reverse=True)
    candidate_ids = {
        str(p.get("id"))
        for p in stubs
        if keyword_score(p) > 0 and p.get("id")
    }
    candidate_ids.update(str(p.get("id")) for p in ranked[:25] if p.get("id"))

    details = []
    for product_id in candidate_ids:
        detail = get_product(product_id)
        if detail:
            details.append(summarize_product(detail, include_uploads=True))
            time.sleep(0.1)

    details.sort(
        key=lambda p: (p.get("keyword_score", 0), parse_dt(p.get("updated_at"))),
        reverse=True,
    )
    keyword_candidates = [p for p in details if p.get("keyword_score", 0) > 0]
    recent_candidates = sorted(details, key=lambda p: parse_dt(p.get("updated_at")), reverse=True)[:25]
    report = {
        "mode": "read-only",
        "shop_id": SHOP_ID,
        "inspected_at": datetime.now(timezone.utc).isoformat(),
        "total_products": len(stubs),
        "keyword_candidates": keyword_candidates,
        "recent_candidates": recent_candidates,
        "safety": "No products created, updated, deleted, or published.",
    }
    INSPECTION_REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def catalog_blueprints() -> list[dict[str, Any]]:
    result = request("GET", "/catalog/blueprints.json")
    if isinstance(result, list):
        return result
    if isinstance(result, dict):
        return result.get("data", result.get("blueprints", []))
    return []


def choose_blueprint(blueprints: list[dict[str, Any]], term_sets: list[list[str]]) -> dict[str, Any]:
    for terms in term_sets:
        matches = []
        for bp in blueprints:
            title = str(bp.get("title", "")).lower()
            if all(term in title for term in terms):
                matches.append(bp)
        if matches:
            matches.sort(key=lambda bp: (len(str(bp.get("title", ""))), int(bp.get("id", 0))))
            return matches[0]
    raise RuntimeError(f"No catalog blueprint matched {term_sets}")


def provider_variants(blueprint_id: int, provider_id: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    result = request(
        "GET",
        f"/catalog/blueprints/{blueprint_id}/print_providers/{provider_id}/variants.json",
    )
    return result.get("variants", []) or [], result.get("placeholders", []) or []


def providers_for(blueprint_id: int) -> list[dict[str, Any]]:
    result = request("GET", f"/catalog/blueprints/{blueprint_id}/print_providers.json")
    if isinstance(result, list):
        return result
    if isinstance(result, dict):
        return result.get("data", result.get("print_providers", []))
    return []


def choose_provider(blueprint_id: int, kind: str) -> dict[str, Any]:
    candidates = []
    errors = []
    for provider in providers_for(blueprint_id):
        provider_id = int(provider["id"])
        try:
            variants, placeholders = provider_variants(blueprint_id, provider_id)
        except Exception as exc:
            errors.append(str(exc))
            continue
        available = [v for v in variants if v.get("is_available", True)]
        positions = {p.get("position") for p in placeholders if p.get("position")}
        if not available or not positions:
            continue
        if kind != "phone-case" and not ({"front", "back"} & positions):
            continue
        families = Counter(device_family(v.get("title", "")) for v in available)
        candidates.append(
            {
                "provider_id": provider_id,
                "provider_title": provider.get("title"),
                "variants": available,
                "placeholders": placeholders,
                "families": dict(families),
                "score": len(available) + (20 if "front" in positions else 0),
            }
        )
    if not candidates:
        raise RuntimeError(f"No usable provider for blueprint {blueprint_id}: {'; '.join(errors[-3:])}")
    candidates.sort(key=lambda row: row["score"], reverse=True)
    return candidates[0]


def phone_case_blueprints(blueprints: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cases = []
    for bp in blueprints:
        title = str(bp.get("title", "")).lower()
        if "case" not in title:
            continue
        if not any(term in title for term in ("phone", "iphone", "samsung", "pixel", "galaxy", "snap", "tough", "clear")):
            continue
        cases.append(bp)
    return cases


def discover_phone_targets(blueprints: list[dict[str, Any]]) -> list[dict[str, Any]]:
    options = []
    for bp in phone_case_blueprints(blueprints):
        try:
            chosen = choose_provider(int(bp["id"]), "phone-case")
        except Exception:
            continue
        family_counts = chosen["families"]
        covered = {f for f, count in family_counts.items() if f in PHONE_FAMILIES and count > 0}
        if not covered:
            continue
        options.append(
            {
                "blueprint": bp,
                "provider": chosen,
                "covered": covered,
                "score": len(covered) * 1000 + sum(family_counts.get(f, 0) for f in covered),
            }
        )
    options.sort(key=lambda row: row["score"], reverse=True)

    selected = []
    covered: set[str] = set()
    for option in options:
        new_families = option["covered"] - covered
        if not selected or new_families:
            selected.append(option)
            covered.update(option["covered"])
        if {"iPhone", "Samsung", "Google Pixel"} <= covered:
            break
        if len(selected) >= 4:
            break
    non_iphone = covered - {"iPhone"}
    if not non_iphone:
        raise RuntimeError(
            "Phone-case preflight found only iPhone coverage. Refusing to publish cases because "
            "the requested collection must include non-iPhone devices too."
        )
    return selected


def design_signature(area: dict[str, Any]) -> tuple:
    placeholders = []
    for placeholder in area.get("placeholders", []) or []:
        images = []
        for image in placeholder.get("images", []) or []:
            images.append(
                (
                    image.get("id"),
                    round(float(image.get("x", 0.5)), 4),
                    round(float(image.get("y", 0.5)), 4),
                    round(float(image.get("scale", 1.0)), 4),
                    round(float(image.get("angle", 0)), 2),
                )
            )
        placeholders.append((placeholder.get("position"), tuple(images)))
    return tuple(placeholders)


def source_design_groups(source: dict[str, Any]) -> list[dict[str, Any]]:
    variant_titles = {int(v["id"]): str(v.get("title", "")) for v in source.get("variants", []) if v.get("id")}
    grouped: dict[tuple, dict[str, Any]] = {}
    for area in source.get("print_areas", []) or []:
        sig = design_signature(area)
        if sig not in grouped:
            grouped[sig] = {
                "area": copy.deepcopy(area),
                "variant_ids": [],
                "buckets": Counter(),
            }
        ids = [int(v) for v in (area.get("variant_ids", []) or [])]
        grouped[sig]["variant_ids"].extend(ids)
        for variant_id in ids:
            grouped[sig]["buckets"][color_bucket(variant_titles.get(variant_id, ""))] += 1
    groups = list(grouped.values())
    groups.sort(key=lambda row: len(set(row["variant_ids"])), reverse=True)
    if not groups:
        raise RuntimeError(f"Source product {source.get('id')} has no print areas")
    return groups


def pick_group(groups: list[dict[str, Any]], bucket: str) -> dict[str, Any]:
    ranked = sorted(
        groups,
        key=lambda row: (row["buckets"].get(bucket, 0), len(set(row["variant_ids"]))),
        reverse=True,
    )
    if ranked and ranked[0]["buckets"].get(bucket, 0) > 0:
        return ranked[0]
    return groups[0]


def source_images_for_position(group: dict[str, Any], position: str) -> list[dict[str, Any]]:
    for placeholder in group["area"].get("placeholders", []) or []:
        if placeholder.get("position") == position:
            return copy.deepcopy(placeholder.get("images", []) or [])
    return []


def fit_images(images: list[dict[str, Any]], kind: str) -> list[dict[str, Any]]:
    fitted = []
    for image in images:
        row = copy.deepcopy(image)
        row["x"] = 0.5
        row["y"] = 0.5
        row["angle"] = float(row.get("angle", 0) or 0)
        current = float(row.get("scale", 0.85) or 0.85)
        row["scale"] = min(current, 0.72 if kind == "phone-case" else 0.86)
        fitted.append(row)
    return fitted


def build_print_areas_for_target(
    source: dict[str, Any],
    target_variants: list[dict[str, Any]],
    target_placeholders: list[dict[str, Any]],
    kind: str,
) -> list[dict[str, Any]]:
    groups = source_design_groups(source)
    positions = [p.get("position") for p in target_placeholders if p.get("position")]
    if not positions:
        raise RuntimeError("Target catalog product has no printable placeholders")
    if kind == "phone-case":
        position = "front" if "front" in positions else positions[0]
        group = groups[0]
        source_images = source_images_for_position(group, "front") or source_images_for_position(group, "back")
        if not source_images:
            raise RuntimeError(f"Source {source.get('title')} has no reusable artwork images")
        return [
            {
                "variant_ids": [int(v["id"]) for v in target_variants],
                "placeholders": [{"position": position, "images": fit_images(source_images, kind)}],
            }
        ]

    buckets: dict[str, list[int]] = defaultdict(list)
    for variant in target_variants:
        buckets[color_bucket(variant.get("title", ""))].append(int(variant["id"]))

    print_areas = []
    for bucket, ids in buckets.items():
        if not ids:
            continue
        group = pick_group(groups, bucket)
        placeholders = []
        for position in ("front", "back"):
            if position not in positions:
                continue
            imgs = source_images_for_position(group, position)
            if imgs:
                placeholders.append({"position": position, "images": fit_images(imgs, kind)})
        if not placeholders:
            fallback = source_images_for_position(group, "front") or source_images_for_position(group, "back")
            if fallback:
                preferred = "front" if "front" in positions else positions[0]
                placeholders.append({"position": preferred, "images": fit_images(fallback, kind)})
        if not placeholders:
            raise RuntimeError(f"Source {source.get('title')} has no reusable artwork for {bucket} variants")
        print_areas.append({"variant_ids": ids, "placeholders": placeholders})
    return print_areas


def exact_product_by_title(products: Iterable[dict[str, Any]], title: str) -> dict[str, Any] | None:
    wanted = title.strip().lower()
    for product in products:
        if str(product.get("title", "")).strip().lower() == wanted:
            return product
    return None


def description_for(source: dict[str, Any], label: str) -> str:
    base = str(source.get("description") or "").strip()
    base = re.sub(r"\s+", " ", base)
    if not base:
        base = (
            "A faith-forward Jesus & Coffee design made for mornings fueled by grace, "
            "gratitude, and a good cup of coffee."
        )
    return (
        f"{base} This {label.lower()} uses the exact artwork from the original Jesus & Coffee shirt "
        "so the collection stays consistent across every product."
    )


def create_or_update_product(
    existing_products: list[dict[str, Any]],
    source: dict[str, Any],
    blueprint: dict[str, Any],
    provider: dict[str, Any],
    kind: str,
    label: str,
    price: int,
    variants: list[dict[str, Any]],
    placeholders: list[dict[str, Any]],
) -> dict[str, Any]:
    if kind != "phone-case":
        selected_variants = [v for v in variants if v.get("is_available", True) and is_reasonable_apparel_variant(v.get("title", ""))]
    else:
        selected_variants = [v for v in variants if v.get("is_available", True)]
    if not selected_variants:
        raise RuntimeError(f"No available variants for {label}")

    title = build_target_title(source.get("title", "Jesus & Coffee"), label)
    print_areas = build_print_areas_for_target(source, selected_variants, placeholders, kind)
    source_tags = source.get("tags") or []
    if isinstance(source_tags, str):
        source_tags = [source_tags]
    payload = {
        "title": title,
        "description": description_for(source, label),
        "tags": list(dict.fromkeys([
            *source_tags,
            "Jesus & Coffee",
            "Storm And Me",
            "faith",
            "coffee",
            kind,
        ])),
        "blueprint_id": int(blueprint["id"]),
        "print_provider_id": int(provider["provider_id"]),
        "variants": [
            {
                "id": int(v["id"]),
                "price": int(price),
                "is_enabled": True,
                "is_default": idx == 0,
            }
            for idx, v in enumerate(selected_variants)
        ],
        "print_areas": print_areas,
    }
    existing = exact_product_by_title(existing_products, title)
    if existing:
        existing_detail = get_product(str(existing["id"]))
        if (
            existing_detail
            and int(existing_detail.get("blueprint_id", -1)) == int(blueprint["id"])
            and int(existing_detail.get("print_provider_id", -1)) == int(provider["provider_id"])
        ):
            request("PUT", f"/shops/{SHOP_ID}/products/{existing['id']}.json", payload)
            product_id = str(existing["id"])
            action = "updated"
        else:
            return {
                "title": title,
                "status": "skipped_title_conflict",
                "existing_id": existing.get("id"),
                "reason": "Existing title uses a different blueprint/provider; not overwritten.",
            }
    else:
        created = request("POST", f"/shops/{SHOP_ID}/products.json", payload)
        product_id = str(created["id"])
        action = "created"
        existing_products.append({"id": product_id, "title": title})

    request(
        "POST",
        f"/shops/{SHOP_ID}/products/{product_id}/publish.json",
        {
            "title": True,
            "description": True,
            "images": True,
            "variants": True,
            "tags": True,
            "keyFeatures": True,
            "shipping_template": True,
        },
    )
    return {
        "title": title,
        "product_id": product_id,
        "status": f"{action}_publish_requested",
        "blueprint_id": int(blueprint["id"]),
        "blueprint_title": blueprint.get("title"),
        "provider_id": int(provider["provider_id"]),
        "provider_title": provider.get("provider_title"),
        "variant_count": len(selected_variants),
        "device_families": sorted(
            {device_family(v.get("title", "")) for v in selected_variants if device_family(v.get("title", "")) != "Other"}
        ),
    }


def poll_product(product_id: str, attempts: int = 24) -> dict[str, Any]:
    last = {}
    for _ in range(attempts):
        last = get_product(product_id) or {}
        images = [img for img in last.get("images", []) or [] if img.get("src")]
        if images and last.get("visible") is True:
            return last
        time.sleep(5)
    return last


def preflight_targets(blueprints: list[dict[str, Any]]) -> dict[str, Any]:
    apparel = []
    for spec in TARGETS:
        bp = choose_blueprint(blueprints, spec["terms"])
        provider = choose_provider(int(bp["id"]), spec["kind"])
        apparel.append({"spec": spec, "blueprint": bp, "provider": provider})
    phone = discover_phone_targets(blueprints)
    return {"apparel": apparel, "phone": phone}


def patch_home_text(text: str) -> str:
    marker = 'data-testid="jesus-coffee-featured-section"'
    if marker in text:
        return text
    anchor = '      {/* MERCH */}\n      <section className="relative py-16 sm:py-20" data-testid="home-merch-section">'
    if anchor in text:
        indent = "      "
    else:
        anchor = '{/* MERCH */}\n<section className="relative py-16 sm:py-20" data-testid="home-merch-section">'
        indent = ""
    if anchor not in text:
        raise RuntimeError("Could not find the homepage merch anchor; refusing blind patch.")

    section = f'''{indent}{{/* JESUS & COFFEE FEATURE */}}
{indent}<section className="relative py-14 sm:py-18" data-testid="jesus-coffee-featured-section">
{indent}  <div className="max-w-6xl mx-auto px-6">
{indent}    <Reveal>
{indent}      <div className="relative overflow-hidden rounded-3xl border border-storm-gold/25 bg-[radial-gradient(circle_at_15%_10%,rgba(215,180,97,0.16),transparent_34%),linear-gradient(135deg,rgba(37,28,20,0.88),rgba(10,10,12,0.96))] px-7 py-10 sm:px-12 sm:py-14 text-center shadow-2xl">
{indent}        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.05),transparent)]" />
{indent}        <div className="relative">
{indent}          <Overline className="mb-4">Featured Faith Collection</Overline>
{indent}          <h2 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight">Jesus &amp; Coffee Collection</h2>
{indent}          <p className="mt-4 font-display italic text-xl sm:text-2xl text-storm-gold">Faith for the soul. Coffee for the morning.</p>
{indent}          <p className="mx-auto mt-5 max-w-2xl text-storm-silver/75 leading-relaxed font-light">
{indent}            The same Jesus &amp; Coffee artwork you love, now expanding across tees, long sleeves, hoodies, and phone cases—kept consistent with the original designs.
{indent}          </p>
{indent}          <div className="mt-8 flex justify-center">
{indent}            <GlowButton href={{BRAND.shop}} variant="gold" data-testid="home-shop-jesus-coffee">
{indent}              Shop Jesus &amp; Coffee <ArrowRight className="w-4 h-4" />
{indent}            </GlowButton>
{indent}          </div>
{indent}        </div>
{indent}      </div>
{indent}    </Reveal>
{indent}</section>

'''
    return text.replace(anchor, section + anchor, 1)


def patch_homepage() -> bool:
    if not HOME_PATH.exists():
        raise RuntimeError(f"Homepage not found: {HOME_PATH}")
    original = HOME_PATH.read_text(encoding="utf-8")
    patched = patch_home_text(original)
    if patched == original:
        return False
    HOME_PATH.write_text(patched, encoding="utf-8")
    return True


def apply_rollout() -> dict[str, Any]:
    if not SOURCE_PRODUCT_IDS:
        raise RuntimeError(
            "Apply mode requires JESUS_COFFEE_SOURCE_PRODUCT_IDS. "
            "Inspect first and use exact product IDs; no guessing."
        )
    sources = []
    for product_id in SOURCE_PRODUCT_IDS:
        product = get_product(product_id)
        if not product:
            raise RuntimeError(f"Source product does not exist: {product_id}")
        if not image_ids(product):
            raise RuntimeError(f"Source product has no reusable Printify artwork: {product_id}")
        sources.append(product)

    blueprints = catalog_blueprints()
    preflight = preflight_targets(blueprints)
    phone_families = set()
    for row in preflight["phone"]:
        phone_families.update(row["covered"])
    if not (phone_families - {"iPhone"}):
        raise RuntimeError("Preflight failed: no non-iPhone phone case support found.")

    existing = list_products()
    results = []
    for source in sources:
        for row in preflight["apparel"]:
            result = create_or_update_product(
                existing,
                source,
                row["blueprint"],
                row["provider"],
                row["spec"]["kind"],
                row["spec"]["label"],
                row["spec"]["price"],
                row["provider"]["variants"],
                row["provider"]["placeholders"],
            )
            results.append(result)
            time.sleep(0.6)

        for phone_row in preflight["phone"]:
            bp = phone_row["blueprint"]
            provider = phone_row["provider"]
            families = sorted(phone_row["covered"])
            label = "Phone Case"
            if len(preflight["phone"]) > 1:
                label = f"Phone Case ({' / '.join(families)})"
            result = create_or_update_product(
                existing,
                source,
                bp,
                provider,
                "phone-case",
                label,
                2799,
                provider["variants"],
                provider["placeholders"],
            )
            results.append(result)
            time.sleep(0.6)

    verification = []
    for row in results:
        product_id = row.get("product_id")
        if not product_id:
            verification.append({
                "title": row.get("title"),
                "status": row.get("status"),
                "verified": row.get("status") == "skipped_title_conflict",
            })
            continue
        product = poll_product(product_id)
        mockups = [img.get("src") for img in product.get("images", []) or [] if img.get("src")]
        verification.append(
            {
                "title": row.get("title"),
                "product_id": product_id,
                "visible": product.get("visible"),
                "mockup_count": len(mockups),
                "verified": product.get("visible") is True and bool(mockups),
            }
        )

    failed = [row for row in verification if not row.get("verified")]
    home_changed = patch_homepage()
    report = {
        "mode": "apply",
        "shop_id": SHOP_ID,
        "source_products": [
            {"id": p.get("id"), "title": p.get("title"), "artwork_ids": image_ids(p)}
            for p in sources
        ],
        "preflight": {
            "apparel": [
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
            "phone": [
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
        },
        "results": results,
        "verification": verification,
        "homepage_feature_changed": home_changed,
        "no_generated_art": True,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    ROLLOUT_REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    if failed:
        raise RuntimeError(f"{len(failed)} rollout products did not verify live/mockup-ready.")
    return report


def main() -> int:
    if MODE == "inspect":
        report = inspect_sources()
        print(json.dumps({
            "mode": report["mode"],
            "total_products": report["total_products"],
            "keyword_candidate_count": len(report["keyword_candidates"]),
            "recent_candidate_count": len(report["recent_candidates"]),
            "report": str(INSPECTION_REPORT),
        }, indent=2))
        return 0
    if MODE == "apply":
        report = apply_rollout()
        print(json.dumps({
            "mode": report["mode"],
            "source_count": len(report["source_products"]),
            "product_results": len(report["results"]),
            "homepage_feature_changed": report["homepage_feature_changed"],
            "report": str(ROLLOUT_REPORT),
        }, indent=2))
        return 0
    raise RuntimeError(f"Unknown ROLLOUT_MODE: {MODE}")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)

#!/usr/bin/env python3
import json
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import broken_pieces_core as core
from broken_pieces_premium_art import build_art

DATA = ROOT / "frontend" / "src" / "data" / "broken-pieces-products.generated.json"
OUT = ROOT / "automation-output"
OUT.mkdir(exist_ok=True)
REVISION_TAG = "premium-art-v2"
LEGACY_BAD_IDS = {
    "cracked-heart": "6a8748a22ca30d29770c609d",
    "kintsugi-heart": "6a8748b22ba83235c9030589",
    "broken-cross": "6a8748c3affe644160009855",
    "streetwear": "6a8748d42ca30d29770c60cf",
    "puzzle-piece": "6a8748e6cc388d717f01e40d",
}


def full_product(product_id):
    return core.request("GET", f"/shops/{core.SHOP_ID}/products/{product_id}.json", allow_404=True)


def product_ready(product):
    if not product or product.get("visible") is not True:
        return False
    if not any(img.get("src") for img in product.get("images", [])):
        return False
    ext = product.get("external") or {}
    if not (ext.get("id") or ext.get("handle")):
        return False
    return bool([v for v in product.get("variants", []) if v.get("is_enabled")])


def find_existing_replacement(spec):
    legacy_id = LEGACY_BAD_IDS[spec["slug"]]
    matches = []
    for row in core.list_products():
        if row.get("id") == legacy_id:
            continue
        if row.get("title", "").strip().lower() != spec["title"].strip().lower():
            continue
        full = full_product(row["id"])
        if not full:
            continue
        tags = {str(t).lower() for t in full.get("tags", [])}
        if REVISION_TAG in tags:
            matches.append(full)
    ready = [p for p in matches if product_ready(p)]
    if ready:
        keeper = ready[0]
        for extra in matches[1:]:
            if extra.get("id") != keeper.get("id"):
                core.request("DELETE", f"/shops/{core.SHOP_ID}/products/{extra['id']}.json")
        return keeper
    for stale in matches:
        core.request("DELETE", f"/shops/{core.SHOP_ID}/products/{stale['id']}.json")
    return None


def create_replacement(source, spec):
    existing = find_existing_replacement(spec)
    if existing:
        return existing, "reused"

    front, back = build_art(spec)
    if front.getbbox() is None or back.getbbox() is None:
        raise RuntimeError(f"Premium artwork rendered empty for {spec['slug']}")

    art_dir = OUT / "broken-pieces-premium-art"
    art_dir.mkdir(parents=True, exist_ok=True)
    front_path = art_dir / f"{spec['slug']}-front.png"
    back_path = art_dir / f"{spec['slug']}-back.png"
    front.save(front_path, "PNG", optimize=True)
    back.save(back_path, "PNG", optimize=True)

    front_id = core.upload(f"broken-pieces-{spec['slug']}-premium-v2-front.png", core.to_png_bytes(front))
    back_id = core.upload(f"broken-pieces-{spec['slug']}-premium-v2-back.png", core.to_png_bytes(back))
    payload = core.product_payload(source, spec, front_id, back_id)
    payload["tags"] = list(dict.fromkeys(payload.get("tags", []) + [REVISION_TAG]))
    payload["description"] = payload.get("description", "") + " Premium textured artwork revision."

    created = core.request("POST", f"/shops/{core.SHOP_ID}/products.json", payload)
    product_id = created["id"]
    core.request(
        "POST",
        f"/shops/{core.SHOP_ID}/products/{product_id}/publish.json",
        {"title": True, "description": True, "images": True, "variants": True, "tags": True, "keyFeatures": True},
    )
    product = core.poll_product(product_id, attempts=42)
    if not product_ready(product):
        raise RuntimeError(f"Replacement did not become storefront-ready: {spec['slug']} / {product_id}")
    return product, "created"


def site_record(spec, product):
    enabled = [v for v in product.get("variants", []) if v.get("is_enabled")]
    prices = [int(v.get("price", 0)) for v in enabled if int(v.get("price", 0)) > 0]
    price_cents = min(prices) if prices else 3399
    image_url = core.front_mockup(product)
    url = core.storefront_url(product)
    if not image_url or not url:
        raise RuntimeError(f"Missing verified mockup/storefront URL for {spec['slug']}")
    return {
        "id": f"broken-pieces-{spec['slug']}",
        "printify_product_id": product["id"],
        "title": spec["title"],
        "label": spec["label"],
        "price_cents": price_cents,
        "price": f"${price_cents / 100:.2f}",
        "image": image_url,
        "url": url,
        "description": spec["description"],
        "visible": True,
    }


def already_migrated():
    if not DATA.exists():
        return False
    try:
        data = json.loads(DATA.read_text(encoding="utf-8"))
    except Exception:
        return False
    products = data.get("products", [])
    if len(products) != 5:
        return False
    legacy = set(LEGACY_BAD_IDS.values())
    ids = {p.get("printify_product_id") for p in products}
    if ids & legacy:
        return False
    for row in products:
        product = full_product(row.get("printify_product_id"))
        if not product_ready(product):
            return False
    return True


def main():
    if not core.TOKEN:
        raise RuntimeError("Missing PRINTIFY_API_TOKEN")

    if already_migrated():
        print("Broken Pieces premium replacement already verified; no migration needed.")
        return

    source = full_product(core.SOURCE_TEE_ID)
    if not source:
        raise RuntimeError("Source tee template is unavailable")

    replacements = []
    report = []
    # Phase 1: create/reuse AND verify all five premium replacements. Do not delete anything yet.
    for spec in core.PRODUCTS:
        product, action = create_replacement(source, spec)
        replacements.append((spec, product))
        report.append({
            "slug": spec["slug"],
            "old_id": LEGACY_BAD_IDS[spec["slug"]],
            "new_id": product["id"],
            "action": action,
            "mockup": core.front_mockup(product),
            "url": core.storefront_url(product),
            "visible": product.get("visible"),
        })
        print(f"verified replacement: {spec['slug']} -> {product['id']} ({action})")

    if len(replacements) != 5 or not all(product_ready(p) for _, p in replacements):
        raise RuntimeError("Safety gate failed: all five replacements must be verified before legacy deletion")

    # Phase 2: remove only the five known flat-art products after all replacements are ready.
    deleted = []
    for slug, old_id in LEGACY_BAD_IDS.items():
        old = full_product(old_id)
        if old is not None:
            core.request("DELETE", f"/shops/{core.SHOP_ID}/products/{old_id}.json")
            deleted.append({"slug": slug, "old_id": old_id, "status": "deleted"})
        else:
            deleted.append({"slug": slug, "old_id": old_id, "status": "already_absent"})

    records = [site_record(spec, product) for spec, product in replacements]
    DATA.write_text(
        json.dumps({
            "collection": "BROKEN PIECES COLLECTION",
            "shop_id": core.SHOP_ID,
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "art_revision": REVISION_TAG,
            "products": records,
        }, indent=2) + "\n",
        encoding="utf-8",
    )
    OUT.joinpath("broken-pieces-premium-replacement.json").write_text(
        json.dumps({"replacements": report, "legacy_cleanup": deleted}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"replacements": report, "legacy_cleanup": deleted}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

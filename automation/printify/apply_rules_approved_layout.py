#!/usr/bin/env python3
import json
import time
from pathlib import Path

from finalize_rules_collection_layout import (
    SHOP_ID,
    PRODUCTS,
    request,
    get_product,
    verify_product,
    enabled_variants,
    upload,
    official_logo_rgba,
    tight_back_art,
    update_when_editable,
    wait_for_images,
    image_url,
    fetch_bytes,
)

OUT = Path("automation-output/rules-approved-live")
OUT.mkdir(parents=True, exist_ok=True)

# Visually selected from real unpublished Printify canaries against the approved mockups.
# Wearer's left chest appears viewer-right in the generated storefront mockup.
FRONT_X = 0.72
FRONT_Y = 0.24
FRONT_SCALE = 0.28
TEE_BACK_X = 0.50
TEE_BACK_Y = 0.43
TEE_BACK_SCALE = 0.88
HOODIE_BACK_X = 0.50
HOODIE_BACK_Y = 0.56
HOODIE_BACK_SCALE = 0.96


def placements_for(spec, logo_id, back_id, variant_ids):
    if spec["slug"] == "hoodie":
        back_x = HOODIE_BACK_X
        back_y = HOODIE_BACK_Y
        back_scale = HOODIE_BACK_SCALE
    else:
        back_x = TEE_BACK_X
        back_y = TEE_BACK_Y
        back_scale = TEE_BACK_SCALE
    return [
        {
            "variant_ids": variant_ids,
            "placeholders": [
                {
                    "position": "front",
                    "images": [
                        {
                            "id": logo_id,
                            "x": FRONT_X,
                            "y": FRONT_Y,
                            "scale": FRONT_SCALE,
                            "angle": 0,
                        }
                    ],
                },
                {
                    "position": "back",
                    "images": [
                        {
                            "id": back_id,
                            "x": back_x,
                            "y": back_y,
                            "scale": back_scale,
                            "angle": 0,
                        }
                    ],
                },
            ],
        }
    ]


def placement_rows(product, position):
    rows = []
    for area in product.get("print_areas", []):
        for placeholder in area.get("placeholders", []):
            if str(placeholder.get("position", "")).lower() != position:
                continue
            for image in placeholder.get("images", []):
                rows.append(
                    {
                        "id": image.get("id"),
                        "x": image.get("x"),
                        "y": image.get("y"),
                        "scale": image.get("scale"),
                        "angle": image.get("angle"),
                    }
                )
    return rows


def near(actual, expected, tolerance=0.02):
    try:
        return abs(float(actual) - float(expected)) <= tolerance
    except (TypeError, ValueError):
        return False


def verify_placement(product, spec):
    front = placement_rows(product, "front")
    back = placement_rows(product, "back")
    if len(front) != 1 or len(back) != 1:
        raise RuntimeError(f"{spec['title']}: expected exactly one front and one back image placement")
    if not (near(front[0]["x"], FRONT_X) and near(front[0]["y"], FRONT_Y) and near(front[0]["scale"], FRONT_SCALE)):
        raise RuntimeError(f"{spec['title']}: front placement drift: {front}")
    if spec["slug"] == "hoodie":
        expected = (HOODIE_BACK_X, HOODIE_BACK_Y, HOODIE_BACK_SCALE)
    else:
        expected = (TEE_BACK_X, TEE_BACK_Y, TEE_BACK_SCALE)
    if not (near(back[0]["x"], expected[0]) and near(back[0]["y"], expected[1]) and near(back[0]["scale"], expected[2])):
        raise RuntimeError(f"{spec['title']}: back placement drift: {back}")
    return {"front": front, "back": back}


def save_mockups(product, slug):
    files = {}
    for position in ("front", "back"):
        url = image_url(product, position)
        if not url:
            raise RuntimeError(f"{product.get('title')}: missing {position} mockup")
        path = OUT / f"{slug}-{position}.jpg"
        path.write_bytes(fetch_bytes(url))
        if path.stat().st_size < 10000:
            raise RuntimeError(f"{path}: downloaded mockup unexpectedly small")
        files[position] = str(path)
    return files


def main():
    # Use the actual official full Storm And Me mark, tightly cropped and transparent.
    logo_id = upload("storm-and-me-final-small-left-chest.png", official_logo_rgba())
    # Back artwork is transparent and tightly cropped, with NO logo and NO square background.
    art_ids = {
        "dark": upload("rules-final-dark-back-tight.png", tight_back_art("dark")),
        "light": upload("rules-final-light-back-tight.png", tight_back_art("light")),
    }

    original_state = {}
    for spec in PRODUCTS:
        product = get_product(spec["id"])
        variants = verify_product(product, spec)
        original_state[spec["id"]] = {
            "visible": product.get("visible"),
            "external": product.get("external"),
            "variant_count": len(variants),
        }
        # Printify requires every product variant ID in each print-area map, even
        # when only a small subset is enabled for sale. We are changing art only,
        # not the enabled variant set or prices.
        variant_ids = [variant["id"] for variant in product.get("variants", []) if variant.get("id") is not None]
        if not variant_ids:
            raise RuntimeError(f"{spec['title']}: no product variant IDs available for print-area update")
        update_when_editable(
            spec["id"],
            {"print_areas": placements_for(spec, logo_id, art_ids[spec["palette"]], variant_ids)},
        )
        print(f"PLACEMENT SUBMITTED: {spec['title']}")

    time.sleep(15)

    # Verify placement state before publishing image changes.
    for spec in PRODUCTS:
        product = get_product(spec["id"])
        verify_product(product, spec)
        verify_placement(product, spec)
        print(f"PLACEMENT VERIFIED: {spec['title']}")

    for spec in PRODUCTS:
        request(
            "POST",
            f"/shops/{SHOP_ID}/products/{spec['id']}/publish.json",
            {
                "title": False,
                "description": False,
                "images": True,
                "variants": False,
                "tags": False,
                "keyFeatures": False,
            },
        )
        print(f"MOCKUPS REPUBLISHED: {spec['title']}")

    time.sleep(35)
    report = []
    for spec in PRODUCTS:
        product = wait_for_images(spec["id"])
        variants = verify_product(product, spec)
        placement = verify_placement(product, spec)
        if product.get("visible") is not True:
            raise RuntimeError(f"{spec['title']}: product is not visible after update")
        external = product.get("external") or {}
        if not external.get("handle"):
            raise RuntimeError(f"{spec['title']}: storefront handle disappeared")
        files = save_mockups(product, spec["slug"])
        report.append(
            {
                "id": spec["id"],
                "title": spec["title"],
                "price_cents": spec["price"],
                "variant_count": len(variants),
                "placement": placement,
                "front_mockup": image_url(product, "front"),
                "back_mockup": image_url(product, "back"),
                "files": files,
                "visible": product.get("visible"),
                "external": external,
            }
        )
        print(f"LIVE VERIFIED: {spec['title']} — small left chest mark + large clean back graphic")

    (OUT / "report.json").write_text(json.dumps({"shop_id": SHOP_ID, "products": report}, indent=2) + "\n", encoding="utf-8")
    print("APPROVED_RULES_LAYOUT_LIVE_COMPLETE")


if __name__ == "__main__":
    main()

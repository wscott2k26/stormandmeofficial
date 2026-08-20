#!/usr/bin/env python3
import json
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
    wait_for_images,
    fetch_bytes,
)

OUT = Path('automation-output/rules-left-chest-height-probe')
OUT.mkdir(parents=True, exist_ok=True)

# Print-area top edge clips the full mark at scale .22. These canaries shrink it
# like a classic Polo/Tommy chest hit so the entire mark can sit higher intact.
CANDIDATES = [
    {'name': 'small-a', 'x': 0.86, 'y': 0.02, 'scale': 0.16},
    {'name': 'small-b', 'x': 0.86, 'y': 0.02, 'scale': 0.18},
    {'name': 'small-c', 'x': 0.86, 'y': 0.02, 'scale': 0.20},
]


def create_canary(source, spec, candidate, logo_id, back_id):
    variants = enabled_variants(source)
    ids = [row['id'] for row in source.get('variants', []) if row.get('id') is not None]
    payload = {
        'title': f"QA SMALL HIGH {spec['title']} — {candidate['name']}",
        'description': 'Unpublished smaller classic left-chest placement canary.',
        'tags': ['Storm And Me', 'QA', 'Rules Don\'t Exist Anymore'],
        'blueprint_id': int(source['blueprint_id']),
        'print_provider_id': int(source['print_provider_id']),
        'variants': variants,
        'print_areas': [{
            'variant_ids': ids,
            'placeholders': [
                {'position': 'front', 'images': [{'id': logo_id, 'x': candidate['x'], 'y': candidate['y'], 'scale': candidate['scale'], 'angle': 0}]},
                {'position': 'back', 'images': [{'id': back_id, 'x': 0.50, 'y': 0.43, 'scale': 0.88, 'angle': 0}]},
            ],
        }],
    }
    return request('POST', f'/shops/{SHOP_ID}/products.json', payload)


def main():
    spec = PRODUCTS[0]
    source = get_product(spec['id'])
    verify_product(source, spec)
    logo_id = upload('storm-and-me-small-high-logo.png', official_logo_rgba())
    back_id = upload('rules-small-high-back.png', tight_back_art(spec['palette']))
    created = []
    report = []
    try:
        for candidate in CANDIDATES:
            canary = create_canary(source, spec, candidate, logo_id, back_id)
            created.append(canary['id'])
            latest = wait_for_images(canary['id'])
            folded = None
            front = None
            for image in latest.get('images', []):
                src = image.get('src') or ''
                if 'camera_label=folded' in src:
                    folded = src
                if 'camera_label=front' in src:
                    front = src
            if not folded or not front:
                raise RuntimeError(f"{candidate['name']}: missing front/folded mockup")
            front_path = OUT / f"{candidate['name']}-front.jpg"
            folded_path = OUT / f"{candidate['name']}-folded.jpg"
            front_path.write_bytes(fetch_bytes(front))
            folded_path.write_bytes(fetch_bytes(folded))
            report.append({'candidate': candidate, 'front': front, 'folded': folded})
            print(f"CAPTURED {candidate['name']}")
    finally:
        for product_id in created:
            try:
                request('DELETE', f'/shops/{SHOP_ID}/products/{product_id}.json')
            except Exception as exc:
                print(f'warning: canary cleanup failed {product_id}: {exc}')
    (OUT / 'report.json').write_text(json.dumps({'candidates': report}, indent=2) + '\n', encoding='utf-8')
    print('LEFT_CHEST_SMALL_HIGH_CALIBRATION_COMPLETE')


if __name__ == '__main__':
    main()

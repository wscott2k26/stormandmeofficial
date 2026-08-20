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

TARGET = {'name': 'folded-calibration', 'x': 0.86, 'y': 0.05, 'scale': 0.22}


def create_canary(source, spec, logo_id, back_id):
    variants = enabled_variants(source)
    ids = [row['id'] for row in source.get('variants', []) if row.get('id') is not None]
    payload = {
        'title': f"QA FOLDED HEIGHT {spec['title']}",
        'description': 'Unpublished folded-view calibration canary.',
        'tags': ['Storm And Me', 'QA', 'Rules Don\'t Exist Anymore'],
        'blueprint_id': int(source['blueprint_id']),
        'print_provider_id': int(source['print_provider_id']),
        'variants': variants,
        'print_areas': [{
            'variant_ids': ids,
            'placeholders': [
                {'position': 'front', 'images': [{'id': logo_id, 'x': TARGET['x'], 'y': TARGET['y'], 'scale': TARGET['scale'], 'angle': 0}]},
                {'position': 'back', 'images': [{'id': back_id, 'x': 0.50, 'y': 0.43, 'scale': 0.88, 'angle': 0}]},
            ],
        }],
    }
    return request('POST', f'/shops/{SHOP_ID}/products.json', payload)


def main():
    spec = PRODUCTS[0]
    source = get_product(spec['id'])
    verify_product(source, spec)
    logo_id = upload('storm-and-me-folded-calibration-logo.png', official_logo_rgba())
    back_id = upload('rules-folded-calibration-back.png', tight_back_art(spec['palette']))
    canary = create_canary(source, spec, logo_id, back_id)
    try:
        latest = wait_for_images(canary['id'])
        images = latest.get('images', [])
        manifest = []
        for idx, image in enumerate(images):
            src = image.get('src')
            if not src:
                continue
            position = str(image.get('position') or 'unknown').replace('/', '-')
            path = OUT / f'image-{idx:02d}-{position}.jpg'
            path.write_bytes(fetch_bytes(src))
            manifest.append({
                'index': idx,
                'position': image.get('position'),
                'is_default': image.get('is_default'),
                'variant_ids': image.get('variant_ids'),
                'src': src,
                'file': str(path),
            })
        (OUT / 'report.json').write_text(json.dumps({'target': TARGET, 'images': manifest}, indent=2) + '\n', encoding='utf-8')
        print(f'CAPTURED {len(manifest)} PRINTIFY MOCKUPS FOR FOLDED CALIBRATION')
    finally:
        try:
            request('DELETE', f'/shops/{SHOP_ID}/products/{canary["id"]}.json')
        except Exception as exc:
            print(f'warning: canary cleanup failed {canary["id"]}: {exc}')
    print('LEFT_CHEST_FOLDED_CALIBRATION_COMPLETE')


if __name__ == '__main__':
    main()

import importlib.util
import sys
import types
from pathlib import Path
import unittest

# Stub orchestration dependency so these tests cover only safety transforms.
sys.modules['jesus_coffee_rollout'] = types.SimpleNamespace()
MODULE = Path(__file__).parents[1] / 'automation' / 'printify' / 'apply_jesus_coffee_collection.py'
spec = importlib.util.spec_from_file_location('apply_jc', MODULE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class ApplyJesusCoffeeTests(unittest.TestCase):
    def test_sanitize_source_removes_legacy_images_and_empty_areas(self):
        source = {
            'id': 'p1', 'title': 'Old title',
            'print_areas': [
                {'variant_ids': [1, 2], 'placeholders': [
                    {'position': 'front', 'images': [{'id': 'good-front'}, {'id': 'bad-front'}]},
                    {'position': 'back', 'images': [{'id': 'good-back'}]},
                ]},
                {'variant_ids': [3], 'placeholders': [
                    {'position': 'front', 'images': [{'id': 'bad-front'}]},
                    {'position': 'back', 'images': [{'id': 'bad-back'}]},
                ]},
            ]
        }
        clean = mod.sanitize_source(source, {'front': 'good-front', 'back': 'good-back'}, 'Clean title')
        self.assertEqual(clean['title'], 'Clean title')
        self.assertEqual(len(clean['print_areas']), 1)
        ids = [img['id'] for p in clean['print_areas'][0]['placeholders'] for img in p['images']]
        self.assertEqual(ids, ['good-front', 'good-back'])

    def test_phone_source_uses_large_back_art_only(self):
        source = {
            'id': 'p1', 'title': 'Old',
            'print_areas': [{'variant_ids': [1, 2], 'placeholders': [
                {'position': 'front', 'images': [{'id': 'small-front', 'x': .5}]},
                {'position': 'back', 'images': [{'id': 'large-back', 'x': .5}]},
            ]}]
        }
        clean = mod.phone_source(source, {'front': 'small-front', 'back': 'large-back'}, 'Coffee Title')
        self.assertEqual(clean['title'], 'Coffee Title')
        placeholders = clean['print_areas'][0]['placeholders']
        self.assertEqual(placeholders[0]['position'], 'front')
        self.assertEqual([x['id'] for x in placeholders[0]['images']], ['large-back'])

    def test_provider_variants_compat_collects_variant_level_placeholders(self):
        mod.jcr.request = lambda method, path: {
            'variants': [
                {
                    'id': 101,
                    'title': 'Black / M',
                    'placeholders': [
                        {'position': 'front', 'decoration_method': 'dtg', 'width': 3600, 'height': 4200},
                        {'position': 'back', 'decoration_method': 'dtg', 'width': 3600, 'height': 4200},
                    ],
                },
                {
                    'id': 102,
                    'title': 'White / M',
                    'placeholders': [
                        {'position': 'front', 'decoration_method': 'dtg', 'width': 3600, 'height': 4200},
                    ],
                },
            ]
        }
        variants, placeholders = mod.provider_variants_compat(77, 99)
        self.assertEqual([row['id'] for row in variants], [101, 102])
        self.assertEqual({row['position'] for row in placeholders}, {'front', 'back'})

    def test_choose_usable_target_skips_matching_blueprint_without_provider(self):
        blueprints = [
            {'id': 2001, 'title': 'Unisex Jersey Long Sleeve Tee'},
            {'id': 49, 'title': 'Unisex Long Sleeve Tee'},
        ]
        calls = []

        def choose_provider(bp_id, kind):
            calls.append(bp_id)
            if bp_id == 2001:
                raise RuntimeError('no provider')
            return {'provider_id': 99, 'variants': [{'id': 1}], 'placeholders': [{'position': 'front'}]}

        mod.jcr.choose_provider = choose_provider
        spec = {'kind': 'long-sleeve', 'terms': [['unisex', 'long', 'sleeve', 'tee'], ['long', 'sleeve']]}
        row = mod.choose_usable_target(blueprints, spec)
        self.assertEqual(row['blueprint']['id'], 49)
        self.assertEqual(calls, [2001, 49])

    def test_safe_preflight_uses_only_locked_apparel_and_phone_blueprints(self):
        blueprints = [
            {'id': 900, 'title': 'Unisex Heavy Blend Hooded Sweatshirt'},
            {'id': 77, 'title': 'Unisex Heavy Blend Hooded Sweatshirt'},
            {'id': 901, 'title': 'Unisex Long Sleeve Tee'},
            {'id': 80, 'title': 'Unisex Ultra Cotton Long Sleeve Tee'},
            {'id': 902, 'title': 'Unisex Jersey Short Sleeve Tee'},
            {'id': 12, 'title': 'Unisex Jersey Short Sleeve Tee'},
            {'id': 999, 'title': 'Generic Tough Phone Case'},
            {'id': 421, 'title': 'Protective Phone Cases'},
        ]
        mod.jcr.TARGETS = [
            {'kind': 'hoodie', 'terms': [['unisex', 'heavy', 'hooded', 'sweatshirt']]},
            {'kind': 'long-sleeve', 'terms': [['unisex', 'long', 'sleeve', 'tee']]},
            {'kind': 'fitted-tee', 'terms': [['unisex', 'jersey', 'short', 'sleeve', 'tee']]},
        ]
        mod.jcr.PHONE_FAMILIES = ('Samsung', 'Google Pixel', 'Motorola', 'iPhone')
        calls = []

        def choose_provider(bp_id, kind):
            calls.append((bp_id, kind))
            variants = [{'id': 1, 'title': 'Black M', 'is_available': True}]
            if kind == 'phone-case':
                variants = [
                    {'id': 11, 'title': 'iPhone 17 Pro', 'is_available': True},
                    {'id': 12, 'title': 'Samsung Galaxy S25', 'is_available': True},
                    {'id': 13, 'title': 'Google Pixel 10', 'is_available': True},
                ]
            return {
                'provider_id': 99,
                'provider_title': 'Provider',
                'variants': variants,
                'placeholders': [{'position': 'front'}, {'position': 'back'}],
                'families': {'iPhone': 1, 'Samsung': 1, 'Google Pixel': 1} if kind == 'phone-case' else {},
            }

        generic_phone_scan_calls = []
        mod.choose_provider_compat = choose_provider
        mod.jcr.discover_phone_targets = lambda _bps: generic_phone_scan_calls.append(True) or [
            {
                'blueprint': {'id': 999, 'title': 'Generic Tough Phone Case'},
                'provider': choose_provider(999, 'phone-case'),
                'covered': {'iPhone', 'Samsung', 'Google Pixel'},
            }
        ]

        result = mod.safe_preflight(blueprints)

        self.assertEqual([row['blueprint']['id'] for row in result['apparel']], [77, 80, 12])
        self.assertEqual([row['blueprint']['id'] for row in result['phone']], [421])
        self.assertEqual(generic_phone_scan_calls, [])
        self.assertEqual([bp_id for bp_id, _kind in calls], [77, 80, 12, 421])


if __name__ == '__main__':
    unittest.main()

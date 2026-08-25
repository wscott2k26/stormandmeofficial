import copy
import importlib.util
import sys
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).parents[1] / 'automation' / 'printify' / 'publish_jesus_tea_collection.py'
spec = importlib.util.spec_from_file_location('jt', MODULE_PATH)
jt = importlib.util.module_from_spec(spec)
sys.modules['jt'] = jt
spec.loader.exec_module(jt)


class JesusTeaCollectionTests(unittest.TestCase):
    def test_collection_has_ten_unique_back_designs(self):
        self.assertEqual(10, len(jt.DESIGNS))
        self.assertEqual(10, len({d['slug'] for d in jt.DESIGNS}))
        self.assertEqual(10, len({d['title'] for d in jt.DESIGNS}))
        self.assertTrue(all(d['headline'] for d in jt.DESIGNS))

    def test_retail_price_matches_current_live_storm_store(self):
        self.assertEqual(3494, jt.RETAIL_PRICE_CENTS)

    def test_render_design_is_print_ready_rgba_with_safe_margin(self):
        image = jt.render_design(jt.DESIGNS[0])
        self.assertEqual('RGBA', image.mode)
        self.assertEqual((jt.W, jt.H), image.size)
        bbox = image.getchannel('A').getbbox()
        self.assertIsNotNone(bbox)
        x0, y0, x1, y1 = bbox
        self.assertGreaterEqual(x0, jt.SAFE_MARGIN)
        self.assertGreaterEqual(y0, jt.SAFE_MARGIN)
        self.assertLessEqual(x1, jt.W - jt.SAFE_MARGIN)
        self.assertLessEqual(y1, jt.H - jt.SAFE_MARGIN)

    def test_build_print_areas_uses_exact_approved_logo_and_only_new_back_art(self):
        source = [
            {
                'variant_ids': [1, 2],
                'placeholders': [
                    {'position': 'front', 'images': [{'id': jt.APPROVED_FRONT_LOGO_ID, 'x': 0.42, 'y': 0.44, 'scale': 0.2, 'angle': 0}]},
                    {'position': 'back', 'images': [{'id': 'old-back', 'x': 0.5, 'y': 0.5, 'scale': 0.7, 'angle': 0}]},
                    {'position': 'sleeve', 'images': []},
                ],
            }
        ]
        original = copy.deepcopy(source)
        areas = jt.build_print_areas(source, 'new-back')
        self.assertEqual(original, source, 'source must not be mutated')
        front = areas[0]['placeholders'][0]['images'][0]
        back = areas[0]['placeholders'][1]['images'][0]
        self.assertEqual(jt.APPROVED_FRONT_LOGO_ID, front['id'])
        self.assertAlmostEqual(jt.LEFT_CHEST_X, front['x'])
        self.assertAlmostEqual(jt.LEFT_CHEST_Y, front['y'])
        self.assertEqual('new-back', back['id'])
        self.assertAlmostEqual(0.5, back['x'])
        self.assertAlmostEqual(0.5, back['y'])
        ids = [img['id'] for a in areas for p in a['placeholders'] for img in p.get('images', [])]
        self.assertNotIn('old-back', ids)

    def test_build_variants_curates_brand_colors_and_sets_price(self):
        source = [
            {'id': 1, 'title': 'Black / M', 'price': 2500, 'is_enabled': True, 'is_default': True},
            {'id': 2, 'title': 'White / M', 'price': 2500, 'is_enabled': True, 'is_default': False},
            {'id': 3, 'title': 'Red / M', 'price': 2500, 'is_enabled': True, 'is_default': False},
            {'id': 4, 'title': 'Military Green / M', 'price': 2500, 'is_enabled': True, 'is_default': False},
        ]
        variants = jt.build_variants(source)
        enabled = [v for v in variants if v['is_enabled']]
        self.assertEqual({1, 2, 4}, {v['id'] for v in enabled})
        self.assertTrue(all(v['price'] == jt.RETAIL_PRICE_CENTS for v in enabled))
        self.assertEqual(1, sum(1 for v in enabled if v.get('is_default')))

    def test_validate_live_product_rejects_wrong_front_logo(self):
        product = {
            'title': jt.DESIGNS[0]['title'],
            'visible': True,
            'variants': [{'id': 1, 'price': jt.RETAIL_PRICE_CENTS, 'is_enabled': True}],
            'print_areas': [{
                'variant_ids': [1],
                'placeholders': [
                    {'position': 'front', 'images': [{'id': 'wrong-logo', 'x': jt.LEFT_CHEST_X, 'y': jt.LEFT_CHEST_Y, 'scale': 0.2, 'angle': 0}]},
                    {'position': 'back', 'images': [{'id': 'back-1', 'x': 0.5, 'y': 0.5, 'scale': 0.86, 'angle': 0}]},
                ],
            }],
            'images': [{'position': 'front', 'src': 'front.jpg'}, {'position': 'back', 'src': 'back.jpg'}],
        }
        with self.assertRaises(RuntimeError):
            jt.validate_live_product(product, jt.DESIGNS[0]['title'], 'back-1')


if __name__ == '__main__':
    unittest.main()

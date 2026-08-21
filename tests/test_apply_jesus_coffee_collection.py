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


if __name__ == '__main__':
    unittest.main()

import copy
import importlib.util
import sys
import types
from pathlib import Path
import unittest

# Keep this test focused on the pure print-area repair logic.
sys.modules['apply_jesus_coffee_collection'] = types.SimpleNamespace(
    APPAREL_LOGO_ID='brand-logo',
    LEFT_CHEST_X=0.30,
    LEFT_CHEST_Y=0.28,
    SOURCES={},
)
sys.modules['jesus_coffee_rollout'] = types.SimpleNamespace()
MODULE = Path(__file__).parents[1] / 'automation' / 'printify' / 'repair_jesus_coffee_logo_placement.py'
spec = importlib.util.spec_from_file_location('repair_jc_logo', MODULE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class RepairJesusCoffeeLogoPlacementTests(unittest.TestCase):
    def sample_areas(self):
        return [
            {
                'variant_ids': [101, 102, 103],
                'placeholders': [
                    {
                        'position': 'front',
                        'decoration_method': 'dtg',
                        'images': [
                            {'id': 'brand-logo', 'x': 0.5, 'y': 0.5, 'scale': 0.38, 'angle': 0},
                            {'id': 'front-accent', 'x': 0.61, 'y': 0.44, 'scale': 0.12, 'angle': 0},
                        ],
                    },
                    {
                        'position': 'back',
                        'decoration_method': 'dtg',
                        'images': [
                            {'id': 'large-back-art', 'x': 0.5, 'y': 0.43, 'scale': 0.76, 'angle': 0},
                        ],
                    },
                ],
            },
        ]

    def test_repair_moves_only_brand_logo_and_preserves_variant_coverage(self):
        original = self.sample_areas()
        before = copy.deepcopy(original)
        repaired, changed = mod.repair_print_areas(original)

        self.assertEqual(changed, 1)
        self.assertEqual(repaired[0]['variant_ids'], [101, 102, 103])
        self.assertEqual(original, before, 'repair must not mutate the fetched product')

        front = repaired[0]['placeholders'][0]['images']
        back = repaired[0]['placeholders'][1]['images']
        self.assertEqual((front[0]['x'], front[0]['y']), (0.30, 0.28))
        self.assertEqual(front[0]['scale'], 0.38)
        self.assertEqual(front[1], before[0]['placeholders'][0]['images'][1])
        self.assertEqual(back, before[0]['placeholders'][1]['images'])

    def test_artwork_and_variant_signatures_do_not_change(self):
        before = self.sample_areas()
        repaired, _ = mod.repair_print_areas(before)
        self.assertEqual(mod.artwork_signature(before), mod.artwork_signature(repaired))
        self.assertEqual(mod.variant_signature(before), mod.variant_signature(repaired))

    def test_already_correct_logo_is_idempotent(self):
        areas = self.sample_areas()
        logo = areas[0]['placeholders'][0]['images'][0]
        logo['x'] = 0.30
        logo['y'] = 0.28
        repaired, changed = mod.repair_print_areas(areas)
        self.assertEqual(changed, 0)
        self.assertEqual((repaired[0]['placeholders'][0]['images'][0]['x'], repaired[0]['placeholders'][0]['images'][0]['y']), (0.30, 0.28))

    def test_missing_front_logo_is_rejected(self):
        areas = self.sample_areas()
        areas[0]['placeholders'][0]['images'] = [{'id': 'not-brand-logo', 'x': 0.5, 'y': 0.5, 'scale': 0.2, 'angle': 0}]
        with self.assertRaises(RuntimeError):
            mod.repair_print_areas(areas, require_logo=True)


if __name__ == '__main__':
    unittest.main()

import importlib.util
from pathlib import Path
import unittest

MODULE_PATH = Path(__file__).parents[1] / "automation" / "printify" / "jesus_coffee_rollout.py"
spec = importlib.util.spec_from_file_location("jcr", MODULE_PATH)
jcr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jcr)

class JesusCoffeeRolloutTests(unittest.TestCase):
    def test_keyword_score_prioritizes_coffee(self):
        self.assertGreater(jcr.keyword_score({"title": "Jesus Saves, Coffee Helps Me Act Saved"}), 50)
        self.assertEqual(jcr.keyword_score({"title": "Broken Pieces — Cracked Heart Tee"}), 0)

    def test_strip_garment_suffix(self):
        self.assertEqual(
            jcr.strip_garment_suffix("Jesus Saves Coffee Helps Me Act Saved — Comfort Colors Tee"),
            "Jesus Saves Coffee Helps Me Act Saved"
        )
        self.assertEqual(jcr.strip_garment_suffix("Coffee, Grace & Good Mornings T-Shirt"), "Coffee, Grace & Good Mornings")

    def test_device_family_detects_multiple_android_brands(self):
        self.assertEqual(jcr.device_family("Samsung Galaxy S25 Ultra"), "Samsung")
        self.assertEqual(jcr.device_family("Google Pixel 10 Pro"), "Google Pixel")
        self.assertEqual(jcr.device_family("iPhone 17 Pro"), "iPhone")
        self.assertEqual(jcr.device_family("Motorola Razr 2026"), "Motorola")

    def test_patch_home_is_idempotent_and_no_images(self):
        original = '{/* MERCH */}\n<section className="relative py-16 sm:py-20" data-testid="home-merch-section">'
        patched = jcr.patch_home_text(original)
        self.assertIn("Jesus &amp; Coffee Collection", patched)
        self.assertIn("Faith for the soul. Coffee for the morning.", patched)
        self.assertIn('href={BRAND.shop}', patched)
        self.assertNotIn("<img", patched)
        self.assertEqual(jcr.patch_home_text(patched), patched)

    def test_build_target_title(self):
        self.assertEqual(
            jcr.build_target_title("Jesus Saves Coffee Helps Me Act Saved Tee", "Heavyweight Hoodie"),
            "Jesus Saves Coffee Helps Me Act Saved — Heavyweight Hoodie",
        )

if __name__ == "__main__":
    unittest.main()

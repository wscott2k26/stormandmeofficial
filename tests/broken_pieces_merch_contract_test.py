import importlib.util
import json
import pathlib
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLISHER = ROOT / "automation" / "printify" / "publish_broken_pieces_collection.py"
REPLACER = ROOT / "automation" / "printify" / "replace_broken_pieces_premium.py"
PORTAL = ROOT / "frontend" / "src" / "components" / "FeaturedMerchPortal.js"


class BrokenPiecesMerchContractTests(unittest.TestCase):
    def load_publisher(self):
        self.assertTrue(PUBLISHER.exists(), "Broken Pieces publisher must exist")
        spec = importlib.util.spec_from_file_location("broken_pieces_publisher", PUBLISHER)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def load_replacer(self):
        self.assertTrue(REPLACER.exists(), "Broken Pieces premium replacer must exist")
        sys.path.insert(0, str(REPLACER.parent))
        try:
            spec = importlib.util.spec_from_file_location("broken_pieces_replacer", REPLACER)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module
        finally:
            sys.path.pop(0)

    def test_five_products_and_exact_back_messages(self):
        module = self.load_publisher()
        self.assertEqual(len(module.PRODUCTS), 5)
        self.assertEqual(
            [item["slug"] for item in module.PRODUCTS],
            ["cracked-heart", "kintsugi-heart", "broken-cross", "streetwear", "puzzle-piece"],
        )
        self.assertEqual(module.PRODUCTS[0]["back_text"], "GOD STILL MAKES MASTERPIECES FROM BROKEN PIECES")
        self.assertEqual(module.PRODUCTS[1]["back_text"], "STILL STANDING.")
        self.assertEqual(module.PRODUCTS[2]["back_text"], "THE CRACKS LET THE LIGHT IN.")
        self.assertEqual(module.PRODUCTS[3]["back_text"], "")
        self.assertEqual(module.PRODUCTS[4]["back_text"], "STILL BECOMING.")

    def test_print_art_is_textured_not_flat_placeholder_art(self):
        module = self.load_publisher()
        for product in module.PRODUCTS:
            front, back = module.build_art(product)
            for side_name, art in (("front", front), ("back", back)):
                crop = art.crop((650, 450, 3850, 4700)).resize((320, 425), resample=0).convert("RGBA")
                fully_opaque_rgb = {
                    (r, g, b)
                    for r, g, b, a in crop.getdata()
                    if a == 255
                }
                self.assertGreaterEqual(
                    len(fully_opaque_rgb),
                    64,
                    f"{product['slug']} {side_name} is visually too flat ({len(fully_opaque_rgb)} solid colors); approved print art must use real texture/shading rather than flat placeholder fills",
                )

    def test_obama_products_are_explicitly_removed(self):
        module = self.load_publisher()
        self.assertEqual(
            set(module.OBAMA_PRODUCT_IDS),
            {"6a8734ac4334f6ea37086290", "6a8734bad916929e7500b843", "6a8734c729aeb510e50271a8"},
        )

    def test_portal_features_broken_pieces_before_rules(self):
        text = PORTAL.read_text(encoding="utf-8")
        self.assertIn('broken-pieces-products.generated.json', text)
        self.assertNotIn('obama-reference-products.generated.json', text)
        self.assertIn('BROKEN PIECES COLLECTION', text)
        self.assertIn('RULES DON’T EXIST ANYMORE', text)
        self.assertLess(text.index('BROKEN PIECES COLLECTION'), text.index('RULES DON’T EXIST ANYMORE'))

    def test_migration_gate_rejects_repurposed_live_product_ids(self):
        module = self.load_replacer()
        repurposed_ids = [
            "6a8768c94c5ccb17760a17a2",
            "6a876921765de48d610d9a0c",
            "6a87697334e6b74a81056e4b",
            "6a876990aa9cea471b08e022",
            "6a8769c22a86ae766007bbaa",
        ]
        with tempfile.TemporaryDirectory() as tmp:
            data_path = pathlib.Path(tmp) / "broken-pieces-products.generated.json"
            data_path.write_text(
                json.dumps({
                    "art_revision": module.REVISION_TAG,
                    "products": [{"printify_product_id": pid} for pid in repurposed_ids],
                }),
                encoding="utf-8",
            )
            original_data = module.DATA
            original_full_product = module.full_product
            module.DATA = data_path
            module.full_product = lambda product_id: {
                "id": product_id,
                "title": "I Run on Coffee & Jesus",
                "tags": [],
                "visible": True,
                "images": [{"src": "https://example.invalid/mockup.jpg"}],
                "external": {"id": "storefront-record"},
                "variants": [{"is_enabled": True, "price": 2599}],
            }
            try:
                self.assertFalse(
                    module.already_migrated(),
                    "Broken Pieces migration must not trust a product ID that has been repurposed to another design",
                )
            finally:
                module.DATA = original_data
                module.full_product = original_full_product


if __name__ == "__main__":
    unittest.main()

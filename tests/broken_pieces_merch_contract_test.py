import importlib.util
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLISHER = ROOT / "automation" / "printify" / "publish_broken_pieces_collection.py"
PORTAL = ROOT / "frontend" / "src" / "components" / "FeaturedMerchPortal.js"


class BrokenPiecesMerchContractTests(unittest.TestCase):
    def load_publisher(self):
        self.assertTrue(PUBLISHER.exists(), "Broken Pieces publisher must exist")
        spec = importlib.util.spec_from_file_location("broken_pieces_publisher", PUBLISHER)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

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
                crop = art.crop((650, 450, 3850, 4700)).convert("RGBA")
                opaque_rgb = {
                    (r, g, b)
                    for r, g, b, a in crop.getdata()
                    if a >= 32
                }
                self.assertGreaterEqual(
                    len(opaque_rgb),
                    96,
                    f"{product['slug']} {side_name} is visually too flat ({len(opaque_rgb)} opaque colors); print art must use real texture/shading, not placeholder-style flat fills",
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


if __name__ == "__main__":
    unittest.main()

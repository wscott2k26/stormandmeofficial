from pathlib import Path
import re
import unittest

HOME_PATH = Path(__file__).parents[1] / "frontend" / "src" / "pages" / "Home.js"

EXPECTED_PRODUCTS = (
    {
        "testid": "jesus-coffee-product-run-coffee-jesus",
        "title": "I Run on Coffee & Jesus",
        "product_id": "6a88ab9048b9c45ed50c422e",
    },
    {
        "testid": "jesus-coffee-product-act-saved",
        "title": "Jesus Saves, Coffee Helps Me Act Saved",
        "product_id": "6a88aba60581e90e4c09fb9d",
    },
)


class HomeJesusCoffeeFeaturedProductsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.home = HOME_PATH.read_text(encoding="utf-8")
        cls.feature = cls.home.split('data-testid="jesus-coffee-featured-section"', 1)[1].split(
            'data-testid="home-merch-section"', 1
        )[0]

    def test_feature_shows_two_real_printify_products(self):
        for product in EXPECTED_PRODUCTS:
            self.assertIn(f'data-testid="{product["testid"]}"', self.feature)
            self.assertIn(product["title"], self.feature)
            self.assertIn(
                f"https://images-api.printify.com/mockup/{product['product_id']}/",
                self.feature,
            )

    def test_feature_uses_exactly_two_printify_mockup_images(self):
        urls = re.findall(r'https://images-api\.printify\.com/mockup/[^"}]+', self.feature)
        self.assertEqual(len(urls), 2, urls)
        self.assertTrue(all("camera_label=front" in url for url in urls), urls)

    def test_cards_send_shoppers_to_official_store(self):
        self.assertGreaterEqual(self.feature.count('href={BRAND.shop}'), 3)
        self.assertIn('data-testid="home-shop-jesus-coffee"', self.feature)

    def test_feature_does_not_use_generated_or_placeholder_art(self):
        lowered = self.feature.lower()
        self.assertNotIn("generated-art", lowered)
        self.assertNotIn("placeholder", lowered)
        self.assertNotIn("unsplash", lowered)
        self.assertNotIn("pexels", lowered)


if __name__ == "__main__":
    unittest.main()

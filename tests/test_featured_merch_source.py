from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "frontend/src/pages/Home.js"
MERCH_DIR = ROOT / "frontend/public/featured-merch"

SHIRTS = [
    {
        "id": "stay-tee",
        "name": "Some Things Ain't Worth It… But You Are — Stay Tee",
        "price": "$34.99",
        "url": "https://stormandme.printify.me/product/30324789",
        "image": "https://images-api.printify.com/mockup/6a63b944526af1ea540dbf2b/18230/102045/some-things-aint-worth-it-but-you-are-stay-tee.jpg?camera_label=back-2&revision=1785025198746&s=2048",
    },
    {
        "id": "still-standing-tee",
        "name": "The House That Pain Built — Still Standing Tee",
        "price": "$34.99",
        "url": "https://stormandme.printify.me/product/30324825",
        "image": "https://images-api.printify.com/mockup/6a63b96a2f348356b404fed3/18230/102045/the-house-that-pain-built-still-standing-tee.jpg?camera_label=back-2&revision=1785025226555&s=2048",
    },
    {
        "id": "found-my-way-back-tee",
        "name": "I Survived the Storm — Found My Way Back Tee",
        "price": "$34.99",
        "url": "https://stormandme.printify.me/product/30324848",
        "image": "https://images-api.printify.com/mockup/6a63b98a3741853e8904bd5b/18230/102045/i-survived-the-storm-found-my-way-back-tee.jpg?camera_label=back-2&revision=1785025247713&s=2048",
    },
]


def source() -> str:
    return HOME.read_text(encoding="utf-8")


def test_home_defines_exactly_three_approved_featured_shirts():
    text = source()
    assert "export const FEATURED_SHIRTS" in text
    assert text.count('category: "Featured Tee"') == 3
    assert text.count('price: "$34.99"') == 3
    for shirt in SHIRTS:
        assert f'id: "{shirt["id"]}"' in text
        assert f'name: "{shirt["name"]}"' in text
        assert f'url: "{shirt["url"]}"' in text
        assert f'image: "{shirt["image"]}"' in text
    featured_block = text.split("export const FEATURED_SHIRTS", 1)[1].split("]);", 1)[0]
    assert "hoodie" not in featured_block.lower()


def test_home_merch_section_uses_existing_design_language_and_safe_links():
    text = source()
    assert "export function FeaturedShirtCard" in text
    assert 'className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-white/25 hover:-translate-y-1 transition-all duration-300"' in text
    assert 'target="_blank"' in text
    assert 'rel="noreferrer"' in text
    assert "View Shirt" in text
    assert "FEATURED_SHIRTS.map" in text
    assert "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-12" in text
    assert "Secure checkout and fulfillment through Printify." in text
    assert 'GlowButton to="/shop" data-testid="home-shop-storm"' in text
    assert "products.slice(0, 4)" not in text
    assert "FeaturedMerchPortal" not in text


def test_home_removes_only_obsolete_product_api_state_from_homepage():
    text = source()
    assert "getProducts" not in text
    assert "setProducts" not in text
    assert re.search(r"\bProductCard\b", text) is None


def test_featured_shirts_use_real_printify_product_photos_without_fake_local_mockups():
    text = source()
    for shirt in SHIRTS:
        assert f'image: "{shirt["image"]}"' in text
        assert shirt["image"].startswith("https://images-api.printify.com/mockup/")
        assert "camera_label=back-2" in shirt["image"]

    assert "Official Product" not in text
    assert not MERCH_DIR.exists() or not any(MERCH_DIR.glob("*.svg"))

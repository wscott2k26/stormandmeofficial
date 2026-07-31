from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "frontend/src/pages/Home.js"
MERCH_DIR = ROOT / "frontend/public/featured-merch"

SHIRTS = [
    {
        "id": "stay-tee",
        "name": "Some Things Ain't Worth It… But You Are — Stay Tee",
        "price": "$34.99",
        "url": "https://stormandme.printify.me/product/30324789",
        "image": "stay-tee.svg",
    },
    {
        "id": "still-standing-tee",
        "name": "The House That Pain Built — Still Standing Tee",
        "price": "$34.99",
        "url": "https://stormandme.printify.me/product/30324825",
        "image": "still-standing-tee.svg",
    },
    {
        "id": "found-my-way-back-tee",
        "name": "I Survived the Storm — Found My Way Back Tee",
        "price": "$34.99",
        "url": "https://stormandme.printify.me/product/30324848",
        "image": "found-my-way-back-tee.svg",
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
        assert f'image: "/featured-merch/{shirt["image"]}"' in text
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


def test_three_local_svg_assets_are_self_contained_and_product_specific():
    assert MERCH_DIR.is_dir()
    files = sorted(path.name for path in MERCH_DIR.glob("*.svg"))
    assert files == sorted(shirt["image"] for shirt in SHIRTS)

    for shirt in SHIRTS:
        path = MERCH_DIR / shirt["image"]
        content = path.read_text(encoding="utf-8")
        root = ET.fromstring(content)
        assert root.tag.endswith("svg")
        assert root.attrib.get("viewBox") == "0 0 1200 1200"
        assert shirt["name"] in content
        assert 'href="http' not in content
        assert 'src="http' not in content
        assert "<script" not in content.lower()
        assert "<image" not in content.lower()

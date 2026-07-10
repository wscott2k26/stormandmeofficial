"""Backend API tests for StormAndMeOfficial."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://willy-stories.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Content endpoints ----------
class TestBooks:
    def test_list_books_returns_8(self, client):
        r = client.get(f"{API}/books", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 8, f"expected 8 got {len(data)}"
        for b in data:
            assert "id" in b and "title" in b and "price" in b
            assert "_id" not in b

    def test_get_book_by_id(self, client):
        r = client.get(f"{API}/books/unhappy", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "unhappy"
        assert d["title"] == "UNHAPPY"
        assert d["price"] == 19.99

    def test_get_book_404(self, client):
        r = client.get(f"{API}/books/does-not-exist", timeout=30)
        assert r.status_code == 404

    def test_book_category_filter(self, client):
        r = client.get(f"{API}/books", params={"category": "Children's Books"}, timeout=30)
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) >= 1
        for b in arr:
            assert "Children's Books" in b.get("categories", [])

    def test_book_categories_list(self, client):
        r = client.get(f"{API}/books/categories", timeout=30)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list) and len(cats) > 0
        assert "Children's Books" in cats


class TestProducts:
    def test_list_products_returns_8(self, client):
        r = client.get(f"{API}/products", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 8
        for p in data:
            assert "_id" not in p

    def test_get_product_by_id(self, client):
        r = client.get(f"{API}/products/storm-hoodie", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "storm-hoodie"
        assert d["price"] == 54.00
        assert d["sale_price"] == 44.00

    def test_product_category_filter(self, client):
        r = client.get(f"{API}/products", params={"category": "Clothing"}, timeout=30)
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) >= 1


class TestMusicVideosPostsFaqs:
    def test_music_list(self, client):
        r = client.get(f"{API}/music", timeout=30)
        assert r.status_code == 200
        assert len(r.json()) == 4

    def test_music_by_id(self, client):
        r = client.get(f"{API}/music/storm-and-soul", timeout=30)
        assert r.status_code == 200
        assert r.json()["id"] == "storm-and-soul"

    def test_videos_list(self, client):
        r = client.get(f"{API}/videos", timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_posts_list(self, client):
        r = client.get(f"{API}/posts", timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 4

    def test_post_by_id(self, client):
        r = client.get(f"{API}/posts/welcome", timeout=30)
        assert r.status_code == 200
        assert r.json()["id"] == "welcome"

    def test_faqs(self, client):
        r = client.get(f"{API}/faqs", timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 5


# ---------- Forms ----------
class TestForms:
    def test_newsletter_subscribe_and_idempotent(self, client):
        payload = {"first_name": "TEST_User", "email": "test_newsletter_stormandme@example.com"}
        r1 = client.post(f"{API}/newsletter", json=payload, timeout=30)
        assert r1.status_code == 200
        assert r1.json()["success"] is True
        # duplicate should also succeed
        r2 = client.post(f"{API}/newsletter", json=payload, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["success"] is True

    def test_contact_submit(self, client):
        payload = {
            "name": "TEST_Contact",
            "email": "test_contact_stormandme@example.com",
            "phone": "555-1234",
            "reason": "General",
            "subject": "Hello",
            "message": "This is a test",
        }
        r = client.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 200
        assert r.json()["success"] is True


# ---------- Checkout ----------
class TestCheckout:
    def test_checkout_session_with_mixed_cart_and_coupon(self, client):
        payload = {
            "items": [
                {"id": "unhappy", "type": "book", "quantity": 1, "format": "Paperback"},
                {"id": "storm-hoodie", "type": "product", "quantity": 2, "size": "M", "color": "Charcoal"},
            ],
            "origin_url": "https://willy-stories.preview.emergentagent.com",
            "coupon": "STORM10",
            "email": "test_checkout_stormandme@example.com",
            "shipping": "standard",
        }
        r = client.post(f"{API}/checkout/session", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and d["url"].startswith("https://")
        assert "stripe.com" in d["url"]
        assert "session_id" in d and d["session_id"]

        # verify status endpoint returns order
        sid = d["session_id"]
        st = client.get(f"{API}/checkout/status/{sid}", timeout=30)
        assert st.status_code == 200, st.text
        sd = st.json()
        assert "status" in sd and "payment_status" in sd
        assert sd.get("order") is not None
        order = sd["order"]
        assert order["session_id"] == sid
        # server-computed totals: 19.99 + 2*44 = 107.99 subtotal
        assert abs(order["subtotal"] - 107.99) < 0.01
        # discount 10% of 107.99
        assert abs(order["discount"] - round(107.99 * 0.10, 2)) < 0.01
        assert order["shipping"] == 5.99
        assert order["coupon"] == "STORM10"
        assert order["payment_status"] in ("initiated", "unpaid", "paid")

    def test_checkout_bad_coupon_no_discount(self, client):
        payload = {
            "items": [{"id": "unhappy", "type": "book", "quantity": 1}],
            "origin_url": "https://willy-stories.preview.emergentagent.com",
            "coupon": "NOPE",
            "shipping": "standard",
        }
        r = client.post(f"{API}/checkout/session", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        sid = r.json()["session_id"]
        st = client.get(f"{API}/checkout/status/{sid}", timeout=30).json()
        assert st["order"]["discount"] == 0.0
        assert st["order"]["coupon"] in (None, "")

    def test_checkout_invalid_item(self, client):
        payload = {
            "items": [{"id": "not-a-real-book", "type": "book", "quantity": 1}],
            "origin_url": "https://willy-stories.preview.emergentagent.com",
        }
        r = client.post(f"{API}/checkout/session", json=payload, timeout=30)
        assert r.status_code == 400

    def test_checkout_empty_cart(self, client):
        r = client.post(
            f"{API}/checkout/session",
            json={"items": [], "origin_url": "https://willy-stories.preview.emergentagent.com"},
            timeout=30,
        )
        assert r.status_code == 400

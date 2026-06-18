"""
Backend API regression tests for Aavya Fashion & Jewellery
Covers: products, reviews, coupon, newsletter, checkout (COD + Stripe), order tracking
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aavya-luxury.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# Read frontend .env if env not set
if not os.environ.get("REACT_APP_BACKEND_URL"):
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    API = f"{BASE_URL}/api"
                    break
    except Exception:
        pass


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------------------- Health --------------------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# -------------------- Products --------------------
class TestProducts:
    def test_list_all(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 8
        assert all("slug" in p and "price" in p and "images" in p for p in data)
        assert all("_id" not in p for p in data)

    @pytest.mark.parametrize("category", ["earrings", "necklaces", "bridal", "oxidised"])
    def test_filter_category(self, session, category):
        r = session.get(f"{API}/products", params={"category": category})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert all(p["category"] == category for p in data)

    def test_get_by_slug(self, session):
        r = session.get(f"{API}/products/royal-kundan-bridal-set")
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "royal-kundan-bridal-set"
        assert p["category"] == "bridal"
        assert p["price"] == 4499.0

    def test_get_invalid_slug(self, session):
        r = session.get(f"{API}/products/does-not-exist")
        assert r.status_code == 404


# -------------------- Reviews --------------------
class TestReviews:
    def test_list_reviews(self, session):
        r = session.get(f"{API}/reviews")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "name" in data[0] and "comment" in data[0]


# -------------------- Coupons --------------------
class TestCoupons:
    def test_aavya10_valid(self, session):
        r = session.post(f"{API}/coupon/apply", json={"code": "AAVYA10", "subtotal": 1000})
        assert r.status_code == 200
        d = r.json()
        assert d["code"] == "AAVYA10"
        assert d["discount"] == 100.0

    def test_weekend15_valid(self, session):
        r = session.post(f"{API}/coupon/apply", json={"code": "WEEKEND15", "subtotal": 2000})
        assert r.status_code == 200
        assert r.json()["discount"] == 300.0

    def test_weekend15_below_min(self, session):
        r = session.post(f"{API}/coupon/apply", json={"code": "WEEKEND15", "subtotal": 1000})
        assert r.status_code == 400

    def test_bridal500_valid(self, session):
        r = session.post(f"{API}/coupon/apply", json={"code": "BRIDAL500", "subtotal": 4000})
        assert r.status_code == 200
        assert r.json()["discount"] == 500.0

    def test_bridal500_below_min(self, session):
        r = session.post(f"{API}/coupon/apply", json={"code": "BRIDAL500", "subtotal": 2000})
        assert r.status_code == 400

    def test_invalid_code(self, session):
        r = session.post(f"{API}/coupon/apply", json={"code": "FAKE", "subtotal": 5000})
        assert r.status_code == 400

    def test_lowercase_normalised(self, session):
        r = session.post(f"{API}/coupon/apply", json={"code": "aavya10", "subtotal": 500})
        assert r.status_code == 200
        assert r.json()["code"] == "AAVYA10"


# -------------------- Newsletter --------------------
class TestNewsletter:
    def test_signup(self, session):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["coupon"] == "AAVYA10"
        assert "AAVYA10" in d["message"]

    def test_duplicate_signup(self, session):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        session.post(f"{API}/newsletter", json={"email": email})
        r = session.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        assert "already" in r.json()["message"].lower()

    def test_invalid_email(self, session):
        r = session.post(f"{API}/newsletter", json={"email": "not-an-email"})
        assert r.status_code == 422


# -------------------- Checkout --------------------
def _get_test_product(session):
    r = session.get(f"{API}/products/royal-kundan-bridal-set")
    return r.json()


@pytest.fixture(scope="module")
def cod_order(session):
    """Create a COD order for downstream tests."""
    prod = _get_test_product(session)
    payload = {
        "items": [{
            "product_id": prod["id"],
            "name": prod["name"],
            "image": prod["images"][0],
            "price": prod["price"],
            "quantity": 1,
        }],
        "address": {
            "full_name": "TEST_Test User",
            "phone": "9999189863",
            "line1": "Test Street 1",
            "city": "Mumbai",
            "state": "MH",
            "pincode": "400001",
            "email": "test@example.com",
        },
        "payment_method": "cod",
        "origin_url": BASE_URL,
    }
    r = session.post(f"{API}/checkout", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


class TestCheckout:
    def test_cod_checkout(self, cod_order):
        assert cod_order["payment_method"] == "cod"
        assert cod_order["order_number"].startswith("AAV")
        assert cod_order["checkout_url"] is None
        assert cod_order["total"] > 0

    def test_cod_with_coupon(self, session):
        prod = _get_test_product(session)
        payload = {
            "items": [{
                "product_id": prod["id"], "name": prod["name"], "image": prod["images"][0],
                "price": prod["price"], "quantity": 1,
            }],
            "address": {
                "full_name": "TEST_Coupon", "phone": "9999189863",
                "line1": "L1", "city": "Mumbai", "state": "MH", "pincode": "400001",
            },
            "coupon_code": "AAVYA10",
            "payment_method": "cod",
            "origin_url": BASE_URL,
        }
        r = session.post(f"{API}/checkout", json=payload)
        assert r.status_code == 200
        d = r.json()
        # 4499 * 0.9 = 4049.1 (shipping free over 999)
        assert abs(d["total"] - 4049.1) < 0.5

    def test_empty_cart(self, session):
        r = session.post(f"{API}/checkout", json={
            "items": [], "address": {
                "full_name": "x", "phone": "9999189863", "line1": "l",
                "city": "x", "state": "x", "pincode": "400001"
            }, "payment_method": "cod", "origin_url": BASE_URL,
        })
        assert r.status_code == 400

    def test_stripe_checkout(self, session):
        prod = _get_test_product(session)
        payload = {
            "items": [{
                "product_id": prod["id"], "name": prod["name"], "image": prod["images"][0],
                "price": prod["price"], "quantity": 1,
            }],
            "address": {
                "full_name": "TEST_Stripe", "phone": "9999189863",
                "line1": "L1", "city": "Mumbai", "state": "MH", "pincode": "400001",
                "email": "test@example.com",
            },
            "payment_method": "stripe",
            "origin_url": BASE_URL,
        }
        r = session.post(f"{API}/checkout", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["payment_method"] == "stripe"
        assert d["checkout_url"] is not None
        assert "stripe" in d["checkout_url"].lower() or "checkout" in d["checkout_url"].lower()
        assert "session_id" in d
        # Also exercise status endpoint
        sid = d["session_id"]
        r2 = session.get(f"{API}/checkout/status/{sid}")
        assert r2.status_code == 200
        s = r2.json()
        assert "payment_status" in s and "status" in s


# -------------------- Order Tracking --------------------
class TestOrderTracking:
    def test_track_existing(self, session, cod_order):
        order_number = cod_order["order_number"]
        r = session.get(f"{API}/order/{order_number}")
        assert r.status_code == 200
        d = r.json()
        assert d["order_number"] == order_number
        assert "items" in d and len(d["items"]) >= 1
        assert "address" in d
        assert "_id" not in d

    def test_track_invalid(self, session):
        r = session.get(f"{API}/order/INVALID123")
        assert r.status_code == 404

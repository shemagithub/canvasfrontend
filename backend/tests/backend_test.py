"""
Backend tests for Car Rental Super Admin API
- Auth flows, dashboard stats, generic CRUD, settings, reports
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://rental-admin-hub-4.preview.emergentagent.com"
ADMIN_EMAIL = "admin@carrental.com"
ADMIN_PASSWORD = "Admin@123"

CRUD_RESOURCES = [
    "vehicles", "bookings", "customers", "drivers", "branches",
    "maintenance", "payments", "promotions", "reviews", "blogs",
    "tickets", "notifications", "cms_pages", "testimonials",
    "service-cards",
]

# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture(scope="session")
def access_token(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text}")
    data = r.json()
    return data["access_token"]

@pytest.fixture(scope="session")
def auth_session(session, access_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    })
    return s

# ---------- Auth tests ----------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and len(data["access_token"]) > 10
        assert "refresh_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "super_admin"

    def test_login_invalid(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_bearer(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self):
        s = requests.Session()  # clean session, no cookies
        r = s.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401


# ---------- Dashboard & Reports ----------
class TestDashboardReports:
    def test_dashboard_stats(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/dashboard/stats")
        assert r.status_code == 200
        d = r.json()
        for key in ("total_cars", "total_customers", "active_bookings",
                    "revenue_chart", "booking_status_chart", "category_chart",
                    "activities", "total_revenue"):
            assert key in d, f"missing {key}"
        assert isinstance(d["revenue_chart"], list)
        assert isinstance(d["booking_status_chart"], list)
        assert d["total_cars"] >= 1  # demo data seeded

    def test_reports_financial(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/reports/financial")
        assert r.status_code == 200
        d = r.json()
        for k in ("total_revenue", "total_refunds", "deposits", "net", "tax_estimate"):
            assert k in d

    def test_reports_operational(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/reports/operational")
        assert r.status_code == 200
        d = r.json()
        for k in ("total_bookings", "vehicle_utilization_pct", "avg_booking_value"):
            assert k in d


# ---------- Users / Activity ----------
class TestUsersActivity:
    def test_list_users(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/users")
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list) and len(users) >= 1
        assert all("password_hash" not in u for u in users)
        assert all("_id" not in u for u in users)

    def test_activity_logs(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/activity-logs")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Settings ----------
class TestSettings:
    def test_get_settings(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/settings")
        assert r.status_code == 200
        d = r.json()
        assert "company_name" in d and "currency" in d

    def test_put_settings(self, auth_session):
        original = auth_session.get(f"{BASE_URL}/api/settings").json()
        new_name = f"TEST_Co_{uuid.uuid4().hex[:6]}"
        payload = {k: v for k, v in original.items() if k not in ("id", "updated_at", "_id")}
        payload["company_name"] = new_name
        r = auth_session.put(f"{BASE_URL}/api/settings", json=payload)
        assert r.status_code == 200, r.text
        # Verify persistence
        r2 = auth_session.get(f"{BASE_URL}/api/settings")
        assert r2.json()["company_name"] == new_name


# ---------- List endpoints for all CRUD resources ----------
class TestCRUDList:
    @pytest.mark.parametrize("resource", CRUD_RESOURCES)
    def test_list_resource(self, auth_session, resource):
        r = auth_session.get(f"{BASE_URL}/api/{resource}")
        assert r.status_code == 200, f"{resource}: {r.text}"
        items = r.json()
        assert isinstance(items, list)
        # No raw mongo _id leaking
        for item in items[:5]:
            assert "_id" not in item

    def test_list_requires_auth(self):
        # Use bare requests with empty cookies - no shared session
        r = requests.get(f"{BASE_URL}/api/vehicles", cookies={})
        assert r.status_code == 401, f"got {r.status_code}"


# ---------- CRUD: Vehicles full lifecycle ----------
class TestVehicleCRUD:
    def test_create_get_update_delete(self, auth_session):
        payload = {
            "name": "TEST_Vehicle",
            "brand": "TestBrand",
            "model_name": "TestModel",
            "category": "Sedan",
            "registration_number": f"TEST-{uuid.uuid4().hex[:6]}",
            "year": 2024,
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "seats": 5,
            "daily_rate": 99.5,
            "status": "available",
            "mileage": 100.0,
            "features": ["GPS"],
            "condition": "Good",
            "gps_enabled": True,
        }
        r = auth_session.post(f"{BASE_URL}/api/vehicles", json=payload)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == "TEST_Vehicle"
        assert "id" in created
        vid = created["id"]

        # GET single
        rg = auth_session.get(f"{BASE_URL}/api/vehicles/{vid}")
        assert rg.status_code == 200
        assert rg.json()["name"] == "TEST_Vehicle"

        # UPDATE
        payload["daily_rate"] = 150.0
        ru = auth_session.put(f"{BASE_URL}/api/vehicles/{vid}", json=payload)
        assert ru.status_code == 200
        assert ru.json()["daily_rate"] == 150.0

        # DELETE
        rd = auth_session.delete(f"{BASE_URL}/api/vehicles/{vid}")
        assert rd.status_code == 200

        # Verify deletion
        rg2 = auth_session.get(f"{BASE_URL}/api/vehicles/{vid}")
        assert rg2.status_code == 404


# ---------- CRUD: Customer (different schema) ----------
class TestCustomerCRUD:
    def test_create_and_delete(self, auth_session):
        payload = {
            "full_name": "TEST_Customer",
            "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+1-555-0000",
            "license_number": "DL-TEST-001",
        }
        r = auth_session.post(f"{BASE_URL}/api/customers", json=payload)
        assert r.status_code == 200, r.text
        cid = r.json()["id"]
        rd = auth_session.delete(f"{BASE_URL}/api/customers/{cid}")
        assert rd.status_code == 200

"""Phase 2 tests: Exports (CSV/XLSX/PDF) + AI Smart endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://rental-admin-hub-4.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@carrental.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="session")
def auth_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    token = r.json().get("access_token")
    assert token
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


# ---------- Exports ----------
class TestExports:
    def test_vehicles_csv(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/exports/vehicles.csv", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("text/csv")
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower() and "vehicles_export" in cd and ".csv" in cd
        text = r.text
        assert "NAME" in text and "BRAND" in text
        # at least header + 1 seeded row
        assert text.count("\n") >= 2

    def test_bookings_xlsx(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/exports/bookings.xlsx", timeout=30)
        assert r.status_code == 200
        assert "spreadsheetml" in r.headers.get("content-type", "")
        cd = r.headers.get("content-disposition", "")
        assert "bookings_export" in cd and ".xlsx" in cd
        # XLSX is a zip file -> starts with PK
        assert r.content[:2] == b"PK"
        assert len(r.content) > 500

    def test_customers_pdf(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/exports/customers.pdf", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")
        cd = r.headers.get("content-disposition", "")
        assert "customers_export" in cd and ".pdf" in cd
        assert r.content[:4] == b"%PDF"

    def test_invalid_resource(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/exports/invalid_resource.csv", timeout=30)
        assert r.status_code == 400
        body = r.json()
        assert "not exportable" in (body.get("detail") or "").lower()

    def test_invalid_format(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/exports/vehicles.json", timeout=30)
        # Unknown format - server returns 400 (route accepts any extension)
        assert r.status_code in (400, 404)

    def test_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/exports/vehicles.csv", timeout=30)
        assert r.status_code == 401


# ---------- AI Smart ----------
class TestAISmart:
    def test_recommend(self, auth_session):
        r = auth_session.post(
            f"{BASE_URL}/api/ai/recommend",
            json={"preferences": "Family of 4, SUV"},
            timeout=60,
        )
        assert r.status_code == 200, f"{r.status_code} {r.text[:300]}"
        data = r.json()
        assert "recommendation" in data
        assert isinstance(data["recommendation"], str)
        assert len(data["recommendation"]) > 20
        assert "available_count" in data

    def test_dynamic_pricing(self, auth_session):
        r = auth_session.post(f"{BASE_URL}/api/ai/dynamic-pricing", timeout=60)
        assert r.status_code == 200, f"{r.status_code} {r.text[:300]}"
        data = r.json()
        assert "suggestions" in data
        assert isinstance(data["suggestions"], str)
        assert len(data["suggestions"]) > 20

    def test_demand_prediction(self, auth_session):
        r = auth_session.post(f"{BASE_URL}/api/ai/demand-prediction", timeout=60)
        assert r.status_code == 200, f"{r.status_code} {r.text[:300]}"
        data = r.json()
        assert "forecast" in data
        assert isinstance(data["forecast"], str)
        assert len(data["forecast"]) > 20

    def test_recommend_unauthenticated(self):
        r = requests.post(f"{BASE_URL}/api/ai/recommend", json={"preferences": "x"}, timeout=30)
        assert r.status_code == 401

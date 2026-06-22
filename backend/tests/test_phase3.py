"""Phase 3 tests: Object Storage uploads + vehicle_inspections CRUD."""
import os
import io
import pytest
import requests
import struct
import zlib

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://rental-admin-hub-4.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

ADMIN = {"email": "admin@carrental.com", "password": "Admin@123"}


def _png_bytes() -> bytes:
    """Build a real 1x1 PNG."""
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw = b"\x00\xff\x00\x00"
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


@pytest.fixture(scope="module")
def auth():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json=ADMIN, timeout=20)
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    return {"session": s, "token": token, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture(scope="module")
def vehicle_id(auth):
    r = requests.get(f"{BASE_URL}/api/vehicles", headers=auth["headers"], timeout=20)
    assert r.status_code == 200
    items = r.json()
    assert items, "no seeded vehicles"
    return items[0]["id"]


# ---------- Object Storage ----------

class TestUploads:
    def test_upload_png_authenticated(self, auth):
        files = {"file": ("test.png", _png_bytes(), "image/png")}
        r = requests.post(
            f"{BASE_URL}/api/uploads?folder=test",
            headers=auth["headers"], files=files, timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        for k in ("id", "path", "url", "content_type", "size"):
            assert k in body, f"missing {k}"
        assert body["content_type"] == "image/png"
        assert body["url"].startswith("/api/files/")
        assert body["size"] > 0
        pytest.uploaded_id = body["id"]
        pytest.uploaded_path = body["path"]

    def test_upload_rejects_html(self, auth):
        files = {"file": ("evil.html", b"<html></html>", "text/html")}
        r = requests.post(
            f"{BASE_URL}/api/uploads?folder=test",
            headers=auth["headers"], files=files, timeout=30,
        )
        assert r.status_code == 415, r.text

    def test_upload_unauth(self):
        files = {"file": ("test.png", _png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/uploads?folder=test", files=files, timeout=30)
        assert r.status_code == 401

    def test_get_file_with_bearer(self, auth):
        path = getattr(pytest, "uploaded_path", None)
        assert path, "depends on test_upload_png_authenticated"
        r = requests.get(f"{BASE_URL}/api/files/{path}", headers=auth["headers"], timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/")
        assert len(r.content) > 0

    def test_get_file_unauth(self):
        path = getattr(pytest, "uploaded_path", None)
        assert path
        r = requests.get(f"{BASE_URL}/api/files/{path}", timeout=30)
        assert r.status_code == 401

    def test_get_file_query_auth(self, auth):
        path = getattr(pytest, "uploaded_path", None)
        assert path
        r = requests.get(f"{BASE_URL}/api/files/{path}?auth={auth['token']}", timeout=30)
        assert r.status_code == 200
        assert len(r.content) > 0

    def test_delete_marks_is_deleted(self, auth):
        fid = getattr(pytest, "uploaded_id", None)
        assert fid
        r = requests.delete(f"{BASE_URL}/api/uploads/{fid}", headers=auth["headers"], timeout=30)
        assert r.status_code == 200
        # subsequent file fetch should 404 (record marked deleted)
        path = getattr(pytest, "uploaded_path", None)
        r2 = requests.get(f"{BASE_URL}/api/files/{path}", headers=auth["headers"], timeout=30)
        assert r2.status_code == 404


# ---------- Vehicle Inspections CRUD ----------

class TestVehicleInspections:
    def test_list(self, auth):
        r = requests.get(f"{BASE_URL}/api/vehicle_inspections", headers=auth["headers"], timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_get_update_delete(self, auth, vehicle_id):
        payload = {
            "vehicle_id": vehicle_id,
            "inspector": "TEST_Inspector",
            "inspection_date": "2026-01-15",
            "overall_condition": "Good",
            "mileage": 12345.0,
            "notes": "TEST_initial",
            "issues_found": ["scratch on bumper"],
        }
        r = requests.post(f"{BASE_URL}/api/vehicle_inspections",
                          headers=auth["headers"], json=payload, timeout=20)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["inspector"] == "TEST_Inspector"
        assert created["issues_found"] == ["scratch on bumper"]
        assert "id" in created
        iid = created["id"]

        # GET single
        r = requests.get(f"{BASE_URL}/api/vehicle_inspections/{iid}",
                         headers=auth["headers"], timeout=20)
        assert r.status_code == 200
        assert r.json()["mileage"] == 12345.0

        # UPDATE
        upd = {**payload, "notes": "TEST_updated", "mileage": 99999.0}
        r = requests.put(f"{BASE_URL}/api/vehicle_inspections/{iid}",
                         headers=auth["headers"], json=upd, timeout=20)
        assert r.status_code == 200
        assert r.json()["notes"] == "TEST_updated"

        # GET verifies persistence
        r = requests.get(f"{BASE_URL}/api/vehicle_inspections/{iid}",
                         headers=auth["headers"], timeout=20)
        assert r.json()["mileage"] == 99999.0

        # DELETE
        r = requests.delete(f"{BASE_URL}/api/vehicle_inspections/{iid}",
                            headers=auth["headers"], timeout=20)
        assert r.status_code == 200
        r = requests.get(f"{BASE_URL}/api/vehicle_inspections/{iid}",
                         headers=auth["headers"], timeout=20)
        assert r.status_code == 404

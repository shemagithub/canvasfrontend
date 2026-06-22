"""
WSGI entry for LiteSpeed Passenger / cPanel Python apps.

Passenger calls WSGI (environ, start_response). FastAPI is ASGI — a2wsgi bridges that.

IMPORTANT — replace any OLD passenger_wsgi.py that does:
  `imp.load_source('wsgi', 'server.py')` / `from server import app` as bare WSGI.
That yields: TypeError: FastAPI.__call__() missing ... 'send'.

Upload this folder to the host, install venv deps (`pip install -r requirements.txt`),
put a valid `backend/.env` with MYSQL_* (from your hosting MySQL panel), then:

1. Copy `htaccess-passenger.example` → `.htaccess` in the SAME directory as this file
   (or your domain document root if the panel says so) and fix the paths inside it.
2. In the control panel, set the Python/Passenger app root to this directory and
   startup file `passenger_wsgi.py`.

If you still get HTTP 500, open `passenger_boot.log` in this folder (or the hosting
error log): it will show the real Python traceback (imports, MySQL on startup, etc.).
"""
from __future__ import annotations

import os
import sys
import traceback

_ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(_ROOT)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

_BOOT_LOG = os.path.join(_ROOT, "passenger_boot.log")


def _log_boot(msg: str) -> None:
    try:
        with open(_BOOT_LOG, "a", encoding="utf-8") as f:
            f.write(msg.rstrip() + "\n")
    except OSError:
        pass


try:
    from a2wsgi import ASGIMiddleware
    from server import app as _asgi_app

    application = ASGIMiddleware(_asgi_app)
    wsgi = application
    wsgi_application = application
    _log_boot("OK: ASGIMiddleware(server.app) loaded.")
except Exception:
    _tb = traceback.format_exc()
    _log_boot("FAIL: could not build WSGI application.\n" + _tb)
    try:
        traceback.print_exc()
    except Exception:
        pass

    def application(environ, start_response):  # type: ignore[misc]
        """Last-resort WSGI handler so you get a plain-text hint instead of an empty 500."""
        body = (
            "Python app failed to load. See passenger_boot.log in the app directory (next to passenger_wsgi.py) "
            "or your hosting error_log for the full traceback.\n\n"
            "Common fixes:\n"
            "  - Run: pip install -r requirements.txt (in the domain's virtualenv)\n"
            "  - Add backend/.env with MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE (or DB_NAME)\n"
            "  - Ensure .htaccess PassengerAppRoot / PassengerPython paths are correct\n"
        ).encode("utf-8", errors="replace")
        start_response(
            "500 Internal Server Error",
            [("Content-Type", "text/plain; charset=utf-8"), ("Content-Length", str(len(body)))],
        )
        return [body]

    wsgi = application
    wsgi_application = application

"""
Some LiteSpeed / Passenger setups look for a module named `wsgi.py`.

Never use bare `app` (FastAPI ASGI) as the WSGI callable — that causes:
  TypeError: FastAPI.__call__() missing ... 'send'

Expose only real WSGI callables (`application`, `wsgi`, `wsgi_application`).
Do NOT set the panel entrypoint to `app` or `server:app` under Passenger — use `application`.

ASGI-only entry (CLI / uvicorn) remains `server:app`; this module is for hosting WSGI only.
"""
from server import application, wsgi, wsgi_application

__all__ = ["application", "wsgi", "wsgi_application"]

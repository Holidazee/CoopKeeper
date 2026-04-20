import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / "backend" / ".env")

APP_ENV = os.getenv("APP_ENV", "local").lower()
APP_TITLE = os.getenv("APP_TITLE", "CoopKeeper API")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

SECRET_KEY = os.getenv("SECRET_KEY", "coookeeper-local-dev-secret")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

FRONTEND_API_BASE_URL = os.getenv("FRONTEND_API_BASE_URL", "").rstrip("/")

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
WEB_CONCURRENCY = max(1, int(os.getenv("WEB_CONCURRENCY", "1")))

LOCAL_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]


def parse_csv_env(name: str) -> list[str]:
    raw_value = os.getenv(name, "")
    return [item.strip() for item in raw_value.split(",") if item.strip()]


CORS_ORIGINS = parse_csv_env("CORS_ORIGINS") or (LOCAL_CORS_ORIGINS if APP_ENV == "local" else [])

if APP_ENV != "local" and SECRET_KEY == "coookeeper-local-dev-secret":
    raise RuntimeError("SECRET_KEY must be set when APP_ENV is not local")

# --- Email / digest configuration -------------------------------------------
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
DIGEST_FROM_EMAIL = os.getenv("DIGEST_FROM_EMAIL", "CoopKeeper <hello@coopkeeper.net>")
DIGEST_RECIPIENT_EMAIL = os.getenv("DIGEST_RECIPIENT_EMAIL", "")
ADMIN_DIGEST_SECRET = os.getenv("ADMIN_DIGEST_SECRET", "")
DIGEST_TIMEZONE = os.getenv("DIGEST_TIMEZONE", "America/Chicago")
# Set to "1" to disable the scheduler (useful for tests / local dev).
DIGEST_SCHEDULER_DISABLED = os.getenv("DIGEST_SCHEDULER_DISABLED", "").lower() in {"1", "true", "yes"}

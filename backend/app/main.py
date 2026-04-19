import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from app.db.database import Base, engine
from app.routers.alerts import router as alerts_router
from app.routers.auth import router as auth_router
from app.routers.chickens import router as chickens_router
from app.routers.cleaning_logs import router as cleaning_logs_router
from app.routers.dashboard import router as dashboard_router
from app.routers.eggs import router as eggs_router
from app.routers.expenses import router as expenses_router
from app.routers.feed import router as feed_router
from app.settings import APP_TITLE, APP_VERSION, CORS_ORIGINS

ENV = os.getenv("ENV", "dev")
FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"
FRONTEND_INDEX = FRONTEND_DIR / "index.html"
FRONTEND_CONFIG = FRONTEND_DIR / "config.js"
FRONTEND_SCRIPT = FRONTEND_DIR / "app.js"
FRONTEND_STYLES = FRONTEND_DIR / "styles.css"

# Idempotent migrations applied on startup for environments that don't run Alembic.
POSTGRES_MIGRATIONS = (
    text("ALTER TABLE chickens ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"),
    text("ALTER TABLE eggs ADD COLUMN IF NOT EXISTS chicken_id INTEGER REFERENCES chickens(id)"),
    text("ALTER TABLE eggs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"),
    text("ALTER TABLE feed_records ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"),
    text("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"),
    text("ALTER TABLE eggs ALTER COLUMN date TYPE DATE USING date::date"),
    text("ALTER TABLE eggs ALTER COLUMN chicken_id DROP NOT NULL"),
)


def ensure_database_schema() -> None:
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:
            for statement in POSTGRES_MIGRATIONS:
                connection.execute(statement)


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_database_schema()
    yield


app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if ENV == "dev" else None,
    redoc_url="/redoc" if ENV == "dev" else None,
    openapi_url="/openapi.json" if ENV == "dev" else None,
)

if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.mount("/app-static", StaticFiles(directory=FRONTEND_DIR), name="frontend-static")

for router in (
    auth_router,
    chickens_router,
    eggs_router,
    feed_router,
    expenses_router,
    cleaning_logs_router,
    alerts_router,
    dashboard_router,
):
    app.include_router(router)


# ---------------------------------------------------------------------------
# Frontend asset serving (kept for the dev/single-process deployment shape)
# ---------------------------------------------------------------------------


@app.get("/", include_in_schema=False)
@app.get("/app", include_in_schema=False)
@app.get("/app/", include_in_schema=False)
def serve_frontend():
    return FileResponse(FRONTEND_INDEX)


@app.get("/styles.css", include_in_schema=False)
def serve_frontend_styles():
    return FileResponse(FRONTEND_STYLES, media_type="text/css")


@app.get("/app.js", include_in_schema=False)
def serve_frontend_script():
    return FileResponse(FRONTEND_SCRIPT, media_type="application/javascript")


@app.get("/config.js", include_in_schema=False)
@app.get("/app-config.js", include_in_schema=False)
def serve_frontend_config():
    return FileResponse(FRONTEND_CONFIG, media_type="application/javascript")


# ---------------------------------------------------------------------------
# Health checks
# ---------------------------------------------------------------------------


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/db")
def db_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

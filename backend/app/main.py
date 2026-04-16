from contextlib import asynccontextmanager
from datetime import date
import json
import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from app.auth import get_current_user
from app.db.database import Base, SessionLocal, engine
from app.models import Expense, FeedRecord, User
from app.routers.alerts import router as alerts_router
from app.routers.auth import router as auth_router
from app.routers.chickens import get_chicken_or_404, router as chickens_router
from app.routers.cleaning_logs import router as cleaning_logs_router
from app.routers.common import commit_and_refresh, get_owned_or_404
from app.routers.dashboard import router as dashboard_router
from app.routers.eggs import router as eggs_router
from app.settings import APP_ENV, APP_TITLE, APP_VERSION, CORS_ORIGINS, FRONTEND_API_BASE_URL

ENV = os.getenv("ENV", "dev")
FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"
FRONTEND_INDEX = FRONTEND_DIR / "index.html"
TOP_LEVEL_RESOURCES = [
    "/auth",
    "/chickens",
    "/eggs",
    "/feed",
    "/expenses",
    "/cleaning-logs",
    "/alerts",
    "/dashboard",
]
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)
EGG_CHICKEN_ID_COLUMN_SQL = text(
    "ALTER TABLE eggs ADD COLUMN IF NOT EXISTS chicken_id INTEGER REFERENCES chickens(id)"
)
EGG_CHICKEN_ID_NOT_NULL_SQL = text("ALTER TABLE eggs ALTER COLUMN chicken_id SET NOT NULL")
EGG_DATE_TYPE_SQL = text("ALTER TABLE eggs ALTER COLUMN date TYPE DATE USING date::date")
CHICKEN_USER_ID_COLUMN_SQL = text(
    "ALTER TABLE chickens ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"
)
EGG_USER_ID_COLUMN_SQL = text(
    "ALTER TABLE eggs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"
)
FEED_RECORD_USER_ID_COLUMN_SQL = text(
    "ALTER TABLE feed_records ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"
)
EXPENSE_USER_ID_COLUMN_SQL = text(
    "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"
)


class FeedRecordCreate(BaseModel):
    date: date
    feed_type: str
    amount: float
    cost: float | None = None
    chicken_id: int | None = None


class FeedRecordRead(FeedRecordCreate):
    id: int

    model_config = READ_MODEL_CONFIG


class ExpenseCreate(BaseModel):
    date: date
    category: str
    description: str | None = None
    amount: float


class ExpenseRead(ExpenseCreate):
    id: int

    model_config = READ_MODEL_CONFIG


def ensure_database_schema() -> None:
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:
            connection.execute(CHICKEN_USER_ID_COLUMN_SQL)
            connection.execute(EGG_CHICKEN_ID_COLUMN_SQL)
            connection.execute(EGG_USER_ID_COLUMN_SQL)
            connection.execute(FEED_RECORD_USER_ID_COLUMN_SQL)
            connection.execute(EXPENSE_USER_ID_COLUMN_SQL)
            connection.execute(EGG_DATE_TYPE_SQL)
            connection.execute(EGG_CHICKEN_ID_NOT_NULL_SQL)


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
app.include_router(auth_router)
app.include_router(chickens_router)
app.include_router(eggs_router)
app.include_router(cleaning_logs_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)


def get_feed_record_or_404(session: Session, feed_id: int, user_id: int) -> FeedRecord:
    return get_owned_or_404(session, FeedRecord, feed_id, user_id, "Feed record not found")


def get_expense_or_404(session: Session, expense_id: int, user_id: int) -> Expense:
    return get_owned_or_404(session, Expense, expense_id, user_id, "Expense not found")


def ensure_optional_chicken_exists(session: Session, chicken_id: int | None, user_id: int) -> None:
    if chicken_id is not None:
        get_chicken_or_404(session, chicken_id, user_id)


@app.get("/")
def root():
    return {"message": "CoopKeeper API is running"}

@app.get("/app", include_in_schema=False)
@app.get("/app/", include_in_schema=False)
def read_frontend():
    return FileResponse(FRONTEND_INDEX)


@app.get("/app-config.js", include_in_schema=False)
def read_frontend_config():
    payload = {
        "apiBaseUrl": FRONTEND_API_BASE_URL,
        "environment": APP_ENV,
    }
    return Response(
        content=f"window.CoopKeeperConfig = {json.dumps(payload)};",
        media_type="application/javascript",
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/feed", response_model=list[FeedRecordRead])
def list_feed_records(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return session.scalars(
            select(FeedRecord)
            .where(FeedRecord.user_id == current_user.id)
            .order_by(FeedRecord.id)
            .offset(skip)
            .limit(limit)
        ).all()


@app.post("/feed", response_model=FeedRecordRead, status_code=201)
def create_feed_record(
    feed_record: FeedRecordCreate,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        ensure_optional_chicken_exists(session, feed_record.chicken_id, current_user.id)
        new_feed_record = FeedRecord(
            date=feed_record.date,
            feed_type=feed_record.feed_type,
            amount=feed_record.amount,
            cost=feed_record.cost,
            chicken_id=feed_record.chicken_id,
            user_id=current_user.id,
        )
        session.add(new_feed_record)
        return commit_and_refresh(session, new_feed_record)


@app.get("/feed/{feed_id}", response_model=FeedRecordRead)
def get_feed_record(feed_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return get_feed_record_or_404(session, feed_id, current_user.id)


@app.put("/feed/{feed_id}", response_model=FeedRecordRead)
def update_feed_record(
    feed_id: int,
    feed_update: FeedRecordCreate,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        feed_record = get_feed_record_or_404(session, feed_id, current_user.id)
        ensure_optional_chicken_exists(session, feed_update.chicken_id, current_user.id)
        feed_record.date = feed_update.date
        feed_record.feed_type = feed_update.feed_type
        feed_record.amount = feed_update.amount
        feed_record.cost = feed_update.cost
        feed_record.chicken_id = feed_update.chicken_id
        feed_record.user_id = current_user.id
        return commit_and_refresh(session, feed_record)


@app.delete("/feed/{feed_id}", status_code=204)
def delete_feed_record(feed_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        feed_record = get_feed_record_or_404(session, feed_id, current_user.id)
        session.delete(feed_record)
        session.commit()


@app.get("/expenses", response_model=list[ExpenseRead])
def list_expenses(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return session.scalars(
            select(Expense)
            .where(Expense.user_id == current_user.id)
            .order_by(Expense.id)
            .offset(skip)
            .limit(limit)
        ).all()


@app.post("/expenses", response_model=ExpenseRead, status_code=201)
def create_expense(expense: ExpenseCreate, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        new_expense = Expense(
            date=expense.date,
            category=expense.category,
            description=expense.description,
            amount=expense.amount,
            user_id=current_user.id,
        )
        session.add(new_expense)
        return commit_and_refresh(session, new_expense)


@app.get("/expenses/{expense_id}", response_model=ExpenseRead)
def get_expense(expense_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return get_expense_or_404(session, expense_id, current_user.id)


@app.put("/expenses/{expense_id}", response_model=ExpenseRead)
def update_expense(
    expense_id: int,
    expense_update: ExpenseCreate,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        expense = get_expense_or_404(session, expense_id, current_user.id)
        expense.date = expense_update.date
        expense.category = expense_update.category
        expense.description = expense_update.description
        expense.amount = expense_update.amount
        expense.user_id = current_user.id
        return commit_and_refresh(session, expense)


@app.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        expense = get_expense_or_404(session, expense_id, current_user.id)
        session.delete(expense)
        session.commit()


@app.get("/health/db")
def db_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

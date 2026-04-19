from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db.database import SessionLocal
from app.models import FeedRecord, User
from app.routers.chickens import ensure_optional_chicken_exists
from app.routers.common import commit_and_refresh, get_owned_or_404

router = APIRouter()
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)


class FeedRecordCreate(BaseModel):
    date: date
    feed_type: str
    amount: float
    cost: float | None = None
    chicken_id: int | None = None


class FeedRecordRead(FeedRecordCreate):
    id: int

    model_config = READ_MODEL_CONFIG


def get_feed_record_or_404(session: Session, feed_id: int, user_id: int) -> FeedRecord:
    return get_owned_or_404(session, FeedRecord, feed_id, user_id, "Feed record not found")


@router.get("/feed", response_model=list[FeedRecordRead])
def list_feed_records(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        return session.scalars(
            select(FeedRecord)
            .where(FeedRecord.user_id == current_user.id)
            .order_by(FeedRecord.id)
            .offset(skip)
            .limit(limit)
        ).all()


@router.post("/feed", response_model=FeedRecordRead, status_code=201)
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


@router.get("/feed/{feed_id}", response_model=FeedRecordRead)
def get_feed_record(feed_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return get_feed_record_or_404(session, feed_id, current_user.id)


@router.put("/feed/{feed_id}", response_model=FeedRecordRead)
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


@router.delete("/feed/{feed_id}", status_code=204)
def delete_feed_record(feed_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        feed_record = get_feed_record_or_404(session, feed_id, current_user.id)
        session.delete(feed_record)
        session.commit()

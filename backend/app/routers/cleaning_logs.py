from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db.database import SessionLocal
from app.models import CleaningLog, User
from app.routers.common import commit_and_refresh, get_owned_or_404

router = APIRouter()
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)


class CleaningLogCreate(BaseModel):
    date: date
    task_type: str
    notes: str | None = None
    cost: float | None = None


class CleaningLogRead(CleaningLogCreate):
    id: int

    model_config = READ_MODEL_CONFIG


def get_cleaning_log_or_404(session: Session, cleaning_log_id: int, user_id: int) -> CleaningLog:
    return get_owned_or_404(session, CleaningLog, cleaning_log_id, user_id, "Cleaning log not found")


@router.get("/cleaning-logs", response_model=list[CleaningLogRead])
def list_cleaning_logs(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return session.scalars(
            select(CleaningLog)
            .where(CleaningLog.user_id == current_user.id)
            .order_by(CleaningLog.date.desc(), CleaningLog.id.desc())
            .offset(skip)
            .limit(limit)
        ).all()


@router.post("/cleaning-logs", response_model=CleaningLogRead, status_code=201)
def create_cleaning_log(
    cleaning_log: CleaningLogCreate,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        new_cleaning_log = CleaningLog(
            date=cleaning_log.date,
            task_type=cleaning_log.task_type,
            notes=cleaning_log.notes,
            cost=cleaning_log.cost,
            user_id=current_user.id,
        )
        session.add(new_cleaning_log)
        return commit_and_refresh(session, new_cleaning_log)


@router.get("/cleaning-logs/{cleaning_log_id}", response_model=CleaningLogRead)
def get_cleaning_log(cleaning_log_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return get_cleaning_log_or_404(session, cleaning_log_id, current_user.id)


@router.put("/cleaning-logs/{cleaning_log_id}", response_model=CleaningLogRead)
def update_cleaning_log(
    cleaning_log_id: int,
    cleaning_log_update: CleaningLogCreate,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        cleaning_log = get_cleaning_log_or_404(session, cleaning_log_id, current_user.id)
        cleaning_log.date = cleaning_log_update.date
        cleaning_log.task_type = cleaning_log_update.task_type
        cleaning_log.notes = cleaning_log_update.notes
        cleaning_log.cost = cleaning_log_update.cost
        cleaning_log.user_id = current_user.id
        return commit_and_refresh(session, cleaning_log)


@router.delete("/cleaning-logs/{cleaning_log_id}", status_code=204)
def delete_cleaning_log(cleaning_log_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        cleaning_log = get_cleaning_log_or_404(session, cleaning_log_id, current_user.id)
        session.delete(cleaning_log)
        session.commit()

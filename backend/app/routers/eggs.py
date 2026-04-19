from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db.database import SessionLocal
from app.models import Egg, User
from app.routers.chickens import ensure_optional_chicken_exists
from app.routers.common import commit_and_refresh, get_owned_or_404

router = APIRouter()
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)


class EggCreate(BaseModel):
    date: date
    count: int
    chicken_id: int | None = None


class EggRead(EggCreate):
    id: int

    model_config = READ_MODEL_CONFIG


def get_egg_or_404(session: Session, egg_id: int, user_id: int) -> Egg:
    return get_owned_or_404(session, Egg, egg_id, user_id, "Egg not found")


@router.get("/eggs", response_model=list[EggRead])
def list_eggs(
    skip: int = 0,
    limit: int = 100,
    chicken_id: int | None = None,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        statement = select(Egg).where(Egg.user_id == current_user.id).order_by(Egg.id)
        if chicken_id is not None:
            statement = statement.where(Egg.chicken_id == chicken_id)
        return session.scalars(statement.offset(skip).limit(limit)).all()


@router.post("/eggs", response_model=EggRead, status_code=201)
def create_egg(egg: EggCreate, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        ensure_optional_chicken_exists(session, egg.chicken_id, current_user.id)
        new_egg = Egg(
            date=egg.date,
            count=egg.count,
            chicken_id=egg.chicken_id,
            user_id=current_user.id,
        )
        session.add(new_egg)
        return commit_and_refresh(session, new_egg)


@router.get("/eggs/{egg_id}", response_model=EggRead)
def get_egg(egg_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return get_egg_or_404(session, egg_id, current_user.id)


@router.put("/eggs/{egg_id}", response_model=EggRead)
def update_egg(
    egg_id: int,
    egg_update: EggCreate,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        egg = get_egg_or_404(session, egg_id, current_user.id)
        ensure_optional_chicken_exists(session, egg_update.chicken_id, current_user.id)
        egg.date = egg_update.date
        egg.count = egg_update.count
        egg.chicken_id = egg_update.chicken_id
        egg.user_id = current_user.id
        return commit_and_refresh(session, egg)


@router.delete("/eggs/{egg_id}", status_code=204)
def delete_egg(egg_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        egg = get_egg_or_404(session, egg_id, current_user.id)
        session.delete(egg)
        session.commit()

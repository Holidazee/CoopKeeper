from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db.database import SessionLocal
from app.models import Chicken, Egg, User
from app.routers.common import commit_and_refresh, get_owned_or_404

router = APIRouter()
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)


class ChickenCreate(BaseModel):
    name: str
    breed: str | None = None


class ChickenRead(ChickenCreate):
    id: int

    model_config = READ_MODEL_CONFIG


class ChickenSummaryRead(BaseModel):
    chicken_id: int
    name: str
    breed: str | None
    total_egg_records: int
    total_eggs: int
    average_eggs_per_record: float


def get_chicken_or_404(session: Session, chicken_id: int, user_id: int) -> Chicken:
    return get_owned_or_404(session, Chicken, chicken_id, user_id, "Chicken not found")


@router.get("/chickens", response_model=list[ChickenRead])
def list_chickens(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return session.scalars(
            select(Chicken)
            .where(Chicken.user_id == current_user.id)
            .order_by(Chicken.id)
            .offset(skip)
            .limit(limit)
        ).all()


@router.post("/chickens", response_model=ChickenRead, status_code=201)
def create_chicken(chicken: ChickenCreate, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        new_chicken = Chicken(name=chicken.name, breed=chicken.breed, user_id=current_user.id)
        session.add(new_chicken)
        return commit_and_refresh(session, new_chicken)


@router.get("/chickens/{chicken_id}", response_model=ChickenRead)
def get_chicken(chicken_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return get_chicken_or_404(session, chicken_id, current_user.id)


@router.get("/chickens/{chicken_id}/summary", response_model=ChickenSummaryRead)
def get_chicken_summary(chicken_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        chicken = get_chicken_or_404(session, chicken_id, current_user.id)
        total_egg_records, total_eggs = session.execute(
            select(
                func.count(Egg.id),
                func.coalesce(func.sum(Egg.count), 0),
            ).where(Egg.chicken_id == chicken_id, Egg.user_id == current_user.id)
        ).one()

    average_eggs_per_record = total_eggs / total_egg_records if total_egg_records else 0.0
    return ChickenSummaryRead(
        chicken_id=chicken.id,
        name=chicken.name,
        breed=chicken.breed,
        total_egg_records=total_egg_records,
        total_eggs=total_eggs,
        average_eggs_per_record=average_eggs_per_record,
    )


@router.put("/chickens/{chicken_id}", response_model=ChickenRead)
def update_chicken(
    chicken_id: int,
    chicken_update: ChickenCreate,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        chicken = get_chicken_or_404(session, chicken_id, current_user.id)
        chicken.name = chicken_update.name
        chicken.breed = chicken_update.breed
        return commit_and_refresh(session, chicken)


@router.delete("/chickens/{chicken_id}", status_code=204)
def delete_chicken(chicken_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        chicken = get_chicken_or_404(session, chicken_id, current_user.id)
        session.delete(chicken)
        session.commit()

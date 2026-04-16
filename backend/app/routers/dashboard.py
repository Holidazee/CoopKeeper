from pydantic import BaseModel
from sqlalchemy import func, select

from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.db.database import SessionLocal
from app.models import Chicken, Egg, User
from app.routers.eggs import EggRead

router = APIRouter()


class DashboardRead(BaseModel):
    total_chickens: int
    total_eggs: int
    average_eggs_per_chicken: float
    latest_egg_record: EggRead | None


@router.get("/dashboard", response_model=DashboardRead)
def get_dashboard(current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        total_chickens, total_eggs = session.execute(
            select(
                select(func.count(Chicken.id))
                .where(Chicken.user_id == current_user.id)
                .scalar_subquery(),
                select(func.coalesce(func.sum(Egg.count), 0))
                .where(Egg.user_id == current_user.id)
                .scalar_subquery(),
            )
        ).one()
        latest_egg_record = session.scalars(
            select(Egg)
            .where(Egg.user_id == current_user.id)
            .order_by(Egg.date.desc(), Egg.id.desc())
            .limit(1)
        ).first()

    average_eggs_per_chicken = total_eggs / total_chickens if total_chickens else 0.0
    return DashboardRead(
        total_chickens=total_chickens,
        total_eggs=total_eggs,
        average_eggs_per_chicken=average_eggs_per_chicken,
        latest_egg_record=latest_egg_record,
    )

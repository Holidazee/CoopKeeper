from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db.database import SessionLocal
from app.models import Expense, User
from app.routers.common import commit_and_refresh, get_owned_or_404

router = APIRouter()
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)


class ExpenseCreate(BaseModel):
    date: date
    category: str
    description: str | None = None
    amount: float


class ExpenseRead(ExpenseCreate):
    id: int

    model_config = READ_MODEL_CONFIG


def get_expense_or_404(session: Session, expense_id: int, user_id: int) -> Expense:
    return get_owned_or_404(session, Expense, expense_id, user_id, "Expense not found")


@router.get("/expenses", response_model=list[ExpenseRead])
def list_expenses(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    with SessionLocal() as session:
        return session.scalars(
            select(Expense)
            .where(Expense.user_id == current_user.id)
            .order_by(Expense.id)
            .offset(skip)
            .limit(limit)
        ).all()


@router.post("/expenses", response_model=ExpenseRead, status_code=201)
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


@router.get("/expenses/{expense_id}", response_model=ExpenseRead)
def get_expense(expense_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        return get_expense_or_404(session, expense_id, current_user.id)


@router.put("/expenses/{expense_id}", response_model=ExpenseRead)
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


@router.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        expense = get_expense_or_404(session, expense_id, current_user.id)
        session.delete(expense)
        session.commit()
